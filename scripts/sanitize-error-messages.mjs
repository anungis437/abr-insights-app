#!/usr/bin/env node
/**
 * Replace raw error.message leaks in API routes
 * Replaces direct error.message with sanitizeError() utility
 */

import { readFileSync, writeFileSync } from 'fs'
import { globSync } from 'glob'

const files = globSync('app/api/**/*.ts', { ignore: ['**/*.d.ts', '**/node_modules/**'] })

let filesChanged = 0

for (const file of files) {
  const content = readFileSync(file, 'utf-8')
  let modified = content
  let hasChanges = false

  // Check if file returns raw error.message to clients
  const hasErrorLeak = /(?:error|errorMessage|details).*:.*error\s*(?:instanceof Error \? error\.)?\.message/i.test(modified)

  if (hasErrorLeak) {
    // Add sanitizeError import if not present
    if (!modified.includes("from '@/lib/utils/error-responses'")) {
      // Find the last import
      const importRegex = /^import .+$/gm
      const imports = modified.match(importRegex)
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1]
        const lastImportIndex = modified.indexOf(lastImport) + lastImport.length
        modified =
          modified.slice(0, lastImportIndex) +
          "\nimport { sanitizeError } from '@/lib/utils/error-responses'" +
          modified.slice(lastImportIndex)
        hasChanges = true
      }
    }

    // Replace errorMessage: error.message patterns
    const beforeCount = (modified.match(/errorMessage.*error\.message/g) || []).length
    modified = modified.replace(
      /errorMessage:\s*error\.message/g,
      "error: sanitizeError(error, 'Operation failed')"
    )
    
    // Replace details: error.message patterns
    modified = modified.replace(
      /details:\s*error\s+instanceof\s+Error\s*\?\s*error\.message\s*:\s*['"]Unknown error['"]/g,
      "details: sanitizeError(error, 'An error occurred')"
    )
    
    // Replace { error: error.message } patterns
    modified = modified.replace(
      /\{\s*error:\s*error\s+instanceof\s+Error\s*\?\s*error\.message\s*:\s*['"][^'"]+['"]\s*\}/g,
      "{ error: sanitizeError(error) }"
    )

    const afterCount = (modified.match(/errorMessage.*error\.message/g) || []).length
    const replacements = beforeCount - afterCount
    
    if (replacements > 0 || hasChanges) {
      filesChanged++
      console.log(`✓ ${file}`)
      writeFileSync(file, modified, 'utf-8')
    }
  }
}

console.log(`\n✅ Sanitized ${filesChanged} files`)
