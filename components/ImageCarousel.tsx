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
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Fallback to default image if no images provided
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

  // Handle transition end
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // Match CSS transition duration

    return () => clearTimeout(timer);
  }, [currentImageIndex]);

  // Touch/Mouse event handlers
  const handleStart = (clientX: number, clientY: number) => {
    startXRef.current = clientX;
    startYRef.current = clientY;
    isDraggingRef.current = false;
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!startXRef.current) return;

    const deltaX = clientX - startXRef.current;
    const deltaY = clientY - startYRef.current;
    
    // Only consider it dragging if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isDraggingRef.current = true;
    }
  };

  const handleEnd = (clientX: number) => {
    if (!startXRef.current || !isDraggingRef.current) {
      startXRef.current = 0;
      isDraggingRef.current = false;
      return;
    }

    const deltaX = clientX - startXRef.current;
    const swipeThreshold = 50; // Minimum distance for a swipe

    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) {
        prevImage(); // Swiped right, go to previous image
      } else {
        nextImage(); // Swiped left, go to next image
      }
    }

    startXRef.current = 0;
    isDraggingRef.current = false;
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
    
    // Prevent default scrolling if we're dragging horizontally
    if (isDraggingRef.current) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    handleEnd(touch.clientX);
  };

  // Mouse events (for desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    handleEnd(e.clientX);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={isDraggingRef.current ? handleMouseMove : undefined}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="relative w-full bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ aspectRatio: '16/10' }}>
        <div 
          className="flex transition-transform duration-300 ease-out h-full"
          style={{ 
            transform: `translateX(-${currentImageIndex * 100}%)`,
            width: `${displayImages.length * 100}%`
          }}
        >
          {displayImages.map((image, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 bg-white flex items-center justify-center p-1">
              <img
                src={image}
                alt={`${title} - Image ${index + 1}`}
                className="max-w-full max-h-full object-contain rounded"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=800&h=600&fit=crop';
                }}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation Arrows - Only show if more than 1 image */}
      {displayImages.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}
      
      {/* Image Counter */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-black/70 text-white text-sm rounded-full backdrop-blur-sm">
        {currentImageIndex + 1} / {displayImages.length}
      </div>
      
      {/* Dot Indicators - Only show if more than 1 image */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentImageIndex 
                  ? 'bg-white shadow-md scale-110' 
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}