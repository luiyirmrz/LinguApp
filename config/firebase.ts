/**
 * Firebase Configuration and Initialization for LinguApp
 * Provides real Firebase integration with fallback to mock services for development
 * Supports Firestore, Authentication, Remote Config, Analytics, Performance, and Storage
 */

import { Platform } from 'react-native';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  Auth,
  connectAuthEmulator,
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  connectFirestoreEmulator,
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  increment,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  runTransaction,
  enableNetwork,
  disableNetwork,
  waitForPendingWrites,
} from 'firebase/firestore';
import { 
  getFunctions, 
  httpsCallable,
  connectFunctionsEmulator,
  Functions,
} from 'firebase/functions';
import { 
  getRemoteConfig,
  fetchAndActivate,
  getValue,
  RemoteConfig,
} from 'firebase/remote-config';
import {
  getStorage,
} from 'firebase/storage';
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
} from 'firebase/analytics';
import {
  getPerformance,
} from 'firebase/performance';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration - using environment variables for security
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Check if Firebase configuration is available (exclude placeholder values)
const hasFirebaseConfig = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.appId &&
  firebaseConfig.apiKey !== 'your_firebase_api_key_here' &&
  firebaseConfig.projectId !== 'your_project_id' &&
  firebaseConfig.appId !== 'your_app_id' &&
  firebaseConfig.apiKey !== 'mock_api_key_for_development' &&
  firebaseConfig.projectId !== 'mock-project-id' &&
  firebaseConfig.appId !== '1:123456789:web:mock_app_id'
);

// Development flags
const IS_DEVELOPMENT = __DEV__ || !hasFirebaseConfig;
const USE_EMULATOR = IS_DEVELOPMENT && Platform.OS !== 'web' && hasFirebaseConfig;
const USE_MOCK_SERVICES = !hasFirebaseConfig;

// Connection retry configuration
const CONNECTION_RETRY_ATTEMPTS = 3;
const CONNECTION_RETRY_DELAY = 2000; // 2 seconds

console.log('Firebase Config Status:', {
  hasConfig: hasFirebaseConfig,
  isDevelopment: IS_DEVELOPMENT,
  useEmulator: USE_EMULATOR,
  useMockServices: USE_MOCK_SERVICES,
});

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth;
let db: Firestore;
let functions: Functions;
let storage: any;
let analytics: any;
let performance: any;
let remoteConfig: RemoteConfig | undefined;
let isFirebaseInitialized = false;
let connectionRetryCount = 0;

// Connection health check function
const checkFirestoreConnection = async (): Promise<boolean> => {
  if (!db) return false;
  
  try {
    // Try to enable network and wait for connection
    await enableNetwork(db);
    
    // Wait for any pending writes to complete
    await waitForPendingWrites(db);
    
    // Try a simple operation to test connection
    const testDoc = doc(db, '_test', 'connection');
    await getDoc(testDoc);
    
    console.log('Firestore connection test successful');
    return true;
  } catch (error) {
    console.warn('Firestore connection test failed:', error);
    return false;
  }
};

// Retry connection function
const retryFirestoreConnection = async (): Promise<boolean> => {
  if (connectionRetryCount >= CONNECTION_RETRY_ATTEMPTS) {
    console.error('Max connection retry attempts reached');
    return false;
  }
  
  connectionRetryCount++;
  console.log(`Retrying Firestore connection (attempt ${connectionRetryCount}/${CONNECTION_RETRY_ATTEMPTS})`);
  
  try {
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, CONNECTION_RETRY_DELAY));
    
    // Try to reconnect
    await enableNetwork(db);
    const isConnected = await checkFirestoreConnection();
    
    if (isConnected) {
      console.log('Firestore connection restored');
      connectionRetryCount = 0; // Reset retry count on success
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Connection retry failed:', error);
    return false;
  }
};

