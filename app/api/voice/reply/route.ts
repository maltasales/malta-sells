import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const chat = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_TEXT || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Lucia, a friendly AI assistant for MaltaSells.com. You help users find properties in Malta and answer real-estate related questions in a natural, conversational tone.",
        },
        { role: "user", content: message },
      ],
      temperature: 0.5,
    });

    const reply = chat.choices[0].message?.content ?? "I'm here to help you find properties in Malta.";

    const tts = await openai.audio.speech.create({
      model: process.env.OPENAI_MODEL_TTS || "gpt-4o-mini-tts",
      voice: process.env.ASSISTANT_VOICE || "alloy",
      input: reply,
    });

    const buffer = Buffer.from(await tts.arrayBuffer());

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "x-assistant-text": encodeURIComponent(reply),
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to generate reply" }), { status: 500 });
  }
}
