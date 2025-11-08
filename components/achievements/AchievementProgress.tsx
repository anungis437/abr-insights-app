'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import type { AchievementProgress as AchievementProgressType } from '@/lib/services/gamification';

interface AchievementProgressProps {
  achievement: AchievementProgressType & {
    achievement?: {
      name: string;
      description: string;
      icon?: string;
      tier: string;
    };
  };
  className?: string;
}

export function AchievementProgress({ achievement, className }: AchievementProgressProps) {
  const isComplete = achievement.progress_percentage >= 100;
  const achievementData = achievement.achievement;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border',
        isComplete
          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon or Status */}
        <div className="flex-shrink-0">
          {isComplete ? (
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                {achievement.progress_percentage}%
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {achievementData?.name || 'Achievement'}
              </h4>
              {achievementData?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {achievementData.description}
                </p>
              )}
            </div>
            {achievementData?.tier && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium capitalize whitespace-nowrap',
                  achievementData.tier === 'bronze' && 'bg-amber-100 text-amber-900',
                  achievementData.tier === 'silver' && 'bg-gray-100 text-gray-900',
                  achievementData.tier === 'gold' && 'bg-yellow-100 text-yellow-900',
                  achievementData.tier === 'platinum' && 'bg-purple-100 text-purple-900'
                )}
              >
                {achievementData.tier}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Progress: {achievement.current_value} / {achievement.target_value}
              </span>
              <span
                className={cn(
                  'font-medium',
                  isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                )}
              >
                {achievement.progress_percentage}%
              </span>
            </div>
            <Progress
              value={achievement.progress_percentage}
              className={cn(
                'h-2',
                isComplete && '[&>div]:bg-green-500'
              )}
            />
          </div>

          {/* Last Updated */}
          {achievement.last_updated && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Last updated {new Date(achievement.last_updated).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
