'use client';

import { ArrowLeft, Scale, Truck, Building, Wrench, Sparkles } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    id: 'legal',
    name: 'Legal Services',
    description: 'Get help with property contracts, buyer/seller rights, and legal advice',
    icon: Scale,
    image: 'https://images.pexels.com/photos/5668481/pexels-photo-5668481.jpeg?w=800&h=600&fit=crop',
    providers: ['Legal Aid Malta', 'Property Law Experts', 'Real Estate Lawyers']
  },
  {
    id: 'moving',
    name: 'Moving Services',
    description: 'Professional moving and relocation services across Malta',
    icon: Truck,
    image: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?w=800&h=600&fit=crop',
    providers: ['Malta Movers', 'Quick Relocate', 'Island Moving Services']
  },
  {
    id: 'banks',
    name: 'Banking Services',
    description: 'Open bank accounts, get mortgages, and financial services',
    icon: Building,
    image: 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?w=800&h=600&fit=crop',
    providers: ['Bank of Valletta', 'HSBC Malta', 'APS Bank']
  },
  {
    id: 'handyman',
    name: 'Handyman Services',
    description: 'Home repairs, maintenance, and improvement services',
    icon: Wrench,
    image: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?w=800&h=600&fit=crop',
    providers: ['Malta Handyman', 'Fix It Fast', 'Home Repair Pros']
  },
  {
    id: 'cleaning',
    name: 'Cleaning Services',
    description: 'Professional cleaning services for homes and offices',
    icon: Sparkles,
    image: 'https://images.pexels.com/photos/3951391/pexels-photo-3951391.jpeg?w=800&h=600&fit=crop',
    providers: ['Malta Cleaners', 'Sparkle & Shine', 'EcoClean Malta']
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center p-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Services</h1>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Services to help you settle
          </h2>
          <p className="text-gray-600">
            Find trusted service providers for all your rental and moving needs
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center mb-2">
                    <service.icon className="w-6 h-6 text-white mr-2" />
                    <h3 className="text-lg font-semibold text-white">
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-white text-sm opacity-90">
                    {service.description}
                  </p>
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Popular Providers:
                </h4>
                <div className="space-y-1">
                  {service.providers.map((provider, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      • {provider}
                    </p>
                  ))}
                </div>
                
                <button className="w-full mt-4 py-2 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors text-sm font-medium">
                  View Providers
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}