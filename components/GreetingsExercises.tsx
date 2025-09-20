// Greetings Exercise Components
// Individual exercise types for the greetings module

import React, { useState, useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
// Lazy loaded: expo-linear-gradient
import { 
  Volume2, 
  Mic, 
  Check, 
  X, 
  HelpCircle,
  RotateCcw,
  ArrowRight,
} from '@/components/icons/LucideReplacement';

import { GreetingExercise, GreetingExerciseResult } from '@/types/greetings';
import { useGreetings } from '@/hooks/useGreetings';
// import { lazyLoadLinearGradient } from '@/services/LazyDependencies';
// import { lazyLoadLucideIcons } from '@/services/LazyDependencies';
import { useLanguage } from '@/hooks/useLanguage';

const { width } = Dimensions.get('window');

interface ExerciseProps {
  exercise: GreetingExercise;
  onComplete: (result: Omit<GreetingExerciseResult, 'timestamp' | 'xpEarned'>) => void;
  onNext: () => void;
}

// Flashcard Exercise Component
export function FlashcardExercise({ exercise, onComplete, onNext }: ExerciseProps) {
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [startTime] = useState<number>(Date.now());
  const { playAudio } = useGreetings();
  const { t } = useLanguage();

  const flipAnimation = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    Animated.timing(flipAnimation, {
      toValue: showAnswer ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowAnswer(!showAnswer);
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    const responseTime = Date.now() - startTime;
    const accuracy = rating >= 3 ? 100 : rating >= 2 ? 75 : rating >= 1 ? 50 : 0;
    
    onComplete({
      exerciseId: exercise.id,
      greetingId: exercise.greetingId,
      userId: '', // Will be filled by the hook
      isCorrect: rating >= 3,
      accuracy,
      responseTime,
      hintsUsed: 0,
      attempts: 1,
      userAnswer: showAnswer ? 'viewed' : 'not_viewed',
      correctAnswer: exercise.correctAnswer,
    });

    setTimeout(onNext, 1000);
  };

  const frontRotation = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotation = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.instruction}>{exercise.instruction.en}</Text>
      
      <View style={styles.flashcardContainer}>
        <TouchableOpacity onPress={handleFlip} style={styles.flashcard}>
          <Animated.View 
            style={[
              styles.flashcardSide,
              styles.flashcardFront,
              { transform: [{ rotateY: frontRotation }] },
            ]}
          >
            <Text style={styles.flashcardText}>{exercise.question.en}</Text>
            {exercise.audioUrl && (
              <TouchableOpacity 
                style={styles.audioButton}
                onPress={() => playAudio(exercise.audioUrl!, exercise.question.en)}
              >
                <Volume2 size={24} color={'#007AFF'} />
              </TouchableOpacity>
            )}
            <Text style={styles.tapToFlip}>{t('tapToFlip', 'Tap to reveal answer')}</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.flashcardSide,
              styles.flashcardBack,
              { transform: [{ rotateY: backRotation }] },
            ]}
          >
            <Text style={styles.flashcardAnswer}>{exercise.correctAnswer}</Text>
            {exercise.explanation && (
              <Text style={styles.explanation}>{exercise.explanation.en}</Text>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {showAnswer && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>{t('howWellDidYouKnow', 'How well did you know this?')}</Text>
          <View style={styles.ratingButtons}>
            {[
              { rating: 1, label: t('hard', 'Hard'), color: '#FF6B6B' },
              { rating: 2, label: t('good', 'Good'), color: '#FFD93D' },
              { rating: 3, label: t('easy', 'Easy'), color: '#6BCF7F' },
            ].map(({ rating, label, color }) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.ratingButton,
                  { backgroundColor: color },
                  userRating === rating && styles.ratingButtonSelected,
                ]}
                onPress={() => handleRating(rating)}
              >
                <Text style={styles.ratingButtonText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// Multiple Choice Exercise Component
export function MultipleChoiceExercise({ exercise, onComplete, onNext }: ExerciseProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [startTime] = useState<number>(Date.now());
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const { playAudio } = useGreetings();
  const { t } = useLanguage();

  const handleOptionSelect = (option: string) => {
    if (showResult) return;
    
    setSelectedOption(option);
    setShowResult(true);
    
    const responseTime = Date.now() - startTime;
    const isCorrect = option === exercise.correctAnswer;
    const accuracy = isCorrect ? 100 : 0;
    
    onComplete({
      exerciseId: exercise.id,
      greetingId: exercise.greetingId,
      userId: '',
      isCorrect,
      accuracy,
      responseTime,
      hintsUsed,
      attempts: 1,
      userAnswer: option,
      correctAnswer: exercise.correctAnswer,
    });

    setTimeout(onNext, 2000);
  };

  const showHint = () => {
    if (exercise.hints && exercise.hints.length > hintsUsed) {
      setHintsUsed(hintsUsed + 1);
      Alert.alert(t('hint', 'Hint'), exercise.hints[hintsUsed].en);
    }
  };

  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.instruction}>{exercise.instruction.en}</Text>
      
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{exercise.question.en}</Text>
        {exercise.audioUrl && (
          <TouchableOpacity 
            style={styles.audioButton}
            onPress={() => playAudio(exercise.audioUrl!, exercise.question.en)}
          >
            <Volume2 size={24} color={'#007AFF'} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.optionsContainer}>
        {exercise.options?.map((option, index) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === exercise.correctAnswer;
          const showCorrect = showResult && isCorrect;
          const showIncorrect = showResult && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
                showCorrect && styles.optionButtonCorrect,
                showIncorrect && styles.optionButtonIncorrect,
              ]}
              onPress={() => handleOptionSelect(option)}
              disabled={showResult}
            >
              <Text style={[
                styles.optionText,
                isSelected && styles.optionTextSelected,
                showCorrect && styles.optionTextCorrect,
                showIncorrect && styles.optionTextIncorrect,
              ]}>
                {option}
              </Text>
              {showCorrect && <Check size={20} color={'white'} />}
              {showIncorrect && <X size={20} color={'white'} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {!showResult && exercise.hints && hintsUsed < exercise.hints.length && (
        <TouchableOpacity style={styles.hintButton} onPress={showHint}>
          <HelpCircle size={20} color={'#007AFF'} />
          <Text style={styles.hintButtonText}>{t('getHint', 'Get Hint')}</Text>
        </TouchableOpacity>
      )}

      {showResult && exercise.explanation && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationText}>{exercise.explanation.en}</Text>
        </View>
      )}
    </View>
  );
}

// Fill in the Blank Exercise Component
export function FillBlankExercise({ exercise, onComplete, onNext }: ExerciseProps) {
  const [userInput, setUserInput] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [startTime] = useState<number>(Date.now());
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const { playAudio } = useGreetings();
  const { t } = useLanguage();

  const handleSubmit = () => {
    if (showResult || !userInput.trim()) return;
    
    setShowResult(true);
    
    const responseTime = Date.now() - startTime;
    const correctAnswer = Array.isArray(exercise.correctAnswer) 
      ? exercise.correctAnswer[0] 
      : exercise.correctAnswer;
    
    const isCorrect = userInput.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    const accuracy = isCorrect ? 100 : 0;
    
    onComplete({
      exerciseId: exercise.id,
      greetingId: exercise.greetingId,
      userId: '',
      isCorrect,
      accuracy,
      responseTime,
      hintsUsed,
      attempts: 1,
      userAnswer: userInput,
      correctAnswer,
    });

    setTimeout(onNext, 2000);
  };

  const showHint = () => {
    if (exercise.hints && exercise.hints.length > hintsUsed) {
      setHintsUsed(hintsUsed + 1);
      Alert.alert(t('hint', 'Hint'), exercise.hints[hintsUsed].en);
    }
  };

  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.instruction}>{exercise.instruction.en}</Text>
      
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{exercise.question.en}</Text>
        {exercise.audioUrl && (
          <TouchableOpacity 
            style={styles.audioButton}
            onPress={() => playAudio(exercise.audioUrl!, exercise.question.en)}
          >
            <Volume2 size={24} color={'#007AFF'} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.textInput,
            showResult && (userInput.toLowerCase().trim() === (Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer[0] : exercise.correctAnswer).toLowerCase().trim() 
              ? styles.textInputCorrect 
              : styles.textInputIncorrect),
          ]}
          value={userInput}
          onChangeText={setUserInput}
          placeholder={t('typeYourAnswer', 'Type your answer here...')}
          editable={!showResult}
          autoCapitalize={'none'}
          autoCorrect={false}
        />
        
        {!showResult && (
          <TouchableOpacity 
            style={[
              styles.submitButton,
              !userInput.trim() && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!userInput.trim()}
          >
            <ArrowRight size={20} color={'white'} />
          </TouchableOpacity>
        )}
      </View>

      {showResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.correctAnswer}>
            {t('correctAnswer', 'Correct answer')}: {Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer[0] : exercise.correctAnswer}
          </Text>
          {exercise.explanation && (
            <Text style={styles.explanationText}>{exercise.explanation.en}</Text>
          )}
        </View>
      )}

      {!showResult && exercise.hints && hintsUsed < exercise.hints.length && (
        <TouchableOpacity style={styles.hintButton} onPress={showHint}>
          <HelpCircle size={20} color={'#007AFF'} />
          <Text style={styles.hintButtonText}>{t('getHint', 'Get Hint')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Speaking Exercise Component
export function SpeakingExercise({ exercise, onComplete, onNext }: ExerciseProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [startTime] = useState<number>(Date.now());
  const { playAudio, analyzePronunciation } = useGreetings();
  const { t } = useLanguage();

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Implement actual recording
    setTimeout(() => {
      setIsRecording(false);
      setHasRecorded(true);
    }, 3000);
  };

  const handleAnalyze = async () => {
    setShowResult(true);
    
    try {
      // TODO: Get actual audio blob from recording
      const mockAudioBlob = new Blob();
      await analyzePronunciation(mockAudioBlob, exercise.greetingId);
      
      const responseTime = Date.now() - startTime;
      const accuracy = Math.floor(Math.random() * 30) + 70; // Mock accuracy 70-100%
      
      onComplete({
        exerciseId: exercise.id,
        greetingId: exercise.greetingId,
        userId: '',
        isCorrect: accuracy >= 70,
        accuracy,
        responseTime,
        hintsUsed: 0,
        attempts: 1,
        userAnswer: 'audio_recording',
        correctAnswer: exercise.correctAnswer,
      });

      setTimeout(onNext, 3000);
    } catch (error) {
      Alert.alert(t('error', 'Error'), t('failedToAnalyze', 'Failed to analyze pronunciation'));
      setShowResult(false);
    }
  };

  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.instruction}>{exercise.instruction.en}</Text>
      
      <View style={styles.speakingContainer}>
        <Text style={styles.targetPhrase}>{exercise.question.en}</Text>
        
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => playAudio(exercise.audioUrl!, exercise.question.en)}
        >
          <Volume2 size={32} color={'#007AFF'} />
          <Text style={styles.playButtonText}>{t('listen', 'Listen')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
          ]}
          onPress={handleStartRecording}
          disabled={isRecording || showResult}
        >
          <Mic size={32} color={isRecording ? '#FF6B6B' : 'white'} />
          <Text style={styles.recordButtonText}>
            {isRecording ? t('recording', 'Recording...') : hasRecorded ? t('recorded', 'Recorded') : t('record', 'Record')}
          </Text>
        </TouchableOpacity>

        {hasRecorded && !showResult && (
          <TouchableOpacity 
            style={styles.analyzeButton}
            onPress={handleAnalyze}
          >
            <Text style={styles.analyzeButtonText}>{t('analyzePronunciation', 'Analyze Pronunciation')}</Text>
          </TouchableOpacity>
        )}

        {showResult && (
          <View style={styles.pronunciationResult}>
            <Text style={styles.resultTitle}>{t('greatJob', 'Great job!')}</Text>
            <Text style={styles.resultText}>
              {t('pronunciationAnalyzed', 'Your pronunciation was analyzed. Keep practicing!')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  instruction: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // Flashcard styles
  flashcardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashcard: {
    width: width - 40,
    height: 200,
    position: 'relative',
  },
  flashcardSide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backfaceVisibility: 'hidden',
  },
  flashcardFront: {
    backgroundColor: '#007AFF',
  },
  flashcardBack: {
    backgroundColor: '#4ECDC4',
  },
  flashcardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  flashcardAnswer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  tapToFlip: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 16,
  },
  ratingContainer: {
    marginTop: 24,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ratingButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 80,
  },
  ratingButtonSelected: {
    transform: [{ scale: 1.1 }],
  },
  ratingButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Multiple choice styles
  questionContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
  },
  optionButtonCorrect: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  optionButtonIncorrect: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: 'white',
    fontWeight: '600',
  },
  optionTextIncorrect: {
    color: 'white',
    fontWeight: '600',
  },

  // Fill blank styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  textInputCorrect: {
    borderColor: '#4ECDC4',
    backgroundColor: '#f0fff4',
  },
  textInputIncorrect: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginLeft: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  correctAnswer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 8,
  },

  // Speaking styles
  speakingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetPhrase: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 50,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  recordButton: {
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    padding: 24,
    borderRadius: 60,
    marginBottom: 24,
  },
  recordButtonActive: {
    backgroundColor: '#FF3B30',
    transform: [{ scale: 1.1 }],
  },
  recordButtonText: {
    marginTop: 8,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  pronunciationResult: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Common styles
  audioButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 12,
    borderRadius: 24,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  hintButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  explanationContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  explanation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
});

// Main component that exports all greeting exercises
const GreetingsExercises = {
  FlashcardExercise,
  MultipleChoiceExercise,
};

// GreetingsExercises.displayName = 'GreetingsExercises';

export default GreetingsExercises;
