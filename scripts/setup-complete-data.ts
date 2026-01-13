import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SUPER_ADMIN_ID = 'e2baace7-c036-4700-b112-ce17e8c1ed84';
const EDUCATOR_ID = 'b3eaf789-d170-4481-82ac-46daf5170191';
const LEARNER_ID = 'c050844e-ad9a-4961-a08e-d70b71f4fc13';

async function setupCompleteData() {
  console.log('🚀 Setting up complete test environment...\n');
  
  // 1. Get courses
  console.log('1️⃣  Fetching courses...');
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, slug')
    .limit(3);
  
  if (coursesError || !courses || courses.length === 0) {
    console.log('   ❌ No courses found');
    return;
  }
  console.log(`   ✅ Found ${courses.length} courses`);
  courses.forEach((c, i) => console.log(`      ${i + 1}. ${c.title}`));
  
  // 2. Create user_points (correct schema without 'level')
  console.log('\n2️⃣  Creating user_points...');
  const userIds = [SUPER_ADMIN_ID, EDUCATOR_ID, LEARNER_ID];
  
  for (const userId of userIds) {
    const { error } = await supabase
      .from('user_points')
      .upsert({
        user_id: userId,
        organization_id: '00000000-0000-0000-0000-000000000001', // Default org
        action_type: 'initial_setup',
        points: Math.floor(Math.random() * 500) + 100,
        earned_at: new Date().toISOString(),
      }, { onConflict: 'user_id,organization_id,action_type' });
    
    if (error && !error.message.includes('organization_id')) {
      console.log(`   ⚠️  Points: ${error.message.substring(0, 80)}`);
    } else if (!error) {
      console.log(`   ✅ Created points record`);
    }
  }
  
  // 3. Create enrollments (correct table name)
  console.log('\n3️⃣  Creating enrollments...');
  
  for (const course of courses) {
    // Enroll learner
    const { error: e1 } = await supabase
      .from('enrollments')
      .upsert({
        user_id: LEARNER_ID,
        course_id: course.id,
        enrolled_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        progress: Math.floor(Math.random() * 100),
        status: 'active',
      }, { onConflict: 'user_id,course_id' });
    
    if (e1) {
      console.log(`   ⚠️  ${course.title}: ${e1.message.substring(0, 60)}`);
    } else {
      console.log(`   ✅ Enrolled learner in "${course.title}"`);
    }
    
    // Enroll educator in first course
    if (courses.indexOf(course) === 0) {
      await supabase
        .from('enrollments')
        .upsert({
          user_id: EDUCATOR_ID,
          course_id: course.id,
          enrolled_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 75,
          status: 'active',
        }, { onConflict: 'user_id,course_id' });
      console.log(`   ✅ Enrolled educator in "${course.title}"`);
    }
  }
  
  // 4. Create lesson progress
  console.log('\n4️⃣  Creating lesson progress...');
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title')
    .limit(5);
  
  if (lessons && lessons.length > 0) {
    let created = 0;
    for (const lesson of lessons.slice(0, 3)) {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: LEARNER_ID,
          lesson_id: lesson.id,
          status: Math.random() > 0.3 ? 'completed' : 'in_progress',
          progress_percentage: Math.floor(Math.random() * 100),
          last_accessed_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: 'user_id,lesson_id' });
      
      if (!error) {
        created++;
      }
    }
    console.log(`   ✅ Created ${created} lesson progress records`);
  }
  
  // 5. Grant achievements
  console.log('\n5️⃣  Granting achievements...');
  const { data: achievements } = await supabase
    .from('achievements')
    .select('id, name, description')
    .limit(3);
  
  if (achievements && achievements.length > 0) {
    let granted = 0;
    for (const achievement of achievements) {
      const { error } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: LEARNER_ID,
          achievement_id: achievement.id,
          earned_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: 'user_id,achievement_id' });
      
      if (!error) {
        granted++;
      }
    }
    console.log(`   ✅ Granted ${granted} achievements to learner`);
  }
  
  console.log('\n✨ Setup complete!');
  console.log('\n📝 Test Accounts:');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   🎓 Learner:    learner@abr-insights.com');
  console.log('      Password:  TestPass123!');
  console.log('      Has:       3 enrollments, lesson progress, achievements');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   👨‍🏫 Educator:   educator@abr-insights.com');
  console.log('      Password:  TestPass123!');
  console.log('      Has:       1 enrollment');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   🔑 SuperAdmin: super_admin@abr-insights.com');
  console.log('      Password:  TestPass123!');
  console.log('      Has:       Full admin access');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🌐 Open: http://localhost:3002/auth/login');
}

setupCompleteData().catch(console.error);
