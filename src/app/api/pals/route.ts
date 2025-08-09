import { NextResponse } from 'next/server';
import { transformStoredPalsToDTO, initializeFirebaseData } from '@/lib/palworld-utils';
import { firebaseService } from '@/lib/firebase-service';

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function GET() {
  try {
    // Try Firebase first
    if (firebaseService.isInitialized()) {
      try {
        const storedPals = await firebaseService.getStoredPals();
        const pals = await firebaseService.getPals();
        
        // Transform stored pals to DTO format
        const transformedPals = transformStoredPalsToDTO(storedPals, pals);
        
        const response = NextResponse.json({
          success: true,
          data: transformedPals,
          source: 'firebase'
        });
        
        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return response;
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
        const response = NextResponse.json({
          success: false,
          error: 'Firebase not available',
          data: [],
          source: 'firebase_error'
        }, { status: 503 });
        
        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return response;
      }
    }
    
    // Firebase not initialized
    const response = NextResponse.json({
      success: false,
      error: 'Firebase not initialized. Please initialize Firebase first.',
      data: [],
      source: 'no_firebase'
    }, { status: 503 });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  } catch (error) {
    console.error('Error fetching pals:', error);
    const response = NextResponse.json({
      success: false,
      error: 'Internal server error',
      data: [],
      source: 'error'
    }, { status: 500 });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
}