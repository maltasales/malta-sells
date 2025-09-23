'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Heart, ArrowUpRight, Bed, Bath, MapPin, Play, Search, Settings, User, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const propertyVideos = [
  {
    id: '1',
    title: 'Modern Apartment in Sliema',
    location: 'Sliema',
    price: 350000,
    currency: '€',
    beds: 2,
    baths: 1,
    area: 85,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Beautiful modern apartment for sale located in the heart of Sliema. This stylish property features contemporary design and is just minutes from the seafront.',
    agent: {
      name: 'Caio Ferraz',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop&crop=face',
      phone: '+356 9999 1234',
      id: '1'
    }
  },
  {
    id: '2',
    title: 'Luxury Penthouse in Valletta',
    location: 'Valletta',
    price: 750000,
    currency: '€',
    beds: 3,
    baths: 2,
    area: 120,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    description: 'Stunning penthouse with panoramic views of Valletta harbor. Features luxury finishes and a private terrace perfect for entertaining.',
    agent: {
      name: 'Anhoch',
      avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?w=100&h=100&fit=crop&crop=face',
      phone: '+356 9999 5678',
      id: '2'
    }
  },
  {
    id: '3',
    title: 'Cozy Studio in St. Julians',
    location: 'St. Julians',
    price: 280000,
    currency: '€',
    beds: 1,
    baths: 1,
    area: 45,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Perfect starter home in the vibrant St. Julians area. Close to restaurants, nightlife, and public transport.',
    agent: {
      name: 'Cristiano Ronaldo',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop&crop=face',
      phone: '+356 9999 9999',
      id: '3'
    }
  },
  {
    id: '4',
    title: 'Seaside Villa in Marsaxlokk',
    location: 'Marsaxlokk',
    price: 650000,
    currency: '€',
    beds: 3,
    baths: 2,
    area: 150,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    description: 'Charming villa by the sea in the picturesque fishing village of Marsaxlokk. Features a private garden and stunning sea views.',
    agent: {
      name: 'Maria Santos',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100&h=100&fit=crop&crop=face',
      phone: '+356 9999 4321',
      id: '4'
    }
  },
];

