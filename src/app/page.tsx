'use client';

import React, { useState } from "react";

export default function Home() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({
    show: false,
    message: '',
    success: false
  });

  const handleUpdateData = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/update-data');
      const data = await response.json();
      
      if (response.ok) {
        setUpdateStatus({
          show: true,
          message: data.message || 'Data updated successfully!',
          success: true
        });
      } else {
        setUpdateStatus({
          show: true,
          message: data.message || 'Failed to update data',
          success: false
        });
      }
    } catch (error) {
      setUpdateStatus({
        show: true,
        message: 'Error updating data. Please try again.',
        success: false
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const closeStatusPopup = () => {
    setUpdateStatus({ show: false, message: '', success: false });
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header with title and update button */}
      <div className="flex justify-between items-center border-b border-gray-600 pb-4 bg-gray-900 p-4 rounded-t-lg -mx-4 -mt-4 mb-8">
        <h1 className="text-2xl font-bold">DumbCode Palworld Tool</h1>
        <button 
          onClick={handleUpdateData}
          disabled={isUpdating}
          className="border border-gray-400 rounded px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? 'Updating...' : 'Update data'}
        </button>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Stored pals section */}
        <div className="border border-blue-600 rounded p-4 hover:shadow-lg hover:shadow-blue-900/50 transition-shadow bg-blue-900/20">
          <h2 className="text-xl font-semibold mb-4 text-center text-blue-200">Stored pals</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="/stored-pals" className="block w-full">
              <button className="w-full py-2 bg-blue-700 hover:bg-blue-600 text-white rounded transition-colors font-medium">
                Add New Pal
              </button>
            </a>
            <a href="/stored-pals/list" className="block w-full">
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors font-medium">
                View All Pals
              </button>
            </a>
          </div>
          {/* Content will be added here */}
        </div>

        {/* Breeding calculator section */}
        <div className="border border-purple-600 rounded p-4 hover:shadow-lg hover:shadow-purple-900/50 transition-shadow bg-purple-900/20">
          <h2 className="text-xl font-semibold mb-4 text-center text-purple-200">Breeding calculator</h2>
          <button className="w-full py-2 bg-purple-700 hover:bg-purple-600 text-white rounded transition-colors font-medium">
            Open Calculator
          </button>
          {/* Content will be added here */}
        </div>
      </div>

      {/* Status Popup Modal */}
      {updateStatus.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className={`text-lg font-semibold mb-4 ${
                updateStatus.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {updateStatus.success ? '✓ Success' : '✗ Error'}
              </div>
              <p className="text-gray-300 mb-6">{updateStatus.message}</p>
              <button
                onClick={closeStatusPopup}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}