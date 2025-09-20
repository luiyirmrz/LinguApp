import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { elevenLabsService } from '@/services/audio/elevenLabsService';

interface ElevenLabsTestProps {
  onClose?: () => void;
}

export default function ElevenLabsTestComponent({ onClose }: ElevenLabsTestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [voices, setVoices] = useState<any[]>([]);

  useEffect(() => {
    checkElevenLabsStatus();
  }, []);

  const checkElevenLabsStatus = async () => {
    try {
      setIsLoading(true);
      const serviceStatus = await elevenLabsService.getServiceStatus();
      setStatus(serviceStatus);
      
      if (serviceStatus.initialized) {
        const availableVoices = elevenLabsService.getAvailableVoices();
        setVoices(availableVoices.slice(0, 5)); // Show first 5 voices
      }
    } catch (error) {
      console.error('ElevenLabs status check failed:', error);
      Alert.alert('Error', 'Failed to check ElevenLabs status');
    } finally {
      setIsLoading(false);
    }
  };

  const testTextToSpeech = async () => {
    try {
      setIsLoading(true);
      const result = await elevenLabsService.synthesizeSpeech(
        'Hello! This is a test of ElevenLabs text-to-speech integration.',
        {
          voiceId: voices[0]?.id || 'pNInz6obpgDQGcFmaJgB', // Use first voice or default
          voiceSettings: {
            stability: 0.5,
            similarityBoost: 0.5,
            useSpeakerBoost: true,
          },
        },
      );
      
      Alert.alert('Success', `Audio generated successfully! Duration: ${result.duration.toFixed(2)}s`);
    } catch (error) {
      console.error('TTS test failed:', error);
      Alert.alert('Error', `TTS test failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeService = async () => {
    try {
      setIsLoading(true);
      await elevenLabsService.initialize();
      await checkElevenLabsStatus();
      Alert.alert('Success', 'ElevenLabs service initialized successfully!');
    } catch (error) {
      console.error('Initialization failed:', error);
      Alert.alert('Error', `Initialization failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ElevenLabs Integration Test</Text>
      
      {status && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Service Status:</Text>
          <Text style={styles.statusText}>
            • Initialized: {status.initialized ? '✅ Yes' : '❌ No'}
          </Text>
          <Text style={styles.statusText}>
            • API Key: {status.apiKeyConfigured ? '✅ Configured' : '❌ Missing'}
          </Text>
          <Text style={styles.statusText}>
            • Voices Loaded: {status.voicesLoaded}
          </Text>
          <Text style={styles.statusText}>
            • Cache Size: {status.cacheSize}
          </Text>
        </View>
      )}

      {voices.length > 0 && (
        <View style={styles.voicesContainer}>
          <Text style={styles.voicesTitle}>Available Voices:</Text>
          {voices.map((voice, index) => (
            <Text key={index} style={styles.voiceText}>
              • {voice.name} ({voice.language}) - {voice.gender}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={initializeService}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Loading...' : 'Initialize Service'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testTextToSpeech}
          disabled={isLoading || !status?.initialized}
        >
          <Text style={styles.buttonText}>
            Test Text-to-Speech
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.tertiaryButton]}
          onPress={checkElevenLabsStatus}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            Refresh Status
          </Text>
        </TouchableOpacity>

        {onClose && (
          <TouchableOpacity
            style={[styles.button, styles.closeButton]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
  voicesContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  voicesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  voiceText: {
    fontSize: 14,
    marginBottom: 4,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  tertiaryButton: {
    backgroundColor: '#FF9500',
  },
  closeButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
