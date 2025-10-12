import { notFound } from 'next/navigation';
import PublicSellerProfile from '@/components/PublicSellerProfile';

// Mock seller data - replace with actual database queries later
const mockSellers = {
  '1': {
    id: '1',
    name: 'Maria Bonello',
    email: 'maria@example.com',
    role: 'seller' as const,
    createdAt: '2023-01-15T00:00:00.000Z',
    avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=200&h=200&fit=crop&crop=face',
    banner_url: 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=800&h=300&fit=crop',
    phone: '+356 9999 1234',
    bio: 'Experienced property seller in Malta with over 5 years in the real estate market. Specializing in modern apartments and luxury properties.',
    properties: [
      {
        id: '1',
        title: 'Modern Apartment in Sliema',
        location: 'Sliema',
        price: 350000,
        currency: '€',
        beds: 2,
        baths: 1,
        image: 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=800&h=600&fit=crop',
        type: 'Apartment'
      }
    ]
  },
  '2': {
    id: '2',
    name: 'Anhoch',
    email: 'anhoch@example.com',
    role: 'seller' as const,
    createdAt: '2023-03-20T00:00:00.000Z',
    avatar_url: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?w=200&h=200&fit=crop&crop=face',
    banner_url: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?w=800&h=300&fit=crop',
    phone: '+356 9999 5678',
    bio: 'Luxury property specialist focusing on penthouses and high-end properties in Valletta and surrounding areas.',
    properties: [
      {
        id: '2',
        title: 'Luxury Penthouse in Valletta',
        location: 'Valletta',
        price: 750000,
        currency: '€',
        beds: 3,
        baths: 2,
        image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?w=800&h=600&fit=crop',
        type: 'Penthouse'
      }
    ]
  }
};

export async function generateStaticParams() {
  return Object.keys(mockSellers).map((id) => ({
    id: id,
  }));
}

export default function PublicSellerPage({ params }: { params: { id: string } }) {
  const seller = mockSellers[params.id as keyof typeof mockSellers];

  if (!seller) {
    notFound();
  }

  return <PublicSellerProfile seller={seller} />;
}