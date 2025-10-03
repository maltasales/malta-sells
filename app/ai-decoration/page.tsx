'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Palette, Download, Share2, RotateCcw, X } from 'lucide-react';

const roomTypes = [
  'Living Room',
  'Bedroom', 
  'Kitchen',
  'Bathroom',
  'Dining Room',
  'Home Office',
  'Balcony/Terrace',
  'Entrance Hall'
];

const decorationStyles = [
  'Modern',
  'Traditional',
  'Minimalist', 
  'Scandinavian',
  'Industrial',
  'Mediterranean',
  'Contemporary',
  'Retro/Vintage',
  'Rustic',
  'Luxury'
];

// Placeholder generated images for different room/style combinations
const placeholderImages = [
  'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?w=800&h=600&fit=crop',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=800&h=600&fit=crop',
  'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?w=800&h=600&fit=crop',
  'https://images.pexels.com/photos/1571452/pexels-photo-1571452.jpeg?w=800&h=600&fit=crop',
  'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?w=800&h=600&fit=crop'
];

export default function AIDecorationPage() {
  const [selectedRoom, setSelectedRoom] = useState('Living Room');
  const [selectedStyle, setSelectedStyle] = useState('Modern');
  const [originalImage, setOriginalImage] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const imageParam = urlParams.get('image');
    const propertyIdParam = urlParams.get('propertyId');
    
    if (imageParam) {
      setOriginalImage(decodeURIComponent(imageParam));
    }
    if (propertyIdParam) {
      setPropertyId(propertyIdParam);
    }
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Select a random placeholder image
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    setGeneratedImage(randomImage);
    setShowResult(true);
    setIsGenerating(false);
  };

  const handleSave = () => {
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-decorated-${selectedRoom.toLowerCase().replace(' ', '-')}-${selectedStyle.toLowerCase()}.jpg`;
    link.click();
  };

  const handleShare = async () => {
    const shareData = {
      title: `AI Decorated ${selectedRoom} - ${selectedStyle} Style`,
      text: `Check out this AI-decorated ${selectedRoom} in ${selectedStyle} style for Property #${propertyId}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
        alert('Decoration link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleReset = () => {
    setShowResult(false);
    setGeneratedImage('');
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Palette className="w-8 h-8 text-gray-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">AI Property Decoration</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transform this unfurnished space with AI-powered interior design. Select your preferred room type and style to see how it could look fully decorated.
          </p>
        </div>

        {!showResult ? (
          /* Configuration Phase */
          <div className="grid md:grid-cols-2 gap-8">
            {/* Original Image */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-900">Original Space</h3>
              </div>
              <div className="aspect-[4/3] bg-gray-100">
                {originalImage ? (
                  <img
                    src={originalImage}
                    alt="Original property"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Palette className="w-12 h-12 mx-auto mb-2" />
                      <p>Property Image</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Decoration Settings</h3>
              
              {/* Room Type Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type
                </label>
                <div className="relative">
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {roomTypes.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Style Dropdown */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decoration Style
                </label>
                <div className="relative">
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {decorationStyles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                  isGenerating
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 active:scale-98'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating AI Decoration...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Generate AI Decoration
                  </div>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                AI generation typically takes 2-3 seconds
              </p>
            </div>
          </div>
        ) : (
          /* Result Phase */
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-900">Before</h3>
              </div>
              <div className="aspect-[4/3]">
                <img
                  src={originalImage}
                  alt="Original property"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* After */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-purple-50 border-b">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Palette className="w-4 h-4 text-purple-600 mr-2" />
                  AI Decorated - {selectedRoom} ({selectedStyle})
                </h3>
              </div>
              <div className="aspect-[4/3]">
                <img
                  src={generatedImage}
                  alt="AI decorated space"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showResult && (
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleSave}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Save Image
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Another Style
            </button>
            
            <button
              onClick={() => window.close()}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            AI-generated decorations are for visualization purposes only. 
            Actual furnishing and decoration may vary.
          </p>
        </div>
      </div>
    </div>
  );
}