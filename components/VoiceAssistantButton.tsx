'use client';

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import VoiceAssistant from './VoiceAssistant';

export default function VoiceAssistantButton() {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  return (
    <>
      {/* Floating Voice Assistant Button */}
      <button
        onClick={() => setIsVoiceOpen(true)}
        className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
        data-testid="voice-assistant-button"
        aria-label="AI Voice Assistant"
      >
        {/* Sound wave icon */}
        <div className="flex items-end space-x-0.5 group-hover:animate-pulse">
          <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
        </div>
      </button>

      {/* Voice Assistant Modal */}
      <VoiceAssistant
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />
    </>
  );
}