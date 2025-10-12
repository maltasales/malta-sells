'use client';

import { Scale, Truck, Building, Wrench } from 'lucide-react';
import Link from 'next/link';

const services = [
  { name: 'Legal', icon: Scale, href: '/services#legal' },
  { name: 'Moving', icon: Truck, href: '/services#moving' },
  { name: 'Banks', icon: Building, href: '/services#banks' },
  { name: 'Handyman', icon: Wrench, href: '/services#handyman' },
];

export default function FooterServices() {
  return (
    <div className="bg-gray-50 py-6 mt-8">
      <div className="px-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Services to help with your property purchase
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {services.map((service) => (
            <Link
              key={service.name}
              href={service.href}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <service.icon className="w-8 h-8 text-[#D12C1D] mb-2" />
              <span className="text-sm font-medium text-gray-700">
                {service.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}