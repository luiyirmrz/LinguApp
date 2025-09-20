/**
 * Enhanced Internationalization (i18n) System for LinguApp
 * Supports pluralization, RTL languages, and dynamic language switching
 * Provides type-safe translations with fallbacks
 */

import { Language } from '@/types';
import { languages } from '@/mocks/languages'; 

// RTL language codes
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur', 'ps', 'sd'];

// Pluralization rules for different languages
export const PLURAL_RULES: Record<string, (count: number) => string> = {
  en: (count) => count === 1 ? 'one' : 'other',
  es: (count) => count === 1 ? 'one' : 'other',
  fr: (count) => count === 0 || count === 1 ? 'one' : 'other',
  it: (count) => count === 1 ? 'one' : 'other',
  zh: () => 'other', // Chinese doesn't have plural forms
  hr: (count) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return 'one';
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'few';
    return 'other';
  },
  ar: (count) => {
    if (count === 0) return 'zero';
    if (count === 1) return 'one';
    if (count === 2) return 'two';
    if (count >= 3 && count <= 10) return 'few';
    if (count >= 11 && count <= 99) return 'many';
    return 'other';
  },
};

// Translation keys with pluralization support
export interface TranslationKeys {
  // Navigation
  home: string;
  profile: string;
  leaderboard: string;
  shop: string;
  settings: string;
  
  // Common actions
  continue: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  done: string;
  next: string;
  back: string;
  skip: string;
  retry: string;
  
  // Authentication
  signIn: string;
  signUp: string;
  signOut: string;
  email: string;
  password: string;
  name: string;
  forgotPassword: string;
  createAccount: string;
  welcomeBack: string;
  getStarted: string;
  
  // Onboarding
  welcome: string;
  chooseLanguage: string;
  selectNativeLanguage: string;
  selectTargetLanguage: string;
  setLearningGoals: string;
  dailyGoal: string;
  weeklyGoal: string;
  
  // Learning
  lesson: string;
  lessons: PluralizedString;
  exercise: string;
  exercises: PluralizedString;
  vocabulary: string;
  grammar: string;
  speaking: string;
  listening: string;
  reading: string;
  writing: string;
  
  // Progress
  xp: string;
  level: string;
  streak: string;
  accuracy: string;
  wordsLearned: PluralizedString;
  lessonsCompleted: PluralizedString;
  timeSpent: string;
  
  // Gamification
  achievements: string;
  badges: string;
  coins: string;
  gems: string;
  hearts: string;
  league: string;
  challenges: string;
  
  // Notifications
  dailyReminder: string;
  streakRisk: string;
  newAchievement: string;
  challengeInvite: string;
  friendActivity: string;
  reviewTime: string;
  youHave: string;
  itemsReady: PluralizedString;
  
  // Errors
  errorGeneral: string;
  errorNetwork: string;
  errorAuth: string;
  errorNotFound: string;
  
  // Success messages
  successSaved: string;
  successCompleted: string;
  successLevelUp: string;
  
  // Time
  today: string;
  yesterday: string;
  thisWeek: string;
  thisMonth: string;
  
  // Units
  minutes: PluralizedString;
  hours: PluralizedString;
  days: PluralizedString;
  weeks: PluralizedString;
  
  // Exercise specific
  tapToFlip: string;
  howWellDidYouKnow: string;
  hard: string;
  good: string;
  easy: string;
  hint: string;
  getHint: string;
  typeYourAnswer: string;
  correctAnswer: string;
  error: string;
  failedToAnalyze: string;
  listen: string;
  recording: string;
  recorded: string;
  record: string;
  analyzePronunciation: string;
  greatJob: string;
  pronunciationAnalyzed: string;
  
  // Accessibility
  accessibility: {
    closeButton: string;
    menuButton: string;
    backButton: string;
    nextButton: string;
    selectLanguage: string;
    selectLevel: string;
    selectGoal: string;
    selectCommitment: string;
    selectPreferences: string;
    completeSetup: string;
  };
}

// Pluralized string interface
export interface PluralizedString {
  one: string;
  other: string;
  few?: string;
  many?: string;
  zero?: string;
}

