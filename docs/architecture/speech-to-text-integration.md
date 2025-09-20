# Speech-to-Text Integration Guide

## Overview

The Speech-to-Text (STT) module provides comprehensive pronunciation feedback for language learning applications. It supports 50+ languages with multiple fallback mechanisms for offline operation.

## Features

### Core Capabilities
- **Multi-language Support**: 50+ languages including Croatian, Chinese, French, English, Spanish, and Italian
- **Cross-platform**: Works on React Native (iOS/Android) and Web
- **Offline Fallback**: Web Speech API and basic pattern matching when internet is unavailable
- **Real-time Processing**: Fast transcription and pronunciation assessment
- **Detailed Feedback**: Word-level and phoneme-level pronunciation analysis

### Pronunciation Assessment
- **Overall Score**: Combined accuracy, fluency, completeness, and prosody
- **Accuracy Score**: How closely the pronunciation matches the target
- **Fluency Score**: Smoothness and confidence of speech
- **Completeness Score**: Percentage of target words spoken
- **Prosody Score**: Rhythm and stress pattern analysis

### Error Handling
- **Retry Logic**: Automatic retry with exponential backoff
- **Fallback Endpoints**: Multiple API endpoints for reliability
- **Offline Mode**: Local processing when network is unavailable
- **Graceful Degradation**: Meaningful feedback even when services fail

## Quick Start

### 1. Initialize the Service

```typescript
import speechToTextService from '@/services/speechToText';

// Initialize with default configuration
await speechToTextService.initialize();

// Or with custom configuration
await speechToTextService.initialize({
  timeout: 15000,
  retryAttempts: 2,
  offlineMode: true,
  cacheResults: true
});
```

### 2. Basic Recording and Transcription

```typescript
import { 
  startRecording, 
  stopRecording, 
  getTranscription 
} from '@/services/speechToText';

// Start recording
await startRecording('en'); // Language code

// Stop recording after user finishes speaking
const audioData = await stopRecording();

// Get transcription
const result = await getTranscription(audioData, 'en');
console.log('Transcribed text:', result.text);
console.log('Confidence:', result.confidence);
```

### 3. Pronunciation Assessment

```typescript
import { assessPronunciation } from '@/services/speechToText';

const targetText = "Hello, how are you?";
const audioData = await stopRecording();

const assessment = await assessPronunciation(audioData, targetText, 'en');

console.log('Overall Score:', assessment.overallScore);
console.log('Feedback:', assessment.feedback);
console.log('Detailed Analysis:', assessment.detailedFeedback);
```

## API Reference

### Core Methods

#### `initialize(config?: Partial<STTConfig>): Promise<void>`
Initializes the STT service with optional configuration.

#### `startRecording(languageCode?: string): Promise<void>`
Starts audio recording for the specified language.

#### `stopRecording(): Promise<{uri?: string; blob?: Blob; duration: number}>`
Stops recording and returns audio data.

#### `transcribe(audioData, languageCode?, targetText?): Promise<TranscriptionResult>`
Transcribes audio to text with optional target text for comparison.

#### `assessPronunciation(audioData, targetText, languageCode?): Promise<PronunciationAssessment>`
Provides detailed pronunciation assessment against target text.

### Utility Methods

#### `getSupportedLanguages(): LanguageConfig[]`
Returns list of supported languages with accuracy ratings.

#### `isLanguageSupported(languageCode: string): boolean`
Checks if a language is supported.

#### `getLanguageAccuracy(languageCode: string): 'high' | 'medium' | 'low' | null`
Returns accuracy rating for a language.

#### `isCurrentlyRecording(): boolean`
Checks if recording is in progress.

#### `cancelRecording(): Promise<void>`
Cancels current recording session.

## Supported Languages

