'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceAssistant({ isOpen, onClose }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!isOpen) {
      stopListening();
    }
  }, [isOpen]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context for visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      // Start visualization
      visualizeAudio();
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsListening(true);
      setTranscript('Listening...');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setTranscript('Microphone access denied');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsListening(false);
    setAudioLevel(0);
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const animate = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      setAudioLevel(average / 255);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setTranscript('Processing...');
    
    try {
      // First, transcribe the audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const transcribeResponse = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!transcribeResponse.ok) {
        throw new Error('Transcription failed');
      }
      
      const { transcript } = await transcribeResponse.json();
      setTranscript(transcript);
      
      // Then, get AI response
      const chatResponse = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: transcript }),
      });
      
      if (!chatResponse.ok) {
        throw new Error('Chat response failed');
      }
      
      const { response: aiResponse } = await chatResponse.json();
      setResponse(aiResponse);
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setTranscript('Sorry, I couldn\'t process that. Please try again.');
      setResponse('Please try speaking again. Make sure your microphone is working properly.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex flex-col items-center justify-center min-h-screen relative">
        
        {/* Close button - top right */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          data-testid="voice-assistant-close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center">
          
          {/* Main visualization circle - same size as ChatGPT */}
          <div className="relative">
            <div 
              className={`w-48 h-48 rounded-full transition-all duration-500 ${
                isListening 
                  ? 'bg-gradient-to-b from-red-300 to-red-600' 
                  : 'bg-gradient-to-b from-red-200 to-red-500'
              }`}
              style={{
                transform: isListening ? `scale(${1 + audioLevel * 0.1})` : 'scale(1)',
                boxShadow: isListening 
                  ? `0 0 ${30 + audioLevel * 50}px rgba(239, 68, 68, 0.3)`
                  : '0 10px 30px rgba(239, 68, 68, 0.2)'
              }}
            />
            
            {/* Subtle inner glow when listening */}
            {isListening && (
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-b from-red-100 to-transparent opacity-30 animate-pulse"
              />
            )}
          </div>
        </div>

        {/* Bottom section with microphone button */}
        <div className="pb-16 space-y-6">
          
          {/* Status text */}
          {isProcessing && (
            <div className="text-center">
              <p className="text-gray-600 text-lg">Processing...</p>
            </div>
          )}
          
          {/* Microphone button - bottom center like ChatGPT */}
          <div className="flex justify-center">
            <button
              onClick={handleMicClick}
              disabled={isProcessing}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gray-800 hover:bg-gray-700'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              data-testid="voice-assistant-mic"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              ) : isListening ? (
                <div className="w-6 h-6 bg-white rounded-full animate-pulse" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
          
          {/* Simple status indicator */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              {isListening 
                ? 'Listening...'
                : isProcessing 
                ? 'Processing...'
                : 'Tap to speak'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}