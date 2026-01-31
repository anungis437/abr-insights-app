#!/usr/bin/env node

/**
 * Console Logging Migration Script
 *
 * Automatically migrates console.log/error/warn calls to production logger.
 *
 * Usage:
 *   npx tsx scripts/migrate-console-logs.ts [--dry-run] [--files=glob-pattern]
 *
 * Examples:
 *   npx tsx scripts/migrate-console-logs.ts --dry-run
 *   npx tsx scripts/migrate-console-logs.ts --files="app/admin/**​/*.tsx"
 *   npx tsx scripts/migrate-console-logs.ts
 */

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

// Configuration
const DRY_RUN = process.argv.includes('--dry-run')
const FILES_ARG = process.argv.find((arg) => arg.startsWith('--files='))
const FILES_PATTERN = FILES_ARG?.split('=')[1]

// Default files to migrate (high priority)
const DEFAULT_PATTERNS = [
  'app/admin/**/*.tsx',
  'app/admin/**/*.ts',
  'hooks/*.ts',
  'app/*/page.tsx',
  'components/**/*.tsx',
]

const SKIP_PATTERNS = [
  'scripts/**',
  'tests/**',
  '*.test.ts',
  '*.test.tsx',
  'public/sw.js', // Service worker needs manual review
]

interface MigrationResult {
  file: string
  consoleLogCount: number
  consoleErrorCount: number
  consoleWarnCount: number
  totalReplaced: number
  warnings: string[]
}

/**
 * Check if file should be skipped
 */
function shouldSkip(filePath: string): boolean {
  return SKIP_PATTERNS.some((pattern) => filePath.includes(pattern.replace('**', '')))
}

/**
 * Add logger import if not present
 */
function addLoggerImport(content: string): string {
  // Check if logger import already exists
  if (content.includes("from '@/lib/utils/production-logger'")) {
    return content
  }

  // Find the import section (all imports at the top)
  const lines = content.split('\n')
  let lastImportIndex = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('import ') || line.startsWith('from ')) {
      lastImportIndex = i
    } else if (line && !line.startsWith('//') && !line.startsWith('/*')) {
      break
    }
  }

  // Insert logger import after last import
  const newImport = "import { logger } from '@/lib/utils/production-logger'"
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, newImport)
  } else {
    // No imports found, add at the top
    lines.unshift(newImport)
  }

  return lines.join('\n')
}

/**
 * Detect component/file name for context
 */
