import { NextRequest, NextResponse } from 'next/server';
import { firebaseService } from '@/lib/firebase-service';
import { initializeFirebaseData } from '@/lib/palworld-utils';

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebaseConfig, importData = false } = body;
    
    if (!firebaseConfig) {
      const response = NextResponse.json(
        { error: 'Firebase configuration is required' },
        { status: 400 }
      );
      
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    }
    
    // Initialize Firebase with provided config
    await firebaseService.initialize(firebaseConfig);
    
    let importResult = null;
    if (importData) {
      // Import local data to Firebase
      importResult = await initializeFirebaseData();
    }
    
    const response = NextResponse.json({
      message: 'Firebase initialized successfully',
      importResult: importResult
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
    
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    const response = NextResponse.json(
      { error: 'Failed to initialize Firebase', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
}

export async function GET() {
  try {
    const isInitialized = firebaseService.isInitialized();
    
    const response = NextResponse.json({
      initialized: isInitialized,
      message: isInitialized ? 'Firebase is initialized' : 'Firebase not initialized'
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
    
  } catch (error) {
    console.error('Error checking Firebase status:', error);
    return NextResponse.json(
      { error: 'Failed to check Firebase status' },
      { status: 500 }
    );
  }
}