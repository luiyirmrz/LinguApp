/**
 * Custom Hook for Speech-to-Text Pronunciation Feedback
 * Provides easy-to-use interface for pronunciation assessment in language learning
 */

import { useState, useCallback, useEffect } from 'react';
import {
  speechToTextService,
  PronunciationAssessment,
  TranscriptionResult,
  LanguageConfig,
} from '@/services/audio/speechToText';

export interface UsePronunciationFeedbackOptions {
  targetText: string;
  languageCode: string;
  maxAttempts?: number;
  autoInitialize?: boolean;
  offlineMode?: boolean;
  onComplete?: (assessment: PronunciationAssessment) => void;
  onError?: (error: string) => void;
}

export interface PronunciationFeedbackState {
  // Service state
  isInitialized: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  
  // Results
  assessment: PronunciationAssessment | null;
  transcription: TranscriptionResult | null;
  
  // Metadata
  attempts: number;
  error: string | null;
  supportedLanguages: LanguageConfig[];
  
  // Language info
  isLanguageSupported: boolean;
  languageAccuracy: 'high' | 'medium' | 'low' | null;
}

export interface PronunciationFeedbackActions {
  // Core actions
  initialize: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  
  // Utility actions
  reset: () => void;
  retry: () => void;
  
  // Configuration
  updateConfig: (config: any) => void;
  getServiceStatus: () => Promise<any>;
}

export const usePronunciationFeedback = (
  options: UsePronunciationFeedbackOptions,
): [PronunciationFeedbackState, PronunciationFeedbackActions] => {
  const {
    targetText,
    languageCode,
    maxAttempts = 3,
    autoInitialize = true,
    offlineMode = true,
    onComplete,
    onError,
  } = options;

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assessment, setAssessment] = useState<PronunciationAssessment | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<LanguageConfig[]>([]);

  // Derived state
  const isLanguageSupported = speechToTextService.isLanguageSupported(languageCode);
  const languageAccuracy = speechToTextService.getLanguageAccuracy(languageCode);

  // Initialize service
  const initialize = useCallback(async () => {
    try {
      console.debug('Initializing pronunciation feedback service...');
      
      await speechToTextService.initialize({
        offlineMode,
        cacheResults: true,
        timeout: 15000,
        retryAttempts: 2,
      });
      
      const languages = speechToTextService.getSupportedLanguages();
      setSupportedLanguages(languages);
      setIsInitialized(true);
      
      console.debug(`STT service initialized with ${languages.length} languages`);
    } catch (err) {
      const errorMessage = `Failed to initialize: ${(err as Error).message}`;
      console.error(errorMessage);
      setError(errorMessage);
      if (onError) onError(errorMessage);
    }
  }, [offlineMode, onError]);

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInitialize && !isInitialized) {
      initialize();
    }
  }, [autoInitialize, isInitialized, initialize]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isInitialized) {
      const errorMessage = 'Service not initialized';
      setError(errorMessage);
      if (onError) onError(errorMessage);
      return;
    }

    if (!isLanguageSupported) {
      const errorMessage = `Language ${languageCode} is not supported`;
      setError(errorMessage);
      if (onError) onError(errorMessage);
      return;
    }

    if (attempts >= maxAttempts) {
      const errorMessage = `Maximum attempts (${maxAttempts}) reached`;
      setError(errorMessage);
      if (onError) onError(errorMessage);
      return;
    }

    try {
      setError(null);
      setIsRecording(true);
      
      console.debug(`Starting recording for ${languageCode}: \"${targetText}\"`);
      await speechToTextService.startRecording(languageCode);
      
    } catch (err) {
      const errorMessage = `Recording failed: ${(err as Error).message}`;
      console.error(errorMessage);
      setError(errorMessage);
      setIsRecording(false);
      if (onError) onError(errorMessage);
    }
  }, [
    isInitialized,
    isLanguageSupported,
    languageCode,
    targetText,
    attempts,
    maxAttempts,
    onError,
  ]);

  // Stop recording and process
  const stopRecording = useCallback(async () => {
    if (!isRecording) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      console.debug('Processing pronunciation assessment...');
      
      // Get audio data
      const audioData = await speechToTextService.stopRecording();
      
      // Get transcription
      const transcriptionResult = await speechToTextService.transcribe(
        audioData,
        languageCode,
        targetText,
      );
      
      // Get pronunciation assessment
      const assessmentResult = await speechToTextService.assessPronunciation(
        audioData,
        targetText,
        languageCode,
      );
      
      // Update state
      setTranscription(transcriptionResult);
      setAssessment(assessmentResult);
      setAttempts(prev => prev + 1);
      
      // Call completion callback
      if (onComplete) {
        onComplete(assessmentResult);
      }
      
      console.debug('Assessment completed:', {
        score: assessmentResult.overallScore,
        transcription: transcriptionResult.text,
        attempt: attempts + 1,
      });
      
    } catch (err) {
      const errorMessage = `Processing failed: ${(err as Error).message}`;
      console.error(errorMessage);
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [
    isRecording,
    languageCode,
    targetText,
    attempts,
    onComplete,
    onError,
  ]);

  // Cancel recording
  const cancelRecording = useCallback(async () => {
    try {
      if (isRecording) {
        await speechToTextService.cancelRecording();
        setIsRecording(false);
        console.debug('Recording cancelled');
      }
    } catch (err) {
      console.error('Failed to cancel recording:', err);
    }
  }, [isRecording]);

  // Reset state
  const reset = useCallback(() => {
    setAssessment(null);
    setTranscription(null);
    setError(null);
    setAttempts(0);
    console.debug('Pronunciation feedback reset');
  }, []);

  // Retry (reset and start new recording)
  const retry = useCallback(async () => {
    reset();
    // Small delay to ensure state is updated
    setTimeout(() => {
      startRecording();
    }, 100);
  }, [reset, startRecording]);

  // Update configuration
  const updateConfig = useCallback((config: any) => {
    speechToTextService.updateConfig(config);
    console.debug('STT configuration updated');
  }, []);

  // Get service status
  const getServiceStatus = useCallback(async () => {
    try {
      return await speechToTextService.getServiceStatus();
    } catch (err) {
      console.error('Failed to get service status:', err);
      throw err;
    }
  }, []);

  // Enhanced cleanup on unmount with proper resource management
  useEffect(() => {
    return () => {
      // Cleanup function for component unmount
      const cleanup = async () => {
        try {
          // Cancel any ongoing recording
          if (isRecording) {
            await cancelRecording();
          }
          
          // Clean up speech-to-text service resources
          if (isInitialized && 'cleanup' in speechToTextService) {
            await (speechToTextService as any).cleanup();
          }
          
          console.debug('Pronunciation feedback hook cleaned up successfully');
        } catch (error) {
          console.warn('Error during pronunciation feedback cleanup:', error);
        }
      };
      
      cleanup();
    };
  }, [isRecording, cancelRecording, isInitialized]);

  // State object
  const state: PronunciationFeedbackState = {
    isInitialized,
    isRecording,
    isProcessing,
    assessment,
    transcription,
    attempts,
    error,
    supportedLanguages,
    isLanguageSupported,
    languageAccuracy,
  };

  // Actions object
  const actions: PronunciationFeedbackActions = {
    initialize,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
    retry,
    updateConfig,
    getServiceStatus,
  };

  return [state, actions];
};

