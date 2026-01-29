/**
 * Manual Migration Helper for 014_add_role_to_profiles.sql
 *
 * Since Supabase doesn't allow DDL statements via API, this script
 * provides instructions to apply the migration manually.
 */

import * as fs from 'fs'
import * as path from 'path'

console.log('\n============================================================')
console.log('  Migration 014: Add Role Field to Profiles')
console.log('============================================================\n')

console.log('⚠️  Supabase requires manual execution of DDL statements\n')

const migrationPath = path.join(__dirname, '../supabase/migrations/014_add_role_to_profiles.sql')
const migrationContent = fs.readFileSync(migrationPath, 'utf8')

console.log('📋 Instructions:')
console.log('   1. Opening Supabase SQL Editor in your browser...\n')

// Open Supabase SQL Editor
setTimeout(() => {
  const { exec } = require('child_process')
  exec('start https://app.supabase.com/project/nuywgvbkgdvngrysqdul/sql/new')
}, 1000)

console.log('   2. Copy the SQL below (already copied to clipboard if available):\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log(migrationContent)
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('   3. Paste into the SQL Editor and click "Run"\n')
console.log('   4. Verify success message appears\n')
console.log('   5. Run: npm run build\n')

console.log('============================================================\n')

// Try to copy to clipboard if clipboardy is available
try {
  const clipboardy = require('clipboardy')
  clipboardy.writeSync(migrationContent)
  console.log('✅ SQL copied to clipboard!\n')
} catch (e) {
  console.log('💡 Tip: Install clipboardy to auto-copy SQL: npm install clipboardy\n')
}