// English translations (default)
const en: TranslationKeys = {
  // Navigation
  home: 'Home',
  profile: 'Profile',
  leaderboard: 'Leaderboard',
  shop: 'Shop',
  settings: 'Settings',
  
  // Common actions
  continue: 'Continue',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  done: 'Done',
  next: 'Next',
  back: 'Back',
  skip: 'Skip',
  retry: 'Retry',
  
  // Authentication
  signIn: 'Sign In',
  signUp: 'Sign Up',
  signOut: 'Sign Out',
  email: 'Email',
  password: 'Password',
  name: 'Name',
  forgotPassword: 'Forgot Password?',
  createAccount: 'Create Account',
  welcomeBack: 'Welcome Back!',
  getStarted: 'Get Started',
  
  // Onboarding
  welcome: 'Welcome to LinguApp!',
  chooseLanguage: 'Choose Language',
  selectNativeLanguage: 'Select your native language',
  selectTargetLanguage: 'Select language to learn',
  setLearningGoals: 'Set your learning goals',
  dailyGoal: 'Daily Goal',
  weeklyGoal: 'Weekly Goal',
  
  // Learning
  lesson: 'Lesson',
  lessons: { one: 'Lesson', other: 'Lessons' },
  exercise: 'Exercise',
  exercises: { one: 'Exercise', other: 'Exercises' },
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  speaking: 'Speaking',
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  
  // Progress
  xp: 'XP',
  level: 'Level',
  streak: 'Streak',
  accuracy: 'Accuracy',
  wordsLearned: { one: 'Word Learned', other: 'Words Learned' },
  lessonsCompleted: { one: 'Lesson Completed', other: 'Lessons Completed' },
  timeSpent: 'Time Spent',
  
  // Gamification
  achievements: 'Achievements',
  badges: 'Badges',
  coins: 'Coins',
  gems: 'Gems',
  hearts: 'Hearts',
  league: 'League',
  challenges: 'Challenges',
  
  // Notifications
  dailyReminder: 'Time for your daily lesson!',
  streakRisk: 'Don\'t lose your streak!',
  newAchievement: 'New achievement unlocked!',
  challengeInvite: 'You have a new challenge!',
  friendActivity: 'Friend Activity',
  reviewTime: 'Review Time!',
  youHave: 'You have',
  itemsReady: { one: 'item ready for', other: 'items ready for' },
  
  // Errors
  errorGeneral: 'Something went wrong. Please try again.',
  errorNetwork: 'Network error. Check your connection.',
  errorAuth: 'Authentication failed. Please try again.',
  errorNotFound: 'Content not found.',
  
  // Success messages
  successSaved: 'Changes saved successfully!',
  successCompleted: 'Completed successfully!',
  successLevelUp: 'Level up! Great job!',
  
  // Time
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  
  // Units
  minutes: { one: 'minute', other: 'minutes' },
  hours: { one: 'hour', other: 'hours' },
  days: { one: 'day', other: 'days' },
  weeks: { one: 'week', other: 'weeks' },
  
  // Exercise specific
  tapToFlip: 'Tap to reveal answer',
  howWellDidYouKnow: 'How well did you know this?',
  hard: 'Hard',
  good: 'Good',
  easy: 'Easy',
  hint: 'Hint',
  getHint: 'Get Hint',
  typeYourAnswer: 'Type your answer here...',
  correctAnswer: 'Correct answer',
  error: 'Error',
  failedToAnalyze: 'Failed to analyze pronunciation',
  listen: 'Listen',
  recording: 'Recording...',
  recorded: 'Recorded',
  record: 'Record',
  analyzePronunciation: 'Analyze Pronunciation',
  greatJob: 'Great job!',
  pronunciationAnalyzed: 'Your pronunciation was analyzed. Keep practicing!',
  
  // Accessibility
  accessibility: {
    closeButton: 'Close',
    menuButton: 'Open menu',
    backButton: 'Go back',
    nextButton: 'Continue to next step',
    selectLanguage: 'Select language',
    selectLevel: 'Select your current level',
    selectGoal: 'Select your learning goals',
    selectCommitment: 'Select your daily commitment',
    selectPreferences: 'Select your learning preferences',
    completeSetup: 'Complete setup and start learning',
  },
};

