
import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Comprehensive translations for the application
const translations = {
  en: {
    // Navigation
    nav: {
      home: "Home",
      dashboard: "Dashboard",
      dataExplorer: "Data Explorer",
      trainingHub: "Training Hub",
      library: "Knowledge Library",
      aiAssistant: "AI Assistant",
      organization: "Organization",
      dataIngestion: "Data Ingestion",
      aiModelManagement: "AI Model Management",
      signIn: "Sign In",
      signOut: "Sign Out",
      profile: "Profile",
      userManagement: "User Management"
    },
    
    // Common actions
    actions: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      search: "Search",
      filter: "Filter",
      export: "Export",
      download: "Download",
      upload: "Upload",
      submit: "Submit",
      continue: "Continue",
      back: "Back",
      next: "Next",
      finish: "Finish",
      loading: "Loading...",
      viewDetails: "View Details",
      learnMore: "Learn More",
      getStarted: "Get Started"
    },
    
    // Data Explorer
    explorer: {
      title: "Data Explorer",
      subtitle: "Analyze 20+ years of Canadian tribunal decisions on anti-Black racism",
      filteredCases: "Filtered Cases",
      casesUpheld: "Cases Upheld",
      casesDismissed: "Cases Dismissed",
      avgAward: "Avg. Award",
      noCasesFound: "No cases found matching your filters",
      adjustCriteria: "Try adjusting your search criteria",
      clearFilters: "Clear All Filters",
      loadMore: "Load More Cases",
      remaining: "remaining",
      protectedGrounds: "Protected Grounds",
      discriminationTypes: "Discrimination Types",
      monetaryAward: "Monetary Award",
      yearRange: "Year Range",
      aiSummary: "AI Summary",
      highPrecedent: "High Precedent"
    },
    
    // Training Hub
    training: {
      title: "Training Hub",
      subtitle: "Evidence-based courses on combating anti-Black racism",
      allCourses: "All Courses",
      myCourses: "My Courses",
      completed: "Completed",
      inProgress: "In Progress",
      notStarted: "Not Started",
      startCourse: "Start Course",
      continueCourse: "Continue Course",
      completeCourse: "Complete Course",
      duration: "Duration",
      lessons: "Lessons",
      quiz: "Quiz",
      certificate: "Certificate",
      progress: "Progress",
      level: "Level",
      introductory: "Introductory",
      intermediate: "Intermediate",
      advanced: "Advanced",
      specialized: "Specialized"
    },
    
    // Dashboard
    dashboard: {
      welcome: "Welcome back",
      yourProgress: "Your Learning Progress",
      coursesInProgress: "Courses in Progress",
      coursesCompleted: "Courses Completed",
      totalPoints: "Total Points",
      currentStreak: "Day Streak",
      recentActivity: "Recent Activity",
      recommendedCourses: "Recommended for You",
      achievements: "Your Achievements",
      upNext: "Up Next",
      continueWhere: "Continue where you left off"
    },
    
    // Case Details
    caseDetails: {
      caseNumber: "Case Number",
      tribunal: "Tribunal",
      outcome: "Outcome",
      decisionDate: "Decision Date",
      protectedGrounds: "Protected Grounds",
      discriminationTypes: "Discrimination Types",
      monetaryAward: "Monetary Award",
      remediesAwarded: "Remedies Awarded",
      caseSummary: "Case Summary",
      aiInsights: "AI Insights",
      similarCases: "Similar Cases",
      fullDecision: "Full Decision",
      viewDocument: "View Document",
      relatedLearning: "Related Learning",
      browseCourses: "Browse Courses",
      generateInsights: "Generate AI Insights",
      regenerateInsights: "Regenerate Insights",
      aiGeneratedSummary: "AI-Generated Case Summary",
      confidence: "Confidence",
      generated: "Generated",
      fullDecisionDownload: "Download Full Decision",
      downloadPDF: "Download PDF"
    },
    
    // Gamification
    gamification: {
      points: "Points",
      level: "Level",
      badges: "Badges",
      achievements: "Achievements",
      leaderboard: "Leaderboard",
      rank: "Rank",
      earnedBadge: "You earned a badge!",
      levelUp: "Level Up!",
      streak: "Streak",
      days: "days",
      keepItUp: "Keep it up!"
    },
    
    // Notifications
    notifications: {
      title: "Notifications",
      markAllRead: "Mark all as read",
      noNotifications: "No notifications",
      courseReminder: "Course Reminder",
      certificateEarned: "Certificate Earned",
      teamInvite: "Team Invite",
      milestoneReached: "Milestone Reached",
      systemAnnouncement: "System Announcement"
    },
    
    // Common labels
    common: {
      email: "Email",
      password: "Password",
      name: "Name",
      description: "Description",
      status: "Status",
      date: "Date",
      time: "Time",
      role: "Role",
      organization: "Organization",
      team: "Team",
      settings: "Settings",
      help: "Help",
      documentation: "Documentation",
      support: "Support",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      allRightsReserved: "All rights reserved",
      poweredBy: "Powered by"
    },
    
    // Error messages
    errors: {
      generic: "Something went wrong. Please try again.",
      network: "Network error. Please check your connection.",
      unauthorized: "You don't have permission to access this.",
      notFound: "The requested resource was not found.",
      validation: "Please check your input and try again.",
      serverError: "Server error. Our team has been notified."
    },
    
    // Success messages
    success: {
      saved: "Successfully saved!",
      deleted: "Successfully deleted!",
      updated: "Successfully updated!",
      sent: "Successfully sent!",
      completed: "Successfully completed!"
    }
  },
  
  fr: {
    // Navigation
    nav: {
      home: "Accueil",
      dashboard: "Tableau de bord",
      dataExplorer: "Explorateur de données",
      trainingHub: "Centre de formation",
      library: "Bibliothèque",
      aiAssistant: "Assistant IA",
      organization: "Organisation",
      dataIngestion: "Ingestion de données",
      aiModelManagement: "Gestion des modèles IA",
      signIn: "Se connecter",
      signOut: "Se déconnecter",
      profile: "Profil",
      userManagement: "Gestion des utilisateurs"
    },
    
    // Common actions
    actions: {
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      search: "Rechercher",
      filter: "Filtrer",
      export: "Exporter",
      download: "Télécharger",
      upload: "Téléverser",
      submit: "Soumettre",
      continue: "Continuer",
      back: "Retour",
      next: "Suivant",
      finish: "Terminer",
      loading: "Chargement...",
      viewDetails: "Voir les détails",
      learnMore: "En savoir plus",
      getStarted: "Commencer"
    },
    
    // Data Explorer
    explorer: {
      title: "Explorateur de données",
      subtitle: "Analysez 20+ années de décisions des tribunaux canadiens sur le racisme anti-Noir",
      filteredCases: "Cas filtrés",
      casesUpheld: "Cas maintenus",
      casesDismissed: "Cas rejetés",
      avgAward: "Indemnité moy.",
      noCasesFound: "Aucun cas trouvé correspondant à vos filtres",
      adjustCriteria: "Essayez d'ajuster vos critères de recherche",
      clearFilters: "Effacer tous les filtres",
      loadMore: "Charger plus de cas",
      remaining: "restants",
      protectedGrounds: "Motifs protégés",
      discriminationTypes: "Types de discrimination",
      monetaryAward: "Indemnité monétaire",
      yearRange: "Plage d'années",
      aiSummary: "Résumé IA",
      highPrecedent: "Précédent élevé"
    },
    
    // Training Hub
    training: {
      title: "Centre de formation",
      subtitle: "Cours fondés sur des données probantes pour combattre le racisme anti-Noir",
      allCourses: "Tous les cours",
      myCourses: "Mes cours",
      completed: "Terminés",
      inProgress: "En cours",
      notStarted: "Non commencés",
      startCourse: "Commencer le cours",
      continueCourse: "Continuer le cours",
      completeCourse: "Terminer le cours",
      duration: "Durée",
      lessons: "Leçons",
      quiz: "Quiz",
      certificate: "Certificat",
      progress: "Progrès",
      level: "Niveau",
      introductory: "Introductif",
      intermediate: "Intermédiaire",
      advanced: "Avancé",
      specialized: "Spécialisé"
    },
    
    // Dashboard
    dashboard: {
      welcome: "Bon retour",
      yourProgress: "Votre progression d'apprentissage",
      coursesInProgress: "Cours en cours",
      coursesCompleted: "Cours terminés",
      totalPoints: "Points totaux",
      currentStreak: "Série de jours",
      recentActivity: "Activité récente",
      recommendedCourses: "Recommandé pour vous",
      achievements: "Vos réalisations",
      upNext: "À suivre",
      continueWhere: "Continuez où vous vous êtes arrêté"
    },
    
    // Case Details
    caseDetails: {
      caseNumber: "Numéro de cas",
      tribunal: "Tribunal",
      outcome: "Résultat",
      decisionDate: "Date de décision",
      protectedGrounds: "Motifs protégés",
      discriminationTypes: "Types de discrimination",
      monetaryAward: "Indemnité monétaire",
      remediesAwarded: "Réparations accordées",
      caseSummary: "Résumé du cas",
      aiInsights: "Perspectives IA",
      similarCases: "Cas similaires",
      fullDecision: "Décision complète",
      viewDocument: "Voir le document",
      relatedLearning: "Apprentissage connexe",
      browseCourses: "Parcourir les cours",
      generateInsights: "Générer des perspectives IA",
      regenerateInsights: "Régénérer les perspectives",
      aiGeneratedSummary: "Résumé généré par IA",
      confidence: "Confiance",
      generated: "Généré",
      fullDecisionDownload: "Télécharger la décision complète",
      downloadPDF: "Télécharger le PDF"
    },
    
    // Gamification
    gamification: {
      points: "Points",
      level: "Niveau",
      badges: "Badges",
      achievements: "Réalisations",
      leaderboard: "Classement",
      rank: "Rang",
      earnedBadge: "Vous avez gagné un badge!",
      levelUp: "Niveau supérieur!",
      streak: "Série",
      days: "jours",
      keepItUp: "Continuez!"
    },
    
    // Notifications
    notifications: {
      title: "Notifications",
      markAllRead: "Tout marquer comme lu",
      noNotifications: "Aucune notification",
      courseReminder: "Rappel de cours",
      certificateEarned: "Certificat obtenu",
      teamInvite: "Invitation d'équipe",
      milestoneReached: "Étape atteinte",
      systemAnnouncement: "Annonce système"
    },
    
    // Common labels
    common: {
      email: "Courriel",
      password: "Mot de passe",
      name: "Nom",
      description: "Description",
      status: "Statut",
      date: "Date",
      time: "Heure",
      role: "Rôle",
      organization: "Organisation",
      team: "Équipe",
      settings: "Paramètres",
      help: "Aide",
      documentation: "Documentation",
      support: "Soutien",
      privacyPolicy: "Politique de confidentialité",
      termsOfService: "Conditions d'utilisation",
      allRightsReserved: "Tous droits réservés",
      poweredBy: "Propulsé par"
    },
    
    // Error messages
    errors: {
      generic: "Une erreur s'est produite. Veuillez réessayer.",
      network: "Erreur réseau. Vérifiez votre connexion.",
      unauthorized: "Vous n'avez pas la permission d'accéder à ceci.",
      notFound: "La ressource demandée n'a pas été trouvée.",
      validation: "Veuillez vérifier votre saisie et réessayer.",
      serverError: "Erreur serveur. Notre équipe a été notifiée."
    },
    
    // Success messages
    success: {
      saved: "Enregistré avec succès!",
      deleted: "Supprimé avec succès!",
      updated: "Mis à jour avec succès!",
      sent: "Envoyé avec succès!",
      completed: "Terminé avec succès!"
    }
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [user, setUser] = useState(null);

  // Load language preference from user profile or localStorage
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Check user's preferred language
        if (currentUser.preferred_language) {
          setLanguage(currentUser.preferred_language);
        } else {
          // Fallback to localStorage or browser language
          const storedLang = localStorage.getItem('preferred_language');
          if (storedLang) {
            setLanguage(storedLang);
          } else {
            // Detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (browserLang === 'fr') {
              setLanguage('fr');
            }
          }
        }
      } catch (error) {
        // User not logged in, use localStorage or default
        const storedLang = localStorage.getItem('preferred_language');
        if (storedLang) {
          setLanguage(storedLang);
        }
      }
    };

    loadLanguagePreference();
  }, []);

  const switchLanguage = async (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('preferred_language', newLang);
    
    // Save to user profile if logged in
    if (user) {
      try {
        await base44.auth.updateMe({ preferred_language: newLang });
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (!value) {
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        return key;
      }
    }
    
    return value;
  };

  const value = {
    language,
    switchLanguage,
    t,
    translations: translations[language],
    isEnglish: language === 'en',
    isFrench: language === 'fr'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
