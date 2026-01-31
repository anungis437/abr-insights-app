#!/usr/bin/env node
/**
 * Fix logger.error signature mismatches
 * Changes logger.error('message', error) to logger.error('message', { error })
 */

import { readFileSync, writeFileSync } from 'fs'
import { globSync } from 'glob'

const files = globSync('app/api/**/*.ts', { ignore: ['**/*.d.ts', '**/node_modules/**'] })

let filesChanged = 0

for (const file of files) {
  const content = readFileSync(file, 'utf-8')
  let modified = content

  // Fix logger.error calls with mismatched signatures
  // Pattern: logger.error('string', error) -> logger.error('string', { error })
  modified = modified.replace(
    /logger\.(error|warn)\(([^,]+),\s*([a-zA-Z_][a-zA-Z0-9_]*)\)/g,
    (match, level, message, varName) => {
      // Check if already wrapped in object
      if (varName.includes('{')) return match
      return `logger.${level}(${message}, { error: ${varName} })`
    }
  )

  if (modified !== content) {
    filesChanged++
    console.log(`✓ ${file}`)
    writeFileSync(file, modified, 'utf-8')
  }
}

console.log(`\n✅ Fixed ${filesChanged} files`)
