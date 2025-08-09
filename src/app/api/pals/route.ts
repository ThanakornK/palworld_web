import { NextResponse } from 'next/server';
import { transformStoredPalsToDTO, initializeFirebaseData } from '@/lib/palworld-utils';
import { firebaseService } from '@/lib/firebase-service';

export async function GET() {
  try {
    // Try Firebase first
    if (firebaseService.isInitialized()) {
      try {
        const storedPals = await firebaseService.getStoredPals();
        const pals = await firebaseService.getPals();
        
        // Transform stored pals to DTO format
        const transformedPals = transformStoredPalsToDTO(storedPals, pals);
        
        return NextResponse.json({
          success: true,
          data: transformedPals,
          source: 'firebase'
        });
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
        return NextResponse.json({
          success: false,
          error: 'Firebase not available',
          data: [],
          source: 'firebase_error'
        }, { status: 503 });
      }
    }
    
    // Firebase not initialized
    return NextResponse.json({
      success: false,
      error: 'Firebase not initialized. Please initialize Firebase first.',
      data: [],
      source: 'no_firebase'
    }, { status: 503 });
  } catch (error) {
    console.error('Error fetching pals:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      data: [],
      source: 'error'
    }, { status: 500 });
  }
}