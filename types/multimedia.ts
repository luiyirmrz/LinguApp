// Multimedia Types for LinguApp
// Comprehensive type definitions for images, audio, video, and cultural content

export interface MultimediaItem {
  id: string;
  type: 'image' | 'audio' | 'video';
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // in seconds
  size: number; // in bytes
  format: string; // e.g., 'jpg', 'mp3', 'mp4'
  quality: 'low' | 'medium' | 'high' | 'ultra';
  language: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: string;
  tags: string[];
  metadata: {
    width?: number;
    height?: number;
    bitrate?: number;
    sampleRate?: number;
    channels?: number;
    fps?: number;
    codec?: string;
  };
  createdAt: string;
  updatedAt: string;
  isOptimized: boolean;
  cdnUrl?: string;
  localPath?: string;
}

export interface VocabularyImage extends MultimediaItem {
  type: 'image';
  vocabularyId: string;
  word: string;
  translation: string;
  culturalContext?: string;
  imageStyle: 'photograph' | 'illustration' | 'icon' | 'cultural' | 'contextual';
  imageCategory: 'object' | 'action' | 'concept' | 'place' | 'person' | 'food' | 'animal' | 'nature';
  altText: string;
  caption?: string;
  source: 'unsplash' | 'pexels' | 'custom' | 'ai_generated' | 'user_uploaded';
  license: 'free' | 'paid' | 'creative_commons' | 'proprietary';
  attribution?: string;
  metadata: {
    width: number;
    height: number;
    dominantColor?: string;
    colors?: string[];
    objects?: string[];
    scene?: string;
    mood?: string;
  };
}

export interface PronunciationAudio extends MultimediaItem {
  type: 'audio';
  vocabularyId: string;
  word: string;
  language: string;
  pronunciation: string;
  phonetic: string;
  audioType: 'word' | 'sentence' | 'phrase' | 'dialogue';
  speaker: {
    id: string;
    name: string;
    gender: 'male' | 'female' | 'neutral';
    age: 'child' | 'young_adult' | 'adult' | 'elderly';
    accent: 'native' | 'standard' | 'regional';
    region?: string;
  };
  quality: 'low' | 'medium' | 'high' | 'ultra';
  metadata: {
    bitrate: number;
    sampleRate: number;
    channels: number;
    duration: number;
    format: string;
    codec: string;
  };
}

export interface CulturalVideo extends MultimediaItem {
  type: 'video';
  vocabularyId?: string;
  lessonId?: string;
  title: string;
  description: string;
  culturalContext: string;
  videoType: 'cultural_explanation' | 'usage_demonstration' | 'real_world_context' | 'story' | 'interview';
  duration: number;
  language: string;
  subtitles: {
    [languageCode: string]: {
      url: string;
      format: 'srt' | 'vtt' | 'ass';
      language: string;
    };
  };
  chapters?: {
    startTime: number;
    endTime: number;
    title: string;
    description: string;
  }[];
  metadata: {
    width: number;
    height: number;
    fps: number;
    bitrate: number;
    codec: string;
    duration: number;
  };
}

export interface MultimediaCollection {
  id: string;
  name: string;
  description: string;
  type: 'vocabulary' | 'lesson' | 'cultural' | 'grammar' | 'exercise';
  items: MultimediaItem[];
  totalSize: number;
  totalDuration?: number;
  language: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MultimediaOptimization {
  id: string;
  originalItem: MultimediaItem;
  optimizedVersions: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    url: string;
    size: number;
    compressionRatio: number;
    metadata: any;
  }[];
  optimizationSettings: {
    imageQuality?: number;
    audioBitrate?: number;
    videoBitrate?: number;
    resolution?: string;
    format?: string;
  };
  createdAt: string;
}

export interface CDNConfiguration {
  provider: 'cloudflare' | 'aws_cloudfront' | 'azure_cdn' | 'google_cloud_cdn' | 'custom';
  baseUrl: string;
  regions: string[];
  cacheSettings: {
    images: {
      ttl: number; // time to live in seconds
      maxAge: number;
      staleWhileRevalidate: number;
    };
    audio: {
      ttl: number;
      maxAge: number;
      staleWhileRevalidate: number;
    };
    video: {
      ttl: number;
      maxAge: number;
      staleWhileRevalidate: number;
    };
  };
  optimization: {
    autoOptimize: boolean;
    webpSupport: boolean;
    avifSupport: boolean;
    compressionLevel: number;
  };
  security: {
    signedUrls: boolean;
    tokenExpiration: number;
    allowedDomains: string[];
  };
}

