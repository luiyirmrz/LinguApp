// Google Text-to-Speech Configuration Service
// Centralized configuration for Google Cloud TTS API
// Optimized voice selection and settings for language learning

export interface GoogleTTSVoiceConfig {
  languageCode: string;
  voiceName: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  description: string;
  quality: 'Standard' | 'WaveNet' | 'Neural2';
}

export class GoogleTTSConfigService {
  // API Configuration
  static readonly API_KEY = 'AIzaSyAgOFZ9VfrZmvG9TkqCs2WQc8elCqyS6Yo';
  static readonly BASE_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

  // Optimized voice configurations for language learning
  static readonly VOICE_CONFIGS: { [language: string]: GoogleTTSVoiceConfig } = {
    // Croatian - Primary language for greetings (using Czech voice as closest available)
    'hr': {
      languageCode: 'cs-CZ', // Using Czech as Croatian is not available in Google TTS
      voiceName: 'cs-CZ-Wavenet-A', // High-quality Czech voice
      ssmlGender: 'FEMALE',
      description: 'Czech female voice - Used for Croatian (closest available)',
      quality: 'WaveNet',
    },
    
    // English - Interface and explanations
    'en': {
      languageCode: 'en-US',
      voiceName: 'en-US-Neural2-F',
      ssmlGender: 'FEMALE',
      description: 'US English Neural2 - premium quality',
      quality: 'Neural2',
    },
    
    // Spanish - Secondary learning language
    'es': {
      languageCode: 'es-ES',
      voiceName: 'es-ES-Neural2-A',
      ssmlGender: 'FEMALE',
      description: 'Spanish Neural2 - native pronunciation',
      quality: 'Neural2',
    },
    
    // French - Additional language
    'fr': {
      languageCode: 'fr-FR',
      voiceName: 'fr-FR-Neural2-A',
      ssmlGender: 'FEMALE',
      description: 'French Neural2 - authentic accent',
      quality: 'Neural2',
    },
    
    // Italian - Additional language
    'it': {
      languageCode: 'it-IT',
      voiceName: 'it-IT-Neural2-A',
      ssmlGender: 'FEMALE',
      description: 'Italian Neural2 - melodic pronunciation',
      quality: 'Neural2',
    },
    
    // Chinese - Additional language
    'zh': {
      languageCode: 'zh-CN',
      voiceName: 'zh-CN-Neural2-A',
      ssmlGender: 'FEMALE',
      description: 'Mandarin Neural2 - clear tones',
      quality: 'Neural2',
    },
  };

  // Audio settings optimized for language learning
  static readonly LEARNING_AUDIO_CONFIG = {
    // For vocabulary words
    vocabulary: {
      speakingRate: 0.7, // Slower for pronunciation learning
      pitch: 0.0,
      volumeGainDb: 3.0, // Louder for clarity
      // effectsProfileId: ['headphone-class-device'] // Removed: Potentially incompatible with standard voices
    },
    
    // For sentences and phrases
    sentence: {
      speakingRate: 0.8, // Normal pace for comprehension
      pitch: 0.0,
      volumeGainDb: 2.0,
      // effectsProfileId: ['headphone-class-device']
    },
    
    // For greetings (cultural accuracy)
    greeting: {
      speakingRate: 0.6, // Very slow for cultural learning
      pitch: 0.0,
      volumeGainDb: 3.0,
      // effectsProfileId: ['headphone-class-device']
    },
    
    // For pronunciation practice
    pronunciation: {
      speakingRate: 0.5, // Very slow for practice
      pitch: 0.0,
      volumeGainDb: 4.0, // Loudest for practice
      // effectsProfileId: ['headphone-class-device']
    },
  };

  /**
   * Get voice configuration for a language
   */
  static getVoiceConfig(language: string): GoogleTTSVoiceConfig {
    return this.VOICE_CONFIGS[language] || this.VOICE_CONFIGS['en'];
  }

  /**
   * Get audio configuration for exercise type
   */
  static getAudioConfig(exerciseType: 'vocabulary' | 'sentence' | 'greeting' | 'pronunciation') {
    return this.LEARNING_AUDIO_CONFIG[exerciseType] || this.LEARNING_AUDIO_CONFIG.sentence;
  }

  /**
   * Generate TTS request payload
   */
  static createTTSRequest(
    text: string, 
    language: string, 
    exerciseType: 'vocabulary' | 'sentence' | 'greeting' | 'pronunciation' = 'sentence',
  ) {
    const voiceConfig = this.getVoiceConfig(language);
    const audioConfig = this.getAudioConfig(exerciseType);

    return {
      input: { text },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceConfig.voiceName,
        ssmlGender: voiceConfig.ssmlGender,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        ...audioConfig,
      },
    };
  }

  /**
   * Make TTS API call
   */
  static async synthesizeSpeech(
    text: string, 
    language: string, 
    exerciseType: 'vocabulary' | 'sentence' | 'greeting' | 'pronunciation' = 'sentence',
  ): Promise<{ success: boolean; audioData?: ArrayBuffer; error?: string }> {
    const startTime = Date.now();
    try {
      console.debug(`[TTS DEBUG] Synthesizing "${text}" in ${language} for ${exerciseType}`);
      
      const requestBody = this.createTTSRequest(text, language, exerciseType);
      
      console.debug(`[TTS DEBUG] Sending request to Google with voice: ${requestBody.voice.name}`);

      const response = await fetch(`${this.BASE_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TTS DEBUG] Google TTS API Error: ${response.status} ${response.statusText}`);
        console.error(`[TTS DEBUG] Google TTS API Response: ${errorText}`);
        throw new Error(`Google TTS API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.audioContent) {
        throw new Error('No audio content received from Google TTS');
      }

      // Convert base64 to ArrayBuffer
      const audioData = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
      
      const duration = Date.now() - startTime;
      console.debug(`[TTS DEBUG] Successfully synthesized in ${duration}ms using ${requestBody.voice.name}`);
      
      return {
        success: true,
        audioData: audioData.buffer,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[TTS DEBUG] Synthesis failed after ${duration}ms:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown TTS error',
      };
    }
  }

  /**
   * Get available voices for debugging
   */
  static getAvailableVoices(): GoogleTTSVoiceConfig[] {
    return Object.values(this.VOICE_CONFIGS);
  }

  /**
   * Test API connectivity
   */
  static async testAPI(): Promise<boolean> {
    try {
      const result = await this.synthesizeSpeech('Test', 'en', 'sentence');
      return result.success;
    } catch (error) {
      console.error('GoogleTTS: API test failed:', error);
      return false;
    }
  }
}

// Convenience exports
export const googleTTSConfig = GoogleTTSConfigService;
export const synthesizeWithGoogle = GoogleTTSConfigService.synthesizeSpeech;
export const testGoogleTTS = GoogleTTSConfigService.testAPI;
