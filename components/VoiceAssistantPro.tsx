'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Loader, AlertCircle, Info } from 'lucide-react';

// Types
type RecordingState = 'idle' | 'requesting' | 'recording' | 'processing' | 'error';

interface VoiceResponse {
  text: string;
  audioBase64: string;
  processingTime?: number;
  inputMethod?: string;
  transcript?: string;
}

interface VoiceAssistantProProps {
  className?: string;
}

export default function VoiceAssistantPro({ className = '' }: VoiceAssistantProProps) {
  // State management
  // Text input removed - voice-only interface
  const [response, setResponse] = useState<VoiceResponse | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [supportsVoice, setSupportsVoice] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Check browser support and permissions
  useEffect(() => {
    checkVoiceSupport();
  }, []);

  const checkVoiceSupport = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('❌ getUserMedia not supported');
        setSupportsVoice(false);
        return;
      }

      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        console.log('❌ MediaRecorder not supported');
        setSupportsVoice(false);
        return;
      }

      console.log('✅ Voice recording capabilities detected');
      setSupportsVoice(true);
    } catch (error) {
      console.error('❌ Voice support check failed:', error);
      setSupportsVoice(false);
    }
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      setRecordingState('requesting');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      // Permission granted, clean up the test stream
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      setRecordingState('idle');
      console.log('✅ Microphone permission granted');
      return true;
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      setError('Microphone access denied. Please allow microphone access to use voice input.');
      setRecordingState('error');
      return false;
    }
  };

  const startRecording = async () => {
    if (!supportsVoice) {
      setError('Voice recording not supported in this browser');
      return;
    }

    if (!permissionGranted) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    try {
      setError('');
      setRecordingState('requesting');

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Create MediaRecorder with optimal settings
      const options: MediaRecorderOptions = {};
      
      // Try different MIME types for broad compatibility
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/wav',
        'audio/mp4',
        'audio/ogg',
        'audio/mpeg'
      ];

      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          options.mimeType = mimeType;
          console.log(`✅ Using MIME type: ${mimeType}`);
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🎤 Recording stopped, processing...');
        await processRecording();
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
        setError('Recording error occurred');
        setRecordingState('error');
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setRecordingState('recording');
      console.log('🎤 Recording started...');

    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      setError('Failed to start recording: ' + (error as Error).message);
      setRecordingState('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingState('processing');
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const processRecording = async () => {
    try {
      if (audioChunksRef.current.length === 0) {
        throw new Error('No audio data recorded');
      }

      // Create blob from recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: audioChunksRef.current[0].type || 'audio/webm' 
      });
      
      console.log(`🎤 Audio recorded: ${Math.round(audioBlob.size / 1024)}KB, type: ${audioBlob.type}`);

      if (audioBlob.size === 0) {
        throw new Error('Empty audio recording');
      }

      // Send to voice API
      await sendVoiceToAPI(audioBlob);

    } catch (error) {
      console.error('❌ Recording processing failed:', error);
      setError('Failed to process recording: ' + (error as Error).message);
      setRecordingState('error');
    }
  };

  const sendVoiceToAPI = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      console.log('📤 Sending audio to API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

      const response = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const data: VoiceResponse = await response.json();
      console.log('✅ Voice API response received');
      
      setResponse(data);
      setRecordingState('idle');
      
      // Auto-play the response audio
      if (data.audioBase64) {
        await playAudioResponse(data.audioBase64);
      }

    } catch (error) {
      console.error('❌ Voice API request failed:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        setError('Voice processing timed out. Please try with a shorter message.');
      } else {
        setError('Voice processing failed: ' + (error as Error).message);
      }
      setRecordingState('error');
    }
  };

  // Text input function removed - voice-only interface

  const playAudioResponse = async (audioBase64: string, attempt = 1): Promise<void> => {
    const maxAttempts = 3;
    
    try {
      setIsPlaying(true);

      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      currentAudioRef.current = audio;

      // Set up event listeners
      return new Promise((resolve, reject) => {
        if (!audio) return reject(new Error('Audio creation failed'));

        audio.onloadeddata = () => {
          console.log('🎵 Audio loaded, duration:', audio.duration);
        };

        audio.onended = () => {
          console.log('✅ Audio playback completed');
          setIsPlaying(false);
          currentAudioRef.current = null;
          resolve();
        };

        audio.onerror = (e) => {
          console.error(`❌ Audio playback error (attempt ${attempt}):`, e);
          setIsPlaying(false);
          currentAudioRef.current = null;
          reject(new Error('Audio playback failed'));
        };

        // Attempt to play
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`✅ Audio playback started (attempt ${attempt})`);
            })
            .catch((error) => {
              console.error(`❌ Audio play promise rejected (attempt ${attempt}):`, error);
              reject(error);
            });
        }
      });

    } catch (error) {
      console.error(`❌ Audio setup failed (attempt ${attempt}):`, error);
      
      if (attempt < maxAttempts) {
        console.log(`🔄 Retrying audio playback (${attempt + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
        return playAudioResponse(audioBase64, attempt + 1);
      } else {
        console.error('❌ Audio playback failed after all attempts');
        setError('Audio playback failed. Please check your device volume and audio settings.');
        throw error;
      }
    } finally {
      if (attempt === maxAttempts || currentAudioRef.current === null) {
        setIsPlaying(false);
      }
    }
  };

  const handleVoiceButtonClick = () => {
    if (recordingState === 'recording') {
      stopRecording();
    } else if (recordingState === 'idle' || recordingState === 'error') {
      startRecording();
    }
  };

  // Keyboard handler removed - voice-only interface

  const getVoiceButtonState = () => {
    switch (recordingState) {
      case 'requesting':
        return { icon: Loader, className: 'animate-spin', disabled: true, text: 'Requesting access...' };
      case 'recording':
        return { icon: MicOff, className: 'animate-pulse', disabled: false, text: 'Tap to stop recording' };
      case 'processing':
        return { icon: Loader, className: 'animate-spin', disabled: true, text: 'Processing...' };
      case 'error':
        return { icon: AlertCircle, className: '', disabled: false, text: 'Tap to retry' };
      default:
        return { icon: Mic, className: '', disabled: false, text: supportsVoice ? 'Tap to speak' : 'Voice not supported' };
    }
  };

  const buttonState = getVoiceButtonState();
  const ButtonIcon = buttonState.icon;

  return (
    <div className={`max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-[#D12C1D] to-[#B8241A] rounded-full flex items-center justify-center mx-auto mb-3">
          <Mic className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lucia AI Assistant</h2>
        <p className="text-gray-600 text-sm">Your Malta real estate voice assistant</p>
        
        {/* AI Disclosure */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <Info className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-blue-800">
              <strong>Notice:</strong> Lucia uses AI-generated voice technology, not a human speaker.
            </p>
          </div>
        </div>
      </div>

      {/* Voice Input Section */}
      {supportsVoice && (
        <div className="text-center mb-6">
          <button
            onClick={handleVoiceButtonClick}
            disabled={buttonState.disabled || !supportsVoice}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
              !supportsVoice || buttonState.disabled
                ? 'bg-gray-400 cursor-not-allowed'
                : recordingState === 'recording'
                ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                : 'bg-[#D12C1D] hover:bg-[#B8241A] active:scale-95'
            }`}
          >
            <ButtonIcon className={`w-8 h-8 text-white ${buttonState.className}`} />
          </button>
          <p className="text-sm text-gray-600 mt-2">{buttonState.text}</p>
        </div>
      )}

      {/* Voice-only interface - text input removed per user request */}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Mic className="w-4 h-4 text-[#D12C1D]" />
              <span>Lucia says:</span>
            </h3>
            {isPlaying && (
              <div className="flex items-center space-x-1 text-[#D12C1D]">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Playing...</span>
              </div>
            )}
          </div>
          
          {response.transcript && response.inputMethod === 'voice' && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <strong>You said:</strong> "{response.transcript}"
            </div>
          )}
          
          <p className="text-gray-800 leading-relaxed">{response.text}</p>
          
          {response.processingTime && (
            <p className="text-xs text-gray-500 mt-2">
              Processed in {response.processingTime}ms • Input: {response.inputMethod || 'text'}
            </p>
          )}
        </div>
      )}

      {/* Usage Tips */}
      <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
        <p>💡 Tip: Make sure your device sound is on to hear Lucia's responses</p>
        <p>🏠 Ask about properties in Sliema, Valletta, St. Julians, and more</p>
        {supportsVoice && <p>🎤 Voice input works best in quiet environments</p>}
      </div>
    </div>
  );
}