// Spanish translations
const es: TranslationKeys = {
  // Navigation
  home: 'Inicio',
  profile: 'Perfil',
  leaderboard: 'Clasificación',
  shop: 'Tienda',
  settings: 'Configuración',
  
  // Common actions
  continue: 'Continuar',
  cancel: 'Cancelar',
  save: 'Guardar',
  delete: 'Eliminar',
  edit: 'Editar',
  done: 'Hecho',
  next: 'Siguiente',
  back: 'Atrás',
  skip: 'Omitir',
  retry: 'Reintentar',
  
  // Authentication
  signIn: 'Iniciar Sesión',
  signUp: 'Registrarse',
  signOut: 'Cerrar Sesión',
  email: 'Correo',
  password: 'Contraseña',
  name: 'Nombre',
  forgotPassword: '¿Olvidaste tu contraseña?',
  createAccount: 'Crear Cuenta',
  welcomeBack: '¡Bienvenido de vuelta!',
  getStarted: 'Comenzar',
  
  // Onboarding
  welcome: '¡Bienvenido a LinguApp!',
  chooseLanguage: 'Elegir Idioma',
  selectNativeLanguage: 'Selecciona tu idioma nativo',
  selectTargetLanguage: 'Selecciona el idioma a aprender',
  setLearningGoals: 'Establece tus objetivos de aprendizaje',
  dailyGoal: 'Objetivo Diario',
  weeklyGoal: 'Objetivo Semanal',
  
  // Learning
  lesson: 'Lección',
  lessons: { one: 'Lección', other: 'Lecciones' },
  exercise: 'Ejercicio',
  exercises: { one: 'Ejercicio', other: 'Ejercicios' },
  vocabulary: 'Vocabulario',
  grammar: 'Gramática',
  speaking: 'Hablar',
  listening: 'Escuchar',
  reading: 'Leer',
  writing: 'Escribir',
  
  // Progress
  xp: 'XP',
  level: 'Nivel',
  streak: 'Racha',
  accuracy: 'Precisión',
  wordsLearned: { one: 'Palabra Aprendida', other: 'Palabras Aprendidas' },
  lessonsCompleted: { one: 'Lección Completada', other: 'Lecciones Completadas' },
  timeSpent: 'Tiempo Dedicado',
  
  // Gamification
  achievements: 'Logros',
  badges: 'Insignias',
  coins: 'Monedas',
  gems: 'Gemas',
  hearts: 'Corazones',
  league: 'Liga',
  challenges: 'Desafíos',
  
  // Notifications
  dailyReminder: '¡Es hora de tu lección diaria!',
  streakRisk: '¡No pierdas tu racha!',
  newAchievement: '¡Nuevo logro desbloqueado!',
  challengeInvite: '¡Tienes un nuevo desafío!',
  friendActivity: 'Actividad de Amigos',
  reviewTime: '¡Hora de Repasar!',
  youHave: 'Tienes',
  itemsReady: { one: 'elemento listo para', other: 'elementos listos para' },
  
  // Errors
  errorGeneral: 'Algo salió mal. Inténtalo de nuevo.',
  errorNetwork: 'Error de red. Verifica tu conexión.',
  errorAuth: 'Autenticación fallida. Inténtalo de nuevo.',
  errorNotFound: 'Contenido no encontrado.',
  
  // Success messages
  successSaved: '¡Cambios guardados exitosamente!',
  successCompleted: '¡Completado exitosamente!',
  successLevelUp: '¡Subiste de nivel! ¡Buen trabajo!',
  
  // Time
  today: 'Hoy',
  yesterday: 'Ayer',
  thisWeek: 'Esta Semana',
  thisMonth: 'Este Mes',
  
  // Units
  minutes: { one: 'minuto', other: 'minutos' },
  hours: { one: 'hora', other: 'horas' },
  days: { one: 'día', other: 'días' },
  weeks: { one: 'semana', other: 'semanas' },
  
  // Exercise specific
  tapToFlip: 'Toca para revelar la respuesta',
  howWellDidYouKnow: '¿Qué tan bien sabías esto?',
  hard: 'Difícil',
  good: 'Bien',
  easy: 'Fácil',
  hint: 'Pista',
  getHint: 'Obtener Pista',
  typeYourAnswer: 'Escribe tu respuesta aquí...',
  correctAnswer: 'Respuesta correcta',
  error: 'Error',
  failedToAnalyze: 'Error al analizar la pronunciación',
  listen: 'Escuchar',
  recording: 'Grabando...',
  recorded: 'Grabado',
  record: 'Grabar',
  analyzePronunciation: 'Analizar Pronunciación',
  greatJob: '¡Excelente trabajo!',
  pronunciationAnalyzed: 'Tu pronunciación fue analizada. ¡Sigue practicando!',
  
  // Accessibility
  accessibility: {
    closeButton: 'Cerrar',
    menuButton: 'Abrir menú',
    backButton: 'Volver',
    nextButton: 'Continuar al siguiente paso',
    selectLanguage: 'Seleccionar idioma',
    selectLevel: 'Seleccionar tu nivel actual',
    selectGoal: 'Seleccionar tus objetivos de aprendizaje',
    selectCommitment: 'Seleccionar tu compromiso diario',
    selectPreferences: 'Seleccionar tus preferencias de aprendizaje',
    completeSetup: 'Completar configuración y comenzar a aprender',
  },
};

