import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

;(async () => {
  await client.connect()
  
  const result = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'evidence_bundles' 
    ORDER BY ordinal_position
  `)
  
  console.log('📋 evidence_bundles table structure:')
  result.rows.forEach(row => {
    console.log(`  ${row.column_name.padEnd(20)} ${row.data_type.padEnd(30)} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`)
  })
  
  await client.end()
})()
