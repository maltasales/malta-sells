'use client';

import { ArrowLeft, Mic, MicOff, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function AIAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantText, setAssistantText] = useState('');
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Start recording
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = handleStop;

      mr.start();
      mediaRecorderRef.current = mr;
      setIsListening(true);
      setTranscript('');
      setAssistantText('');
      setError('');
    } catch {
      setError('Microphone access denied or unavailable.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsListening(false);
  }

  async function handleStop() {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    chunksRef.current = [];
    setIsThinking(true);

    try {
      // 1️⃣ Send audio for transcription
      const fd = new FormData();
      fd.append('file', new File([blob], 'input.webm', { type: 'audio/webm' }));

      const transRes = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: fd,
      });

      const { text } = await transRes.json();
      setTranscript(text || 'Could not understand speech');

      // 2️⃣ Get assistant reply
      const replyRes = await fetch('/api/voice/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const replyHeader = replyRes.headers.get('x-assistant-text');
      const replyText = replyHeader
        ? decodeURIComponent(replyHeader)
        : 'I can help you with Malta properties.';
      setAssistantText(replyText);

      const audioBlob = await replyRes.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsThinking(false);
    }
  }

  const handleVoiceToggle = () => {
    if (isListening) stopRecording();
    else startRecording();
  };

  const handlePlayback = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center text-[#D12C1D] hover:text-[#B8241A] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">
            AI Voice Assistant
          </h1>
          <div className="w-12"></div>
        </div>
      </header>

      <div className="px-4 py-8 max-w-md mx-auto">
        {/* Voice Assistant Circle */}
        <div className="flex flex-col items-center mb-8">
          <div
            className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-[#D12C1D] shadow-lg shadow-red-200 animate-pulse'
                : 'bg-gray-100'
            }`}
          >
            {/* Sound Wave Visualization */}
            <div className="flex items-center space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 bg-white rounded-full transition-all duration-200 ${
                    isListening ? 'h-12 animate-bounce' : 'h-4'
                  }`}
                  style={{ animationDelay: ${i * 0.1}s }}
                ></div>
              ))}
            </div>
          </div>

          <p
            className={`mt-4 text-center text-lg font-medium transition-colors ${
              isListening ? 'text-[#D12C1D]' : 'text-gray-600'
            }`}
          >
            {isListening
              ? 'Listening...'
              : isThinking
              ? 'Thinking...'
              : 'Tap to ask about properties'}
          </p>

          <p className="text-sm text-gray-500 text-center mt-2">
            Ask about property listings, prices, locations, or schedule viewings
          </p>
        </div>

        {/* Voice Control Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleVoiceToggle}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[#D12C1D] hover:bg-[#B8241A] text-white'
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Assistant conversation */}
        <div className="bg-white p-4 rounded-xl shadow border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">You said:</h3>
          <p className="text-gray-600 mb-3">{transcript || '—'}</p>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Lucia replied:
          </h3>
          <p className="text-gray-600">{assistantText || '—'}</p>
        </div>

        {audioUrl && (
          <div className="text-center mb-4">
            <button
              onClick={handlePlayback}
              className="bg-[#D12C1D] hover:bg-[#B8241A] text-white px-4 py-2 rounded-lg text-sm"
            >
              🔊 Replay Voice
            </button>
          </div>
        )}

        {error && (
          <p className="text-center text-red-600 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>
    </div>
  );
}
