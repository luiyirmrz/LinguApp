// Universal Audio Hook - Centralized audio management for all exercises and components
// ElevenLabs as PRIMARY service with Google Voice and TTS fallbacks for professional audio experience
// Provides consistent audio interface across the entire application

import { useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { unifiedAudioService } from '@/services/audio/unifiedAudioService';

interface UseUniversalAudioOptions {
  defaultLanguage?: string;
  quality?: 'standard' | 'premium';
  rate?: number;
  enableHapticFeedback?: boolean;
}

interface AudioPlayOptions {
  language?: string;
  voiceId?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  useElevenLabs?: boolean;
  useGoogleVoice?: boolean;
}

interface STTOptions {
  language?: string;
  enhance?: boolean;
  removeDisfluencies?: boolean;
}

export const useUniversalAudio = (options: UseUniversalAudioOptions = {}) => {
  const { user } = useUnifiedAuth();
  const { currentLanguage } = useLanguage();
  const currentAudioRef = useRef<any>(null);

  // Get default language for audio
  const getTargetLanguage = useCallback((override?: string): string => {
    return override || 
           options.defaultLanguage || 
           user?.currentLanguage?.code || 
           currentLanguage?.code || 
           'en';
  }, [options.defaultLanguage, user?.currentLanguage?.code, currentLanguage?.code]);

  /**
   * Play text using professional TTS (ElevenLabs PRIMARY, Google Voice fallback)
   */
  const playText = useCallback(async (
    text: string, 
    audioOptions: AudioPlayOptions = {},
  ): Promise<{ success: boolean; method: string; error?: string }> => {
    try {
      const targetLanguage = getTargetLanguage(audioOptions.language);
      
      console.debug('UniversalAudio: Playing text:', text, 'Language:', targetLanguage);
      
      // Stop any currently playing audio
      await stopAudio();
      
      const result = await unifiedAudioService.playText(text, {
        language: targetLanguage,
        voiceId: audioOptions.voiceId,
        useElevenLabs: audioOptions.useElevenLabs !== false, // Default true - PRIMARY
        useGoogleVoice: audioOptions.useGoogleVoice !== false, // Default true - FALLBACK
        quality: options.quality || 'premium',
        rate: audioOptions.rate || options.rate || 0.8,
        pitch: audioOptions.pitch || 1.0,
        volume: audioOptions.volume || 1.0,
      });

      if (result.success) {
        console.debug(`UniversalAudio: Success using ${result.method} for "${text}"`);
        
        // Haptic feedback if enabled
        if (options.enableHapticFeedback && Platform.OS !== 'web') {
          try {
            const haptics = await import('expo-haptics');
            await haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
          } catch (hapticError) {
            console.warn('Haptic feedback failed:', hapticError);
          }
        }
      }

      return result;
    } catch (error) {
      console.error('UniversalAudio: Error playing text:', error);
      return {
        success: false,
        method: 'error',
        error: error instanceof Error ? error.message : 'Unknown audio error',
      };
    }
  }, [getTargetLanguage, options.quality, options.rate, options.enableHapticFeedback]);

  /**
   * Play vocabulary word with pronunciation
   */
  const playVocabulary = useCallback(async (
    word: string,
    language?: string,
    pronunciation?: string,
  ): Promise<{ success: boolean; method: string }> => {
    // Use pronunciation if available, otherwise the word itself
    const textToSpeak = pronunciation || word;
    return await playText(textToSpeak, { language });
  }, [playText]);

  /**
   * Play sentence or phrase for comprehension
   */
  const playSentence = useCallback(async (
    sentence: string,
    language?: string,
    slower: boolean = false,
  ): Promise<{ success: boolean; method: string }> => {
    return await playText(sentence, { 
      language,
      rate: slower ? 0.6 : 0.8, // Slower for comprehension exercises
    });
  }, [playText]);

  /**
   * Play greeting with appropriate cultural pronunciation
   */
  const playGreeting = useCallback(async (
    greeting: string,
    language?: string,
    cultural: boolean = true,
  ): Promise<{ success: boolean; method: string }> => {
    return await playText(greeting, { 
      language,
      rate: cultural ? 0.7 : 0.8, // Even slower for cultural accuracy
      useElevenLabs: true, // Prefer ElevenLabs for greetings
    });
  }, [playText]);

  /**
   * Play pronunciation example
   */
  const playPronunciation = useCallback(async (
    text: string,
    language?: string,
    phonetic?: string,
  ): Promise<{ success: boolean; method: string }> => {
    // For pronunciation, prefer the phonetic version if available
    const textToSpeak = phonetic || text;
    return await playText(textToSpeak, { 
      language,
      rate: 0.6, // Very slow for pronunciation practice
      useElevenLabs: true,
    });
  }, [playText]);

  /**
   * Convert speech to text using ElevenLabs as PRIMARY service
   */
  const speechToText = useCallback(async (
    audioData: ArrayBuffer,
    sttOptions: STTOptions = {},
  ): Promise<{ success: boolean; text?: string; confidence?: number; method?: string; error?: string }> => {
    try {
      const targetLanguage = getTargetLanguage(sttOptions.language);
      
      console.debug('UniversalAudio: Converting speech to text for language:', targetLanguage);
      
      const result = await unifiedAudioService.speechToText(audioData, {
        language: targetLanguage,
        enhance: sttOptions.enhance !== false, // Default true
        removeDisfluencies: sttOptions.removeDisfluencies || false,
      });

      if (result.success) {
        console.debug(`UniversalAudio: STT success using ${result.method}: "${result.text}"`);
      } else {
        console.warn(`UniversalAudio: STT failed using ${result.method}:`, result.error);
      }

      return result;
    } catch (error) {
      console.error('UniversalAudio: Error in speech-to-text:', error);
      return {
        success: false,
        method: 'error',
        error: error instanceof Error ? error.message : 'Unknown STT error',
      };
    }
  }, [getTargetLanguage]);

  /**
   * Stop any currently playing audio
   */
  const stopAudio = useCallback(async (): Promise<void> => {
    try {
      await unifiedAudioService.stopCurrentAudio();
      currentAudioRef.current = null;
    } catch (error) {
      console.warn('UniversalAudio: Error stopping audio:', error);
    }
  }, []);

  /**
   * Test audio functionality
   */
  const testAudio = useCallback(async (language?: string): Promise<boolean> => {
    const testText = getTestText(getTargetLanguage(language));
    const result = await playText(testText, { language });
    return result.success;
  }, [playText, getTargetLanguage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio().catch(console.warn);
    };
  }, [stopAudio]);

  return {
    // Main TTS functions
    playText,
    playVocabulary,
    playSentence,
    playGreeting,
    playPronunciation,
    stopAudio,
    testAudio,
    
    // STT functions
    speechToText,
    
    // Utilities
    getTargetLanguage,
    isAudioSupported: Platform.OS === 'web' ? 'speechSynthesis' in window : true,
    
    // Service access
    clearCache: () => unifiedAudioService.clearCache(),
    getCacheSize: () => unifiedAudioService.getCacheSize(),
  };
};

/**
 * Get test text for different languages
 */
function getTestText(language: string): string {
  const testTexts: { [key: string]: string } = {
    'en': 'Hello, this is a test',
    'es': 'Hola, esto es una prueba',
    'fr': 'Bonjour, ceci est un test',
    'it': 'Ciao, questo è un test',
    'hr': 'Bok, ovo je test',
    'zh': '你好，这是一个测试',
    'de': 'Hallo, das ist ein Test',
    'pt': 'Olá, este é um teste',
    'ru': 'Привет, это тест',
    'ja': 'こんにちは、これはテストです',
  };
  
  return testTexts[language] || testTexts['en'];
}