function detectContext(filePath: string, content: string): string {
  // Try to find component name from export
  const componentMatch = content.match(/export (?:default )?(?:function|const) (\w+)/)
  if (componentMatch) {
    return componentMatch[1]
  }

  // Fallback to file name
  const fileName = path.basename(filePath, path.extname(filePath))
  return fileName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

/**
 * Migrate console.error calls
 */
function migrateConsoleError(content: string, context: string): [string, number] {
  let count = 0

  // Pattern 1: console.error('message', error)
  content = content.replace(
    /console\.error\((["'`])([^"'`]+)\1,\s*(\w+)\)/g,
    (match, quote, message, errorVar) => {
      count++
      return `logger.error(${quote}${message}${quote}, { error: ${errorVar}, context: '${context}' })`
    }
  )

  // Pattern 2: console.error('message')
  content = content.replace(/console\.error\((["'`])([^"'`]+)\1\)/g, (match, quote, message) => {
    count++
    return `logger.error(${quote}${message}${quote}, { context: '${context}' })`
  })

  // Pattern 3: console.error(error)
  content = content.replace(/console\.error\((\w+)\)/g, (match, errorVar) => {
    count++
    return `logger.error('An error occurred', { error: ${errorVar}, context: '${context}' })`
  })

  return [content, count]
}

/**
 * Migrate console.log calls
 */
function migrateConsoleLog(content: string, context: string): [string, number] {
  let count = 0

  // Pattern 1: console.log('message', var1, var2)
  content = content.replace(
    /console\.log\((["'`])([^"'`]+)\1(?:,\s*([^)]+))?\)/g,
    (match, quote, message, vars) => {
      count++
      if (vars) {
        // Try to parse variable names
        const varList = vars.split(',').map((v: string) => v.trim())
        const contextObj = varList
          .map((v: string) => {
            const varName = v.split(':')[0].trim()
            return varName.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/) ? varName : null
          })
          .filter(Boolean)
          .join(', ')

        return `logger.info(${quote}${message}${quote}, { ${contextObj}, context: '${context}' })`
      }
      return `logger.info(${quote}${message}${quote}, { context: '${context}' })`
    }
  )

  return [content, count]
}

/**
 * Migrate console.warn calls
 */
function migrateConsoleWarn(content: string, context: string): [string, number] {
  let count = 0

  // Pattern 1: console.warn('message', data)
  content = content.replace(
    /console\.warn\((["'`])([^"'`]+)\1(?:,\s*(\w+))?\)/g,
    (match, quote, message, dataVar) => {
      count++
      if (dataVar) {
        return `logger.warn(${quote}${message}${quote}, { ${dataVar}, context: '${context}' })`
      }
      return `logger.warn(${quote}${message}${quote}, { context: '${context}' })`
    }
  )

  return [content, count]
}

/**
 * Detect potential PII in log messages
 */
function detectPII(content: string): string[] {
  const warnings: string[] = []
  const piiPatterns = [
    /email/i,
    /password/i,
    /ssn/i,
    /credit.?card/i,
    /token/i,
    /secret/i,
    /api.?key/i,
  ]

  piiPatterns.forEach((pattern) => {
    if (pattern.test(content)) {
      warnings.push(`Possible PII detected: ${pattern.source}`)
    }
  })

  return warnings
}

/**
 * Migrate a single file
 */
function migrateFile(filePath: string): MigrationResult {
  const content = fs.readFileSync(filePath, 'utf-8')
  const context = detectContext(filePath, content)

  let newContent = content
  let totalReplaced = 0
  const warnings: string[] = []

  // Add logger import
  newContent = addLoggerImport(newContent)

  // Migrate console.error
  const [afterError, errorCount] = migrateConsoleError(newContent, context)
  newContent = afterError
  totalReplaced += errorCount

  // Migrate console.log
  const [afterLog, logCount] = migrateConsoleLog(newContent, context)
  newContent = afterLog
  totalReplaced += logCount

  // Migrate console.warn
  const [afterWarn, warnCount] = migrateConsoleWarn(newContent, context)
  newContent = afterWarn
  totalReplaced += warnCount

  // Detect PII
  const piiWarnings = detectPII(newContent)
  warnings.push(...piiWarnings)

  // Write file (unless dry run)
  if (!DRY_RUN && totalReplaced > 0) {
    fs.writeFileSync(filePath, newContent, 'utf-8')
  }

  return {
    file: filePath,
    consoleLogCount: logCount,
    consoleErrorCount: errorCount,
    consoleWarnCount: warnCount,
    totalReplaced,
    warnings,
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Console Logging Migration Script\n')

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n')
  }

  // Get files to migrate
  const patterns = FILES_PATTERN ? [FILES_PATTERN] : DEFAULT_PATTERNS
  const files: string[] = []

  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: process.cwd(),
      ignore: SKIP_PATTERNS,
    })
    files.push(...matches)
  }

  // Remove duplicates
  const uniqueFiles = [...new Set(files)]
  console.log(`📁 Found ${uniqueFiles.length} files to check\n`)

  // Migrate files
  const results: MigrationResult[] = []
  let totalReplacements = 0

  for (const file of uniqueFiles) {
    if (shouldSkip(file)) {
      console.log(`⏭️  Skipped: ${file}`)
      continue
    }

    const result = migrateFile(file)
    results.push(result)

    if (result.totalReplaced > 0) {
      totalReplacements += result.totalReplaced
      console.log(`✅ Migrated: ${file}`)
      console.log(`   - console.log: ${result.consoleLogCount}`)
      console.log(`   - console.error: ${result.consoleErrorCount}`)
      console.log(`   - console.warn: ${result.consoleWarnCount}`)

      if (result.warnings.length > 0) {
        console.log(`   ⚠️  Warnings:`)
        result.warnings.forEach((warning) => {
          console.log(`      - ${warning}`)
        })
      }
      console.log()
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 MIGRATION SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total files checked: ${uniqueFiles.length}`)
  console.log(`Total files modified: ${results.filter((r) => r.totalReplaced > 0).length}`)
  console.log(`Total replacements: ${totalReplacements}`)
  console.log()

  // Warnings summary
  const filesWithWarnings = results.filter((r) => r.warnings.length > 0)
  if (filesWithWarnings.length > 0) {
    console.log('⚠️  FILES WITH WARNINGS:')
    filesWithWarnings.forEach((result) => {
      console.log(`   ${result.file}`)
      result.warnings.forEach((warning) => {
        console.log(`      - ${warning}`)
      })
    })
    console.log()
  }

  // Next steps
  console.log('📋 NEXT STEPS:')
  console.log('1. Review context names (some may need manual adjustment)')
  console.log('2. Add relevant IDs (userId, courseId, etc.) to context objects')
  console.log('3. Review warnings for potential PII leakage')
  console.log('4. Run: npm run type-check')
  console.log('5. Run: npm run lint')
  console.log('6. Test in development')
  console.log('7. Commit changes')
  console.log()

  if (DRY_RUN) {
    console.log('💡 Remove --dry-run flag to apply changes')
  }
}

main().catch(console.error)
