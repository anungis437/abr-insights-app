const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

/**
 * Migration Validator
 * Validates all SQL migrations for consistency, conflicts, and completeness
 */

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

// Track schema state as we parse migrations
const schemaState = {
  tables: new Map(),
  columns: new Map(),
  constraints: new Map(),
  indexes: new Map(),
  policies: new Map(),
  functions: new Map(),
  triggers: new Map(),
  enums: new Map()
};

const issues = {
  errors: [],
  warnings: [],
  info: []
};

function log(type, message, file = null) {
  const entry = { message, file };
  issues[type].push(entry);
  
  const colors = {
    errors: '\x1b[31m',    // Red
    warnings: '\x1b[33m',  // Yellow
    info: '\x1b[36m'       // Cyan
  };
  const reset = '\x1b[0m';
  const icon = type === 'errors' ? '❌' : type === 'warnings' ? '⚠️' : 'ℹ️';
  
  const fileInfo = file ? ` [${path.basename(file)}]` : '';
  console.log(`${colors[type]}${icon} ${message}${fileInfo}${reset}`);
}

function getMigrationFiles() {
  try {
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql') && !f.startsWith('SKIP_'))
      .sort();
    
    return files.map(f => ({
      name: f,
      path: path.join(MIGRATIONS_DIR, f),
      content: fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8')
    }));
  } catch (error) {
    log('errors', `Cannot read migrations directory: ${error.message}`);
    return [];
  }
}

