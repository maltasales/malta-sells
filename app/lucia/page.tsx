'use client';

import dynamic from 'next/dynamic';

// Dynamically import the voice assistant to prevent SSR issues
const VoiceAssistantPro = dynamic(() => import('@/components/VoiceAssistantPro'), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#D12C1D] to-[#B8241A] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <div className="w-7 h-7 bg-white/20 rounded"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Lucia...</h2>
        <p className="text-gray-600">Preparing your AI assistant</p>
      </div>
    </div>
  )
});

export default function LuciaPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <VoiceAssistantPro />
    </div>
  );
}