### High Accuracy Languages
- **English** (en)
- **Croatian** (hr)
- **Chinese Mandarin** (zh, zh-cn, zh-tw)
- **French** (fr)
- **Spanish** (es)
- **Italian** (it)
- **German** (de)
- **Portuguese** (pt, pt-br)
- **Russian** (ru)
- **Japanese** (ja)
- **Korean** (ko)
- **Dutch** (nl)
- **Swedish** (sv)
- **Norwegian** (no)
- **Danish** (da)
- **Finnish** (fi)
- **Polish** (pl)
- **Czech** (cs)
- **Slovak** (sk)
- **Hungarian** (hu)
- **Romanian** (ro)
- **Bulgarian** (bg)
- **Slovenian** (sl)
- **Serbian** (sr)
- **Bosnian** (bs)
- **Macedonian** (mk)
- **Turkish** (tr)
- **Greek** (el)
- **Ukrainian** (uk)
- **Catalan** (ca)
- **Indonesian** (id)
- **Malay** (ms)

### Medium Accuracy Languages
- **Arabic** (ar)
- **Hindi** (hi)
- **Hebrew** (he)
- **Thai** (th)
- **Vietnamese** (vi)
- **Filipino** (tl)
- **Swahili** (sw)
- **Afrikaans** (af)
- **Icelandic** (is)
- **Maltese** (mt)
- **Welsh** (cy)
- **Irish** (ga)
- **Basque** (eu)
- **Galician** (gl)
- **Estonian** (et)
- **Latvian** (lv)
- **Lithuanian** (lt)
- **Belarusian** (be)

## Configuration Options

### STTConfig
```typescript
interface STTConfig {
  apiEndpoint: string;           // Primary API endpoint
  fallbackEndpoint?: string;     // Fallback API endpoint
  timeout: number;               // Request timeout in ms
  retryAttempts: number;         // Number of retry attempts
  offlineMode: boolean;          // Enable offline processing
  cacheResults: boolean;         // Cache transcription results
}
```

### RecordingConfig
```typescript
interface RecordingConfig {
  quality: 'low' | 'medium' | 'high';
  format: 'wav' | 'm4a' | 'webm';
  sampleRate: number;            // Audio sample rate
  channels: number;              // Number of audio channels
  bitRate: number;               // Audio bit rate
}
```

## Error Handling

### Common Errors
1. **Permission Denied**: Microphone access not granted
2. **Network Error**: API endpoint unreachable
3. **Language Not Supported**: Requested language not available
4. **Recording Failed**: Hardware or system error
5. **Processing Timeout**: Transcription took too long

### Error Recovery
```typescript
try {
  const assessment = await assessPronunciation(audioData, targetText, 'hr');
  // Handle successful assessment
} catch (error) {
  if (error.message.includes('not supported')) {
    // Handle unsupported language
    console.log('Croatian not supported, falling back to English');
    const assessment = await assessPronunciation(audioData, targetText, 'en');
  } else if (error.message.includes('permission')) {
    // Handle permission error
    console.log('Please grant microphone permission');
  } else {
    // Handle other errors
    console.log('Pronunciation assessment failed:', error.message);
  }
}
```

## Offline Capabilities

### Web Speech API (Web Only)
When offline, the service automatically falls back to the browser's Web Speech API if available.

### Basic Pattern Matching
For mobile or when Web Speech API is unavailable, basic pattern matching provides limited offline functionality.

### Enabling Offline Mode
```typescript
await speechToTextService.initialize({
  offlineMode: true
});

// Or update configuration later
speechToTextService.updateConfig({
  offlineMode: true
});
```

## Performance Optimization

### Caching
- Results are automatically cached to improve performance
- Cache size is limited to 50 entries
- Old entries are automatically cleaned up

### Recording Quality
```typescript
// Optimize for speed (lower quality)
speechToTextService.updateRecordingConfig({
  quality: 'medium',
  sampleRate: 22050,
  bitRate: 64000
});

// Optimize for accuracy (higher quality)
speechToTextService.updateRecordingConfig({
  quality: 'high',
  sampleRate: 44100,
  bitRate: 128000
});
```

### Network Optimization
```typescript
// Reduce timeout for faster feedback
speechToTextService.updateConfig({
  timeout: 10000,
  retryAttempts: 2
});
```

## Integration Examples

