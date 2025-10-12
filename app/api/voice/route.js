import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced retry function with 60s timeout support
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000, timeoutMs = 60000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Wrap API call with configurable timeout (default 60s)
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout after ' + (timeoutMs/1000) + 's')), timeoutMs)
        )
      ]);
      return result;
    } catch (error) {
      const is502 = error.message && (error.message.includes('502') || error.message.includes('Bad Gateway'));
      const isTimeout = error.message && (error.message.includes('timeout') || error.message.includes('ETIMEDOUT'));
      const isRateLimit = error.status === 429;
      const isNetworkError = error.code === 'ECONNRESET' || error.code === 'ENOTFOUND';
      
      if ((is502 || isTimeout || isRateLimit || isNetworkError) && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`⚠️ Attempt ${attempt}/${maxRetries} failed: ${error.message}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

export async function POST(request) {
  const startTime = Date.now();
  console.log("🎤 Lucia Voice API called");
  
  try {
    const contentType = request.headers.get("content-type");
    let inputText = "";
    let isAudioInput = false;

    // Handle both text input and audio input
    if (contentType?.includes("application/json")) {
      // Text input mode
      const { text } = await request.json();
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: "Text input required" }, { status: 400 });
      }
      inputText = text.trim();
      console.log(`📝 Text Input: "${inputText}"`);
    } else if (contentType?.includes("multipart/form-data")) {
      // Audio input mode - use Whisper for speech-to-text
      isAudioInput = true;
      const formData = await request.formData();
      const audioFile = formData.get("audio");

      if (!audioFile) {
        return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
      }

      if (audioFile.size === 0) {
        return NextResponse.json({ error: "Empty audio file" }, { status: 400 });
      }

      if (audioFile.size > 25 * 1024 * 1024) {
        return NextResponse.json({ error: "Audio file too large (max 25MB)" }, { status: 400 });
      }

      console.log(`🎤 Audio file: ${audioFile.name} | ${audioFile.size} bytes | ${audioFile.type}`);

      // Convert to buffer and create File object for Whisper
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      const file = new File([audioBuffer], audioFile.name || "recording.wav", { 
        type: audioFile.type || "audio/wav" 
      });

      // Step 1: Whisper speech-to-text
      console.log("🎯 Whisper transcription...");
      const t1 = Date.now();
      const transcript = await retryWithBackoff(
        async () => await openai.audio.transcriptions.create({
          file: file,
          model: "whisper-1",
          language: "auto", // Auto-detect language
        }),
        3,
        1000,
        30000 // 30s timeout for Whisper
      );
      console.log(`✅ Whisper: ${Date.now() - t1}ms`);

      inputText = transcript.text.trim();
      console.log(`🎤→📝 Transcribed: "${inputText}"`);

      if (!inputText) {
        return NextResponse.json({ error: "No speech detected in audio" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    // Validate input text
    if (!inputText) {
      return NextResponse.json({ error: "Empty input" }, { status: 400 });
    }

    if (inputText.length > 1000) {
      return NextResponse.json({ error: "Input too long (max 1000 characters)" }, { status: 400 });
    }

    // Step 2: GPT response generation
    console.log("🤖 GPT processing...");
    const t2 = Date.now();
    const completion = await retryWithBackoff(
      async () => await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are Lucia, Malta Sells AI assistant for real estate. You help users find properties in Malta. Keep responses conversational and under 100 words. Use a friendly, helpful female tone with slight enthusiasm. Focus on Malta properties, locations like Sliema, Valletta, St. Julians, and real estate advice. Be cheerful and positive."
          },
          { role: "user", content: inputText }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
      3,
      1000,
      30000 // 30s timeout
    );
    console.log(`✅ GPT: ${Date.now() - t2}ms`);

    const reply = completion.choices[0].message.content;
    console.log(`💬 Reply: "${reply}"`);

    // Step 3: TTS audio generation
    console.log("🔊 TTS generation...");
    const t3 = Date.now();
    
    // Smart text truncation for audio (≤20 seconds = ~200-250 characters)
    let ttsText = reply;
    if (reply.length > 250) {
      // Find the last complete sentence within 250 chars
      const truncated = reply.substring(0, 250);
      const lastSentence = truncated.lastIndexOf('.');
      const lastQuestion = truncated.lastIndexOf('?');
      const lastExclamation = truncated.lastIndexOf('!');
      
      const lastPunctuation = Math.max(lastSentence, lastQuestion, lastExclamation);
      
      if (lastPunctuation > 150) {
        ttsText = reply.substring(0, lastPunctuation + 1);
      } else {
        ttsText = truncated + "...";
      }
      console.log(`📏 Truncated for TTS: ${ttsText.length} chars`);
    }
    
    const speech = await retryWithBackoff(
      async () => await openai.audio.speech.create({
        model: "gpt-4o-mini-tts", // Latest TTS model
        voice: "coral", // Warm, professional female voice
        input: ttsText,
        instructions: "Speak as Lucia, a cheerful and positive Malta real estate assistant. Use a warm, welcoming tone with enthusiasm about properties. Maintain clear pronunciation and conversational pace for international clients.",
        response_format: "mp3", // MP3 for broad compatibility
        speed: 1.0,
      }),
      3,
      1000,
      30000 // 30s timeout
    );
    console.log(`✅ TTS: ${Date.now() - t3}ms`);

    const buffer = Buffer.from(await speech.arrayBuffer());
    const totalTime = Date.now() - startTime;
    console.log(`✅ Complete! ${totalTime}ms | Audio: ${Math.round(buffer.length/1024)}KB`);

    // Convert audio to Base64 for JSON response
    const audioBase64 = buffer.toString("base64");
    
    const responseData = {
      text: reply,
      audioBase64: audioBase64,
      processingTime: totalTime,
      audioSize: buffer.length,
      inputMethod: isAudioInput ? "voice" : "text",
      ...(isAudioInput && { transcript: inputText }) // Include transcript for voice input
    };
    
    // Monitor response size
    const responseJson = JSON.stringify(responseData);
    const responseSizeKB = Math.round(responseJson.length / 1024);
    console.log(`📤 Response: ${responseSizeKB}KB`);
    
    if (responseSizeKB > 1024) { // Warn if > 1MB
      console.warn(`⚠️ Large response: ${responseSizeKB}KB`);
    }
    
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });

  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ Error after ${elapsed}ms:`, error.message);
    
    // If timeout or other error, return fallback error response
    // IMPORTANT: Still return 500 status but with helpful message
    return NextResponse.json(
      { 
        error: error.message === 'API timeout' 
          ? 'Request took too long. Please try speaking less.' 
          : error.message || "Voice processing failed",
        details: error.status ? `OpenAI API error ${error.status}` : "Internal error",
        elapsed: `${elapsed}ms`,
        timeout: error.message === 'API timeout'
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Voice API running",
    models: { chat: "gpt-4o-mini", tts: "gpt-4o-mini-tts" },
    voice: "coral",
    features: ["intelligent_speech_control", "custom_instructions", "realtime_streaming"],
    config: {
      maxRetries: 3,
      maxTextLength: "1000 chars",
      timeout: "30s"
    }
  });
}

// Configure route for production reliability (Next.js 13+ App Router format)
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for complex processing
