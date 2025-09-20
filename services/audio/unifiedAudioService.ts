// Unified Audio Service - ElevenLabs ONLY service
// Provides high-quality audio for all exercises and activities in the app
// ElevenLabs is the ONLY TTS/STT service - no fallbacks

import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { File, Paths } from 'expo-file-system';
// import { Buffer } from 'buffer'; // Removed - not available in React Native
import { synthesizeSpeech, speechToText, getBestVoiceForLanguage } from '@/services/audio/elevenLabsService';
import { googleTTSConfig, synthesizeWithGoogle } from '@/services/audio/googleTTSConfig';

interface AudioOptions {
  language: string;
  voiceId?: string;
  useElevenLabs?: boolean;
  useGoogleVoice?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
  quality?: 'standard' | 'premium';
}

interface AudioResult {
  success: boolean;
  audioUrl?: string;
  audioData?: ArrayBuffer;
  method: 'elevenlabs' | 'google' | 'tts' | 'fallback';
  error?: string;
}

interface STTOptions {
  language: string;
  enhance?: boolean;
  removeDisfluencies?: boolean;
}

interface STTResult {
  success: boolean;
  text?: string;
  confidence?: number;
  method: 'elevenlabs' | 'google' | 'fallback';
  error?: string;
}

class UnifiedAudioService {
  private audioCache = new Map<string, AudioResult>();
  private currentSound: Audio.Sound | HTMLAudioElement | null = null;

  /**
   * Play text using the best available audio service
   */
  async playText(
    text: string, 
    options: AudioOptions = { language: 'en' },
  ): Promise<AudioResult> {
    const cacheKey = `${text}_${options.language}_${options.quality || 'standard'}`;
    if (this.audioCache.has(cacheKey)) {
      const cachedResult = this.audioCache.get(cacheKey)!;
      if (cachedResult.success) {
        console.debug('[TTS DEBUG] Playing from cache');
        await this.playAudioResult(cachedResult);
        return cachedResult;
      }
    }

    try {
      // Only log in development
      if (__DEV__) {
        console.debug(`[TTS DEBUG] Attempting to play text: "${text}" with language: "${options.language}"`);
      }

      // ONLY METHOD: ElevenLabs (ONLY SERVICE)
      const elevenLabsResult = await this.tryElevenLabs(text, options);
      if (elevenLabsResult.success) {
        this.audioCache.set(cacheKey, elevenLabsResult);
        await this.playAudioResult(elevenLabsResult);
        return elevenLabsResult;
      }
      
      // ElevenLabs failed - no fallbacks
      console.error('[TTS DEBUG] ElevenLabs TTS failed - no fallbacks available');
      return {
        success: false,
        method: 'elevenlabs',
        error: 'ElevenLabs TTS service failed',
      };

    } catch (error) {
      console.error('[TTS DEBUG] A critical error occurred in playText. All audio methods failed:', error);
      return {
        success: false,
        method: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown audio error',
      };
    }
  }

  /**
   * Try ElevenLabs text-to-speech (PRIMARY SERVICE)
   */
  private async tryElevenLabs(text: string, options: AudioOptions): Promise<AudioResult> {
    try {
      console.debug('UnifiedAudioService: Trying ElevenLabs TTS (PRIMARY)');
      
      const voiceId = options.voiceId || getBestVoiceForLanguage(options.language);
      
      const result = await synthesizeSpeech(text, {
        voiceId,
        voiceSettings: {
          stability: 0.8,
          similarityBoost: 0.8,
          useSpeakerBoost: true,
        },
        // quality: options.quality || 'standard'
      });

      if ((result as any).success && (result as any).audioData) {
        console.debug('UnifiedAudioService: ElevenLabs TTS successful');
        return {
          success: true,
          audioUrl: (result as any).audioUrl,
          audioData: (result as any).audioData,
          method: 'elevenlabs',
        };
      }

      throw new Error('ElevenLabs synthesis failed');
    } catch (error) {
      console.warn('UnifiedAudioService: ElevenLabs failed:', error);
      return {
        success: false,
        method: 'elevenlabs',
        error: error instanceof Error ? error.message : 'ElevenLabs error',
      };
    }
  }

