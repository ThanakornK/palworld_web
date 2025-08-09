import { NextResponse } from 'next/server';
import { getPalSpeciesNames } from '@/lib/palworld-utils';
import { firebaseService } from '@/lib/firebase-service';

export async function GET() {
  try {
    // Try Firebase first
    if (firebaseService.isInitialized()) {
      try {
        const pals = await firebaseService.getPals();
        
        // Extract species names using utility function
        const speciesNames = getPalSpeciesNames(pals);
        
        return NextResponse.json({
          success: true,
          data: speciesNames,
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
    console.error('Error fetching pal species:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      data: [],
      source: 'error'
    }, { status: 500 });
  }
}