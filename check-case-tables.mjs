import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.zdcmugkafbczvxcyofiz:@Cehyjygj001@aws-1-ca-central-1.pooler.supabase.com:5432/postgres'
});

try {
  await client.connect();
  
  const result = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%case%'
    ORDER BY table_name;
  `);
  
  console.log('Tables with "case" in name:');
  result.rows.forEach(row => console.log('  -', row.table_name));
  
  await client.end();
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
