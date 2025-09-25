import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    // For now, return mock responses based on the input
    // In a real implementation, this would use OpenAI's GPT API with Emergent LLM key
    
    let response = "";
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('apartment') || lowerMessage.includes('property')) {
      response = "I can help you find apartments in Malta! Based on your criteria, I found several properties that might interest you. Would you like me to show you 2-bedroom apartments in Sliema, or would you prefer a different location?";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      response = "Property prices in Malta vary by location. Sliema apartments typically range from €300,000 to €800,000, while Valletta properties can be €400,000 to €1.2M. What's your budget range?";
    } else if (lowerMessage.includes('investment')) {
      response = "Malta offers excellent investment opportunities! Properties near the university areas and business districts have strong rental demand. I can show you properties with good rental yields. What type of investment are you considering?";
    } else if (lowerMessage.includes('sea view') || lowerMessage.includes('view')) {
      response = "Sea view properties are very popular in Malta! I have several listings with stunning Mediterranean views in Sliema, St. Julians, and Bugibba. These typically start from €450,000. Would you like to see them?";
    } else {
      response = "I'm your AI assistant for Malta real estate. I can help you search for properties, get market insights, schedule viewings, or answer questions about buying/renting in Malta. What would you like to know?";
    }

    return NextResponse.json({
      response,
      suggestions: [
        "Show me properties under €500k",
        "What areas have the best amenities?",
        "Tell me about the buying process",
        "Schedule a property viewing"
      ]
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}