// Utility hook for simple transcription (without pronunciation assessment)
export const useTranscription = (languageCode: string = 'en') => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setIsRecording(true);
      await speechToTextService.startRecording(languageCode);
    } catch (err) {
      setError((err as Error).message);
      setIsRecording(false);
    }
  }, [languageCode]);

  const stopRecording = useCallback(async () => {
    if (!isRecording) return '';

    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      const audioData = await speechToTextService.stopRecording();
      const result = await speechToTextService.transcribe(audioData, languageCode);
      
      setTranscription(result.text);
      return result.text;
    } catch (err) {
      setError((err as Error).message);
      return '';
    } finally {
      setIsProcessing(false);
    }
  }, [isRecording, languageCode]);

  const reset = useCallback(() => {
    setTranscription('');
    setError(null);
  }, []);

  return {
    isRecording,
    isProcessing,
    transcription,
    error,
    startRecording,
    stopRecording,
    reset,
  };
};

// Utility hook for language support checking
export const useLanguageSupport = () => {
  const [supportedLanguages, setSupportedLanguages] = useState<LanguageConfig[]>([]);

  useEffect(() => {
    const languages = speechToTextService.getSupportedLanguages();
    setSupportedLanguages(languages);
  }, []);

  const isSupported = useCallback((languageCode: string) => {
    return speechToTextService.isLanguageSupported(languageCode);
  }, []);

  const getAccuracy = useCallback((languageCode: string) => {
    return speechToTextService.getLanguageAccuracy(languageCode);
  }, []);

  const getLanguageInfo = useCallback((languageCode: string) => {
    return supportedLanguages.find(lang => lang.code === languageCode);
  }, [supportedLanguages]);

  return {
    supportedLanguages,
    isSupported,
    getAccuracy,
    getLanguageInfo,
  };
};

export default usePronunciationFeedback;
