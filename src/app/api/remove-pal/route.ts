import { NextRequest, NextResponse } from 'next/server';
import { removePalFromStore } from '@/lib/palworld-utils';
import { firebaseService } from '@/lib/firebase-service';

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

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
      const response = NextResponse.json(
        { error: 'Missing required fields: name, id' },
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
      // Load stored pals from Firebase
      const storedPals = await firebaseService.getStoredPals();

      // Verify the pal exists before attempting removal
      const species = storedPals.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (!species) {
        const response = NextResponse.json(
          { error: `Pal species '${name}' not found` },
          { status: 404 }
        );
        
        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return response;
      }
      
      const pal = species.storedPals.find(p => p.id === id);
      if (!pal) {
        const response = NextResponse.json(
          { error: `Pal with id ${id} not found in species '${name}'` },
          { status: 404 }
        );
        
        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return response;
      }

      // Remove pal from store
      const updatedStoredPals = removePalFromStore(storedPals, name, id);

      // Save to Firebase
      await firebaseService.setStoredPals(updatedStoredPals);
      console.log('Pal removed from Firebase successfully');

      const response = NextResponse.json({
        success: true,
        message: 'Pal removed successfully',
        data: {
          name,
          id
        },
        source: 'firebase'
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
    console.error('Error removing pal:', error);
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