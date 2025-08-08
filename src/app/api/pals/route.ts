import { NextRequest, NextResponse } from 'next/server';

// Type definition based on the DTO from the Go backend
type AddPalRequest = {
  name: string;
  gender: string;
  passive_skills: string[];
};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: AddPalRequest = await request.json();

    // Validate the request
    if (!body.name || !body.gender) {
      return NextResponse.json(
        { message: 'Name and gender are required' },
        { status: 400 }
      );
    }

    // Make a request to the backend API
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    
    // Convert to the format expected by the backend
    const payload = {
      name: body.name,
      gender: body.gender.toLowerCase() === 'male' ? 'm' : 'f', // Convert to 'm' or 'f' format
      passive_skills: body.passive_skills
    };
    
    const response = await fetch(`${backendUrl}/add-pal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle the response from the backend
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to add pal' },
        { status: response.status }
      );
    }

    // Return success response
    return NextResponse.json(
      { message: 'Pal added successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding pal:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method to fetch all pals
export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    
    const response = await fetch(`${backendUrl}/store`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch pals' },
        { status: response.status }
      );
    }

    const data = await response.json();
    // The backend returns data in { message: [...pals] } format
    return NextResponse.json(data.message || []);
  } catch (error) {
    console.error('Error fetching pals:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}