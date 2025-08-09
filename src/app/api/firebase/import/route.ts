import { NextRequest, NextResponse } from 'next/server';
import { firebaseService } from '@/lib/firebase-service';

export async function POST(request: NextRequest) {
  try {
    if (!firebaseService.isInitialized()) {
      return NextResponse.json(
        { error: 'Firebase not initialized. Please initialize Firebase first.' },
        { status: 503 }
      );
    }
    
    const body = await request.json();
    const { source = 'upload' } = body;
    
    let data;
    
    if (source === 'upload' && body.data) {
      // Use uploaded data
      data = body.data;
    } else {
      return NextResponse.json(
        { error: 'Invalid source or missing data. Only "upload" source with data is supported.' },
        { status: 400 }
      );
    }
    
    // Import data to Firebase
    const results = await firebaseService.importData(data);
    
    return NextResponse.json({
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
    
  } catch (error) {
    console.error('Error importing data to Firebase:', error);
    return NextResponse.json(
      { error: 'Failed to import data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!firebaseService.isInitialized()) {
      return NextResponse.json(
        { error: 'Firebase not initialized' },
        { status: 503 }
      );
    }
    
    // Get current data counts from Firebase
    const [pals, passiveSkills, passiveSkillCombos, storedPals] = await Promise.all([
      firebaseService.getPals(),
      firebaseService.getPassiveSkills(),
      firebaseService.getPassiveSkillCombos(),
      firebaseService.getStoredPals()
    ]);
    
    return NextResponse.json({
      message: 'Firebase data status',
      counts: {
        pals: pals?.length || 0,
        passiveSkills: passiveSkills?.length || 0,
        passiveSkillCombos: Object.keys(passiveSkillCombos || {}).length,
        storedPals: storedPals?.length || 0
      },
      source: 'firebase'
    });
    
  } catch (error) {
    console.error('Error getting Firebase data status:', error);
    return NextResponse.json(
      { error: 'Failed to get data status' },
      { status: 500 }
    );
  }
}