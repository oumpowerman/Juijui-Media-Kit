import type { CreatorProfile } from './types';
import { INITIAL_PLATFORMS, INITIAL_DEMOGRAPHICS } from './datasets/channelOverview';
import { INITIAL_VIRAL_WORKS } from './datasets/viralWorks';
import { INITIAL_COMMENT_PROOFS } from './datasets/commentProofs';
import {
  INITIAL_PACKAGES,
  INITIAL_FREE_PERKS,
  INITIAL_ADD_ONS,
  INITIAL_CUSTOM_COLLAB_NOTES,
} from './datasets/ratePackages';
import {
  INITIAL_BRAND_SHOWCASE_CONFIG,
  INITIAL_BRAND_COLLABORATIONS,
} from './datasets/brandCollaborations';

export const INITIAL_CREATORS: CreatorProfile[] = [
  {
    id: 'juijui-main',
    nameTh: 'จุ๊ยจุ๊ย',
    nameEn: 'JUIJUI',
    tierLabel: 'Macro Creator · 979K+ Followers',
    roleTitle: 'ครีเอเตอร์สายคอมเมดี้และไลฟ์สไตล์',
    categories: ['COMEDY', 'LIFESTYLE', 'FRIENDSHIP'],
    quote: 'ครีเอเตอร์เพื่อนรักและไลฟ์สไตล์ ที่เปลี่ยนโมเมนต์ธรรมดาให้เป็นคอนเทนต์ที่คนดูสนุก',
    bioDescription:
      'คอนเทนต์สนุก เข้าถึงง่าย เคมีเป็นธรรมชาติ เล่าเรื่องประจำวัน สร้างรอยยิ้มและแรงบันดาลใจ ทุกช่วงเวลาจริง ทุกความสัมพันธ์จริง ทุกความสนุกจริง',
    avatarUrl: '/assets/juijui/avatar-main.jpg',
    portraitUrl: '/assets/juijui/duo-portrait.jpg',
    pdfMediaKitUrl: '/assets/aistudio/_Media_kit_PR_BIGBAG_8383827f.pdf',
    faviconMode: 'emoji',
    faviconEmoji: '✨',
    faviconUrl: '',
    faviconShape: 'rounded',
    browserTabTitle: 'JUIJUI Media Kit 2026 — Interactive Creator Rate Card',
    updatedLabel: 'อัปเดตข้อมูล พฤษภาคม 2569 · ข้อมูลยอดรวมย้อนหลัง 60 วัน',
    defaultStatsTimeframe: '60d',
    overviewTimeframes: {
      '28d': {
        totalViews: '13.45M',
        totalEr: '5.32%',
        avgViewsPerContent: '295K',
        monthlyReach: '1.75M',
        monthlyLikes: '726.9K',
        periodBadgeLabel: 'สถิติย้อนหลัง 28 วันล่าสุด',
      },
      '60d': {
        totalViews: '28M',
        totalEr: '5.24%',
        avgViewsPerContent: '289K',
        monthlyReach: '1.75M',
        monthlyLikes: '23.2K',
        periodBadgeLabel: '28 วันล่าสุด · วิว 60 วัน',
      },
      lifetime: {
        totalViews: '367.7M',
        totalEr: '5.92%',
        avgViewsPerContent: '340K',
        monthlyReach: '24.5M+',
        monthlyLikes: '23.15M',
        periodBadgeLabel: 'สถิติสะสมทั้งหมด (Lifetime)',
      },
    },
    overview: {
      totalFollowers: '979.1K+',
      totalViews60d: '28M',
      totalEr: '5.24%',
      avgViewsPerContent: '289K',
      monthlyReach: '1.75M',
      monthlyLikes: '23.2K',
    },
    strengths: [
      {
        title: 'เคมีเป็นธรรมชาติ (Natural Chemistry)',
        subtitle: 'GEN Z AUDIENCE & FRIENDSHIP',
        description: 'สร้างความสัมพันธ์ใกล้ชิดกับผู้ชมเหมือนเพื่อนสนิท ทำให้การป้ายยาสินค้าดูจริงใจ ไม่ขายตรงจนอึดอัด',
      },
      {
        title: 'ดึงดูดใน 3 วิแรก (Strong 3s Hook)',
        subtitle: 'COMEDY CONTENT RETENTION',
        description: 'เปิดคลิปด้วยจังหวะคอมเมดี้และ Hook ที่น่าสนใจ ทำให้ผู้ชมหยุดนิ้วดูต่อจนจบคลิปและจดจำแบรนด์ได้แม่นยำ',
      },
      {
        title: 'คอนเทนต์ไวรัล - ยอดแชร์สูง (High Shareability)',
        subtitle: 'ORGANIC VIRAL REACH',
        description: 'เข้าถึงกลุ่มผู้ชมวงกว้างด้วยอัตราการแชร์ต่อและแท็กเพื่อนในคอมเมนต์สูงเป็นพิเศษ (TikTok ER 8.01%)',
      },
    ],
    moodAndTone: ['สนุก', 'เข้าถึงง่าย', 'ไวรัล', 'challenge', 'Lifestyle'],
    supportedFormats: [
      'วิดีโอ TikTok',
      'Reels Instagram',
      'คอนเทนต์สไตล์ UGC',
      'เก็บบรรยากาศงานอีเวนต์',
      'การเล่าเรื่องของแบรนด์',
      'ไลฟ์สไตล์การท่องเที่ยว',
    ],
    platforms: INITIAL_PLATFORMS,
    demographics: INITIAL_DEMOGRAPHICS,
    viralWorks: INITIAL_VIRAL_WORKS,
    commentProofs: INITIAL_COMMENT_PROOFS,
    packages: INITIAL_PACKAGES,
    freePerks: INITIAL_FREE_PERKS,
    addOns: INITIAL_ADD_ONS,
    customCollabNotes: INITIAL_CUSTOM_COLLAB_NOTES,
    brandShowcaseConfig: INITIAL_BRAND_SHOWCASE_CONFIG,
    brandCollaborations: INITIAL_BRAND_COLLABORATIONS,
    contact: {
      email: 'jengwaachanel@gmail.com',
      lineId: '@JUIJUI.j',
      lineUrl: 'https://line.me/R/ti/p/@JUIJUI.j',
      tiktokHandle: '@JUIJUI.j',
      instagramHandle: '@JUIJUI.j',
      facebookHandle: '@JUIJUI.j',
    },
  },
];
