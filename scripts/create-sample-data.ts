import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SUPER_ADMIN_ID = 'e2baace7-c036-4700-b112-ce17e8c1ed84';
const EDUCATOR_ID = 'b3eaf789-d170-4481-82ac-46daf5170191';
const LEARNER_ID = 'c050844e-ad9a-4961-a08e-d70b71f4fc13';

async function createSampleData() {
  console.log('🌱 Creating sample data...\n');
  
  // 1. Get existing courses
  console.log('1. Fetching courses...');
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, slug')
    .limit(3);
  
  if (!courses || courses.length === 0) {
    console.log('   ⚠️  No courses found');
    return;
  }
  console.log(`   ✅ Found ${courses.length} courses`);
  
  // 2. Create user_points for all test users
  console.log('\n2. Creating user_points...');
  const userIds = [SUPER_ADMIN_ID, EDUCATOR_ID, LEARNER_ID];
  for (const userId of userIds) {
    const { error } = await supabase
      .from('user_points')
      .upsert({
        user_id: userId,
        total_points: Math.floor(Math.random() * 5000) + 100,
        level: Math.floor(Math.random() * 10) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    if (error) {
      console.log(`   ❌ Error for user: ${error.message}`);
    } else {
      console.log(`   ✅ Created points for user`);
    }
  }
  
  // 3. Create course enrollments
  console.log('\n3. Creating course enrollments...');
  for (const course of courses) {
    // Enroll learner in all courses
    const { error: e1 } = await supabase
      .from('course_enrollments')
      .upsert({
        user_id: LEARNER_ID,
        course_id: course.id,
        enrolled_at: new Date().toISOString(),
        progress: Math.floor(Math.random() * 100),
        status: 'active',
      });
    
    if (e1) {
      console.log(`   ❌ ${course.title}: ${e1.message}`);
    } else {
      console.log(`   ✅ Enrolled learner in "${course.title}"`);
    }
    
    // Enroll educator in first course
    if (courses.indexOf(course) === 0) {
      await supabase
        .from('course_enrollments')
        .upsert({
          user_id: EDUCATOR_ID,
          course_id: course.id,
          enrolled_at: new Date().toISOString(),
          progress: 50,
          status: 'active',
        });
      console.log(`   ✅ Enrolled educator in "${course.title}"`);
    }
  }
  
  // 4. Get lessons and create progress
  console.log('\n4. Creating lesson progress...');
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title')
    .limit(5);
  
  if (lessons && lessons.length > 0) {
    for (const lesson of lessons.slice(0, 3)) {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: LEARNER_ID,
          lesson_id: lesson.id,
          status: Math.random() > 0.5 ? 'completed' : 'in_progress',
          progress_percentage: Math.floor(Math.random() * 100),
          last_accessed_at: new Date().toISOString(),
        });
      
      if (!error) {
        console.log(`   ✅ Progress for "${lesson.title}"`);
      }
    }
  }
  
  // 5. Grant achievements
  console.log('\n5. Granting achievements...');
  const { data: achievements } = await supabase
    .from('achievements')
    .select('id, name')
    .limit(3);
  
  if (achievements && achievements.length > 0) {
    for (const achievement of achievements) {
      const { error } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: LEARNER_ID,
          achievement_id: achievement.id,
          earned_at: new Date().toISOString(),
        });
      
      if (!error) {
        console.log(`   ✅ Granted "${achievement.name}"`);
      }
    }
  }
  
  console.log('\n✨ Sample data creation complete!');
  console.log('\n📝 Test with these accounts:');
  console.log('   - learner@abr-insights.com (has enrollments & progress)');
  console.log('   - educator@abr-insights.com (has 1 enrollment)');
  console.log('   - super_admin@abr-insights.com (has points)');
}

createSampleData().catch(console.error);
