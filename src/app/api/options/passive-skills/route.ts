import { NextResponse } from 'next/server';
import { getPassiveSkillNames } from '@/lib/palworld-utils';
import { firebaseService } from '@/lib/firebase-service';

export async function GET() {
  try {
    // Try Firebase first
    if (firebaseService.isInitialized()) {
      try {
        const passiveSkills = await firebaseService.getPassiveSkills();
        
        // Extract skill names using utility function
        const skillNames = getPassiveSkillNames(passiveSkills);
        
        return NextResponse.json({
          success: true,
          data: skillNames,
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
    console.error('Error fetching passive skills:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      data: [],
      source: 'error'
    }, { status: 500 });
  }
}