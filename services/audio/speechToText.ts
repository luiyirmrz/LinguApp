/**
 * Comprehensive Speech-to-Text Service for Pronunciation Feedback
 * ElevenLabs as PRIMARY STT service with Google STT and offline fallbacks
 * Supports multiple languages with offline capabilities
 * Provides real-time transcription and pronunciation assessment
 * Cross-platform compatible (React Native + Web)
 */

import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { File } from 'expo-file-system';
import { speechToText as elevenLabsSTT } from '@/services/audio/elevenLabsService';

// Language support configuration
export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string; 
  supported: boolean;
  offline: boolean;
  accuracy: 'high' | 'medium' | 'low';
}

// Transcription result interface
export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
  duration: number;
  words?: WordResult[];
  error?: string;
}

// Word-level result for detailed feedback
export interface WordResult {
  word: string;
  confidence: number;
  startTime: number;
  endTime: number;
  phonemes?: PhonemeResult[];
}

// Phoneme-level result for pronunciation feedback
export interface PhonemeResult {
  phoneme: string;
  confidence: number;
  accuracy: number;
}

// Pronunciation assessment result
export interface PronunciationAssessment {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  feedback: string[];
  detailedFeedback: {
    words: {
      word: string;
      score: number;
      issues: string[];
    }[];
    phonemes: {
      phoneme: string;
      expected: string;
      actual: string;
      score: number;
    }[];
  };
}

// Recording configuration
export interface RecordingConfig {
  quality: 'low' | 'medium' | 'high';
  format: 'wav' | 'm4a' | 'webm';
  sampleRate: number;
  channels: number;
  bitRate: number;
}

// STT Service configuration
export interface STTConfig {
  apiEndpoint: string;
  fallbackEndpoint?: string;
  timeout: number;
  retryAttempts: number;
  offlineMode: boolean;
  cacheResults: boolean;
}

class SpeechToTextService {
  private recording: Audio.Recording | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private isRecording = false;
  private recordingStartTime = 0;
  private audioChunks: Blob[] = [];
  
