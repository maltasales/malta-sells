'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, X, Video, Wand2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getPlanById, getDefaultPlan, canAddListing } from '@/lib/plans';

const createPropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  property_type: z.string().min(1, 'Property type is required'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  beds: z.number().min(0, 'Beds must be 0 or more'),
  baths: z.number().min(1, 'At least 1 bathroom is required'),
  area: z.number().min(1, 'Area must be greater than 0'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

type CreatePropertyFormData = z.infer<typeof createPropertySchema>;

const propertyTypes = [
  'Apartment',
  'Studio',
  'Penthouse',
  'Villa',
  'Townhouse',
  'Maisonette',
  'Loft',
];

const maltaCities = [
  // Malta - Main Cities
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
  
  // Gozo
  'Victoria (Rabat)', 'Xlendi', 'Marsalforn', 'Nadur', 'Qala',
  'Xaghra', 'Zebbug (Gozo)', 'Sannat', 'Munxar', 'Kercem',
  'Fontana', 'Gharb', 'San Lawrenz', 'Dwejra', 'Azure Window Area',
  'Ramla Bay', 'Calypso Cave Area'
];

// Maximum number of images allowed for video generation
const MAX_IMAGES_FOR_VIDEO = 5;

// Maximum number of images allowed for property listing
const MAX_TOTAL_IMAGES = 10;

// Property tags
const propertyConditionTags = [
  'Finished', 'Unfinished', 'Shell Form', 'Partly Finished'
];

const furnishingTags = [
  'Furnished', 'Semi-Furnished', 'Unfurnished'
];

const groundRentTags = [
  'Freehold', 'Perpetual Ground Rent', 'Temporary Ground Rent', 'Emphyteusis'
];

export default function CreatePropertyPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentListingCount, setCurrentListingCount] = useState(0);
  const [checkingLimits, setCheckingLimits] = useState(true);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [showVideoOptionsModal, setShowVideoOptionsModal] = useState(false);
  const [showGeneratedVideoSuccessModal, setShowGeneratedVideoSuccessModal] = useState(false);
  const [isVideoGenerationComplete, setIsVideoGenerationComplete] = useState(false);
  const [selectedPropertyCondition, setSelectedPropertyCondition] = useState('');
  const [selectedFurnishing, setSelectedFurnishing] = useState('');
  const [selectedGroundRent, setSelectedGroundRent] = useState('');

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
    setError,
  } = useForm<CreatePropertyFormData>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      beds: 1,
      baths: 1,
    },
  });

  // Check listing limits on component mount
  useEffect(() => {
    const checkListingLimits = async () => {
      if (!profile) return;

      try {
        // Get current listing count
        const { data, error } = await supabase
          .from('properties')
          .select('id')
          .eq('seller_id', profile.id);

        if (error) {
          console.error('Error fetching listing count:', error);
          return;
        }

        const listingCount = data?.length || 0;
        setCurrentListingCount(listingCount);

        // Check if user can add more listings
        const userPlan = profile.plan_id ? getPlanById(profile.plan_id) : getDefaultPlan();
        if (!canAddListing(listingCount, userPlan.id)) {
          // Redirect to upgrade page if limit exceeded
          router.push('/account/upgrade-plan');
          return;
        }
      } catch (error) {
        console.error('Error checking listing limits:', error);
      } finally {
        setCheckingLimits(false);
      }
    };

    checkListingLimits();
  }, [profile, router]);

  const handleGenerateAIDescription = async () => {
    setIsGeneratingDescription(true);
    
    try {
      // Get current form values
      const values = getValues();
      
      // Simulate AI description generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate description based on property details
      const descriptions = [
        `Beautiful ${values.property_type?.toLowerCase() || 'property'} located in the heart of ${values.location || 'Malta'}. This stunning ${values.beds}-bedroom, ${values.baths}-bathroom property offers ${values.area || 'spacious'} square meters of living space. Perfect for those seeking a modern home in a prime location with easy access to local amenities and transport links.`,
        
        `Exceptional ${values.property_type?.toLowerCase() || 'property'} for sale in ${values.location || 'Malta'}. Featuring ${values.beds} bedroom${values.beds !== 1 ? 's' : ''} and ${values.baths} bathroom${values.baths !== 1 ? 's' : ''}, this ${values.area}m² property combines comfort with style. Ideal for families or investors looking for a quality property in a desirable area.`,
        
        `Discover this remarkable ${values.property_type?.toLowerCase() || 'property'} situated in ${values.location || 'Malta'}. With ${values.beds} bedroom${values.beds !== 1 ? 's' : ''}, ${values.baths} bathroom${values.baths !== 1 ? 's' : ''}, and ${values.area} square meters of well-designed space, this property offers excellent value and potential. Don't miss this opportunity to own a piece of Malta's property market.`
      ];
      
      // Select a random description
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      // Set the description in the form
      setValue('description', randomDescription);
      
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > MAX_TOTAL_IMAGES) {
      alert(`Maximum ${MAX_TOTAL_IMAGES} images allowed for property listing`);
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadImageToCreatomate = async (file: File): Promise<string> => {
    console.log('Uploading image to Supabase:', file.name);
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `temp-video-generation/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('creatomate')
      .upload(fileName, file);

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload image to Supabase: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('creatomate')
      .getPublicUrl(fileName);

    console.log('Image uploaded to Supabase successfully:', publicUrl);
    return publicUrl;
  };

  const generateVideoWithCreatomate = async () => {
    if (images.length === 0) {
      alert('Please upload at least 1 image to generate a video');
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_CREATOMATE_API_KEY;
    
    if (!apiKey) {
      alert('Missing Creatomate API key. Please configure NEXT_PUBLIC_CREATOMATE_API_KEY environment variable.');
      return;
    }

    console.log('Starting video generation with', images.length, 'images');
    setIsGeneratingVideo(true);
    
    try {
      // Upload images to Supabase and get public URLs
      console.log('Uploading images to Supabase...');
      const imageUrls = await Promise.all(
        images.slice(0, MAX_IMAGES_FOR_VIDEO).map(image => uploadImageToCreatomate(image))
      );

      console.log('All images uploaded successfully:', imageUrls);

      // Get form values for seller name
      const values = getValues();
      const sellerName = profile?.name || 'Property Seller';

      console.log('Preparing video generation with seller name:', sellerName);

      // Prepare modifications object
      const modifications: any = {
        "Brand-Name.text": "",
        "Name.text": sellerName
      };

      // Add image URLs to modifications
      imageUrls.forEach((url, index) => {
        modifications[`Photo-${index + 1}.source`] = url;
      });

      // If we have fewer than 5 images, use the first image for remaining slots
      for (let i = imageUrls.length; i < MAX_IMAGES_FOR_VIDEO; i++) {
        modifications[`Photo-${i + 1}.source`] = imageUrls[0];
      }

      // Add the main picture (use first image)
      modifications["Picture.source"] = imageUrls[0];

      console.log('Video generation modifications:', modifications);

      const data = {
        "template_id": "de5f38c4-6127-4fb3-99f6-3f02b7cb3cfe",
        "modifications": modifications
      };

      console.log('Sending video generation request to Creatomate...');
      const apiBaseUrl = process.env.NEXT_PUBLIC_CREATOMATE_API_URL || 'https://api.creatomate.com';
      const response = await fetch(`${apiBaseUrl}/v2/renders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Creatomate render error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to generate video: ${response.status} ${response.statusText}`);
      }

      const render = await response.json();
      console.log('Full Creatomate render response:', render);
      console.log('Video generation started with render ID:', render.id);
      
      // Poll for video completion
      const renderId = render.id;
      console.log('Polling for video completion, render ID:', renderId);
      await pollForVideoCompletion(renderId);
      
    } catch (error) {
      console.error('Error generating video:', error);
      alert(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsGeneratingVideo(false);
      setShowVideoOptionsModal(false);
    }
  };

  const pollForVideoCompletion = async (renderId: string) => {
    const maxAttempts = 30; // 5 minutes max (10 seconds * 30)
    let attempts = 0;

    console.log('Starting to poll for video completion...');

    const poll = async () => {
      try {
        console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
        
        const apiKey = process.env.NEXT_PUBLIC_CREATOMATE_API_KEY;
        
        if (!apiKey) {
          throw new Error('Missing Creatomate API key');
        }

        const apiBaseUrl = process.env.NEXT_PUBLIC_CREATOMATE_API_URL || 'https://api.creatomate.com';
        const response = await fetch(`${apiBaseUrl}/v2/renders/${renderId}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Creatomate status check error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          throw new Error(`Failed to check video status: ${response.status} ${response.statusText}`);
        }

        const renderStatus = await response.json();
        console.log('Full Creatomate status response:', renderStatus);
        console.log('Video status:', renderStatus.status, 'Progress:', renderStatus.progress || 'N/A');
        
        if (renderStatus.status === 'succeeded') {
          console.log('Video generation completed successfully:', renderStatus.url);
          setGeneratedVideoUrl(renderStatus.url);
          setIsVideoGenerationComplete(true);
          setShowGeneratedVideoSuccessModal(true);
          return;
        } else if (renderStatus.status === 'failed') {
          console.error('Video generation failed:', renderStatus);
          throw new Error(`Video generation failed: ${renderStatus.error || 'Unknown error'}`);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          console.error('Video generation timed out after', maxAttempts, 'attempts');
          throw new Error('Video generation timed out');
        }
      } catch (error) {
        console.error('Error polling video status:', error);
        alert(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      }
    };

    poll();
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert('Video file must be less than 100MB');
        return;
      }
      setVideo(file);
    }
  };

  const handleVideoOptionSelect = (option: 'upload' | 'generate') => {
    if (option === 'upload') {
      document.getElementById('video-upload')?.click();
    } else if (option === 'generate') {
      if (images.length === 0) {
        alert('Please upload at least 1 image to generate a video');
        return;
      }
      generateVideoWithCreatomate();
    }
    setShowVideoOptionsModal(false);
  };


  const uploadFiles = async (propertyId: string) => {
    const imageUrls: string[] = [];
    let videoUrl: string | null = null;

    // Upload images
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileName = `${propertyId}/images/${i}-${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from('properties')
        .upload(fileName, file);

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('properties')
        .getPublicUrl(fileName);
      
      imageUrls.push(publicUrl);
    }

    // Upload video if exists
    if (video) {
      const fileName = `${propertyId}/video/${Date.now()}.${video.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from('properties')
        .upload(fileName, video);

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('properties')
        .getPublicUrl(fileName);
      
      videoUrl = publicUrl;
    }

    return { imageUrls, videoUrl };
  };

  const onSubmit = async (data: CreatePropertyFormData) => {
    if (!profile) {
      setError('root', { message: 'User not authenticated. Please sign in again.' });
      return;
    }
    
    if (images.length === 0) {
      setError('root', { message: 'At least one image is required' });
      return;
    }

    console.log('Starting property creation with profile:', profile);
    console.log('Form data:', data);
    console.log('Images count:', images.length);
    console.log('Video file:', video?.name || 'None');
    console.log('Generated video URL:', generatedVideoUrl || 'None');

    setIsLoading(true);
    try {
      // Collect selected tags
      const tags = [selectedPropertyCondition, selectedFurnishing, selectedGroundRent]
        .filter(tag => tag !== '');

      console.log('Selected tags:', tags);

      // Create property in Supabase using the listings table
      const propertyPayload = {
        seller_id: profile.id, // Use the authenticated user's ID
        title: data.title,
        property_type: data.property_type,
        location: data.location,
        price: data.price,
        beds: data.beds,
        baths: data.baths,
        area: data.area,
        description: data.description,
        tags: tags.length > 0 ? tags : null,
      };

      console.log('Creating property with payload:', propertyPayload);

      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .insert(propertyPayload)
        .select()
        .single();

      if (propertyError) {
        console.error('Error creating property:', propertyError);
        throw new Error(`Failed to create property: ${propertyError.message}`);
      }

      const propertyId = propertyData.id;
      console.log('Property created with ID:', propertyId);

      // Upload images to Supabase Storage
      console.log('Starting image uploads...');
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${propertyId}/images/${i}-${Date.now()}.${fileExt}`;
        
        console.log(`Uploading image ${i + 1}/${images.length}: ${fileName}`);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('creatomate')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('creatomate')
          .getPublicUrl(fileName);
        
        imageUrls.push(publicUrl);
        console.log(`Image ${i + 1} uploaded successfully:`, publicUrl);
      }

      console.log('All images uploaded successfully:', imageUrls);

      // Handle video upload or use generated video URL
      let videoUrl: string | null = null;
      if (video) {
        console.log('Uploading video file:', video.name);
        const fileExt = video.name.split('.').pop();
        const fileName = `${propertyId}/video/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('creatomate')
          .upload(fileName, video);

        if (uploadError) {
          console.error('Error uploading video:', uploadError);
          throw new Error(`Failed to upload video: ${uploadError.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('creatomate')
          .getPublicUrl(fileName);
        
        videoUrl = publicUrl;
        console.log('Video uploaded successfully:', videoUrl);
      } else if (generatedVideoUrl) {
        console.log('Using generated video URL:', generatedVideoUrl);
        videoUrl = generatedVideoUrl;
      }

      // Update listing with image URLs and video URL
      const updatePayload = {
        images: imageUrls,
        video_url: videoUrl,
        cover_image_url: imageUrls.length > 0 ? imageUrls[0] : null,
      };

      console.log('Updating property with media:', updatePayload);

      const { error: updateError } = await supabase
        .from('properties')
        .update(updatePayload)
        .eq('id', propertyId);

      if (updateError) {
        console.error('Error updating property with media:', updateError);
        throw new Error(`Failed to update property with media: ${updateError.message}`);
      }
      
      console.log('Property created successfully with all media:', {
        propertyId,
        imageUrls,
        videoUrl,
      });
      
      // Show success message and redirect
      alert('Property listed successfully!');
      router.push('/dashboard/seller');
    } catch (error: any) {
      console.error('Error in property creation:', error);
      setError('root', {
        message: error.message || 'An error occurred while creating the property. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking limits
  if (checkingLimits) {
    return (
      <AuthGuard requiredRole="seller">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D12C1D]"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="seller">
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="flex items-center p-4">
            <Link href="/dashboard/seller" className="p-2 hover:bg-gray-100 rounded-full mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold">Create Property Listing</h1>
          </div>
        </div>

        <div className="p-4 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                placeholder="e.g., Modern Apartment in Sliema"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Property Type & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  {...register('property_type')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                >
                  <option value="">Select type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.property_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.property_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  {...register('location')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                >
                  <option value="">Select location</option>
                  {maltaCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>
            </div>

            {/* Price & Currency */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (€)
                </label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                  placeholder="350000"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
            </div>

            {/* Beds, Baths, Area */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  {...register('beds', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                />
                {errors.beds && (
                  <p className="mt-1 text-sm text-red-600">{errors.beds.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  {...register('baths', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                />
                {errors.baths && (
                  <p className="mt-1 text-sm text-red-600">{errors.baths.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (m²)
                </label>
                <input
                  {...register('area', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                />
                {errors.area && (
                  <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>
                )}
              </div>
            </div>

            {/* Property Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Tags
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Property Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Property Condition
                  </label>
                  <select
                    value={selectedPropertyCondition}
                    onChange={(e) => setSelectedPropertyCondition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                  >
                    <option value="">Select condition</option>
                    {propertyConditionTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>

                {/* Furnishing */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Furnishing
                  </label>
                  <select
                    value={selectedFurnishing}
                    onChange={(e) => setSelectedFurnishing(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                  >
                    <option value="">Select furnishing</option>
                    {furnishingTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>

                {/* Ground Rent (Maltese Law) */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Ground Rent (Maltese Law)
                  </label>
                  <select
                    value={selectedGroundRent}
                    onChange={(e) => setSelectedGroundRent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                  >
                    <option value="">Select ground rent</option>
                    {groundRentTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAIDescription}
                  disabled={isGeneratingDescription}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingDescription ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3" />
                      <span>Generate AI Description</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                placeholder="Describe your property, its features, and what makes it special..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Images (up to {MAX_TOTAL_IMAGES} images total)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="images-upload"
                />
                <label
                  htmlFor="images-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload images or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    Up to {MAX_TOTAL_IMAGES} images total
                  </span>
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Video (optional)
              </label>
              
              {/* Hidden file input for video upload */}
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload"
              />
              
              {/* Single video button */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <button
                  type="button"
                  onClick={() => setShowVideoOptionsModal(true)}
                  className="flex flex-col items-center cursor-pointer w-full"
                >
                  <Video className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 text-center">
                    Add Property Video
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Upload your own or generate from photos
                  </span>
                </button>
              </div>

              {(video || generatedVideoUrl) && (
                <div className="mt-4">
                  {video && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-sm font-medium text-green-800">
                          Video uploaded: {video.name}
                        </p>
                      </div>
                    </div>
                  )}
                  {generatedVideoUrl && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-sm font-medium text-green-800">
                          AI video generated successfully!
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <video
                          src={generatedVideoUrl}
                          controls
                          className="w-full max-w-xs rounded-lg"
                          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3C/svg%3E"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Listing Property...' : 'List Property for Sale'}
            </button>
          </form>
        </div>

        {/* Video Options Modal */}
        {showVideoOptionsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Property Video</h3>
                <button
                  onClick={() => setShowVideoOptionsModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleVideoOptionSelect('upload')}
                  className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#D12C1D] transition-colors"
                >
                  <Video className="w-6 h-6 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Upload your own video</div>
                    <div className="text-sm text-gray-600">Upload a video file from your device</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleVideoOptionSelect('generate')}
                  disabled={images.length === 0}
                  className={`w-full flex items-center space-x-3 p-4 border rounded-lg transition-colors ${
                    images.length === 0
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-200 hover:bg-gray-50 hover:border-[#D12C1D]'
                  }`}
                >
                  <Wand2 className={`w-6 h-6 ${images.length === 0 ? 'text-gray-400' : 'text-gray-600'}`} />
                  <div className="text-left">
                    <div className={`font-medium ${images.length === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                      Generate video from photos
                    </div>
                    <div className={`text-sm ${images.length === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                      {images.length === 0 
                        ? 'Upload images first to generate a video'
                        : images.length > MAX_IMAGES_FOR_VIDEO 
                          ? `Create AI video using first ${MAX_IMAGES_FOR_VIDEO} of ${images.length} images`
                          : `Create AI video using ${images.length} images`
                      }
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Generation Loading Modal */}
        {isGeneratingVideo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="text-center py-8">
                <Loader2 className="w-16 h-16 text-[#D12C1D] mx-auto mb-4 animate-spin" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Generating Your Video...
                </h4>
                <p className="text-gray-600 mb-4">
                  Please wait while we create your professional property video. 
                  This may take a few minutes.
                </p>
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    ✨ Uploading your images...<br/>
                    🎬 Creating video transitions...<br/>
                    🏠 Adding property details...<br/>
                    📱 Optimizing for social media...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generated Video Success Modal */}
        {showGeneratedVideoSuccessModal && generatedVideoUrl && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-600">
                  {isVideoGenerationComplete ? 'Video Generated Successfully!' : 'Generating Video...'}
                </h3>
                {isVideoGenerationComplete && (
                <button
                  onClick={() => setShowGeneratedVideoSuccessModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
                )}
              </div>
              
              <div className="space-y-4">
                {!isVideoGenerationComplete ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-16 h-16 text-[#D12C1D] mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600 mb-4">
                      Please wait while we create your professional property video. 
                      This may take a few minutes.
                    </p>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        ✨ Processing your images...<br/>
                        🎬 Creating video transitions...<br/>
                        🏠 Adding property details...<br/>
                        📱 Optimizing for social media...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                <p className="text-gray-600">
                  Your professional property video has been created successfully! 
                  The video will be automatically attached to your property listing.
                </p>
                
                {/* Video Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <video
                    src={generatedVideoUrl}
                    controls
                    className="w-full rounded-lg"
                    poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3C/svg%3E"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                {/* Action Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setShowGeneratedVideoSuccessModal(false);
                      setIsVideoGenerationComplete(false);
                    }}
                    className="px-6 py-2 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors font-medium"
                  >
                    Continue with Listing
                  </button>
                </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}