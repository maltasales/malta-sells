'use client';

import { useRef, useState, useEffect } from 'react';
import { Play, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

interface PropertyVideo {
  id: number;
  title: string;
  location: string;
  price: number;
  currency: string;
  beds: number;
  baths: number;
  videoUrl: string;
  thumbnail: string;
  agent: {
    name: string;
    avatar: string;
    id: string;
  };
}

interface PropertyVideoCardProps {
  video: PropertyVideo;
}

export default function PropertyVideoCard({ video }: PropertyVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play();
          setIsPlaying(true);
        } else if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex-shrink-0 w-32">
      <Link href={`/videos?start=${video.id}`}>
        <div 
          className="relative cursor-pointer group"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* 9:16 aspect ratio container */}
          <div className="w-28 h-[200px] rounded-xl overflow-hidden shadow-lg bg-black relative">
            {!videoError ? (
              <video
                ref={videoRef}
                src={video.videoUrl}
                poster={video.thumbnail}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setVideoError(true)}
              />
            ) : (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Hover overlay with subtle animation */}
            <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`}>
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>
            </div>
            
            {/* Gradient overlay - full height */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            
            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
              <div className="flex items-center mb-2">
                <div 
                  className="pointer-events-auto cursor-pointer"
                  onClick={handleSellerClick}
                >
                  <img
                    src={video.agent.avatar}
                    alt={video.agent.name}
                    className="w-6 h-6 rounded-full border-2 border-white hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/seller/${video.agent.id}`;
                    }}
                  />
                </div>
              </div>
              <div 
                className="pointer-events-auto cursor-pointer"
                onClick={handleSellerClick}
              >
                <div 
                  className="flex items-center space-x-1 mb-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/seller/${video.agent.id}`;
                  }}
                >
                  <p className="text-white text-xs font-medium truncate hover:text-blue-300 transition-colors">
                    {video.agent.name}
                  </p>
                  <span className="inline-flex items-center justify-center w-3 h-3 bg-blue-500 rounded-full flex-shrink-0">
                    <BadgeCheck className="w-2 h-2 text-white" />
                  </span>
                </div>
              </div>
              <p className="text-white text-sm font-bold">
                {video.currency}{video.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}