import { SaveItem } from '../hooks/useStore';

type Platform = SaveItem['platform'];

/**
 * Detects the platform from a URL string.
 * Returns 'tiktok', 'instagram', 'behance', 'dribbble', or 'other'.
 */
export function detectPlatform(url: string): Platform {
  const lower = url.toLowerCase();

  if (
    lower.includes('tiktok.com') ||
    lower.includes('vm.tiktok.com') ||
    lower.includes('vt.tiktok.com')
  ) {
    return 'tiktok';
  }

  if (
    lower.includes('instagram.com') ||
    lower.includes('instagr.am')
  ) {
    return 'instagram';
  }

  if (lower.includes('behance.net') || lower.includes('behance.com')) {
    return 'behance';
  }

  if (lower.includes('dribbble.com')) {
    return 'dribbble';
  }

  return 'other';
}

/**
 * Validates whether a string looks like a URL.
 */
export function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Returns a human-readable label for a platform.
 */
export function platformLabel(platform: Platform): string {
  switch (platform) {
    case 'tiktok':
      return 'TikTok';
    case 'instagram':
      return 'Instagram';
    case 'behance':
      return 'Behance';
    case 'dribbble':
      return 'Dribbble';
    default:
      return 'Web';
  }
}
