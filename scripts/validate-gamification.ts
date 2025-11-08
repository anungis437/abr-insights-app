import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '***REMOVED***';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function validateGamification() {
  console.log('🎮 Validating Gamification Deployment...\n');
  
  const tables = [
    // Core gamification
    'achievements',
    'user_achievements',
    'user_points',
    'achievement_categories',
    'achievement_progress',
    'user_streaks',
    
    // Points & Rewards
    'points_sources',
    'points_transactions',
    'rewards_catalog',
    'user_rewards',
    
    // Leaderboards
    'leaderboards',
    'leaderboard_entries',
    
    // Social Features
    'user_profiles_extended',
    'user_follows',
    'study_buddies',
    'user_activity_feed',
    'user_groups',
    'group_members',
    'discussion_forums',
    'forum_posts'
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        failCount++;
      } else {
        console.log(`✅ ${table}: ${count || 0} rows`);
        successCount++;
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
      failCount++;
    }
  }
  
  console.log(`\n📊 Summary: ${successCount}/${tables.length} tables accessible`);
  
  if (failCount === 0) {
    console.log('✅ All gamification tables validated successfully!');
  } else {
    console.log(`⚠️  ${failCount} table(s) failed validation`);
  }
  
  // Test key schema additions
  console.log('\n🔍 Testing Schema Enhancements...');
  
  // Test achievements has new columns
  const { data: achievement, error: achError } = await supabase
    .from('achievements')
    .select('id, name, tier, requirement_type, category_id')
    .limit(1)
    .single();
  
  if (achError && achError.code !== 'PGRST116') {
    console.log('❌ Achievements schema:', achError.message);
  } else if (!achievement) {
    console.log('ℹ️  Achievements: Schema OK (no data yet)');
  } else {
    console.log('✅ Achievements: New columns accessible');
  }
  
  // Test user_points aggregate structure
  const { data: userPoints, error: pointsError } = await supabase
    .from('user_points')
    .select('user_id, total_points_earned, current_balance')
    .limit(1)
    .single();
  
  if (pointsError && pointsError.code !== 'PGRST116') {
    console.log('❌ User Points schema:', pointsError.message);
  } else if (!userPoints) {
    console.log('ℹ️  User Points: Schema OK (no data yet)');
  } else {
    console.log('✅ User Points: Aggregate structure working');
  }
  
  console.log('\n🎉 Gamification validation complete!');
}

validateGamification().catch(console.error);
