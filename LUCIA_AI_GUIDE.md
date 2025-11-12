# Lucia AI Voice Assistant - User Guide

## Overview

Lucia is your intelligent AI voice assistant for Malta real estate. She provides expert answers about properties, laws, banks, buying conditions, and everything related to real estate in Malta.

## Features

### Voice Interaction
- **Speech Recognition**: Speak naturally and Lucia will understand you using OpenAI Whisper
- **Natural Responses**: Get conversational, helpful answers powered by GPT-4
- **Voice Replies**: Lucia speaks back to you with a natural voice using OpenAI TTS

### Knowledge Areas

Lucia can help with:

1. **Property Information**
   - Apartments, villas, townhouses, penthouses, maisonettes
   - Popular locations: Sliema, St. Julians, Valletta, Mdina, Gozo
   - Price ranges and market trends

2. **Malta Real Estate Laws**
   - Property ownership rules for EU and non-EU citizens
   - ADS permit requirements
   - Final deed process and legal requirements
   - Property taxes and stamp duty

3. **Banking & Financing**
   - Major Malta banks: BOV, HSBC Malta, APS Bank, BNF Bank, Lombard Bank
   - Mortgage options and rates
   - First-time buyer schemes
   - Investment financing

4. **Buying Process**
   - Complete step-by-step guidance
   - Promise of sale agreements
   - Legal requirements and costs
   - Property inspections

5. **Living in Malta**
   - Residency permits and programs
   - Cost of living
   - Property management services

## How to Use

### Desktop
1. Click the "Lucia" button in the header (microphone icon)
2. Sign in if you haven't already
3. Click the microphone button to start speaking
4. Speak your question clearly
5. Lucia will respond with both voice and text

### Mobile
1. Tap the "AI Voice" button in the bottom navigation
2. Sign in if you haven't already
3. Tap the large microphone button
4. Speak your question
5. Tap again to stop recording
6. Lucia will respond

## Example Questions

Try asking Lucia:
- "What are the property buying rules for non-EU citizens in Malta?"
- "Tell me about mortgage options at Bank of Valletta"
- "What is the average price for apartments in Sliema?"
- "What documents do I need to buy property in Malta?"
- "What are the property taxes in Malta?"
- "Can you explain the ADS permit process?"
- "Show me properties in Valletta"

## Technical Details

### API Endpoints

1. **POST /api/voice/transcribe**
   - Converts speech to text using OpenAI Whisper
   - Accepts audio file in WAV format

2. **POST /api/voice/chat**
   - Processes user queries with GPT-4o-mini
   - Maintains conversation context
   - Returns intelligent responses about Malta real estate

3. **POST /api/voice/tts**
   - Converts text responses to speech
   - Uses OpenAI TTS with Nova voice
   - Returns base64 encoded MP3 audio

### Configuration

Required environment variable:
```
OPENAI_API_KEY=your_openai_api_key
```

### Voice Settings
- **Model**: Whisper-1 (transcription)
- **Chat Model**: GPT-4o-mini
- **Voice**: Nova (female voice)
- **Language**: English
- **Audio Format**: WAV input, MP3 output

## Privacy & Security

- All conversations are processed securely
- Voice data is not stored after processing
- Only authenticated users can use Lucia
- Conversations can be saved for personalization (optional)

## Limitations

Lucia focuses exclusively on Malta real estate:
- Will not provide information about competitor platforms
- Will not answer unrelated questions
- Redirects non-real-estate queries back to property topics

## Support

If Lucia can't answer your question, she will:
- Acknowledge the limitation
- Suggest contacting a local expert
- Provide general guidance when available

## Updates

Lucia's knowledge is regularly updated to ensure accurate, current information about Malta's real estate market, laws, and banking systems.
