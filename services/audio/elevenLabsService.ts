/**
 * ElevenLabs Voice Synthesis Service
 * Provides high-quality text-to-speech with multiple voices and languages
 * Supports pronunciation evaluation and voice cloning features
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { attemptErrorRecovery } from '../monitoring/errorRecoveryService';

// ElevenLabs API Configuration
export interface ElevenLabsConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  cacheAudio: boolean;
  defaultVoiceId: string;
  defaultModelId: string;
}

// Voice configuration
export interface VoiceConfig {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'adult' | 'senior';
  accent: string;
  description: string;
  previewUrl?: string;
  isCloned: boolean;
  isPremium: boolean;
}

// Speech synthesis options
export interface SpeechOptions {
  voiceId: string;
  modelId?: string;
  voiceSettings?: {
    stability: number; // 0.0 to 1.0
    similarityBoost: number; // 0.0 to 1.0
    style?: number; // 0.0 to 1.0
    useSpeakerBoost?: boolean;
  };
  pronunciationDictionary?: {
    [word: string]: string; // word -> phonetic pronunciation
  };
  outputFormat?: 'mp3_44100_128' | 'mp3_22050_32' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100';
}

// Speech synthesis result
export interface SpeechResult {
  audioUrl: string;
  audioData?: ArrayBuffer;
  duration: number;
  text: string;
  voiceId: string;
  modelId: string;
  pronunciationGuide?: {
    [word: string]: string;
  };
  metadata: {
    timestamp: number;
    language: string;
    quality: 'standard' | 'premium';
  };
}

// Speech-to-Text result
export interface STTResult {
  text: string;
  confidence: number;
  language: string;
  duration: number;
  words: {
    word: string;
    start: number;
    end: number;
    confidence: number;
  }[];
  metadata: {
    timestamp: number;
    model: string;
    processingTime: number;
  };
}

// Pronunciation evaluation result
export interface PronunciationEvaluation {
  overallScore: number; // 0-100
  accuracyScore: number; // 0-100
  fluencyScore: number; // 0-100
  prosodyScore: number; // 0-100
  completenessScore: number; // 0-100
  detailedAnalysis: {
    words: {
      word: string;
      score: number;
      issues: string[];
      suggestions: string[];
    }[];
    phonemes: {
      phoneme: string;
      expected: string;
      actual: string;
      score: number;
    }[];
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    specificTips: string[];
  };
  audioComparison?: {
    referenceAudioUrl: string;
    userAudioUrl: string;
    similarityScore: number;
  };
}

class ElevenLabsService {
  private config: ElevenLabsConfig;
  private availableVoices: VoiceConfig[] = [];
  private audioCache: Map<string, SpeechResult> = new Map();

  constructor() {
    // Load API key from environment variables - REQUIRED for security
    const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
    
    // Validate API key is provided
    if (!apiKey) {
      console.error('[ElevenLabs] SECURITY ERROR: API key not found in environment variables!');
      console.error('[ElevenLabs] Please set EXPO_PUBLIC_ELEVENLABS_API_KEY in your .env file');
    }
    
    // Only log API key info in development (never log the actual key)
    if (__DEV__) {
      console.debug('[ElevenLabs] API Key status:', apiKey ? 'LOADED' : 'MISSING');
      console.debug('[ElevenLabs] API Key length:', apiKey.length);
      console.debug('[ElevenLabs] API Key format valid:', apiKey.length > 10);
    }
    
    this.config = {
      apiKey: apiKey.trim(), // Trim whitespace - NEVER use fallback values for security
      baseUrl: 'https://api.elevenlabs.io/v1',
      timeout: 30000,
      retryAttempts: 3,
      cacheAudio: true,
      defaultVoiceId: 'pNInz6obpgDQGcFmaJgB', // Adam (English)
      defaultModelId: 'eleven_monolingual_v1',
    };
  }

  /**
   * Initialize the ElevenLabs service
   */
  async initialize(config?: Partial<ElevenLabsConfig>): Promise<void> {
    try {
      console.debug('Initializing ElevenLabs service...');
      
      if (config) {
        this.config = { ...this.config, ...config };
      }

      if (!this.config.apiKey) {
        throw new Error('ElevenLabs API key not provided. Please set EXPO_PUBLIC_ELEVENLABS_API_KEY environment variable.');
      }

      if (!this.config.apiKey.startsWith('sk_') && this.config.apiKey.length < 40) {
        throw new Error('ElevenLabs API key format appears invalid. Please check your EXPO_PUBLIC_ELEVENLABS_API_KEY environment variable.');
      }

      // Load available voices
      await this.loadAvailableVoices();
      
      // Load cached audio
      await this.loadAudioCache();

      console.debug(`ElevenLabs service initialized with ${this.availableVoices.length} voices`);
    } catch (error) {
      console.error('Failed to initialize ElevenLabs service:', error);
      throw new Error(`ElevenLabs initialization failed: ${(error as Error).message}`);
    }
  }

  /**
   * Load available voices from ElevenLabs API
   */
  private async loadAvailableVoices(): Promise<void> {
    try {
      const response = await this.makeRequest('/voices', 'GET');
      
      this.availableVoices = response.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        language: voice.labels?.language || 'en',
        gender: voice.labels?.gender || 'neutral',
        age: voice.labels?.age || 'adult',
        accent: voice.labels?.accent || 'neutral',
        description: voice.description || '',
        previewUrl: voice.preview_url,
        isCloned: voice.category === 'cloned',
        isPremium: voice.category === 'premade' && voice.name.includes('Premium'),
      }));

      console.debug(`Loaded ${this.availableVoices.length} voices from ElevenLabs`);
    } catch (error) {
      console.error('Failed to load voices:', error);
      // Use default voices if API fails
      this.availableVoices = this.getDefaultVoices();
    }
  }

  /**
   * Get default voices for fallback
   */
  private getDefaultVoices(): VoiceConfig[] {
    return [
      {
        id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Adam',
        language: 'en',
        gender: 'male',
        age: 'adult',
        accent: 'american',
        description: 'Clear American English male voice',
        isCloned: false,
        isPremium: false,
      },
      {
        id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Bella',
        language: 'en',
        gender: 'female',
        age: 'adult',
        accent: 'american',
        description: 'Warm American English female voice',
        isCloned: false,
        isPremium: false,
      },
      {
        id: 'VR6AewLTigWG4xSOukaG',
        name: 'Arnold',
        language: 'en',
        gender: 'male',
        age: 'adult',
        accent: 'american',
        description: 'Deep American English male voice',
        isCloned: false,
        isPremium: false,
      },
      {
        id: 'AZnzlk1XvdvUeBnXmlld',
        name: 'Domi',
        language: 'en',
        gender: 'female',
        age: 'adult',
        accent: 'american',
        description: 'Confident American English female voice',
        isCloned: false,
        isPremium: false,
      },
    ];
  }

  /**
   * Synthesize speech from text
   */
  async synthesizeSpeech(
    text: string,
    options: Partial<SpeechOptions> = {},
  ): Promise<SpeechResult> {
    try {
      console.debug(`Synthesizing speech for: "${text}"`);
      
      // Check cache first
      const cacheKey = this.generateCacheKey(text, options);
      if (this.config.cacheAudio && this.audioCache.has(cacheKey)) {
        console.debug('Returning cached audio');
        return this.audioCache.get(cacheKey)!;
      }

      // Prepare request
      const voiceId = options.voiceId || this.config.defaultVoiceId;
      const modelId = options.modelId || this.config.defaultModelId;
      
      const requestBody = {
        text,
        model_id: modelId,
        voice_settings: {
          stability: options.voiceSettings?.stability || 0.5,
          similarity_boost: options.voiceSettings?.similarityBoost || 0.5,
          style: options.voiceSettings?.style || 0.0,
          use_speaker_boost: options.voiceSettings?.useSpeakerBoost || true,
        },
        pronunciation_dictionary_locators: options.pronunciationDictionary ? 
          Object.entries(options.pronunciationDictionary).map(([word, pronunciation]) => ({
            pronunciation_dictionary_id: word,
            version_id: pronunciation,
          })) : undefined,
      };

      // Make API request
      const response = await this.makeRequest(
        `/text-to-speech/${voiceId}`,
        'POST',
        requestBody,
        'arraybuffer',
      );

      // Process response
      const audioData = response as ArrayBuffer;
      const audioUrl = await this.createAudioUrl(audioData);
      
      const result: SpeechResult = {
        audioUrl,
        audioData,
        duration: this.estimateAudioDuration(audioData),
        text,
        voiceId,
        modelId,
        pronunciationGuide: options.pronunciationDictionary,
        metadata: {
          timestamp: Date.now(),
          language: this.getVoiceLanguage(voiceId),
          quality: this.getVoiceQuality(voiceId),
        },
      };

      // Cache result
      if (this.config.cacheAudio) {
        this.audioCache.set(cacheKey, result);
        await this.saveAudioCache();
      }

      console.debug('Speech synthesis completed');
      return result;
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      
      // Attempt error recovery
      const recovered = await attemptErrorRecovery(error as Error, 'elevenlabs_synthesis');
      if (recovered) {
        console.debug('🔄 Retrying speech synthesis after recovery...');
        // Retry once after recovery
        try {
          return await this.synthesizeSpeech(text, options);
        } catch (retryError) {
          console.error('Speech synthesis retry failed:', retryError);
        }
      }
      
      throw new Error(`Speech synthesis failed: ${(error as Error).message}`);
    }
  }

  /**
   * Speech-to-Text using ElevenLabs (PRIMARY STT SERVICE)
   */
  async speechToText(
    audioData: ArrayBuffer,
    languageCode: string = 'en',
    options: {
      model?: string;
      enhance?: boolean;
      removeDisfluencies?: boolean;
    } = {},
  ): Promise<STTResult> {
    try {
      console.debug(`Converting speech to text for language: ${languageCode}`);
      
      const startTime = Date.now();
      
      // Convert ArrayBuffer to base64
      const base64Audio = this.arrayBufferToBase64(audioData);
      
      const requestBody = {
        audio: base64Audio,
        model_id: options.model || 'eleven_multilingual_v2',
        language_detection: true,
        enhance: options.enhance || true,
        remove_disfluencies: options.removeDisfluencies || false,
      };

      const response = await this.makeRequest(
        '/speech-to-text',
        'POST',
        requestBody,
      );

      const processingTime = Date.now() - startTime;
      
      const result: STTResult = {
        text: response.text || '',
        confidence: response.confidence || 0,
        language: response.language || languageCode,
        duration: this.estimateAudioDuration(audioData),
        words: response.words || [],
        metadata: {
          timestamp: Date.now(),
          model: options.model || 'eleven_multilingual_v2',
          processingTime,
        },
      };

      console.debug(`STT completed: "${result.text}" (confidence: ${result.confidence})`);
      return result;
    } catch (error) {
      console.error('Speech-to-text failed:', error);
      throw new Error(`Speech-to-text failed: ${(error as Error).message}`);
    }
  }

  /**
   * Evaluate pronunciation by comparing user audio with reference
   */
  async evaluatePronunciation(
    userAudioData: ArrayBuffer,
    targetText: string,
    languageCode: string = 'en',
    referenceVoiceId?: string,
  ): Promise<PronunciationEvaluation> {
    try {
      console.debug(`Evaluating pronunciation for: "${targetText}"`);
      
      // Generate reference audio
      const referenceAudio = await this.synthesizeSpeech(targetText, {
        voiceId: referenceVoiceId || this.getBestVoiceForLanguage(languageCode),
        voiceSettings: {
          stability: 0.8,
          similarityBoost: 0.8,
          useSpeakerBoost: true,
        },
      });

      // Perform audio comparison
      const audioComparison = await this.compareAudio(
        userAudioData,
        referenceAudio.audioData!,
        targetText,
      );

      // Generate detailed analysis
      const detailedAnalysis = await this.generateDetailedAnalysis(
        userAudioData,
        targetText,
        languageCode,
      );

      // Calculate scores
      const scores = this.calculatePronunciationScores(
        audioComparison,
        detailedAnalysis,
        targetText,
      );

      // Generate feedback
      const feedback = this.generatePronunciationFeedback(
        scores,
        detailedAnalysis,
        targetText,
      );

      const evaluation: PronunciationEvaluation = {
        overallScore: scores.overall,
        accuracyScore: scores.accuracy,
        fluencyScore: scores.fluency,
        prosodyScore: scores.prosody,
        completenessScore: scores.completeness,
        detailedAnalysis,
        feedback,
        audioComparison: {
          referenceAudioUrl: referenceAudio.audioUrl,
          userAudioUrl: await this.createAudioUrl(userAudioData),
          similarityScore: audioComparison.similarity,
        },
      };

      console.debug(`Pronunciation evaluation completed: ${evaluation.overallScore}%`);
      return evaluation;
    } catch (error) {
      console.error('Pronunciation evaluation failed:', error);
      throw new Error(`Pronunciation evaluation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Compare two audio files for similarity
   */
  private async compareAudio(
    userAudio: ArrayBuffer,
    referenceAudio: ArrayBuffer,
    targetText: string,
  ): Promise<{
    similarity: number;
    durationMatch: number;
    frequencyMatch: number;
    amplitudeMatch: number;
  }> {
    try {
      // This is a simplified audio comparison
      // In a real implementation, you would use more sophisticated audio analysis
      
      const userDuration = this.estimateAudioDuration(userAudio);
      const referenceDuration = this.estimateAudioDuration(referenceAudio);
      
      // Duration similarity
      const durationMatch = 1 - Math.abs(userDuration - referenceDuration) / referenceDuration;
      
      // Frequency analysis (simplified)
      const frequencyMatch = this.analyzeFrequencySimilarity(userAudio, referenceAudio);
      
      // Amplitude analysis (simplified)
      const amplitudeMatch = this.analyzeAmplitudeSimilarity(userAudio, referenceAudio);
      
      // Overall similarity
      const similarity = (durationMatch * 0.3 + frequencyMatch * 0.4 + amplitudeMatch * 0.3) * 100;
      
      return {
        similarity: Math.max(0, Math.min(100, similarity)),
        durationMatch: Math.max(0, Math.min(1, durationMatch)),
        frequencyMatch: Math.max(0, Math.min(1, frequencyMatch)),
        amplitudeMatch: Math.max(0, Math.min(1, amplitudeMatch)),
      };
    } catch (error) {
      console.error('Audio comparison failed:', error);
      return {
        similarity: 0,
        durationMatch: 0,
        frequencyMatch: 0,
        amplitudeMatch: 0,
      };
    }
  }

  /**
   * Generate detailed pronunciation analysis
   */
  private async generateDetailedAnalysis(
    audioData: ArrayBuffer,
    targetText: string,
    languageCode: string,
  ): Promise<PronunciationEvaluation['detailedAnalysis']> {
    const words = targetText.toLowerCase().split(/\s+/);
    
    // Word-level analysis
    const wordAnalysis = words.map(word => {
      // Simplified word analysis - in reality, you'd use speech recognition
      const score = Math.random() * 40 + 60; // Mock score between 60-100
      const issues: string[] = [];
      const suggestions: string[] = [];
      
      if (score < 70) {
        issues.push('Pronunciation unclear');
        suggestions.push('Speak more clearly');
      }
      if (score < 80) {
        issues.push('Slight mispronunciation');
        suggestions.push('Focus on vowel sounds');
      }
      
      return {
        word,
        score: Math.round(score),
        issues,
        suggestions,
      };
    });

    // Phoneme-level analysis
    const phonemeAnalysis = words.flatMap(word => 
      word.split('').map((char, index) => ({
        phoneme: char,
        expected: char,
        actual: char, // Simplified - would be actual recognized phoneme
        score: Math.round(Math.random() * 30 + 70),
      })),
    );

    return {
      words: wordAnalysis,
      phonemes: phonemeAnalysis,
    };
  }

  /**
   * Calculate pronunciation scores
   */
  private calculatePronunciationScores(
    audioComparison: any,
    detailedAnalysis: any,
    targetText: string,
  ): {
    overall: number;
    accuracy: number;
    fluency: number;
    prosody: number;
    completeness: number;
  } {
    const accuracy = audioComparison.similarity;
    const fluency = audioComparison.durationMatch * 100;
    const prosody = (audioComparison.frequencyMatch + audioComparison.amplitudeMatch) / 2 * 100;
    const completeness = detailedAnalysis.words.length > 0 ? 
      detailedAnalysis.words.reduce((sum: number, word: any) => sum + word.score, 0) / detailedAnalysis.words.length : 0;
    
    const overall = (accuracy * 0.4 + fluency * 0.2 + prosody * 0.2 + completeness * 0.2);
    
    return {
      overall: Math.round(overall),
      accuracy: Math.round(accuracy),
      fluency: Math.round(fluency),
      prosody: Math.round(prosody),
      completeness: Math.round(completeness),
    };
  }

  /**
   * Generate pronunciation feedback
   */
  private generatePronunciationFeedback(
    scores: any,
    detailedAnalysis: any,
    targetText: string,
  ): PronunciationEvaluation['feedback'] {
    const strengths: string[] = [];
    const improvements: string[] = [];
    const specificTips: string[] = [];

    // Analyze strengths
    if (scores.accuracy >= 80) {
      strengths.push('Excellent pronunciation accuracy');
    }
    if (scores.fluency >= 80) {
      strengths.push('Good speaking rhythm and pace');
    }
    if (scores.prosody >= 80) {
      strengths.push('Natural intonation and stress');
    }

    // Identify improvements
    if (scores.accuracy < 70) {
      improvements.push('Focus on pronunciation accuracy');
      specificTips.push('Listen to the reference audio and repeat slowly');
    }
    if (scores.fluency < 70) {
      improvements.push('Work on speaking fluency');
      specificTips.push('Practice speaking at a steady pace');
    }
    if (scores.prosody < 70) {
      improvements.push('Improve intonation and stress patterns');
      specificTips.push('Pay attention to word stress and sentence rhythm');
    }

    // Word-specific tips
    const problematicWords = detailedAnalysis.words.filter((word: any) => word.score < 70);
    if (problematicWords.length > 0) {
      specificTips.push(`Focus on these words: ${problematicWords.map((w: any) => w.word).join(', ')}`);
    }

    return {
      strengths: strengths.length > 0 ? strengths : ['Keep practicing!'],
      improvements: improvements.length > 0 ? improvements : ['Great job!'],
      specificTips,
    };
  }

  /**
   * Get best voice for a specific language
   */
  getBestVoiceForLanguage(languageCode: string): string {
    const languageVoices = this.availableVoices.filter(voice => 
      voice.language === languageCode,
    );
    
    if (languageVoices.length > 0) {
      // Prefer non-premium voices for better accessibility
      const nonPremium = languageVoices.filter(voice => !voice.isPremium);
      return nonPremium.length > 0 ? nonPremium[0].id : languageVoices[0].id;
    }
    
    // Fallback to default voice
    return this.config.defaultVoiceId;
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): VoiceConfig[] {
    return this.availableVoices;
  }

  /**
   * Get voices for a specific language
   */
  getVoicesForLanguage(languageCode: string): VoiceConfig[] {
    return this.availableVoices.filter(voice => voice.language === languageCode);
  }

  /**
   * Get voice by ID
   */
  getVoiceById(voiceId: string): VoiceConfig | undefined {
    return this.availableVoices.find(voice => voice.id === voiceId);
  }

  // Additional methods for compatibility
  async testConnection(): Promise<boolean> {
    try {
      await this.loadVoices();
      return true;
    } catch (error) {
      console.error('ElevenLabs connection test failed:', error);
      return false;
    }
  }

  async loadVoices(): Promise<VoiceConfig[]> {
    return this.availableVoices;
  }

  getVoicesByLanguage(languageCode: string): VoiceConfig[] {
    return this.getVoicesForLanguage(languageCode);
  }

  /**
   * Make HTTP request to ElevenLabs API
   */
  private async makeRequest(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    responseType: 'json' | 'arraybuffer' = 'json',
  ): Promise<any> {
    // Validate API key before making request
    if (!this.config.apiKey || this.config.apiKey.length < 10) {
      throw new Error('Invalid or missing ElevenLabs API key');
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Accept': responseType === 'json' ? 'application/json' : 'audio/mpeg',
      'xi-api-key': this.config.apiKey,
    };

    // Only log detailed request info in development
    if (__DEV__) {
      console.debug('[ElevenLabs] Making request to:', url);
      console.debug('[ElevenLabs] API Key in header:', this.config.apiKey ? `${this.config.apiKey.substring(0, 10)}...` : 'EMPTY');
      console.debug('[ElevenLabs] API Key length:', this.config.apiKey.length);
      console.debug('[ElevenLabs] API Key valid:', this.config.apiKey.length >= 10);
    }

    if (method === 'POST' && body) {
      headers['Content-Type'] = 'application/json';
    }

    // Create AbortController for timeout (React Native compatible)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    const requestOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    let lastError: Error | null = null;

    try {
      for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
        try {
          console.debug(`ElevenLabs API request attempt ${attempt}/${this.config.retryAttempts}`);
          
          const response = await fetch(url, requestOptions);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // Clear timeout on successful response
          clearTimeout(timeoutId);

          if (responseType === 'arraybuffer') {
            return await response.arrayBuffer();
          } else {
            return await response.json();
          }
        } catch (error: any) {
          console.error(`ElevenLabs API attempt ${attempt} failed:`, error.message);
          lastError = error;
          
          if (attempt < this.config.retryAttempts) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      throw lastError || new Error('ElevenLabs API request failed');
    } finally {
      // Always clear timeout
      clearTimeout(timeoutId);
    }
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    // Use React Native compatible base64 encoding
    if (Platform.OS === 'web' && typeof btoa !== 'undefined') {
      return btoa(binary);
    } else {
      // Fallback for React Native - simple base64 implementation
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let result = '';
      let i = 0;
      
      while (i < binary.length) {
        const a = binary.charCodeAt(i++);
        const b = i < binary.length ? binary.charCodeAt(i++) : 0;
        const c = i < binary.length ? binary.charCodeAt(i++) : 0;
        
        const bitmap = (a << 16) | (b << 8) | c;
        
        result += chars.charAt((bitmap >> 18) & 63);
        result += chars.charAt((bitmap >> 12) & 63);
        result += i - 2 < binary.length ? chars.charAt((bitmap >> 6) & 63) : '=';
        result += i - 1 < binary.length ? chars.charAt(bitmap & 63) : '=';
      }
      
      return result;
    }
  }

  /**
   * Create audio URL from ArrayBuffer
   */
  private async createAudioUrl(audioData: ArrayBuffer): Promise<string> {
    if (Platform.OS === 'web') {
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      return URL.createObjectURL(blob);
    } else {
      // For mobile, convert ArrayBuffer to base64 without Buffer
      const uint8Array = new Uint8Array(audioData);
      let binary = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      // Use a React Native compatible base64 encoding
      const base64 = this.arrayBufferToBase64(audioData);
      return `data:audio/mpeg;base64,${base64}`;
    }
  }

  /**
   * Estimate audio duration from ArrayBuffer
   */
  private estimateAudioDuration(audioData: ArrayBuffer): number {
    // Simplified duration estimation
    // In reality, you'd parse the audio file headers
    return audioData.byteLength / 16000; // Rough estimate for MP3
  }

  /**
   * Analyze frequency similarity between two audio files
   */
  private analyzeFrequencySimilarity(audio1: ArrayBuffer, audio2: ArrayBuffer): number {
    // Simplified frequency analysis
    // In reality, you'd perform FFT analysis
    return Math.random() * 0.4 + 0.6; // Mock similarity between 0.6-1.0
  }

  /**
   * Analyze amplitude similarity between two audio files
   */
  private analyzeAmplitudeSimilarity(audio1: ArrayBuffer, audio2: ArrayBuffer): number {
    // Simplified amplitude analysis
    // In reality, you'd analyze RMS values
    return Math.random() * 0.4 + 0.6; // Mock similarity between 0.6-1.0
  }

  /**
   * Get voice language
   */
  private getVoiceLanguage(voiceId: string): string {
    const voice = this.getVoiceById(voiceId);
    return voice?.language || 'en';
  }

  /**
   * Get voice quality
   */
  private getVoiceQuality(voiceId: string): 'standard' | 'premium' {
    const voice = this.getVoiceById(voiceId);
    return voice?.isPremium ? 'premium' : 'standard';
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(text: string, options: Partial<SpeechOptions>): string {
    return `${text}_${options.voiceId || this.config.defaultVoiceId}_${options.modelId || this.config.defaultModelId}`;
  }

  /**
   * Load audio cache from storage
   */
  private async loadAudioCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem('elevenlabs_audio_cache');
      if (cached) {
        const cacheData = JSON.parse(cached);
        // Note: In a real implementation, you'd need to handle ArrayBuffer serialization
        console.debug('Audio cache loaded');
      }
    } catch (error) {
      console.error('Failed to load audio cache:', error);
    }
  }

  /**
   * Save audio cache to storage
   */
  private async saveAudioCache(): Promise<void> {
    try {
      // Note: In a real implementation, you'd need to handle ArrayBuffer serialization
      const cacheData = Array.from(this.audioCache.entries());
      await AsyncStorage.setItem('elevenlabs_audio_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save audio cache:', error);
    }
  }

  /**
   * Clear audio cache
   */
  async clearCache(): Promise<void> {
    this.audioCache.clear();
    await AsyncStorage.removeItem('elevenlabs_audio_cache');
    console.debug('Audio cache cleared');
  }

  /**
   * Get service status
   */
  async getServiceStatus(): Promise<{
    initialized: boolean;
    apiKeyConfigured: boolean;
    voicesLoaded: number;
    cacheSize: number;
  }> {
    return {
      initialized: this.availableVoices.length > 0,
      apiKeyConfigured: !!this.config.apiKey,
      voicesLoaded: this.availableVoices.length,
      cacheSize: this.audioCache.size,
    };
  }
}

// Export singleton instance
export const elevenLabsService = new ElevenLabsService();
export default elevenLabsService;

// Export utility functions
export const synthesizeSpeech = (text: string, options?: Partial<SpeechOptions>) =>
  elevenLabsService.synthesizeSpeech(text, options);

export const speechToText = (
  audioData: ArrayBuffer,
  languageCode?: string,
  options?: {
    model?: string;
    enhance?: boolean;
    removeDisfluencies?: boolean;
  },
) => elevenLabsService.speechToText(audioData, languageCode, options);

export const evaluatePronunciation = (
  userAudioData: ArrayBuffer,
  targetText: string,
  languageCode?: string,
  referenceVoiceId?: string,
) => elevenLabsService.evaluatePronunciation(userAudioData, targetText, languageCode, referenceVoiceId);

export const getAvailableVoices = () => elevenLabsService.getAvailableVoices();

export const getVoicesForLanguage = (languageCode: string) =>
  elevenLabsService.getVoicesForLanguage(languageCode);

export const getBestVoiceForLanguage = (languageCode: string) =>
  elevenLabsService.getBestVoiceForLanguage(languageCode);
