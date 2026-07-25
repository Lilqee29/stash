import { supabase } from './supabase';

export interface VideoMetadata {
  title: string;
  description: string;
  thumbnail: string;
  creator: string;
  platform: 'instagram' | 'tiktok' | 'other';
  contentType: 'video' | 'reel' | 'post' | 'default';
}

/**
 * Fetches metadata for a URL by calling the Supabase Edge Function.
 * Falls back to basic extraction if the edge function is unavailable.
 */
export async function fetchVideoMetadata(url: string): Promise<VideoMetadata> {
  const trimmed = url.trim();

  // Try Supabase Edge Function first
  try {
    const { data, error } = await supabase.functions.invoke('fetch-metadata', {
      body: { url: trimmed },
    });

    if (!error && data) {
      return data as VideoMetadata;
    }
  } catch {
    // Edge function not deployed or unreachable — fall through to local extraction
  }

  // Fallback: basic local extraction (no network call)
  return extractMetadataLocally(trimmed);
}

/**
 * Basic local metadata extraction from URL patterns.
 * Used as fallback when the edge function is unavailable.
 */
function extractMetadataLocally(url: string): VideoMetadata {
  const lower = url.toLowerCase();

  // Instagram
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
    const creatorMatch = url.match(/instagram\.com\/([^/?]+)/);
    const isReel = lower.includes('/reel/');
    const creator =
      creatorMatch &&
      !['p', 'reel', 'stories', 'explore', 'accounts'].includes(creatorMatch[1])
        ? creatorMatch[1]
        : '';

    return {
      title: isReel ? `Instagram Reel` : `Instagram Post`,
      description: creator ? `@${creator}` : '',
      thumbnail: '',
      creator,
      platform: 'instagram',
      contentType: isReel ? 'reel' : 'post',
    };
  }

  // TikTok
  if (lower.includes('tiktok.com')) {
    const creatorMatch = url.match(/@([^/?]+)/);
    return {
      title: 'TikTok Video',
      description: creatorMatch ? `@${creatorMatch[1]}` : '',
      thumbnail: '',
      creator: creatorMatch ? creatorMatch[1] : '',
      platform: 'tiktok',
      contentType: 'video',
    };
  }

  // Generic
  const domain = (() => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Web';
    }
  })();

  return {
    title: domain,
    description: '',
    thumbnail: '',
    creator: '',
    platform: 'other',
    contentType: 'default',
  };
}

/**
 * Returns a nice display title for a save based on metadata.
 */
export function getDisplayTitle(meta: VideoMetadata): string {
  if (meta.title && meta.title !== 'Instagram Post' && meta.title !== 'Instagram Reel' && meta.title !== 'TikTok Video') {
    // Clean up HTML entities and truncate
    const clean = meta.title
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#\d+;/g, '')
      .trim();
    return clean.length > 80 ? clean.slice(0, 77) + '...' : clean;
  }

  // Fallback: use creator + platform
  if (meta.creator) {
    const platformLabel = meta.platform === 'instagram' ? 'Instagram' : meta.platform === 'tiktok' ? 'TikTok' : 'Post';
    return `${meta.creator} on ${platformLabel}`;
  }

  return meta.title || 'Saved item';
}

/**
 * Returns a short description line for the preview.
 */
export function getPreviewSubtitle(meta: VideoMetadata): string {
  const parts: string[] = [];

  if (meta.creator) {
    parts.push(`@${meta.creator}`);
  }

  if (meta.platform) {
    const labels: Record<string, string> = {
      instagram: 'Instagram',
      tiktok: 'TikTok',
      other: 'Web',
    };
    parts.push(labels[meta.platform] || meta.platform);
  }

  if (meta.contentType && meta.contentType !== 'default') {
    parts.push(meta.contentType.charAt(0).toUpperCase() + meta.contentType.slice(1));
  }

  return parts.join(' · ') || 'Ready to save';
}