function extractTableName(sql) {
  const createTableMatch = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?["']?(\w+)["']?/i);
  const alterTableMatch = sql.match(/ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?["']?(\w+)["']?/i);
  return createTableMatch?.[1] || alterTableMatch?.[1];
}

function extractColumnDefinitions(createTableSql) {
  const columns = [];
  const columnPattern = /^\s*["']?(\w+)["']?\s+([\w\[\]]+(?:\([^)]*\))?)/gm;
  
  let match;
  while ((match = columnPattern.exec(createTableSql)) !== null) {
    const [, name, type] = match;
    if (!['PRIMARY', 'FOREIGN', 'UNIQUE', 'CHECK', 'CONSTRAINT', 'REFERENCES'].includes(name.toUpperCase())) {
      columns.push({ name, type });
    }
  }
  
  return columns;
}

function parseCreateTable(sql, file) {
  const tableName = extractTableName(sql);
  if (!tableName) return;
  
  if (schemaState.tables.has(tableName)) {
    log('warnings', `Table "${tableName}" already exists - possible duplicate creation`, file);
  }
  
  schemaState.tables.set(tableName, { file, sql });
  
  // Extract column definitions
  const columns = extractColumnDefinitions(sql);
  columns.forEach(col => {
    const key = `${tableName}.${col.name}`;
    if (schemaState.columns.has(key)) {
      log('warnings', `Column "${col.name}" in table "${tableName}" defined multiple times`, file);
    }
    schemaState.columns.set(key, { table: tableName, ...col, file });
  });
  
  log('info', `Table "${tableName}" created with ${columns.length} columns`, file);
}

function parseAlterTable(sql, file) {
  const tableName = extractTableName(sql);
  if (!tableName) return;
  
  if (!schemaState.tables.has(tableName)) {
    log('warnings', `ALTER TABLE on non-existent table "${tableName}"`, file);
  }
  
  // Check for ADD COLUMN
  const addColumnMatch = sql.match(/ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?\s+([\w\[\]]+(?:\([^)]*\))?)/i);
  if (addColumnMatch) {
    const [, colName, colType] = addColumnMatch;
    const key = `${tableName}.${colName}`;
    
    if (schemaState.columns.has(key)) {
      log('warnings', `Column "${colName}" already exists in "${tableName}" - ADD COLUMN may fail`, file);
    } else {
      schemaState.columns.set(key, { table: tableName, name: colName, type: colType, file });
      log('info', `Column "${colName}" added to "${tableName}"`, file);
    }
  }
  
  // Check for DROP COLUMN
  const dropColumnMatch = sql.match(/DROP\s+COLUMN\s+(?:IF\s+EXISTS\s+)?["']?(\w+)["']?/i);
  if (dropColumnMatch) {
    const colName = dropColumnMatch[1];
    const key = `${tableName}.${colName}`;
    
    if (!schemaState.columns.has(key)) {
      log('warnings', `DROP COLUMN on non-existent column "${colName}" in "${tableName}"`, file);
    } else {
      schemaState.columns.delete(key);
      log('info', `Column "${colName}" dropped from "${tableName}"`, file);
    }
  }
  
  // Check for RENAME
  const renameMatch = sql.match(/RENAME\s+(?:COLUMN\s+)?["']?(\w+)["']?\s+TO\s+["']?(\w+)["']?/i);
  if (renameMatch) {
    const [, oldName, newName] = renameMatch;
    const oldKey = `${tableName}.${oldName}`;
    const newKey = `${tableName}.${newName}`;
    
    if (!schemaState.columns.has(oldKey)) {
      log('warnings', `RENAME on non-existent column "${oldName}" in "${tableName}"`, file);
    } else {
      const col = schemaState.columns.get(oldKey);
      schemaState.columns.delete(oldKey);
      schemaState.columns.set(newKey, { ...col, name: newName });
      log('info', `Column renamed: "${oldName}" -> "${newName}" in "${tableName}"`, file);
    }
  }
}

function parseRLSPolicy(sql, file) {
  const policyMatch = sql.match(/CREATE\s+POLICY\s+["']?([^"'\s]+)["']?\s+ON\s+(?:public\.)?["']?(\w+)["']?/i);
  if (!policyMatch) return;
  
  const [, policyName, tableName] = policyMatch;
  const key = `${tableName}.${policyName}`;
  
  if (!schemaState.tables.has(tableName)) {
    log('warnings', `RLS policy "${policyName}" on non-existent table "${tableName}"`, file);
  }
  
  if (schemaState.policies.has(key)) {
    log('warnings', `Duplicate RLS policy "${policyName}" on table "${tableName}"`, file);
  }
  
  schemaState.policies.set(key, { table: tableName, name: policyName, file });
}

function parseDropPolicy(sql, file) {
  const dropMatch = sql.match(/DROP\s+POLICY\s+(?:IF\s+EXISTS\s+)?["']?([^"'\s]+)["']?\s+ON\s+(?:public\.)?["']?(\w+)["']?/i);
  if (!dropMatch) return;
  
  const [, policyName, tableName] = dropMatch;
  const key = `${tableName}.${policyName}`;
  
  if (!schemaState.policies.has(key)) {
    log('info', `DROP POLICY on non-existent policy "${policyName}" (may have IF EXISTS)`, file);
  } else {
    schemaState.policies.delete(key);
  }
}

function checkRecursivePolicies(sql, file) {
  // Check for known recursive policy patterns
  if (sql.includes('SELECT') && sql.includes('FROM profiles') && sql.includes('WHERE') && 
      (sql.includes('auth.uid()') || sql.includes('current_user'))) {
    
    // Count nested SELECT statements
    const selectCount = (sql.match(/SELECT/gi) || []).length;
    if (selectCount > 2) {
      log('warnings', `Potential recursive policy detected - ${selectCount} nested SELECTs`, file);
    }
  }
}

function parseFunction(sql, file) {
  const funcMatch = sql.match(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?["']?([^"'\s(]+)["']?/i);
  if (!funcMatch) return;
  
  const funcName = funcMatch[1];
  
  if (schemaState.functions.has(funcName)) {
    log('info', `Function "${funcName}" redefined (CREATE OR REPLACE is normal)`, file);
  }
  
  schemaState.functions.set(funcName, { name: funcName, file });
}

function checkForeignKeys(sql, file) {
  const fkPattern = /FOREIGN\s+KEY\s*\([^)]+\)\s+REFERENCES\s+(?:public\.)?["']?(\w+)["']?/gi;
  let match;
  
  while ((match = fkPattern.exec(sql)) !== null) {
    const referencedTable = match[1];
    if (!schemaState.tables.has(referencedTable)) {
      log('warnings', `Foreign key references non-existent table "${referencedTable}"`, file);
    }
  }
}

function checkDependencies(file, sql) {
  // Check if this migration depends on tables that should exist
  const tableRefs = sql.match(/(?:FROM|JOIN|INTO|UPDATE|ON)\s+(?:public\.)?["']?(\w+)["']?/gi);
  if (tableRefs) {
    tableRefs.forEach(ref => {
      const tableName = ref.split(/\s+/).pop().replace(/['"]/g, '');
      if (!['dual', 'pg_', 'information_schema'].some(skip => tableName.startsWith(skip))) {
        if (!schemaState.tables.has(tableName) && 
            !sql.includes(`CREATE TABLE ${tableName}`) &&
            !sql.includes(`CREATE TABLE IF NOT EXISTS ${tableName}`)) {
          // This might be a dependency issue
          log('info', `Migration references table "${tableName}" - ensure it exists`, file);
        }
      }
    });
  }
}

function analyzeMigration(migration) {
  const { name, content, path: filePath } = migration;
  
  console.log(`\n📄 Analyzing: ${name}`);
  
  // Split into statements
  const statements = content.split(/;\s*$/gm).filter(s => s.trim());
  
  statements.forEach(sql => {
    const trimmed = sql.trim();
    if (!trimmed || trimmed.startsWith('--')) return;
    
    // Parse different statement types
    if (trimmed.match(/CREATE\s+TABLE/i)) {
      parseCreateTable(trimmed, name);
      checkForeignKeys(trimmed, name);
    } else if (trimmed.match(/ALTER\s+TABLE/i)) {
      parseAlterTable(trimmed, name);
    } else if (trimmed.match(/CREATE\s+POLICY/i)) {
      parseRLSPolicy(trimmed, name);
      checkRecursivePolicies(trimmed, name);
    } else if (trimmed.match(/DROP\s+POLICY/i)) {
      parseDropPolicy(trimmed, name);
    } else if (trimmed.match(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION/i)) {
      parseFunction(trimmed, name);
    }
    
    // Check dependencies
    checkDependencies(name, trimmed);
  });
}

function validateAgainstLiveDatabase() {
  console.log('\n\n🔍 Validating against live database schema...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  return client.connect()
    .then(() => {
      console.log('✅ Connected to database');
      
      // Check if tables already exist
      return client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `);
    })
    .then(result => {
      const existingTables = result.rows.map(r => r.tablename);
      
      if (existingTables.length > 0) {
        log('warnings', `Database already has ${existingTables.length} tables - migrations may conflict`);
        
        // Check which migration tables already exist
        schemaState.tables.forEach((tableInfo, tableName) => {
          if (existingTables.includes(tableName)) {
            log('warnings', `Table "${tableName}" already exists in database`, tableInfo.file);
          }
        });
      } else {
        console.log('✅ Database is empty - ready for migrations');
      }
      
      return client.end();
    })
    .catch(error => {
      console.log('⚠️  Could not connect to database for validation:', error.message);
      console.log('   (Continuing with migration file analysis only)\n');
      return Promise.resolve();
    });
}

function generateReport() {
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 MIGRATION VALIDATION REPORT');
  console.log('='.repeat(60) + '\n');
  
  console.log(`📁 Migrations analyzed: ${schemaState.tables.size} files`);
  console.log(`📊 Schema Summary:`);
  console.log(`   • Tables: ${schemaState.tables.size}`);
  console.log(`   • Columns: ${schemaState.columns.size}`);
  console.log(`   • RLS Policies: ${schemaState.policies.size}`);
  console.log(`   • Functions: ${schemaState.functions.size}`);
  
  console.log(`\n🎯 Issues Found:`);
  console.log(`   • Errors: ${issues.errors.length}`);
  console.log(`   • Warnings: ${issues.warnings.length}`);
  console.log(`   • Info: ${issues.info.length}`);
  
  if (issues.errors.length > 0) {
    console.log('\n\n❌ ERRORS (Must be fixed):');
    issues.errors.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue.message}`);
      if (issue.file) console.log(`      File: ${issue.file}`);
    });
  }
  
  if (issues.warnings.length > 0) {
    console.log('\n\n⚠️  WARNINGS (Review recommended):');
    const uniqueWarnings = Array.from(new Set(issues.warnings.map(w => w.message)));
    uniqueWarnings.slice(0, 20).forEach((msg, i) => {
      const count = issues.warnings.filter(w => w.message === msg).length;
      console.log(`   ${i + 1}. ${msg}${count > 1 ? ` (${count}x)` : ''}`);
    });
    if (uniqueWarnings.length > 20) {
      console.log(`   ... and ${uniqueWarnings.length - 20} more warnings`);
    }
  }
  
  console.log('\n\n' + '='.repeat(60));
  
  if (issues.errors.length === 0) {
    console.log('✅ NO CRITICAL ERRORS FOUND');
    console.log('   Migrations appear to be structurally sound.');
    
    if (issues.warnings.length > 0) {
      console.log('   Review warnings above before applying.');
    } else {
      console.log('   Ready to apply migrations!');
    }
  } else {
    console.log('❌ CRITICAL ERRORS FOUND');
    console.log('   Fix errors before applying migrations.');
  }
  
  console.log('='.repeat(60) + '\n');
}

function saveTablesToFile() {
  const output = [];
  output.push('# Expected Schema After Migrations\n');
  output.push(`Generated: ${new Date().toISOString()}\n\n`);
  
  output.push('## Tables\n\n');
  
  const sortedTables = Array.from(schemaState.tables.keys()).sort();
  sortedTables.forEach(tableName => {
    const tableColumns = Array.from(schemaState.columns.entries())
      .filter(([key]) => key.startsWith(tableName + '.'))
      .map(([key, col]) => col);
    
    output.push(`### ${tableName}\n`);
    output.push(`Source: ${schemaState.tables.get(tableName).file}\n\n`);
    
    if (tableColumns.length > 0) {
      output.push('| Column | Type | Source |\n');
      output.push('|--------|------|--------|\n');
      tableColumns.forEach(col => {
        output.push(`| ${col.name} | ${col.type} | ${col.file} |\n`);
      });
      output.push('\n');
    }
    
    // Add policies
    const policies = Array.from(schemaState.policies.entries())
      .filter(([key]) => key.startsWith(tableName + '.'))
      .map(([key, policy]) => policy);
    
    if (policies.length > 0) {
      output.push(`**RLS Policies**: ${policies.length}\n\n`);
    }
  });
  
  const outputPath = path.join(__dirname, '..', 'MIGRATION_SCHEMA_ANALYSIS.md');
  fs.writeFileSync(outputPath, output.join(''));
  console.log(`\n📄 Detailed schema analysis saved to: MIGRATION_SCHEMA_ANALYSIS.md\n`);
}

async function main() {
  console.log('🚀 Migration Validator\n');
  console.log('Analyzing migrations for consistency and conflicts...\n');
  
  const migrations = getMigrationFiles();
  
  if (migrations.length === 0) {
    console.log('❌ No migration files found!');
    process.exit(1);
  }
  
  console.log(`Found ${migrations.length} migration files to analyze\n`);
  
  // Analyze each migration in order
  migrations.forEach(analyzeMigration);
  
  // Validate against live database
  await validateAgainstLiveDatabase();
  
  // Generate report
  generateReport();
  
  // Save detailed schema
  saveTablesToFile();
  
  // Exit with error code if critical errors found
  if (issues.errors.length > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
