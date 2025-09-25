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
        className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
        data-testid="voice-assistant-button"
        aria-label="AI Voice Assistant"
      >
        {/* Simple microphone icon like ChatGPT */}
        <Mic className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Voice Assistant Modal */}
      <VoiceAssistant
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />
    </>
  );
}