export default function VideosPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const startId = searchParams.get('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (startId) {
      const index = propertyVideos.findIndex(video => video.id === startId);
      if (index !== -1) {
        setCurrentIndex(index);
        setIsPaused(false);
        setShowPlayOverlay(false);
      }
    }
  }, [startId]);

  useEffect(() => {
    // Play current video and pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          if (!isPaused) {
            video.play().catch(console.error);
          } else {
            video.pause();
          }
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex, isPaused]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < propertyVideos.length) {
      setCurrentIndex(newIndex);
      setIsPaused(false);
      setShowPlayOverlay(false);
    }
  }, [currentIndex]);

  const togglePlayPause = () => {
    const video = videoRefs.current[currentIndex];
    if (!video) return;

    if (isPaused) {
      // Currently paused, so play
      video.play().catch(console.error);
      setIsPaused(false);
      // Hide overlay with animation delay
      setTimeout(() => {
        setShowPlayOverlay(false);
      }, 300);
    } else {
      // Currently playing, so pause
      video.pause();
      setIsPaused(true);
      setShowPlayOverlay(true);
    }
  };

  const handleShare = async (video: typeof propertyVideos[0]) => {
    const shareData = {
      title: video.title,
      text: `Check out this ${video.title} in ${video.location} for ${video.currency}${video.price.toLocaleString()}`,
      url: `${window.location.origin}/property/${video.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
        alert('Property link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const currentVideo = propertyVideos[currentIndex];

  const navItems = [
    { name: 'Explore', icon: Search, href: '/' },
    { name: 'Wishlists', icon: Heart, href: isAuthenticated ? '/wishlists' : '/auth/signin' },
    { name: 'Services', icon: Settings, href: '/services' },
    { name: 'Account', icon: User, href: isAuthenticated ? '/account' : '/auth/signin' },
  ];

  return (
    <div className="fixed inset-0 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <Link href="/" className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
      </div>

      {/* Video Container */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollSnapType: 'y mandatory' }}
      >
        <style jsx>{`
          .scrollbar-hide {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {propertyVideos.map((video, index) => (
          <div key={video.id} className="h-screen snap-start snap-always relative flex items-center justify-center">
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={video.videoUrl}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
            />
            
            {/* Video overlay content */}
            <div className="absolute inset-0" onClick={togglePlayPause}>
              {/* Play/Pause Overlay */}
              <div className={`absolute inset-0 flex items-center justify-center z-30 transition-all duration-300 ease-out ${
                showPlayOverlay && isPaused 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-75 pointer-events-none'
              }`}>
                <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
              </div>

              {/* Right side actions */}
              <div className="absolute right-4 bottom-40 flex flex-col space-y-8 z-20">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                  }}
                  className="flex flex-col items-center space-y-1"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </div>
                  <span className="text-white text-xs">Like</span>
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(video);
                  }}
                  className="flex flex-col items-center space-y-1"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 512 512" width="512" height="512">
                      <path d="M0 0 C5.71126003 4.18722276 10.58361052 9.21727955 15.55850983 14.2302475 C16.76961227 15.43591771 17.98156134 16.64073798 19.19428253 17.84477997 C22.45954288 21.09193522 25.7121797 24.35145814 28.96202183 27.61403561 C32.37999178 31.04220001 35.80778765 34.46051797 39.2339859 37.88045502 C44.9838097 43.62302109 50.7251932 49.37392432 56.46183014 55.12966156 C63.07488058 61.76447697 69.70221668 68.38476039 76.33715558 74.99768138 C82.0544005 80.6967188 87.76374415 86.40358374 93.4666698 92.11695027 C96.86361162 95.52009765 100.26312533 98.92055773 103.66981506 102.31394958 C106.87358106 105.50607961 110.06724983 108.70799222 113.25369644 111.91740799 C114.4180147 113.08697218 115.58566992 114.25322633 116.75705338 115.41571426 C129.89319527 128.46133792 140.10422322 142.94840573 140.41861725 162.04225922 C140.38163657 180.54867563 136.36843543 194.76369127 123.32022858 208.55568695 C122.72331333 209.19041207 122.12639809 209.8251372 121.5113945 210.47909641 C111.91508693 220.60454451 102.00204372 230.42826339 92.13946056 240.29311633 C90.38023244 242.05306314 88.62172143 243.81372336 86.8634491 245.57462502 C80.70766489 251.73960017 74.54936598 257.90204995 68.38858795 264.06203461 C62.67739098 269.77262882 56.97182223 275.48880434 51.2688024 281.20756382 C46.33781211 286.15167004 41.40293289 291.09187204 36.46506143 296.02910572 C33.53055901 298.96335484 30.59758385 301.89908915 27.66854858 304.83879662 C24.91825753 307.5988404 22.16311042 310.35394631 19.40432739 313.10550117 C18.40053473 314.10825767 17.39840487 315.11268228 16.39818573 316.1190033 C-5.49654331 338.13851313 -5.49654331 338.13851313 -21.58699799 338.60231781 C-29.55970328 338.51952752 -34.96888963 336.69724434 -40.98934174 331.46559906 C-47.85610611 324.30848524 -50.98597362 315.07206586 -51.16732025 305.25344086 C-51.18726547 304.29282242 -51.20721069 303.33220398 -51.22776031 302.34247589 C-51.25282906 300.80627342 -51.25282906 300.80627342 -51.27840424 299.23903656 C-51.29918533 298.18070114 -51.31996643 297.12236572 -51.34137726 296.03195953 C-51.40662902 292.6596434 -51.46564435 289.28725107 -51.52449799 285.91481781 C-51.56770638 283.62509647 -51.61132141 281.33538276 -51.65535736 279.04567719 C-51.7622854 273.43963736 -51.86409662 267.83352215 -51.96199799 262.22731781 C-153.18924878 268.84356031 -243.82288451 308.93702083 -320.27449799 386.91481781 C-321.50538122 388.35084825 -322.73427731 389.78858264 -323.96199799 391.22731781 C-324.87797194 392.28000429 -325.79470187 393.33203324 -326.71199799 394.38356781 C-327.73358063 395.56000088 -328.75439049 396.73710538 -329.77449799 397.91481781 C-330.54902313 398.80825897 -330.54902313 398.80825897 -331.33919525 399.71974945 C-334.37394671 403.25847711 -337.2182032 406.87555876 -339.96102142 410.64406586 C-347.54602723 421.00165478 -347.54602723 421.00165478 -353.96199799 422.22731781 C-359.97595776 422.5768471 -364.32918693 421.19829871 -368.96199799 417.22731781 C-371.84901209 413.30013582 -372.34619606 410.48806156 -372.36043549 405.65309906 C-372.3666391 404.35904144 -372.37284271 403.06498383 -372.37923431 401.73171234 C-372.36697572 400.33439701 -372.35285195 398.93709697 -372.33699799 397.53981781 C-372.33267761 396.8279129 -372.32835724 396.116008 -372.32390594 395.38253021 C-371.78524791 319.38181306 -341.22330816 242.96909676 -290.96199799 186.22731781 C-290.1743808 185.32884125 -289.38676361 184.43036469 -288.57527924 183.50466156 C-282.42313859 176.63782953 -275.95202635 170.08576518 -269.46199799 163.53981781 C-268.59590912 162.66067719 -267.72982025 161.78153656 -266.83748627 160.87575531 C-260.86104845 154.8914434 -254.60381867 149.45937704 -247.96199799 144.22731781 C-246.86371674 143.35611298 -246.86371674 143.35611298 -245.74324799 142.46730804 C-230.90024425 130.78446195 -215.42996026 120.4739599 -198.96199799 111.22731781 C-198.18147064 110.7877475 -197.4009433 110.34817719 -196.59676361 109.89528656 C-155.16912779 86.80229117 -103.99214368 69.97401704 -56.1243515 70.20265961 C-54.66606682 70.20799965 -54.66606682 70.20799965 -53.17832184 70.21344757 C-52.08124153 70.22031334 -52.08124153 70.22031334 -50.96199799 70.22731781 C-50.97199074 69.3431443 -50.97199074 69.3431443 -50.98218536 68.4411087 C-51.04898784 62.25963085 -51.09398339 56.07825694 -51.12679291 49.89650726 C-51.14180147 47.59503254 -51.16221472 45.29358604 -51.18831635 42.99221039 C-51.22505011 39.66816456 -51.24180423 36.34449962 -51.25496674 33.02028656 C-51.27045059 32.00524551 -51.28593445 30.99020447 -51.30188751 29.9444046 C-51.30439564 19.0948628 -48.88498433 8.80220979 -41.96199799 0.22731781 C-28.67919401 -11.45864634 -13.81639569 -8.99754458 0 0 Z M-19.96199799 25.22731781 C-19.96786423 26.00104233 -19.97373047 26.77476685 -19.97977448 27.57193756 C-20.0378152 34.88389505 -20.1099563 42.19551619 -20.1977129 49.50717258 C-20.24233214 53.26567225 -20.28160635 57.02406563 -20.30843353 60.78273773 C-20.33455153 64.41395083 -20.37501259 68.04475308 -20.42518425 71.67571068 C-20.44179587 73.057043 -20.45334556 74.43844629 -20.45961189 75.81986427 C-20.53005028 89.92777954 -20.53005028 89.92777954 -23.96199799 95.22731781 C-28.5763459 99.36708344 -32.54147711 99.87507524 -38.46199799 100.09841156 C-40.15593313 100.19563601 -41.84986191 100.29297128 -43.5437851 100.39040375 C-44.8694902 100.45656891 -44.8694902 100.45656891 -46.22197723 100.52407074 C-128.62996164 104.75713444 -205.16855774 139.23981176 -261.54402924 199.93044281 C-263.39088016 201.9974779 -265.18051242 204.10349453 -266.96199799 206.22731781 C-267.41703705 206.76856293 -267.87207611 207.30980804 -268.34090424 207.86745453 C-280.0864765 221.89980861 -290.77384879 236.50292638 -299.89412689 252.3811264 C-300.9536955 254.21296403 -302.03947961 256.02703433 -303.12996674 257.84059906 C-320.94228202 287.89591238 -334.26294582 324.39804015 -337.96199799 359.22731781 C-333.5753483 355.62051696 -329.51923635 351.8290658 -325.52449799 347.78981781 C-321.16530026 343.38508938 -316.68139874 339.24086036 -311.96199799 335.22731781 C-310.52533783 333.95694672 -310.52533783 333.95694672 -309.05965424 332.66091156 C-242.74539774 274.28246024 -156.83632689 239.14195733 -68.96199799 232.22731781 C-68.24141205 232.16947113 -67.52082611 232.11162445 -66.77840424 232.05202484 C-58.2877997 231.39575564 -49.78891162 231.09695464 -41.27449799 230.97731781 C-40.43660736 230.95588715 -39.59871674 230.93445648 -38.73543549 230.9123764 C-33.7129554 230.88490336 -30.31361204 231.44122345 -25.96199799 234.22731781 C-21.65863331 238.87960395 -20.84228585 242.21781449 -20.75667572 248.44289398 C-20.7367305 249.72399551 -20.71678528 251.00509705 -20.69623566 252.32501984 C-20.67925259 253.72344085 -20.66237374 255.12186312 -20.64559174 256.52028656 C-20.62501632 257.95090071 -20.60401969 259.38150886 -20.58261871 260.8121109 C-20.52745866 264.57511787 -20.4780227 268.33817916 -20.42977142 272.10128021 C-20.37951206 275.94216997 -20.32384916 279.78298097 -20.26863861 283.62380219 C-20.16113126 291.15824068 -20.05966988 298.69274472 -19.96199799 306.22731781 C-13.439555 300.84803793 -7.49035231 294.92522085 -1.50643158 288.9646225 C-0.36098885 287.82709485 0.78463063 286.68974515 1.93041229 285.5525589 C5.67051285 281.83849854 9.40532655 278.11914619 13.13956451 274.39919281 C14.43061873 273.11350419 15.72167889 271.82782154 17.0127449 270.54214478 C22.3835473 265.19293752 27.75291953 259.84230152 33.11857796 254.48793411 C40.78469012 246.83806677 48.45916817 239.19681863 56.14557326 231.56733966 C61.5643072 226.18736495 66.97336733 220.79778406 72.37539613 215.4010365 C75.59592144 212.18415404 78.82044468 208.97154085 82.05538559 205.76914978 C85.09849402 202.75623016 88.12937345 199.73151565 91.15154839 196.69760323 C92.25774139 195.59119045 93.36816686 194.48898931 94.4832592 193.39154625 C101.66783211 186.31447991 107.9601114 179.56785086 109.70206451 169.32106781 C109.49116662 149.91846148 96.86202556 139.89884808 83.89029694 126.93434906 C82.80168093 125.84273277 81.71326728 124.75091463 80.62503815 123.65891266 C77.70011196 120.72524096 74.77203447 117.7947352 71.84305358 114.8651123 C70.0106955 113.03203951 68.17905288 111.1982549 66.34765816 109.36421967 C59.95243922 102.95978603 53.55468018 96.55790284 47.15445709 90.15847015 C41.19501303 84.19962922 35.24119676 78.2352054 29.28992957 72.26819897 C24.16717724 67.13238312 19.0405892 62.00041771 13.910981 56.87144947 C10.85251624 53.81323959 7.79562273 50.75349865 4.74258232 47.68987274 C1.87824423 44.81587115 -0.99083182 41.94668638 -3.86364746 39.08115959 C-4.91672582 38.02912852 -5.96809657 36.97538496 -7.01762962 35.91981697 C-8.44964353 34.48010235 -9.88842931 33.04713281 -11.3275528 31.61452484 C-12.53231624 30.40894424 -12.53231624 30.40894424 -13.76141834 29.17900848 C-15.77634467 27.39197345 -17.49808769 26.27289793 -19.96199799 25.22731781 Z " fill="currentColor" transform="translate(371.96199798583984,48.772682189941406)"/>
                      <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10c.553 0 1-.447 1-1s-.447-1-1-1c-4.411 0-8-3.589-8-8s3.589-8 8-8c.553 0 1-.447 1-1s-.447-1-1-1z"/>
                    </svg>
                  </div>
                  <span className="text-white text-xs">Share</span>
                </button>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                {/* Gradient background */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" />
                
                {/* Content */}
                <div className="relative p-4 pb-20 pointer-events-auto">
                  <div className="flex items-center space-x-3 mb-3">
                    <Link href={`/seller/${video.id}`}>
                      <img
                        src={video.agent.avatar}
                        alt={video.agent.name}
                        className="w-10 h-10 rounded-full border-2 border-white hover:scale-110 transition-transform cursor-pointer"
                      />
                    </Link>
                    <div>
                      <Link href={`/seller/${video.id}`}>
                        <div className="flex items-center space-x-1">
                          <p className="text-white font-semibold hover:text-blue-300 transition-colors cursor-pointer">
                            {video.agent.name}
                          </p>
                          <span className="inline-flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full flex-shrink-0">
                            <BadgeCheck className="w-3 h-3 text-white" />
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                  
                  <Link href={`/property/${video.id}`}>
                    <h2 className="text-white text-xl font-bold mb-2 hover:text-blue-300 transition-colors cursor-pointer">
                      {video.title}
                    </h2>
                  </Link>
                  
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center text-white/90">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{video.location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-white/90">
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        <span className="text-sm">{video.beds}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        <span className="text-sm">{video.baths}</span>
                      </div>
                      <span className="text-sm">{video.area}m²</span>
                    </div>
                  </div>
                  
                  <p className="text-2xl font-bold text-white mb-2">
                    {video.currency}{video.price.toLocaleString()}
                  </p>

                  <div className="mb-4">
                    <Link
                      href={`/property/${video.id}`}
                      className="block w-full bg-brand-red-dark text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-red-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}