import React from 'react';
import { useRouter } from 'expo-router';
import { useGreetings } from '@/hooks/useGreetings';
import GreetingsLessonScreen from '@/components/GreetingsLessonScreen';

export default function GreetingsLessonRoute() {
  const router = useRouter();
  const { sessionActive, startLesson, currentLesson, isLoading, error } = useGreetings();
  
  // Auto-start the first lesson when component mounts
  React.useEffect(() => {
    console.debug('GreetingsLessonRoute: Effect triggered', { sessionActive, currentLesson: !!currentLesson, isLoading });
    
    if (!sessionActive && !currentLesson && !isLoading) {
      console.debug('GreetingsLessonRoute: Starting lesson_basic_greetings_1');
      // Start the first available lesson
      startLesson('lesson_basic_greetings_1')
        .then(() => {
          console.debug('GreetingsLessonRoute: Lesson started successfully');
        })
        .catch((error) => {
          console.error('GreetingsLessonRoute: Failed to start lesson:', error);
        });
    }
  }, [sessionActive, currentLesson, startLesson, isLoading]);
  
  const handleClose = () => {
    console.debug('GreetingsLessonRoute: Closing lesson');
    router.back();
  };

  // Debug logging
  React.useEffect(() => {
    console.debug('GreetingsLessonRoute: State update', { 
      sessionActive, 
      hasCurrentLesson: !!currentLesson, 
      isLoading, 
      error, 
    });
  }, [sessionActive, currentLesson, isLoading, error]);

  // Always show the lesson screen (let the component handle its own visibility)
  return (
    <GreetingsLessonScreen 
      visible={true}
      onClose={handleClose}
    />
  );
}
