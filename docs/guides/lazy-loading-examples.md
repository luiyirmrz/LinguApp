# Lazy Loading Examples

## How to Use Lazy Dependencies

### Basic Usage
```typescript
import { lazyLoadChartKit, lazyLoadLottie } from '@/services/LazyDependencies';

// In your component
const MyComponent = () => {
  useEffect(() => {
    // Load heavy dependencies when needed
    lazyLoadChartKit().then(chartKit => {
      // Use chartKit
    });
  }, []);
};
```

### Route-based Preloading
```typescript
import { preloadDependenciesForRoute } from '@/services/LazyDependencies';

// Preload dependencies for specific routes
const navigateToDashboard = () => {
  preloadDependenciesForRoute('dashboard');
  // Navigate to dashboard
};
```

### Component Lazy Loading
```typescript
import { LazyDashboard, LazyLessonScreen } from '@/components/CodeSplitter';

// Use lazy loaded components
const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyDashboard />
  </Suspense>
);
```
