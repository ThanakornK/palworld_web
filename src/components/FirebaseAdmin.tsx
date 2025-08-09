'use client';

import React, { useState } from 'react';
import { useFirebase, useFirebaseConfig } from '@/hooks/useFirebase';
import { FirebaseConfig } from '@/lib/firebase-config';

interface FirebaseAdminProps {
  className?: string;
}

export default function FirebaseAdmin({ className = '' }: FirebaseAdminProps) {
  const { 
    isInitialized, 
    isLoading, 
    error, 
    initialize, 
    checkStatus, 
    importData 
  } = useFirebase();
  
  const envConfig = useFirebaseConfig();
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [configForm, setConfigForm] = useState<FirebaseConfig>({
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  });
  const [importWithInit, setImportWithInit] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInitialize = async () => {
    try {
      setSuccessMessage(null);
      
      let config = envConfig;
      if (!config || showConfigForm) {
        config = configForm;
      }
      
      if (!config) {
        throw new Error('No Firebase configuration available');
      }
      
      await initialize(config, importWithInit);
      setSuccessMessage('Firebase initialized successfully!');
      setShowConfigForm(false);
    } catch (err) {
      console.error('Failed to initialize Firebase:', err);
    }
  };

  const handleImportData = async () => {
    try {
      setSuccessMessage(null);
      await importData('local');
      setSuccessMessage('Data imported successfully!');
    } catch (err) {
      console.error('Failed to import data:', err);
    }
  };

  const handleConfigChange = (field: keyof FirebaseConfig, value: string) => {
    setConfigForm(prev => ({ ...prev, [field]: value }));
  };

  const isConfigValid = (config: FirebaseConfig) => {
    return config.apiKey && config.authDomain && config.databaseURL && config.projectId;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Firebase Administration</h2>
      
      {/* Status Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-3 h-3 rounded-full ${
            isInitialized ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium">
            Status: {isInitialized ? 'Connected' : 'Not Connected'}
          </span>
          <button
            onClick={checkStatus}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Refresh
          </button>
        </div>
        
        {envConfig && (
          <div className="text-sm text-gray-600 mb-2">
            ✓ Environment configuration detected
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">
          {successMessage}
        </div>
      )}

      {/* Initialization Section */}
      {!isInitialized && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Initialize Firebase</h3>
          
          {/* Configuration Options */}
          <div className="mb-4">
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={importWithInit}
                onChange={(e) => setImportWithInit(e.target.checked)}
                className="rounded"
              />
              <span>Import local data during initialization</span>
            </label>
            
            {!envConfig && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showConfigForm}
                  onChange={(e) => setShowConfigForm(e.target.checked)}
                  className="rounded"
                />
                <span>Enter Firebase configuration manually</span>
              </label>
            )}
          </div>

          {/* Manual Configuration Form */}
          {showConfigForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <h4 className="font-medium mb-3">Firebase Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="API Key *"
                  value={configForm.apiKey}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Auth Domain *"
                  value={configForm.authDomain}
                  onChange={(e) => handleConfigChange('authDomain', e.target.value)}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Database URL *"
                  value={configForm.databaseURL}
                  onChange={(e) => handleConfigChange('databaseURL', e.target.value)}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Project ID *"
                  value={configForm.projectId}
                  onChange={(e) => handleConfigChange('projectId', e.target.value)}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Storage Bucket"
                  value={configForm.storageBucket}
                  onChange={(e) => handleConfigChange('storageBucket', e.target.value)}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Messaging Sender ID"
                  value={configForm.messagingSenderId}
                  onChange={(e) => handleConfigChange('messagingSenderId', e.target.value)}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="App ID"
                  value={configForm.appId}
                  onChange={(e) => handleConfigChange('appId', e.target.value)}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Measurement ID"
                  value={configForm.measurementId}
                  onChange={(e) => handleConfigChange('measurementId', e.target.value)}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">* Required fields</p>
            </div>
          )}

          <button
            onClick={handleInitialize}
            disabled={isLoading || (showConfigForm && !isConfigValid(configForm)) || (!envConfig && !showConfigForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Initializing...' : 'Initialize Firebase'}
          </button>
        </div>
      )}

      {/* Data Management Section */}
      {isInitialized && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Data Management</h3>
          
          <div className="flex gap-3">
            <button
              onClick={handleImportData}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Importing...' : 'Import Local Data'}
            </button>
            
            <button
              onClick={checkStatus}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Check Status
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600">
        <h4 className="font-medium mb-2">Instructions:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Set up your Firebase project and Realtime Database</li>
          <li>Configure environment variables in .env.local</li>
          <li>Initialize Firebase connection</li>
          <li>Import your local data to Firebase</li>
        </ol>
        <p className="mt-2">
          <a 
            href="/FIREBASE_SETUP.md" 
            target="_blank" 
            className="text-blue-600 hover:underline"
          >
            View detailed setup guide →
          </a>
        </p>
      </div>
    </div>
  );
}