// iOS Signature Spring Physics for Tab and Cards
export const IOS_TAB_SPRING = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 30,
  mass: 0.7,
};

export const IOS_CARD_SPRING = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 24,
  mass: 0.8,
};

export interface PlatformTheme {
  glowGradient: string;
  activeBorder: string;
  activeRing: string;
  badgeBg: string;
  badgeText: string;
  perfHighlight: string;
  growthTag: string;
}

// Distinct platform-specific multi-tone ambient iOS glow and accent metadata
export const PLATFORM_THEMES: Record<string, PlatformTheme> = {
  tiktok: {
    glowGradient: 'from-cyan-400/60 via-fuchsia-500/55 to-pink-500/65',
    activeBorder: 'border-fuchsia-500/80',
    activeRing: 'ring-fuchsia-500/30',
    badgeBg: 'bg-slate-950 text-white',
    badgeText: 'text-slate-900',
    perfHighlight: 'ER สูงสุด 8.01% (ไวรัลอันดับ 1)',
    growthTag: '🔥 ไวรัลสูงสุด',
  },
  facebook: {
    glowGradient: 'from-blue-600/55 via-indigo-500/45 to-sky-400/55',
    activeBorder: 'border-blue-500/80',
    activeRing: 'ring-blue-500/30',
    badgeBg: 'bg-blue-600 text-white',
    badgeText: 'text-blue-900',
    perfHighlight: 'ยอดวิว 9.6M+ ฐานแฟนเหนียวแน่น',
    growthTag: '📈 ยอดแชร์สูง',
  },
  instagram: {
    glowGradient: 'from-amber-400/55 via-rose-500/55 to-purple-600/55',
    activeBorder: 'border-rose-400/80',
    activeRing: 'ring-rose-400/30',
    badgeBg: 'bg-linear-to-r from-rose-500 to-purple-600 text-white',
    badgeText: 'text-rose-900',
    perfHighlight: 'ER 6.76% มู้ดพรีเมียม สไตล์ UGC',
    growthTag: '✨ คอนเทนต์พรีเมียม',
  },
  youtube: {
    glowGradient: 'from-red-600/60 via-rose-600/50 to-amber-500/55',
    activeBorder: 'border-red-500/80',
    activeRing: 'ring-red-500/30',
    badgeBg: 'bg-red-600 text-white',
    badgeText: 'text-red-900',
    perfHighlight: 'ยอดชม 4.3M คลิปแนวนอน 16:9',
    growthTag: '🎬 วิดีโอยาว Full HD',
  },
};
