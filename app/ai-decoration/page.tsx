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
  // Removed for now

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

  // Simplified slider functionality for now
  useEffect(() => {
    if (!showResult) return;
    
    // Will add interactive slider functionality later
    console.log('Result view loaded, slider functionality ready');
  }, [showResult]);

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
            <img 
              src="https://customer-assets.emergentagent.com/job_realestate-lucia/artifacts/5jadarke_25301.png" 
              alt="AI Decoration"
              className="w-6 h-6 mr-3 filter brightness-0"
            />
            <h1 className="text-2xl font-semibold text-gray-900">AI Property Decoration</h1>
          </div>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            Transform this unfurnished space with AI-powered interior design. Select your preferred room type and style to see how it could look fully decorated.
          </p>
        </div>

        {!showResult ? (
          /* Configuration Phase */
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Original Image */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">Original Space</h3>
                </div>
                <div className="aspect-[4/3] bg-gray-50">
                  {originalImage ? (
                    <img
                      src={originalImage}
                      alt="Original property"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded"></div>
                        <p className="text-sm">Property Image</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-6">Decoration Settings</h3>
                
                {/* Room Type Dropdown */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Room Type</label>
                  <div className="relative">
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 appearance-none cursor-pointer"
                    >
                      {roomTypes.map((room) => (
                        <option key={room} value={room}>
                          {room}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Style Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-2">Decoration Style</label>
                  <div className="relative">
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 appearance-none cursor-pointer"
                    >
                      {decorationStyles.map((style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`w-full py-3 px-4 rounded text-sm font-medium transition-all duration-200 ${
                    isGenerating
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    'Generate AI Decoration'
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-2">
                  Generation takes 2-3 seconds
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Result Phase - Before/After Stacked Slider */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">{selectedRoom} - {selectedStyle} Style</h3>
              </div>
              
              {/* Before/After Stacked Slider */}
              <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden group cursor-ew-resize" id="slider-container">
                {/* Before Image (Bottom Layer) */}
                <img
                  src={originalImage}
                  alt="Original property"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* After Image (Top Layer - Clipped by slider position) */}
                <div 
                  className="absolute inset-0 overflow-hidden transition-all duration-150"
                  style={{ clipPath: `polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)` }}
                  id="after-image-clip"
                >
                  <img
                    src={generatedImage}
                    alt="AI decorated space"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Vertical Slider Line */}
                <div 
                  className="absolute inset-y-0 flex items-center z-10 cursor-ew-resize"
                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                  id="slider-handle"
                >
                  <div className="w-0.5 bg-white shadow-xl h-full"></div>
                  <div className="absolute w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-300">
                    <div className="w-0.5 h-3 bg-gray-500 rounded mx-0.5"></div>
                    <div className="w-0.5 h-3 bg-gray-500 rounded mx-0.5"></div>
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  After
                </div>
                <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  Before
                </div>
                
                {/* Instructions overlay (appears on hover) */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/70 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Drag to compare
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Aligned within image width */}
        {showResult && (
          <div className="max-w-2xl mx-auto">
            <div className="mt-4 flex justify-center gap-4 px-4">
              <button
                onClick={handleSave}
                className="flex items-center px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Save
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 mr-1" />
                Share
              </button>
              
              <button
                onClick={handleReset}
                className="flex items-center px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Try Another
              </button>
              
              <button
                onClick={() => window.close()}
                className="flex items-center px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Close
              </button>
            </div>

            {/* Decor Elements Used Section */}
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Decor Elements Used</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between items-center">
                  <span>• Sofa</span>
                  <span className="text-gray-500">€890 – The Atrium</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>• Coffee Table</span>
                  <span className="text-gray-500">€150 – Homemate</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>• Closet</span>
                  <span className="text-gray-500">€420 – Power House</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>• Floor Lamp</span>
                  <span className="text-gray-500">€230 – IKEA Malta</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>• Area Rug</span>
                  <span className="text-gray-500">€180 – Home Centre</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>• Wall Art</span>
                  <span className="text-gray-500">€95 – Living Space Malta</span>
                </li>
              </ul>
              <p className="text-xs text-gray-400 mt-3 italic">
                *Prices and availability from Maltese furniture stores. Click items to view in store.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>AI-generated decorations are for visualization purposes only.</p>
        </div>
      </div>
    </div>
  );
}