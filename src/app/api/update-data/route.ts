import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Make a request to the backend API
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    
    const response = await fetch(`${backendUrl}/update-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle the response from the backend
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.error || 'Failed to update data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return success response
    return NextResponse.json(
      { message: data.message || 'Data updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}