import { notFound } from 'next/navigation';
import ListingDetailClient from '@/components/ListingDetailClient';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

// Allow dynamic params to handle missing routes gracefully
export const dynamicParams = true;

// Skip static generation for this route
export async function generateStaticParams() {
  // Return empty array to skip static generation
  return [];
}

async function getListing(id: string) {
  try {
    const { data: listing, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
      return null;
    }

    return listing;
  } catch (error) {
    console.error('Error in getListing:', error);
    return null;
  }
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  try {
    const listing = await getListing(params.id);

    if (!listing) {
      notFound();
    }

    return (
      <ListingDetailClient listing={listing} />
    );
  } catch (error) {
    console.error('Error in ListingDetailPage:', error);

    // Show error fallback instead of crashing
    return (
      <div className="min-h-screen bg-white">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to load listing</h1>
          <p className="text-gray-600 mb-6">We're having trouble loading this listing. Please try again later.</p>
          <a
            href="/"
            className="inline-block bg-[#D12C1D] text-white px-6 py-3 rounded-lg hover:bg-[#B8241A] transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }
}