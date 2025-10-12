'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

export default function FavoriteButton() {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <button 
      onClick={() => setIsFavorited(!isFavorited)}
      className="p-2 hover:bg-gray-100 rounded-full"
    >
      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
    </button>
  );
}