// French translations
const fr: TranslationKeys = {
  // Navigation
  home: 'Accueil',
  profile: 'Profil',
  leaderboard: 'Classement',
  shop: 'Boutique',
  settings: 'Paramètres',
  
  // Common actions
  continue: 'Continuer',
  cancel: 'Annuler',
  save: 'Enregistrer',
  delete: 'Supprimer',
  edit: 'Modifier',
  done: 'Terminé',
  next: 'Suivant',
  back: 'Retour',
  skip: 'Passer',
  retry: 'Réessayer',
  
  // Authentication
  signIn: 'Se connecter',
  signUp: 'S\'inscrire',
  signOut: 'Se déconnecter',
  email: 'Email',
  password: 'Mot de passe',
  name: 'Nom',
  forgotPassword: 'Mot de passe oublié ?',
  createAccount: 'Créer un compte',
  welcomeBack: 'Bon retour !',
  getStarted: 'Commencer',
  
  // Onboarding
  welcome: 'Bienvenue sur LinguApp !',
  chooseLanguage: 'Choisir la langue',
  selectNativeLanguage: 'Sélectionnez votre langue maternelle',
  selectTargetLanguage: 'Sélectionnez la langue à apprendre',
  setLearningGoals: 'Définissez vos objectifs d\'apprentissage',
  dailyGoal: 'Objectif quotidien',
  weeklyGoal: 'Objectif hebdomadaire',
  
  // Learning
  lesson: 'Leçon',
  lessons: { one: 'Leçon', other: 'Leçons' },
  exercise: 'Exercice',
  exercises: { one: 'Exercice', other: 'Exercices' },
  vocabulary: 'Vocabulaire',
  grammar: 'Grammaire',
  speaking: 'Parler',
  listening: 'Écouter',
  reading: 'Lire',
  writing: 'Écrire',
  
  // Progress
  xp: 'XP',
  level: 'Niveau',
  streak: 'Série',
  accuracy: 'Précision',
  wordsLearned: { one: 'Mot appris', other: 'Mots appris' },
  lessonsCompleted: { one: 'Leçon terminée', other: 'Leçons terminées' },
  timeSpent: 'Temps passé',
  
  // Gamification
  achievements: 'Succès',
  badges: 'Badges',
  coins: 'Pièces',
  gems: 'Gemmes',
  hearts: 'Cœurs',
  league: 'Ligue',
  challenges: 'Défis',
  
  // Notifications
  dailyReminder: 'C\'est l\'heure de votre leçon quotidienne !',
  streakRisk: 'Ne perdez pas votre série !',
  newAchievement: 'Nouveau succès débloqué !',
  challengeInvite: 'Vous avez un nouveau défi !',
  friendActivity: 'Activité des amis',
  reviewTime: 'C\'est l\'heure de réviser !',
  youHave: 'Vous avez',
  itemsReady: { one: 'élément prêt pour', other: 'éléments prêts pour' },
  
  // Errors
  errorGeneral: 'Une erreur est survenue. Veuillez réessayer.',
  errorNetwork: 'Erreur réseau. Vérifiez votre connexion.',
  errorAuth: 'Échec de l\'authentification. Veuillez réessayer.',
  errorNotFound: 'Contenu non trouvé.',
  
  // Success messages
  successSaved: 'Modifications enregistrées avec succès !',
  successCompleted: 'Terminé avec succès !',
  successLevelUp: 'Niveau supérieur ! Excellent travail !',
  
  // Time
  today: 'Aujourd\'hui',
  yesterday: 'Hier',
  thisWeek: 'Cette semaine',
  thisMonth: 'Ce mois-ci',
  
  // Units
  minutes: { one: 'minute', other: 'minutes' },
  hours: { one: 'heure', other: 'heures' },
  days: { one: 'jour', other: 'jours' },
  weeks: { one: 'semaine', other: 'semaines' },
  
  // Exercise specific
  tapToFlip: 'Touchez pour révéler la réponse',
  howWellDidYouKnow: 'À quel point connaissiez-vous ceci ?',
  hard: 'Difficile',
  good: 'Bien',
  easy: 'Facile',
  hint: 'Indice',
  getHint: 'Obtenir un indice',
  typeYourAnswer: 'Tapez votre réponse ici...',
  correctAnswer: 'Réponse correcte',
  error: 'Erreur',
  failedToAnalyze: 'Échec de l\'analyse de la prononciation',
  listen: 'Écouter',
  recording: 'Enregistrement...',
  recorded: 'Enregistré',
  record: 'Enregistrer',
  analyzePronunciation: 'Analyser la prononciation',
  greatJob: 'Excellent travail !',
  pronunciationAnalyzed: 'Votre prononciation a été analysée. Continuez à pratiquer !',
  
  // Accessibility
  accessibility: {
    closeButton: 'Fermer',
    menuButton: 'Ouvrir le menu',
    backButton: 'Retourner',
    nextButton: 'Continuer à l\'étape suivante',
    selectLanguage: 'Sélectionner la langue',
    selectLevel: 'Sélectionnez votre niveau actuel',
    selectGoal: 'Sélectionnez vos objectifs d\'apprentissage',
    selectCommitment: 'Sélectionnez votre engagement quotidien',
    selectPreferences: 'Sélectionnez vos préférences d\'apprentissage',
    completeSetup: 'Terminer la configuration et commencer à apprendre',
  },
};

