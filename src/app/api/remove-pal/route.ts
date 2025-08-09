import { NextRequest, NextResponse } from 'next/server';

// Type definition for remove pal request
type RemovePalRequest = {
  name: string;
  id: number;
};

export async function DELETE(request: NextRequest) {
  try {
    // Parse the request body
    const body: RemovePalRequest = await request.json();

    // Validate the request
    if (!body.name || !body.id) {
      return NextResponse.json(
        { message: 'Name and id are required' },
        { status: 400 }
      );
    }

    // Make a request to the backend API
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    
    const response = await fetch(`${backendUrl}/remove-pal`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        id: body.id
      }),
    });

    // Handle the response from the backend
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to remove pal' },
        { status: response.status }
      );
    }

    // Return success response
    return NextResponse.json(
      { message: 'Pal removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing pal:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}