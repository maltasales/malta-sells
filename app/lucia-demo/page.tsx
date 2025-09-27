'use client';

import { useState } from 'react';
import LuciaAssistant from '@/components/LuciaAssistant';

// Demo component to showcase Lucia Assistant in different states
export default function LuciaDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [demoState, setDemoState] = useState<'not-logged-in' | 'logged-in'>('not-logged-in');

  // Mock authentication for demo
  const mockUser = { id: 'demo-user', name: 'John Doe' };
  const mockAuth = demoState === 'logged-in' ? { user: mockUser, isAuthenticated: true } : { user: null, isAuthenticated: false };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center">Lucia AI Assistant Demo</h1>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Demo Controls</h2>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Authentication State:</label>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setDemoState('not-logged-in')}
                  className={`px-3 py-1 text-xs rounded ${
                    demoState === 'not-logged-in' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Not Logged In
                </button>
                <button
                  onClick={() => setDemoState('logged-in')}
                  className={`px-3 py-1 text-xs rounded ${
                    demoState === 'logged-in' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Logged In
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(true)}
              className="w-full bg-[#D12C1D] text-white py-3 px-4 rounded-lg hover:bg-[#B8241A] transition-colors"
            >
              Open Lucia AI Assistant
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Features</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Mobile-first bottom-sheet modal</li>
            <li>• Authentication-aware interface</li>
            <li>• Real property data integration</li>
            <li>• Voice interaction simulation</li>
            <li>• Property action buttons</li>
            <li>• Smooth animations</li>
          </ul>
        </div>
      </div>

      {/* Override useAuth hook for demo */}
      <div style={{ display: 'none' }}>
        {JSON.stringify(mockAuth)}
      </div>

      <LuciaAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}