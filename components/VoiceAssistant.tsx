'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

export default function VoiceAssistant() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [RecordRTC, setRecordRTC] = useState<any>(null);
  
  const recorderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load RecordRTC dynamically (client-side only)
  useEffect(() => {
    import('recordrtc').then((module) => {
      setRecordRTC(() => module.default);
    });
  }, []);

  const handleClick = async () => {
    if (!RecordRTC) {
      setError('Loading recorder library...');
      return;
    }

    if (!recording) {
      try {
        // Start recording
        setError('');
        setTranscript('');
        setResponse('');
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        // Use RecordRTC to record in WAV format
        const recorder = new RecordRTC(stream, {
          type: 'audio',
          mimeType: 'audio/wav',
          recorderType: RecordRTC.StereoAudioRecorder,
          numberOfAudioChannels: 1,
          desiredSampRate: 16000,
        });
        
        recorder.startRecording();
        recorderRef.current = recorder;
        setRecording(true);
        console.log('🎤 Recording started (WAV format, 16kHz)');
        
      } catch (err: any) {
        console.error("Microphone error:", err);
        setError("Could not access microphone. Please check permissions.");
      }
    } else {
      // Stop recording
      if (recorderRef.current) {
        recorderRef.current.stopRecording(async () => {
          const blob = recorderRef.current.getBlob();
          console.log('✅ Recording stopped:', blob.size, 'bytes, type:', blob.type);
          
          // Stop stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
          
          // Process audio
          await processAudio(blob);
        });
        
        setRecording(false);
      }
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setProcessing(true);
    let retries = 0;
    const maxRetries = 2;
    
    const attemptPlayback = async (): Promise<boolean> => {
      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");

        console.log("📤 Sending audio...");
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        const res = await fetch("/api/voice", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        // Get transcript and response
        const transcriptText = decodeURIComponent(res.headers.get("X-Transcript") || "");
        const responseText = decodeURIComponent(res.headers.get("X-Response") || "");
        
        setTranscript(transcriptText);
        setResponse(responseText);

        // Get audio blob
        const audioResponseBlob = await res.blob();
        
        // MOBILE-OPTIMIZED: Create object URL with cache busting
        const url = URL.createObjectURL(audioResponseBlob);
        
        // Play audio with mobile-friendly approach
        return new Promise((resolve) => {
          if (audioRef.current) {
            audioRef.current.src = url;
            
            // Mobile requires user interaction before play
            const playPromise = audioRef.current.play();
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log("✅ Audio playing");
                  resolve(true);
                })
                .catch((err) => {
                  console.error("❌ Playback error:", err);
                  resolve(false);
                });
            } else {
              resolve(true);
            }
            
            audioRef.current.onended = () => {
              URL.revokeObjectURL(url);
            };
            
            audioRef.current.onerror = () => {
              console.error("❌ Audio error");
              URL.revokeObjectURL(url);
              resolve(false);
            };
          } else {
            resolve(false);
          }
        });
        
      } catch (err: any) {
        console.error("Processing error:", err);
        if (err.name === 'AbortError') {
          throw new Error('timeout');
        }
        throw err;
      }
    };
    
    // Retry logic for mobile
    while (retries <= maxRetries) {
      try {
        const success = await attemptPlayback();
        
        if (success) {
          console.log("✅ Complete");
          break;
        } else if (retries < maxRetries) {
          retries++;
          console.log(`⚠️ Retry ${retries}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          setError("Audio playback failed. Please try again.");
        }
      } catch (err: any) {
        retries++;
        console.error(`Attempt ${retries} failed:`, err);
        
        if (retries > maxRetries) {
          if (err.message === 'timeout') {
            setError("Request timeout. Try speaking less or check connection.");
          } else {
            setError(`Failed: ${err.message}`);
          }
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setProcessing(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      {/* Voice Button */}
      <button
        onClick={handleClick}
        disabled={processing || !RecordRTC}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 shadow-lg
          ${recording 
            ? "bg-red-500 hover:bg-red-600 scale-110 animate-pulse" 
            : processing || !RecordRTC
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#D12C1D] hover:bg-[#B8241A]"
          }
          disabled:opacity-50
        `}
        data-testid="voice-assistant-button"
      >
        {processing ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : recording ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </button>

      {/* Status Text */}
      <div className="text-center">
        {!RecordRTC && (
          <p className="text-gray-500 text-sm">Loading recorder...</p>
        )}
        {RecordRTC && recording && (
          <p className="text-red-500 font-medium animate-pulse">
            🔴 Recording... Click to stop
          </p>
        )}
        {RecordRTC && processing && (
          <p className="text-blue-500 font-medium">
            🤖 Processing your request...
          </p>
        )}
        {RecordRTC && !recording && !processing && (
          <p className="text-gray-600 text-sm">
            {transcript ? "Tap to ask another question" : "Tap to start talking"}
          </p>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="w-full max-w-md p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-1">You said:</p>
          <p className="text-gray-900">{transcript}</p>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="w-full max-w-md p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-600 mb-1">Lucia responds:</p>
          <p className="text-blue-900">{response}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="w-full max-w-md p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Instructions */}
      {!transcript && !recording && !processing && RecordRTC && (
        <div className="text-center text-xs text-gray-500 max-w-md">
          <p className="mb-2">💡 Try asking:</p>
          <ul className="space-y-1">
            <li>"Show me properties in Sliema"</li>
            <li>"What's available in my budget?"</li>
            <li>"Tell me about Malta real estate"</li>
          </ul>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
