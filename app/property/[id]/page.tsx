// app/property/[id]/page.tsx
import { ArrowLeft, Share, MapPin, Bed, Bath, Calendar } from 'lucide-react';
import Link from 'next/link';
import { propertyData } from '@/lib/propertyData';
import PropertyDetailClient from '@/components/PropertyDetailClient';

// ✅ optional static paths if you want SSG
export async function generateStaticParams() {
  return Object.keys(propertyData).map((id) => ({ id }));
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = propertyData[params.id as keyof typeof propertyData];

  if (!property) {
    return <div className="p-6">Property not found</div>;
  }

  // Delegate to a client component for UI interactions
  return (
    <PropertyDetailClient property={property} />
  );
}
