import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Lock } from 'lucide-react';

interface NormalizedVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  allowDownload?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
}

export const NormalizedVideoPlayer: React.FC<NormalizedVideoPlayerProps> = ({
  src,
  poster,
  title,
  allowDownload = false,
  autoplay = false,
  muted = false,
  controls = true,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(autoplay);

  // Check if YouTube link
  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&modestbranding=1&rel=0`;
  };

  if (isYouTube) {
    return (
      <div className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl ${className}`}>
        <iframe
          src={getYouTubeEmbedUrl(src)}
          title={title || 'Video Player'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl group ${className}`}>
      <video
        src={src}
        poster={poster}
        autoPlay={autoplay}
        muted={muted}
        controls={controls}
        controlsList={allowDownload ? undefined : 'nodownload noplaybackrate'}
        disablePictureInPicture={!allowDownload}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onContextMenu={(e) => {
          if (!allowDownload) e.preventDefault();
        }}
        className="w-full h-full object-cover"
        preload="metadata"
      />

      {/* No-download watermark badge if restricted */}
      {!allowDownload && (
        <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-amber-400 flex items-center gap-1.5 border border-amber-500/20 pointer-events-none">
          <Lock className="w-3 h-3" />
          <span>Protected Content</span>
        </div>
      )}
    </div>
  );
};
