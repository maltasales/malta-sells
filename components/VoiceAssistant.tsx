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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-md">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            data-testid="voice-assistant-close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Volume indicator */}
          {isListening && (
            <div className="absolute top-4 right-16 z-10 flex items-center space-x-2 text-white">
              <Volume2 className="w-5 h-5" />
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-4 rounded-full transition-colors ${
                      audioLevel * 5 > i ? 'bg-red-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Main visualization circle */}
          <div className="relative w-80 h-80 mx-auto mb-8">
            <div 
              className={`w-full h-full rounded-full transition-all duration-300 ${
                isListening 
                  ? 'bg-gradient-to-t from-red-500 to-red-200 animate-pulse' 
                  : 'bg-gradient-to-t from-red-600 to-red-300'
              }`}
              style={{
                transform: isListening ? `scale(${1 + audioLevel * 0.3})` : 'scale(1)',
                filter: isListening ? `blur(${audioLevel * 2}px)` : 'blur(0px)'
              }}
            />
            
            {/* Inner ripple effects when listening */}
            {isListening && (
              <>
                <div className="absolute inset-4 rounded-full bg-red-400/30 animate-ping" />
                <div className="absolute inset-8 rounded-full bg-red-300/20 animate-pulse" />
              </>
            )}

            {/* Microphone icon in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isListening ? (
                <Mic className="w-12 h-12 text-white animate-pulse" />
              ) : (
                <MicOff className="w-12 h-12 text-white/80" />
              )}
            </div>
          </div>

          {/* Transcript and response area */}
          <div className="text-center text-white mb-8 space-y-4">
            {transcript && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm font-medium mb-2">You said:</p>
                <p className="text-lg">{transcript}</p>
              </div>
            )}
            
            {response && (
              <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Assistant:</p>
                <p className="text-lg">{response}</p>
              </div>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex justify-center items-center space-x-8">
            
            {/* Main mic button */}
            <button
              onClick={handleMicClick}
              disabled={isProcessing}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-gray-700 hover:bg-gray-600'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              data-testid="voice-assistant-mic"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              ) : isListening ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center text-white/60 mt-6">
            <p className="text-sm">
              {isListening 
                ? 'Listening... Tap to stop'
                : isProcessing 
                ? 'Processing your request...'
                : 'Tap the microphone to ask about properties'
              }
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}