'use client';

import VoiceAssistant from '@/components/VoiceAssistant';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function VoiceTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">AI Voice Assistant</h1>
          <p className="text-gray-600 mt-2">
            Type text and hear it spoken with AI-powered text-to-speech
          </p>
        </div>

        {/* Voice Assistant Component */}
        <div className="flex justify-center">
          <VoiceAssistant />
        </div>

        {/* Technical Details */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How it Works:</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <div>
                <h3 className="font-medium text-gray-900">Text Input</h3>
                <p className="text-gray-600">Enter any text you want to hear spoken</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <div>
                <h3 className="font-medium text-gray-900">Serverless Processing</h3>
                <p className="text-gray-600">Text is sent securely to serverless API endpoint</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <div>
                <h3 className="font-medium text-gray-900">OpenAI TTS Generation</h3>
                <p className="text-gray-600">Converts text to natural speech using gpt-4o-mini-tts</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <div>
                <h3 className="font-medium text-gray-900">Audio Playback</h3>
                <p className="text-gray-600">Audio is played directly in your browser</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-8 max-w-md mx-auto p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-medium text-green-800 mb-2">Secure Implementation</h3>
          <p className="text-green-700 text-sm">
            API keys are kept server-side only. All OpenAI calls go through secure serverless endpoints.
          </p>
        </div>
      </div>
    </div>
  );
}