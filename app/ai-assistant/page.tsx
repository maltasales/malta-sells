'use client';

import { ArrowLeft, Mic, MicOff, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AIAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
  };

  const handlePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center text-[#D12C1D] hover:text-[#B8241A] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">AI Voice Assistant</h1>
          <div className="w-12"></div>
        </div>
      </header>

      <div className="px-4 py-8 max-w-md mx-auto">
        {/* Voice Assistant Circle */}
        <div className="flex flex-col items-center mb-8">
          <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening 
              ? 'bg-[#D12C1D] shadow-lg shadow-red-200 animate-pulse' 
              : 'bg-gray-100'
          }`}>
            {/* Sound Wave Visualization */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 bg-white rounded-full transition-all duration-200 ${
                isListening ? 'h-8 animate-bounce' : 'h-4'
              }`}></div>
              <div className={`w-2 bg-white rounded-full transition-all duration-200 ${
                isListening ? 'h-12 animate-bounce' : 'h-6'
              }`} style={{ animationDelay: '0.1s' }}></div>
              <div className={`w-2 bg-white rounded-full transition-all duration-200 ${
                isListening ? 'h-8 animate-bounce' : 'h-4'
              }`} style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
          
          <p className={`mt-4 text-center text-lg font-medium transition-colors ${
            isListening ? 'text-[#D12C1D]' : 'text-gray-600'
          }`}>
            {isListening ? 'Listening...' : 'Tap to ask about properties'}
          </p>
          
          <p className="text-sm text-gray-500 text-center mt-2">
            Ask about property listings, prices, locations, or schedule viewings
          </p>
        </div>

        {/* Voice Control Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleVoiceToggle}
            data-testid="voice-toggle-button"
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[#D12C1D] hover:bg-[#B8241A] text-white'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 text-center">Quick Questions</h3>
          
          <div className="grid gap-3">
            {[
              "Show me apartments in Sliema",
              "What's the average price in Valletta?",
              "Find properties with sea view",
              "Schedule a property viewing"
            ].map((question, index) => (
              <button
                key={index}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-[#D12C1D] hover:bg-red-50 transition-colors text-left"
                onClick={() => {
                  // Handle quick question
                  console.log('Quick question:', question);
                }}
              >
                <span className="text-gray-700">{question}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversations</h3>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Properties in Sliema</span>
                <button
                  onClick={handlePlayback}
                  className="p-1 text-[#D12C1D] hover:text-[#B8241A]"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Viewing appointment</span>
                <button
                  onClick={handlePlayback}
                  className="p-1 text-[#D12C1D] hover:text-[#B8241A]"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>
    </div>
  );
}