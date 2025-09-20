// Greetings Audio Service - Text-to-Speech and audio management for greetings lessons
// Provides fallback audio generation when external URLs fail
// Supports both web and mobile platforms with optimized audio handling

import { Platform } from 'react-native';

interface AudioConfig {
  language: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

class GreetingsAudioService {
  private audioCache = new Map<string, string>();
  
  /**
   * Play audio with fallback to text-to-speech
   */
  async playAudio(audioUrl: string, text: string, config: AudioConfig = { language: 'en-US' }): Promise<void> {
    try {
      console.debug('GreetingsAudioService: Attempting to play audio:', audioUrl);
      
      // Try to play the original URL first
      if (await this.tryPlayUrl(audioUrl)) {
        console.debug('GreetingsAudioService: Original audio played successfully');
        return;
      }
      
      // Fallback to text-to-speech
      console.debug('GreetingsAudioService: Original audio failed, using TTS fallback');
      await this.playTextToSpeech(text, config);
      
    } catch (error) {
      console.error('GreetingsAudioService: All audio playback methods failed:', error);
    }
  }
  
  /**
   * Try to play audio from URL
   */
  private async tryPlayUrl(audioUrl: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        const audio = new Audio(audioUrl);
        audio.volume = 1.0;
        
        // Test if the audio can load
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            resolve(false);
          }, 3000); // 3 second timeout
          
          audio.addEventListener('canplaythrough', () => {
            clearTimeout(timeout);
            audio.play()
              .then(() => resolve(true))
              .catch(() => resolve(false));
          });
          
          audio.addEventListener('error', () => {
            clearTimeout(timeout);
            resolve(false);
          });
          
          audio.load();
        });
      } else {
        // Mobile platforms
        const audioModule = await import('expo-av');
        const { sound } = await audioModule.Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true, volume: 1.0 },
        );
        
        // Clean up after playback
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(console.warn);
          }
        });
        
        return true;
      }
    } catch (error) {
      console.warn('GreetingsAudioService: URL playback failed:', error);
      return false;
    }
  }
  
  /**
   * Play text using text-to-speech
   */
  public async playTextToSpeech(text: string, config: AudioConfig): Promise<void> {
    if (Platform.OS === 'web') {
      await this.playWebTTS(text, config);
    } else {
      await this.playMobileTTS(text, config);
    }
  }
  
  /**
   * Web text-to-speech using SpeechSynthesis API
   */
  private async playWebTTS(text: string, config: AudioConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Text-to-speech not supported in this browser'));
        return;
      }
      
      // Wait for voices to be loaded
      const speakWithVoices = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = config.language;
        utterance.rate = config.rate || 0.8;
        utterance.pitch = config.pitch || 1.0;
        utterance.volume = config.volume || 1.0;
        
        // Try to find a good voice for the language
        const voices = speechSynthesis.getVoices();
        console.debug('Available voices:', voices.length);
        
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith(config.language.split('-')[0]),
        ) || voices.find(voice => voice.default);
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.debug('Using voice:', preferredVoice.name, preferredVoice.lang);
        }
        
        utterance.onstart = () => {
          console.debug('GreetingsAudioService: TTS playback started');
        };
        
        utterance.onend = () => {
          console.debug('GreetingsAudioService: TTS playback completed');
          resolve();
        };
        
        utterance.onerror = (event) => {
          console.error('GreetingsAudioService: TTS error:', event);
          reject(new Error(`TTS error: ${event.error}`));
        };
        
        console.debug('GreetingsAudioService: Starting TTS playback:', text);
        speechSynthesis.speak(utterance);
      };
      
      // Check if voices are already loaded
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        speakWithVoices();
      } else {
        // Wait for voices to load
        const voicesChangedHandler = () => {
          speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
          speakWithVoices();
        };
        speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
        
        // Fallback timeout
        setTimeout(() => {
          speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
          speakWithVoices();
        }, 1000);
      }
    });
  }
  
  /**
   * Mobile text-to-speech using expo-speech
   */
  private async playMobileTTS(text: string, config: AudioConfig): Promise<void> {
    try {
      const speechModule = await import('expo-speech');
      
      const options = {
        language: config.language,
        pitch: config.pitch || 1.0,
        rate: config.rate || 0.8,
        volume: config.volume || 1.0,
      };
      
      console.debug('GreetingsAudioService: Starting mobile TTS playback:', text);
      await speechModule.speak(text, options);
    } catch (error) {
      console.error('GreetingsAudioService: Mobile TTS failed:', error);
      throw error;
    }
  }
  
  /**
   * Get appropriate language code for TTS
   */
  getLanguageCode(targetLanguage: string): string {
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'it': 'it-IT',
      'hr': 'hr-HR',
      'zh': 'zh-CN',
    };
    
    return languageMap[targetLanguage] || 'en-US';
  }
  
  /**
   * Clear audio cache
   */
  clearCache(): void {
    this.audioCache.clear();
    console.debug('GreetingsAudioService: Audio cache cleared');
  }
}

export const greetingsAudioService = new GreetingsAudioService();

// Convenience functions
export const playGreetingAudio = (audioUrl: string, text: string, language = 'en') =>
  greetingsAudioService.playAudio(audioUrl, text, { 
    language: greetingsAudioService.getLanguageCode(language), 
  });

export const playGreetingTTS = (text: string, language = 'en') =>
  greetingsAudioService.playTextToSpeech(text, { 
    language: greetingsAudioService.getLanguageCode(language), 
  });
