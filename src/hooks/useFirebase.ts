'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getFirebaseServices, 
  isFirebaseInitialized, 
  FirebaseConfig,
  FirebaseServices 
} from '@/lib/firebase-config';
import { firebaseService } from '@/lib/firebase-service';

export interface UseFirebaseReturn {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  services: FirebaseServices | null;
  initialize: (config: FirebaseConfig, importData?: boolean) => Promise<void>;
  checkStatus: () => Promise<void>;
  importData: (source?: 'local' | 'upload', data?: any) => Promise<void>;
}

/**
 * Custom hook for Firebase integration
 * Provides Firebase initialization, status checking, and data import functionality
 */
export function useFirebase(): UseFirebaseReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<FirebaseServices | null>(null);

  // Check Firebase status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  /**
   * Check Firebase initialization status
   */
  const checkStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check local Firebase status
      const localStatus = isFirebaseInitialized();
      
      if (localStatus) {
        const firebaseServices = getFirebaseServices();
        setServices(firebaseServices);
        setIsInitialized(true);
      } else {
        // Check via API
        const response = await fetch('/api/firebase/init');
        const data = await response.json();
        
        if (response.ok) {
          setIsInitialized(data.initialized);
        } else {
          setError(data.error || 'Failed to check Firebase status');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initialize Firebase with configuration
   */
  const initialize = useCallback(async (config: FirebaseConfig, importData = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/firebase/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseConfig: config,
          importData
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsInitialized(true);
        const firebaseServices = getFirebaseServices();
        setServices(firebaseServices);
      } else {
        setError(data.error || 'Failed to initialize Firebase');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize Firebase');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Import data to Firebase
   */
  const importData = useCallback(async (source: 'local' | 'upload' = 'local', data?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/firebase/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          data
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || 'Failed to import data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
    services,
    initialize,
    checkStatus,
    importData
  };
}

/**
 * Hook for Firebase configuration from environment variables
 */
export function useFirebaseConfig(): FirebaseConfig | null {
  const [config, setConfig] = useState<FirebaseConfig | null>(null);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const firebaseConfig: FirebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
      };
      
      // Only set config if required fields are present
      if (firebaseConfig.apiKey && firebaseConfig.authDomain && 
          firebaseConfig.databaseURL && firebaseConfig.projectId) {
        setConfig(firebaseConfig);
      }
    }
  }, []);
  
  return config;
}

/**
 * Hook for Firebase data operations
 */
export function useFirebaseData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/pals');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pals');
      }
      
      return data.message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pals';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchPassiveSkills = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/options/passive-skills');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch passive skills');
      }
      
      return data.message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch passive skills';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchPalSpecies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/options/pal-species');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pal species');
      }
      
      return data.message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pal species';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    isLoading,
    error,
    fetchPals,
    fetchPassiveSkills,
    fetchPalSpecies
  };
}