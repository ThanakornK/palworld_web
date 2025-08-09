import { NextRequest, NextResponse } from 'next/server';
import { firebaseService } from '@/lib/firebase-service';

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
    
    const body = await request.json();
    const { source = 'upload' } = body;
    
    let data;
    
    if (source === 'upload' && body.data) {
      // Use uploaded data
      data = body.data;
    } else {
      const response = NextResponse.json(
        { error: 'Invalid source or missing data. Only "upload" source with data is supported.' },
        { status: 400 }
      );
      
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    }
    
    // Import data to Firebase
    const results = await firebaseService.importData(data);
    
    const response = NextResponse.json({
      message: 'Data imported successfully',
      results: results,
      imported: {
        pals: data.pals?.length || 0,
        passiveSkills: data.passive_skills?.length || 0,
        passiveSkillCombos: Object.keys(data.passive_skill_combos || {}).length,
        storedPals: data.stored_pals?.length || 0
      },
      source: 'firebase'
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
    
  } catch (error) {
    console.error('Error importing data to Firebase:', error);
    const response = NextResponse.json(
      { error: 'Failed to import data', details: error instanceof Error ? error.message : 'Unknown error' },
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
    if (!firebaseService.isInitialized()) {
      const response = NextResponse.json(
        { error: 'Firebase not initialized' },
        { status: 503 }
      );
      
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    }
    
    // Get current data counts from Firebase
    const [pals, passiveSkills, passiveSkillCombos, storedPals] = await Promise.all([
      firebaseService.getPals(),
      firebaseService.getPassiveSkills(),
      firebaseService.getPassiveSkillCombos(),
      firebaseService.getStoredPals()
    ]);
    
    const response = NextResponse.json({
      message: 'Firebase data status',
      counts: {
        pals: pals?.length || 0,
        passiveSkills: passiveSkills?.length || 0,
        passiveSkillCombos: Object.keys(passiveSkillCombos || {}).length,
        storedPals: storedPals?.length || 0
      },
      source: 'firebase'
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
    
  } catch (error) {
    console.error('Error getting Firebase data status:', error);
    const response = NextResponse.json(
      { error: 'Failed to get data status' },
      { status: 500 }
    );
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
}