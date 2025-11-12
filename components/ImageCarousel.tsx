'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Palette, X } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  title: string;
  furnishingStatus?: string;
  propertyId?: string;
}

export default function ImageCarousel({ images, title, furnishingStatus, propertyId }: ImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAIDecorationModal, setShowAIDecorationModal] = useState(false);
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
      
      {/* AI Decoration Icon for Unfurnished/Shell form properties */}
      {(furnishingStatus === 'Unfurnished' || furnishingStatus === 'Shell form' ||
        (!furnishingStatus && propertyId && (parseInt(propertyId) % 2 === 1))) && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowAIDecorationModal(true);
          }}
          className="absolute top-4 left-4 p-2 rounded-lg hover:scale-110 transition-all duration-200 group"
          title="AI Decoration - Visualize this space furnished"
        >
          <img
            src="https://customer-assets.emergentagent.com/job_realestate-lucia/artifacts/5jadarke_25301.png"
            alt="AI Decoration"
            className="w-8 h-8 filter brightness-0 invert drop-shadow-lg"
            style={{ filter: 'brightness(0) invert(1) drop-shadow(2px 2px 4px rgba(0,0,0,0.8))' }}
          />
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Decoration
          </div>
        </button>
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

      {/* AI Decoration Modal */}
      {showAIDecorationModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAIDecorationModal(false);
          }}
        >
          <div
            className="bg-white w-full md:max-w-4xl md:rounded-xl rounded-t-xl max-h-[95vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 md:rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">AI Property Decoration</h2>
                  <p className="text-sm text-purple-100 mt-0.5">
                    Transform this unfurnished space with AI-powered interior design
                  </p>
                </div>
                <button
                  onClick={() => setShowAIDecorationModal(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content - iframe */}
            <div className="flex-1 overflow-hidden" style={{ minHeight: '70vh' }}>
              <iframe
                src={`/ai-decoration?propertyId=${propertyId}&image=${encodeURIComponent(displayImages[currentImageIndex])}`}
                className="w-full h-full border-0"
                title="AI Decoration"
                style={{ minHeight: '70vh' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}