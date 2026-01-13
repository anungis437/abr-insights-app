import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const testUsers = [
  { email: 'super_admin@abr-insights.com', role: 'super_admin', name: 'Super Admin', id: '00000000-0000-0000-0000-000000000001' },
  { email: 'compliance@abr-insights.com', role: 'compliance_officer', name: 'Compliance Officer', id: '00000000-0000-0000-0000-000000000002' },
  { email: 'orgadmin@abr-insights.com', role: 'org_admin', name: 'Organization Admin', id: '00000000-0000-0000-0000-000000000003' },
  { email: 'analyst@abr-insights.com', role: 'analyst', name: 'Data Analyst', id: '00000000-0000-0000-0000-000000000004' },
  { email: 'investigator@abr-insights.com', role: 'investigator', name: 'Case Investigator', id: '00000000-0000-0000-0000-000000000005' },
  { email: 'educator@abr-insights.com', role: 'educator', name: 'Course Educator', id: '00000000-0000-0000-0000-000000000006' },
  { email: 'learner@abr-insights.com', role: 'learner', name: 'Student Learner', id: '00000000-0000-0000-0000-000000000007' },
  { email: 'viewer@abr-insights.com', role: 'viewer', name: 'Read-Only Viewer', id: '00000000-0000-0000-0000-000000000008' },
  { email: 'guest@abr-insights.com', role: 'guest', name: 'Guest User', id: '00000000-0000-0000-0000-000000000009' }
];

async function createAuthUsers() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL! });
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    console.log('');
    console.log('Creating test users...');
    console.log('');

    let created = 0;
    let existing = 0;

    for (const user of testUsers) {
      // Check if user exists
      const checkUser = await client.query(
        'SELECT id FROM auth.users WHERE email = $1',
        [user.email]
      );

      if (checkUser.rows.length > 0) {
        console.log(`⚠️  ${user.email} - already exists`);
        existing++;
        continue;
      }

      // Insert into auth.users with bcrypt password
      await client.query(`
        INSERT INTO auth.users (
          id,
          instance_id,
          email,
          encrypted_password,
          email_confirmed_at,
          created_at,
          updated_at,
          raw_app_meta_data,
          raw_user_meta_data,
          aud,
          role
        ) VALUES (
          $1::uuid,
          '00000000-0000-0000-0000-000000000000'::uuid,
          $2,
          crypt('TestPass123!', gen_salt('bf')),
          NOW(),
          NOW(),
          NOW(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          '{}'::jsonb,
          'authenticated',
          'authenticated'
        )
      `, [user.id, user.email]);

      // Insert into auth.identities
      await client.query(`
        INSERT INTO auth.identities (
          id,
          user_id,
          provider_id,
          identity_data,
          provider,
          last_sign_in_at,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          $1::uuid,
          $1::uuid,
          $2::jsonb,
          'email',
          NOW(),
          NOW(),
          NOW()
        )
      `, [
        user.id,
        JSON.stringify({ sub: user.id, email: user.email })
      ]);

      // Insert into public.profiles
      await client.query(`
        INSERT INTO public.profiles (
          id,
          email,
          display_name,
          role,
          created_at,
          updated_at
        ) VALUES ($1::uuid, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE 
        SET role = $4, display_name = $3, updated_at = NOW()
      `, [user.id, user.email, user.name, user.role]);

      console.log(`✅ ${user.email} (${user.role})`);
      created++;
    }

    console.log('');
    console.log('===================================');
    console.log('Summary');
    console.log('===================================');
    console.log(`Total: ${testUsers.length}`);
    console.log(`Created: ${created}`);
    console.log(`Already existed: ${existing}`);
    console.log('');
    console.log('✅ Test users ready!');
    console.log('');
    console.log('🔐 Login at: http://localhost:3001/auth/login');
    console.log('   Email: super_admin@abr-insights.com');
    console.log('   Password: TestPass123!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

createAuthUsers();
