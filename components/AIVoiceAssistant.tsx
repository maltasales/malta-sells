'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export default function AIVoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      console.log('🎤 Transcribing audio...');
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');

      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const { text } = await transcribeResponse.json();
      setTranscript(text);
      console.log('✅ Transcription:', text);

      if (!text.trim()) {
        setError('No speech detected. Please try again.');
        setIsProcessing(false);
        return;
      }

      console.log('🤖 Generating response...');
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!chatResponse.ok) {
        const errorData = await chatResponse.json();
        throw new Error(errorData.error || 'Chat failed');
      }

      const { response: responseText } = await chatResponse.json();
      setResponse(responseText);
      console.log('✅ Response:', responseText);

      console.log('🔊 Converting to speech...');
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: responseText }),
      });

      if (!ttsResponse.ok) {
        const errorData = await ttsResponse.json();
        throw new Error(errorData.error || 'TTS failed');
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);

        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
      }

      console.log('✅ Voice Assistant pipeline completed!');

    } catch (err: any) {
      console.error('Error in voice assistant pipeline:', err);
      setError(`I had trouble processing your voice. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Voice Assistant</h2>
        <p className="text-gray-600">Press and release to talk, I'll respond with voice!</p>
      </div>

      {/* Recording Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 scale-110' 
              : 'bg-blue-500 hover:bg-blue-600'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            shadow-lg
          `}
          data-testid="voice-assistant-button"
        >
          {isRecording ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </button>
      </div>

      {/* Status */}
      <div className="text-center mb-4">
        {isRecording && (
          <p className="text-red-500 font-medium animate-pulse">🔴 Recording...</p>
        )}
        {isProcessing && (
          <p className="text-blue-500 font-medium">🤖 Processing...</p>
        )}
        {isPlaying && (
          <p className="text-green-500 font-medium flex items-center justify-center gap-2">
            <Volume2 className="w-4 h-4" />
            Playing response...
          </p>
        )}
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-1">You said:</h3>
          <p className="text-gray-900" data-testid="transcript">{transcript}</p>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-700 mb-1">AI Response:</h3>
          <p className="text-blue-900" data-testid="ai-response">{response}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600" data-testid="error-message">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 text-center">
        <p>💡 Try saying: "Tell me about Malta properties" or "How can you help me?"</p>
      </div>

      {/* Hidden audio element for TTS playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}