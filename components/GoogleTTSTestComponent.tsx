// ElevenLabs Test Component - Verify ElevenLabs TTS/STT integration
// Tests different languages and exercise types with ElevenLabs API

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { theme } from '@/constants/theme';
import { googleTTSConfig, testGoogleTTS } from '@/services/audio/googleTTSConfig';
import { unifiedAudioService } from '@/services/audio/unifiedAudioService';
import { Play, Volume2, CheckCircle, XCircle } from '@/components/icons/LucideReplacement';

interface TestCase {
  id: string;
  text: string;
  language: string;
  exerciseType: 'vocabulary' | 'sentence' | 'greeting' | 'pronunciation';
  description: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: 'croatian_greeting',
    text: 'Dobar dan',
    language: 'hr',
    exerciseType: 'greeting',
    description: 'Croatian Greeting (Primary)',
  },
  {
    id: 'croatian_evening',
    text: 'Dobra večer',
    language: 'hr',
    exerciseType: 'greeting',
    description: 'Croatian Evening Greeting',
  },
  {
    id: 'croatian_hello',
    text: 'Bok',
    language: 'hr',
    exerciseType: 'vocabulary',
    description: 'Croatian Casual Hello',
  },
  {
    id: 'english_hello',
    text: 'Good morning',
    language: 'en',
    exerciseType: 'greeting',
    description: 'English Greeting',
  },
  {
    id: 'spanish_greeting',
    text: 'Buenos días',
    language: 'es',
    exerciseType: 'greeting',
    description: 'Spanish Greeting',
  },
  {
    id: 'croatian_sentence',
    text: 'Kako ste danas?',
    language: 'hr',
    exerciseType: 'sentence',
    description: 'Croatian Question',
  },
];

export default function GoogleTTSTestComponent() {
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'working' | 'failed'>('unknown');

  const testSingleCase = async (testCase: TestCase) => {
    try {
      console.debug(`Testing: ${testCase.description}`);
      
      const result = await unifiedAudioService.playText(testCase.text, {
        language: testCase.language,
        useElevenLabs: true, // Only test ElevenLabs
        quality: 'premium',
      });

      setTestResults(prev => ({
        ...prev,
        [testCase.id]: result.success,
      }));

      if (result.success) {
        console.debug(`✅ ${testCase.description}: SUCCESS using ${result.method}`);
      } else {
        console.debug(`❌ ${testCase.description}: FAILED - ${result.error}`);
      }

      return result.success;
    } catch (error) {
      console.error(`❌ ${testCase.description}: ERROR -`, error);
      setTestResults(prev => ({
        ...prev,
        [testCase.id]: false,
      }));
      return false;
    }
  };

  const testAllCases = async () => {
    setIsTestingAll(true);
    setTestResults({});
    
    let successCount = 0;
    
    for (const testCase of TEST_CASES) {
      const success = await testSingleCase(testCase);
      if (success) successCount++;
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsTestingAll(false);
    
    const successRate = (successCount / TEST_CASES.length) * 100;
    Alert.alert(
      'Test Results',
      `${successCount}/${TEST_CASES.length} tests passed (${successRate.toFixed(1)}%)`,
    );
  };

  const testAPIConnectivity = async () => {
    try {
      // Test ElevenLabs API connectivity
      const { synthesizeSpeech } = await import('@/services/audio/elevenLabsService');
      const result = await synthesizeSpeech('Hello, this is a connectivity test.', {
        voiceId: 'pNInz6obpgDQGcFmaJgB',
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.5
        }
      });
      
      const isWorking = result.success;
      setApiStatus(isWorking ? 'working' : 'failed');
      
      Alert.alert(
        'API Test',
        isWorking ? 'ElevenLabs API is working!' : 'ElevenLabs API failed to respond',
      );
    } catch (error) {
      setApiStatus('failed');
      Alert.alert('API Test Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const getStatusIcon = (testId: string) => {
    const result = testResults[testId];
    if (result === undefined) return null;
    return result ? 
      <CheckCircle size={16} color={theme.colors.success} /> : 
      <XCircle size={16} color={theme.colors.danger} />;
  };

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'working': return theme.colors.success;
      case 'failed': return theme.colors.danger;
      default: return theme.colors.gray[400];
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ElevenLabs Integration Test</Text>
        <Text style={styles.subtitle}>
          API Key: d4038362dafa2d9c335d70b38404028fdd8deba208792cc45abed4a4f0f7bfec
        </Text>
        
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()  }20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            API Status: {apiStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Tests</Text>
        
        <TouchableOpacity style={styles.button} onPress={testAPIConnectivity}>
          <Text style={styles.buttonText}>Test API Connectivity</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testAllCases} disabled={isTestingAll}>
          <Text style={styles.buttonText}>
            {isTestingAll ? 'Testing All...' : 'Test All Languages'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Individual Tests</Text>
        
        {TEST_CASES.map((testCase) => (
          <View key={testCase.id} style={styles.testCase}>
            <View style={styles.testInfo}>
              <Text style={styles.testTitle}>{testCase.description}</Text>
              <Text style={styles.testDetails}>
                "{testCase.text}" ({testCase.language.toUpperCase()})
              </Text>
            </View>
            
            <View style={styles.testActions}>
              {getStatusIcon(testCase.id)}
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => testSingleCase(testCase)}
              >
                <Play size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ElevenLabs Voice Information</Text>
        <View style={styles.voiceInfo}>
          <Text style={styles.voiceLanguage}>English (EN)</Text>
          <Text style={styles.voiceName}>Adam (pNInz6obpgDQGcFmaJgB)</Text>
          <Text style={styles.voiceQuality}>Premium Quality</Text>
        </View>
        <View style={styles.voiceInfo}>
          <Text style={styles.voiceLanguage}>Multilingual</Text>
          <Text style={styles.voiceName}>Multiple voices available</Text>
          <Text style={styles.voiceQuality}>High Quality TTS/STT</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  testCase: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  testDetails: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  testActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.primary  }20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  voiceLanguage: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  voiceName: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    flex: 2,
  },
  voiceQuality: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});
