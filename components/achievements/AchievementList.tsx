'use client';

import { useState } from 'react';
import { AchievementBadge } from './AchievementBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UserAchievement } from '@/lib/services/gamification';

interface AchievementListProps {
  achievements: (UserAchievement & {
    achievement?: {
      name: string;
      slug: string;
      description: string;
      icon?: string;
      tier: 'bronze' | 'silver' | 'gold' | 'platinum';
      badge_image_url?: string;
      category?: {
        name: string;
        slug: string;
      };
    };
  })[];
  showFilters?: boolean;
  columns?: 3 | 4 | 5 | 6;
  className?: string;
}

export function AchievementList({
  achievements,
  showFilters = true,
  columns = 4,
  className,
}: AchievementListProps) {
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique tiers and categories
  const tiers = ['all', 'bronze', 'silver', 'gold', 'platinum'];
  const categories = [
    'all',
    ...Array.from(
      new Set(
        achievements
          .map((a) => a.achievement?.category?.slug)
          .filter((slug): slug is string => Boolean(slug))
      )
    ),
  ];

  // Filter achievements
  const filteredAchievements = achievements.filter((achievement) => {
    if (selectedTier !== 'all' && achievement.achievement?.tier !== selectedTier) {
      return false;
    }
    if (
      selectedCategory !== 'all' &&
      achievement.achievement?.category?.slug !== selectedCategory
    ) {
      return false;
    }
    return true;
  });

  const columnClass = {
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6',
  }[columns];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters */}
      {showFilters && (tiers.length > 1 || categories.length > 1) && (
        <div className="flex flex-wrap gap-4">
          {/* Tier Filter */}
          {tiers.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tier
              </label>
              <div className="flex flex-wrap gap-2">
                {tiers.map((tier) => (
                  <Button
                    key={tier}
                    variant={selectedTier === tier ? 'default' : 'outline'}
                    onClick={() => setSelectedTier(tier)}
                    className="capitalize text-sm px-3 py-1 h-8"
                  >
                    {tier}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize text-sm px-3 py-1 h-8"
                  >
                    {category === 'all' ? 'All' : category.replace(/-/g, ' ')}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Achievement Grid */}
      {filteredAchievements.length > 0 ? (
        <div className={cn('grid gap-6', columnClass)}>
          {filteredAchievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              name={achievement.achievement?.name || 'Achievement'}
              description={achievement.achievement?.description}
              icon={achievement.achievement?.icon}
              tier={achievement.achievement?.tier || 'bronze'}
              imageUrl={achievement.achievement?.badge_image_url}
              earned={true}
              earnedAt={achievement.earned_at}
              showDetails={true}
              size="md"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No achievements found matching your filters.
          </p>
        </div>
      )}

      {/* Stats Summary */}
      {achievements.length > 0 && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {achievements.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Achievements
              </div>
            </div>
            {['bronze', 'silver', 'gold', 'platinum'].map((tier) => {
              const count = achievements.filter(
                (a) => a.achievement?.tier === tier
              ).length;
              return (
                <div key={tier} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {count}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {tier}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
