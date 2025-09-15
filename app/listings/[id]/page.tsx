import { notFound } from 'next/navigation';
import ListingDetailClient from '@/components/ListingDetailClient';
import { supabase } from '@/lib/supabase';

// Mock data for static generation - replace with actual Supabase query in production
const mockListingIds = ['1', '2', '3', '4', '5', '6', '7', '8'];

export async function generateStaticParams() {
  try {
    // Try to fetch actual listing IDs from Supabase
    const { data: listings, error } = await supabase
      .from('properties')
      .select('id');

    if (error || !listings || listings.length === 0) {
      // Fallback to mock data if Supabase query fails
      return mockListingIds.map((id) => ({
        id: id,
      }));
    }

    return listings.map((listing) => ({
      id: listing.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    // Fallback to mock data
    return mockListingIds.map((id) => ({
      id: id,
    }));
  }
}

async function getListing(id: string) {
  const { data: listing, error } = await supabase
    .from('properties')
    .select(`
      *,
      profiles!properties_seller_id_fkey (
        id,
        full_name,
        avatar_url,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching listing:', error);
    return null;
  }

  return listing;
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);

  if (!listing) {
    notFound();
  }

  return (
    <ListingDetailClient listing={listing} />
  );
}