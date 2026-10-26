/**
 * Helper to convert Google Drive share URLs into direct image URLs
 */
export function resolveGoogleDriveImage(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  // Match /file/d/FILE_ID/ or id=FILE_ID
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}=w1200`;
  }
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}=w1200`;
  }
  return trimmed;
}

/**
 * Extract Google Drive File ID if present
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1?.[1]) return m1[1];
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2?.[1]) return m2[1];
  return null;
}

export type VideoSourceInfo =
  | { type: 'drive'; embedUrl: string; fileId: string; rawUrl: string }
  | { type: 'direct'; src: string; rawUrl: string }
  | { type: 'youtube'; embedUrl: string; rawUrl: string }
  | { type: 'none' };

/**
 * Resolve video source from URL (Google Drive embed, direct mp4/webm, or YouTube)
 */
export function resolveVideoSource(url?: string): VideoSourceInfo {
  if (!url || typeof url !== 'string') return { type: 'none' };
  const trimmed = url.trim();
  if (!trimmed) return { type: 'none' };

  // 1. Google Drive link
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      fileId: driveId,
      rawUrl: trimmed,
    };
  }

  // 2. YouTube Shorts or Video
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playsinline=1&playlist=${ytMatch[1]}`,
      rawUrl: trimmed,
    };
  }

  // 3. Direct HTML5 video link (mp4, webm, mov, ogg, blob, or common cdn video)
  const isDirect =
    /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(trimmed) ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:video');
  if (isDirect) {
    return {
      type: 'direct',
      src: trimmed,
      rawUrl: trimmed,
    };
  }

  // Fallback: If it's a URL starting with http/https, try direct player or preview
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If it contains "drive.google.com", ensure we construct preview
    if (trimmed.includes('drive.google.com')) {
      const parts = trimmed.split('/');
      const dIndex = parts.indexOf('d');
      if (dIndex !== -1 && parts[dIndex + 1]) {
        const id = parts[dIndex + 1];
        return {
          type: 'drive',
          embedUrl: `https://drive.google.com/file/d/${id}/preview`,
          fileId: id,
          rawUrl: trimmed,
        };
      }
    }

    return {
      type: 'direct',
      src: trimmed,
      rawUrl: trimmed,
    };
  }

  return { type: 'none' };
}
