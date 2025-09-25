import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // For now, return a mock session token
    // In a real implementation, this would create a session with OpenAI's realtime API
    return NextResponse.json({
      client_secret: {
        value: "mock-session-token-" + Date.now()
      },
      expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    });
  } catch (error) {
    console.error('Error creating voice session:', error);
    return NextResponse.json(
      { error: 'Failed to create voice session' },
      { status: 500 }
    );
  }
}