// Initialize Firebase only if we have valid configuration
if (hasFirebaseConfig && firebaseConfig && !USE_MOCK_SERVICES) {
  (async () => {
    try {
      // Initialize Firebase app
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
        console.log('Firebase app initialized with project:', firebaseConfig.projectId);
      } else {
        app = getApps()[0];
        console.log('Using existing Firebase app');
      }

      // Initialize Auth
      if (Platform.OS === 'web') {
        auth = getAuth(app);
      } else {
        auth = initializeAuth(app, {
          // React Native persistence is handled automatically
        });
      }

      // Initialize Firestore with enhanced configuration
      if (Platform.OS === 'web') {
        db = getFirestore(app);
      } else {
        db = initializeFirestore(app, {
          experimentalForceLongPolling: true, // For React Native
          cacheSizeBytes: 100 * 1024 * 1024, // 100MB cache
          ignoreUndefinedProperties: true, // Ignore undefined properties
        });
      }

      // Test initial connection
      const initialConnection = await checkFirestoreConnection();
      if (!initialConnection) {
        console.warn('Initial Firestore connection failed, will retry on demand');
      }

      // Initialize Functions
      functions = getFunctions(app);

      // Initialize Storage
      storage = getStorage(app);

      // Initialize Analytics (web only)
      if (Platform.OS === 'web') {
        try {
          const supported = await isAnalyticsSupported();
          if (supported) {
            analytics = getAnalytics(app);
          }
        } catch (error) {
          console.warn('Analytics not supported:', error);
        }
      }

      // Initialize Performance Monitoring (web only)
      if (Platform.OS === 'web') {
        try {
          performance = getPerformance(app);
        } catch (error) {
          console.warn('Performance monitoring not supported:', error);
        }
      }

      // Initialize Remote Config
      if (Platform.OS !== 'web') {
        remoteConfig = getRemoteConfig(app);
        remoteConfig.settings.minimumFetchIntervalMillis = IS_DEVELOPMENT ? 0 : 3600000; // 1 hour in production
        
        // Set default values
        remoteConfig.defaultConfig = {
          xpPerWord: 10,
          xpPerReview: 5,
          xpPerLesson: 50,
          cefrA1Threshold: 500,
          cefrA2Threshold: 1000,
          cefrB1Threshold: 2000,
          cefrB2Threshold: 3500,
          cefrC1Threshold: 5500,
          cefrC2Threshold: 8000,
          maxHeartsPerDay: 5,
          heartRefillTimeMinutes: 30,
          streakFreezeEnabled: true,
          doubleXPEnabled: true,
        };
      }

      // Connect to emulators in development
      if (USE_EMULATOR) {
        try {
          connectAuthEmulator(auth, 'http://localhost:9099');
          connectFirestoreEmulator(db, 'localhost', 8080);
          connectFunctionsEmulator(functions, 'localhost', 5001);
          console.log('Connected to Firebase emulators');
        } catch (error) {
          console.warn('Failed to connect to emulators, using production:', error);
        }
      }

      isFirebaseInitialized = true;
      console.log('Firebase initialized successfully');
      console.log('Project ID:', firebaseConfig.projectId);
      console.log('Development mode:', IS_DEVELOPMENT);
      
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      console.log('Falling back to mock Firebase services');
      initializeMockServices();
    }
  })();
} else {
  console.log('No Firebase configuration found, using mock services');
  initializeMockServices();
}

// Mock services initialization function
function initializeMockServices() {
  // Mock implementations for fallback
  const mockAuth = {
    currentUser: null,
    onAuthStateChanged: (callback: (user: any) => void) => {
      return () => {};
    },
    signInWithEmailAndPassword: async (email: string, password: string) => {
      throw new Error('Mock Firebase - Use AuthService instead');
    },
    createUserWithEmailAndPassword: async (email: string, password: string) => {
      throw new Error('Mock Firebase - Use AuthService instead');
    },
    signOut: async () => {
      console.log('Mock Firebase sign out');
    },
  };

  const mockDb = {
    _isMock: true,
    collection: (path: string) => ({
      doc: (id: string) => ({
        get: async () => ({ 
          exists: () => false, 
          data: () => null,
          id,
        }),
        set: async (data: any) => {
          console.log('Mock Firestore set:', path, id, data);
          return Promise.resolve();
        },
        update: async (data: any) => {
          console.log('Mock Firestore update:', path, id, data);
          return Promise.resolve();
        },
        delete: async () => {
          console.log('Mock Firestore delete:', path, id);
          return Promise.resolve();
        },
      }),
      add: async (data: any) => {
        console.log('Mock Firestore add:', path, data);
        return Promise.resolve({ id: `mock_${Date.now()}` });
      },
      where: () => ({
        get: async () => ({ docs: [] }),
      }),
      get: async () => ({ docs: [] }),
      orderBy: () => ({
        limit: () => ({
          get: async () => ({ docs: [] }),
        }),
      }),
    }),
  };

  auth = mockAuth as any;
  db = mockDb as any;
  functions = {
    httpsCallable: (name: string) => async (data: any) => {
      console.log('Mock Cloud Function call:', name, data);
      return { data: null };
    },
  } as any;
  storage = {
    ref: (path: string) => ({
      put: async (data: any) => {
        console.log('Mock Storage upload:', path, data);
        return Promise.resolve({ ref: { fullPath: path } });
      },
      getDownloadURL: async () => {
        console.log('Mock Storage download URL:', path);
        return `mock://storage/${path}`;
      },
    }),
  };
  analytics = null;
  performance = null;
  remoteConfig = undefined;
}

