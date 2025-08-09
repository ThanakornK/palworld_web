import { NextRequest, NextResponse } from 'next/server';
import {
  validatePalName,
  validatePassiveSkills,
  validateGender,
  addPalToStore
} from '@/lib/palworld-utils';
import { firebaseService } from '@/lib/firebase-service';
import { AddPalRequest } from '@/types/palworld';

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
    const body: AddPalRequest = await request.json();
    const { name, gender, passive_skills } = body;

    // Validate input
    if (!name || !gender || !Array.isArray(passive_skills)) {
      const response = NextResponse.json(
        { error: 'Missing required fields: name, gender, passive_skills' },
        { status: 400 }
      );
      
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    }

    // Check if Firebase is initialized
    if (!firebaseService.isInitialized()) {
      const response = NextResponse.json(
        { error: 'Firebase not initialized. Please initialize Firebase first.' },
        { status: 503 }
      );
      
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    }

    try {
      // Load data for validation from Firebase
      const firebaseData = await firebaseService.getAllData();
      const pals = firebaseData.pals;
      const passiveSkills = firebaseData.passive_skills;
      const storedPals = firebaseData.stored_pals;

      // Validate pal name
      if (!validatePalName(pals, name)) {
        const response = NextResponse.json(
          { error: `Invalid pal name: ${name}` },
          { status: 400 }
        );
        
        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return response;
      }

      // Validate gender
      if (!validateGender(gender)) {
        const response = NextResponse.json(
          { error: `Invalid gender: ${gender}. Must be 'm' or 'f'` },
          { status: 400 }
        );
        
        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return response;
      }

      // Validate passive skills
      const skillValidation = validatePassiveSkills(passiveSkills, passive_skills);
      if (!skillValidation.valid) {
        const response = NextResponse.json(
          { error: `Invalid passive skill: ${skillValidation.invalidSkill}` },
          { status: 400 }
        );
        
        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return response;
      }

      // Add pal to store
      const updatedStoredPals = addPalToStore(storedPals, name, gender, passive_skills);

      // Save to Firebase
      await firebaseService.setStoredPals(updatedStoredPals);
      console.log('Pal added to Firebase successfully');

      const response = NextResponse.json({
        success: true,
        message: 'Pal added successfully',
        data: {
          name,
          gender,
          passive_skills
        }
      });
      
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      const response = NextResponse.json(
        { error: 'Firebase operation failed' },
        { status: 500 }
      );
      
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    }
  } catch (error) {
    console.error('Error adding pal:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
}