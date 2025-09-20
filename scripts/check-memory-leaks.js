#!/usr/bin/env node

/**
 * Memory Leak Detection Script for Audio Components
 * Checks for potential memory leaks in audio-related hooks and components
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Memory Leak Detection for Audio Components');
console.log('==============================================\n');

// Files to check for audio-related memory leaks
const filesToCheck = [
  'hooks/usePronunciationFeedback.tsx',
  'components/exercises/BaseExercise.tsx',
  'components/PronunciationFeedback.tsx',
  'components/STTExample.tsx',
  'services/speechToText.ts',
  'services/elevenLabs.ts',
];

// Patterns that indicate proper memory management
const goodPatterns = [
  'unloadAsync',
  'cleanup',
  'useEffect.*return.*=>',
  'setSound\\(null\\)',
  'setOnPlaybackStatusUpdate',
  'didJustFinish',
];

// Patterns that indicate potential memory leaks
const badPatterns = [
  'Audio\\.Sound\\.createAsync.*(?!unloadAsync)',
  'new Audio\\.Sound',
  'sound\\.playAsync.*(?!unloadAsync)',
  'useEffect.*Audio.*(?!return)',
];

function checkFileForMemoryLeaks(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      exists: false,
      issues: [],
      goodPractices: [],
      score: 0,
    };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  const goodPractices = [];

  // Check for good practices
  goodPatterns.forEach(pattern => {
    const regex = new RegExp(pattern, 'g');
    const matches = content.match(regex);
    if (matches) {
      goodPractices.push({
        pattern,
        count: matches.length,
        examples: matches.slice(0, 3), // Show first 3 examples
      });
    }
  });

  // Check for potential issues
  badPatterns.forEach(pattern => {
    const regex = new RegExp(pattern, 'g');
    const matches = content.match(regex);
    if (matches) {
      issues.push({
        pattern,
        count: matches.length,
        examples: matches.slice(0, 3), // Show first 3 examples
      });
    }
  });

  // Calculate score (0-100)
  const totalGoodPractices = goodPractices.reduce((sum, practice) => sum + practice.count, 0);
  const totalIssues = issues.reduce((sum, issue) => sum + issue.count, 0);
  const score = totalIssues === 0 ? 100 : Math.max(0, 100 - (totalIssues * 20));

  return {
    exists: true,
    issues,
    goodPractices,
    score,
    totalGoodPractices,
    totalIssues,
  };
}

function analyzeAudioMemoryManagement() {
  console.log('1. 📁 Analyzing audio-related files for memory management...\n');
  
  let totalScore = 0;
  let filesAnalyzed = 0;
  let totalIssues = 0;
  let totalGoodPractices = 0;

  filesToCheck.forEach(filePath => {
    console.log(`📄 ${filePath}:`);
    
    const analysis = checkFileForMemoryLeaks(filePath);
    
    if (!analysis.exists) {
      console.log('   ⚠️  File not found\n');
      return;
    }

    filesAnalyzed++;
    totalScore += analysis.score;
    totalIssues += analysis.totalIssues;
    totalGoodPractices += analysis.totalGoodPractices;

    // Show good practices
    if (analysis.goodPractices.length > 0) {
      console.log('   ✅ Good practices found:');
      analysis.goodPractices.forEach(practice => {
        console.log(`      - ${practice.pattern}: ${practice.count} occurrences`);
      });
    }

    // Show issues
    if (analysis.issues.length > 0) {
      console.log('   ❌ Potential issues found:');
      analysis.issues.forEach(issue => {
        console.log(`      - ${issue.pattern}: ${issue.count} occurrences`);
      });
    }

    // Show score
    const scoreColor = analysis.score >= 80 ? '✅' : analysis.score >= 60 ? '⚠️' : '❌';
    console.log(`   ${scoreColor} Memory management score: ${analysis.score}/100\n`);
  });

  return {
    filesAnalyzed,
    totalScore: filesAnalyzed > 0 ? totalScore / filesAnalyzed : 0,
    totalIssues,
    totalGoodPractices,
  };
}

function generateRecommendations(analysis) {
  console.log('2. 💡 Memory Management Recommendations:');
  console.log('========================================\n');

  if (analysis.totalScore >= 90) {
    console.log('🎉 EXCELLENT: Audio memory management is very good!');
    console.log('   - Proper cleanup patterns are in place');
    console.log('   - Audio resources are being managed correctly\n');
  } else if (analysis.totalScore >= 70) {
    console.log('⚠️  GOOD: Audio memory management is acceptable but can be improved');
    console.log('   - Most cleanup patterns are in place');
    console.log('   - Consider adding more comprehensive cleanup\n');
  } else {
    console.log('❌ POOR: Audio memory management needs significant improvement');
    console.log('   - Multiple potential memory leaks detected');
    console.log('   - Implement proper cleanup patterns immediately\n');
  }

  if (analysis.totalIssues > 0) {
    console.log('🔧 Specific Improvements Needed:');
    console.log('1. Always call unloadAsync() on Audio.Sound objects');
    console.log('2. Set up cleanup in useEffect return functions');
    console.log('3. Use setOnPlaybackStatusUpdate to detect when audio finishes');
    console.log('4. Set sound state to null after cleanup');
    console.log('5. Handle cleanup errors gracefully with try-catch\n');
  }

  console.log('📋 Best Practices for Audio Memory Management:');
  console.log('1. Always clean up Audio.Sound objects in useEffect cleanup');
  console.log('2. Use setOnPlaybackStatusUpdate to detect playback completion');
  console.log('3. Set sound state to null after unloadAsync()');
  console.log('4. Handle cleanup errors with try-catch blocks');
  console.log('5. Avoid creating multiple Audio.Sound objects without cleanup');
  console.log('6. Use proper dependency arrays in useEffect hooks\n');
}

function checkSpecificPatterns() {
  console.log('3. 🔍 Checking for specific memory leak patterns...\n');

  const patterns = [
    {
      name: 'Audio.Sound without cleanup',
      pattern: /Audio\.Sound\.createAsync/g,
      description: 'Audio.Sound objects created without proper cleanup',
    },
    {
      name: 'Missing useEffect cleanup',
      pattern: /useEffect.*Audio/g,
      description: 'useEffect hooks with Audio that might not have cleanup',
    },
    {
      name: 'Sound state not reset',
      pattern: /setSound\([^n]/g,
      description: 'Sound state set to non-null values without cleanup',
    },
  ];

  let totalPatternIssues = 0;

  filesToCheck.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern.pattern);
      if (matches) {
        console.log(`❌ ${filePath}: ${pattern.name}`);
        console.log(`   ${pattern.description}`);
        console.log(`   Found ${matches.length} occurrences\n`);
        totalPatternIssues += matches.length;
      }
    });
  });

  if (totalPatternIssues === 0) {
    console.log('✅ No specific memory leak patterns detected!\n');
  }

  return totalPatternIssues;
}

function main() {
  try {
    const analysis = analyzeAudioMemoryManagement();
    const patternIssues = checkSpecificPatterns();
    
    console.log('📊 Memory Management Analysis Summary:');
    console.log('=====================================');
    console.log(`Files Analyzed: ${analysis.filesAnalyzed}`);
    console.log(`Average Score: ${analysis.totalScore.toFixed(1)}/100`);
    console.log(`Total Good Practices: ${analysis.totalGoodPractices}`);
    console.log(`Total Issues: ${analysis.totalIssues}`);
    console.log(`Pattern Issues: ${patternIssues}\n`);
    
    generateRecommendations(analysis);
    
    // Overall assessment
    if (analysis.totalScore >= 90 && patternIssues === 0) {
      console.log('🎉 EXCELLENT: Audio memory management is production-ready!');
      console.log('✅ No memory leaks detected');
      console.log('✅ Proper cleanup patterns implemented');
      return true;
    } else if (analysis.totalScore >= 70 && patternIssues < 3) {
      console.log('⚠️  GOOD: Audio memory management is acceptable');
      console.log('🔧 Minor improvements recommended');
      return true;
    } else {
      console.log('❌ POOR: Audio memory management needs immediate attention');
      console.log('🚨 Memory leaks detected - fix before production deployment');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error during memory leak detection:', error.message);
    return false;
  }
}

// Run the analysis
if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { main };