// Remote Config helpers
export const getRemoteConfigValue = async (key: string, defaultValue: any = null) => {
  if (!remoteConfig || Platform.OS === 'web' || USE_MOCK_SERVICES) {
    console.log(`Mock Remote Config: ${key} = ${defaultValue}`);
    return defaultValue;
  }
  
  try {
    await fetchAndActivate(remoteConfig);
    const value = getValue(remoteConfig, key);
    return value.asString() || defaultValue;
  } catch (error) {
    console.error('Error fetching remote config:', error);
    return defaultValue;
  }
};

// Helper to check if Firebase is properly configured
export const isFirebaseConfigured = () => hasFirebaseConfig;

// Helper to check if using mock services
export const isMockMode = () => USE_MOCK_SERVICES;

// Helper to check if Firebase is initialized
export const isFirebaseReady = () => isFirebaseInitialized;

// Helper to check Firestore connection health
export const checkConnectionHealth = async (): Promise<boolean> => {
  if (!isFirebaseInitialized || USE_MOCK_SERVICES) {
    return false;
  }
  
  try {
    return await checkFirestoreConnection();
  } catch (error) {
    console.error('Connection health check failed:', error);
    return false;
  }
};

// Helper to retry Firestore connection
export const retryConnection = async (): Promise<boolean> => {
  if (!isFirebaseInitialized || USE_MOCK_SERVICES) {
    return false;
  }
  
  return await retryFirestoreConnection();
};

// Firestore helpers with enhanced error handling and retry logic
export const firestoreDoc = (path: string, id: string) => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    // @ts-ignore
    if (db._isMock) {
      // @ts-ignore
      return db.collection(path).doc(id);
    }
    return doc(db, path, id);
  } catch (error) {
    console.error('Error creating document reference:', error);
    throw error;
  }
};

export const firestoreCollection = (path: string) => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    // @ts-ignore
    if (db._isMock) {
      // @ts-ignore
      return db.collection(path);
    }
    return collection(db, path);
  } catch (error) {
    console.error('Error creating collection reference:', error);
    throw error;
  }
};

// Enhanced Firestore operations with retry logic
export const firestoreGetDoc = async (docRef: any, retryCount = 0): Promise<any> => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    const result = await getDoc(docRef);
    return result;
  } catch (error: any) {
    if (error.code === 'unavailable' && retryCount < CONNECTION_RETRY_ATTEMPTS) {
      console.log(`Retrying getDoc operation (attempt ${retryCount + 1})`);
      const isConnected = await retryConnection();
      if (isConnected) {
        return await firestoreGetDoc(docRef, retryCount + 1);
      }
    }
    throw error;
  }
};

export const firestoreSetDoc = async (docRef: any, data: any, retryCount = 0): Promise<void> => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    await setDoc(docRef, data);
  } catch (error: any) {
    if (error.code === 'unavailable' && retryCount < CONNECTION_RETRY_ATTEMPTS) {
      console.log(`Retrying setDoc operation (attempt ${retryCount + 1})`);
      const isConnected = await retryConnection();
      if (isConnected) {
        return await firestoreSetDoc(docRef, data, retryCount + 1);
      }
    }
    throw error;
  }
};

// Batch operations helper
export const createBatch = () => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    return writeBatch(db);
  } catch (error) {
    console.error('Error creating batch:', error);
    throw error;
  }
};

// Transaction helper
export const runFirestoreTransaction = async (updateFunction: any) => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    return await runTransaction(db, updateFunction);
  } catch (error) {
    console.error('Error running transaction:', error);
    throw error;
  }
};

// Real-time listener helper with connection monitoring
export const createRealtimeListener = (docRef: any, callback: (data: any) => void) => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    return onSnapshot(docRef, (doc: any) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    }, (error: any) => {
      console.error('Realtime listener error:', error);
      
      // If it's a connection error, try to reconnect
      if (error.code === 'unavailable') {
        console.log('Attempting to reconnect Firestore...');
        retryConnection().then(success => {
          if (success) {
            console.log('Reconnected, recreating listener...');
            // Recreate the listener
            createRealtimeListener(docRef, callback);
          }
        });
      }
    });
  } catch (error) {
    console.error('Error creating realtime listener:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

// Export Firebase instances
export { auth, db, functions, storage, analytics, performance, remoteConfig };

// Export Firestore functions
export {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  increment,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  runTransaction,
};

// Export Functions helpers
export const callFunction = (name: string) => {
  try {
    if (!functions) {
      throw new Error('Functions not initialized');
    }
    return httpsCallable(functions, name);
  } catch (error) {
    console.error('Error creating function callable:', error);
    return async (data: any) => {
      console.log('Mock function call:', name, data);
      return { data: null };
    };
  }
};

// Export app instance
export default app!;