  /**
   * Try Google Cloud Text-to-Speech (FALLBACK SERVICE)
   */
  private async tryGoogleVoice(text: string, options: AudioOptions): Promise<AudioResult> {
    try {
      console.debug('UnifiedAudioService: Trying Google Voice TTS (FALLBACK)');
      
      // Determine exercise type for optimal voice settings
      const exerciseType = this.getExerciseType(text, options);
      
      // Use the centralized Google TTS configuration
      const result = await googleTTSConfig.synthesizeSpeech(text, options.language, exerciseType);
      
      if ((result as any).success && (result as any).audioData) {
        console.debug('UnifiedAudioService: Google Voice TTS successful');
        return {
          success: true,
          audioData: (result as any).audioData,
          method: 'google',
        };
      }

      throw new Error(result.error || 'Google TTS synthesis failed');
    } catch (error) {
      console.warn('UnifiedAudioService: Google Voice failed:', error);
      return {
        success: false,
        method: 'google',
        error: error instanceof Error ? error.message : 'Google Voice error',
      };
    }
  }

  /**
   * Determine exercise type from context
   */
  private getExerciseType(text: string, options: AudioOptions): 'vocabulary' | 'sentence' | 'greeting' | 'pronunciation' {
    // Simple heuristics to determine exercise type
    if (text.length <= 15 && !text.includes(' ')) {
      return 'vocabulary'; // Single words
    } else if (text.includes('Dobar') || text.includes('Bok') || text.includes('Hello') || text.includes('Good')) {
      return 'greeting'; // Greetings
    } else if (text.length <= 50) {
      return 'pronunciation'; // Short phrases for pronunciation
    } else {
      return 'sentence'; // Longer sentences
    }
  }

  /**
   * Fallback to browser text-to-speech
   */
  private async tryBrowserTTS(text: string, options: AudioOptions): Promise<AudioResult> {
    try {
      console.debug('UnifiedAudioService: Using browser TTS fallback');
      
      if (Platform.OS !== 'web' || !('speechSynthesis' in window)) {
        throw new Error('Browser TTS not available');
      }

      await this.playWebTTS(text, options);
      
      return {
        success: true,
        method: 'tts',
      };
    } catch (error) {
      console.error('UnifiedAudioService: Browser TTS failed:', error);
      return {
        success: false,
        method: 'tts',
        error: error instanceof Error ? error.message : 'Browser TTS error',
      };
    }
  }

  /**
   * Play audio result using appropriate method
   */
  private async playAudioResult(result: AudioResult): Promise<void> {
    if (!result.success) return;

    try {
      await this.stopCurrentAudio();

      if (result.audioUrl) {
        await this.playSound({ uri: result.audioUrl });
      } else if (result.audioData) {
        await this.playAudioData(result.audioData);
      }
    } catch (error) {
      console.error('UnifiedAudioService: Error playing audio result:', error);
    }
  }

  /**
   * Play audio from ArrayBuffer data, optimized for all platforms
   */
  private async playAudioData(audioData: ArrayBuffer): Promise<void> {
    if (Platform.OS === 'web') {
      // Use Blob URL approach for web
      const blob = new Blob([audioData], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);
      await this.playSound({ uri: audioUrl, isBlob: true });
    } else {
      // For mobile, save to a temporary file and play from there
      try {
        // Create a temporary file in the cache directory
        const tempFile = new File(Paths.cache, `audio-${Date.now()}.mp3`);
        
        // Convert ArrayBuffer to Uint8Array and write to file
        const uint8Array = new Uint8Array(audioData);
        tempFile.write(uint8Array);
        
        await this.playSound({ uri: tempFile.uri });
      } catch (error) {
        console.error('UnifiedAudioService: Error saving or playing audio file:', error);
      }
    }
  }

