'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

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

  // Start recording
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
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Error accessing microphone:', err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process audio through OpenAI pipeline
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Step 1: Transcribe audio using Whisper
      console.log('🎤 Transcribing audio...');
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');

      const transcription = await openai.audio.transcriptions.create({
        file: audioBlob,
        model: 'whisper-1',
      });

      const transcribedText = transcription.text;
      setTranscript(transcribedText);
      console.log('✅ Transcription:', transcribedText);

      if (!transcribedText.trim()) {
        setError('No speech detected. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Step 2: Generate response using ChatGPT
      console.log('🤖 Generating response...');
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for a real estate platform called Malta Sells. Keep responses concise and friendly, under 50 words.'
          },
          {
            role: 'user',
            content: transcribedText
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      const responseText = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      setResponse(responseText);
      console.log('✅ Response:', responseText);

      // Step 3: Convert response to speech using TTS
      console.log('🔊 Converting to speech...');
      const speechResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: responseText,
      });

      // Play the audio
      const audioBuffer = await speechResponse.arrayBuffer();
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
      setError(`Error: ${err.message || 'Voice assistant failed'}`);
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