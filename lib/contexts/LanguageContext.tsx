'use client'

/**
 * Language Context
 * Provides app-wide language switching (EN/FR)
 * Part of Phase 2 Task 5: Bilingual Content Switching
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentProfile } from '@/lib/supabase/services/profiles'

export type Language = 'en' | 'fr'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => Promise<void>
  toggleLanguage: () => Promise<void>
  t: (key: string, params?: Record<string, string>) => string
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en')
  const [isLoading, setIsLoading] = useState(true)

  // Load language preference on mount
  useEffect(() => {
    async function loadLanguagePreference() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // Try to get from user profile
          const profile = await getCurrentProfile()
          if (profile?.language) {
            setLanguageState(profile.language)
          } else {
            // Fallback to localStorage
            const saved = localStorage.getItem('app_language') as Language
            if (saved === 'en' || saved === 'fr') {
              setLanguageState(saved)
            }
          }
        } else {
          // Not logged in, use localStorage
          const saved = localStorage.getItem('app_language') as Language
          if (saved === 'en' || saved === 'fr') {
            setLanguageState(saved)
          }
        }
      } catch (error) {
        console.error('Error loading language preference:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLanguagePreference()
  }, [])

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      setLanguageState(lang)
      localStorage.setItem('app_language', lang)

      // Update user profile if logged in
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase
          .from('profiles')
          .update({ language: lang })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error('Error setting language:', error)
    }
  }, [])

  const toggleLanguage = useCallback(async () => {
    const newLang = language === 'en' ? 'fr' : 'en'
    await setLanguage(newLang)
  }, [language, setLanguage])

  const t = useCallback((key: string, params?: Record<string, string>): string => {
    let translation = translations[language][key] || translations.en[key] || key

    // Replace parameters
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{${paramKey}}`, params[paramKey])
      })
    }

    return translation
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.courses': 'Courses',
    'nav.training': 'Training',
    'nav.cases': 'Cases',
    'nav.leaderboard': 'Leaderboard',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back, {name}!',
    'dashboard.overview': "Here's your learning progress overview",
    'dashboard.stats.courses_enrolled': 'Courses Enrolled',
    'dashboard.stats.courses_completed': 'Courses Completed',
    'dashboard.stats.total_points': 'Total Points',
    'dashboard.stats.achievements': 'Achievements Earned',
    
    // Learning Dashboard
    'learning.analytics': 'Learning Analytics',
    'learning.total_watch_time': 'Total Watch Time',
    'learning.lessons_started': '{count} lessons started',
    'learning.lessons_completed': 'Lessons Completed',
    'learning.completion_rate': '{rate}% completion rate',
    'learning.current_streak': 'Current Streak',
    'learning.longest_streak': 'Longest: {days} days',
    'learning.ce_credits': 'CE Credits Earned',
    'learning.continuing_education': 'Continuing education',
    'learning.streak_days': '{count} days',
    'learning.last_activity': 'Last activity: {date}',
    'learning.progress_by_skill': 'Progress by Skill',
    'learning.recent_activity': 'Recent Activity',
    'learning.session_statistics': 'Session Statistics',
    'learning.longest_session': 'Longest Session',
    'learning.average_completion': 'Average Completion',
    'learning.total_sessions': 'Total Sessions',
    'learning.note_taking_activity': 'Note-Taking Activity',
    'learning.notes_created': 'Notes Created',
    'learning.notes_per_lesson': 'Notes per Lesson',
    
    // Video Player
    'player.play': 'Play',
    'player.pause': 'Pause',
    'player.mute': 'Mute',
    'player.unmute': 'Unmute',
    'player.fullscreen': 'Fullscreen',
    'player.exit_fullscreen': 'Exit Fullscreen',
    'player.picture_in_picture': 'Picture in Picture',
    'player.speed': 'Speed',
    'player.volume': 'Volume',
    'player.transcript': 'Transcript',
    'player.notes': 'Notes',
    'player.bookmark': 'Bookmark',
    'player.mark_complete': 'Mark Complete',
    'player.completing': 'Completing...',
    'player.keyboard_shortcuts': 'Keyboard Shortcuts',
    'player.resume_notification': 'Resuming from where you left off',
    
    // Notes
    'notes.title': 'Lesson Notes',
    'notes.add': 'Add Note',
    'notes.placeholder': 'Take a note at {time}...',
    'notes.export': 'Export Notes',
    'notes.no_notes': 'No notes yet',
    'notes.create_prompt': 'Click "Add Note" to create your first note.',
    'notes.save': 'Save Note',
    'notes.cancel': 'Cancel',
    'notes.edit': 'Edit',
    'notes.delete': 'Delete',
    'notes.timestamp': 'Timestamp',
    
    // Courses
    'courses.title': 'Courses',
    'courses.browse': 'Browse Courses',
    'courses.my_courses': 'My Courses',
    'courses.enroll': 'Enroll',
    'courses.start': 'Start Course',
    'courses.continue': 'Continue Learning',
    'courses.complete': 'Course Complete',
    'courses.lessons': '{count} lessons',
    'courses.duration': 'Duration',
    'courses.level': 'Level',
    'courses.instructor': 'Instructor',
    
    // Activity Types
    'activity.watched': 'Watched',
    'activity.completed': 'Completed',
    'activity.added_note': 'Added note',
    
    // Time
    'time.just_now': 'Just now',
    'time.minutes_ago': '{count}m ago',
    'time.hours_ago': '{count}h ago',
    'time.days_ago': '{count}d ago',
    
    // Language Toggle
    'language.english': 'English',
    'language.french': 'Français',
    'language.switch_to_french': 'Switch to French',
    'language.switch_to_english': 'Switch to English',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.courses': 'Cours',
    'nav.training': 'Formation',
    'nav.cases': 'Cas',
    'nav.leaderboard': 'Classement',
    'nav.dashboard': 'Tableau de bord',
    'nav.profile': 'Profil',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.export': 'Exporter',
    'common.download': 'Télécharger',
    'common.upload': 'Téléverser',
    'common.continue': 'Continuer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    
    // Dashboard
    'dashboard.welcome': 'Bon retour, {name}!',
    'dashboard.overview': 'Voici votre aperçu de progression d\'apprentissage',
    'dashboard.stats.courses_enrolled': 'Cours inscrits',
    'dashboard.stats.courses_completed': 'Cours complétés',
    'dashboard.stats.total_points': 'Points totaux',
    'dashboard.stats.achievements': 'Réalisations obtenues',
    
    // Learning Dashboard
    'learning.analytics': 'Analytiques d\'apprentissage',
    'learning.total_watch_time': 'Temps de visionnage total',
    'learning.lessons_started': '{count} leçons commencées',
    'learning.lessons_completed': 'Leçons complétées',
    'learning.completion_rate': 'Taux de complétion de {rate}%',
    'learning.current_streak': 'Série actuelle',
    'learning.longest_streak': 'La plus longue : {days} jours',
    'learning.ce_credits': 'Crédits de FC obtenus',
    'learning.continuing_education': 'Formation continue',
    'learning.streak_days': '{count} jours',
    'learning.last_activity': 'Dernière activité : {date}',
    'learning.progress_by_skill': 'Progression par compétence',
    'learning.recent_activity': 'Activité récente',
    'learning.session_statistics': 'Statistiques de session',
    'learning.longest_session': 'Session la plus longue',
    'learning.average_completion': 'Complétion moyenne',
    'learning.total_sessions': 'Sessions totales',
    'learning.note_taking_activity': 'Activité de prise de notes',
    'learning.notes_created': 'Notes créées',
    'learning.notes_per_lesson': 'Notes par leçon',
    
    // Video Player
    'player.play': 'Lecture',
    'player.pause': 'Pause',
    'player.mute': 'Muet',
    'player.unmute': 'Activer le son',
    'player.fullscreen': 'Plein écran',
    'player.exit_fullscreen': 'Quitter le plein écran',
    'player.picture_in_picture': 'Image dans l\'image',
    'player.speed': 'Vitesse',
    'player.volume': 'Volume',
    'player.transcript': 'Transcription',
    'player.notes': 'Notes',
    'player.bookmark': 'Signet',
    'player.mark_complete': 'Marquer comme terminé',
    'player.completing': 'Finalisation...',
    'player.keyboard_shortcuts': 'Raccourcis clavier',
    'player.resume_notification': 'Reprise là où vous vous êtes arrêté',
    
    // Notes
    'notes.title': 'Notes de leçon',
    'notes.add': 'Ajouter une note',
    'notes.placeholder': 'Prendre une note à {time}...',
    'notes.export': 'Exporter les notes',
    'notes.no_notes': 'Aucune note pour l\'instant',
    'notes.create_prompt': 'Cliquez sur "Ajouter une note" pour créer votre première note.',
    'notes.save': 'Enregistrer la note',
    'notes.cancel': 'Annuler',
    'notes.edit': 'Modifier',
    'notes.delete': 'Supprimer',
    'notes.timestamp': 'Horodatage',
    
    // Courses
    'courses.title': 'Cours',
    'courses.browse': 'Parcourir les cours',
    'courses.my_courses': 'Mes cours',
    'courses.enroll': 'S\'inscrire',
    'courses.start': 'Commencer le cours',
    'courses.continue': 'Continuer l\'apprentissage',
    'courses.complete': 'Cours terminé',
    'courses.lessons': '{count} leçons',
    'courses.duration': 'Durée',
    'courses.level': 'Niveau',
    'courses.instructor': 'Instructeur',
    
    // Activity Types
    'activity.watched': 'Visionné',
    'activity.completed': 'Terminé',
    'activity.added_note': 'Note ajoutée',
    
    // Time
    'time.just_now': 'À l\'instant',
    'time.minutes_ago': 'il y a {count}m',
    'time.hours_ago': 'il y a {count}h',
    'time.days_ago': 'il y a {count}j',
    
    // Language Toggle
    'language.english': 'English',
    'language.french': 'Français',
    'language.switch_to_french': 'Passer au français',
    'language.switch_to_english': 'Switch to English',
  }
}
