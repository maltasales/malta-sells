# Malta Sells - Lucia AI Assistant Deployment Guide

## Project Overview
This guide helps you recreate the complete Lucia AI voice assistant implementation for the Malta Sells real estate application.

## Quick Setup Files

### 1. Create `.npmrc` (in project root)
```
legacy-peer-deps=true
```

### 2. Package.json Dependencies
Add these to your package.json dependencies:
```json
{
  "dependencies": {
    "openai": "^5.23.1",
    "recordrtc": "^5.6.2"
  }
}
```

### 3. Environment Variables
Add to your `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## File Structure to Create

```
app/
├── api/
│   └── voice/
│       └── route.js          # Main AI voice processing endpoint
├── lucia/
│   └── page.tsx             # Standalone test page
components/
├── VoiceAssistantPro.tsx    # Main voice assistant component
├── LuciaAssistant.tsx       # Modal version for existing app
```

## Core Features Implemented

✅ **Voice Input**: Browser-based recording with MediaRecorder API
✅ **Text Input**: Traditional text chat interface  
✅ **AI Processing**: GPT-4o-mini for intelligent responses
✅ **Voice Output**: gpt-4o-mini-tts with "coral" voice
✅ **Error Handling**: Comprehensive retry logic and timeout management
✅ **Mobile Support**: Responsive design for mobile browsers
✅ **Build Fix**: .npmrc resolves OpenAI/Zod dependency conflicts

## API Endpoint: `/api/voice`

**Features:**
- Accepts both text and audio input
- Whisper speech-to-text for audio processing
- GPT-4o-mini for conversational AI responses
- Text-to-speech using gpt-4o-mini-tts
- Base64 audio encoding to prevent proxy timeouts
- Smart response truncation for optimal TTS performance
- Comprehensive error handling and retry logic

**Usage:**
```javascript
// Text input
fetch('/api/voice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: "Hello Lucia" })
})

// Audio input
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.wav');
fetch('/api/voice', {
  method: 'POST',
  body: formData
})
```

## Components Overview

### VoiceAssistantPro.tsx
- Complete standalone component
- Voice recording with browser MediaRecorder
- Text input support
- Audio playback of AI responses
- Real-time status indicators
- Mobile-optimized UI
- Error handling and recovery

### LuciaAssistant.tsx  
- Modal version integrated into existing app
- Swapped layout (mic button above text input)
- Consistent styling with Malta Sells theme
- User session management

## Deployment Instructions

1. **Create the files** using the content provided in this guide
2. **Install dependencies**: `yarn install` 
3. **Add environment variables** to your deployment platform
4. **Deploy to Vercel/Netlify** - the .npmrc file will resolve build issues

## Testing

- Visit `/lucia` for standalone testing
- Use the modal component in your main application
- Test both voice and text input methods
- Verify audio playback functionality

## Support

- All components include comprehensive error handling
- Console logging for debugging
- Graceful fallbacks for unsupported browsers
- Clear user feedback for all states

---

**Note**: This implementation uses the latest OpenAI models (gpt-4o-mini, gpt-4o-mini-tts) and includes production-ready error handling, timeouts, and retry logic to ensure reliability.