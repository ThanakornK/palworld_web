import { NextRequest, NextResponse } from 'next/server';
import {
  validatePalName,
  validatePassiveSkills,
  validateGender,
  addPalToStore
} from '@/lib/palworld-utils';
import { firebaseService } from '@/lib/firebase-service';
import { AddPalRequest } from '@/types/palworld';

export async function POST(request: NextRequest) {
  try {
    const body: AddPalRequest = await request.json();
    const { name, gender, passive_skills } = body;

    // Validate input
    if (!name || !gender || !Array.isArray(passive_skills)) {
      return NextResponse.json(
        { error: 'Missing required fields: name, gender, passive_skills' },
        { status: 400 }
      );
    }

    // Check if Firebase is initialized
    if (!firebaseService.isInitialized()) {
      return NextResponse.json(
        { error: 'Firebase not initialized. Please initialize Firebase first.' },
        { status: 503 }
      );
    }

    try {
      // Load data for validation from Firebase
      const firebaseData = await firebaseService.getAllData();
      const pals = firebaseData.pals;
      const passiveSkills = firebaseData.passive_skills;
      const storedPals = firebaseData.stored_pals;

      // Validate pal name
      if (!validatePalName(pals, name)) {
        return NextResponse.json(
          { error: `Invalid pal name: ${name}` },
          { status: 400 }
        );
      }

      // Validate gender
      if (!validateGender(gender)) {
        return NextResponse.json(
          { error: `Invalid gender: ${gender}. Must be 'male' or 'female'` },
          { status: 400 }
        );
      }

      // Validate passive skills
      const skillValidation = validatePassiveSkills(passiveSkills, passive_skills);
      if (!skillValidation.valid) {
        return NextResponse.json(
          { error: `Invalid passive skill: ${skillValidation.invalidSkill}` },
          { status: 400 }
        );
      }

      // Add pal to store
      const updatedStoredPals = addPalToStore(storedPals, name, gender, passive_skills);

      // Save to Firebase
      await firebaseService.setStoredPals(updatedStoredPals);
      console.log('Pal added to Firebase successfully');

      return NextResponse.json({
        success: true,
        message: 'Pal added successfully',
        data: {
          name,
          gender,
          passive_skills
        }
      });
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      return NextResponse.json(
        { error: 'Firebase operation failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error adding pal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}