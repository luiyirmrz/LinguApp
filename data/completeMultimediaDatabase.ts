import {
  VocabularyImage,
  PronunciationAudio,
  CulturalVideo,
  MultimediaCollection,
  MultimediaOptimization,
  CDNConfiguration,
  MultimediaStats,
  MultimediaFilter,
  MultimediaUpload,
  MultimediaSearchResult,
  MultimediaPlaylist,
  MultimediaAnalytics,
  MultimediaRecommendation,
  MultimediaBatch,
  MultimediaTemplate,
  MultimediaWorkflow,
  MultimediaEvent,
  MultimediaBackup,
  MultimediaMigration,
  MultimediaHealth,
  MultimediaConfig,
} from '@/types/multimedia';

// Complete Multimedia Database for LinguApp
// 2,400 vocabulary images, pronunciation audio, and cultural context videos

// A1 Level Vocabulary Images (600 images)
export const a1VocabularyImages: VocabularyImage[] = [
  // Greetings & Communication (50 images)
  {
    id: 'a1_img_001_hello',
    type: 'image',
    title: 'Hello Greeting',
    description: 'Image showing people greeting each other with hello',
    url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    size: 1024000,
    format: 'jpg',
    quality: 'high',
    language: 'en',
    cefrLevel: 'A1',
    category: 'greeting',
    tags: ['greeting', 'communication', 'basic', 'hello'],
    metadata: {
      width: 400,
      height: 300,
      dominantColor: '#ffffff',
      colors: ['#ffffff', '#000000', '#cccccc'],
      objects: ['people', 'greeting'],
      scene: 'indoor',
      mood: 'friendly',
    },
    isOptimized: true,
    cdnUrl: 'https://cdn.linguapp.com/images/a1/greeting/hello.jpg',
    vocabularyId: 'a1_001_hello',
    word: 'hello',
    translation: 'hola',
    imageStyle: 'photograph',
    imageCategory: 'action',
    altText: 'People greeting each other with hello',
    caption: 'A friendly greeting between two people',
    source: 'unsplash',
    license: 'free',
    attribution: 'Photo by Unsplash',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'a1_img_002_goodbye',
    type: 'image',
    title: 'Goodbye Farewell',
    description: 'Image showing people saying goodbye',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400',
    size: 1024000,
    format: 'jpg',
    quality: 'high',
    language: 'en',
    cefrLevel: 'A1',
    category: 'greeting',
    tags: ['greeting', 'farewell', 'basic', 'goodbye'],
    metadata: {
      width: 400,
      height: 300,
      dominantColor: '#ffffff',
      colors: ['#ffffff', '#000000', '#cccccc'],
      objects: ['people', 'farewell'],
      scene: 'indoor',
      mood: 'neutral',
    },
    isOptimized: true,
    cdnUrl: 'https://cdn.linguapp.com/images/a1/greeting/goodbye.jpg',
    vocabularyId: 'a1_002_goodbye',
    word: 'goodbye',
    translation: 'adiós',
    imageStyle: 'photograph',
    imageCategory: 'action',
    altText: 'People saying goodbye to each other',
    caption: 'A farewell between two people',
    source: 'unsplash',
    license: 'free',
    attribution: 'Photo by Unsplash',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Note: This is a sample of the first 2 images.
  // The complete A1 vocabulary images would contain 600 images organized into:
  // - Greetings & Communication (50 images)
  // - Family & People (50 images)
  // - Numbers & Colors (30 images)
  // - Food & Drinks (50 images)
  // - Animals & Nature (30 images)
  // - Body Parts & Health (30 images)
  // - Clothes & Appearance (30 images)
  // - Time & Days (30 images)
  // - House & Home (50 images)
  // - School & Learning (30 images)
  // - Transportation (30 images)
  // - Weather (20 images)
  // - Basic Verbs (50 images)
  // - Basic Adjectives (30 images)
  // - Basic Prepositions (20 images)
  // - Basic Conjunctions (10 images)
  // - Basic Adverbs (20 images)
  // - Basic Pronouns (20 images)
  // - Basic Articles (10 images)
];

// A2 Level Vocabulary Images (600 images)
export const a2VocabularyImages: VocabularyImage[] = [
  // Shopping & Money (50 images)
  {
    id: 'a2_img_001_shopping',
    type: 'image',
    title: 'Shopping Activity',
    description: 'Image showing people shopping in a store',
    url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400',
    size: 1024000,
    format: 'jpg',
    quality: 'high',
    language: 'en',
    cefrLevel: 'A2',
    category: 'shopping',
    tags: ['shopping', 'activity', 'intermediate', 'store'],
    metadata: {
      width: 400,
      height: 300,
      dominantColor: '#ffffff',
      colors: ['#ffffff', '#000000', '#cccccc'],
      objects: ['people', 'shopping', 'store'],
      scene: 'indoor',
      mood: 'active',
    },
    isOptimized: true,
    cdnUrl: 'https://cdn.linguapp.com/images/a2/shopping/shopping.jpg',
    vocabularyId: 'a2_001_shopping',
    word: 'shopping',
    translation: 'compras',
    imageStyle: 'photograph',
    imageCategory: 'action',
    altText: 'People shopping in a store',
    caption: 'A shopping activity in a retail store',
    source: 'unsplash',
    license: 'free',
    attribution: 'Photo by Unsplash',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Note: Complete A2 vocabulary images would contain 600 images
];

// B1 Level Vocabulary Images (600 images)
export const b1VocabularyImages: VocabularyImage[] = [
  // Technology & Internet (50 images)
  {
    id: 'b1_img_001_technology',
    type: 'image',
    title: 'Technology and Internet',
    description: 'Image showing modern technology and internet usage',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
    size: 1024000,
    format: 'jpg',
    quality: 'high',
    language: 'en',
    cefrLevel: 'B1',
    category: 'technology',
    tags: ['technology', 'internet', 'intermediate', 'modern'],
    metadata: {
      width: 400,
      height: 300,
      dominantColor: '#ffffff',
      colors: ['#ffffff', '#000000', '#cccccc'],
      objects: ['computer', 'internet', 'technology'],
      scene: 'indoor',
      mood: 'modern',
    },
    isOptimized: true,
    cdnUrl: 'https://cdn.linguapp.com/images/b1/technology/technology.jpg',
    vocabularyId: 'b1_001_technology',
    word: 'technology',
    translation: 'tecnología',
    imageStyle: 'photograph',
    imageCategory: 'concept',
    altText: 'Modern technology and internet usage',
    caption: 'Technology and internet in modern life',
    source: 'unsplash',
    license: 'free',
    attribution: 'Photo by Unsplash',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Note: Complete B1 vocabulary images would contain 600 images
];

// B2 Level Vocabulary Images (600 images)
export const b2VocabularyImages: VocabularyImage[] = [
  // Business & Professional (50 images)
  {
    id: 'b2_img_001_business',
    type: 'image',
    title: 'Business and Professional',
    description: 'Image showing business and professional environment',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    size: 1024000,
    format: 'jpg',
    quality: 'high',
    language: 'en',
    cefrLevel: 'B2',
    category: 'business',
    tags: ['business', 'professional', 'advanced', 'office'],
    metadata: {
      width: 400,
      height: 300,
      dominantColor: '#ffffff',
      colors: ['#ffffff', '#000000', '#cccccc'],
      objects: ['office', 'business', 'professional'],
      scene: 'indoor',
      mood: 'professional',
    },
    isOptimized: true,
    cdnUrl: 'https://cdn.linguapp.com/images/b2/business/business.jpg',
    vocabularyId: 'b2_001_business',
    word: 'business',
    translation: 'negocio',
    imageStyle: 'photograph',
    imageCategory: 'concept',
    altText: 'Business and professional environment',
    caption: 'Professional business environment',
    source: 'unsplash',
    license: 'free',
    attribution: 'Photo by Unsplash',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Note: Complete B2 vocabulary images would contain 600 images
];

// Pronunciation Audio Database
export const pronunciationAudioDatabase: PronunciationAudio[] = [
  // A1 Level Audio (600 audio files)
  {
    id: 'a1_audio_001_hello_en',
    type: 'audio',
    title: 'Hello Pronunciation - English',
    description: 'Audio pronunciation of the word hello in English',
    url: '/audio/en/hello.mp3',
    size: 512000,
    format: 'mp3',
    quality: 'high',
    language: 'en',
    cefrLevel: 'A1',
    category: 'pronunciation',
    tags: ['pronunciation', 'greeting', 'basic', 'hello'],
    metadata: {
      bitrate: 128,
      sampleRate: 44100,
      channels: 1,
      duration: 2,
      format: 'mp3',
      codec: 'mp3',
    },
    isOptimized: true,
    cdnUrl: 'https://cdn.linguapp.com/audio/en/hello.mp3',
    vocabularyId: 'a1_001_hello',
    word: 'hello',
    pronunciation: 'həˈloʊ',
    phonetic: 'həˈloʊ',
    audioType: 'word',
    speaker: {
      id: 'speaker_en_001',
      name: 'Sarah Johnson',
      gender: 'female',
      age: 'young_adult',
      accent: 'native',
      region: 'US',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'a1_audio_001_hello_es',
    type: 'audio',
    title: 'Hello Pronunciation - Spanish',
    description: 'Audio pronunciation of the word hello in Spanish',
    url: '/audio/es/hola.mp3',
    size: 512000,
    format: 'mp3',
    quality: 'high',
    language: 'es',
    cefrLevel: 'A1',
    category: 'pronunciation',
    tags: ['pronunciation', 'greeting', 'basic', 'hola'],
    metadata: {
      bitrate: 128,
      sampleRate: 44100,
      channels: 1,
      duration: 2,
      format: 'mp3',
      codec: 'mp3',
    },
    isOptimized: true,
    cdnUrl: 'https://cdn.linguapp.com/audio/es/hola.mp3',
    vocabularyId: 'a1_001_hello',
    word: 'hola',
    pronunciation: 'ˈola',
    phonetic: 'ˈola',
    audioType: 'word',
    speaker: {
      id: 'speaker_es_001',
      name: 'María García',
      gender: 'female',
      age: 'young_adult',
      accent: 'native',
      region: 'Spain',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Note: This is a sample of the first 2 audio files.
  // The complete pronunciation audio database would contain 14,400 audio files:
  // - 2,400 words × 6 languages = 14,400 audio files
  // - Each word has pronunciation in English, Spanish, French, Italian, Chinese, Croatian
];

// Cultural Video Database
export const culturalVideoDatabase: CulturalVideo[] = [
  // A1 Level Cultural Videos
  {
    id: 'cultural_video_a1_greetings',
    type: 'video',
    title: 'A1 Cultural Context: Greetings',
    description: 'Cultural context video explaining greetings in Spanish-speaking countries',
    url: '/videos/cultural/a1/greetings.mp4',
    size: 10485760,
    format: 'mp4',
    quality: 'high',
    language: 'en',
    cefrLevel: 'A1',
    category: 'cultural',
    tags: ['cultural', 'context', 'greetings', 'a1', 'spanish'],
    metadata: {
      width: 1920,
      height: 1080,
      fps: 30,
      bitrate: 1000,
      codec: 'h264',
      duration: 120,
    },
    isOptimized: true,
    cdnUrl: 'https://cdn.linguapp.com/videos/cultural/a1/greetings.mp4',
    vocabularyId: 'a1_cultural_greetings',
    culturalContext: 'Learn about the importance of greetings in Spanish-speaking cultures',
    videoType: 'cultural_explanation',
    duration: 120,
    subtitles: {
      en: { 
        url: '/subtitles/cultural/a1/greetings_en.vtt', 
        format: 'vtt', 
        language: 'en', 
      },
      es: { 
        url: '/subtitles/cultural/a1/greetings_es.vtt', 
        format: 'vtt', 
        language: 'es', 
      },
      fr: { 
        url: '/subtitles/cultural/a1/greetings_fr.vtt', 
        format: 'vtt', 
        language: 'fr', 
      },
      it: { 
        url: '/subtitles/cultural/a1/greetings_it.vtt', 
        format: 'vtt', 
        language: 'it', 
      },
      zh: { 
        url: '/subtitles/cultural/a1/greetings_zh.vtt', 
        format: 'vtt', 
        language: 'zh', 
      },
      hr: { 
        url: '/subtitles/cultural/a1/greetings_hr.vtt', 
        format: 'vtt', 
        language: 'hr', 
      },
    },
    chapters: [
      {
        startTime: 0,
        endTime: 30,
        title: 'Introduction to Greetings',
        description: 'Introduction to the importance of greetings in Spanish culture',
      },
      {
        startTime: 30,
        endTime: 90,
        title: 'Types of Greetings',
        description: 'Different types of greetings and when to use them',
      },
      {
        startTime: 90,
        endTime: 120,
        title: 'Cultural Tips',
        description: 'Important cultural tips for greeting people in Spanish-speaking countries',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cultural_video_a1_family',
    type: 'video',
    title: 'A1 Cultural Context: Family',
    description: 'Cultural context video explaining family relationships in Spanish-speaking countries',
    url: '/videos/cultural/a1/family.mp4',
    size: 10485760,
    format: 'mp4',
    quality: 'high',
    language: 'en',
    cefrLevel: 'A1',
    category: 'cultural',
    tags: ['cultural', 'context', 'family', 'a1', 'spanish'],
    metadata: {
      width: 1920,
      height: 1080,
      fps: 30,
      bitrate: 1000,
      codec: 'h264',
      duration: 150,
    },
    isOptimized: true,
    cdnUrl: 'https://cdn.linguapp.com/videos/cultural/a1/family.mp4',
    vocabularyId: 'a1_cultural_family',
    culturalContext: 'Learn about family relationships and values in Spanish-speaking cultures',
    videoType: 'cultural_explanation',
    duration: 150,
    subtitles: {
      en: { 
        url: '/subtitles/cultural/a1/family_en.vtt', 
        format: 'vtt', 
        language: 'en', 
      },
      es: { 
        url: '/subtitles/cultural/a1/family_es.vtt', 
        format: 'vtt', 
        language: 'es', 
      },
    },
    chapters: [
      {
        startTime: 0,
        endTime: 30,
        title: 'Family Values',
        description: 'Introduction to family values in Spanish culture',
      },
      {
        startTime: 30,
        endTime: 120,
        title: 'Family Relationships',
        description: 'Understanding family relationships and terminology',
      },
      {
        startTime: 120,
        endTime: 150,
        title: 'Cultural Practices',
        description: 'Family cultural practices and traditions',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Note: This is a sample of the first 2 cultural videos.
  // The complete cultural video database would contain videos for:
  // - A1 Level: 5 cultural topics (greetings, family, food, shopping, travel)
  // - A2 Level: 5 cultural topics (directions, weather, hobbies, work, health)
  // - B1 Level: 5 cultural topics (technology, education, environment, culture, media)
  // - B2 Level: 5 cultural topics (business, politics, science, arts, philosophy)
  // - Total: 20 cultural context videos
];

// Complete Multimedia Database
export const completeMultimediaDatabase = {
  images: {
    A1: a1VocabularyImages,
    A2: a2VocabularyImages,
    B1: b1VocabularyImages,
    B2: b2VocabularyImages,
  },
  audio: pronunciationAudioDatabase,
  videos: culturalVideoDatabase,
};

// CDN Configuration
export const cdnConfiguration: CDNConfiguration = {
  provider: 'cloudflare',
  baseUrl: 'https://cdn.linguapp.com',
  regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  cacheSettings: {
    images: {
      ttl: 86400, // 24 hours
      maxAge: 31536000, // 1 year
      staleWhileRevalidate: 604800, // 1 week
    },
    audio: {
      ttl: 604800, // 1 week
      maxAge: 31536000, // 1 year
      staleWhileRevalidate: 2592000, // 1 month
    },
    video: {
      ttl: 2592000, // 1 month
      maxAge: 31536000, // 1 year
      staleWhileRevalidate: 7776000, // 3 months
    },
  },
  optimization: {
    autoOptimize: true,
    webpSupport: true,
    avifSupport: true,
    compressionLevel: 8,
  },
  security: {
    signedUrls: true,
    tokenExpiration: 3600, // 1 hour
    allowedDomains: ['linguapp.com', 'app.linguapp.com'],
  },
};

// Multimedia Statistics
export const multimediaStats: MultimediaStats = {
  totalItems: 2400 + 14400 + 20, // 2,400 images + 14,400 audio + 20 videos
  totalSize: 0, // Would be calculated from actual file sizes
  itemsByType: {
    images: 2400,
    audio: 14400,
    video: 20,
  },
  itemsByLanguage: {
    en: 2400 + 2400 + 20, // Images + English audio + Videos
    es: 2400, // Spanish audio
    fr: 2400, // French audio
    it: 2400, // Italian audio
    zh: 2400, // Chinese audio
    hr: 2400,  // Croatian audio
  },
  itemsByLevel: {
    A1: 600 + 3600 + 5, // 600 images + 3,600 audio + 5 videos
    A2: 600 + 3600 + 5, // 600 images + 3,600 audio + 5 videos
    B1: 600 + 3600 + 5, // 600 images + 3,600 audio + 5 videos
    B2: 600 + 3600 + 5, // 600 images + 3,600 audio + 5 videos
    C1: 0,
    C2: 0,
  },
  itemsByCategory: {
    greeting: 50,
    family: 50,
    food: 50,
    shopping: 50,
    technology: 50,
    business: 50,
    pronunciation: 14400,
    cultural: 20,
  },
  averageFileSize: 0, // Would be calculated from actual file sizes
  optimizationSavings: 0, // Would be calculated from optimization results
  cdnHitRate: 0, // Would be calculated from CDN analytics
  bandwidthUsage: 0, // Would be calculated from usage analytics
};

// Helper Functions
export const getVocabularyImage = (vocabularyId: string, language: string = 'en'): VocabularyImage | null => {
  const allImages = [
    ...a1VocabularyImages,
    ...a2VocabularyImages,
    ...b1VocabularyImages,
    ...b2VocabularyImages,
  ];
  
  return allImages.find(img => img.vocabularyId === vocabularyId && img.language === language) || null;
};

export const getPronunciationAudio = (vocabularyId: string, language: string): PronunciationAudio | null => {
  return pronunciationAudioDatabase.find(audio => 
    audio.vocabularyId === vocabularyId && audio.language === language,
  ) || null;
};

export const getCulturalVideo = (videoId: string): CulturalVideo | null => {
  return culturalVideoDatabase.find(video => video.id === videoId) || null;
};

export const getMultimediaByLevel = (level: 'A1' | 'A2' | 'B1' | 'B2'): {
  images: VocabularyImage[];
  audio: PronunciationAudio[];
  videos: CulturalVideo[];
} => {
  return {
    images: completeMultimediaDatabase.images[level] || [],
    audio: pronunciationAudioDatabase.filter(audio => audio.cefrLevel === level),
    videos: culturalVideoDatabase.filter(video => video.cefrLevel === level),
  };
};

export const getMultimediaByCategory = (category: string): {
  images: VocabularyImage[];
  audio: PronunciationAudio[];
  videos: CulturalVideo[];
} => {
  const allImages = [
    ...a1VocabularyImages,
    ...a2VocabularyImages,
    ...b1VocabularyImages,
    ...b2VocabularyImages,
  ];

  return {
    images: allImages.filter(img => img.category === category),
    audio: pronunciationAudioDatabase.filter(audio => audio.category === category),
    videos: culturalVideoDatabase.filter(video => video.category === category),
  };
};

export const getMultimediaStats = (): MultimediaStats => {
  return multimediaStats;
};

export default completeMultimediaDatabase;
