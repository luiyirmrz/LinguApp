/**
 * Comprehensive Pronunciation Evaluation Hook
 * Integrates ElevenLabs, Speech-to-Text, and visual feedback
 * Provides complete pronunciation assessment workflow
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert, Vibration } from 'react-native';
import { 
  elevenLabsService, 
  SpeechResult, 
  PronunciationEvaluation,
  VoiceConfig, 
} from '@/services/audio/elevenLabsService';
import { 
  speechToTextService, 
  PronunciationAssessment,
  TranscriptionResult, 
} from '@/services/audio/speechToText';

export interface PronunciationEvaluationOptions {
  targetText: string;
  languageCode: string;
  maxAttempts?: number;
  autoInitialize?: boolean;
  enableHapticFeedback?: boolean;
  enableAudioFeedback?: boolean;
  customVoiceId?: string;
  onComplete?: (evaluation: PronunciationEvaluation) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
}

export interface PronunciationEvaluationState {
  // Service state
  isInitialized: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  isEvaluating: boolean;
  
  // Audio state
  hasRecorded: boolean;
  recordingDuration: number;
  audioData?: ArrayBuffer;
  
  // Results
  evaluation: PronunciationEvaluation | null;
  transcription: TranscriptionResult | null;
  referenceAudio: SpeechResult | null;
  
  // Progress tracking
  attempts: number;
  bestScore: number;
  currentScore: number;
  
  // Voice configuration
  availableVoices: VoiceConfig[];
  selectedVoice: VoiceConfig | null;
  
  // Error handling
  error: string | null;
  lastError: string | null;
}

export interface PronunciationEvaluationActions {
  // Core actions
  initialize: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  evaluatePronunciation: (audioData?: ArrayBuffer) => Promise<void>;
  
  // Audio management
  loadReferenceAudio: () => Promise<void>;
  playReferenceAudio: () => Promise<void>;
  stopReferenceAudio: () => Promise<void>;
  
  // Voice management
  selectVoice: (voiceId: string) => void;
  getVoicesForLanguage: (languageCode: string) => VoiceConfig[];
  
  // Progress management
  retry: () => void;
  reset: () => void;
  nextAttempt: () => void;
  
  // Configuration
  updateOptions: (options: Partial<PronunciationEvaluationOptions>) => void;
  getServiceStatus: () => Promise<any>;
}

export const usePronunciationEvaluation = (
  options: PronunciationEvaluationOptions,
): [PronunciationEvaluationState, PronunciationEvaluationActions] => {
  const {
    targetText,
    languageCode,
    maxAttempts = 3,
    autoInitialize = true,
    enableHapticFeedback = true,
    enableAudioFeedback = true,
    customVoiceId,
    onComplete,
    onError,
    onProgress,
  } = options;

  // State management
  const [state, setState] = useState<PronunciationEvaluationState>({
    isInitialized: false,
    isRecording: false,
    isProcessing: false,
    isEvaluating: false,
    hasRecorded: false,
    recordingDuration: 0,
    audioData: undefined,
    evaluation: null,
    transcription: null,
    referenceAudio: null,
    attempts: 0,
    bestScore: 0,
    currentScore: 0,
    availableVoices: [],
    selectedVoice: null,
    error: null,
    lastError: null,
  });

  // Refs for timers and cleanup
  const recordingTimer = useRef<any>(null);
  const recordingStartTime = useRef<number>(0);
  const audioPlayer = useRef<any>(null);

  // Initialize services
  const initialize = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));

      // Initialize ElevenLabs service
      await elevenLabsService.initialize();
      
      // Initialize speech-to-text service
      await speechToTextService.initialize();

      // Load available voices
      const voices = elevenLabsService.getAvailableVoices();
      const languageVoices = elevenLabsService.getVoicesForLanguage(languageCode);
      
      // Set default voice
      const defaultVoice = customVoiceId 
        ? elevenLabsService.getVoiceById(customVoiceId)
        : languageVoices[0] || voices[0];

      setState(prev => ({
        ...prev,
        isInitialized: true,
        availableVoices: voices,
        selectedVoice: defaultVoice || null,
      }));

      // Load reference audio
      await loadReferenceAudio();

      onProgress?.(100);
    } catch (error) {
      const errorMessage = `Initialization failed: ${(error as Error).message}`;
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        lastError: errorMessage,
      }));
      onError?.(errorMessage);
    }
  }, [languageCode, customVoiceId, onProgress, onError]);

  // Load reference audio
  const loadReferenceAudio = useCallback(async () => {
    try {
      if (!state.selectedVoice) return;

      const voiceId = customVoiceId || state.selectedVoice.id;
      const audio = await elevenLabsService.synthesizeSpeech(targetText, {
        voiceId,
        voiceSettings: {
          stability: 0.8,
          similarityBoost: 0.8,
          useSpeakerBoost: true,
        },
      });

      setState(prev => ({ ...prev, referenceAudio: audio }));
    } catch (error) {
      console.error('Failed to load reference audio:', error);
    }
  }, [targetText, state.selectedVoice, customVoiceId]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      if (state.attempts >= maxAttempts) {
        const errorMessage = `Maximum attempts (${maxAttempts}) reached`;
        setState(prev => ({ ...prev, error: errorMessage }));
        onError?.(errorMessage);
        return;
      }

      setState(prev => ({
        ...prev,
        isRecording: true,
        hasRecorded: false,
        recordingDuration: 0,
        error: null,
      }));

      recordingStartTime.current = Date.now();
      
      // Start recording timer
      recordingTimer.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          recordingDuration: Date.now() - recordingStartTime.current,
        }));
      }, 100);

      // Start actual recording
      await speechToTextService.startRecording(languageCode);

    } catch (error) {
      const errorMessage = `Recording failed: ${(error as Error).message}`;
      setState(prev => ({ 
        ...prev, 
        isRecording: false,
        error: errorMessage,
        lastError: errorMessage,
      }));
      onError?.(errorMessage);
    }
  }, [state.attempts, maxAttempts, languageCode, onError]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      setState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isProcessing: true, 
      }));

      // Clear recording timer
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      // Stop recording and get audio data
      const audioData = await speechToTextService.stopRecording();
      
      const audioArrayBuffer = audioData.blob 
        ? await audioData.blob.arrayBuffer() 
        : undefined;

      setState(prev => ({
        ...prev,
        hasRecorded: true,
        audioData: audioArrayBuffer,
        isProcessing: false,
      }));

      // Auto-evaluate if we have audio data
      if (audioArrayBuffer) {
        await evaluatePronunciation(audioArrayBuffer);
      }

    } catch (error) {
      const errorMessage = `Recording stop failed: ${(error as Error).message}`;
      setState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isProcessing: false,
        error: errorMessage,
        lastError: errorMessage,
      }));
      onError?.(errorMessage);
    }
  }, [onError]);

  // Cancel recording
  const cancelRecording = useCallback(async () => {
    try {
      if (state.isRecording) {
        await speechToTextService.cancelRecording();
        
        // Clear recording timer
        if (recordingTimer.current) {
          clearInterval(recordingTimer.current);
          recordingTimer.current = null;
        }

        setState(prev => ({
          ...prev,
          isRecording: false,
          hasRecorded: false,
          recordingDuration: 0,
        }));
      }
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  }, [state.isRecording]);

  // Evaluate pronunciation
  const evaluatePronunciation = useCallback(async (audioData?: ArrayBuffer) => {
    try {
      const audioToEvaluate = audioData || state.audioData;
      if (!audioToEvaluate) {
        throw new Error('No audio data available for evaluation');
      }

      setState(prev => ({ ...prev, isEvaluating: true }));

      // Use ElevenLabs for pronunciation evaluation
      const evaluation = await elevenLabsService.evaluatePronunciation(
        audioToEvaluate,
        targetText,
        languageCode,
        state.selectedVoice?.id,
      );

      // Get transcription
      const transcription = await speechToTextService.transcribe(
        { blob: new Blob([audioToEvaluate]) },
        languageCode,
        targetText,
      );

      setState(prev => ({
        ...prev,
        evaluation,
        transcription,
        attempts: prev.attempts + 1,
        bestScore: Math.max(prev.bestScore, evaluation.overallScore),
        currentScore: evaluation.overallScore,
        isEvaluating: false,
      }));

      // Provide haptic feedback
      if (enableHapticFeedback) {
        if (evaluation.overallScore >= 80) {
          Vibration.vibrate([0, 100, 50, 100]); // Success pattern
        } else if (evaluation.overallScore >= 60) {
          Vibration.vibrate([0, 50]); // Partial success
        } else {
          Vibration.vibrate([0, 200, 100, 200]); // Needs improvement
        }
      }

      // Call completion callback
      onComplete?.(evaluation);

    } catch (error) {
      const errorMessage = `Evaluation failed: ${(error as Error).message}`;
      setState(prev => ({ 
        ...prev, 
        isEvaluating: false,
        error: errorMessage,
        lastError: errorMessage,
      }));
      onError?.(errorMessage);
    }
  }, [state.audioData, state.selectedVoice, targetText, languageCode, enableHapticFeedback, onComplete, onError]);

  // Play reference audio
  const playReferenceAudio = useCallback(async () => {
    if (!state.referenceAudio || !enableAudioFeedback) return;

    try {
      // In a real implementation, you would play the audio
      // For now, we'll simulate playback
      console.debug('Playing reference audio:', state.referenceAudio.audioUrl);
    } catch (error) {
      console.error('Failed to play reference audio:', error);
    }
  }, [state.referenceAudio, enableAudioFeedback]);

  // Stop reference audio
  const stopReferenceAudio = useCallback(async () => {
    try {
      if (audioPlayer.current) {
        // Stop audio playback
        audioPlayer.current = null;
      }
    } catch (error) {
      console.error('Failed to stop reference audio:', error);
    }
  }, []);

  // Select voice
  const selectVoice = useCallback((voiceId: string) => {
    const voice = elevenLabsService.getVoiceById(voiceId);
    if (voice) {
      setState(prev => ({ ...prev, selectedVoice: voice }));
      // Reload reference audio with new voice
      loadReferenceAudio();
    }
  }, [loadReferenceAudio]);

  // Get voices for language
  const getVoicesForLanguage = useCallback((languageCode: string) => {
    return elevenLabsService.getVoicesForLanguage(languageCode);
  }, []);

  // Retry recording
  const retry = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasRecorded: false,
      audioData: undefined,
      evaluation: null,
      transcription: null,
      error: null,
    }));
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRecording: false,
      isProcessing: false,
      isEvaluating: false,
      hasRecorded: false,
      recordingDuration: 0,
      audioData: undefined,
      evaluation: null,
      transcription: null,
      attempts: 0,
      bestScore: 0,
      currentScore: 0,
      error: null,
    }));
  }, []);

  // Next attempt
  const nextAttempt = useCallback(() => {
    if (state.attempts < maxAttempts) {
      retry();
    }
  }, [state.attempts, maxAttempts, retry]);

  // Update options
  const updateOptions = useCallback((newOptions: Partial<PronunciationEvaluationOptions>) => {
    // This would update the options and reinitialize if needed
    console.debug('Updating pronunciation evaluation options:', newOptions);
  }, []);

  // Get service status
  const getServiceStatus = useCallback(async () => {
    try {
      const elevenLabsStatus = await elevenLabsService.getServiceStatus();
      const sttStatus = await speechToTextService.getServiceStatus();
      
      return {
        elevenLabs: elevenLabsStatus,
        speechToText: sttStatus,
        initialized: state.isInitialized,
        recording: state.isRecording,
        processing: state.isProcessing,
        evaluating: state.isEvaluating,
      };
    } catch (error) {
      console.error('Failed to get service status:', error);
      throw error;
    }
  }, [state.isInitialized, state.isRecording, state.isProcessing, state.isEvaluating]);

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInitialize && !state.isInitialized) {
      initialize();
    }
  }, [autoInitialize, state.isInitialized, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup timers
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      
      // Cleanup audio
      if (audioPlayer.current) {
        stopReferenceAudio();
      }
      
      // Cancel any ongoing recording
      if (state.isRecording) {
        cancelRecording();
      }
    };
  }, [state.isRecording, cancelRecording, stopReferenceAudio]);

  // Actions object
  const actions: PronunciationEvaluationActions = {
    initialize,
    startRecording,
    stopRecording,
    cancelRecording,
    evaluatePronunciation,
    loadReferenceAudio,
    playReferenceAudio,
    stopReferenceAudio,
    selectVoice,
    getVoicesForLanguage,
    retry,
    reset,
    nextAttempt,
    updateOptions,
    getServiceStatus,
  };

  return [state, actions];
};

// Utility hook for simple pronunciation checking
export const useSimplePronunciationCheck = (languageCode: string = 'en') => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PronunciationEvaluation | null>(null);
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

  const stopRecording = useCallback(async (targetText: string) => {
    if (!isRecording) return null;

    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      const audioData = await speechToTextService.stopRecording();
      const audioArrayBuffer = audioData.blob 
        ? await audioData.blob.arrayBuffer() 
        : undefined;

      if (audioArrayBuffer) {
        const evaluation = await elevenLabsService.evaluatePronunciation(
          audioArrayBuffer,
          targetText,
          languageCode,
        );
        
        setResult(evaluation);
        return evaluation;
      }
      
      return null;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isRecording, languageCode]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isRecording,
    isProcessing,
    result,
    error,
    startRecording,
    stopRecording,
    reset,
  };
};

export default usePronunciationEvaluation;