// Italian translations
const it: TranslationKeys = {
  // Navigation
  home: 'Home',
  profile: 'Profilo',
  leaderboard: 'Classifica',
  shop: 'Negozio',
  settings: 'Impostazioni',

  // Common actions
  continue: 'Continua',
  cancel: 'Annulla',
  save: 'Salva',
  delete: 'Elimina',
  edit: 'Modifica',
  done: 'Fatto',
  next: 'Avanti',
  back: 'Indietro',
  skip: 'Salta',
  retry: 'Riprova',

  // Authentication
  signIn: 'Accedi',
  signUp: 'Registrati',
  signOut: 'Esci',
  email: 'Email',
  password: 'Password',
  name: 'Nome',
  forgotPassword: 'Password dimenticata?',
  createAccount: 'Crea account',
  welcomeBack: 'Bentornato!',
  getStarted: 'Inizia',

  // Onboarding
  welcome: 'Benvenuto in LinguApp!',
  chooseLanguage: 'Scegli la lingua',
  selectNativeLanguage: 'Seleziona la tua lingua madre',
  selectTargetLanguage: 'Seleziona la lingua da imparare',
  setLearningGoals: 'Imposta i tuoi obiettivi di apprendimento',
  dailyGoal: 'Obiettivo giornaliero',
  weeklyGoal: 'Obiettivo settimanale',

  // Learning
  lesson: 'Lezione',
  lessons: { one: 'Lezione', other: 'Lezioni' },
  exercise: 'Esercizio',
  exercises: { one: 'Esercizio', other: 'Esercizi' },
  vocabulary: 'Vocabolario',
  grammar: 'Grammatica',
  speaking: 'Parlato',
  listening: 'Ascolto',
  reading: 'Lettura',
  writing: 'Scrittura',

  // Progress
  xp: 'XP',
  level: 'Livello',
  streak: 'Serie',
  accuracy: 'Precisione',
  wordsLearned: { one: 'Parola imparata', other: 'Parole imparate' },
  lessonsCompleted: { one: 'Lezione completata', other: 'Lezioni completate' },
  timeSpent: 'Tempo trascorso',

  // Gamification
  achievements: 'Obiettivi',
  badges: 'Distintivi',
  coins: 'Monete',
  gems: 'Gemme',
  hearts: 'Cuori',
  league: 'Lega',
  challenges: 'Sfide',

  // Notifications
  dailyReminder: 'È ora della tua lezione quotidiana!',
  streakRisk: 'Non perdere la tua serie!',
  newAchievement: 'Nuovo obiettivo sbloccato!',
  challengeInvite: 'Hai una nuova sfida!',
  friendActivity: 'Attività degli amici',
  reviewTime: 'È ora di ripassare!',
  youHave: 'Hai',
  itemsReady: { one: 'elemento pronto per', other: 'elementi pronti per' },

  // Errors
  errorGeneral: 'Qualcosa è andato storto. Per favore, riprova.',
  errorNetwork: 'Errore di rete. Controlla la tua connessione.',
  errorAuth: 'Autenticazione fallita. Per favore, riprova.',
  errorNotFound: 'Contenuto non trovato.',

  // Success messages
  successSaved: 'Modifiche salvate con successo!',
  successCompleted: 'Completato con successo!',
  successLevelUp: 'Aumento di livello! Ottimo lavoro!',

  // Time
  today: 'Oggi',
  yesterday: 'Ieri',
  thisWeek: 'Questa settimana',
  thisMonth: 'Questo mese',

  // Units
  minutes: { one: 'minuto', other: 'minuti' },
  hours: { one: 'ora', other: 'ore' },
  days: { one: 'giorno', other: 'giorni' },
  weeks: { one: 'settimana', other: 'settimane' },
  
  // Exercise specific
  tapToFlip: 'Tocca per rivelare la risposta',
  howWellDidYouKnow: 'Quanto bene conoscevi questo?',
  hard: 'Difficile',
  good: 'Bene',
  easy: 'Facile',
  hint: 'Suggerimento',
  getHint: 'Ottieni suggerimento',
  typeYourAnswer: 'Digita la tua risposta qui...',
  correctAnswer: 'Risposta corretta',
  error: 'Errore',
  failedToAnalyze: 'Impossibile analizzare la pronuncia',
  listen: 'Ascolta',
  recording: 'Registrazione...',
  recorded: 'Registrato',
  record: 'Registra',
  analyzePronunciation: 'Analizza pronuncia',
  greatJob: 'Ottimo lavoro!',
  pronunciationAnalyzed: 'La tua pronuncia è stata analizzata. Continua a praticare!',

  // Accessibility
  accessibility: {
    closeButton: 'Chiudi',
    menuButton: 'Apri menu',
    backButton: 'Torna indietro',
    nextButton: 'Continua al passaggio successivo',
    selectLanguage: 'Seleziona lingua',
    selectLevel: 'Seleziona il tuo livello attuale',
    selectGoal: 'Seleziona i tuoi obiettivi di apprendimento',
    selectCommitment: 'Seleziona il tuo impegno quotidiano',
    selectPreferences: 'Seleziona le tue preferenze di apprendimento',
    completeSetup: 'Completa la configurazione e inizia a imparare',
  },
};

