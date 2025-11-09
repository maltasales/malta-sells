import { notFound } from 'next/navigation';
import PublicSellerProfile from '@/components/PublicSellerProfile';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getSeller(id: string) {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching seller profile:', profileError);
      return null;
    }

    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .eq('seller_id', id)
      .order('created_at', { ascending: false });

    if (propertiesError) {
      console.error('Error fetching seller properties:', propertiesError);
    }

    const transformedProperties = properties?.map(prop => ({
      id: prop.id,
      title: prop.title,
      location: prop.location,
      price: prop.price,
      currency: prop.currency || '€',
      beds: prop.beds,
      baths: prop.baths,
      image: prop.images?.[0] || 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=800&h=600&fit=crop',
      type: prop.property_type || 'Property'
    })) || [];

    return {
      id: profile.id,
      name: profile.full_name || 'Property Seller',
      email: profile.email,
      role: profile.role || 'seller',
      createdAt: profile.created_at,
      avatar_url: profile.avatar_url,
      banner_url: profile.banner_url,
      phone: profile.phone,
      bio: profile.bio || 'Property seller in Malta',
      properties: transformedProperties
    };
  } catch (error) {
    console.error('Error in getSeller:', error);
    return null;
  }
}

export default async function PublicSellerPage({ params }: { params: { id: string } }) {
  const seller = await getSeller(params.id);

  if (!seller) {
    notFound();
  }

  return <PublicSellerProfile seller={seller} />;
}