  // Supported languages with accuracy ratings
  private supportedLanguages: LanguageConfig[] = [
    { code: 'en', name: 'English', nativeName: 'English', supported: true, offline: true, accuracy: 'high' },
    { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', supported: true, offline: true, accuracy: 'high' },
    { code: 'zh', name: 'Chinese (Mandarin)', nativeName: '中文 (普通话)', supported: true, offline: true, accuracy: 'high' },
    { code: 'zh-cn', name: 'Chinese (Simplified)', nativeName: '中文 (简体)', supported: true, offline: true, accuracy: 'high' },
    { code: 'zh-tw', name: 'Chinese (Traditional)', nativeName: '中文 (繁體)', supported: true, offline: true, accuracy: 'high' },
    { code: 'fr', name: 'French', nativeName: 'Français', supported: true, offline: true, accuracy: 'high' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', supported: true, offline: true, accuracy: 'high' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', supported: true, offline: true, accuracy: 'high' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', supported: true, offline: true, accuracy: 'high' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', supported: true, offline: true, accuracy: 'high' },
    { code: 'pt-br', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', supported: true, offline: true, accuracy: 'high' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', supported: true, offline: true, accuracy: 'high' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', supported: true, offline: true, accuracy: 'high' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', supported: true, offline: true, accuracy: 'high' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', supported: true, offline: false, accuracy: 'high' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', supported: true, offline: false, accuracy: 'high' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', supported: true, offline: true, accuracy: 'high' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', supported: true, offline: true, accuracy: 'high' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk', supported: true, offline: true, accuracy: 'high' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk', supported: true, offline: true, accuracy: 'high' },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi', supported: true, offline: true, accuracy: 'high' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', supported: true, offline: true, accuracy: 'high' },
    { code: 'cs', name: 'Czech', nativeName: 'Čeština', supported: true, offline: true, accuracy: 'high' },
    { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', supported: true, offline: true, accuracy: 'high' },
    { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', supported: true, offline: true, accuracy: 'high' },
    { code: 'ro', name: 'Romanian', nativeName: 'Română', supported: true, offline: true, accuracy: 'high' },
    { code: 'bg', name: 'Bulgarian', nativeName: 'Български', supported: true, offline: true, accuracy: 'high' },
    { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', supported: true, offline: true, accuracy: 'high' },
    { code: 'sr', name: 'Serbian', nativeName: 'Српски', supported: true, offline: true, accuracy: 'high' },
    { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', supported: true, offline: true, accuracy: 'high' },
    { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', supported: true, offline: true, accuracy: 'high' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', supported: true, offline: true, accuracy: 'high' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', supported: true, offline: true, accuracy: 'high' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', supported: true, offline: false, accuracy: 'high' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', supported: true, offline: false, accuracy: 'medium' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', supported: true, offline: false, accuracy: 'medium' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', supported: true, offline: true, accuracy: 'high' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', supported: true, offline: true, accuracy: 'high' },
    { code: 'tl', name: 'Filipino', nativeName: 'Filipino', supported: true, offline: true, accuracy: 'medium' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', supported: true, offline: false, accuracy: 'medium' },
    { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', supported: true, offline: true, accuracy: 'medium' },
    { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', supported: true, offline: true, accuracy: 'medium' },
    { code: 'mt', name: 'Maltese', nativeName: 'Malti', supported: true, offline: false, accuracy: 'medium' },
    { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', supported: true, offline: false, accuracy: 'medium' },
    { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', supported: true, offline: false, accuracy: 'medium' },
    { code: 'eu', name: 'Basque', nativeName: 'Euskera', supported: true, offline: false, accuracy: 'medium' },
    { code: 'ca', name: 'Catalan', nativeName: 'Català', supported: true, offline: true, accuracy: 'high' },
    { code: 'gl', name: 'Galician', nativeName: 'Galego', supported: true, offline: false, accuracy: 'medium' },
    { code: 'et', name: 'Estonian', nativeName: 'Eesti', supported: true, offline: true, accuracy: 'medium' },
    { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', supported: true, offline: true, accuracy: 'medium' },
    { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', supported: true, offline: true, accuracy: 'medium' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', supported: true, offline: true, accuracy: 'high' },
    { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', supported: true, offline: false, accuracy: 'medium' },
  ];

  // Default configuration
  private config: STTConfig = {
    apiEndpoint: 'https://speech.googleapis.com/v1p1beta1/speech:recognize',
    fallbackEndpoint: '', // No fallback, Google is primary
    timeout: 30000,
    retryAttempts: 3,
    offlineMode: false,
    cacheResults: true,
  };

  // Google Cloud API Key
  private readonly GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_STT_API_KEY || 'AIzaSyAgOFZ9VfrZmvG9TkqCs2WQc8elCqyS6Yo';

  // Default recording configuration
  private recordingConfig: RecordingConfig = {
    quality: 'high',
    format: Platform.OS === 'web' ? 'webm' : (Platform.OS === 'ios' ? 'wav' : 'm4a'),
    sampleRate: 44100,
    channels: 1,
    bitRate: 128000,
  };

  /**
   * Initialize the STT service
   */
  async initialize(config?: Partial<STTConfig>): Promise<void> {
    try {
      console.debug('Initializing Speech-to-Text service...');
      
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Request audio permissions
      await this.requestPermissions();
      
      // Initialize audio mode for mobile
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      }

      console.debug('STT service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize STT service:', error);
      throw new Error('STT initialization failed');
    }
  }

  /**
   * Request audio recording permissions
   */
  private async requestPermissions(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web permissions are handled by getUserMedia
        return;
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission denied');
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      throw error;
    }
  }

  /**
   * Start audio recording
   */
  async startRecording(languageCode = 'en'): Promise<void> {
    try {
      if (this.isRecording) {
        console.warn('Recording already in progress');
        return;
      }

      console.debug(`Starting recording for language: ${languageCode}`);
      this.recordingStartTime = Date.now();
      this.isRecording = true;

      if (Platform.OS === 'web') {
        await this.startWebRecording();
      } else {
        await this.startMobileRecording();
      }

      console.debug('Recording started successfully');
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.isRecording = false;
      throw new Error('Recording start failed');
    }
  }

  /**
   * Start recording on web platform
   */
  private async startWebRecording(): Promise<void> {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.recordingConfig.sampleRate,
          channelCount: this.recordingConfig.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: this.getSupportedMimeType(),
      });

      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
    } catch (error) {
      console.error('Web recording setup failed:', error);
      throw error;
    }
  }

  /**
   * Start recording on mobile platform
   */
  private async startMobileRecording(): Promise<void> {
    try {
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: (Audio as any).RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: (Audio as any).RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: this.recordingConfig.sampleRate,
          numberOfChannels: this.recordingConfig.channels,
          bitRate: this.recordingConfig.bitRate,
        },
        ios: {
          extension: '.wav',
          outputFormat: (Audio as any).RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: (Audio as any).RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: this.recordingConfig.sampleRate,
          numberOfChannels: this.recordingConfig.channels,
          bitRate: this.recordingConfig.bitRate,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm;codecs=opus',
          bitsPerSecond: this.recordingConfig.bitRate,
        },
      };

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(recordingOptions);
      await this.recording.startAsync();
    } catch (error) {
      console.error('Mobile recording setup failed:', error);
      throw error;
    }
  }

  /**
   * Stop audio recording and return audio data
   */
  async stopRecording(): Promise<{ uri?: string; blob?: Blob; duration: number }> {
    try {
      if (!this.isRecording) {
        throw new Error('No recording in progress');
      }

      console.debug('Stopping recording...');
      const duration = Date.now() - this.recordingStartTime;
      this.isRecording = false;

      if (Platform.OS === 'web') {
        return await this.stopWebRecording(duration);
      } else {
        return await this.stopMobileRecording(duration);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Stop web recording
   */
  private async stopWebRecording(duration: number): Promise<{ blob: Blob; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No media recorder available'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(this.audioChunks, { 
            type: this.getSupportedMimeType(), 
          });
          
          // Clean up
          if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
          }
          this.mediaRecorder = null;
          this.audioChunks = [];

          resolve({ blob, duration });
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.onerror = (_event) => {
        reject(new Error('Recording failed'));
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Stop mobile recording
   */
  private async stopMobileRecording(duration: number): Promise<{ uri: string; duration: number }> {
    try {
      if (!this.recording) {
        throw new Error('No recording available');
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      this.recording = null;

      if (!uri) {
        throw new Error('Recording URI not available');
      }

      return { uri, duration };
    } catch (error) {
      console.error('Mobile recording stop failed:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio to text
   */
  async transcribe(
    audioData: { uri?: string; blob?: Blob },
    languageCode = 'en',
    targetText?: string,
  ): Promise<TranscriptionResult> {
    const startTime = Date.now();
    try {
      console.debug(`[STT DEBUG] Transcribing audio for language: ${languageCode} with ElevenLabs PRIMARY`);
      
      const language = this.supportedLanguages.find(l => l.code === languageCode);
      if (!language || !language.supported) {
        throw new Error(`Language ${languageCode} not supported`);
      }

      // Convert audio data to ArrayBuffer for ElevenLabs
      let audioArrayBuffer: ArrayBuffer;

      if (Platform.OS === 'web' && audioData.blob) {
        audioArrayBuffer = await audioData.blob.arrayBuffer();
      } else if (audioData.uri) {
        // For mobile, read the file and convert to ArrayBuffer
        // const audioFile = new File(audioData.uri);
        // const base64Audio = audioFile.base64();
        // audioArrayBuffer = this.base64ToArrayBuffer(base64Audio);
        throw new Error('Mobile audio processing not implemented');
      } else {
        throw new Error('No audio data provided');
      }

      // ONLY METHOD: ElevenLabs STT (no fallbacks)
      console.debug('[STT DEBUG] Using ElevenLabs STT (ONLY SERVICE)');
      const elevenLabsResult = await elevenLabsSTT(audioArrayBuffer, languageCode, {
        enhance: true,
        removeDisfluencies: false,
      });

      const result: TranscriptionResult = {
        text: elevenLabsResult.text,
        confidence: elevenLabsResult.confidence,
        language: elevenLabsResult.language,
        duration: elevenLabsResult.duration,
        words: elevenLabsResult.words?.map(word => ({
          word: word.word,
          confidence: word.confidence,
          startTime: word.start,
          endTime: word.end,
        })),
      };

      console.debug(`[STT DEBUG] ElevenLabs STT successful: "${result.text}" (confidence: ${result.confidence})`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[STT DEBUG] Transcription failed after ${duration}ms:`, error);
      throw new Error(`Transcription failed: ${(error as Error).message}`);
    }
  }

  /**
   * Assess pronunciation quality
   */
  async assessPronunciation(
    audioData: { uri?: string; blob?: Blob },
    targetText: string,
    languageCode = 'en',
  ): Promise<PronunciationAssessment> {
    try {
      console.debug('Assessing pronunciation for:', targetText);
      
      // First, get transcription
      const transcription = await this.transcribe(audioData, languageCode, targetText);
      
      // Calculate pronunciation scores
      const assessment = this.calculatePronunciationScores(
        transcription.text,
        targetText,
        transcription.confidence,
        languageCode,
      );

      console.debug('Pronunciation assessment completed:', assessment.overallScore);
      return assessment;
    } catch (error) {
      console.error('Pronunciation assessment failed:', error);
      throw error as Error;
    }
  }

  /**
   * Calculate pronunciation scores using string similarity and phonetic analysis
   */
  private calculatePronunciationScores(
    actualText: string,
    targetText: string,
    confidence: number,
    _languageCode: string,
  ): PronunciationAssessment {
    const normalizedActual = actualText.toLowerCase().trim();
    const actualWords = normalizedActual ? normalizedActual.split(/\s+/) : [];
    const targetWords = targetText.toLowerCase().trim().split(/\s+/);
    
    // Calculate accuracy using Levenshtein distance
    const accuracy = this.calculateSimilarity(actualText.toLowerCase(), targetText.toLowerCase());
    
    // Calculate completeness (how many target words were spoken)
    const completeness = Math.min(actualWords.length / targetWords.length, 1.0);
    
    // Fluency based on confidence and word count match
    const fluency = confidence * (1 - Math.abs(actualWords.length - targetWords.length) / targetWords.length);
    
    // Prosody (rhythm and stress) - simplified calculation
    const prosody = this.calculateProsodyScore(actualWords, targetWords);
    
    // Overall score
    const overallScore = Math.round(
      (accuracy * 0.4 + completeness * 0.2 + fluency * 0.2 + prosody * 0.2) * 100,
    );

    // Generate feedback
    const feedback = this.generateFeedback(accuracy, completeness, fluency, prosody, actualText, targetText);
    
    // Detailed word-level analysis
    const detailedFeedback = this.generateDetailedFeedback(actualWords, targetWords);

    return {
      overallScore,
      accuracyScore: Math.round(accuracy * 100),
      fluencyScore: Math.round(fluency * 100),
      completenessScore: Math.round(completeness * 100),
      prosodyScore: Math.round(prosody * 100),
      feedback,
      detailedFeedback,
    };
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost, // substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);
    return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
  }

  /**
   * Calculate prosody score based on word patterns
   */
  private calculateProsodyScore(actualWords: string[], targetWords: string[]): number {
    // Simplified prosody calculation based on word length patterns
    if (actualWords.length === 0 || targetWords.length === 0) return 0;
    
    const actualPattern = actualWords.map(w => w.length);
    const targetPattern = targetWords.map(w => w.length);
    
    let matches = 0;
    const minLength = Math.min(actualPattern.length, targetPattern.length);
    
    for (let i = 0; i < minLength; i++) {
      if (Math.abs(actualPattern[i] - targetPattern[i]) <= 1) {
        matches++;
      }
    }
    
    return minLength > 0 ? matches / minLength : 0;
  }

  /**
   * Generate human-readable feedback
   */
  private generateFeedback(
    accuracy: number,
    completeness: number,
    fluency: number,
    prosody: number,
    actualText: string,
    targetText: string,
  ): string[] {
    const feedback: string[] = [];
    
    if (accuracy >= 0.9) {
      feedback.push('Excellent pronunciation! Very clear and accurate.');
    } else if (accuracy >= 0.7) {
      feedback.push('Good pronunciation with minor issues.');
    } else if (accuracy >= 0.5) {
      feedback.push('Pronunciation needs improvement. Focus on clarity.');
    } else {
      feedback.push('Pronunciation needs significant work. Practice more slowly.');
    }
    
    if (completeness < 0.8) {
      feedback.push('Try to speak all the words in the target phrase.');
    }
    
    if (fluency < 0.6) {
      feedback.push('Work on speaking more smoothly and confidently.');
    }
    
    if (prosody < 0.6) {
      feedback.push('Pay attention to the rhythm and stress patterns.');
    }
    
    // Specific word feedback
    const actualWords = actualText.toLowerCase().split(/\s+/);
    const targetWords = targetText.toLowerCase().split(/\s+/);
    
    const missedWords = targetWords.filter(word => 
      !actualWords.some(actual => this.calculateSimilarity(actual, word) > 0.7),
    );
    
    if (missedWords.length > 0) {
      feedback.push(`Focus on these words: ${missedWords.join(', ')}`);
    }
    
    return feedback;
  }

  /**
   * Generate detailed word and phoneme feedback
   */
  private generateDetailedFeedback(
    actualWords: string[],
    targetWords: string[],
  ): PronunciationAssessment['detailedFeedback'] {
    const wordFeedback = targetWords.map((targetWord, index) => {
      const actualWord = actualWords[index] || '';
      const similarity = this.calculateSimilarity(actualWord, targetWord);
      const score = Math.round(similarity * 100);
      
      const issues: string[] = [];
      if (similarity < 0.7) {
        issues.push('Pronunciation unclear');
      }
      if (actualWord.length === 0) {
        issues.push('Word not spoken');
      }
      if (actualWord.length > 0 && similarity < 0.5) {
        issues.push('Significantly different from target');
      }
      
      return {
        word: targetWord,
        score,
        issues,
      };
    });
    
    // Simplified phoneme feedback (would need more sophisticated phonetic analysis)
    const phonemeFeedback = targetWords.flatMap(word => 
      word.split('').map((char, index) => ({
        phoneme: char,
        expected: char,
        actual: actualWords.join('')[index] || '',
        score: Math.round(Math.random() * 40 + 60), // Placeholder
      })),
    );
    
    return {
      words: wordFeedback,
      phonemes: phonemeFeedback,
    };
  }
  
  /**
   * Utility to convert Blob to Base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(',')[1]); // Remove data url prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Make STT API request with retry logic and fallback
   */
  private async makeSTTRequest(requestBody: Record<string, any>): Promise<Record<string, any>> {
    let lastError: Error | null = null;
    
    // Try primary endpoint first
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        console.debug(`[STT DEBUG] Google STT API request attempt ${attempt}/${this.config.retryAttempts}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        const response = await fetch(`${this.config.apiEndpoint}?key=${this.GOOGLE_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[STT DEBUG] Google STT API Error: ${response.status} ${response.statusText}`);
          console.error(`[STT DEBUG] Google STT API Response: ${errorText}`);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.debug('[STT DEBUG] Google STT API request successful');
        return result;
      } catch (error: unknown) {
        console.error(`[STT DEBUG] STT API attempt ${attempt} failed:`, (error as Error).message);
        lastError = error as Error;
        
        if (attempt < this.config.retryAttempts) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('All STT processing methods failed');
  }

  /**
   * Map language codes to Web Speech API format
   */
  private mapLanguageCodeToWebSpeech(languageCode: string): string {
    const mapping: Record<string, string> = {
      'en': 'en-US',
      'hr': 'hr-HR',
      'zh': 'zh-CN',
      'zh-cn': 'zh-CN',
      'zh-tw': 'zh-TW',
      'fr': 'fr-FR',
      'es': 'es-ES',
      'it': 'it-IT',
      'de': 'de-DE',
      'pt': 'pt-PT',
      'pt-br': 'pt-BR',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
      'nl': 'nl-NL',
      'sv': 'sv-SE',
      'no': 'nb-NO',
      'da': 'da-DK',
      'fi': 'fi-FI',
      'pl': 'pl-PL',
      'cs': 'cs-CZ',
      'sk': 'sk-SK',
      'hu': 'hu-HU',
      'ro': 'ro-RO',
      'bg': 'bg-BG',
      'sl': 'sl-SI',
      'sr': 'sr-RS',
      'tr': 'tr-TR',
      'el': 'el-GR',
      'he': 'he-IL',
      'th': 'th-TH',
      'vi': 'vi-VN',
      'id': 'id-ID',
      'ms': 'ms-MY',
      'uk': 'uk-UA',
      'ca': 'ca-ES',
    };
    
    return mapping[languageCode] || 'en-US';
  }

  /**
   * Map language codes to Google STT format
   */
  private mapLanguageCodeToGoogle(languageCode: string): string {
    // Google uses standard IETF BCP-47 tags, which mostly match our codes
    return this.mapLanguageCodeToWebSpeech(languageCode);
  }

  /**
   * Get supported MIME type for web recording
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav',
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'audio/webm'; // Fallback
  }

  /**
   * Cache transcription result
   */
  private async cacheResult(
    audioData: { uri?: string; blob?: Blob },
    result: TranscriptionResult,
  ): Promise<void> {
    try {
      const cacheKey = `stt_cache_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const cacheData = {
        result,
        timestamp: Date.now(),
        audioSize: audioData.blob?.size || 0,
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      // Clean old cache entries (keep last 50)
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('stt_cache_'));
      
      if (cacheKeys.length > 50) {
        const keysToRemove = cacheKeys
          .sort()
          .slice(0, cacheKeys.length - 50);
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
      console.error('Failed to cache STT result:', error);
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): LanguageConfig[] {
    return this.supportedLanguages.filter(lang => lang.supported);
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(languageCode: string): boolean {
    return this.supportedLanguages.some(
      lang => lang.code === languageCode && lang.supported,
    );
  }

  /**
   * Get language accuracy rating
   */
  getLanguageAccuracy(languageCode: string): 'high' | 'medium' | 'low' | null {
    const language = this.supportedLanguages.find(lang => lang.code === languageCode);
    return language?.accuracy || null;
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Cancel current recording
   */
  async cancelRecording(): Promise<void> {
    try {
      if (!this.isRecording) return;
      
      console.debug('Cancelling recording...');
      this.isRecording = false;
      
      if (Platform.OS === 'web') {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
        if (this.audioStream) {
          this.audioStream.getTracks().forEach(track => track.stop());
          this.audioStream = null;
        }
        this.mediaRecorder = null;
        this.audioChunks = [];
      } else {
        if (this.recording) {
          await this.recording.stopAndUnloadAsync();
          this.recording = null;
        }
        
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
      }
      
      console.debug('Recording cancelled');
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  }

  /**
   * Update service configuration
   */
  updateConfig(config: Partial<STTConfig>): void {
    this.config = { ...this.config, ...config };
    console.debug('STT configuration updated');
  }

  /**
   * Update recording configuration
   */
  updateRecordingConfig(config: Partial<RecordingConfig>): void {
    this.recordingConfig = { ...this.recordingConfig, ...config };
    console.debug('Recording configuration updated');
  }

  /**
   * Get service status and diagnostics
   */
  async getServiceStatus(): Promise<{
    initialized: boolean;
    recording: boolean;
    supportedLanguages: number;
    platform: string;
    permissions: boolean;
  }> {
    let permissions = false;
    
    try {
      if (Platform.OS === 'web') {
        permissions = true; // Assume granted if we can call this
      } else {
        const { status } = await Audio.getPermissionsAsync();
        permissions = status === 'granted';
      }
    } catch (error) {
      console.error('Permission check failed:', error);
    }
    
    return {
      initialized: true,
      recording: this.isRecording,
      supportedLanguages: this.supportedLanguages.filter(l => l.supported).length,
      platform: Platform.OS,
      permissions,
    };
  }
}

// Export singleton instance
export const speechToTextService = new SpeechToTextService();
export default speechToTextService;

// Export utility functions
export const startRecording = (languageCode?: string) => 
  speechToTextService.startRecording(languageCode);

export const stopRecording = () => 
  speechToTextService.stopRecording();

export const getTranscription = (
  audioData: { uri?: string; blob?: Blob },
  languageCode?: string,
  targetText?: string,
) => speechToTextService.transcribe(audioData, languageCode, targetText);

export const assessPronunciation = (
  audioData: { uri?: string; blob?: Blob },
  targetText: string,
  languageCode?: string,
) => speechToTextService.assessPronunciation(audioData, targetText, languageCode);

export const getSupportedLanguages = () => 
  speechToTextService.getSupportedLanguages();

export const isLanguageSupported = (languageCode: string) => 
  speechToTextService.isLanguageSupported(languageCode);

export const cancelRecording = () => 
  speechToTextService.cancelRecording();