// Chinese (Mandarin) translations
const zh: TranslationKeys = {
  // Navigation
  home: '首页',
  profile: '个人资料',
  leaderboard: '排行榜',
  shop: '商店',
  settings: '设置',

  // Common actions
  continue: '继续',
  cancel: '取消',
  save: '保存',
  delete: '删除',
  edit: '编辑',
  done: '完成',
  next: '下一步',
  back: '返回',
  skip: '跳过',
  retry: '重试',

  // Authentication
  signIn: '登录',
  signUp: '注册',
  signOut: '登出',
  email: '电子邮件',
  password: '密码',
  name: '姓名',
  forgotPassword: '忘记密码？',
  createAccount: '创建账户',
  welcomeBack: '欢迎回来！',
  getStarted: '开始',

  // Onboarding
  welcome: '欢迎来到 LinguApp！',
  chooseLanguage: '选择语言',
  selectNativeLanguage: '选择您的母语',
  selectTargetLanguage: '选择要学习的语言',
  setLearningGoals: '设定您的学习目标',
  dailyGoal: '每日目标',
  weeklyGoal: '每周目标',

  // Learning
  lesson: '课程',
  lessons: { one: '课程', other: '课程' },
  exercise: '练习',
  exercises: { one: '练习', other: '练习' },
  vocabulary: '词汇',
  grammar: '语法',
  speaking: '口语',
  listening: '听力',
  reading: '阅读',
  writing: '写作',

  // Progress
  xp: '经验值',
  level: '等级',
  streak: '连续记录',
  accuracy: '准确率',
  wordsLearned: { one: '已学单词', other: '已学单词' },
  lessonsCompleted: { one: '已完成课程', other: '已完成课程' },
  timeSpent: '学习时间',

  // Gamification
  achievements: '成就',
  badges: '徽章',
  coins: '金币',
  gems: '宝石',
  hearts: '红心',
  league: '联赛',
  challenges: '挑战',

  // Notifications
  dailyReminder: '是时候上您的每日课程了！',
  streakRisk: '不要中断您的连续记录！',
  newAchievement: '解锁新成就！',
  challengeInvite: '您有一个新挑战！',
  friendActivity: '好友动态',
  reviewTime: '复习时间到了！',
  youHave: '您有',
  itemsReady: { one: '个项目待复习', other: '个项目待复习' },

  // Errors
  errorGeneral: '出错了，请重试。',
  errorNetwork: '网络错误，请检查您的连接。',
  errorAuth: '认证失败，请重试。',
  errorNotFound: '未找到内容。',

  // Success messages
  successSaved: '更改已成功保存！',
  successCompleted: '成功完成！',
  successLevelUp: '升级了！干得好！',

  // Time
  today: '今天',
  yesterday: '昨天',
  thisWeek: '本周',
  thisMonth: '本月',

  // Units
  minutes: { one: '分钟', other: '分钟' },
  hours: { one: '小时', other: '小时' },
  days: { one: '天', other: '天' },
  weeks: { one: '周', other: '周' },
  
  // Exercise specific
  tapToFlip: '点击显示答案',
  howWellDidYouKnow: '您对此了解程度如何？',
  hard: '困难',
  good: '良好',
  easy: '简单',
  hint: '提示',
  getHint: '获取提示',
  typeYourAnswer: '在此输入您的答案...',
  correctAnswer: '正确答案',
  error: '错误',
  failedToAnalyze: '无法分析发音',
  listen: '听',
  recording: '录音中...',
  recorded: '已录音',
  record: '录音',
  analyzePronunciation: '分析发音',
  greatJob: '做得好！',
  pronunciationAnalyzed: '您的发音已被分析。继续练习！',

  // Accessibility
  accessibility: {
    closeButton: '关闭',
    menuButton: '打开菜单',
    backButton: '返回',
    nextButton: '继续下一步',
    selectLanguage: '选择语言',
    selectLevel: '选择您当前的水平',
    selectGoal: '选择您的学习目标',
    selectCommitment: '选择您的每日承诺',
    selectPreferences: '选择您的学习偏好',
    completeSetup: '完成设置并开始学习',
  },
};