export interface MultimediaStats {
  totalItems: number;
  totalSize: number;
  itemsByType: {
    images: number;
    audio: number;
    video: number;
  };
  itemsByLanguage: Record<string, number>;
  itemsByLevel: Record<string, number>;
  itemsByCategory: Record<string, number>;
  averageFileSize: number;
  optimizationSavings: number;
  cdnHitRate: number;
  bandwidthUsage: number;
}

export interface MultimediaFilter {
  type?: 'image' | 'audio' | 'video';
  language?: string;
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  tags?: string[];
  vocabularyId?: string;
  lessonId?: string;
  minSize?: number;
  maxSize?: number;
  minDuration?: number;
  maxDuration?: number;
}

export interface MultimediaUpload {
  id: string;
  file: File;
  type: 'image' | 'audio' | 'video';
  metadata: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'optimizing' | 'completed' | 'failed';
  error?: string;
  result?: MultimediaItem;
  createdAt: string;
}

export interface MultimediaSearchResult {
  item: MultimediaItem;
  relevanceScore: number;
  matchedFields: string[];
  highlights: {
    field: string;
    value: string;
    snippet: string;
  }[];
}

export interface MultimediaPlaylist {
  id: string;
  name: string;
  description: string;
  items: MultimediaItem[];
  totalDuration: number;
  language: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: string;
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MultimediaAnalytics {
  itemId: string;
  views: number;
  downloads: number;
  shares: number;
  likes: number;
  dislikes: number;
  averageRating: number;
  totalRatings: number;
  usageStats: {
    date: string;
    views: number;
    downloads: number;
    shares: number;
  }[];
  userEngagement: {
    averageViewDuration: number;
    completionRate: number;
    interactionRate: number;
  };
  performanceMetrics: {
    loadTime: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

export interface MultimediaRecommendation {
  item: MultimediaItem;
  reason: string;
  confidence: number;
  basedOn: 'similar_content' | 'user_behavior' | 'popularity' | 'recent' | 'trending';
  relatedItems: MultimediaItem[];
}

export interface MultimediaBatch {
  id: string;
  name: string;
  description: string;
  items: MultimediaItem[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface MultimediaTemplate {
  id: string;
  name: string;
  description: string;
  type: 'image' | 'audio' | 'video';
  template: {
    dimensions?: { width: number; height: number };
    duration?: number;
    format: string;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    style: string;
    category: string;
  };
  variables: {
    name: string;
    type: 'text' | 'image' | 'audio' | 'video';
    required: boolean;
    defaultValue?: any;
  }[];
  outputFormat: string;
  createdAt: string;
  updatedAt: string;
}

export interface MultimediaWorkflow {
  id: string;
  name: string;
  description: string;
  steps: {
    id: string;
    name: string;
    type: 'upload' | 'process' | 'optimize' | 'validate' | 'publish';
    config: any;
    dependencies: string[];
  }[];
  triggers: {
    type: 'manual' | 'scheduled' | 'event';
    config: any;
  }[];
  status: 'active' | 'inactive' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface MultimediaEvent {
  id: string;
  type: 'upload' | 'process' | 'optimize' | 'delete' | 'view' | 'download' | 'share';
  itemId: string;
  userId?: string;
  metadata: any;
  timestamp: string;
  success: boolean;
  error?: string;
  duration?: number;
}

export interface MultimediaBackup {
  id: string;
  name: string;
  description: string;
  items: MultimediaItem[];
  totalSize: number;
  compressionRatio: number;
  storageLocation: string;
  encryptionKey?: string;
  createdAt: string;
  expiresAt?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface MultimediaMigration {
  id: string;
  name: string;
  description: string;
  source: {
    type: 'local' | 's3' | 'gcs' | 'azure' | 'custom';
    config: any;
  };
  destination: {
    type: 'local' | 's3' | 'gcs' | 'azure' | 'custom';
    config: any;
  };
  items: MultimediaItem[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  migratedItems: number;
  failedItems: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface MultimediaHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    duration: number;
    timestamp: string;
  }[];
  metrics: {
    totalItems: number;
    totalSize: number;
    averageLoadTime: number;
    errorRate: number;
    cacheHitRate: number;
    bandwidthUsage: number;
  };
  lastChecked: string;
}

export interface MultimediaConfig {
  storage: {
    provider: 'local' | 's3' | 'gcs' | 'azure' | 'custom';
    config: any;
  };
  cdn: CDNConfiguration;
  optimization: {
    autoOptimize: boolean;
    imageQuality: number;
    audioBitrate: number;
    videoBitrate: number;
    formats: string[];
  };
  security: {
    signedUrls: boolean;
    tokenExpiration: number;
    allowedDomains: string[];
    encryption: boolean;
  };
  analytics: {
    enabled: boolean;
    retentionDays: number;
    trackViews: boolean;
    trackDownloads: boolean;
    trackShares: boolean;
  };
  backup: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
    compression: boolean;
  };
}
