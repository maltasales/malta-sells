'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const startXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Use provided images or fallback
  const displayImages = images && images.length > 0 
    ? images 
    : ['https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=800&h=600&fit=crop'];

  const nextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    if (isTransitioning || index === currentImageIndex) return;
    setIsTransitioning(true);
    setCurrentImageIndex(index);
  };

  // Reset transition state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentImageIndex]);

  // Simple touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startXRef.current) return;
    
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startXRef.current;
    
    if (Math.abs(deltaX) > 50) { // 50px threshold
      if (deltaX > 0) {
        prevImage(); // Swipe right = previous image
      } else {
        nextImage(); // Swipe left = next image
      }
    }
    
    startXRef.current = 0;
  };

  return (
    <div className="relative">
      {/* Main Image Container */}
      <div 
        className="aspect-[4/3] overflow-hidden bg-gray-100"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={displayImages[currentImageIndex]}
          alt={`${title} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
      
      {/* Navigation Arrows */}
      {displayImages.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}
      
      {/* Image Counter */}
      <div className="absolute top-4 right-4 px-2 py-1 bg-black/70 text-white text-sm rounded backdrop-blur-sm">
        {currentImageIndex + 1} / {displayImages.length}
      </div>
      
      {/* Dot Indicators */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}