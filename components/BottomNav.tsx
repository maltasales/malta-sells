'use client';

import { Home, Heart, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';


export default function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { name: 'Explore', icon: Home, href: '/' },
    { name: 'Wishlists', icon: Heart, href: isAuthenticated ? '/wishlists' : '/auth/signin' },
    { name: 'Services', icon: Settings, href: '/services' },
    { name: 'Account', icon: User, href: isAuthenticated ? '/account' : '/auth/signin' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 md:hidden">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
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
  );
}