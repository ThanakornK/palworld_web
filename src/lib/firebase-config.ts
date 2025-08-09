import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration interface
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

// Firebase services interface
export interface FirebaseServices {
  app: FirebaseApp;
  database: Database;
  auth: Auth;
  analytics?: Analytics;
}

// Global Firebase state
let firebaseApp: FirebaseApp | null = null;
let firebaseServices: FirebaseServices | null = null;

// Example configuration (fallback)
const exampleConfig: FirebaseConfig = {
  apiKey: "AIzaSyDJQhOPS3_LmVeqLlrQPfsRvOrrbrLrLPs",
  authDomain: "palworld-app.firebaseapp.com",
  databaseURL: "https://palworld-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "palworld-app",
  storageBucket: "palworld-app.firebasestorage.app",
  messagingSenderId: "880799299633",
  appId: "1:880799299633:web:55327ead2b983bb398bd10",
  measurementId: "G-3FYLP2V15K"
};

/**
 * Initialize Firebase with the provided configuration
 */
export function initializeFirebase(config: FirebaseConfig): FirebaseServices {
  try {
    // Validate configuration
    validateFirebaseConfig(config);
    
    // Initialize Firebase app
    firebaseApp = initializeApp(config);
    
    // Initialize services
    const database = getDatabase(firebaseApp);
    const auth = getAuth(firebaseApp);
    
    // Initialize analytics (optional, only in browser)
    let analytics: Analytics | undefined;
    if (typeof window !== 'undefined' && config.measurementId) {
      try {
        analytics = getAnalytics(firebaseApp);
      } catch (error) {
        console.warn('Analytics initialization failed:', error);
      }
    }
    
    firebaseServices = {
      app: firebaseApp,
      database,
      auth,
      analytics
    };
    
    console.log('Firebase initialized successfully');
    return firebaseServices;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error;
  }
}

/**
 * Get current Firebase services
 */
export function getFirebaseServices(): FirebaseServices | null {
  return firebaseServices;
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized(): boolean {
  return firebaseServices !== null;
}

/**
 * Get Firebase database instance
 */
export function getFirebaseDatabase(): Database {
  if (!firebaseServices) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return firebaseServices.database;
}

/**
 * Get Firebase auth instance
 */
export function getFirebaseAuth(): Auth {
  if (!firebaseServices) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return firebaseServices.auth;
}

/**
 * Get Firebase analytics instance
 */
export function getFirebaseAnalytics(): Analytics | undefined {
  if (!firebaseServices) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return firebaseServices.analytics;
}

/**
 * Load Firebase configuration from environment variables
 */
export function getFirebaseConfigFromEnv(): FirebaseConfig | null {
  if (typeof window === 'undefined') {
    // Server-side: use process.env
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };
    
    // Check if required fields are present
    if (!config.apiKey || !config.authDomain || !config.databaseURL || !config.projectId) {
      console.warn('Missing required Firebase environment variables');
      return null;
    }
    
    return config as FirebaseConfig;
  } else {
    // Client-side: use window environment or fallback
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };
    
    // Check if required fields are present
    if (!config.apiKey || !config.authDomain || !config.databaseURL || !config.projectId) {
      console.warn('Missing required Firebase environment variables, using example config');
      return exampleConfig;
    }
    
    return config as FirebaseConfig;
  }
}

/**
 * Validate Firebase configuration
 */
export function validateFirebaseConfig(config: FirebaseConfig): void {
  const required = ['apiKey', 'authDomain', 'databaseURL', 'projectId'];
  
  for (const field of required) {
    if (!config[field as keyof FirebaseConfig]) {
      throw new Error(`Missing required Firebase config field: ${field}`);
    }
  }
  
  // Validate URL formats
  if (!config.databaseURL.includes('firebasedatabase.app')) {
    throw new Error('Invalid Firebase database URL format');
  }
  
  if (!config.authDomain.includes('firebaseapp.com')) {
    throw new Error('Invalid Firebase auth domain format');
  }
}

/**
 * Auto-initialize Firebase with environment variables (if available)
 */
export function autoInitializeFirebase(): FirebaseServices | null {
  if (isFirebaseInitialized()) {
    return getFirebaseServices();
  }
  
  const config = getFirebaseConfigFromEnv();
  if (config) {
    try {
      return initializeFirebase(config);
    } catch (error) {
      console.error('Auto-initialization failed:', error);
      return null;
    }
  }
  
  return null;
}