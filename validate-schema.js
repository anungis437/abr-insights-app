import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Validating database schema...\n');

async function validateSchema() {
  const validations = [];

  // Check core tables
  const tables = [
    'organizations',
    'profiles',
    'roles',
    'permissions',
    'role_permissions',
    'user_roles',
    'audit_logs',
    'courses',
    'lessons',
    'cases',
    'content_categories',
    'achievements',
    'user_achievements',
    'user_bookmarks',
    'lesson_progress',
    'course_enrollments'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        validations.push({ table, status: '❌', message: error.message });
      } else {
        validations.push({ table, status: '✅', message: 'Table exists' });
      }
    } catch (err) {
      validations.push({ table, status: '❌', message: err.message });
    }
  }

  // Check seed data counts
  console.log('📊 Checking seed data...\n');

  try {
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('slug, name');
    
    if (!rolesError && roles) {
      console.log(`✅ Roles (${roles.length} total):`);
      roles.forEach(r => console.log(`   - ${r.name} (${r.slug})`));
    } else {
      console.log('❌ Could not fetch roles:', rolesError?.message);
    }

    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('slug', { count: 'exact' });
    
    if (!permError) {
      console.log(`\n✅ Permissions: ${permissions?.length || 0} created`);
    } else {
      console.log('\n❌ Could not fetch permissions:', permError?.message);
    }

    const { data: categories, error: catError } = await supabase
      .from('content_categories')
      .select('name, slug');
    
    if (!catError && categories) {
      console.log(`\n✅ Content Categories (${categories.length} total):`);
      categories.forEach(c => console.log(`   - ${c.name} (${c.slug})`));
    } else {
      console.log('\n❌ Could not fetch categories:', catError?.message);
    }

    const { data: achievements, error: achError } = await supabase
      .from('achievements')
      .select('name, rarity', { count: 'exact' });
    
    if (!achError && achievements) {
      console.log(`\n✅ Achievements: ${achievements.length} created`);
    } else {
      console.log('\n❌ Could not fetch achievements:', achError?.message);
    }

    const { data: courses, error: courseError } = await supabase
      .from('courses')
      .select('title, slug');
    
    if (!courseError && courses) {
      console.log(`\n✅ Sample Courses (${courses.length} total):`);
      courses.forEach(c => console.log(`   - ${c.title} (${c.slug})`));
    } else {
      console.log('\n❌ Could not fetch courses:', courseError?.message);
    }

  } catch (err) {
    console.error('❌ Error checking seed data:', err.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 TABLE VALIDATION SUMMARY\n');
  validations.forEach(v => {
    console.log(`${v.status} ${v.table.padEnd(25)} ${v.message}`);
  });

  const successCount = validations.filter(v => v.status === '✅').length;
  const totalCount = validations.length;

  console.log('\n' + '='.repeat(60));
  console.log(`\n${successCount}/${totalCount} tables validated successfully`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 All migrations applied successfully!');
  } else {
    console.log('\n⚠️  Some tables are missing or inaccessible');
  }
}

validateSchema().catch(console.error);
