'use client';

import Header from '@/components/Header';
import StoriesSection from '@/components/StoriesSection';
import FeaturedListings from '@/components/FeaturedListings';
import BottomNav from '@/components/BottomNav';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pb-20"> {/* Add padding bottom for fixed bottom nav */}
        <div className="px-4 py-4 space-y-6">
          <StoriesSection />
          <FeaturedListings />
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}