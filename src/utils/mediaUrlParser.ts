import { MarketingMediaType } from '../types';

export interface ParsedMediaMeta {
  type: MarketingMediaType;
  platformName: string;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  youtubeId?: string;
  isEmbeddable: boolean;
}

export function parseMediaUrl(url: string): ParsedMediaMeta {
  if (!url) {
    return {
      type: 'SOCIAL_LINK',
      platformName: 'Link',
      embedUrl: null,
      thumbnailUrl: null,
      isEmbeddable: false
    };
  }

  const clean = url.trim();

  // 1. YouTube Video / Short / Watch / Embed / Youtu.be
  const ytMatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return {
      type: 'YOUTUBE_VIDEO',
      platformName: 'YouTube',
      youtubeId: ytId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=0&rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      isEmbeddable: true
    };
  }

  // 2. Facebook Post / Video
  if (clean.includes('facebook.com') || clean.includes('fb.watch') || clean.includes('fb.com')) {
    const encoded = encodeURIComponent(clean);
    return {
      type: 'FACEBOOK_POST',
      platformName: 'Facebook',
      embedUrl: `https://www.facebook.com/plugins/post.php?href=${encoded}&show_text=true&width=500`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
      isEmbeddable: true
    };
  }

  // 3. Instagram Reel / Post
  if (clean.includes('instagram.com')) {
    let embed = clean;
    if (!embed.endsWith('/')) embed += '/';
    embed += 'embed';
    return {
      type: 'INSTAGRAM_POST',
      platformName: 'Instagram',
      embedUrl: embed,
      thumbnailUrl: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?auto=format&fit=crop&w=800&q=80',
      isEmbeddable: true
    };
  }

  // 4. TikTok Video
  if (clean.includes('tiktok.com')) {
    const ttMatch = clean.match(/\/video\/(\d+)/);
    const videoId = ttMatch ? ttMatch[1] : null;
    return {
      type: 'TIKTOK_VIDEO',
      platformName: 'TikTok',
      embedUrl: videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : clean,
      thumbnailUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80',
      isEmbeddable: !!videoId
    };
  }

  // Default Fallback
  return {
    type: 'SOCIAL_LINK',
    platformName: 'Social Post / Link',
    embedUrl: null,
    thumbnailUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80',
    isEmbeddable: false
  };
}
