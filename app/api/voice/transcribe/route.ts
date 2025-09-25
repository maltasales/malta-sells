import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // For now, return a mock transcription
    // In a real implementation, this would use OpenAI's Whisper API
    const mockTranscriptions = [
      "I'm looking for a 2-bedroom apartment in Sliema under 400,000 euros.",
      "Show me properties with sea views in Malta.",
      "What's the average price for apartments in Valletta?",
      "I need help finding a property for investment purposes.",
      "Can you tell me about the real estate market in Malta?"
    ];
    
    const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
    
    return NextResponse.json({
      transcript: randomTranscription,
      confidence: 0.95
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}