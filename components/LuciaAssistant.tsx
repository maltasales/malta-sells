'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Loader, Calendar, DollarSign, Heart, MapPin, Bed, Bath, Square } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

// Initialize OpenAI client with your API key

interface Message {
  id: string;
  type: 'user' | 'lucia';
  content: string;
  timestamp: Date;
  properties?: Property[];
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  beds: number;
  baths: number;
  area: number;
  images: string[];
  property_type: string;
  description: string;
}

type MicState = 'idle' | 'listening' | 'processing' | 'disabled';

interface LuciaAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LuciaAssistant({ isOpen, onClose }: LuciaAssistantProps) {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [micState, setMicState] = useState<MicState>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Initialize welcome message
      const welcomeMessage = isAuthenticated 
        ? "Welcome back! How can I help with your Malta property search today?"
        : "Hello! I'm Lucia, your AI voice assistant for Malta real estate. Please register for full support.";
      
      setMessages([{
        id: '1',
        type: 'lucia',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
      
      setMicState(isAuthenticated ? 'idle' : 'disabled');
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchProperties = async (query?: string) => {
    try {
      let queryBuilder = supabase
        .from('properties')
        .select(`
          id,
          title,
          location,
          price,
          currency,
          beds,
          baths,
          area,
          images,
          property_type,
          description
        `)
        .limit(3);

      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,location.ilike.%${query}%,property_type.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder;
      
      if (error) {
        console.log('Supabase error, falling back to mock data:', error);
        return getMockProperties(query);
      }
      
      // If no data from Supabase, return mock data
      if (!data || data.length === 0) {
        return getMockProperties(query);
      }
      
      return data as Property[] || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      return getMockProperties(query);
    }
  };

  const getMockProperties = (query?: string): Property[] => {
    const mockProperties: Property[] = [
      {
        id: '1',
        title: 'Modern Apartment in Sliema',
        location: 'Sliema',
        price: 350000,
        currency: '€',
        beds: 2,
        baths: 1,
        area: 85,
        images: ['https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=400&h=250&fit=crop'],
        property_type: 'Apartment',
        description: 'Beautiful modern apartment with sea views'
      },
      {
        id: '2',
        title: 'Luxury Villa in Valletta',
        location: 'Valletta',
        price: 750000,
        currency: '€',
        beds: 3,
        baths: 2,
        area: 150,
        images: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?w=400&h=250&fit=crop'],
        property_type: 'Villa',
        description: 'Stunning villa in the heart of Valletta'
      },
      {
        id: '3',
        title: 'Cozy Studio in St. Julians',
        location: 'St. Julians',
        price: 280000,
        currency: '€',
        beds: 1,
        baths: 1,
        area: 45,
        images: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=400&h=250&fit=crop'],
        property_type: 'Studio',
        description: 'Perfect starter home in St. Julians'
      }
    ];

    if (query) {
      const lowerQuery = query.toLowerCase();
      return mockProperties.filter(p => 
        p.title.toLowerCase().includes(lowerQuery) ||
        p.location.toLowerCase().includes(lowerQuery) ||
        p.property_type.toLowerCase().includes(lowerQuery)
      );
    }

    return mockProperties;
  };

  const saveConversation = async (message: string, response: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from('conversations').insert([
        {
          user_id: user.id,
          message,
          response,
          timestamp: new Date().toISOString()
        }
      ]);
      
      if (error) {
        console.log('Error saving conversation (table may not exist):', error);
        // Continue without throwing error since this is not critical
      }
    } catch (error) {
      console.log('Error saving conversation:', error);
      // Continue without throwing error since this is not critical
    }
  };

  const handleVoiceCommand = async (command: string) => {
    if (!isAuthenticated) return;

    setMicState('processing');
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: command,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      let properties: Property[] = [];
      
      // Use OpenAI GPT for intelligent response generation
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system", 
            content: `You are Lucia, a helpful AI assistant for Malta real estate. You help users find properties in Malta. 
            Analyze user queries and provide helpful responses about properties. If they ask about specific locations, property types, or price ranges, acknowledge their request and offer to show relevant properties.
            Keep responses conversational, helpful, and under 100 words.`
          },
          {
            role: "user",
            content: command
          }
        ],
        max_tokens: 150
      });

      const aiResponse = completion.choices[0]?.message?.content || "I can help you find properties in Malta. What are you looking for?";

      // Determine which properties to fetch based on the command
      const lowerCommand = command.toLowerCase();
      
      if (lowerCommand.includes('apartment') || lowerCommand.includes('flat')) {
        properties = await fetchProperties('apartment');
      } else if (lowerCommand.includes('villa') || lowerCommand.includes('house')) {
        properties = await fetchProperties('villa');
      } else if (lowerCommand.includes('sliema')) {
        properties = await fetchProperties('sliema');
      } else if (lowerCommand.includes('valletta')) {
        properties = await fetchProperties('valletta');
      } else if (lowerCommand.includes('property') || lowerCommand.includes('show') || lowerCommand.includes('find')) {
        properties = await fetchProperties();
      }

      // Add Lucia response
      const luciaMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'lucia',
        content: aiResponse,
        properties: properties.slice(0, 3),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, luciaMessage]);
      
      // Generate speech for the response
      await generateSpeech(aiResponse);
      await saveConversation(command, aiResponse);
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'lucia',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setMicState('idle');
  };

  const generateSpeech = async (text: string) => {
    try {
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: text,
        speed: 1.0
      });

      const audioBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.play();
      
      // Cleanup URL after playing
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
      });
      
    } catch (error) {
      console.error('Error generating speech:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioWithWhisper(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setMicState('listening');
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setMicState('idle');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setMicState('processing');
      setIsRecording(false);
    }
  };

  const processAudioWithWhisper = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await openai.audio.transcriptions.create({
        file: audioBlob as any,
        model: 'whisper-1',
        language: 'en'
      });

      const transcription = response.text;
      
      if (transcription && transcription.trim()) {
        await handleVoiceCommand(transcription);
      } else {
        setMicState('idle');
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: 'lucia',
          content: "I couldn't understand what you said. Please try again.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error processing audio with Whisper:', error);
      setMicState('idle');
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'lucia',
        content: "I had trouble processing your voice. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleMicClick = () => {
    if (!isAuthenticated || micState === 'disabled') return;

    if (micState === 'idle') {
      startRecording();
    } else if (micState === 'listening') {
      stopRecording();
    }
  };

  const handlePropertyAction = async (propertyId: string, action: 'schedule' | 'financing' | 'save') => {
    if (!isAuthenticated) return;

    try {
      let response = '';
      
      switch (action) {
        case 'schedule':
          response = "I'll help you schedule a viewing. A property agent will contact you within 24 hours to arrange a convenient time.";
          break;
        case 'financing':
          response = "Here are financing options available for this property. Would you like me to connect you with our partner banks for pre-approval?";
          break;
        case 'save':
          await supabase.from('favorites').insert([
            { user_id: user?.id, property_id: propertyId }
          ]);
          response = "Property saved to your wishlist! You can view all saved properties in your account.";
          break;
      }

      const actionMessage: Message = {
        id: Date.now().toString(),
        type: 'lucia',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, actionMessage]);
    } catch (error) {
      console.error('Error handling property action:', error);
    }
  };

  const handleAuth = (type: 'login' | 'register') => {
    onClose();
    window.location.href = type === 'login' ? '/auth/signin' : '/auth/signup';
  };

  const getMicStatusText = () => {
    switch (micState) {
      case 'listening': return 'Listening... (tap to stop)';
      case 'processing': return 'Processing your voice...';
      case 'disabled': return 'Login required';
      default: return 'Tap to speak';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="relative w-full bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-full duration-300 ease-out max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#D12C1D] to-[#B8241A] rounded-full flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Lucia – AI Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px]">
          {messages.map((message) => (
            <div key={message.id} className="animate-in fade-in-50 duration-500">
              {message.type === 'user' ? (
                <div className="flex justify-end">
                  <div className="bg-[#D12C1D] text-white rounded-2xl rounded-tr-lg px-4 py-3 max-w-[80%] shadow-sm">
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Mic className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-lg px-4 py-3 shadow-sm">
                      <p className="text-sm text-gray-800">{message.content}</p>
                    </div>
                    
                    {/* Property Cards */}
                    {message.properties && message.properties.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {message.properties.map((property) => (
                          <div key={property.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            {/* Property Image */}
                            {property.images && property.images.length > 0 && (
                              <div className="h-32 bg-gray-100 relative">
                                <img
                                  src={property.images[0] || 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=400&h=250&fit=crop'}
                                  alt={property.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=400&h=250&fit=crop';
                                  }}
                                />
                                <div className="absolute top-2 left-2">
                                  <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700">
                                    {property.property_type}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {/* Property Details */}
                            <div className="p-3">
                              <h4 className="font-semibold text-gray-900 text-sm mb-1">{property.title}</h4>
                              <div className="flex items-center text-gray-600 text-xs mb-2">
                                <MapPin className="w-3 h-3 mr-1" />
                                {property.location}
                              </div>
                              
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-[#D12C1D] font-bold text-lg">
                                  {property.currency}{property.price.toLocaleString()}
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  {property.beds && (
                                    <div className="flex items-center">
                                      <Bed className="w-3 h-3 mr-1" />
                                      {property.beds}
                                    </div>
                                  )}
                                  {property.baths && (
                                    <div className="flex items-center">
                                      <Bath className="w-3 h-3 mr-1" />
                                      {property.baths}
                                    </div>
                                  )}
                                  {property.area && (
                                    <div className="flex items-center">
                                      <Square className="w-3 h-3 mr-1" />
                                      {property.area}m²
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handlePropertyAction(property.id, 'schedule')}
                                  className="flex-1 bg-green-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                                >
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Schedule Viewing
                                </button>
                                <button
                                  onClick={() => handlePropertyAction(property.id, 'financing')}
                                  className="flex-1 bg-blue-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                                >
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Financing Info
                                </button>
                                <button
                                  onClick={() => handlePropertyAction(property.id, 'save')}
                                  className="bg-[#D12C1D] text-white text-xs py-2 px-3 rounded-lg hover:bg-[#B8241A] transition-colors flex items-center justify-center"
                                >
                                  <Heart className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Auth Buttons for Non-authenticated Users */}
          {!isAuthenticated && messages.length === 1 && (
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => handleAuth('register')}
                className="flex-1 bg-[#D12C1D] text-white py-3 px-4 rounded-lg hover:bg-[#B8241A] transition-colors font-medium"
              >
                Register
              </button>
              <button
                onClick={() => handleAuth('login')}
                className="flex-1 border border-[#D12C1D] text-[#D12C1D] py-3 px-4 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Login
              </button>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={handleMicClick}
              disabled={micState === 'disabled'}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                micState === 'disabled'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : micState === 'listening'
                  ? 'bg-[#D12C1D] animate-pulse shadow-red-200'
                  : 'bg-[#D12C1D] hover:bg-[#B8241A] active:scale-95'
              }`}
            >
              {micState === 'processing' ? (
                <Loader className="w-6 h-6 text-white animate-spin" />
              ) : micState === 'listening' ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>
            <p className={`text-xs transition-colors ${
              micState === 'disabled' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {getMicStatusText()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}