### React Component
```typescript
import React, { useState } from 'react';
import { PronunciationFeedback } from '@/components/PronunciationFeedback';

const LessonScreen = () => {
  const [targetPhrase] = useState("Dobar dan, kako ste?"); // Croatian greeting
  
  const handlePronunciationComplete = (assessment) => {
    console.log('Pronunciation score:', assessment.overallScore);
    if (assessment.overallScore >= 80) {
      // Award points, unlock next lesson, etc.
    }
  };
  
  return (
    <PronunciationFeedback
      targetText={targetPhrase}
      languageCode="hr"
      onComplete={handlePronunciationComplete}
      maxAttempts={3}
      autoStart={false}
    />
  );
};
```

### Custom Hook
```typescript
import { useState, useCallback } from 'react';
import speechToTextService from '@/services/speechToText';

export const usePronunciationFeedback = (targetText: string, languageCode: string) => {
  const [isRecording, setIsRecording] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState(null);
  
  const startAssessment = useCallback(async () => {
    try {
      setError(null);
      setIsRecording(true);
      await speechToTextService.startRecording(languageCode);
    } catch (err) {
      setError(err.message);
      setIsRecording(false);
    }
  }, [languageCode]);
  
  const stopAssessment = useCallback(async () => {
    try {
      const audioData = await speechToTextService.stopRecording();
      const result = await speechToTextService.assessPronunciation(
        audioData, 
        targetText, 
        languageCode
      );
      setAssessment(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRecording(false);
    }
  }, [targetText, languageCode]);
  
  return {
    isRecording,
    assessment,
    error,
    startAssessment,
    stopAssessment
  };
};
```

## Best Practices

### 1. Language Selection
- Always check language support before starting recording
- Provide fallback languages for better user experience
- Use language codes consistently throughout your app

### 2. User Experience
- Show clear recording indicators
- Provide visual feedback during processing
- Display meaningful error messages
- Allow users to retry failed attempts

### 3. Performance
- Initialize the service early in your app lifecycle
- Cache frequently used configurations
- Use appropriate recording quality for your use case
- Implement proper cleanup in component unmount

### 4. Error Handling
- Always wrap STT calls in try-catch blocks
- Provide graceful degradation for offline scenarios
- Log errors for debugging but show user-friendly messages
- Implement retry logic for transient failures

### 5. Privacy
- Request microphone permissions explicitly
- Inform users about audio processing
- Implement proper data cleanup
- Consider local processing for sensitive content

## Troubleshooting

### Common Issues

1. **"Permission denied" error**
   - Ensure microphone permissions are granted
   - Check browser/app settings
   - Test on different devices

2. **"Language not supported" error**
   - Verify language code format
   - Check supported languages list
   - Use fallback language

3. **Poor pronunciation scores**
   - Check audio quality
   - Ensure quiet environment
   - Verify target text accuracy
   - Test with different speakers

4. **Slow processing**
   - Check network connection
   - Reduce recording quality
   - Enable caching
   - Use shorter audio clips

5. **Web Speech API not working**
   - Verify browser support
   - Check HTTPS requirement
   - Test microphone access
   - Clear browser cache

### Debug Mode
```typescript
// Enable detailed logging
console.log('STT Service Status:', await speechToTextService.getServiceStatus());
console.log('Supported Languages:', speechToTextService.getSupportedLanguages());
console.log('Language Accuracy for Croatian:', speechToTextService.getLanguageAccuracy('hr'));
```

## Future Enhancements

### Planned Features
- **Advanced Phoneme Analysis**: More detailed pronunciation feedback
- **Accent Detection**: Identify and adapt to different accents
- **Real-time Feedback**: Live pronunciation scoring during speech
- **Custom Vocabulary**: Support for domain-specific words
- **Offline Models**: Lightweight on-device processing
- **Multi-speaker Support**: Handle multiple voices in conversation

### Contributing
To contribute to the STT module:
1. Test with different languages and accents
2. Report accuracy issues with specific examples
3. Suggest improvements for offline capabilities
4. Help optimize performance for different devices
5. Contribute language-specific pronunciation rules

---

*This documentation covers the comprehensive Speech-to-Text module for language learning applications. For additional support or feature requests, please refer to the project repository.*