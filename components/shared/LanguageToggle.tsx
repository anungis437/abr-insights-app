'use client'

/**
 * Language Toggle Component
 * Provides EN/FR language switching
 * Part of Phase 2 Task 5: Bilingual Content Switching
 */

import { useLanguage } from '@/lib/contexts/LanguageContext'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LanguageToggleProps {
  variant?: 'default' | 'outline' | 'ghost'
  showLabel?: boolean
  className?: string
}

export function LanguageToggle({ 
  variant = 'ghost', 
  showLabel = false,
  className = ''
}: LanguageToggleProps) {
  const { language, toggleLanguage, t, isLoading } = useLanguage()

  if (isLoading) {
    return null
  }

  const label = language === 'en' ? 'EN' : 'FR'
  const ariaLabel = language === 'en' 
    ? t('language.switch_to_french')
    : t('language.switch_to_english')

  return (
    <Button
      variant={variant}
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <Globe className="h-4 w-4" aria-hidden="true" />
      {showLabel ? (
        <span className="font-medium">{label}</span>
      ) : (
        <span className="font-medium text-xs">{label}</span>
      )}
    </Button>
  )
}

/**
 * Compact language toggle for mobile
 */
export function LanguageToggleCompact() {
  const { language, toggleLanguage, t, isLoading } = useLanguage()

  if (isLoading) {
    return null
  }

  const ariaLabel = language === 'en' 
    ? t('language.switch_to_french')
    : t('language.switch_to_english')

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{language === 'en' ? 'EN' : 'FR'}</span>
    </button>
  )
}

/**
 * Language toggle with both language options visible
 */
export function LanguageTogglePill() {
  const { language, setLanguage, isLoading } = useLanguage()

  if (isLoading) {
    return null
  }

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-lg" role="group" aria-label="Language selection">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          language === 'en'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={language === 'en'}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('fr')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          language === 'fr'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={language === 'fr'}
        aria-label="Passer au français"
      >
        FR
      </button>
    </div>
  )
}
