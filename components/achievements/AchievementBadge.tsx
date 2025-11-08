'use client';

import Image from 'next/image';
import { Trophy, Award, Star, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  name: string;
  description?: string;
  icon?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  earned?: boolean;
  earnedAt?: string;
  showDetails?: boolean;
  className?: string;
}

const tierConfig = {
  bronze: {
    gradient: 'from-amber-700 to-amber-900',
    ring: 'ring-amber-600',
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    icon: Trophy,
  },
  silver: {
    gradient: 'from-gray-400 to-gray-600',
    ring: 'ring-gray-500',
    bg: 'bg-gray-100',
    text: 'text-gray-900',
    icon: Award,
  },
  gold: {
    gradient: 'from-yellow-400 to-yellow-600',
    ring: 'ring-yellow-500',
    bg: 'bg-yellow-100',
    text: 'text-yellow-900',
    icon: Star,
  },
  platinum: {
    gradient: 'from-purple-400 to-purple-600',
    ring: 'ring-purple-500',
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    icon: Crown,
  },
};

const sizeConfig = {
  sm: {
    container: 'w-16 h-16',
    icon: 'w-8 h-8',
    text: 'text-xs',
  },
  md: {
    container: 'w-24 h-24',
    icon: 'w-12 h-12',
    text: 'text-sm',
  },
  lg: {
    container: 'w-32 h-32',
    icon: 'w-16 h-16',
    text: 'text-base',
  },
};

export function AchievementBadge({
  name,
  description,
  icon,
  tier,
  imageUrl,
  size = 'md',
  earned = false,
  earnedAt,
  showDetails = false,
  className,
}: AchievementBadgeProps) {
  const tierStyles = tierConfig[tier];
  const sizeStyles = sizeConfig[size];
  const TierIcon = tierStyles.icon;

  return (
    <div className={cn('group relative', className)}>
      {/* Badge Container */}
      <div
        className={cn(
          'relative rounded-full',
          'ring-4',
          tierStyles.ring,
          'transition-all duration-300',
          'group-hover:scale-110',
          sizeStyles.container,
          !earned && 'opacity-40 grayscale'
        )}
      >
        {/* Background Gradient */}
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-gradient-to-br',
            tierStyles.gradient
          )}
        />

        {/* Badge Content */}
        <div className="relative flex items-center justify-center w-full h-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <TierIcon className={cn('text-white', sizeStyles.icon)} />
          )}
        </div>

        {/* Shine Effect for Earned Badges */}
        {earned && (
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shine" />
          </div>
        )}
      </div>

      {/* Details Tooltip/Card */}
      {showDetails && (
        <div
          className={cn(
            'absolute z-50 w-64 p-4 rounded-lg shadow-xl',
            'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
            'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
            'transition-all duration-200',
            'bottom-full mb-2 left-1/2 -translate-x-1/2'
          )}
        >
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-8 border-transparent border-t-gray-200 dark:border-t-gray-700" />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {name}
              </h4>
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium capitalize',
                  tierStyles.bg,
                  tierStyles.text
                )}
              >
                {tier}
              </span>
            </div>
            
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}

            {earned && earnedAt && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Earned {new Date(earnedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {!earned && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Not yet earned
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Badge Name (Below Badge) */}
      {size !== 'sm' && (
        <div className="mt-2 text-center">
          <p
            className={cn(
              'font-medium',
              sizeStyles.text,
              earned ? 'text-gray-900 dark:text-white' : 'text-gray-400'
            )}
          >
            {name}
          </p>
        </div>
      )}
    </div>
  );
}
