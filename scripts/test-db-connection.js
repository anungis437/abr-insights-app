const { Client } = require('pg');

async function validateConnection() {
  console.log('🚀 PostgreSQL Connection Validator\n');
  console.log('================================\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connection established\n');
    
    // Get database info
    const info = await client.query('SELECT version(), current_database(), current_user');
    console.log('Database Information:');
    console.log(`  Database: ${info.rows[0].current_database}`);
    console.log(`  User: ${info.rows[0].current_user}`);
    console.log(`  PostgreSQL: ${info.rows[0].version.split(',')[0]}\n`);
    
    // Check extensions
    const extensions = await client.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname IN ('pgvector', 'pg_cron', 'pg_stat_statements')
      ORDER BY extname
    `);
    
    console.log(`Extensions (${extensions.rows.length}):`);
    if (extensions.rows.length === 0) {
      console.log('  (none installed)');
    } else {
      extensions.rows.forEach(ext => {
        console.log(`  ✓ ${ext.extname} v${ext.extversion}`);
      });
    }
    console.log('');
    
    // Check tables
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log(`Tables in 'public' schema (${tables.rows.length}):`);
    if (tables.rows.length === 0) {
      console.log('  (none - database is empty)\n');
      console.log('⚠️  This is a fresh database. You need to run migrations.');
    } else {
      const displayCount = Math.min(tables.rows.length, 20);
      tables.rows.slice(0, displayCount).forEach((row, i) => {
        console.log(`  ${i+1}. ${row.tablename}`);
      });
      if (tables.rows.length > displayCount) {
        console.log(`  ... and ${tables.rows.length - displayCount} more`);
      }
    }
    console.log('');
    
    // Check schemas
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `);
    
    console.log(`Schemas (${schemas.rows.length}):`);
    schemas.rows.forEach(row => {
      console.log(`  - ${row.schema_name}`);
    });
    console.log('');
    
    // Test write permissions
    try {
      await client.query('CREATE TABLE IF NOT EXISTS _connection_test (id serial PRIMARY KEY, created_at timestamp DEFAULT NOW())');
      await client.query('INSERT INTO _connection_test DEFAULT VALUES');
      const testResult = await client.query('SELECT COUNT(*) as count FROM _connection_test');
      console.log(`✅ Write permissions: OK (test table has ${testResult.rows[0].count} row(s))`);
      await client.query('DROP TABLE _connection_test');
    } catch (error) {
      console.log('❌ Write permissions: FAILED -', error.message);
    }
    
    await client.end();
    
    console.log('\n================================');
    console.log('✅ Connection validation complete!');
    console.log('================================\n');
    
    if (tables.rows.length === 0) {
      console.log('📋 Next Steps:');
      console.log('  1. Apply migrations from supabase/migrations/');
      console.log('  2. Run seed data scripts');
      console.log('  3. Test application connectivity\n');
    }
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\nPlease check:');
    console.error('  - DATABASE_URL environment variable is set');
    console.error('  - Database credentials are correct');
    console.error('  - Database is accessible from your network\n');
    process.exit(1);
  }
}

validateConnection();
