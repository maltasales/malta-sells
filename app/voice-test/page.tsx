'use client';

import { useState } from 'react';
import VoiceAssistant from '@/components/VoiceAssistant';
import { Mic, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VoiceTestPage() {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* Header */}
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Voice Assistant Demo */}
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Malta Sells AI Voice Assistant</h1>
          <p className="text-gray-600">ChatGPT-style interface with red branding</p>
        </div>

        {/* Test Button */}
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 mx-auto"
          data-testid="voice-test-button"
        >
          <Mic className="w-8 h-8 text-white" />
        </button>

        <div className="text-sm text-gray-500">
          <p>Click the button above to test the voice assistant</p>
        </div>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistant
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />
    </div>
  );
}