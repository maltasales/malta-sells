'use client';

import { ArrowLeft, Building2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Service data (same as in services page)
const services = [
  {
    id: 'furniture',
    name: 'Furniture Stores',
    description: 'Find quality furniture and home decor for your new property'
  },
  {
    id: 'legal',
    name: 'Legal Services',
    description: 'Get help with property contracts, buyer/seller rights, and legal advice'
  },
  {
    id: 'moving',
    name: 'Moving Services',
    description: 'Professional moving and relocation services across Malta'
  },
  {
    id: 'banks',
    name: 'Banking Services',
    description: 'Open bank accounts, get mortgages, and financial services'
  },
  {
    id: 'handyman',
    name: 'Handyman Services',
    description: 'Home repairs, maintenance, and improvement services'
  },
  {
    id: 'cleaning',
    name: 'Cleaning Services',
    description: 'Professional cleaning services for homes and offices'
  },
];

// Generate 10 empty provider cards
const generateProviderCards = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `provider-${index + 1}`,
    name: '', // Empty name - no Provider 1, 2, etc.
    website: '', // Empty for now, will be filled later
    logo: '', // Empty placeholder for logo
  }));
};

export default function ServiceProvidersPage() {
  const params = useParams();
  const serviceId = params.id as string;
  
  // Find the current service
  const currentService = services.find(service => service.id === serviceId);
  
  // Generate 10 provider cards
  const providers = generateProviderCards(10);

  if (!currentService) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Service Not Found</h1>
          <Link href="/services" className="text-[#D12C1D] hover:underline">
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const handleProviderClick = (website: string) => {
    if (website) {
      window.open(website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center p-4">
          <Link href="/services" className="p-2 hover:bg-gray-100 rounded-full mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">{currentService.name}</h1>
            <p className="text-sm text-gray-600">Providers</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentService.name} Providers
          </h2>
          <p className="text-gray-600">
            {currentService.description}
          </p>
        </div>

        {/* Provider Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              onClick={() => handleProviderClick(provider.website)}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              {/* Logo Placeholder */}
              <div className="relative h-32 bg-gray-50 flex items-center justify-center">
                {provider.logo ? (
                  <img
                    src={provider.logo}
                    alt={`${provider.name} logo`}
                    className="max-h-20 max-w-20 object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Building2 className="w-12 h-12 mb-2" />
                    <span className="text-xs">Logo Placeholder</span>
                  </div>
                )}
              </div>
              
              {/* Provider Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-400 italic">
                    {provider.name || 'Company Name'}
                  </h3>
                  {provider.website && (
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#D12C1D] transition-colors" />
                  )}
                </div>
                
                {/* Website Link Field */}
                <div className="text-sm text-gray-500 mb-3">
                  {provider.website ? (
                    <span className="text-[#D12C1D] hover:underline">
                      {provider.website}
                    </span>
                  ) : (
                    <span className="italic">Website URL will be added</span>
                  )}
                </div>
                
                {/* Contact Button */}
                <button 
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-[#D12C1D] hover:text-white transition-colors text-sm font-medium group-hover:bg-[#D12C1D] group-hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProviderClick(provider.website);
                  }}
                >
                  {provider.website ? 'Visit Website' : 'Contact Info Coming Soon'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State Message */}
        <div className="mt-8 text-center text-gray-500">
          <p className="text-sm">
            Provider information will be populated soon. Each card will include company logos, 
            contact details, and direct website links.
          </p>
        </div>
      </div>
    </div>
  );
}