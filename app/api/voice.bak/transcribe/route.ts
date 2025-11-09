import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file received" }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: process.env.OPENAI_MODEL_TRANSCRIBE || "whisper-1",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 });
  }
}
