import { CreatorProfile, resolveGoogleDriveImage } from '../data/creatorData';

export type FaviconShape = 'circle' | 'rounded' | 'square';

export interface FaviconCropConfig {
  zoom: number;
  panX: number;
  panY: number;
  shape: FaviconShape;
}

/**
 * Converts an emoji string into a crisp SVG Data URL for browser tab favicons.
 */
export function buildEmojiSvgDataUrl(emoji: string): string {
  const cleanEmoji = (emoji || '✨').trim() || '✨';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50%" y="54%" dominant-baseline="central" text-anchor="middle" font-size="82">${cleanEmoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Resolves the active favicon URL/Data URI for a given creator profile.
 */
export function resolveActiveFaviconHref(creator: CreatorProfile): string {
  const mode = creator.faviconMode || 'emoji';

  if (mode === 'emoji') {
    return buildEmojiSvgDataUrl(creator.faviconEmoji || '✨');
  }

  if (mode === 'avatar') {
    const resolvedAvatar = resolveGoogleDriveImage(creator.avatarUrl);
    return resolvedAvatar || '/assets/juijui/avatar-main.jpg';
  }

  if (mode === 'custom') {
    const rawCustom = (creator.faviconUrl || '').trim();
    if (rawCustom) {
      if (rawCustom.startsWith('data:image/')) {
        return rawCustom;
      }
      return resolveGoogleDriveImage(rawCustom);
    }
    return buildEmojiSvgDataUrl(creator.faviconEmoji || '✨');
  }

  return buildEmojiSvgDataUrl('✨');
}

/**
 * Resolves the active browser tab title for a given creator profile.
 */
export function resolveActiveBrowserTitle(creator: CreatorProfile): string {
  const customTitle = (creator.browserTabTitle || '').trim();
  if (customTitle) {
    return customTitle;
  }
  return `${creator.nameEn} Media Kit 2026 — Interactive Creator Rate Card`;
}

/**
 * Synchronizes document.title and <link rel="icon"> tags in the browser's <head>.
 */
export function applyBrowserTabMeta(creator: CreatorProfile): void {
  if (typeof document === 'undefined') return;

  const title = resolveActiveBrowserTitle(creator);
  if (document.title !== title) {
    document.title = title;
  }

  const href = resolveActiveFaviconHref(creator);
  const isSvg = href.startsWith('data:image/svg+xml') || href.endsWith('.svg');

  const updateOrCreateLink = (id: string, rel: string) => {
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.type = isSvg ? 'image/svg+xml' : 'image/png';
    if (link.href !== href) {
      link.href = href;
    }
  };

  updateOrCreateLink('dynamic-favicon', 'icon');
  updateOrCreateLink('dynamic-shortcut-icon', 'shortcut icon');
  updateOrCreateLink('dynamic-apple-icon', 'apple-touch-icon');
}

/**
 * Draws a cropped & masked favicon onto a canvas (or returns a PNG Data URL).
 * Handles non-square images (16:9, 9:16, etc.) smoothly using cover-fit + zoom + panX/panY.
 */
export function drawCroppedFaviconToCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  config: FaviconCropConfig,
  targetSize = 64
): void {
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, targetSize, targetSize);
  ctx.save();

  // Apply shape clipping path
  ctx.beginPath();
  if (config.shape === 'circle') {
    ctx.arc(targetSize / 2, targetSize / 2, targetSize / 2, 0, Math.PI * 2);
  } else if (config.shape === 'rounded') {
    const r = Math.round(targetSize * 0.24);
    ctx.moveTo(r, 0);
    ctx.lineTo(targetSize - r, 0);
    ctx.quadraticCurveTo(targetSize, 0, targetSize, r);
    ctx.lineTo(targetSize, targetSize - r);
    ctx.quadraticCurveTo(targetSize, targetSize, targetSize - r, targetSize);
    ctx.lineTo(r, targetSize);
    ctx.quadraticCurveTo(0, targetSize, 0, targetSize - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
  } else {
    ctx.rect(0, 0, targetSize, targetSize);
  }
  ctx.closePath();
  ctx.clip();

  const imgW = img.naturalWidth || img.width || 1;
  const imgH = img.naturalHeight || img.height || 1;

  // Base scale to cover the square targetSize
  const baseScale = Math.max(targetSize / imgW, targetSize / imgH);
  const finalScale = baseScale * Math.max(1, config.zoom);

  const drawW = imgW * finalScale;
  const drawH = imgH * finalScale;

  // Maximum pan allowance so user can pan across the entire overflowed region
  // plus extra freedom if zoomed in
  const maxOffsetX = Math.max((drawW - targetSize) / 2, targetSize * 0.35);
  const maxOffsetY = Math.max((drawH - targetSize) / 2, targetSize * 0.35);

  const offsetX = (config.panX / 100) * maxOffsetX;
  const offsetY = (config.panY / 100) * maxOffsetY;

  const dx = (targetSize - drawW) / 2 + offsetX;
  const dy = (targetSize - drawH) / 2 + offsetY;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, dx, dy, drawW, drawH);

  ctx.restore();
}

/**
 * Generates a 96x96 crisp PNG Data URL from an HTMLImageElement and crop configuration.
 */
export function exportCroppedFaviconDataUrl(
  img: HTMLImageElement,
  config: FaviconCropConfig,
  outputSize = 96
): string {
  const offscreen = document.createElement('canvas');
  drawCroppedFaviconToCanvas(offscreen, img, config, outputSize);
  return offscreen.toDataURL('image/png');
}
