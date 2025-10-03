'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';

export default function RealtimeVoiceAssistant() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/realtime/session', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const { clientSecret } = await response.json();

      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioElementRef.current = audioEl;

      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      pc.addTrack(ms.getTracks()[0]);

      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.addEventListener('message', (e) => {
        const event = JSON.parse(e.data);
        console.log('Received event:', event.type);

        if (event.type === 'response.output_text.delta') {
          setTranscript((prev) => prev + event.delta);
        } else if (event.type === 'response.output_text.done') {
          setTranscript((prev) => prev + '\n\n');
        }
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = 'https://api.openai.com/v1/realtime/calls';
      const sdpResponse = await fetch(baseUrl, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          'Content-Type': 'application/sdp',
        },
      });

      const sdp = await sdpResponse.text();
      const answer = { type: 'answer' as RTCSdpType, sdp };
      await pc.setRemoteDescription(answer);

      setIsConnected(true);
      setLoading(false);
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setLoading(false);
    }
  };

  const disconnect = () => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }
    setIsConnected(false);
    setIsRecording(false);
  };

  const sendMessage = (message: string) => {
    if (!dataChannelRef.current) return;

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: message }],
      },
    };

    dataChannelRef.current.send(JSON.stringify(event));

    const responseEvent = {
      type: 'response.create',
    };

    dataChannelRef.current.send(JSON.stringify(responseEvent));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-6 w-6" />
          AI Realtime Voice Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {!isConnected ? (
            <Button
              onClick={connect}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect to Voice Assistant'
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={toggleRecording}
                  className="flex-1"
                  size="lg"
                  variant={isRecording ? 'destructive' : 'default'}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="mr-2 h-4 w-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </>
                  )}
                </Button>
                <Button onClick={disconnect} variant="outline" size="lg">
                  Disconnect
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Send a text message:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-md"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        sendMessage(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {transcript && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium mb-2">Transcript:</h3>
              <p className="text-sm whitespace-pre-wrap">{transcript}</p>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Powered by OpenAI Realtime API (WebRTC)
        </p>
      </CardContent>
    </Card>
  );
}
