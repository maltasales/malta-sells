import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const workflowId = process.env.LUCIA_WORKFLOW_ID;
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1️⃣ Испраќаме текст до Lucia workflow (Agent Builder)
    const luciaRes = await fetch(https://api.openai.com/v1/workflows/${workflowId}/runs, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: Bearer ${openaiKey},
      },
      body: JSON.stringify({
        input_as_text: message || "Hello, Lucia!",
      }),
    });

    const luciaData = await luciaRes.json();

    // 2️⃣ Го извлекуваме текстуалниот одговор на Lucia
    const reply =
      luciaData.output_text ||
      luciaData.outputs?.[0]?.value ||
      "I'm here to help with Malta properties.";

    // 3️⃣ Го претвораме во глас преку TTS
    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: Bearer ${openaiKey},
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL_TTS || "gpt-4o-mini-tts",
        voice: process.env.ASSISTANT_VOICE || "shimmer",
        speed: 0.95,
        input: reply,
      }),
    });

    const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());

    // 4️⃣ Враќаме аудио и текст назад до frontend
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "x-assistant-text": encodeURIComponent(reply),
      },
    });
  } catch (error) {
    console.error("Lucia AI Voice error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate Lucia response" }),
      { status: 500 }
    );
  }
}
