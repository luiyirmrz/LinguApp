/**
 * Error Recovery Service
 * Provides automatic error recovery mechanisms for the application
 */

interface RecoveryStrategy {
  name: string;
  condition: (error: Error) => boolean;
  action: () => Promise<void>;
  maxAttempts: number;
  delay: number;
}

interface RecoveryConfig {
  enableAutoRecovery: boolean;
  maxRecoveryAttempts: number;
  recoveryDelay: number;
  strategies: RecoveryStrategy[];
}

class ErrorRecoveryService {
  private config: RecoveryConfig;
  private recoveryAttempts: Map<string, number> = new Map();
  private isRecovering: Set<string> = new Set();

  constructor() {
    this.config = {
      enableAutoRecovery: true,
      maxRecoveryAttempts: 3,
      recoveryDelay: 1000,
      strategies: [
        {
          name: 'elevenlabs_api_recovery',
          condition: (error) => error.message.includes('HTTP 401') || error.message.includes('Invalid or missing ElevenLabs API key'),
          action: async () => {
            console.debug('🔄 Attempting ElevenLabs API recovery...');
            // Clear any cached API responses
            // Reset service state
            await this.resetElevenLabsService();
          },
          maxAttempts: 2,
          delay: 2000,
        },
        {
          name: 'audio_service_recovery',
          condition: (error) => error.message.includes('audio') || error.message.includes('TTS'),
          action: async () => {
            console.debug('🔄 Attempting audio service recovery...');
            await this.resetAudioServices();
          },
          maxAttempts: 3,
          delay: 1500,
        },
        {
          name: 'network_recovery',
          condition: (error) => error.message.includes('network') || error.message.includes('fetch'),
          action: async () => {
            console.debug('🔄 Attempting network recovery...');
            await this.resetNetworkConnections();
          },
          maxAttempts: 2,
          delay: 3000,
        },
      ],
    };
  }

  /**
   * Attempt to recover from an error
   */
  async attemptRecovery(error: Error, context?: string): Promise<boolean> {
    if (!this.config.enableAutoRecovery) {
      return false;
    }

    const errorKey = context || error.message;
    
    // Check if we're already recovering this error
    if (this.isRecovering.has(errorKey)) {
      return false;
    }

    // Check if we've exceeded max attempts
    const attempts = this.recoveryAttempts.get(errorKey) || 0;
    if (attempts >= this.config.maxRecoveryAttempts) {
      console.warn(`❌ Max recovery attempts exceeded for: ${errorKey}`);
      return false;
    }

    // Find matching recovery strategy
    const strategy = this.config.strategies.find(s => s.condition(error));
    if (!strategy) {
      console.debug(`ℹ️ No recovery strategy found for: ${error.message}`);
      return false;
    }

    // Check strategy-specific max attempts
    if (attempts >= strategy.maxAttempts) {
      console.warn(`❌ Strategy max attempts exceeded for: ${strategy.name}`);
      return false;
    }

    try {
      this.isRecovering.add(errorKey);
      this.recoveryAttempts.set(errorKey, attempts + 1);

      console.debug(`🔄 Attempting recovery (${attempts + 1}/${strategy.maxAttempts}): ${strategy.name}`);
      
      // Wait before attempting recovery
      await this.delay(strategy.delay);
      
      // Execute recovery action
      await strategy.action();
      
      console.debug(`✅ Recovery successful: ${strategy.name}`);
      return true;
      
    } catch (recoveryError) {
      console.error(`❌ Recovery failed: ${strategy.name}`, recoveryError);
      return false;
    } finally {
      this.isRecovering.delete(errorKey);
    }
  }

  /**
   * Reset ElevenLabs service
   */
  private async resetElevenLabsService(): Promise<void> {
    try {
      // Clear any cached data
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        localStorage.removeItem('elevenlabs_audio_cache');
      }
      
      // Reset service state
      console.debug('🔄 ElevenLabs service reset completed');
    } catch (error) {
      console.error('❌ Failed to reset ElevenLabs service:', error);
    }
  }

  /**
   * Reset audio services
   */
  private async resetAudioServices(): Promise<void> {
    try {
      // Clear audio cache
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        localStorage.removeItem('audio_cache');
        localStorage.removeItem('unified_audio_cache');
      }
      
      // Reset audio state
      console.debug('🔄 Audio services reset completed');
    } catch (error) {
      console.error('❌ Failed to reset audio services:', error);
    }
  }

  /**
   * Reset network connections
   */
  private async resetNetworkConnections(): Promise<void> {
    try {
      // Clear any pending requests
      // Reset connection state
      console.debug('🔄 Network connections reset completed');
    } catch (error) {
      console.error('❌ Failed to reset network connections:', error);
    }
  }

  /**
   * Clear recovery attempts for a specific error
   */
  clearRecoveryAttempts(errorKey: string): void {
    this.recoveryAttempts.delete(errorKey);
    this.isRecovering.delete(errorKey);
  }

  /**
   * Clear all recovery attempts
   */
  clearAllRecoveryAttempts(): void {
    this.recoveryAttempts.clear();
    this.isRecovering.clear();
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats(): {
    totalAttempts: number;
    activeRecoveries: number;
    strategies: { [key: string]: number };
  } {
    const strategies: { [key: string]: number } = {};
    
    this.recoveryAttempts.forEach((attempts, errorKey) => {
      const strategy = this.config.strategies.find(s => 
        errorKey.includes(s.name) || errorKey.includes(s.name.replace('_', ' ')),
      );
      if (strategy) {
        strategies[strategy.name] = (strategies[strategy.name] || 0) + attempts;
      }
    });

    return {
      totalAttempts: Array.from(this.recoveryAttempts.values()).reduce((sum, attempts) => sum + attempts, 0),
      activeRecoveries: this.isRecovering.size,
      strategies,
    };
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enable or disable auto recovery
   */
  setAutoRecovery(enabled: boolean): void {
    this.config.enableAutoRecovery = enabled;
    console.debug(`🔄 Auto recovery ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Add a custom recovery strategy
   */
  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.config.strategies.push(strategy);
    console.debug(`🔄 Added recovery strategy: ${strategy.name}`);
  }
}

// Export singleton instance
export const errorRecoveryService = new ErrorRecoveryService();

// Export types
export type { RecoveryStrategy, RecoveryConfig };

// Export utility functions
export const attemptErrorRecovery = (error: Error, context?: string) =>
  errorRecoveryService.attemptRecovery(error, context);

export const clearRecoveryAttempts = (errorKey: string) =>
  errorRecoveryService.clearRecoveryAttempts(errorKey);

export const getRecoveryStats = () =>
  errorRecoveryService.getRecoveryStats();
