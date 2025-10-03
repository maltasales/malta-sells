import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const sessionConfig = {
      session: {
        type: "realtime",
        model: "gpt-4o-realtime-preview-2024-12-17",
        audio: {
          output: { voice: "alloy" },
        },
      },
    };

    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionConfig),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API Error:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ clientSecret: data.value });
  } catch (err) {
    console.error("Session creation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