// Croatian translations
const hr: TranslationKeys = {
  // Navigation
  home: 'Početna',
  profile: 'Profil',
  leaderboard: 'Ljestvica',
  shop: 'Trgovina',
  settings: 'Postavke',
  
  // Common actions
  continue: 'Nastavi',
  cancel: 'Otkaži',
  save: 'Spremi',
  delete: 'Obriši',
  edit: 'Uredi',
  done: 'Gotovo',
  next: 'Sljedeće',
  back: 'Natrag',
  skip: 'Preskoči',
  retry: 'Pokušaj ponovno',
  
  // Authentication
  signIn: 'Prijavi se',
  signUp: 'Registriraj se',
  signOut: 'Odjavi se',
  email: 'Email',
  password: 'Lozinka',
  name: 'Ime',
  forgotPassword: 'Zaboravili ste lozinku?',
  createAccount: 'Stvori račun',
  welcomeBack: 'Dobrodošli natrag!',
  getStarted: 'Počni',
  
  // Onboarding
  welcome: 'Dobrodošli u LinguApp!',
  chooseLanguage: 'Odaberi jezik',
  selectNativeLanguage: 'Odaberite svoj maternji jezik',
  selectTargetLanguage: 'Odaberite jezik koji želite učiti',
  setLearningGoals: 'Postavite svoje ciljeve učenja',
  dailyGoal: 'Dnevni cilj',
  weeklyGoal: 'Tjedni cilj',
  
  // Learning
  lesson: 'Lekcija',
  lessons: { one: 'Lekcija', few: 'Lekcije', other: 'Lekcija' },
  exercise: 'Vježba',
  exercises: { one: 'Vježba', few: 'Vježbe', other: 'Vježbi' },
  vocabulary: 'Rječnik',
  grammar: 'Gramatika',
  speaking: 'Govor',
  listening: 'Slušanje',
  reading: 'Čitanje',
  writing: 'Pisanje',
  
  // Progress
  xp: 'XP',
  level: 'Razina',
  streak: 'Niz',
  accuracy: 'Točnost',
  wordsLearned: { one: 'Naučena riječ', few: 'Naučene riječi', other: 'Naučenih riječi' },
  lessonsCompleted: { one: 'Završena lekcija', few: 'Završene lekcije', other: 'Završenih lekcija' },
  timeSpent: 'Provedeno vrijeme',
  
  // Gamification
  achievements: 'Postignuća',
  badges: 'Značke',
  coins: 'Novčići',
  gems: 'Dragulji',
  hearts: 'Srca',
  league: 'Liga',
  challenges: 'Izazovi',
  
  // Notifications
  dailyReminder: 'Vrijeme je za vašu dnevnu lekciju!',
  streakRisk: 'Ne izgubite svoj niz!',
  newAchievement: 'Novo postignuće otključano!',
  challengeInvite: 'Imate novi izazov!',
  friendActivity: 'Aktivnost Prijatelja',
  reviewTime: 'Vrijeme za Pregled!',
  youHave: 'Imate',
  itemsReady: { one: 'stavku spremnu za', few: 'stavke spremne za', other: 'stavki spremnih za' },
  
  // Errors
  errorGeneral: 'Nešto je pošlo po zlu. Pokušajte ponovno.',
  errorNetwork: 'Greška mreže. Provjerite vezu.',
  errorAuth: 'Autentifikacija neuspješna. Pokušajte ponovno.',
  errorNotFound: 'Sadržaj nije pronađen.',
  
  // Success messages
  successSaved: 'Promjene uspješno spremljene!',
  successCompleted: 'Uspješno završeno!',
  successLevelUp: 'Napredovali ste! Odličan posao!',
  
  // Time
  today: 'Danas',
  yesterday: 'Jučer',
  thisWeek: 'Ovaj tjedan',
  thisMonth: 'Ovaj mjesec',
  
  // Units
  minutes: { one: 'minutu', few: 'minute', other: 'minuta' },
  hours: { one: 'sat', few: 'sata', other: 'sati' },
  days: { one: 'dan', few: 'dana', other: 'dana' },
  weeks: { one: 'tjedan', few: 'tjedna', other: 'tjedana' },
  
  // Exercise specific
  tapToFlip: 'Dodirnite da otkrijete odgovor',
  howWellDidYouKnow: 'Koliko dobro ste ovo znali?',
  hard: 'Teško',
  good: 'Dobro',
  easy: 'Lako',
  hint: 'Savjet',
  getHint: 'Dobij savjet',
  typeYourAnswer: 'Unesite svoj odgovor ovdje...',
  correctAnswer: 'Točan odgovor',
  error: 'Greška',
  failedToAnalyze: 'Neuspjeh analize izgovora',
  listen: 'Slušaj',
  recording: 'Snimanje...',
  recorded: 'Snimljeno',
  record: 'Snimi',
  analyzePronunciation: 'Analiziraj izgovor',
  greatJob: 'Odličan posao!',
  pronunciationAnalyzed: 'Vaš izgovor je analiziran. Nastavite vježbati!',
  
  // Accessibility
  accessibility: {
    closeButton: 'Zatvori',
    menuButton: 'Otvori izbornik',
    backButton: 'Idi natrag',
    nextButton: 'Nastavi na sljedeći korak',
    selectLanguage: 'Odaberi jezik',
    selectLevel: 'Odaberi svoju trenutnu razinu',
    selectGoal: 'Odaberi svoje ciljeve učenja',
    selectCommitment: 'Odaberi svoju dnevnu obvezu',
    selectPreferences: 'Odaberi svoje preferencije učenja',
    completeSetup: 'Završi postavljanje i počni učiti',
  },
};

