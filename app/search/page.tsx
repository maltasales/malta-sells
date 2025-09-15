'use client';

import { useState } from 'react';
import { ArrowLeft, SlidersHorizontal, Search, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';

// All available properties for searching
const allProperties = [
  {
    id: 1,
    title: 'Modern Apartment in Sliema',
    location: 'Sliema',
    price: 350000,
    currency: '€',
    period: '',
    beds: 2,
    baths: 1,
    image: 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Apartment',
    latitude: 35.9042,
    longitude: 14.5000,
    tags: ['Finished', 'Furnished', 'Sea View', 'Balcony', 'Air Conditioning']
  },
  {
    id: 2,
    title: 'Luxury Penthouse in Valletta',
    location: 'Valletta',
    price: 750000,
    currency: '€',
    period: '',
    beds: 3,
    baths: 2,
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Penthouse',
    latitude: 35.8989,
    longitude: 14.5146,
    tags: ['Finished', 'Semi-Furnished', 'City View', 'Terrace', 'Lift', 'Premium Finishes']
  },
  {
    id: 3,
    title: 'Cozy Studio in St. Julians',
    location: 'St. Julians',
    price: 280000,
    currency: '€',
    period: '',
    beds: 1,
    baths: 1,
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Studio',
    latitude: 35.9167,
    longitude: 14.4897,
    tags: ['Finished', 'Furnished', 'Central Location', 'Modern Appliances']
  },
  {
    id: 4,
    title: 'Seaside Villa in Marsaxlokk',
    location: 'Marsaxlokk',
    price: 650000,
    currency: '€',
    period: '',
    beds: 3,
    baths: 2,
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Villa',
    tags: ['Finished', 'Unfurnished', 'Sea View', 'Garden', 'Parking Space', 'Traditional Architecture']
  },
  {
    id: 5,
    title: 'Historic Townhouse in Mdina',
    location: 'Mdina',
    price: 480000,
    currency: '€',
    period: '',
    beds: 2,
    baths: 2,
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Townhouse',
    tags: ['Partly Finished', 'Unfurnished', 'Country View', 'Period Property', 'Central Heating']
  },
  {
    id: 6,
    title: 'Modern Loft in Gzira',
    location: 'Gzira',
    price: 320000,
    currency: '€',
    period: '',
    beds: 1,
    baths: 1,
    image: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Loft',
    tags: ['Finished', 'Semi-Furnished', 'City View', 'Modern Appliances', 'Lift']
  },
  {
    id: 7,
    title: 'Waterfront Apartment in Birgu',
    location: 'Birgu',
    price: 420000,
    currency: '€',
    period: '',
    beds: 2,
    baths: 1,
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Apartment',
    tags: ['Finished', 'Furnished', 'Sea View', 'Balcony', 'Investment Property']
  },
  {
    id: 8,
    title: 'Garden Maisonette in Attard',
    location: 'Attard',
    price: 520000,
    currency: '€',
    period: '',
    beds: 3,
    baths: 2,
    image: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Maisonette',
    tags: ['Finished', 'Unfurnished', 'Garden', 'Garage', 'Solar Panels', 'Family Home']
  }
];

const propertyTypes = [
  'Apartment', 'Studio', 'Penthouse', 'Villa', 'Townhouse', 'Maisonette', 'Loft'
];

const maltaCities = [
  'Valletta', 'Sliema', 'St. Julians', 'Msida', 'Gzira', 'Ta\' Xbiex',
  'Floriana', 'Hamrun', 'Marsa', 'Paola', 'Tarxien', 'Fgura',
  'Santa Venera', 'Birkirkara', 'San Gwann', 'Iklin', 'Lija', 'Balzan',
  'Attard', 'Mdina', 'Rabat', 'Dingli', 'Siggiewi', 'Qormi',
  'Zebbug', 'Luqa', 'Gudja', 'Ghaxaq', 'Kirkop', 'Safi',
  'Zurrieq', 'Mqabba', 'Qrendi', 'Birzebbuga', 'Marsaxlokk',
  'Zabbar', 'Xghajra', 'Kalkara', 'Vittoriosa', 'Senglea', 'Cospicua',
  'Zejtun', 'Marsaskala', 'St. Thomas Bay', 'Delimara',
  'Mosta', 'Naxxar', 'Gharghur', 'Madliena', 'Swieqi', 'Pembroke',
  'St. Andrews', 'Mellieha', 'Mgarr', 'Golden Bay', 'Ghajn Tuffieha',
  'Bugibba', 'Qawra', 'St. Paul\'s Bay', 'Xemxija', 'Mistra',
  'Victoria (Rabat)', 'Xlendi', 'Marsalforn', 'Nadur', 'Qala',
  'Xaghra', 'Zebbug (Gozo)', 'Sannat', 'Munxar', 'Kercem',
  'Fontana', 'Gharb', 'San Lawrenz', 'Dwejra', 'Azure Window Area',
  'Ramla Bay', 'Calypso Cave Area'
];

const allTags = [
  // Property Condition
  'Finished', 'Unfinished', 'Shell Form', 'Partly Finished',
  // Furnishing
  'Furnished', 'Semi-Furnished', 'Unfurnished',
  // Ground Rent
  'Freehold', 'Perpetual Ground Rent', 'Temporary Ground Rent', 'Emphyteusis',
  // Features
  'Sea View', 'Country View', 'City View', 'Garden', 'Terrace', 'Balcony',
  'Swimming Pool', 'Garage', 'Car Port', 'Parking Space', 'Lift', 'Air Conditioning',
  'Central Heating', 'Solar Panels', 'Investment Property', 'Rental Potential',
  'New Build', 'Period Property', 'Corner Property', 'Penthouse Level',
  'Central Location', 'Modern Appliances', 'Traditional Architecture', 'Premium Finishes',
  'Family Home'
];

export default function SearchPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProperties, setFilteredProperties] = useState<typeof allProperties>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter states
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBeds, setSelectedBeds] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSearch = () => {
    let results = allProperties;

    // Filter by search term
    if (searchTerm.trim()) {
      results = results.filter(property => 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by property type
    if (selectedPropertyType) {
      results = results.filter(property => property.type === selectedPropertyType);
    }

    // Filter by location
    if (selectedLocation) {
      results = results.filter(property => property.location === selectedLocation);
    }

    // Filter by bedrooms
    if (selectedBeds) {
      const beds = parseInt(selectedBeds);
      if (beds === 4) {
        results = results.filter(property => property.beds >= 4);
      } else {
        results = results.filter(property => property.beds === beds);
      }
    }

    // Filter by price range
    if (minPrice) {
      results = results.filter(property => property.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      results = results.filter(property => property.price <= parseInt(maxPrice));
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      results = results.filter(property => 
        selectedTags.some(tag => property.tags?.includes(tag))
      );
    }

    setFilteredProperties(results);
    setHasSearched(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedPropertyType('');
    setSelectedLocation('');
    setSelectedBeds('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedTags([]);
    setSearchTerm('');
    setFilteredProperties([]);
    setHasSearched(false);
  };

  const applyFilters = () => {
    handleSearch();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Search Properties</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${
                showFilters ? 'bg-gray-100' : ''
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search by location, property type, or features..."
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors font-medium"
          >
            Search
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="p-4 space-y-4">
            {/* Property Type and Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {maltaCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bedrooms and Price Range */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <select
                  value={selectedBeds}
                  onChange={(e) => setSelectedBeds(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (€)
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (€)
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="1000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features & Tags
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-[#D12C1D] text-white border-[#D12C1D]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#D12C1D]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors font-medium"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="p-4">
        {!hasSearched ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Find Your Dream Property
            </h2>
            <p className="text-gray-600 mb-6">
              Search through our collection of properties in Malta
            </p>
            <p className="text-sm text-gray-500">
              Try searching for "Sliema", "Apartment", "Sea View", or any other keyword
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>

            {filteredProperties.length > 0 ? (
              <div className="space-y-4">
                {filteredProperties.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-[#D12C1D] hover:text-[#B8241A] font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}