  /**
   * Unified sound playback for web and mobile
   */
  private async playSound(source: { uri: string; isBlob?: boolean }): Promise<void> {
    if (Platform.OS === 'web') {
      const audio = new (window as any).Audio(source.uri);
      this.currentSound = audio;
      
      if (source.isBlob) {
        audio.onended = () => URL.revokeObjectURL(source.uri);
      }
      
      await audio.play();
    } else {
      const { sound } = await Audio.Sound.createAsync(
        { uri: source.uri },
        { shouldPlay: true },
      );
      this.currentSound = sound;
      
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
          // Clean up file if it's in the cache
          if (Paths.cache && source.uri.startsWith(Paths.cache.uri)) {
            try {
              const fileToDelete = new File(source.uri);
              if (fileToDelete.exists) {
                fileToDelete.delete();
              }
            } catch (error) {
              console.warn('Failed to delete temporary audio file:', error);
            }
          }
        }
      });
    }
  }

  /**
   * Web TTS implementation
   */
  private async playWebTTS(text: string, options: AudioOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.getBrowserLanguageCode(options.language);
      utterance.rate = options.rate || 0.8;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Find the best voice for the language
      const voices = speechSynthesis.getVoices();
      const preferredVoice = this.findBestVoice(voices, options.language);
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.debug('UnifiedAudioService: Using voice:', preferredVoice.name, preferredVoice.lang);
      }

      utterance.onstart = () => {
        console.debug('UnifiedAudioService: TTS started');
      };

      utterance.onend = () => {
        console.debug('UnifiedAudioService: TTS completed');
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('UnifiedAudioService: TTS error:', event);
        reject(new Error(`TTS error: ${event.error}`));
      };

      speechSynthesis.speak(utterance);
    });
  }

  /**
   * Find the best voice for a language
   */
  private findBestVoice(voices: SpeechSynthesisVoice[], language: string): SpeechSynthesisVoice | null {
    // Priority order: exact match, language match, default, any
    const langCode = language.split('-')[0];
    
    return voices.find(voice => voice.lang === language) ||
           voices.find(voice => voice.lang.startsWith(langCode)) ||
           voices.find(voice => voice.default) ||
           voices[0] ||
           null;
  }

  /**
   * Stop currently playing audio
   */
  async stopCurrentAudio(): Promise<void> {
    try {
      if (this.currentSound) {
        if (this.currentSound instanceof Audio.Sound) {
          await this.currentSound.unloadAsync();
        } else {
          this.currentSound.pause();
          this.currentSound.currentTime = 0;
        }
        this.currentSound = null;
      }

      // Stop speech synthesis if active
      if (Platform.OS === 'web' && 'speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    } catch (error) {
      console.warn('UnifiedAudioService: Error stopping audio:', error);
    }
  }
  

  /**
   * Get the best Google Cloud voice for each language
   */
  private getBestGoogleVoice(language: string): string {
    const voiceMap: { [key: string]: string } = {
      'en': 'en-US-Neural2-F', // Clear female voice
      'es': 'es-ES-Neural2-A', // Spanish female voice
      'fr': 'fr-FR-Neural2-A', // French female voice
      'it': 'it-IT-Neural2-A', // Italian female voice
      'hr': 'hr-HR-Standard-A', // Croatian voice (best available)
      'zh': 'zh-CN-Neural2-A', // Chinese female voice
      'de': 'de-DE-Neural2-A', // German female voice
      'pt': 'pt-BR-Neural2-A', // Portuguese female voice
      'ru': 'ru-RU-Standard-A', // Russian voice
      'ja': 'ja-JP-Neural2-B', // Japanese female voice
    };
    
    return voiceMap[language] || 'en-US-Neural2-F';
  }

  /**
   * Get Google Cloud language code
   */
  private getGoogleLanguageCode(language: string): string {
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'it': 'it-IT',
      'hr': 'hr-HR',
      'zh': 'zh-CN',
      'de': 'de-DE',
      'pt': 'pt-BR',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
    };
    
    return languageMap[language] || 'en-US';
  }

  /**
   * Get browser-compatible language code
   */
  private getBrowserLanguageCode(language: string): string {
    return this.getGoogleLanguageCode(language);
  }

  /**
   * Speech-to-Text using ElevenLabs as PRIMARY service
   */
  async speechToText(
    audioData: ArrayBuffer,
    options: STTOptions,
  ): Promise<STTResult> {
    try {
      console.debug(`[STT DEBUG] Converting speech to text for language: ${options.language}`);

      // ONLY METHOD: ElevenLabs STT
      const elevenLabsResult = await this.tryElevenLabsSTT(audioData, options);
      if (elevenLabsResult.success) {
        return elevenLabsResult;
      }
      
      // ElevenLabs failed - no fallbacks
      console.error('[STT DEBUG] ElevenLabs STT failed - no fallbacks available');
      return {
        success: false,
        method: 'elevenlabs',
        error: 'ElevenLabs STT service failed',
      };

    } catch (error) {
      console.error('[STT DEBUG] A critical error occurred in speechToText:', error);
      return {
        success: false,
        method: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown STT error',
      };
    }
  }

  /**
   * Try ElevenLabs Speech-to-Text (PRIMARY STT SERVICE)
   */
  private async tryElevenLabsSTT(audioData: ArrayBuffer, options: STTOptions): Promise<STTResult> {
    try {
      console.debug('UnifiedAudioService: Trying ElevenLabs STT (PRIMARY)');
      
      const result = await speechToText(audioData, options.language, {
        enhance: options.enhance || true,
        removeDisfluencies: options.removeDisfluencies || false,
      });

      console.debug('UnifiedAudioService: ElevenLabs STT successful');
      return {
        success: true,
        text: result.text,
        confidence: result.confidence,
        method: 'elevenlabs',
      };
    } catch (error) {
      console.warn('UnifiedAudioService: ElevenLabs STT failed:', error);
      return {
        success: false,
        method: 'elevenlabs',
        error: error instanceof Error ? error.message : 'ElevenLabs STT error',
      };
    }
  }

  /**
   * Try Google Speech-to-Text (FALLBACK STT SERVICE)
   */
  private async tryGoogleSTT(audioData: ArrayBuffer, options: STTOptions): Promise<STTResult> {
    try {
      console.debug('UnifiedAudioService: Trying Google STT (FALLBACK)');
      
      // This would integrate with Google STT service
      // For now, return a mock response
      return {
        success: false,
        method: 'google',
        error: 'Google STT not implemented yet',
      };
    } catch (error) {
      console.warn('UnifiedAudioService: Google STT failed:', error);
      return {
        success: false,
        method: 'google',
        error: error instanceof Error ? error.message : 'Google STT error',
      };
    }
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    this.audioCache.clear();
    console.debug('UnifiedAudioService: Cache cleared');
  }

  /**
   * Get cache size for debugging
   */
  getCacheSize(): number {
    return this.audioCache.size;
  }
}

