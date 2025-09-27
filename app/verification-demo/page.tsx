'use client';

import { useState } from 'react';
import VerificationModal from '@/components/VerificationModal';
import { CheckCircle, User, Phone } from 'lucide-react';

export default function VerificationDemo() {
  const [showModal, setShowModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleVerificationComplete = () => {
    setShowModal(false);
    setIsVerified(true);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-5 duration-300">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center space-x-3 shadow-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Profile verified successfully!</p>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Verification Demo</h1>
          <p className="text-gray-600">Test the new verification flow for Malta Sells sellers</p>
        </div>

        {/* Mock Seller Dashboard */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Profile Section */}
          <div className="flex items-center space-x-3 mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
            <div className="w-12 h-12 bg-[#D12C1D] rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Mile Milevski</h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Seller</span>
                {isVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
            </div>
          </div>

          {/* Properties Section */}
          <h3 className="text-lg font-semibold mb-4">Your Properties (0)</h3>
          
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">No properties listed yet</h4>
            <p className="text-gray-600 mb-6">Create your first property listing to get started</p>
            
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>{isVerified ? 'Add Property' : 'Add Your First Property'}</span>
            </button>
          </div>

          {/* Status Indicator */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Verification Status:</span>
              <div className="flex items-center space-x-2">
                {isVerified ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Verified</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Pending Verification</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-3">New Verification Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Removed duplicate "Add Property" button</li>
            <li>• Smart verification flow before property listing</li>
            <li>• Professional contact details collection</li>
            <li>• Country code selection for phone numbers</li>
            <li>• WhatsApp integration option</li>
            <li>• Success notifications and status tracking</li>
          </ul>
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onVerificationComplete={handleVerificationComplete}
        userEmail="mile.milevski@example.com"
        userName="Mile Milevski"
      />
    </div>
  );
}