// Translation dictionary
const translations: Record<string, TranslationKeys> = {
  en,
  es,
  hr,
  fr,
  it,
  zh,
};

// Enhanced i18n class
export class I18nService {
  private currentLanguage: string = 'en';
  private fallbackLanguage: string = 'en';

  constructor(initialLanguage: string = 'en') {
    this.currentLanguage = initialLanguage;
  }

  // Set current language
  setLanguage(languageCode: string): void {
    if (this.hasTranslations(languageCode)) {
      this.currentLanguage = languageCode;
    } else {
      console.warn(`Language ${languageCode} not available, falling back to ${this.fallbackLanguage}`);
      this.currentLanguage = this.fallbackLanguage;
    }
  }

  // Get current language
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  // Check if language is RTL
  isRTL(): boolean {
    return RTL_LANGUAGES.includes(this.currentLanguage);
  }

  // Get text direction
  getTextDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }

  // Get translation with fallback
  t(key: keyof TranslationKeys): string {
    const translations = this.getTranslations();
    const value = translations[key];
    
    if (typeof value === 'string') {
      return value;
    }
    
    // Fallback to English if translation not found
    const fallbackTranslations = this.getTranslations(this.fallbackLanguage);
    const fallbackValue = fallbackTranslations[key];
    
    if (typeof fallbackValue === 'string') {
      return fallbackValue;
    }
    
    return key as string;
  }

  // Get pluralized translation
  tPlural(key: keyof TranslationKeys, count: number): string {
    const translations = this.getTranslations();
    const value = translations[key];
    
    if (typeof value === 'object' && value !== null && 'one' in value) {
      const pluralForm = this.getPluralForm(count);
      return (value as PluralizedString)[pluralForm] || (value as PluralizedString).other;
    }
    
    return this.t(key);
  }

  // Get plural form for current language
  private getPluralForm(count: number): keyof PluralizedString {
    const rule = PLURAL_RULES[this.currentLanguage];
    if (rule) {
      return rule(count) as keyof PluralizedString;
    }
    return count === 1 ? 'one' : 'other';
  }

  // Get translations for specific language
  private getTranslations(languageCode?: string): TranslationKeys {
    const code = languageCode || this.currentLanguage;
    return translations[code] || translations[this.fallbackLanguage];
  }

  // Check if language has translations
  hasTranslations(languageCode: string): boolean {
    return languageCode in translations;
  }

  // Get available languages
  getAvailableLanguages(): string[] {
    return Object.keys(translations);
  }

  // Get accessibility text
  accessibility(key: keyof TranslationKeys['accessibility']): string {
    const translations = this.getTranslations();
    return translations.accessibility[key];
  }
}

// Global i18n instance
export const i18n = new I18nService();

// Helper functions for backward compatibility
export const getTranslations = (languageCode: string): TranslationKeys => {
  try {
    return translations[languageCode] || translations.en || translations.en;
  } catch (error) {
    console.warn('Failed to get translations for language:', languageCode, error);
    return translations.en;
  }
};

export const getAvailableTranslationLanguages = (): Language[] => {
  const availableCodes = Object.keys(translations);
  return languages.filter(lang => availableCodes.includes(lang.code));
};

export const hasTranslations = (languageCode: string): boolean => {
  return languageCode in translations;
};

export const t = (key: keyof TranslationKeys, languageCode: string): string => {
  try {
    const translations = getTranslations(languageCode);
    const value = translations[key];
    return typeof value === 'string' ? value : (getTranslations('en')[key] as string) || key;
  } catch (error) {
    console.warn('Failed to get translation for key:', key, 'language:', languageCode, error);
    return key as string;
  }
};

export default translations;
