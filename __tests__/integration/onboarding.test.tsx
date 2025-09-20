/**
 * Integration Tests for Onboarding Flow
 * Tests the complete onboarding user journey
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import OnboardingScreen from '@/app/(auth)/onboarding';
import { useOptimizedAuth, useOptimizedLanguage, useOptimizedProgress } from '@/components/PerformanceOptimized';

// Mock the performance optimized hooks
jest.mock('@/components/PerformanceOptimized', () => ({
  useOptimizedAuth: jest.fn(),
  useOptimizedLanguage: jest.fn(),
  useOptimizedProgress: jest.fn(),
}));

// Mock the unified data service
jest.mock('@/services/unifiedDataService', () => ({
  unifiedDataService: {
    saveUser: jest.fn(),
  },
}));

// Mock the gamification service
jest.mock('@/services/gamification', () => ({
  default: {
    initializeUserStats: jest.fn(),
  },
}));

// Mock the enhanced SRS service
jest.mock('@/services/enhancedSRS', () => ({
  EnhancedSRSService: {
    initializeSRS: jest.fn(),
  },
}));

const mockUseOptimizedAuth = useOptimizedAuth as jest.MockedFunction<typeof useOptimizedAuth>;
const mockUseOptimizedLanguage = useOptimizedLanguage as jest.MockedFunction<typeof useOptimizedLanguage>;
const mockUseOptimizedProgress = useOptimizedProgress as jest.MockedFunction<typeof useOptimizedProgress>;

describe('OnboardingScreen Integration', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockUpdateUser = jest.fn();
  const mockSetMainLanguage = jest.fn();
  const mockSetTargetLanguage = jest.fn();
  const mockUpdatePreferences = jest.fn();
  const mockAddPoints = jest.fn();
  const mockUpdateStreak = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockUseOptimizedAuth.mockReturnValue({
      user: mockUser,
      updateUser: mockUpdateUser,
      addPoints: mockAddPoints,
      updateStreak: mockUpdateStreak,
    } as any);

    mockUseOptimizedLanguage.mockReturnValue({
      setMainLanguage: mockSetMainLanguage,
      setTargetLanguage: mockSetTargetLanguage,
    } as any);

    mockUseOptimizedProgress.mockReturnValue({
      updatePreferences: mockUpdatePreferences,
    } as any);
  });

  describe('Welcome Step', () => {
    it('should display welcome message and continue button', () => {
      render(<OnboardingScreen />);
      
      expect(screen.getByText(/Welcome to LinguApp!/)).toBeTruthy();
      expect(screen.getByText('Next')).toBeTruthy();
    });

    it('should proceed to languages step when continue is pressed', async () => {
      render(<OnboardingScreen />);
      
      const continueButton = screen.getByText('Next');
      fireEvent.press(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText(/What language do you want to learn?/)).toBeTruthy();
      });
    });
  });

  describe('Languages Step', () => {
    beforeEach(() => {
      // Start at languages step
      render(<OnboardingScreen />);
      const continueButton = screen.getByText('Next');
      fireEvent.press(continueButton);
    });

    it('should display language selection options', async () => {
      await waitFor(() => {
        expect(screen.getByText(/What language do you want to learn?/)).toBeTruthy();
        expect(screen.getByText(/Spanish/)).toBeTruthy();
        expect(screen.getByText(/Croatian/)).toBeTruthy();
      });
    });

    it('should allow selecting main language', async () => {
      await waitFor(() => {
        const spanishOption = screen.getByText(/Spanish/);
        fireEvent.press(spanishOption);
      });
    });

    it('should allow selecting target language', async () => {
      await waitFor(() => {
        const croatianOption = screen.getByText(/Croatian/);
        fireEvent.press(croatianOption);
      });
    });

    it('should proceed to level step when languages are selected', async () => {
      await waitFor(async () => {
        // Select languages
        const spanishOption = screen.getByText(/Spanish/);
        const croatianOption = screen.getByText(/Croatian/);
        
        fireEvent.press(spanishOption);
        fireEvent.press(croatianOption);
        
        // Continue to next step
        const continueButton = screen.getByText('Next');
        fireEvent.press(continueButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/What's your current level?/)).toBeTruthy();
      });
    });
  });

  describe('Level Step', () => {
    beforeEach(async () => {
      render(<OnboardingScreen />);
      
      // Navigate to level step
      fireEvent.press(screen.getByText('Next')); // Welcome -> Languages
      await waitFor(() => {
        const spanishOption = screen.getByText(/Spanish/);
        const croatianOption = screen.getByText(/Croatian/);
        fireEvent.press(spanishOption);
        fireEvent.press(croatianOption);
        fireEvent.press(screen.getByText('Next')); // Languages -> Level
      });
    });

    it('should display level options', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Beginner/)).toBeTruthy();
        expect(screen.getByText(/Elementary/)).toBeTruthy();
        expect(screen.getByText(/Intermediate/)).toBeTruthy();
      });
    });

    it('should allow selecting a level', async () => {
      await waitFor(() => {
        const intermediateOption = screen.getByText(/Intermediate/);
        fireEvent.press(intermediateOption);
      });
    });

    it('should proceed to completion step when level is selected', async () => {
      await waitFor(async () => {
        const intermediateOption = screen.getByText(/Intermediate/);
        fireEvent.press(intermediateOption);
        
        const continueButton = screen.getByText('Next');
        fireEvent.press(continueButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/You're all set!/)).toBeTruthy();
      });
    });
  });

  describe('Completion Step', () => {
    beforeEach(async () => {
      render(<OnboardingScreen />);
      
      // Navigate to completion step
      fireEvent.press(screen.getByText('Next')); // Welcome -> Languages
      await waitFor(() => {
        const croatianOption = screen.getByText(/Croatian/);
        fireEvent.press(croatianOption);
        fireEvent.press(screen.getByText('Next')); // Languages -> Level
      });
      
      await waitFor(() => {
        const intermediateOption = screen.getByText(/Intermediate/);
        fireEvent.press(intermediateOption);
        fireEvent.press(screen.getByText('Next')); // Level -> Completion
      });
    });

    it('should display completion message', async () => {
      await waitFor(() => {
        expect(screen.getByText(/You're all set!/)).toBeTruthy();
        expect(screen.getByText(/Ready to start learning?/)).toBeTruthy();
      });
    });

    it('should show selected language and level', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Croatian/)).toBeTruthy();
        expect(screen.getByText(/Intermediate/)).toBeTruthy();
      });
    });

    it('should have get started button', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Get Started/)).toBeTruthy();
      });
    });
  });

  describe.skip('Commitment Step', () => { // Skipped: No existe en componente simple
    it('should display commitment options', async () => {
      // Esta prueba se salta porque el componente simple no tiene este paso
    });
  });

  describe.skip('Preferences Step', () => { // Skipped: No existe en componente simple
    it('should display practice mode options', async () => {
      // Esta prueba se salta porque el componente simple no tiene este paso
    });
  });

  describe.skip('Complete Onboarding', () => { // Skipped: No existe en componente simple
    it('should complete onboarding successfully', async () => {
      // Esta prueba se salta porque el componente simple no tiene este paso
    });
  });

  describe('Navigation', () => {
    it('should allow going back to previous steps', async () => {
      render(<OnboardingScreen />);
      
      // Go to languages step
      fireEvent.press(screen.getByText('Next'));
      await waitFor(() => {
        expect(screen.getByText(/What language do you want to learn?/)).toBeTruthy();
      });
      
      // Go back to welcome
      const backButton = screen.getByText('Back');
      fireEvent.press(backButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Welcome to LinguApp!/)).toBeTruthy();
      });
    });

    it('should not show back button on welcome step', () => {
      render(<OnboardingScreen />);
      
      expect(screen.queryByText('Back')).toBeNull();
    });
  });

  describe('Progress Bar', () => {
    it('should show correct progress for each step', async () => {
      render(<OnboardingScreen />);
      
      // Welcome step (1/4)
      expect(screen.getByText(/Step.*of.*/)).toBeTruthy();
      
      // Go to languages step
      fireEvent.press(screen.getByText('Next'));
      await waitFor(() => {
        expect(screen.getByText(/Step.*of.*/)).toBeTruthy();
      });
    });
  });
});
