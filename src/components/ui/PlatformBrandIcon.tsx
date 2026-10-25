import React from 'react';

interface PlatformBrandIconProps {
  platform: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  withLabel?: boolean;
  labelText?: string;
  className?: string;
}

export const PlatformBrandIcon: React.FC<PlatformBrandIconProps> = ({
  platform,
  size = 'md',
  withLabel = false,
  labelText,
  className = '',
}) => {
  const norm = platform.toLowerCase();
  const sizeClasses =
    size === 'xs'
      ? 'w-5 h-5 rounded-md'
      : size === 'sm'
      ? 'w-6 h-6 rounded-lg'
      : size === 'lg'
      ? 'w-11 h-11 rounded-xl'
      : 'w-8 h-8 rounded-xl';

  const iconSize =
    size === 'xs'
      ? 'w-3 h-3'
      : size === 'sm'
      ? 'w-3.5 h-3.5'
      : size === 'lg'
      ? 'w-5 h-5'
      : 'w-4 h-4';

  let badgeBg = 'bg-[#FF0000] text-white';
  let defaultLabel = 'YouTube';
  let svgIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );

  if (norm.includes('tiktok')) {
    badgeBg = 'bg-slate-950 text-white border border-white/15';
    defaultLabel = 'TikTok';
    svgIcon = (
      <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1Z" />
      </svg>
    );
  } else if (norm.includes('facebook') || norm.includes('fb')) {
    badgeBg = 'bg-[#1877F2] text-white';
    defaultLabel = 'Facebook';
    svgIcon = (
      <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95Z" />
      </svg>
    );
  } else if (norm.includes('instagram') || norm.includes('ig') || norm.includes('reels')) {
    badgeBg = 'bg-linear-to-tr from-amber-500 via-pink-500 to-purple-600 text-white';
    defaultLabel = 'IG';
    svgIcon = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconSize}
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    );
  }

  const iconBox = (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${badgeBg} ${sizeClasses} ${
        !withLabel ? className : ''
      }`}
      title={labelText || defaultLabel}
    >
      {svgIcon}
    </span>
  );

  if (!withLabel) return iconBox;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-800 text-[11px] font-semibold whitespace-nowrap shrink-0 ${className}`}
    >
      {iconBox}
      <span>{labelText || defaultLabel}</span>
    </span>
  );
};

interface PlatformBadgeGroupProps {
  platformsText: string;
  size?: 'xs' | 'sm';
  showLabels?: boolean;
  wrap?: boolean;
  className?: string;
}

/**
 * Automatically detects mentions of TikTok, Instagram/IG, Facebook/FB, and YouTube
 * in any string and renders their colorful brand icons side by side.
 */
export const PlatformBadgeGroup: React.FC<PlatformBadgeGroupProps> = ({
  platformsText,
  size = 'xs',
  showLabels = false,
  wrap = false,
  className = '',
}) => {
  const lower = platformsText.toLowerCase();
  const detected: { id: string; label: string }[] = [];

  if (lower.includes('tiktok') || lower.includes('ทุกช่องทาง') || lower.includes('all')) {
    detected.push({ id: 'tiktok', label: 'TikTok' });
  }
  if (
    lower.includes('ig') ||
    lower.includes('instagram') ||
    lower.includes('reels') ||
    lower.includes('ทุกช่องทาง') ||
    lower.includes('all')
  ) {
    detected.push({ id: 'instagram', label: 'IG' });
  }
  if (
    lower.includes('fb') ||
    lower.includes('facebook') ||
    lower.includes('ทุกช่องทาง') ||
    lower.includes('all')
  ) {
    detected.push({ id: 'facebook', label: 'FB' });
  }
  if (
    lower.includes('youtube') ||
    lower.includes('yt') ||
    lower.includes('shorts') ||
    lower.includes('ทุกช่องทาง') ||
    lower.includes('all')
  ) {
    detected.push({ id: 'youtube', label: 'YouTube' });
  }

  if (detected.length === 0) {
    detected.push(
      { id: 'tiktok', label: 'TikTok' },
      { id: 'instagram', label: 'IG' },
      { id: 'facebook', label: 'FB' },
      { id: 'youtube', label: 'YouTube' }
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${
        wrap ? 'flex-wrap' : 'flex-nowrap shrink-0'
      } ${className}`}
    >
      {detected.map((p) => (
        <PlatformBrandIcon
          key={p.id}
          platform={p.id}
          size={size}
          withLabel={showLabels}
          labelText={p.label}
        />
      ))}
    </span>
  );
};
