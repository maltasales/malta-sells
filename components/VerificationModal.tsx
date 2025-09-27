'use client';

import { useState } from 'react';
import { X, Phone, Mail, Check } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: () => void;
  userEmail: string;
  userName?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber: string;
  usesameMobile: boolean;
}

const countryCodes = [
  { code: '+356', country: 'Malta', flag: '🇲🇹' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
];

export default function VerificationModal({ 
  isOpen, 
  onClose, 
  onVerificationComplete, 
  userEmail, 
  userName = '' 
}: VerificationModalProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: userName.split(' ')[0] || '',
    lastName: userName.split(' ').slice(1).join(' ') || '',
    email: userEmail,
    mobileNumber: '',
    whatsappNumber: '',
    usesameMobile: true
  });

  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[0]);
  const [whatsappCountryCode, setWhatsappCountryCode] = useState(countryCodes[0]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showWhatsappCountryDropdown, setShowWhatsappCountryDropdown] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid mobile number';
    }

    if (!formData.usesameMobile && formData.whatsappNumber && !/^[0-9+\-\s()]+$/.test(formData.whatsappNumber)) {
      newErrors.whatsappNumber = 'Please enter a valid WhatsApp number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Auto-update WhatsApp number when "same as mobile" is checked
    if (field === 'usesameMobile' && value === true) {
      setFormData(prev => ({
        ...prev,
        whatsappNumber: prev.mobileNumber
      }));
      setWhatsappCountryCode(selectedCountryCode);
    } else if (field === 'mobileNumber' && formData.usesameMobile) {
      setFormData(prev => ({
        ...prev,
        whatsappNumber: value as string
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Simulate API call - replace with actual Supabase update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would update the user's profile in Supabase
      // await supabase.from('profiles').update({
      //   full_name: `${formData.firstName} ${formData.lastName}`,
      //   phone: `${selectedCountryCode.code}${formData.mobileNumber}`,
      //   whatsapp: formData.usesameMobile ? `${selectedCountryCode.code}${formData.mobileNumber}` : `${whatsappCountryCode.code}${formData.whatsappNumber}`,
      //   verified: true
      // }).eq('id', user.id);

      onVerificationComplete();
    } catch (error) {
      console.error('Verification error:', error);
      setErrors({ submit: 'Verification failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Complete Your Seller Profile</h2>
            <p className="text-sm text-gray-600 mt-1">Please verify your contact details to start listing properties</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent ${
                errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter your first name"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent ${
                errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter your last name"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">For direct calls from potential buyers</p>
            <div className="flex">
              {/* Country Code Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <span>{selectedCountryCode.flag}</span>
                  <span className="text-sm">{selectedCountryCode.code}</span>
                </button>
                
                {showCountryDropdown && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {countryCodes.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          setSelectedCountryCode(country);
                          setShowCountryDropdown(false);
                          if (formData.usesameMobile) {
                            setWhatsappCountryCode(country);
                          }
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <span>{country.flag}</span>
                        <span className="text-sm">{country.code}</span>
                        <span className="text-xs text-gray-500">{country.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent ${
                  errors.mobileNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter mobile number"
              />
            </div>
            {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <p className="text-xs text-gray-500 mb-2">For instant messaging with buyers</p>
            
            {/* Same as mobile checkbox */}
            <label className="flex items-center space-x-2 mb-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.usesameMobile}
                  onChange={(e) => handleInputChange('usesameMobile', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 border-2 rounded transition-colors ${
                  formData.usesameMobile 
                    ? 'bg-[#D12C1D] border-[#D12C1D]' 
                    : 'border-gray-300'
                }`}>
                  {formData.usesameMobile && (
                    <Check className="w-3 h-3 text-white absolute top-0 left-0" strokeWidth={3} />
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-700">Same as mobile</span>
            </label>

            {!formData.usesameMobile && (
              <div className="flex">
                {/* WhatsApp Country Code Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowWhatsappCountryDropdown(!showWhatsappCountryDropdown)}
                    className="px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                  >
                    <span>{whatsappCountryCode.flag}</span>
                    <span className="text-sm">{whatsappCountryCode.code}</span>
                  </button>
                  
                  {showWhatsappCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      {countryCodes.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => {
                            setWhatsappCountryCode(country);
                            setShowWhatsappCountryDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span>{country.flag}</span>
                          <span className="text-sm">{country.code}</span>
                          <span className="text-xs text-gray-500">{country.country}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent ${
                    errors.whatsappNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter WhatsApp number"
                />
              </div>
            )}
            {errors.whatsappNumber && <p className="text-red-500 text-xs mt-1">{errors.whatsappNumber}</p>}
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              'Verify & Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}