export const unifiedAudioService = new UnifiedAudioService();

// Convenience functions for different use cases - ElevenLabs as PRIMARY
export const playLessonAudio = (text: string, language: string, voiceId?: string) =>
  unifiedAudioService.playText(text, { 
    language, 
    voiceId,
    useElevenLabs: true, // PRIMARY: ElevenLabs
    quality: 'premium', 
  });

export const playExerciseAudio = (text: string, language: string) =>
  unifiedAudioService.playText(text, { 
    language,
    useElevenLabs: true, // PRIMARY: ElevenLabs
    useGoogleVoice: true, // FALLBACK: Google Voice
    quality: 'premium', // Use premium quality with ElevenLabs
  });

export const playQuickAudio = (text: string, language: string = 'en') =>
  unifiedAudioService.playText(text, { 
    language,
    useElevenLabs: true, // PRIMARY: ElevenLabs
    useGoogleVoice: true, // FALLBACK: Google Voice
    quality: 'standard',
  });

// STT Convenience functions - ElevenLabs as PRIMARY
export const convertSpeechToText = (audioData: ArrayBuffer, language: string) =>
  unifiedAudioService.speechToText(audioData, { 
    language,
    enhance: true,
    removeDisfluencies: false,
  });

export const convertSpeechToTextEnhanced = (audioData: ArrayBuffer, language: string) =>
  unifiedAudioService.speechToText(audioData, { 
    language,
    enhance: true,
    removeDisfluencies: true,
  });
