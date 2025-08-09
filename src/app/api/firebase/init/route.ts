import { NextRequest, NextResponse } from 'next/server';
import { firebaseService } from '@/lib/firebase-service';
import { initializeFirebaseData } from '@/lib/palworld-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebaseConfig, importData = false } = body;
    
    if (!firebaseConfig) {
      return NextResponse.json(
        { error: 'Firebase configuration is required' },
        { status: 400 }
      );
    }
    
    // Initialize Firebase with provided config
    await firebaseService.initialize(firebaseConfig);
    
    let importResult = null;
    if (importData) {
      // Import local data to Firebase
      importResult = await initializeFirebaseData();
    }
    
    return NextResponse.json({
      message: 'Firebase initialized successfully',
      importResult: importResult
    });
    
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Firebase', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const isInitialized = firebaseService.isInitialized();
    
    return NextResponse.json({
      initialized: isInitialized,
      message: isInitialized ? 'Firebase is initialized' : 'Firebase not initialized'
    });
    
  } catch (error) {
    console.error('Error checking Firebase status:', error);
    return NextResponse.json(
      { error: 'Failed to check Firebase status' },
      { status: 500 }
    );
  }
}