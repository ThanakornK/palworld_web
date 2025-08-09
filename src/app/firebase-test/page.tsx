'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useFirebaseConfig } from '@/hooks/useFirebase';
import FirebaseAdmin from '@/components/FirebaseAdmin';
import { isFirebaseInitialized, getFirebaseConfigFromEnv } from '@/lib/firebase-config';

export default function FirebaseTestPage() {
  const [status, setStatus] = useState<string>('Checking...');
  const [envConfig, setEnvConfig] = useState<any>(null);
  const { isInitialized, initialize, error } = useFirebase();
  const config = useFirebaseConfig();

  useEffect(() => {
    // Check Firebase status
    const checkStatus = () => {
      if (isFirebaseInitialized()) {
        setStatus('✅ Firebase is initialized and ready!');
      } else {
        setStatus('⚠️ Firebase is not initialized');
      }
    };

    // Get environment config
    const envConf = getFirebaseConfigFromEnv();
    setEnvConfig(envConf);

    checkStatus();
    
    // Check status every 2 seconds
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [isInitialized]);

  const handleAutoInit = async () => {
    if (config) {
      try {
        await initialize(config, false);
        setStatus('✅ Firebase initialized successfully!');
      } catch (err) {
        setStatus(`❌ Initialization failed: ${err}`);
      }
    } else {
      setStatus('❌ No configuration available');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Firebase Integration Test</h1>
      
      {/* Status Section */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Firebase Status</h2>
        <p className="text-lg">{status}</p>
        {error && (
          <p className="text-red-600 mt-2">Error: {error}</p>
        )}
      </div>

      {/* Environment Config Section */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment Configuration</h2>
        {envConfig ? (
          <div className="space-y-2">
            <p>✅ <strong>API Key:</strong> {envConfig.apiKey ? '***' + envConfig.apiKey.slice(-4) : 'Not set'}</p>
            <p>✅ <strong>Auth Domain:</strong> {envConfig.authDomain}</p>
            <p>✅ <strong>Database URL:</strong> {envConfig.databaseURL}</p>
            <p>✅ <strong>Project ID:</strong> {envConfig.projectId}</p>
            <p>✅ <strong>Storage Bucket:</strong> {envConfig.storageBucket}</p>
            <p>✅ <strong>App ID:</strong> {envConfig.appId ? '***' + envConfig.appId.slice(-4) : 'Not set'}</p>
          </div>
        ) : (
          <p className="text-red-600">❌ No environment configuration found</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
        <div className="space-x-4">
          <button
            onClick={handleAutoInit}
            disabled={isInitialized}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isInitialized ? 'Already Initialized' : 'Auto Initialize Firebase'}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Refresh Page
          </button>
        </div>
      </div>

      {/* API Test Section */}
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">API Endpoints Test</h2>
        <div className="space-y-2">
          <div className="flex space-x-4">
            <a 
              href="/api/firebase/init" 
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              📡 /api/firebase/init (Check Status)
            </a>
            <a 
              href="/api/options/pal-species" 
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              🐾 /api/options/pal-species
            </a>
            <a 
              href="/api/options/passive-skills" 
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              ⚡ /api/options/passive-skills
            </a>
          </div>
        </div>
      </div>

      {/* Firebase Admin Component */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Firebase Admin Panel</h2>
        <FirebaseAdmin />
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h2 className="text-xl font-semibold mb-2">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Check that environment variables are loaded correctly above</li>
          <li>Click "Auto Initialize Firebase" to initialize with environment config</li>
          <li>Use the Firebase Admin Panel below to manage data</li>
          <li>Test the API endpoints to ensure they're working</li>
          <li>Check the browser console for any errors</li>
        </ol>
      </div>
    </div>
  );
}