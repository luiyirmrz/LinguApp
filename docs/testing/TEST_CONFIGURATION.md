# Test Configuration Documentation

## Overview

This document describes the testing configuration and setup for the LinguApp project. The project uses Jest as the primary testing framework with React Native Testing Library for component testing.

## Test Framework Setup

### Jest Configuration

The Jest configuration is defined in `package.json`:

```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterEnv": ["<rootDir>/__tests__/setup.ts"],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ],
    "collectCoverageFrom": [
      "**/*.{ts,tsx}",
      "!**/node_modules/**",
      "!**/__tests__/**",
      "!**/coverage/**",
      "!**/scripts/**",
      "!**/docs/**",
      "!**/mocks/**",
      "!**/*.config.{js,ts}",
      "!**/index.ts"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    },
    "testMatch": [
      "**/__tests__/**/*.{ts,tsx}",
      "**/?(*.)+(spec|test).{ts,tsx}"
    ],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/$1"
    }
  }
}
```

### Test Setup File

The main test setup file is located at `__tests__/setup.ts`. This file:

1. **Mocks React Native modules** that aren't available in the test environment
2. **Configures global test utilities**
3. **Sets up mock implementations** for external dependencies
4. **Configures test environment variables**

#### Key Mock Configurations

```typescript
// Mock @expo/vector-icons (replacing lucide-react-native)
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  Feather: 'Feather',
  AntDesign: 'AntDesign',
  FontAwesome5: 'FontAwesome5',
  Entypo: 'Entypo',
}));

// Mock the LucideReplacement component
jest.mock('@/components/icons/LucideReplacement', () => ({
  Home: 'Home',
  User: 'User',
  Settings: 'Settings',
  // ... other icons
}));
```

## Test Structure

### Directory Organization

```
__tests__/
├── setup.ts                    # Global test setup
├── mocks/                      # Mock implementations
│   └── server.ts              # MSW server setup
├── unit/                       # Unit tests
│   ├── accessibility.test.tsx
│   └── i18n.test.ts
├── integration/                # Integration tests
│   └── onboarding.test.tsx
└── *.test.ts                   # Feature-specific tests
```

### Test Categories

1. **Unit Tests**: Test individual functions, components, or services in isolation
2. **Integration Tests**: Test the interaction between multiple components or services
3. **Feature Tests**: Test complete features or user workflows

## Running Tests

### Available Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Update snapshots
npm run test:update
```

### Test Commands

```bash
# Run specific test file
npm test -- --testPathPattern="centralizedErrorService"

# Run tests with verbose output
npm test -- --verbose

# Run tests with no coverage
npm test -- --no-coverage

# Run tests with specific pattern
npm test -- --testNamePattern="should handle errors"
```

## Test Configuration Best Practices

### Timeout Configuration

- **Default timeout**: 10 seconds (configured globally)
- **Long-running tests**: Use specific timeout values
- **Optimized timeouts**: Reduced from 35s to 15s for better CI performance

```typescript
it('should respect max delay limits', async () => {
  // Test implementation
}, 15000); // 15 seconds timeout
```

### Mock Configuration

1. **External Dependencies**: Always mock external libraries and APIs
2. **React Native Modules**: Mock platform-specific modules
3. **Navigation**: Mock navigation functions and components
4. **Async Storage**: Mock storage operations

### Coverage Requirements

- **Minimum coverage**: 70% for branches, functions, lines, and statements
- **Coverage collection**: Excludes test files, config files, and documentation
- **Coverage reports**: Generated in HTML format in `coverage/` directory

## Test Utilities

### Custom Matchers

The project includes custom Jest matchers for React Native testing:

```typescript
import '@testing-library/jest-native/extend-expect';
```

### Mock Utilities

```typescript
// Mock user authentication
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
};

// Mock API responses
const mockApiResponse = {
  data: { success: true },
  status: 200,
};
```

## Debugging Tests

### Common Issues and Solutions

1. **Module Resolution Errors**
   - Check `moduleNameMapper` configuration
   - Verify import paths use `@/` prefix

2. **Mock Configuration Issues**
   - Ensure mocks are defined before imports
   - Check mock implementations match expected interfaces

3. **Timeout Issues**
   - Increase timeout for long-running tests
   - Use `jest.setTimeout()` for global configuration

4. **Coverage Issues**
   - Check `collectCoverageFrom` patterns
   - Exclude unnecessary files from coverage

### Debug Commands

```bash
# Run tests with debug output
npm test -- --verbose --no-coverage

# Run specific test with debug
npm test -- --testPathPattern="specific-test" --verbose

# Check test configuration
npm test -- --showConfig
```

## Continuous Integration

### CI Configuration

Tests are configured to run in CI mode with:
- **No watch mode**: `--watchAll=false`
- **Coverage collection**: `--coverage`
- **CI-specific settings**: `--ci`

### Performance Optimization

- **Parallel execution**: Tests run in parallel by default
- **Optimized timeouts**: Reduced test execution time
- **Selective testing**: Run only changed tests when possible

## Maintenance

### Regular Tasks

1. **Update test dependencies**: Keep testing libraries up to date
2. **Review coverage reports**: Ensure coverage thresholds are met
3. **Clean up unused mocks**: Remove obsolete mock implementations
4. **Optimize test performance**: Monitor and improve test execution time

### Adding New Tests

1. **Follow naming conventions**: Use `.test.ts` or `.test.tsx` extensions
2. **Place in appropriate directory**: Unit, integration, or feature tests
3. **Add necessary mocks**: Mock external dependencies
4. **Write descriptive test names**: Use clear, descriptive test descriptions
5. **Maintain coverage**: Ensure new code is covered by tests

## Troubleshooting

### Common Error Messages

1. **"Cannot find module"**: Check module resolution and mock configuration
2. **"Timeout exceeded"**: Increase timeout or optimize test performance
3. **"Mock function not called"**: Verify mock setup and test expectations
4. **"Coverage below threshold"**: Add tests or adjust coverage requirements

### Getting Help

- **Jest Documentation**: https://jestjs.io/docs/getting-started
- **React Native Testing Library**: https://callstack.github.io/react-native-testing-library/
- **Expo Testing Guide**: https://docs.expo.dev/guides/testing-with-jest/

## Conclusion

This testing configuration provides a robust foundation for testing the LinguApp project. Regular maintenance and updates ensure that tests remain reliable and performant as the project evolves.
