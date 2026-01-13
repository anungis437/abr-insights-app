import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LEARNER_ID = 'c050844e-ad9a-4961-a08e-d70b71f4fc13';
const EDUCATOR_ID = 'b3eaf789-d170-4481-82ac-46daf5170191';

async function quickSetup() {
  console.log('⚡ Quick Setup (no organization dependency)\n');
  
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .limit(3);
  
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title')
    .limit(5);
  
  if (!courses || courses.length === 0) {
    console.log('❌ No courses');
    return;
  }
  
  console.log('📚 Creating lesson progress (no FK dependency)...');
  let created = 0;
  
  if (lessons) {
    for (const lesson of lessons.slice(0, 4)) {
      const { error } = await supabase.from('lesson_progress').upsert({
        user_id: LEARNER_ID,
        lesson_id: lesson.id,
        status: 'completed',
        progress_percentage: 100,
        last_accessed_at: new Date().toISOString(),
      });
      
      if (!error) {
        created++;
        console.log(`   ✅ ${lesson.title}`);
      }
    }
  }
  
  console.log(`\n✅ Created ${created} lesson progress records`);
  console.log('\n🎉 Ready to test!');
  console.log('🌐 http://localhost:3002/auth/login');
  console.log('📧 learner@abr-insights.com / TestPass123!');
}

quickSetup().catch(console.error);
