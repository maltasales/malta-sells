'use client';

import { Home, Heart, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const LuciaAssistant = dynamic(() => import('./LuciaAssistant'), {
  ssr: false,
});

// Custom AI Voice Assistant Icon Component
const VoiceAssistantIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="12" r="10" fill="currentColor"/>
    <rect x="9" y="8" width="1.5" height="8" fill="white" rx="0.75"/>
    <rect x="11.25" y="6" width="1.5" height="12" fill="white" rx="0.75"/>
    <rect x="13.5" y="8" width="1.5" height="8" fill="white" rx="0.75"/>
  </svg>
);

export default function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isLuciaOpen, setIsLuciaOpen] = useState(false);

  const navItems = [
    { name: 'Explore', icon: Home, href: '/' },
    { name: 'Wishlists', icon: Heart, href: isAuthenticated ? '/wishlists' : '/auth/signin' },
    { name: 'AI Voice', icon: VoiceAssistantIcon, href: '#', isSpecial: true, onClick: () => setIsLuciaOpen(true) },
    { name: 'Services', icon: Settings, href: '/services' },
    { name: 'Account', icon: User, href: isAuthenticated ? '/account' : '/auth/signin' },
  ];

  const handleNavClick = (item: any, e: React.MouseEvent) => {
    if (item.onClick) {
      e.preventDefault();
      item.onClick();
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 md:hidden z-40">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isSpecial = item.isSpecial;
            
            if (item.onClick) {
              return (
                <button
                  key={item.name}
                  onClick={(e) => handleNavClick(item, e)}
                  data-testid={`bottom-nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                    isSpecial
                      ? 'text-white bg-[#D12C1D] hover:bg-[#B8241A]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{item.name}</span>
                </button>
              );
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                data-testid={`bottom-nav-${item.name.toLowerCase().replace(' ', '-')}`}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isSpecial
                    ? 'text-white bg-[#D12C1D] hover:bg-[#B8241A]'
                    : isActive
                    ? 'text-[#D12C1D] bg-red-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Lucia AI Assistant Modal */}
      <LuciaAssistant 
        isOpen={isLuciaOpen} 
        onClose={() => setIsLuciaOpen(false)} 
      />
    </>
  );
}