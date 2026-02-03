#!/usr/bin/env node
/**
 * Migrate console.* calls in API routes to production logger
 * Replaces console.error with logger.error
 * Adds import { logger } from '@/lib/utils/production-logger' where missing
 */

import { readFileSync, writeFileSync } from 'fs'
import { globSync } from 'glob'
import * as path from 'path'

const files = globSync('app/api/**/*.ts', { ignore: ['**/*.d.ts', '**/node_modules/**'] })

let totalReplacements = 0
let filesChanged = 0

for (const file of files) {
  const content = readFileSync(file, 'utf-8')
  let modified = content
  let hasChanges = false

  // Check if file has console.error or console.warn
  if (/console\.(error|warn|log|info|debug)/.test(modified)) {
    // Add logger import if not present
    if (!modified.includes("from '@/lib/utils/production-logger'")) {
      // Find the last import statement
      const importRegex = /^import .+$/gm
      const imports = modified.match(importRegex)
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1]
        const lastImportIndex = modified.indexOf(lastImport) + lastImport.length
        modified =
          modified.slice(0, lastImportIndex) +
          "\nimport { logger } from '@/lib/utils/production-logger'" +
          modified.slice(lastImportIndex)
        hasChanges = true
      }
    }

    // Replace console.error calls
    const errorReplacements = modified.match(/console\.error\([^)]+\)/g)?.length || 0
    modified = modified.replace(/console\.error\(/g, 'logger.error(')

    // Replace console.warn calls
    const warnReplacements = modified.match(/console\.warn\([^)]+\)/g)?.length || 0
    modified = modified.replace(/console\.warn\(/g, 'logger.warn(')

    // Replace console.log calls (except in comments)
    const logReplacements = modified.match(/^\s*console\.log\(/gm)?.length || 0
    modified = modified.replace(/(\n\s*)console\.log\(/g, '$1logger.info(')

    const replacements = errorReplacements + warnReplacements + logReplacements
    if (replacements > 0) {
      totalReplacements += replacements
      filesChanged++
      hasChanges = true
      console.log(`✓ ${file}: ${replacements} console.* calls replaced`)
    }
  }

  if (hasChanges) {
    writeFileSync(file, modified, 'utf-8')
  }
}

console.log(`\n✅ Complete: ${totalReplacements} replacements in ${filesChanged} files`)
