/**
 * Check Auth Schema Directly
 * Query auth.users table via SQL to see what's really there
 */

import pkg from 'pg';
const { Client } = pkg;

async function checkAuthUsers() {
  const client = new Client({
    host: 'db.nuywgvbkgdvngrysqdul.supabase.co',
    port: 5432,
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check auth.users
    const usersResult = await client.query(`
      SELECT id, email, email_confirmed_at, created_at
      FROM auth.users
      ORDER BY created_at DESC
      LIMIT 20
    `);

    console.log(`📊 Auth Users (${usersResult.rows.length} found):`);
    usersResult.rows.forEach(user => {
      console.log(`  ${user.email}`);
      console.log(`    ID: ${user.id}`);
      console.log(`    Confirmed: ${user.email_confirmed_at ? '✅' : '❌'}`);
      console.log('');
    });

    // Check if any match our test emails
    const testResult = await client.query(`
      SELECT id, email
      FROM auth.users
      WHERE email IN (
        'super_admin@abr-insights.com',
        'compliance@abr-insights.com',
        'learner@abr-insights.com'
      )
    `);

    console.log(`\n🔍 Test Accounts in auth.users: ${testResult.rows.length}/3`);
    testResult.rows.forEach(user => {
      console.log(`  ✅ ${user.email} → ${user.id}`);
    });

    // Check profiles
    const profilesResult = await client.query(`
      SELECT id, email, role
      FROM profiles
      WHERE email LIKE '%@abr-insights.com'
      ORDER BY role
    `);

    console.log(`\n👤 Profiles: ${profilesResult.rows.length}`);
    profilesResult.rows.forEach(prof => {
      console.log(`  ${prof.email} (${prof.role})`);
      console.log(`    Profile ID: ${prof.id}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAuthUsers();
