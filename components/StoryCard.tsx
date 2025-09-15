'use client';

interface Story {
  id: number;
  name: string;
  avatar: string;
  preview: string;
}

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  return (
    <div className="flex-shrink-0 w-24 cursor-pointer">
      <div className="relative">
        <div className="w-20 h-36 rounded-lg overflow-hidden shadow-sm">
          <img
            src={story.preview}
            alt={`${story.name}'s story`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <img
              src={story.avatar}
              alt={story.name}
              className="w-6 h-6 rounded-full border-2 border-white mb-1"
            />
            <p className="text-white text-xs font-medium truncate">
              {story.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}