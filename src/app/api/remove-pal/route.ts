import { NextRequest, NextResponse } from 'next/server';
import { removePalFromStore } from '@/lib/palworld-utils';
import { firebaseService } from '@/lib/firebase-service';

type RemovePalRequest = {
  name: string;
  id: number;
};

export async function DELETE(request: NextRequest) {
  try {
    const body: RemovePalRequest = await request.json();
    const { name, id } = body;

    // Validate input
    if (!name || !id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, id' },
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
      // Load stored pals from Firebase
      const storedPals = await firebaseService.getStoredPals();

      // Verify the pal exists before attempting removal
      const species = storedPals.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (!species) {
        return NextResponse.json(
          { error: `Pal species '${name}' not found` },
          { status: 404 }
        );
      }
      
      const pal = species.storedPals.find(p => p.id === id);
      if (!pal) {
        return NextResponse.json(
          { error: `Pal with id ${id} not found in species '${name}'` },
          { status: 404 }
        );
      }

      // Remove pal from store
      const updatedStoredPals = removePalFromStore(storedPals, name, id);

      // Save to Firebase
      await firebaseService.setStoredPals(updatedStoredPals);
      console.log('Pal removed from Firebase successfully');

      return NextResponse.json({
        success: true,
        message: 'Pal removed successfully',
        data: {
          name,
          id
        },
        source: 'firebase'
      });
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      return NextResponse.json(
        { error: 'Firebase operation failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error removing pal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}