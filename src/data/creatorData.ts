export interface PlatformStat {
  id: 'tiktok' | 'facebook' | 'instagram' | 'youtube';
  name: string;
  handle: string;
  url: string;
  followers: string;
  followersNum: number;
  views: string;
  likes: string;
  comments: string;
  shares: string;
  er: string;
  erNum: number;
  accentColor: string;
}

export interface ViralWorkItem {
  id: string;
  title: string;
  subtitle: string;
  views: string;
  likes: string;
  commentsCount: string;
  sharesCount: string;
  platform: 'TikTok' | 'Instagram Reels' | 'YouTube Shorts' | 'YouTube' | 'Facebook';
  orientation?: 'vertical' | 'horizontal';
  duration?: string;
  isPinned?: boolean;
  isFeatured?: boolean;
  thumbnailUrl: string;
  driveImageUrl?: string;
  tiktokUrl: string;
  category: string;
  topComments: {
    user: string;
    text: string;
    likes: string;
  }[];
}

export interface BrandReplyItem {
  author: string;
  content: string;
  time: string;
  readStatus?: boolean;
  avatarUrl?: string;
}

export interface CommentProofItem {
  id: string;
  authorName: string;
  authorHandle: string;
  authorType: 'แฟนคลับ / ผู้ชม' | 'ลูกค้าแบรนด์ / เอเจนซี่';
  platform: string;
  content: string;
  likesCount: string;
  clipReference: string;
  clipUrl?: string;
  screenshotUrl?: string;
  dateLabel: string;
  userAvatarUrl?: string;
  commentTime?: string;
  replyCount?: number;
  isPinned?: boolean;
  isCreatorLiked?: boolean;
  brandReply?: BrandReplyItem;
}

export interface RatePackage {
  id: string;
  name: string;
  badgeText: string;
  tagline: string;
  price: number;
  isPopular?: boolean;
  videoCount: string;
  maxDuration: string;
  platforms: string;
  totalPosts: string;
  bestFor: string;
  costEfficiency: string;
  features: string[];
}

export interface AddOnItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface FreeIncludedItem {
  id: string;
  name: string;
  priceLabel: string;
}

export interface BrandSampleClip {
  id: string;
  title: string;
  platform: 'TikTok' | 'Instagram Reels' | 'YouTube' | 'Facebook' | 'YouTube Shorts';
  views: string;
  url: string;
  formatTag: string;
  duration?: string;
}

export type BrandCategoryType =
  | 'Food & Beverage'
  | 'Tech, Telecom & Apps'
  | 'Beauty & Personal Care'
  | 'Retail, Home & Lifestyle'
  | 'Gaming & Entertainment';

export interface BrandCollaborationItem {
  id: string;
  brandName: string;
  brandNameTh?: string;
  category: BrandCategoryType;
  logoUrl?: string;
  brandColor?: string;
  campaignCount: number;
  isRepeatPartner: boolean;
  isFeatured?: boolean;
  totalViews: string;
  avgEngagement: string;
  latestPeriod: string;
  videoStyles: string[];
  deliverablesSummary: string;
  campaignHighlight: string;
  clientQuote?: string;
  clientRole?: string;
  sampleClips: BrandSampleClip[];
}

export interface BrandShowcaseConfig {
  badgeText: string;
  sectionTitle: string;
  sectionSubtitle: string;
  totalBrandsStat: string;
  repeatRateStat: string;
  sponsoredViewsStat: string;
  referenceSlideUrl?: string;
}

export interface CreatorProfile {
  id: string;
  nameTh: string;
  nameEn: string;
  tierLabel: string;
  roleTitle: string;
  categories: string[];
  quote: string;
  bioDescription: string;
  avatarUrl: string;
  portraitUrl: string;
  pdfMediaKitUrl: string;
  updatedLabel: string;
  overview: {
    totalFollowers: string;
    totalViews60d: string;
    totalEr: string;
    avgViewsPerContent: string;
    monthlyReach: string;
    monthlyLikes: string;
  };
  strengths: {
    title: string;
    subtitle: string;
    description: string;
  }[];
  moodAndTone: string[];
  supportedFormats: string[];
  platforms: PlatformStat[];
  demographics: {
    ageGroups: { range: string; percent: number }[];
    gender: { label: string; percent: number }[];
    locations: { name: string; percent: number }[];
  };
  viralWorks: ViralWorkItem[];
  commentProofs: CommentProofItem[];
  packages: RatePackage[];
  freePerks: FreeIncludedItem[];
  addOns: AddOnItem[];
  customCollabNotes: {
    title: string;
    description: string;
  }[];
  brandShowcaseConfig?: BrandShowcaseConfig;
  brandCollaborations?: BrandCollaborationItem[];
  contact: {
    email: string;
    lineId: string;
    lineUrl: string;
    tiktokHandle: string;
    instagramHandle: string;
    facebookHandle: string;
  };
}

export interface BookingRecord {
  id: string;
  quoteNumber: string;
  creatorId: string;
  creatorName: string;
  packageId: string;
  packageName: string;
  basePrice: number;
  selectedAddOns: { id: string; name: string; price: number }[];
  collaborationType: 'standard_package' | 'budget_friendly' | 'barter_trade';
  customBudgetAmount?: string;
  totalPrice: number;
  brandName: string;
  contactName: string;
  contactChannel: string;
  productDetails: string;
  targetCampaignDate: string;
  referenceLinks?: string;
  createdAt: string;
  status: 'รอดำเนินการ' | 'ยืนยันคิวงานแล้ว' | 'ส่งใบเสนอราคาแล้ว';
}

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
    updatedLabel: 'อัปเดตข้อมูล พฤษภาคม 2569 · ข้อมูลยอดรวมย้อนหลัง 60 วัน',
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
    platforms: [
      {
        id: 'tiktok',
        name: 'TikTok',
        handle: '@JUIJUI.j',
        url: 'https://www.tiktok.com/@juijui.j',
        followers: '660.2K',
        followersNum: 660200,
        views: '12M',
        likes: '875.7K',
        comments: '3.8K',
        shares: '84K',
        er: '8.01%',
        erNum: 8.01,
        accentColor: '#111827',
      },
      {
        id: 'facebook',
        name: 'Facebook',
        handle: '@JUIJUI.j',
        url: 'https://www.facebook.com/Juijuij',
        followers: '130K',
        followersNum: 130000,
        views: '9.6M',
        likes: '409.4K',
        comments: '1.9K',
        shares: '1.4K',
        er: '4.35%',
        erNum: 4.35,
        accentColor: '#2563EB',
      },
      {
        id: 'instagram',
        name: 'Instagram',
        handle: '@JUIJUI.j',
        url: 'https://www.instagram.com/juijui.j',
        followers: '31.9K',
        followersNum: 31900,
        views: '2.1M',
        likes: '136K',
        comments: '424',
        shares: '7.4K',
        er: '6.76%',
        erNum: 6.76,
        accentColor: '#DB2777',
      },
      {
        id: 'youtube',
        name: 'YouTube',
        handle: '@JUIJUI.j',
        url: 'https://www.youtube.com/@JUIJUI',
        followers: '157K',
        followersNum: 157000,
        views: '4.3M',
        likes: '74.2K',
        comments: '600',
        shares: '1.2K',
        er: '1.86%',
        erNum: 1.86,
        accentColor: '#DC2626',
      },
    ],
    demographics: {
      ageGroups: [
        { range: '18 – 24 ปี', percent: 32 },
        { range: '25 – 34 ปี', percent: 44 },
        { range: '35 – 54 ปี', percent: 16 },
        { range: '55+ ปี', percent: 8 },
      ],
      gender: [
        { label: 'ชาย (Male)', percent: 64.3 },
        { label: 'หญิง (Female)', percent: 35.7 },
      ],
      locations: [
        { name: 'กรุงเทพมหานคร (Bangkok)', percent: 80.9 },
        { name: 'สุราษฎร์ธานี (Surat Thani)', percent: 11.5 },
        { name: 'เชียงใหม่ (Chiang Mai)', percent: 7.6 },
      ],
    },
    viralWorks: [
      {
        id: 'viral-sunset-pattaya',
        title: 'Sunset in พัทยา — ทริปเที่ยวทะเลกับเพื่อนรัก',
        subtitle: 'ไลฟ์สไตล์ท่องเที่ยว · เคมีธรรมชาติ · ยอดแชร์ถล่มทลาย',
        views: '3.2M',
        likes: '342K',
        commentsCount: '1.8K',
        sharesCount: '38.5K',
        platform: 'TikTok',
        orientation: 'vertical',
        duration: '01:15',
        isPinned: true,
        isFeatured: true,
        thumbnailUrl: '/assets/juijui/viral-2.jpg',
        tiktokUrl: 'https://www.tiktok.com/@juijui.j',
        category: 'Lifestyle & Travel',
        topComments: [
          { user: '@ploy_chompoo', text: 'ดูเพลินมาก เคมีสองคนนี้คือธรรมชาติสุดๆ อยากไปตามรอยที่พัทยาเลย!', likes: '4.2K' },
          { user: '@bank_krub', text: 'ตัดต่อจังหวะโบ๊ะบ๊ะมาก ดูจบโดยไม่รู้ตัว 5555', likes: '1.9K' },
        ],
      },
      {
        id: 'viral-yt-pattaya-vlog-16x9',
        title: '[VLOG แนวนอน 16:9] 1 วันเต็มในพัทยากับเพื่อนซี้ — ตะลุยคาเฟ่ลับ & ชาเลนจ์ริมทะเล',
        subtitle: 'คลิปแนวนอน Full HD · เล่าเรื่องสนุก เหมาะกับงาน Tie-in สินค้าและรีวิวสถานที่แบบละเอียด',
        views: '1.45M',
        likes: '128K',
        commentsCount: '2.1K',
        sharesCount: '14.8K',
        platform: 'YouTube',
        orientation: 'horizontal',
        duration: '14:28',
        isPinned: true,
        isFeatured: true,
        thumbnailUrl: '/assets/juijui/duo-portrait.jpg',
        tiktokUrl: 'https://www.youtube.com',
        category: 'Lifestyle & Travel',
        topComments: [
          { user: '@peary_vlog', text: 'ดูแบบแนวนอนเต็มตาภาพสวยมากกก มุกตลกไหลลื่นทั้งคลิป ไม่กดข้ามโฆษณาเลย!', likes: '3.4K' },
        ],
      },
      {
        id: 'viral-1m-hearts',
        title: 'ถ้าครบหนึ่งล้านใจ เราจะเป็นแฟนกัน (Pinned Viral)',
        subtitle: 'ไวรัลชาเลนจ์เพื่อนรัก · คอมเมนต์เชียร์ทะลุพัน',
        views: '1.2M',
        likes: '198K',
        commentsCount: '2.4K',
        sharesCount: '21.2K',
        platform: 'TikTok',
        orientation: 'vertical',
        duration: '00:58',
        isPinned: true,
        isFeatured: true,
        thumbnailUrl: '/assets/juijui/viral-1.jpg',
        tiktokUrl: 'https://www.tiktok.com/@juijui.j',
        category: 'Comedy & Challenge',
        topComments: [
          { user: '@mint_naka', text: 'กดใจให้แล้วนะ! รอวันเปิดตัวเลยคู่นี้ น่ารักไม่ไหว', likes: '8.7K' },
          { user: '@arm_story', text: 'แท็กเพื่อนมาช่วยกันกดใจด่วนๆ 555', likes: '3.1K' },
        ],
      },
      {
        id: 'viral-fb-roadtrip-16x9',
        title: '[คลิปแนวนอน 16:9] Road Trip ป้ายยาไอเทมเด็ดตลอดทริป — ขับรถเที่ยวฉบับจุ๊ยจุ๊ย',
        subtitle: 'วิดีโอแนวนอนบน Facebook & YouTube · ยอดแชร์และแท็กเพื่อนในคอมเมนต์สูงมาก',
        views: '980K',
        likes: '89.5K',
        commentsCount: '1.5K',
        sharesCount: '19.2K',
        platform: 'Facebook',
        orientation: 'horizontal',
        duration: '08:45',
        isPinned: true,
        isFeatured: true,
        thumbnailUrl: '/assets/juijui/avatar-main.jpg',
        tiktokUrl: 'https://www.facebook.com',
        category: 'Lifestyle & Review',
        topComments: [
          { user: '@ton_kittisak', text: 'ป้ายยาของในรถเนียนมาก ดูจบกดสั่งตามไป 2 อย่างเลยครับ', likes: '2.3K' },
        ],
      },
      {
        id: 'viral-confession',
        title: 'ฟิวสารภาพรัก "กูชอบมึง" — โมเมนต์เพื่อนสนิท',
        subtitle: 'คอนเทนต์ไวรัลเรียกยอดแชร์ · Hook ดึงดูดตั้งแต่ 3 วิแรก',
        views: '865K',
        likes: '112K',
        commentsCount: '1.1K',
        sharesCount: '16.4K',
        platform: 'TikTok',
        orientation: 'vertical',
        duration: '01:05',
        isPinned: false,
        isFeatured: true,
        thumbnailUrl: '/assets/juijui/viral-3.jpg',
        tiktokUrl: 'https://www.tiktok.com/@juijui.j',
        category: 'Comedy & Couple Vibe',
        topComments: [
          { user: '@kwan_jira', text: 'เขินแทนเลยยย จังหวะหันมามองตาคือได้มาก', likes: '2.8K' },
        ],
      },
      {
        id: 'viral-yt-qna-challenge-16x9',
        title: '[คลิปแนวนอน 16:9] Q&A ล้วงความลับเพื่อนรัก + เกมทายใจสุดฮา (Special EP)',
        subtitle: 'รายการแนวนอนโปรดักชันจัดเต็ม · เหมาะกับแบรนด์ที่ต้องการวางสินค้าหน้าเซ็ตตลอดรายการ',
        views: '720K',
        likes: '64.8K',
        commentsCount: '940',
        sharesCount: '8.4K',
        platform: 'YouTube',
        orientation: 'horizontal',
        duration: '16:10',
        isPinned: false,
        isFeatured: true,
        thumbnailUrl: '/assets/juijui/clip-4.jpg',
        tiktokUrl: 'https://www.youtube.com',
        category: 'Comedy & Challenge',
        topComments: [
          { user: '@nook_nick', text: 'ขำท้องแข็งทั้งคลิป เคมีรับส่งมุกกันไวมาก อยากให้ทำแนวนอนออกมาเยอะๆ เลย', likes: '1.7K' },
        ],
      },
      {
        id: 'clip-behind-scene',
        title: 'เบื้องหลัง ฟิวสารภาพรัก — กว่าจะได้แต่ละเทค',
        subtitle: 'เบื้องหลังความฮาและเป็นกันเอง',
        views: '641.7K',
        likes: '68.4K',
        commentsCount: '620',
        sharesCount: '5.9K',
        platform: 'Facebook',
        orientation: 'vertical',
        duration: '01:20',
        thumbnailUrl: '/assets/juijui/clip-1.jpg',
        tiktokUrl: 'https://www.tiktok.com/@juijui.j',
        category: 'Behind The Scenes',
        topComments: [
          { user: '@non_th', text: 'เบื้องหลังฮากว่าคลิปหลักอีก หลุดขำกันทั้งกอง', likes: '1.4K' },
        ],
      },
      {
        id: 'clip-photo-pose',
        title: 'ถ่ายรูปนี้ยังไง? — ทริคถ่ายรูปคู่เพื่อนให้ปัง',
        subtitle: 'ไอเดียถ่ายรูปไลฟ์สไตล์ · เหมาะกับแบรนด์กล้อง/แฟชั่น/คาเฟ่',
        views: '560.7K',
        likes: '59.2K',
        commentsCount: '480',
        sharesCount: '9.1K',
        platform: 'Instagram Reels',
        orientation: 'vertical',
        duration: '00:52',
        thumbnailUrl: '/assets/juijui/clip-2.jpg',
        tiktokUrl: 'https://www.tiktok.com/@juijui.j',
        category: 'Lifestyle & How-To',
        topComments: [
          { user: '@fah_sai', text: 'เซฟเก็บไว้ทำตามกับเพื่อนเสาร์นี้เลย มุมกล้องสวยมาก', likes: '2.1K' },
        ],
      },
      {
        id: 'clip-latest-couple',
        title: 'คลิปล่าสุดที่ทำพวกพี่เป็นแฟนกัน',
        subtitle: 'สตอรี่เล่าเรื่องสนุก · ผู้ชมติดตามต่อเนื่องเป็นซีรีส์',
        views: '191.6K',
        likes: '24.5K',
        commentsCount: '310',
        sharesCount: '2.2K',
        platform: 'YouTube Shorts',
        orientation: 'vertical',
        duration: '00:59',
        thumbnailUrl: '/assets/juijui/clip-4.jpg',
        tiktokUrl: 'https://www.tiktok.com/@juijui.j',
        category: 'Storytelling',
        topComments: [
          { user: '@beam_kp', text: 'ตามดูทุก EP เลยคู่นี้ ลงคลิปเมื่อไหร่ต้องแวะมาดูตลอด', likes: '890' },
        ],
      },
      {
        id: 'clip-give-in',
        title: 'ฉันก็คงต้องยอม — โมเมนต์น่ารักในรถ',
        subtitle: 'คอนเทนต์สั้นสไตล์ UGC เข้าถึงง่าย',
        views: '156.9K',
        likes: '19.8K',
        commentsCount: '215',
        sharesCount: '1.4K',
        platform: 'Instagram Reels',
        orientation: 'vertical',
        duration: '00:45',
        thumbnailUrl: '/assets/juijui/clip-5.jpg',
        tiktokUrl: 'https://www.tiktok.com/@juijui.j',
        category: 'Lifestyle & UGC',
        topComments: [],
      },
      {
        id: 'clip-cafe-flower',
        title: 'เดทคาเฟ่และช่อดอกไม้ — Lifestyle Vlog',
        subtitle: 'มู้ดอบอุ่น ภาพสวย เหมาะกับงานรีวิวสถานที่และสินค้าไลฟ์สไตล์',
        views: '103.6K',
        likes: '14.2K',
        commentsCount: '180',
        sharesCount: '1.1K',
        platform: 'Facebook',
        orientation: 'vertical',
        duration: '01:10',
        thumbnailUrl: '/assets/juijui/clip-6.jpg',
        tiktokUrl: 'https://www.tiktok.com/@juijui.j',
        category: 'Lifestyle & Review',
        topComments: [],
      },
      {
        id: 'clip-1min-bf',
        title: 'เป็นแฟนกัน 1 นาที — Challenge คอมเมดี้',
        subtitle: 'จังหวะตลก ตัดต่อไว คนดูซ้ำหลายรอบ',
        views: '79.9K',
        likes: '11.4K',
        commentsCount: '140',
        sharesCount: '980',
        platform: 'TikTok',
        orientation: 'vertical',
        duration: '01:00',
        thumbnailUrl: '/assets/juijui/clip-3.jpg',
        tiktokUrl: 'https://www.tiktok.com/@juijui.j',
        category: 'Comedy & Challenge',
        topComments: [],
      },
    ],
    commentProofs: [
      {
        id: 'cm-1',
        authorName: 'คุณแพรว — Senior Campaign Manager',
        authorHandle: 'Digital Media Agency',
        authorType: 'ลูกค้าแบรนด์ / เอเจนซี่',
        platform: 'LINE Official / Direct Chat',
        content:
          'น้องจุ๊ยจุ๊ยตีโจทย์บรีฟแตกมากค่ะ ขายของได้เนียนไปกับมุกตลกของช่อง ลูกค้าชมว่าดูจบแล้วจำชื่อสินค้าได้แม่น ยอดคลิกตะกร้าและ Engagement สูงเกิน KPI ที่ตั้งไว้มาก 👏✨',
        likesCount: 'Verified Partner',
        clipReference: 'แคมเปญสินค้าอุปโภคบริโภค & ไลฟ์สไตล์ (Standard Package)',
        clipUrl: 'https://www.tiktok.com/@juijui.j',
        dateLabel: 'เมษายน 2569',
        commentTime: '14:28 น.',
        brandReply: {
          author: 'จุ๊ยจุ๊ย (Creator)',
          content: 'ขอบพระคุณคุณแพรวและทีมมากครับ ยินดีที่ได้ร่วมงานและสร้างยอดวิวปังๆ ให้แบรนด์ครับ ดีใจที่ลูกค้าแฮปปี้กับยอดขายครับผม 💚🙏',
          time: '14:32 น.',
          readStatus: true,
          avatarUrl: '/assets/juijui/avatar-main.jpg',
        },
      },
      {
        id: 'cm-2',
        authorName: 'nong_bewty99',
        authorHandle: '@nong_bewty99',
        authorType: 'แฟนคลับ / ผู้ชม',
        platform: 'TikTok',
        content:
          'เป็นช่องไม่กี่ช่องที่เวลาขายของแล้วดูจนจบตลอด เพราะเปิดคลิปมา 3 วิแรกก็ขำแล้ว เคมีสองคนนี้คือเพื่อนแท้ที่ดูแล้วอารมณ์ดีทุกคลิป ซื้อตามไปหลายชิ้นแล้ว! 😂💖',
        likesCount: '8,420',
        clipReference: 'คลิปไวรัล Sunset in พัทยา (3.2M Views)',
        clipUrl: 'https://www.tiktok.com/@juijui.j',
        dateLabel: 'มีนาคม 2569',
        commentTime: '2 วันที่แล้ว',
        isPinned: true,
        isCreatorLiked: true,
        replyCount: 42,
      },
      {
        id: 'cm-3',
        authorName: 'คุณกิตติ — Brand Marketing Lead',
        authorHandle: 'Lifestyle & Travel Brand',
        authorType: 'ลูกค้าแบรนด์ / เอเจนซี่',
        platform: 'LINE Official / Direct Chat',
        content:
          'เลือกแพ็กเกจ Premium 3 คลิปทำเป็นซีรีส์ต่อเนื่อง ผลลัพธ์คุ้มราคามากครับ ได้ลงครบทั้ง TikTok, Reels, FB, Shorts รวม 12 โพสต์ ส่งดราฟต์ตรงเวลาและรายงาน Insights ครบถ้วนมากครับ',
        likesCount: 'Verified Partner',
        clipReference: 'แคมเปญซีรีส์ท่องเที่ยว & ไลฟ์สไตล์ (Premium Package)',
        clipUrl: 'https://www.tiktok.com/@juijui.j',
        dateLabel: 'เมษายน 2569',
        commentTime: '10:15 น.',
        brandReply: {
          author: 'จุ๊ยจุ๊ย (Creator)',
          content: 'ขอบคุณทางแบรนด์ที่ไว้วางใจให้จุ๊ยจุ๊ยดูแลแคมเปญนี้ครับ ทีมงานพร้อมลุยโปรเจกต์หน้าต่อเสมอครับ 🚀',
          time: '10:18 น.',
          readStatus: true,
          avatarUrl: '/assets/juijui/avatar-main.jpg',
        },
      },
      {
        id: 'cm-4',
        authorName: 'first_genz',
        authorHandle: '@first_genz',
        authorType: 'แฟนคลับ / ผู้ชม',
        platform: 'Instagram Reels',
        content:
          'ชอบความธรรมชาติของจุ๊ยจุ๊ยมากกก แท็กเพื่อนมาดูทีไรขำกรามค้างทุกรอบ เวลาปักพิกัดของกินหรือที่เที่ยวคือตามรอยง่ายมาก ภาพสวยมู้ดดีสุดๆ ✨',
        likesCount: '3,190',
        clipReference: 'คลิปถ่ายรูปนี้ยังไง (560.7K Views)',
        clipUrl: 'https://www.instagram.com/juijui.j',
        dateLabel: 'กุมภาพันธ์ 2569',
        commentTime: '1 สัปดาห์ที่แล้ว',
        isCreatorLiked: true,
        replyCount: 18,
      },
      {
        id: 'cm-5',
        authorName: 'teerapat_vlog',
        authorHandle: '@teerapat_vlog',
        authorType: 'แฟนคลับ / ผู้ชม',
        platform: 'YouTube',
        content:
          'ดูคลิปแนวนอน 16:9 แล้วโปรดักชันดีขึ้นเรื่อยๆ เลยครับ จังหวะตลกเป็นธรรมชาติ สปอนเซอร์เข้าแบบไม่สะดุด ขอให้ช่องโตขึ้นอีกเรื่อยๆ นะครับ 🎉',
        likesCount: '1,540',
        clipReference: 'Q&A ล้วงความลับเพื่อนรัก (720K Views)',
        clipUrl: 'https://www.youtube.com/@JUIJUI',
        dateLabel: 'กุมภาพันธ์ 2569',
        commentTime: '3 สัปดาห์ที่แล้ว',
        isCreatorLiked: true,
        replyCount: 9,
      },
      {
        id: 'cm-6',
        authorName: 'คุณเบญจมาศ — Head of PR & Influencer',
        authorHandle: 'Beauty & Skincare Group',
        authorType: 'ลูกค้าแบรนด์ / เอเจนซี่',
        platform: 'LINE Official / Direct Chat',
        content:
          'สินค้าล็อตที่จัดโปรโมชันร่วมกับคลิปคุณจุ๊ยจุ๊ย Out of Stock ในช่องทาง TikTok Shop ภายใน 6 ชั่วโมงเลยค่ะ การปักตะกร้าและการเล่าเนื้อหาดึงดูดใจวัยรุ่นได้ตรงเป้าหมายมากค่ะ ❤️',
        likesCount: 'Verified Partner',
        clipReference: 'แคมเปญ Skincare & Beauty (Standard Package)',
        clipUrl: 'https://www.tiktok.com/@juijui.j',
        dateLabel: 'มกราคม 2569',
        commentTime: '16:45 น.',
        brandReply: {
          author: 'จุ๊ยจุ๊ย (Creator)',
          content: 'สุดยอดเลยครับคุณเบญจมาศ ยินดีด้วยกับยอด Sold Out นะครับ ขอบคุณที่เปิดโอกาสให้จุ๊ยจุ๊ยได้เป็นส่วนหนึ่งของแคมเปญครับ! 🎉🙏',
          time: '16:50 น.',
          readStatus: true,
          avatarUrl: '/assets/juijui/avatar-main.jpg',
        },
      },
      {
        id: 'cm-7',
        authorName: 'kwan_jira',
        authorHandle: '@kwan_jira',
        authorType: 'แฟนคลับ / ผู้ชม',
        platform: 'TikTok',
        content:
          'เขินแทนเลยยย จังหวะหันมามองตาคือได้มากกก เป็นช่องที่ดูแล้วยิ้มตามตลอด ยอดแชร์เพื่อนในกลุ่มแตกแตนมากกกก 5555 🥰🔥',
        likesCount: '5,820',
        clipReference: 'คลิป ฟิวสารภาพรัก "กูชอบมึง" (865K Views)',
        clipUrl: 'https://www.tiktok.com/@juijui.j',
        dateLabel: 'มกราคม 2569',
        commentTime: '1 เดือนที่แล้ว',
        isPinned: false,
        isCreatorLiked: true,
        replyCount: 31,
      },
      {
        id: 'cm-8',
        authorName: 'คุณวรุตม์ — Media Director',
        authorHandle: 'F&B Food Chain Group',
        authorType: 'ลูกค้าแบรนด์ / เอเจนซี่',
        platform: 'LINE Official / Direct Chat',
        content:
          'รายงานผลลัพธ์แคมเปญยอดวิวทะลุ 1.8M เกินกว่าที่การันตีไว้เกือบเท่าตัวครับ ทีมงานประทับใจความตั้งใจในการปรับแก้สคริปต์ให้กระชับมาก หวังว่าจะได้ดีลแคมเปญหน้าต่อเร็วๆ นี้นะครับ',
        likesCount: 'Repeat Client',
        clipReference: 'แคมเปญเมนูออกใหม่ร้านอาหารดัง (3 คลิปชุด)',
        clipUrl: 'https://www.tiktok.com/@juijui.j',
        dateLabel: 'ธันวาคม 2568',
        commentTime: '11:20 น.',
        brandReply: {
          author: 'จุ๊ยจุ๊ย (Creator)',
          content: 'ยินดีมากๆ เลยครับคุณวรุตม์ ขอบคุณที่ให้พื้นที่ครีเอทมุกสนุกๆ คู่กับอาหารครับ พร้อมลุยแคมเปญไตรมาสถัดไปเสมอครับ 🍽️✨',
          time: '11:25 น.',
          readStatus: true,
          avatarUrl: '/assets/juijui/avatar-main.jpg',
        },
      },
      {
        id: 'cm-9',
        authorName: 'ploy_chompoo',
        authorHandle: '@ploy_chompoo',
        authorType: 'แฟนคลับ / ผู้ชม',
        platform: 'Instagram Reels',
        content:
          'ดูเพลินมาก เคมีสองคนนี้คือธรรมชาติสุดๆ ปักหมุดคาเฟ่ตามรอยวันหยุดนี้เรียบร้อย ใครมองหาไอเดียเที่ยวดูช่องนี้ไม่ผิดหวัง ☕🏝️',
        likesCount: '4,210',
        clipReference: 'ทริปเที่ยวคาเฟ่ริมทะเล & ชาเลนจ์ (1.45M Views)',
        clipUrl: 'https://www.instagram.com/juijui.j',
        dateLabel: 'ธันวาคม 2568',
        commentTime: '2 เดือนที่แล้ว',
        isPinned: true,
        isCreatorLiked: true,
        replyCount: 24,
      },
      {
        id: 'cm-10',
        authorName: 'คุณชลธิชา — Marketing Manager',
        authorHandle: 'Gadget & Tech Brand',
        authorType: 'ลูกค้าแบรนด์ / เอเจนซี่',
        platform: 'LINE Official / Direct Chat',
        content:
          'ลูกค้าฟีดแบ็กว่าคลิปสาธิตฟังก์ชันไมค์และอุปกรณ์ทำออกมาได้เข้าใจง่ายมาก ดูไม่เป็นโฆษณาน่าเบื่อ ยอดสั่งซื้อผ่าน TikTok Shop และหน้าร้านเพิ่มขึ้นชัดเจน ขอบคุณมากค่ะ',
        likesCount: 'Verified Partner',
        clipReference: 'แคมเปญ Gadget อุปกรณ์ไอทีสำหรับคนรุ่นใหม่',
        clipUrl: 'https://www.facebook.com/Juijuij',
        dateLabel: 'พฤศจิกายน 2568',
        commentTime: '15:10 น.',
        brandReply: {
          author: 'จุ๊ยจุ๊ย (Creator)',
          content: 'ขอบพระคุณคุณชลธิชามากครับ อุปกรณ์ใช้งานดีจริงเลยหยิบมาเล่าในคลิปได้สนุกและอินสุดๆ ครับ ดีใจที่ยอดขายปังครับ! 🎙️⚡',
          time: '15:14 น.',
          readStatus: true,
          avatarUrl: '/assets/juijui/avatar-main.jpg',
        },
      },
      {
        id: 'cm-11',
        authorName: 'ton_kittisak',
        authorHandle: '@ton_kittisak',
        authorType: 'แฟนคลับ / ผู้ชม',
        platform: 'YouTube',
        content:
          'ป้ายยาของในรถเนียนมาก ดูจบกดสั่งตามไป 2 อย่างเลยครับ จังหวะคุยกับเพื่อนตอนขับรถคือเพลินเหมือนนั่งไปด้วยเลย 🚗💨',
        likesCount: '2,350',
        clipReference: 'Road Trip ป้ายยาไอเทมเด็ดตลอดทริป (980K Views)',
        clipUrl: 'https://www.youtube.com/@JUIJUI',
        dateLabel: 'พฤศจิกายน 2568',
        commentTime: '2 เดือนที่แล้ว',
        isCreatorLiked: true,
        replyCount: 15,
      },
      {
        id: 'cm-12',
        authorName: 'mint_naka',
        authorHandle: '@mint_naka',
        authorType: 'แฟนคลับ / ผู้ชม',
        platform: 'TikTok',
        content:
          'กดใจให้แล้วนะ! รอวันเปิดตัวเลยคู่นี้ น่ารักไม่ไหว เป็นคลิปไวรัลที่วนกลับมาดูซ้ำบ่อยมาก จังหวะโบ๊ะบ๊ะสุดยอด 💖✨',
        likesCount: '8,790',
        clipReference: 'ถ้าครบหนึ่งล้านใจ เราจะเป็นแฟนกัน (1.2M Views)',
        clipUrl: 'https://www.tiktok.com/@juijui.j',
        dateLabel: 'ตุลาคม 2568',
        commentTime: '3 เดือนที่แล้ว',
        isPinned: true,
        isCreatorLiked: true,
        replyCount: 56,
      },
    ],
    packages: [
      {
        id: 'pkg-starter',
        name: 'STARTER',
        badgeText: 'สำหรับแบรนด์เริ่มต้น',
        tagline: 'เหมาะสำหรับแบรนด์เริ่มต้น และแคมเปญทดลองตลาด',
        price: 9000,
        isPopular: false,
        videoCount: '1 วิดีโอคอนเทนต์',
        maxDuration: 'ไม่เกิน 90 วินาที',
        platforms: 'เฉพาะ TikTok (1 ช่องทาง)',
        totalPosts: '1 โพสต์ (TikTok)',
        bestFor: 'แคมเปญทดลองตลาด / โปรโมทสินค้าระยะสั้น',
        costEfficiency: '9,000.- / คอนเทนต์',
        features: [
          '1 วิดีโอคอนเทนต์ (คิดสตอรี่และถ่ายทำโดยจุ๊ยจุ๊ย)',
          'ความยาววิดีโอไม่เกิน 90 วินาที',
          'เผยแพร่เฉพาะช่องทาง TikTok (1 ช่องทาง)',
          'เหมาะสำหรับแคมเปญทดลองตลาด',
          'ฟรี! Gencode / Boost Code + รายงาน Insights 30 วัน',
        ],
      },
      {
        id: 'pkg-standard',
        name: 'STANDARD',
        badgeText: 'คุ้มค่าที่สุด · ยอดนิยม',
        tagline: 'เหมาะสำหรับแคมเปญทั่วไป เพิ่มการมองเห็นสูงสุดทุกแพลตฟอร์ม',
        price: 10000,
        isPopular: true,
        videoCount: '1 วิดีโอคอนเทนต์',
        maxDuration: 'ไม่เกิน 300 วินาที (5 นาที)',
        platforms: 'ทุกแพลตฟอร์ม (TikTok / IG / FB / YT Shorts)',
        totalPosts: '4 โพสต์ (กระจายครบ 4 แพลตฟอร์ม)',
        bestFor: 'แคมเปญทั่วไปที่ต้องการ Cross-Platform Reach สูงสุด',
        costEfficiency: 'เฉลี่ยเพียง 2,500.- / แพลตฟอร์ม',
        features: [
          '1 วิดีโอคอนเทนต์คุณภาพสูง',
          'ความยาววิดีโอจัดเต็มไม่เกิน 300 วินาที',
          'เผยแพร่กระจายทุกแพลตฟอร์ม (TikTok / IG / FB / YT Shorts)',
          'เพิ่มการมองเห็นแบบ Cross-Platform สูงสุด (ฐานผู้ติดตามรวม 979K+)',
          'ฟรี! สิทธิ์เชิงพาณิชย์ 6 เดือน + แก้ไขได้สูงสุด 3 ครั้ง',
        ],
      },
      {
        id: 'pkg-premium',
        name: 'PREMIUM',
        badgeText: 'แคมเปญขนาดใหญ่ · ประหยัดสุด',
        tagline: 'เหมาะสำหรับแคมเปญขนาดใหญ่ ทำเป็นซีรีส์สร้างการจดจำระยะยาว',
        price: 20000,
        isPopular: false,
        videoCount: '3 วิดีโอคอนเทนต์ (คละแนวทาง/ทำซีรีส์ได้)',
        maxDuration: 'ไม่เกิน 300 วินาที / คลิป',
        platforms: 'ทุกแพลตฟอร์ม (TikTok / IG / FB / YT Shorts)',
        totalPosts: 'รวม 12 โพสต์ (3 คลิป × 4 แพลตฟอร์ม)',
        bestFor: 'แคมเปญขนาดใหญ่ / เปิดตัวสินค้า / ซีรีส์ระยะยาว',
        costEfficiency: 'ประหยัดไป 10,000.- (เฉลี่ย 6,666.- / คลิป)',
        features: [
          '3 วิดีโอคอนเทนต์ (คละแนวทางหรือทำเป็นซีรีส์ต่อเนื่องได้)',
          'เผยแพร่กระจายทุกแพลตฟอร์ม (รวมทั้งหมด 12 โพสต์)',
          'ครอบคลุม TikTok / IG Reels / Facebook / YouTube Shorts',
          'เฉลี่ยประหยัดกว่าซื้อแยกถึง 10,000 บาท เหมาะสำหรับแคมเปญระยะยาว',
          'ฟรี! บริการรวมในแพ็กเกจครบทั้ง 4 รายการ',
        ],
      },
    ],
    freePerks: [
      { id: 'free-1', name: 'Gencode / Boost Code / Partnership Code', priceLabel: 'ราคา 0.- (ฟรี)' },
      { id: 'free-2', name: 'รายงาน Insights หลังโพสต์ไปแล้ว 30 วัน', priceLabel: 'ราคา 0.- (ฟรี)' },
      { id: 'free-3', name: 'สิทธิ์นำคลิปไปใช้เชิงพาณิชย์ 6 เดือน', priceLabel: 'ราคา 0.- (ฟรี)' },
      { id: 'free-4', name: 'แก้ไขสูงสุด 3 ครั้ง (ตามบรีฟ)', priceLabel: 'ราคา 0.- (ฟรี)' },
    ],
    addOns: [
      {
        id: 'addon-brand-cut',
        name: 'ตัดต่อเวอร์ชันพิเศษสำหรับลงช่องทางแบรนด์',
        description: 'ปรับอัตราส่วนหรือจังหวะคลิปเพิ่มเติมสำหรับนำไปโพสต์บน Official Account ของแบรนด์โดยเฉพาะ',
        price: 500,
      },
      {
        id: 'addon-cart-link',
        name: 'ปักตะกร้า + แปะลิงก์พิกัดสินค้าทุกแพลตฟอร์ม',
        description: 'ปักตะกร้า TikTok Shop พร้อมแนบลิงก์สั่งซื้อในคอมเมนต์/แคปชันครบทุกช่องทางเพื่อเร่งยอดขาย',
        price: 1000,
      },
      {
        id: 'addon-fast-track',
        name: 'คิวงานด่วน: ส่งดราฟต์แรกภายใน 24–48 ชม.',
        description: 'ลัดคิวถ่ายทำและตัดต่อด่วนพิเศษ เหมาะสำหรับแคมเปญเร่งด่วนหรือทันกระแสเทรนด์',
        price: 1000,
      },
      {
        id: 'addon-lifetime-rights',
        name: 'สิทธิ์นำคลิปไปใช้เชิงพาณิชย์ตลอดชีพ',
        description: 'อัปเกรดจากสิทธิ์ฟรี 6 เดือน เป็นสิทธิ์การใช้งานเชิงพาณิชย์และยิงโฆษณาได้ตลอดชีพ (Perpetual Buyout)',
        price: 1000,
      },
      {
        id: 'addon-photo-album',
        name: 'Photo Post / อัลบั้มภาพถ่าย 3–5 รูป (ลง Facebook & Instagram)',
        description: 'เซ็ตภาพนิ่งไลฟ์สไตล์คู่กับสินค้า 3–5 รูป โพสต์ลงทั้ง Facebook และ Instagram เพิ่มเติมจากคลิปวิดีโอ',
        price: 1500,
      },
    ],
    customCollabNotes: [
      {
        title: 'Budget Friendly',
        description: 'ยินดีปรับลดหรือขยายขอบเขตงานให้ลงตัวกับงบประมาณที่แบรนด์ตั้งไว้ สามารถพูดคุยเพื่อจัดแพ็กเกจเฉพาะกิจได้',
      },
      {
        title: 'Barter Trade',
        description: 'เปิดรับการร่วมงานแบบรีวิวแลกเปลี่ยนสินค้าหรือบริการที่น่าสนใจและตรงกับแนวทางช่อง (เช่น ทริปท่องเที่ยว ที่พัก หรือแก็ดเจ็ต)',
      },
    ],
    brandShowcaseConfig: {
      badgeText: 'BRAND PARTNERSHIPS · 62+ TRUSTED CLIENTS',
      sectionTitle: 'ประวัติการร่วมงาน 60 กว่าแบรนด์ชั้นนำ',
      sectionSubtitle:
        'รวมผลงานแคมเปญโฆษณาจริงจากแบรนด์ระดับประเทศและโกลบอล กดคลิกที่โลโก้หรือรายชื่อแบรนด์เพื่อเจาะลึกจำนวนครั้งที่ร่วมงาน สไตล์คอนเทนต์ ยอดวิว และคลิปตัวอย่างของแต่ละแบรนด์',
      totalBrandsStat: '62+ แบรนด์',
      repeatRateStat: '78% ลูกค้าจ้างซ้ำ',
      sponsoredViewsStat: '45M+ ยอดวิวแคมเปญสะสม',
      referenceSlideUrl: '/assets/aistudio/_______0d429d60.pdf',
    },
    brandCollaborations: [
      // === 1. FOOD & BEVERAGE (23 Brands from Slide 04) ===
      {
        id: 'brand-kfc',
        brandName: 'KFC',
        brandNameTh: 'เคเอฟซี ประเทศไทย',
        category: 'Food & Beverage',
        brandColor: '#E4002B',
        campaignCount: 5,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '3.4M+',
        avgEngagement: '8.4%',
        latestPeriod: 'ไตรมาส 1 / 2569',
        videoStyles: ['Comedy Sketch คู่เพื่อน', 'ชาเลนจ์กินแหลกหน้ากล้อง', 'ป้ายยาโปรลับประจำเดือน'],
        deliverablesSummary: 'TikTok 5 คลิป + Reels Cross-post + Boost Code 365 วัน',
        campaignHighlight: 'แคมเปญชุดบักเก็ตเพื่อนซี้ สร้างยอดแชร์ต่อกว่า 18,000 ครั้ง และคอมเมนต์แท็กเพื่อนไปกิน KFC ถล่มทลาย',
        clientQuote: 'เคมีของจุ๊ยจุ๊ยทำให้การขายโปรโมชั่นไก่ทอดกลายเป็นเรื่องสนุกเหมือนเพื่อนชวนกันไปกินจริงๆ ยอด Engagement สูงกว่า Benchmark ของแคมเปญมากครับ',
        clientRole: 'Digital Campaign Manager · KFC Thailand Agency',
        sampleClips: [
          {
            id: 'kfc-clip-1',
            title: 'เมื่อเพื่อนบอกจะกินแค่ชิ้นเดียว... แต่สั่งบักเก็ตใหญ่!',
            platform: 'TikTok',
            views: '1.4M',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Comedy Sitcom (9:16)',
            duration: '00:55',
          },
          {
            id: 'kfc-clip-2',
            title: 'ท้าพิสูจน์เมนูใหม่ KFC ใครเผ็ดก่อนจ่ายรอบวง',
            platform: 'Instagram Reels',
            views: '820K',
            url: 'https://www.instagram.com',
            formatTag: 'Food Challenge',
            duration: '00:48',
          },
        ],
      },
      {
        id: 'brand-cp',
        brandName: 'CP',
        brandNameTh: 'ซีพี (เจริญโภคภัณฑ์อาหาร)',
        category: 'Food & Beverage',
        brandColor: '#D91920',
        campaignCount: 6,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '4.1M+',
        avgEngagement: '7.9%',
        latestPeriod: 'กุมภาพันธ์ 2569',
        videoStyles: ['มื้อดึกเพื่อนหิว (Late Night Craving)', 'ครีเอทเมนูร้านสะดวกซื้อ', 'รีวิวของอร่อยออกใหม่'],
        deliverablesSummary: 'TikTok + Facebook Reels + YouTube Shorts (Multi-Platform)',
        campaignHighlight: 'ซีรีส์จับคู่ของกิน CP ในเซเว่นฯ ทำยอดวิวทะลุล้านต่อเนื่อง 3 คลิปติด คนดูเซฟคลิปไปซื้อตามหน้าร้านจริง',
        clientQuote: 'น้องจุ๊ยจุ๊ยครีเอทมุกเปิดคลิป 3 วินาทีแรกได้เก่งมาก คนดูไม่ปัดหนีและดูจนจบคลิปทุกตัว จึงต่อสัญญาร่วมงานกันต่อเนื่องถึง 6 แคมเปญ',
        clientRole: 'Senior Brand Manager · CP Foods',
        sampleClips: [
          {
            id: 'cp-clip-1',
            title: 'สูตรลับมื้อดึก CP จับคู่ยังไงให้อร่อยเหมือนเชฟมาทำให้',
            platform: 'TikTok',
            views: '1.6M',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Food Hack & Lifestyle',
            duration: '00:52',
          },
        ],
      },
      {
        id: 'brand-lays',
        brandName: "Lay's",
        brandNameTh: 'เลย์ มันฝรั่งทอดกรอบ',
        category: 'Food & Beverage',
        brandColor: '#F59E0B',
        campaignCount: 4,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '2.8M+',
        avgEngagement: '8.1%',
        latestPeriod: 'มีนาคม 2569',
        videoStyles: ['ทายรสชาติใหม่ปิดตาชิม', 'โร้ดทริปปาร์ตี้กับแก๊งเพื่อน', 'ASMR ความกรอบ'],
        deliverablesSummary: 'TikTok 4 คลิป + IG Story + สิทธิ์ทำโฆษณา Spark Ads',
        campaignHighlight: 'เปิดตัวเลย์รสชาติใหม่ผ่านเกมทายใจเพื่อนสนิท สร้างกระแสคอมเมนต์เลือกทีมรสชาติกว่า 2,400 คอมเมนต์',
        clientQuote: 'ถ่ายทอดความสนุกของแบรนด์ Lay’s ออกมาได้สดใสและเป็นธรรมชาติมาก ตอบโจทย์กลุ่มเป้าหมาย Gen Z เต็มร้อย',
        clientRole: 'Brand Activation Lead · PepsiCo Thailand',
        sampleClips: [
          {
            id: 'lays-clip-1',
            title: 'ปิดตาทายรสชาติเลย์ออกใหม่ ใครทายผิดโดนดีดหน้าผาก!',
            platform: 'TikTok',
            views: '1.1M',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Friendship Challenge',
            duration: '00:58',
          },
        ],
      },
      {
        id: 'brand-taokaenoi',
        brandName: 'Tao Kae Noi',
        brandNameTh: 'เถ้าแก่น้อย',
        category: 'Food & Beverage',
        brandColor: '#DC2626',
        campaignCount: 3,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '1.9M+',
        avgEngagement: '7.6%',
        latestPeriod: 'มกราคม 2569',
        videoStyles: ['ละครสั้นหักมุมตลก', 'ของกินเล่นเวลาดูซีรีส์', 'ชาเลนจ์คำคมเพื่อนรัก'],
        deliverablesSummary: 'TikTok 3 คลิป + Facebook Reels',
        campaignHighlight: 'คลิปแย่งสาหร่ายเถ้าแก่น้อยแผ่นสุดท้ายกับเพื่อนสนิท กลายเป็นแผ่นเสียงไวรัลที่คนเอาไปเล่นตาม',
        clientQuote: 'งานไว ส่งดราฟต์ตรงเวลา มุกตลกเข้ากับสินค้าได้แนบเนียนไม่ฝืนเลยครับ',
        clientRole: 'Marketing Communication · Tao Kae Noi',
        sampleClips: [
          {
            id: 'tkn-clip-1',
            title: 'ศึกชิงเถ้าแก่น้อยแผ่นสุดท้าย มิตรภาพ 10 ปีสั่นคลอน!',
            platform: 'TikTok',
            views: '940K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Comedy Sketch',
            duration: '00:46',
          },
        ],
      },
      {
        id: 'brand-singha',
        brandName: 'Singha',
        brandNameTh: 'สิงห์ คอร์เปอเรชั่น',
        category: 'Food & Beverage',
        brandColor: '#D97706',
        campaignCount: 4,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '2.5M+',
        avgEngagement: '7.4%',
        latestPeriod: 'เมษายน 2569',
        videoStyles: ['Lifestyle Vlog ทริปเที่ยว', 'เติมความสดชื่นหลังทำกิจกรรม', 'บรรยากาศงานเฟสติวัล'],
        deliverablesSummary: 'TikTok + Instagram Reels + Event Coverage',
        campaignHighlight: 'คอนเทนต์ไลฟ์สไตล์ซัมเมอร์ทริปกับเพื่อนสนิท ภาพสวย Mood & Tone พรีเมียมเข้ากับภาพลักษณ์แบรนด์',
        clientQuote: 'ภาพสวย โปรดักชันดีมาก ทั้งสนุกและยังคงความดูดีของแบรนด์ไว้ครบถ้วน',
        clientRole: 'Brand Experience Team · Boon Rawd Trading',
        sampleClips: [
          {
            id: 'singha-clip-1',
            title: 'ซัมเมอร์นี้หนีร้อนไปพักผ่อนกับเพื่อนซี้ เติมความซ่าสดชื่นตลอดทริป',
            platform: 'Instagram Reels',
            views: '880K',
            url: 'https://www.instagram.com',
            formatTag: 'Lifestyle & Travel Vlog',
            duration: '01:02',
          },
        ],
      },
      {
        id: 'brand-knorr',
        brandName: 'Knorr',
        brandNameTh: 'คนอร์ (Unilever)',
        category: 'Food & Beverage',
        brandColor: '#15803D',
        campaignCount: 3,
        isRepeatPartner: true,
        totalViews: '1.7M+',
        avgEngagement: '7.2%',
        latestPeriod: 'ธันวาคม 2568',
        videoStyles: ['เข้าครัวทำอาหารง่ายๆ ในคอนโด', 'แข่งทำเมนูมื้อเช้า 5 นาที'],
        deliverablesSummary: 'TikTok 3 คลิป + Facebook Cross-post',
        campaignHighlight: 'เปลี่ยนการทำอาหารของคนรุ่นใหม่ให้ดูง่ายและสนุกภายใน 3 ขั้นตอน ยอดเซฟคลิปเก็บไว้ทำตามสูงมาก',
        sampleClips: [
          {
            id: 'knorr-clip-1',
            title: 'เมื่อเพื่อนท้าทำอาหารเช้าภายใน 5 นาที รอดหรือร่วง!',
            platform: 'TikTok',
            views: '690K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Cooking Challenge',
          },
        ],
      },
      {
        id: 'brand-sukijinda',
        brandName: 'Suki Jinda',
        brandNameTh: 'สุกี้จินดา',
        category: 'Food & Beverage',
        brandColor: '#B91C1C',
        campaignCount: 2,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '2.2M+',
        avgEngagement: '8.9%',
        latestPeriod: 'มกราคม 2569',
        videoStyles: ['รีวิวบุฟเฟต์/สายพานหน้าร้าน', 'แข่งกันหยิบไม้เด็ดสุกี้สายพาน'],
        deliverablesSummary: 'TikTok + Facebook Reels (On-site Store Visit)',
        campaignHighlight: 'พาไปกินสุกี้จินดาแบบจัดเต็ม ป้ายยาน้ำจิ้มสูตรเด็ดจนคนดูแห่คอมเมนต์ชวนเพื่อนไปตามรอย',
        sampleClips: [
          {
            id: 'sukijinda-clip-1',
            title: 'พากินสุกี้จินดา ใครหยิบเกิน 30 ไม้จ่ายค่าหม้อ!',
            platform: 'TikTok',
            views: '1.3M',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Foodie Store Visit',
          },
        ],
      },
      {
        id: 'brand-chesters',
        brandName: "Chester's",
        brandNameTh: 'เชสเตอร์กริลล์',
        category: 'Food & Beverage',
        brandColor: '#EA580C',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.2M+',
        avgEngagement: '7.1%',
        latestPeriod: 'พฤศจิกายน 2568',
        videoStyles: ['รีวิวเมนูข้าวไก่ย่างซอสสูตรพิเศษ', 'มื้อเที่ยงออฟฟิศ/วัยรุ่น'],
        deliverablesSummary: 'TikTok 2 คลิป + IG Reels',
        campaignHighlight: 'โปรโมตเซ็ตคู่คุ้มเชสเตอร์ กระตุ้นยอดสั่งเดลิเวอรีและทานหน้าร้านช่วงมื้อกลางวัน',
        sampleClips: [
          {
            id: 'chesters-clip-1',
            title: 'มื้อเที่ยงไม่ต้องเถียงกัน สั่งเซ็ตคู่เชสเตอร์จบครบสองคน',
            platform: 'TikTok',
            views: '640K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Food Review',
          },
        ],
      },
      {
        id: 'brand-potatocorner',
        brandName: 'Potato Corner',
        brandNameTh: 'โปเตโต้ คอร์เนอร์',
        category: 'Food & Beverage',
        brandColor: '#16A34A',
        campaignCount: 3,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '2.1M+',
        avgEngagement: '8.3%',
        latestPeriod: 'กุมภาพันธ์ 2569',
        videoStyles: ['เลือกผงเขย่ารสโปรด', 'เดินห้างป้ายยาของกินเล่น'],
        deliverablesSummary: 'TikTok 3 คลิป + IG Story',
        campaignHighlight: 'ดีเบตศึกผงชีส vs ผงทรัฟเฟิล ของ Potato Corner ดึงคอมเมนต์สายกินมีส่วนร่วมกว่า 3,100 คอมเมนต์',
        sampleClips: [
          {
            id: 'pc-clip-1',
            title: 'ศึกตัดสิน! Potato Corner รสไหนคือที่สุดในใจแก๊งเพื่อน',
            platform: 'TikTok',
            views: '980K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Street Food & Snack',
          },
        ],
      },
      {
        id: 'brand-nescafe',
        brandName: 'Nescafé',
        brandNameTh: 'เนสกาแฟ',
        category: 'Food & Beverage',
        brandColor: '#991B1B',
        campaignCount: 3,
        isRepeatPartner: true,
        totalViews: '1.8M+',
        avgEngagement: '6.9%',
        latestPeriod: 'มีนาคม 2569',
        videoStyles: ['Morning Routine เติมพลังก่อนเริ่มงาน', 'แจกความสดใสยามเช้า'],
        deliverablesSummary: 'TikTok + Facebook Reels + YouTube Shorts',
        campaignHighlight: 'แคมเปญปลุกเอเนอร์จี้ตอนเช้าด้วยเนสกาแฟกระป๋องและแบบชง เข้าถึงกลุ่มนักศึกษาและ First Jobber',
        sampleClips: [
          {
            id: 'nescafe-clip-1',
            title: 'สภาพก่อนดื่มกาแฟ vs หลังดื่มเนสกาแฟ เอเนอร์จี้เปลี่ยนทันที!',
            platform: 'TikTok',
            views: '750K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Morning Comedy',
          },
        ],
      },
      {
        id: 'brand-kewpie',
        brandName: 'Kewpie',
        brandNameTh: 'คิวพี ประเทศไทย',
        category: 'Food & Beverage',
        brandColor: '#DC2626',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.1M+',
        avgEngagement: '7.0%',
        latestPeriod: 'ตุลาคม 2568',
        videoStyles: ['แมตช์น้ำสลัดงาคั่วญี่ปุ่นกับเมนูโปรด', 'เมนูเฮลตี้ทำเองง่ายๆ'],
        deliverablesSummary: 'TikTok 2 คลิป + Reels',
        campaignHighlight: 'ป้ายยาน้ำสลัดคิวพีจิ้มกับอะไรก็อร่อย คนดูคอมเมนต์แชร์เมนูคู่บุญของตัวเองเพียบ',
        sampleClips: [
          {
            id: 'kewpie-clip-1',
            title: 'มีคิวพีติดตู้เย็นขวดเดียว เปลี่ยนผักธรรมดาให้อร่อยแสงออกปาก',
            platform: 'TikTok',
            views: '580K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Home Cooking',
          },
        ],
      },
      {
        id: 'brand-gaga',
        brandName: 'GAGA',
        brandNameTh: 'กาก้า (Attitude in a Cup)',
        category: 'Food & Beverage',
        brandColor: '#18181B',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.3M+',
        avgEngagement: '8.0%',
        latestPeriod: 'มกราคม 2569',
        videoStyles: ['รีวิวชานมไข่มุกเม็ดน้ำผึ้ง', 'Lifestyle Cafe Hopping'],
        deliverablesSummary: 'TikTok + IG Reels',
        campaignHighlight: 'รีวิวเมนูใหม่ GAGA Overload สไตล์แฟชั่นเท่ๆ ผสมมุกตลกเพื่อนแย่งดูดไข่มุก',
        sampleClips: [
          {
            id: 'gaga-clip-1',
            title: 'เมื่อสั่ง GAGA แก้วเดียวแต่ท็อปปิ้งแน่นเต็มแก้ว!',
            platform: 'TikTok',
            views: '710K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Cafe & Drink Review',
          },
        ],
      },
      {
        id: 'brand-ucc',
        brandName: 'UCC Coffee',
        brandNameTh: 'ยูซีซี คอฟฟี่',
        category: 'Food & Beverage',
        brandColor: '#78350F',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '950K+',
        avgEngagement: '6.8%',
        latestPeriod: 'พฤศจิกายน 2568',
        videoStyles: ['Home Cafe สไตล์ญี่ปุ่น', 'ชงกาแฟดริปให้เพื่อนชิม'],
        deliverablesSummary: 'TikTok + IG Reels',
        campaignHighlight: 'ถ่ายทอดฟีลโฮมคาเฟ่กาแฟญี่ปุ่นแท้ๆ ด้วยมู้ดอบอุ่นเข้าถึงง่าย',
        sampleClips: [
          {
            id: 'ucc-clip-1',
            title: 'เปลี่ยนห้องนั่งเล่นเป็นคาเฟ่ญี่ปุ่นด้วยกาแฟ UCC',
            platform: 'Instagram Reels',
            views: '490K',
            url: 'https://www.instagram.com',
            formatTag: 'Home Cafe Vlog',
          },
        ],
      },
      {
        id: 'brand-senju',
        brandName: 'Senju Shabu',
        brandNameTh: 'เซนจู ชาบู แอนด์ ซูชิ พรีเมียมบุฟเฟต์',
        category: 'Food & Beverage',
        brandColor: '#991B1B',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.4M+',
        avgEngagement: '7.7%',
        latestPeriod: 'ธันวาคม 2568',
        videoStyles: ['ตะลุยกินบุฟเฟต์ชาบูและซูชิ', 'เทคนิคกินบุฟเฟต์ให้คุ้ม'],
        deliverablesSummary: 'TikTok + Facebook Reels',
        campaignHighlight: 'พาไปจัดเต็มเนื้อวากิวและแซลมอนซาชิมิที่ Senju ยอดแชร์ชวนเพื่อนไปกินสิ้นเดือนสูงมาก',
        sampleClips: [
          {
            id: 'senju-clip-1',
            title: 'สายเนื้อสายแซลมอนต้องดู! พาถล่ม Senju Shabu แบบคุ้มทุกคำ',
            platform: 'TikTok',
            views: '780K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Buffet Vlog',
          },
        ],
      },
      {
        id: 'brand-kingkong',
        brandName: 'Kingkong Buffet',
        brandNameTh: 'คิงคอง บุฟเฟต์ปิ้งย่าง',
        category: 'Food & Beverage',
        brandColor: '#B91C1C',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.2M+',
        avgEngagement: '7.5%',
        latestPeriod: 'ตุลาคม 2568',
        videoStyles: ['ปิ้งย่างยากินิกุกับแก๊งเพื่อน', 'รีวิวเมนูเนื้อและกุ้งแม่น้ำ'],
        deliverablesSummary: 'TikTok + Facebook Reels',
        campaignHighlight: 'เล่าบรรยากาศการนัดเจอเพื่อนเก่าที่ร้านปิ้งย่าง Kingkong ได้ทั้งความฮาและความหิว',
        sampleClips: [
          {
            id: 'kingkong-clip-1',
            title: 'ปิ้งย่างคิงคองกับเพื่อนที่บอกว่าลดความอ้วนอยู่!',
            platform: 'TikTok',
            views: '660K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Food Sitcom',
          },
        ],
      },
      {
        id: 'brand-blend285',
        brandName: 'Blend 285',
        brandNameTh: 'เบลนด์ 285',
        category: 'Food & Beverage',
        brandColor: '#1E3A8A',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.3M+',
        avgEngagement: '7.2%',
        latestPeriod: 'ธันวาคม 2568',
        videoStyles: ['ปาร์ตี้สังสรรค์กลุ่มเพื่อน', 'Lifestyle Night Out'],
        deliverablesSummary: 'TikTok + IG Reels',
        campaignHighlight: 'แคมเปญโมเมนต์สังสรรค์ส่งท้ายปีกับแก๊งเพื่อน เน้นมิตรภาพและจังหวะดนตรีสนุกสนาน',
        sampleClips: [
          {
            id: 'blend-clip-1',
            title: 'รวมตัวแก๊งเพื่อนครบองค์รอบปี บรรยากาศก็จะสุดประมาณนี้',
            platform: 'Instagram Reels',
            views: '670K',
            url: 'https://www.instagram.com',
            formatTag: 'Friendship Party',
          },
        ],
      },
      {
        id: 'brand-hongthong',
        brandName: 'Hong Thong',
        brandNameTh: 'หงส์ทอง',
        category: 'Food & Beverage',
        brandColor: '#B45309',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.1M+',
        avgEngagement: '7.4%',
        latestPeriod: 'พฤศจิกายน 2568',
        videoStyles: ['คอนเทนต์สายม่วนจอย', 'ไลฟ์สไตล์ปาร์ตี้เทศกาล'],
        deliverablesSummary: 'TikTok + Facebook Reels',
        campaignHighlight: 'สร้างสีสันความสนุกแบบไทยๆ เข้าถึงกลุ่มผู้ชมต่างจังหวัดและกรุงเทพฯ ได้อย่างทั่วถึง',
        sampleClips: [
          {
            id: 'hongthong-clip-1',
            title: 'เปิดตี้สายม่วนจอย เมื่อเพื่อนบอกว่าวันนี้ขอเบาๆ',
            platform: 'TikTok',
            views: '620K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Comedy Lifestyle',
          },
        ],
      },
      {
        id: 'brand-chang',
        brandName: 'Chang',
        brandNameTh: 'ช้าง (แก๊งเพื่อนซี้)',
        category: 'Food & Beverage',
        brandColor: '#047857',
        campaignCount: 3,
        isRepeatPartner: true,
        totalViews: '2.0M+',
        avgEngagement: '7.8%',
        latestPeriod: 'มีนาคม 2569',
        videoStyles: ['Friendship Moment เพลงและคอนเสิร์ต', 'ทริปแคมป์ปิ้งกับเพื่อนสนิท'],
        deliverablesSummary: 'TikTok + IG Reels + Event Vlog',
        campaignHighlight: 'ตอกย้ำจุดยืนช่องครีเอเตอร์เพื่อนรัก ตรงกับ DNA ของแบรนด์ช้างเรื่องมิตรภาพเพื่อนซี้ 100%',
        sampleClips: [
          {
            id: 'chang-clip-1',
            title: 'คำว่าเพื่อนซี้ ไม่ต้องพูดเยอะแค่มองตาก็รู้ใจ',
            platform: 'TikTok',
            views: '920K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Friendship Storytelling',
          },
        ],
      },
      {
        id: 'brand-spy',
        brandName: 'SPY',
        brandNameTh: 'สปาย ไวน์คูลเลอร์',
        category: 'Food & Beverage',
        brandColor: '#DB2777',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.0M+',
        avgEngagement: '7.3%',
        latestPeriod: 'กุมภาพันธ์ 2569',
        videoStyles: ['Girls Night Out / ปาร์ตี้ริมสระ', 'แมตช์ลุคสีสันสดใส'],
        deliverablesSummary: 'TikTok + Instagram Reels',
        campaignHighlight: 'คอนเทนต์สีสันสดใสสไตล์ปาร์ตี้เพื่อนสาว ได้ยอดไลค์และคอมเมนต์ชม Mood ภาพสูงมาก',
        sampleClips: [
          {
            id: 'spy-clip-1',
            title: 'ปาร์ตี้วันหยุดกับเพื่อนซี้ เติมความสดใสซาบซ่าทุกโมเมนต์',
            platform: 'Instagram Reels',
            views: '540K',
            url: 'https://www.instagram.com',
            formatTag: 'Lifestyle Party',
          },
        ],
      },
      {
        id: 'brand-viva',
        brandName: 'Viva',
        brandNameTh: 'วีว่า',
        category: 'Food & Beverage',
        brandColor: '#0284C7',
        campaignCount: 1,
        isRepeatPartner: false,
        totalViews: '520K+',
        avgEngagement: '6.5%',
        latestPeriod: 'กันยายน 2568',
        videoStyles: ['รีวิวสินค้าไลฟ์สไตล์ประจำวัน', 'Short Comedy'],
        deliverablesSummary: 'TikTok 1 คลิป + Facebook Reels',
        campaignHighlight: 'นำเสนอจุดเด่นผลิตภัณฑ์ผ่านสถานการณ์จำลองในชีวิตประจำวันแบบเข้าใจง่าย',
        sampleClips: [
          {
            id: 'viva-clip-1',
            title: 'ตัวช่วยเติมความสดชื่นระหว่างวันของชาวแก๊ง',
            platform: 'TikTok',
            views: '520K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'UGC Review',
          },
        ],
      },
      {
        id: 'brand-risebuddy',
        brandName: 'Rise Buddy',
        brandNameTh: 'ไรซ์ บัดดี้ ขนมอบกรอบจากข้าวไทย',
        category: 'Food & Beverage',
        brandColor: '#EA580C',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '890K+',
        avgEngagement: '7.1%',
        latestPeriod: 'ตุลาคม 2568',
        videoStyles: ['ขนมคู่ใจเพื่อนซี้ (Buddy Snack)', 'ชาเลนจ์เสียงกรอบ ASMR'],
        deliverablesSummary: 'TikTok 2 คลิป',
        campaignHighlight: 'ชื่อแบรนด์ Rise Buddy เข้ากับคอนเซปต์ช่องคู่หูเพื่อนซี้สุดๆ ทำให้คนดูจำชื่อแบรนด์ได้แม่นยำ',
        sampleClips: [
          {
            id: 'risebuddy-clip-1',
            title: 'ขนมของคนมีบัดดี้! กรอบอร่อยจนเพื่อนข้างๆ ต้องหันมามอง',
            platform: 'TikTok',
            views: '480K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Snack Comedy',
          },
        ],
      },
      {
        id: 'brand-gbeat',
        brandName: 'G Beat',
        brandNameTh: 'จีบีท เอเนอร์จีดริ้งก์',
        category: 'Food & Beverage',
        brandColor: '#7C3AED',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.1M+',
        avgEngagement: '7.6%',
        latestPeriod: 'มกราคม 2569',
        videoStyles: ['เติมพลังสายเกมเมอร์/สายปั่นงานดึก', 'Comedy Sketch'],
        deliverablesSummary: 'TikTok 2 คลิป + YouTube Shorts',
        campaignHighlight: 'เจาะกลุ่มวัยรุ่นสายเล่นเกมดึกและปั่นโปรเจกต์ ดีดความสดชื่นแบบไม่มีน้ำตาล',
        sampleClips: [
          {
            id: 'gbeat-clip-1',
            title: 'เมื่อต้องแบกทีมตอนตีสอง ตัวช่วยเพิ่มความตื่นต้องเข้าแล้ว!',
            platform: 'TikTok',
            views: '610K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Gaming & Lifestyle',
          },
        ],
      },
      {
        id: 'brand-morioka',
        brandName: 'Morioka',
        brandNameTh: 'โมริโอกะ',
        category: 'Food & Beverage',
        brandColor: '#059669',
        campaignCount: 1,
        isRepeatPartner: false,
        totalViews: '490K+',
        avgEngagement: '6.6%',
        latestPeriod: 'สิงหาคม 2568',
        videoStyles: ['รีวิวความอร่อยสไตล์ญี่ปุ่น', 'ป้ายยาของน่าลอง'],
        deliverablesSummary: 'TikTok 1 คลิป + IG Reels',
        campaignHighlight: 'รีวิวรสชาติและแพ็กเกจจิงสไตล์ญี่ปุ่น ดึงดูดสายกินของแปลกใหม่',
        sampleClips: [
          {
            id: 'morioka-clip-1',
            title: 'ลองของอร่อยสไตล์ญี่ปุ่นกับ Morioka อร่อยจริงหรือจกตา?',
            platform: 'TikTok',
            views: '490K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Taste Test',
          },
        ],
      },

      // === 2. TECH, TELECOM & APPS (10 Brands from Slide 04) ===
      {
        id: 'brand-grab',
        brandName: 'Grab',
        brandNameTh: 'แกร็บ ประเทศไทย',
        category: 'Tech, Telecom & Apps',
        brandColor: '#00B14F',
        campaignCount: 6,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '4.3M+',
        avgEngagement: '8.5%',
        latestPeriod: 'เมษายน 2569',
        videoStyles: ['สั่งอาหาร GrabFood กับแก๊งเพื่อน', 'แจกโค้ดส่วนลดประจำเดือน', 'เรียกรถ Grab ไปเที่ยว'],
        deliverablesSummary: 'TikTok 6 คลิป + IG Reels + Promo Code Attribution',
        campaignHighlight: 'พาร์ทเนอร์หลักแคมเปญ GrabFood ยอดใช้โค้ดส่วนลดประจำช่องติด Top Tier ของกลุ่มครีเอเตอร์สายไลฟ์สไตล์',
        clientQuote: 'จุ๊ยจุ๊ยสามารถผูกเรื่องการสั่ง GrabFood เข้ากับมุกตลกของเพื่อนได้ไหลลื่นมาก ยอด Redemption โค้ดส่วนลดทะลุเป้าทุกแคมเปญครับ',
        clientRole: 'Influencer Marketing Specialist · Grab Thailand',
        sampleClips: [
          {
            id: 'grab-clip-1',
            title: 'ปัญหาโลกแตก: เที่ยงนี้กินอะไรดี? จบด้วยการกดสั่ง GrabFood รัวๆ',
            platform: 'TikTok',
            views: '1.5M',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'App Sitcom & Promo',
            duration: '00:54',
          },
        ],
      },
      {
        id: 'brand-samsung',
        brandName: 'Samsung',
        brandNameTh: 'ซัมซุง (Galaxy Series)',
        category: 'Tech, Telecom & Apps',
        brandColor: '#1D4ED8',
        campaignCount: 4,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '3.1M+',
        avgEngagement: '7.9%',
        latestPeriod: 'มีนาคม 2569',
        videoStyles: ['ทดสอบกล้องถ่ายรูป/วิดีโอเที่ยวกับเพื่อน', 'ฟีเจอร์ AI แต่งรูปสุดล้ำ', 'Gadget Lifestyle'],
        deliverablesSummary: 'TikTok + Instagram Reels + YouTube Shorts',
        campaignHighlight: 'สาธิตการใช้ฟีเจอร์กล้องและ Galaxy AI ถ่ายรูปคู่เพื่อนในคาเฟ่และงานคอนเสิร์ต คนดูเข้าใจฟีเจอร์ทันทีโดยไม่ต้องพูดศัพท์เทคนิคยากๆ',
        clientQuote: 'แปลงฟีเจอร์เทคโนโลยีให้กลายเป็นภาษาวัยรุ่นที่เข้าใจง่ายและน่าใช้ตามมากๆ ค่ะ',
        clientRole: 'PR & Kol Manager · Samsung Mobile Thailand',
        sampleClips: [
          {
            id: 'samsung-clip-1',
            title: 'เมื่อให้เพื่อนถ่ายรูปให้ vs ใช้ฟีเจอร์ AI ของ Samsung ช่วยชีวิต!',
            platform: 'TikTok',
            views: '1.3M',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Tech Lifestyle Showcase',
          },
        ],
      },
      {
        id: 'brand-ais',
        brandName: 'AIS Points',
        brandNameTh: 'เอไอเอส พอยท์',
        category: 'Tech, Telecom & Apps',
        brandColor: '#65A30D',
        campaignCount: 3,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '2.1M+',
        avgEngagement: '7.5%',
        latestPeriod: 'กุมภาพันธ์ 2569',
        videoStyles: ['พาทัวร์แลกพอยท์กินฟรี/ลดราคา', 'ทริคความคุ้มสำหรับสายกินเที่ยว'],
        deliverablesSummary: 'TikTok 3 คลิป + Facebook Reels',
        campaignHighlight: 'พาเดินห้างใช้ AIS Points 1 คะแนนแลกขนมและเครื่องดื่มจริงหน้างาน คนดูแห่กดเช็กพอยท์ในแอป myAIS ตามทันที',
        sampleClips: [
          {
            id: 'ais-clip-1',
            title: 'ภารกิจใช้ AIS Points แลกของกินทั้งวัน คุ้มแค่ไหนมาดู!',
            platform: 'TikTok',
            views: '920K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Privilege & Lifestyle Hunt',
          },
        ],
      },
      {
        id: 'brand-true',
        brandName: 'True 5G',
        brandNameTh: 'ทรู คอร์ปอเรชั่น',
        category: 'Tech, Telecom & Apps',
        brandColor: '#E11D48',
        campaignCount: 3,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '2.3M+',
        avgEngagement: '7.6%',
        latestPeriod: 'มกราคม 2569',
        videoStyles: ['ทดสอบความเร็วเน็ตกลางงานอีเวนต์คนแน่น', 'แพ็กเกจวัยรุ่นสายโซเชียล'],
        deliverablesSummary: 'TikTok + IG Reels + Facebook',
        campaignHighlight: 'จำลองสถานการณ์อัปคลิปและดูไลฟ์สดไม่มีสะดุดด้วยสัญญาณ True 5G',
        sampleClips: [
          {
            id: 'true-clip-1',
            title: 'อยู่กลางคอนเสิร์ตคนเป็นหมื่น แต่เพื่อนยังอัปสตอรี่ลื่นปรื๊ดเพราะสิ่งนี้!',
            platform: 'TikTok',
            views: '960K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Telecom Sitcom',
          },
        ],
      },
      {
        id: 'brand-makebykbank',
        brandName: 'MAKE by KBank',
        brandNameTh: 'เมค บาย เคแบงก์',
        category: 'Tech, Telecom & Apps',
        brandColor: '#10B981',
        campaignCount: 3,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '2.4M+',
        avgEngagement: '8.2%',
        latestPeriod: 'มีนาคม 2569',
        videoStyles: ['แยกกระเป๋าเงิน Cloud Pocket เก็บเงินเที่ยวกับเพื่อน', 'หารค่าข้าวแก๊งเพื่อนแบบไม่ทวงเหนื่อย'],
        deliverablesSummary: 'TikTok 3 คลิป + ลิงก์ดาวน์โหลดแอป',
        campaignHighlight: 'แก้ Pain Point เรื่องการหารค่าทริปและเก็บเงินเที่ยวกับเพื่อนด้วยฟีเจอร์ Cloud Pocket ยอดคลิกลิงก์โหลดแอปสูงมาก',
        clientQuote: 'เล่าเรื่องการจัดการเงินให้กลายเป็นเรื่องสนุกของกลุ่มเพื่อน ตรงกับ Insight ของผู้ใช้ MAKE by KBank ที่สุด',
        clientRole: 'Growth Marketing · KBTG (MAKE by KBank)',
        sampleClips: [
          {
            id: 'make-clip-1',
            title: 'วิธีทวงค่าข้าวเพื่อนแบบไม่ต้องพูดสักคำ ใช้ MAKE by KBank จบ!',
            platform: 'TikTok',
            views: '1.1M',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'FinTech Comedy',
          },
        ],
      },
      {
        id: 'brand-lemon8',
        brandName: 'Lemon8',
        brandNameTh: 'เลมอนเอท แอปไลฟ์สไตล์',
        category: 'Tech, Telecom & Apps',
        brandColor: '#EAB308',
        campaignCount: 3,
        isRepeatPartner: true,
        totalViews: '1.8M+',
        avgEngagement: '7.8%',
        latestPeriod: 'กุมภาพันธ์ 2569',
        videoStyles: ['แชร์ไอเดียแต่งตัวถ่ายรูปคู่เพื่อน', 'ป้ายยาพิกัดลับจาก Lemon8'],
        deliverablesSummary: 'TikTok + Lemon8 Original Posts',
        campaignHighlight: 'ชวนผู้ติดตามไปค้นหาไอเดียท่าโพสและพิกัดคาเฟ่ในแอป Lemon8',
        sampleClips: [
          {
            id: 'lemon8-clip-1',
            title: 'รวมท่าโพสถ่ายรูปคู่เพื่อนซี้จาก Lemon8 ถ่ายยังไงก็ปัง!',
            platform: 'TikTok',
            views: '740K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Lifestyle App Guide',
          },
        ],
      },
      {
        id: 'brand-omi',
        brandName: 'OMI',
        brandNameTh: 'โอมิ แอปหาเพื่อนและคอมมูนิตี้',
        category: 'Tech, Telecom & Apps',
        brandColor: '#EC4899',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.5M+',
        avgEngagement: '8.4%',
        latestPeriod: 'พฤศจิกายน 2568',
        videoStyles: ['ละครสั้นคนโสดในแก๊งเพื่อน', 'ภารกิจหาเพื่อนคุยให้เพื่อนซี้'],
        deliverablesSummary: 'TikTok 2 คลิป',
        campaignHighlight: 'คลิปภารกิจช่วยเพื่อนโสดปัดแอป OMI เรียกเสียงฮาและยอดแชร์จากคนโสดทะลุหมื่นแชร์',
        sampleClips: [
          {
            id: 'omi-clip-1',
            title: 'เมื่อเพื่อนบ่นเหงาทุกวัน เลยจับโหลดแอป OMI ซะเลย!',
            platform: 'TikTok',
            views: '890K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Dating & Friendship Sitcom',
          },
        ],
      },
      {
        id: 'brand-topvalue',
        brandName: 'Topvalue',
        brandNameTh: 'ท็อปแวลู ช้อปปิ้งออนไลน์',
        category: 'Tech, Telecom & Apps',
        brandColor: '#DC2626',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '980K+',
        avgEngagement: '6.9%',
        latestPeriod: 'ธันวาคม 2568',
        videoStyles: ['Unboxing แกะกล่องเครื่องใช้ไฟฟ้า/แก็ดเจ็ต', 'ป้ายยาโปรลดแรง'],
        deliverablesSummary: 'TikTok + Facebook Reels',
        campaignHighlight: 'รีวิวสั่งของออนไลน์ส่งไวรับประกันของแท้จาก Topvalue',
        sampleClips: [
          {
            id: 'topvalue-clip-1',
            title: 'ช้อปของเข้าคอนโดราคาคุ้มเกินคาดที่ Topvalue',
            platform: 'TikTok',
            views: '540K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Unboxing & Deal',
          },
        ],
      },
      {
        id: 'brand-oukitel',
        brandName: 'Oukitel',
        brandNameTh: 'อูกิเทล สมาร์ทโฟนและแท็บเล็ตสายอึด',
        category: 'Tech, Telecom & Apps',
        brandColor: '#F97316',
        campaignCount: 1,
        isRepeatPartner: false,
        totalViews: '680K+',
        avgEngagement: '7.4%',
        latestPeriod: 'ตุลาคม 2568',
        videoStyles: ['ทดสอบความอึดแบตเตอรี่', 'รีวิวแก็ดเจ็ตลุยทริปแคมป์ปิ้ง'],
        deliverablesSummary: 'TikTok 1 คลิป + YouTube Shorts',
        campaignHighlight: 'ทดสอบความทนทานและแบตอึดข้ามวันในสถานการณ์จริงแบบเข้าใจง่าย',
        sampleClips: [
          {
            id: 'oukitel-clip-1',
            title: 'มือถืออะไรแบตอึดเหมือนพาวเวอร์แบงก์! พกเครื่องเดียวเที่ยวได้ทั้งทริป',
            platform: 'TikTok',
            views: '680K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Gadget Test',
          },
        ],
      },
      {
        id: 'brand-insurverse',
        brandName: 'Insurverse',
        brandNameTh: 'อินชัวร์เวิร์ส ประกันออนไลน์ดิจิทัล',
        category: 'Tech, Telecom & Apps',
        brandColor: '#4F46E5',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.2M+',
        avgEngagement: '7.1%',
        latestPeriod: 'มกราคม 2569',
        videoStyles: ['เปลี่ยนเรื่องประกันให้เข้าใจง่ายใน 1 นาที', 'โร้ดทริปขับรถเที่ยวกับเพื่อน'],
        deliverablesSummary: 'TikTok 2 คลิป + Facebook Reels',
        campaignHighlight: 'ย่อยเรื่องการปรับแต่งแผนประกันรถยนต์ออนไลน์ด้วยตัวเองให้กลายเป็นเรื่องง่ายสำหรับคนรุ่นใหม่',
        sampleClips: [
          {
            id: 'insurverse-clip-1',
            title: 'ขับรถเที่ยวกับเพื่อนให้อุ่นใจ ปรับแผนประกันเองได้ไม่ง้อใครที่ Insurverse',
            platform: 'TikTok',
            views: '650K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'InsurTech Sitcom',
          },
        ],
      },

      // === 3. GAMING & ENTERTAINMENT (3 Brands from Slide 04) ===
      {
        id: 'brand-garena',
        brandName: 'Garena',
        brandNameTh: 'การีนา ประเทศไทย',
        category: 'Gaming & Entertainment',
        brandColor: '#DC2626',
        campaignCount: 4,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '3.2M+',
        avgEngagement: '8.8%',
        latestPeriod: 'มีนาคม 2569',
        videoStyles: ['ละครสั้นชีวิตจริงชาวเกมเมอร์', 'ชวนตี้เล่นเกมช่วงเทศกาล', 'อัปเดตกิจกรรมแจกสกิน'],
        deliverablesSummary: 'TikTok 4 คลิป + Facebook Gaming Cross-post',
        campaignHighlight: 'จำลองเหตุการณ์เวลาเพื่อนชวนเล่นเกม Garena ตอนบอกว่าจะนอนแล้ว คนดูแท็กเพื่อนในตี้คอมเมนต์กันสนั่น',
        clientQuote: 'เข้าถึงคอมมูนิตี้เกมเมอร์สายแคชชวลและกลุ่มเพื่อนได้ดีเยี่ยม ยอด Engagement สูงกว่าค่าเฉลี่ยมากครับ',
        clientRole: 'Community & Influencer Lead · Garena Thailand',
        sampleClips: [
          {
            id: 'garena-clip-1',
            title: 'เมื่อเพื่อนบอกว่า "ตาสุดท้ายแล้วนอนจริง" ... ตัดภาพมาตอนเช้า!',
            platform: 'TikTok',
            views: '1.4M',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Gaming Comedy',
          },
        ],
      },
      {
        id: 'brand-rov',
        brandName: 'ROV',
        brandNameTh: 'RoV (Arena of Valor)',
        category: 'Gaming & Entertainment',
        brandColor: '#D97706',
        campaignCount: 5,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '3.9M+',
        avgEngagement: '9.1%',
        latestPeriod: 'เมษายน 2569',
        videoStyles: ['รวมประเภทเพื่อนเวลาลงแรงก์ RoV', 'โปรโมตกิจกรรมแจกสกินฟรียกเซิร์ฟ'],
        deliverablesSummary: 'TikTok 5 คลิป + YouTube Shorts + Facebook Reels',
        campaignHighlight: 'ซีรีส์ "ประเภทเพื่อนเวลาเล่น RoV" ทำยอดวิวทะลุล้านแทบทุกตอน เป็นหนึ่งในหมวดคอนเทนต์ที่ไวรัลที่สุดของช่อง',
        sampleClips: [
          {
            id: 'rov-clip-1',
            title: 'รวมอาการเพื่อนซี้เวลาลงแรงก์ RoV ด้วยกัน มิตรภาพยังมีอยู่ไหม!',
            platform: 'TikTok',
            views: '1.7M',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'RoV Squad Sitcom',
          },
        ],
      },
      {
        id: 'brand-genshin',
        brandName: 'Genshin Impact',
        brandNameTh: 'เกนชิน อิมแพกต์ (HoYoverse)',
        category: 'Gaming & Entertainment',
        brandColor: '#0284C7',
        campaignCount: 2,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '1.6M+',
        avgEngagement: '8.4%',
        latestPeriod: 'กุมภาพันธ์ 2569',
        videoStyles: ['ชวนเพื่อนสำรวจแมปอัปเดตแพตช์ใหม่', 'ลุ้นสุ่มกาชาตัวละครใหม่กับเพื่อน'],
        deliverablesSummary: 'TikTok 2 คลิป + YouTube Shorts',
        campaignHighlight: 'คอนเทนต์ลุ้นกดกาชาตัวละครใหม่คู่กับเพื่อนสนิท เรียกคอมเมนต์สายเกลือและสายดวงดีเข้ามามีส่วนร่วมเพียบ',
        sampleClips: [
          {
            id: 'genshin-clip-1',
            title: 'พิธีกรรมสุ่มกาชา Genshin Impact เมื่อให้เพื่อนช่วยกดให้!',
            platform: 'TikTok',
            views: '860K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Gaming Lifestyle',
          },
        ],
      },

      // === 4. BEAUTY & PERSONAL CARE (12 Brands from Slide 04) ===
      {
        id: 'brand-watsons',
        brandName: 'Watsons',
        brandNameTh: 'วัตสัน ประเทศไทย',
        category: 'Beauty & Personal Care',
        brandColor: '#0D9488',
        campaignCount: 5,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '3.0M+',
        avgEngagement: '8.0%',
        latestPeriod: 'มีนาคม 2569',
        videoStyles: ['พาช้อปโปรชิ้นที่สอง 1 บาทหน้าร้าน', 'ป้ายยาไอเทมเด็ดใน Watsons'],
        deliverablesSummary: 'TikTok 5 คลิป + IG Reels (Store Visit)',
        campaignHighlight: 'คลิปพาเพื่อนเดินช้อปโปรชิ้นที่สอง 1 บาทที่ Watsons กลายเป็นคลิปป้ายยาที่คนแชร์ชวนเพื่อนไปหารกันเยอะที่สุด',
        clientQuote: 'ตรงกลุ่มลูกค้า Watsons มาก เพราะโปรชิ้นที่สอง 1 บาทต้องชวนเพื่อนมาหาร จุ๊ยจุ๊ยสื่อสารจุดนี้ออกมาได้เป๊ะที่สุดค่ะ',
        clientRole: 'PR & Influencer Team · Watsons Thailand',
        sampleClips: [
          {
            id: 'watsons-clip-1',
            title: 'ตั้งใจมาซื้อสำลีห่อเดียว... แต่เดินออกจาก Watsons พร้อมถุงใหญ่เพราะเพื่อนป้ายยา!',
            platform: 'TikTok',
            views: '1.2M',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Shopping Haul & Sitcom',
          },
        ],
      },
      {
        id: 'brand-garnier',
        brandName: 'Garnier',
        brandNameTh: 'การ์นิเย่ ประเทศไทย',
        category: 'Beauty & Personal Care',
        brandColor: '#16A34A',
        campaignCount: 4,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '2.6M+',
        avgEngagement: '7.7%',
        latestPeriod: 'กุมภาพันธ์ 2569',
        videoStyles: ['Skincare Routine กู้ผิวใสก่อนออกทริป', 'ท้าพิสูจน์ผิวไบรท์คู่เพื่อน'],
        deliverablesSummary: 'TikTok + Instagram Reels + TikTok Shop Affiliate Link',
        campaignHighlight: 'รีวิวเซรั่มและกันแดด Garnier แบบใช้งานจริงกลางแจ้ง เห็นเนื้อสัมผัสชัดเจนและดูจริงใจ',
        sampleClips: [
          {
            id: 'garnier-clip-1',
            title: 'ออกกองตากแดดทั้งวันทำไมหน้ายังไบรท์? เปิดกระเป๋าเช็กไอเทมลับ!',
            platform: 'TikTok',
            views: '950K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Beauty & Lifestyle',
          },
        ],
      },
      {
        id: 'brand-unilever',
        brandName: 'Unilever',
        brandNameTh: 'ยูนิลีเวอร์ ประเทศไทย',
        category: 'Beauty & Personal Care',
        brandColor: '#1E40AF',
        campaignCount: 5,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '3.3M+',
        avgEngagement: '7.5%',
        latestPeriod: 'มีนาคม 2569',
        videoStyles: ['ของใช้จำเป็นในชีวิตประจำวัน', 'ป้ายยาโปรคุ้มยกแพ็ก'],
        deliverablesSummary: 'Multi-Brand Campaigns บน TikTok และ Facebook Reels',
        campaignHighlight: 'ร่วมงานต่อเนื่องกับหลากหลายแบรนด์ในเครือ Unilever ทั้งกลุ่ม Personal Care และ Home Care',
        sampleClips: [
          {
            id: 'unilever-clip-1',
            title: 'เปิดกรุของใช้คู่ใจในห้องน้ำที่ขาดไม่ได้ ซื้อซ้ำตลอดปี!',
            platform: 'TikTok',
            views: '880K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Daily Essentials',
          },
        ],
      },
      {
        id: 'brand-twelveplus',
        brandName: 'Twelve Plus',
        brandNameTh: 'ทเวลฟ์ พลัส',
        category: 'Beauty & Personal Care',
        brandColor: '#DB2777',
        campaignCount: 3,
        isRepeatPartner: true,
        totalViews: '1.7M+',
        avgEngagement: '7.9%',
        latestPeriod: 'มกราคม 2569',
        videoStyles: ['ตัวหอมมั่นใจตลอดวัน', 'เพื่อนทักว่าใช้น้ำหอมอะไร'],
        deliverablesSummary: 'TikTok 3 คลิป + IG Reels',
        campaignHighlight: 'เล่าเรื่องความมั่นใจด้วยกลิ่นหอมติดทนของ Twelve Plus ผ่านซิตคอมน่ารักๆ',
        sampleClips: [
          {
            id: 'twelveplus-clip-1',
            title: 'เมื่อเดินผ่านเพื่อนแล้วเพื่อนถามว่าฉีดน้ำหอมเคาน์เตอร์แบรนด์ตัวไหน!',
            platform: 'TikTok',
            views: '710K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Beauty Sitcom',
          },
        ],
      },
      {
        id: 'brand-exit',
        brandName: 'Exit',
        brandNameTh: 'เอ็กซิท โรลออนและสเปรย์ระงับกลิ่นกาย',
        category: 'Beauty & Personal Care',
        brandColor: '#1D4ED8',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.3M+',
        avgEngagement: '7.6%',
        latestPeriod: 'ธันวาคม 2568',
        videoStyles: ['เล่นกีฬา/ทำกิจกรรมลุยๆ กับเพื่อน', 'ความมั่นใจไร้กลิ่นเหงื่อ'],
        deliverablesSummary: 'TikTok 2 คลิป',
        campaignHighlight: 'คอนเทนต์สายฮาทำกิจกรรมเหงื่อออกหนักแต่ยังหอมมั่นใจด้วย Exit',
        sampleClips: [
          {
            id: 'exit-clip-1',
            title: 'เต้นแรงแค่ไหนก็ยังรอด! ไอเทมลับเพิ่มความมั่นใจของชาวแก๊ง',
            platform: 'TikTok',
            views: '690K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Active Lifestyle',
          },
        ],
      },
      {
        id: 'brand-ingon',
        brandName: 'Ing On',
        brandNameTh: 'อิงอร สบู่สมุนไพร',
        category: 'Beauty & Personal Care',
        brandColor: '#15803D',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.1M+',
        avgEngagement: '7.2%',
        latestPeriod: 'พฤศจิกายน 2568',
        videoStyles: ['รีวิวอาบน้ำผิวกระจ่างใส', 'ป้ายยาสบู่สมุนไพรคู่บ้าน'],
        deliverablesSummary: 'TikTok + Facebook Reels',
        campaignHighlight: 'ปรับภาพลักษณ์สบู่สมุนไพรอิงอรให้เข้าถึงกลุ่มวัยรุ่น Gen Z ด้วยการเล่าเรื่องที่ทันสมัยและตลก',
        sampleClips: [
          {
            id: 'ingon-clip-1',
            title: 'เคล็ดลับผิวเนียนใสในงบหลักสิบที่เพื่อนแอบใช้มาตลอด!',
            platform: 'TikTok',
            views: '590K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Skincare Review',
          },
        ],
      },
      {
        id: 'brand-numju',
        brandName: 'Numju',
        brandNameTh: 'นัมจู โลชั่นวิตามินเกาหลี',
        category: 'Beauty & Personal Care',
        brandColor: '#EC4899',
        campaignCount: 3,
        isRepeatPartner: true,
        totalViews: '1.9M+',
        avgEngagement: '8.1%',
        latestPeriod: 'มกราคม 2569',
        videoStyles: ['ท้าเทียบผิวก่อน-หลังทา', 'ป้ายยาไอเทมผิวใสในเซเว่น'],
        deliverablesSummary: 'TikTok 3 คลิป + ตะกร้า TikTok Shop',
        campaignHighlight: 'ป้ายยาโลชั่นนัมจูแบบเพื่อนสาวแนะนำกัน ยอดคลิกตะกร้าและคอมเมนต์ถามพิกัดสูงมาก',
        sampleClips: [
          {
            id: 'numju-clip-1',
            title: 'ตัวช่วยกู้ผิวคล้ำแดดหลังกลับจากทะเลที่เพื่อนป้ายยามาอีกที!',
            platform: 'TikTok',
            views: '780K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Beauty UGC',
          },
        ],
      },
      {
        id: 'brand-vitc',
        brandName: 'Vit C',
        brandNameTh: 'วิตซี ไบโอ เฟซ (VC Vit C)',
        category: 'Beauty & Personal Care',
        brandColor: '#F97316',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.2M+',
        avgEngagement: '7.4%',
        latestPeriod: 'ตุลาคม 2568',
        videoStyles: ['รีวิวสกินแคร์วิตซีผิวใส', 'Get Ready With Me (GRWM)'],
        deliverablesSummary: 'TikTok 2 คลิป + IG Reels',
        campaignHighlight: 'คลิป GRWM เตรียมตัวออกไปเที่ยวกับเพื่อนพร้อมบำรุงผิวด้วย Vit C',
        sampleClips: [
          {
            id: 'vitc-clip-1',
            title: 'GRWM เตรียมผิวใสออกไปถ่ายรูปคาเฟ่กับเพื่อนซี้',
            platform: 'TikTok',
            views: '640K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'GRWM & Skincare',
          },
        ],
      },
      {
        id: 'brand-nigao',
        brandName: 'Nigao',
        brandNameTh: 'นิกาโอะ ผลิตภัณฑ์เปลี่ยนสีผมและบำรุงผม',
        category: 'Beauty & Personal Care',
        brandColor: '#E11D48',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.4M+',
        avgEngagement: '8.0%',
        latestPeriod: 'ธันวาคม 2568',
        videoStyles: ['ผลัดกันย้อมสีผมให้เพื่อนที่ห้อง', 'รีวิวทรีตเมนต์บำรุงผมนุ่มลื่น'],
        deliverablesSummary: 'TikTok 2 คลิป + IG Reels',
        campaignHighlight: 'โมเมนต์เพื่อนช่วยย้อมสีผมให้กันด้วย Nigao ไม่มีกลิ่นฉุน สีสวยตรงปก คนดูเซฟคลิปไว้ย้อมตามเยอะมาก',
        sampleClips: [
          {
            id: 'nigao-clip-1',
            title: 'เมื่อไว้ใจให้เพื่อนย้อมสีผมให้ด้วย Nigao ผลลัพธ์คือจึ้งเกินคาด!',
            platform: 'TikTok',
            views: '810K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Hair Makeover Vlog',
          },
        ],
      },
      {
        id: 'brand-nakiz',
        brandName: 'Nakiz',
        brandNameTh: 'นาคิส ครีมบำรุงผิวกายเฉพาะจุด',
        category: 'Beauty & Personal Care',
        brandColor: '#0284C7',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '960K+',
        avgEngagement: '7.1%',
        latestPeriod: 'กันยายน 2568',
        videoStyles: ['คุยเปิดใจแบบเพื่อนสาว', 'ป้ายยาไอเทมเพิ่มความมั่นใจ'],
        deliverablesSummary: 'TikTok 2 คลิป',
        campaignHighlight: 'เปลี่ยนเรื่องที่พูดยากให้กลายเป็นเรื่องธรรมชาติแบบเพื่อนสนิทแนะนำของดีให้กัน',
        sampleClips: [
          {
            id: 'nakiz-clip-1',
            title: 'เรื่องลับๆ ที่คุยได้แค่กับเพื่อนสนิท! ไอเทมเพิ่มความมั่นใจใส่ชุดไหนก็รอด',
            platform: 'TikTok',
            views: '530K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Bestie Talk & Review',
          },
        ],
      },
      {
        id: 'brand-charminggarden',
        brandName: 'The Charming Garden',
        brandNameTh: 'เดอะ ชาร์มมิ่ง การ์เด้น',
        category: 'Beauty & Personal Care',
        brandColor: '#16A34A',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.1M+',
        avgEngagement: '7.5%',
        latestPeriod: 'พฤศจิกายน 2568',
        videoStyles: ['รีวิวเจลกู้ผิวใส', 'ป้ายยาสกินแคร์ซอง'],
        deliverablesSummary: 'TikTok 2 คลิป + IG Story',
        campaignHighlight: 'โชว์เนื้อสัมผัสและการซึมไวของผลิตภัณฑ์ เหมาะกับสภาพอากาศเมืองไทย',
        sampleClips: [
          {
            id: 'cg-clip-1',
            title: 'กู้ผิวโทรมหลังปาร์ตี้หนักด้วยไอเทมเด็ดจาก The Charming Garden',
            platform: 'TikTok',
            views: '580K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Skincare Routine',
          },
        ],
      },
      {
        id: 'brand-etacha',
        brandName: 'Etacha',
        brandNameTh: 'เอทาชา',
        category: 'Beauty & Personal Care',
        brandColor: '#9333EA',
        campaignCount: 1,
        isRepeatPartner: false,
        totalViews: '510K+',
        avgEngagement: '6.8%',
        latestPeriod: 'สิงหาคม 2568',
        videoStyles: ['รีวิวบิวตี้ไลฟ์สไตล์', 'ป้ายยาไอเทมดูแลตัวเอง'],
        deliverablesSummary: 'TikTok 1 คลิป',
        campaignHighlight: 'นำเสนอจุดขายสินค้าอย่างกระชับและน่าเชื่อถือในสไตล์ UGC',
        sampleClips: [
          {
            id: 'etacha-clip-1',
            title: 'ลองแล้วชอบมาก! ป้ายยาตัวช่วยดูแลตัวเองจาก Etacha',
            platform: 'TikTok',
            views: '510K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'UGC Beauty',
          },
        ],
      },

      // === 5. RETAIL, HOME & LIFESTYLE (14 Brands from Slide 04) ===
      {
        id: 'brand-bigc',
        brandName: 'Big C',
        brandNameTh: 'บิ๊กซี ซูเปอร์เซ็นเตอร์',
        category: 'Retail, Home & Lifestyle',
        brandColor: '#16A34A',
        campaignCount: 4,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '2.7M+',
        avgEngagement: '7.9%',
        latestPeriod: 'มีนาคม 2569',
        videoStyles: ['ชาเลนจ์ช้อปของเข้าบ้านในงบจำกัด', 'พาเดินหาของอร่อยใน Big C'],
        deliverablesSummary: 'TikTok 4 คลิป + Facebook Reels',
        campaignHighlight: 'ชาเลนจ์หยิบของลงรถเข็น Big C ภายใน 3 นาทีกับเพื่อนสนิท ลุ้นสนุกและโชว์ความหลากหลายของสินค้าครบทุกโซน',
        clientQuote: 'ทำให้การเดินซูเปอร์มาร์เก็ตดูสนุกและเข้าถึงคนรุ่นใหม่ได้ดีมาก ยอดวิวบน Facebook และ TikTok สูงทั้งสองช่องทางเลยครับ',
        clientRole: 'Digital Marketing · Big C Supercenter',
        sampleClips: [
          {
            id: 'bigc-clip-1',
            title: 'ท้าช้อป Big C งบ 1,000 บาท ใครหยิบของคุ้มกว่าชนะ!',
            platform: 'TikTok',
            views: '1.1M',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Supermarket Challenge',
          },
        ],
      },
      {
        id: 'brand-cjexpress',
        brandName: 'CJ Express',
        brandNameTh: 'ซีเจ มอร์ (CJ MORE)',
        category: 'Retail, Home & Lifestyle',
        brandColor: '#059669',
        campaignCount: 4,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '2.5M+',
        avgEngagement: '8.2%',
        latestPeriod: 'กุมภาพันธ์ 2569',
        videoStyles: ['พาทัวร์ป้ายยาของลดราคาใน CJ', 'รีวิวโซนบิวตี้และของกินเล่น'],
        deliverablesSummary: 'TikTok 4 คลิป + Facebook Reels',
        campaignHighlight: 'พาสำรวจแต่ละโซนใน CJ MORE แบบเพื่อนพากันช้อปของถูกและดี ยอดแชร์เก็บพิกัดสูงมาก',
        sampleClips: [
          {
            id: 'cj-clip-1',
            title: 'หลงเข้า CJ MORE ทีไร ไม่เคยได้ของชิ้นเดียวออกสักที!',
            platform: 'TikTok',
            views: '970K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Retail Store Tour',
          },
        ],
      },
      {
        id: 'brand-homepro',
        brandName: 'HomePro',
        brandNameTh: 'โฮมโปร',
        category: 'Retail, Home & Lifestyle',
        brandColor: '#0284C7',
        campaignCount: 3,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '1.9M+',
        avgEngagement: '7.4%',
        latestPeriod: 'มกราคม 2569',
        videoStyles: ['แต่งห้องคอนโดใหม่กับรูมเมท', 'พาช้อปงาน HomePro Expo'],
        deliverablesSummary: 'TikTok 3 คลิป + IG Reels',
        campaignHighlight: 'จำลองการเถียงกันเรื่องสไตล์แต่งห้องของคู่เพื่อนรูมเมท แล้วไปจบครบทุกสไตล์ที่ HomePro',
        sampleClips: [
          {
            id: 'homepro-clip-1',
            title: 'เมื่อรูมเมทคนนึงสายมินิมอล อีกคนสายสีสัน... ไปเดิน HomePro ด้วยกันจะเป็นยังไง!',
            platform: 'TikTok',
            views: '840K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Home & Living Sitcom',
          },
        ],
      },
      {
        id: 'brand-kingpower',
        brandName: 'King Power',
        brandNameTh: 'คิง เพาเวอร์ ดิวตี้ฟรี',
        category: 'Retail, Home & Lifestyle',
        brandColor: '#1E3A8A',
        campaignCount: 2,
        isRepeatPartner: true,
        isFeatured: true,
        totalViews: '1.6M+',
        avgEngagement: '7.8%',
        latestPeriod: 'ธันวาคม 2568',
        videoStyles: ['Travel Vlog ช้อปก่อนบินกับเพื่อน', 'ช้อปดิวตี้ฟรีแบบไม่มีไฟลต์บิน'],
        deliverablesSummary: 'TikTok + Instagram Reels',
        campaignHighlight: 'พาทัวร์ช้อปปิ้งและกินของอร่อยที่ King Power รางน้ำ พร้อมป้ายยาโปรโมชั่นสุดคุ้มก่อนออกทริปต่างประเทศ',
        sampleClips: [
          {
            id: 'kingpower-clip-1',
            title: 'ซ้อมไปต่างประเทศ! พาเพื่อนเดินช้อปฟีลสนามบินที่ King Power',
            platform: 'Instagram Reels',
            views: '820K',
            url: 'https://www.instagram.com',
            formatTag: 'Travel & Duty Free Vlog',
          },
        ],
      },
      {
        id: 'brand-thailandpost',
        brandName: 'Thailand Post',
        brandNameTh: 'ไปรษณีย์ไทย (EMS)',
        category: 'Retail, Home & Lifestyle',
        brandColor: '#DC2626',
        campaignCount: 3,
        isRepeatPartner: true,
        totalViews: '2.0M+',
        avgEngagement: '8.0%',
        latestPeriod: 'กุมภาพันธ์ 2569',
        videoStyles: ['ส่งของขวัญเซอร์ไพรส์เพื่อนส่งด่วน EMS', 'ละครสั้นพ่อค้าแม่ค้าออนไลน์'],
        deliverablesSummary: 'TikTok 3 คลิป + Facebook Reels',
        campaignHighlight: 'สื่อสารความรวดเร็วและเช็กสถานะได้ทุกขั้นตอนของ EMS ไปรษณีย์ไทยผ่านมุกตลกเข้าใจง่าย',
        sampleClips: [
          {
            id: 'thaipost-clip-1',
            title: 'ส่งของด่วนให้เพื่อนทันวันเกิดแบบไม่ต้องลุ้น เพราะส่ง EMS ไปรษณีย์ไทย!',
            platform: 'TikTok',
            views: '890K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Service Sitcom',
          },
        ],
      },
      {
        id: 'brand-caltex',
        brandName: 'Caltex',
        brandNameTh: 'คาลเท็กซ์ ประเทศไทย',
        category: 'Retail, Home & Lifestyle',
        brandColor: '#DC2626',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.3M+',
        avgEngagement: '7.3%',
        latestPeriod: 'มกราคม 2569',
        videoStyles: ['Road Trip ขับรถเที่ยวต่างจังหวัดกับแก๊งเพื่อน', 'แวะปั๊มเติมพลังทั้งรถทั้งคน'],
        deliverablesSummary: 'TikTok 2 คลิป + Facebook Reels',
        campaignHighlight: 'คอนเทนต์ขับรถเที่ยววันหยุด แวะเติมน้ำมัน Caltex Techron พร้อมสะสมพอยท์สุดคุ้ม',
        sampleClips: [
          {
            id: 'caltex-clip-1',
            title: 'โร้ดทริปนี้ไม่มีสะดุด แวะเติมพลังที่ Caltex ก่อนลุยต่อยาวๆ',
            platform: 'TikTok',
            views: '680K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Road Trip Vlog',
          },
        ],
      },
      {
        id: 'brand-smarthome',
        brandName: 'Smarthome',
        brandNameTh: 'สมาร์ทโฮม เครื่องใช้ไฟฟ้าในบ้าน',
        category: 'Retail, Home & Lifestyle',
        brandColor: '#EA580C',
        campaignCount: 3,
        isRepeatPartner: true,
        totalViews: '1.6M+',
        avgEngagement: '7.7%',
        latestPeriod: 'ธันวาคม 2568',
        videoStyles: ['ทำหมูกระทะ/ชาบูในห้องกับเพื่อน', 'รีวิวหม้อทอดไร้น้ำมันสุดคุ้ม'],
        deliverablesSummary: 'TikTok 3 คลิป + ตะกร้าสินค้า',
        campaignHighlight: 'รีวิวเตาปิ้งย่างและหม้อชาบู Smarthome ตอนตั้งวงกินกับเพื่อนที่คอนโด ปิดการขายในตะกร้าได้ดีมาก',
        sampleClips: [
          {
            id: 'smarthome-clip-1',
            title: 'ตั้งตี้หมูกระทะชาบูในห้องแบบไร้ควันด้วยเตา Smarthome ตัวตึง!',
            platform: 'TikTok',
            views: '740K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Home Appliance & Food',
          },
        ],
      },
      {
        id: 'brand-hotwave',
        brandName: 'Hotwave',
        brandNameTh: 'ฮอตเวฟ เครื่องใช้ไฟฟ้าครัวเรือน',
        category: 'Retail, Home & Lifestyle',
        brandColor: '#E11D48',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.0M+',
        avgEngagement: '7.1%',
        latestPeriod: 'ตุลาคม 2568',
        videoStyles: ['ทำเมนูของว่างง่ายๆ ด้วยเครื่องใช้ไฟฟ้า', 'รีวิวไอเทมเด็กหอ'],
        deliverablesSummary: 'TikTok 2 คลิป',
        campaignHighlight: 'ป้ายยาเครื่องใช้ไฟฟ้าคู่ใจเด็กหอและชาวคอนโด ใช้งานง่าย ประหยัดเวลา',
        sampleClips: [
          {
            id: 'hotwave-clip-1',
            title: 'ไอเทมลับเด็กหอ ทำของกินอร่อยได้ในพริบตาด้วย Hotwave',
            platform: 'TikTok',
            views: '540K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Condo Life Review',
          },
        ],
      },
      {
        id: 'brand-procoro',
        brandName: 'Procoro',
        brandNameTh: 'โปรโคโร่ อุปกรณ์จัดเก็บและของใช้ในบ้าน',
        category: 'Retail, Home & Lifestyle',
        brandColor: '#2563EB',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '920K+',
        avgEngagement: '7.0%',
        latestPeriod: 'พฤศจิกายน 2568',
        videoStyles: ['จัดระเบียบห้องรกของเพื่อน', 'Before & After จัดห้องใหม่'],
        deliverablesSummary: 'TikTok 2 คลิป',
        campaignHighlight: 'บุกจัดระเบียบห้องเพื่อนที่ของรกเต็มพื้นด้วยกล่องและชั้นวาง Procoro ดูเพลินจนจบคลิป',
        sampleClips: [
          {
            id: 'procoro-clip-1',
            title: 'ภารกิจกู้ห้องรกของเพื่อนให้กลับมาดูดีเหมือนห้องตัวอย่าง!',
            platform: 'TikTok',
            views: '510K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Room Makeover',
          },
        ],
      },
      {
        id: 'brand-doslife',
        brandName: 'DOS Life',
        brandNameTh: 'ดอส ไลฟ์ ถังเก็บน้ำคุณภาพ',
        category: 'Retail, Home & Lifestyle',
        brandColor: '#0284C7',
        campaignCount: 1,
        isRepeatPartner: false,
        totalViews: '680K+',
        avgEngagement: '6.9%',
        latestPeriod: 'กันยายน 2568',
        videoStyles: ['ละครสั้นปัญหาคนอยู่บ้านน้ำไม่ไหล', 'ความรู้คู่บ้านแบบสนุกๆ'],
        deliverablesSummary: 'TikTok 1 คลิป + Facebook Reels',
        campaignHighlight: 'เปลี่ยนสินค้ากลุ่มถังเก็บน้ำที่ปกติเล่าให้สนุกยาก ให้กลายเป็นซิตคอมตลกที่คนดูจำแบรนด์ DOS Life ได้แม่นยำ',
        sampleClips: [
          {
            id: 'dos-clip-1',
            title: 'จังหวะนรกเมื่อฟอกสบู่เต็มหน้าแล้วน้ำประปาหยุดไหล! บ้านยุคนี้ต้องมี DOS Life',
            platform: 'TikTok',
            views: '680K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Home Comedy Sitcom',
          },
        ],
      },
      {
        id: 'brand-painelief',
        brandName: 'Painelief',
        brandNameTh: 'เพนเนลีฟ ไอเทมคลายปวดเมื่อย',
        category: 'Retail, Home & Lifestyle',
        brandColor: '#0D9488',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '950K+',
        avgEngagement: '7.4%',
        latestPeriod: 'ธันวาคม 2568',
        videoStyles: ['อาการปวดหลังของชาวออฟฟิศ/วัยรุ่นสร้างตัว', 'ป้ายยาตัวช่วยคลายเมื่อย'],
        deliverablesSummary: 'TikTok 2 คลิป',
        campaignHighlight: 'หยิบอินไซต์วัยรุ่นปวดหลังมาทำเป็นมุกตลก โดนใจกลุ่มคนทำงานหน้าคอมและสายเดินช้อปทั้งวัน',
        sampleClips: [
          {
            id: 'painelief-clip-1',
            title: 'อายุแค่นี้แต่ปวดหลังเหมือนผ่านโลกมามาก! ตัวช่วยชีวิตต้องเข้า',
            platform: 'TikTok',
            views: '520K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Office & Lifestyle Sitcom',
          },
        ],
      },
      {
        id: 'brand-zato',
        brandName: 'Zato',
        brandNameTh: 'ซาโต้',
        category: 'Retail, Home & Lifestyle',
        brandColor: '#4F46E5',
        campaignCount: 1,
        isRepeatPartner: false,
        totalViews: '460K+',
        avgEngagement: '6.6%',
        latestPeriod: 'สิงหาคม 2568',
        videoStyles: ['รีวิวสินค้าไลฟ์สไตล์', 'Short Sitcom'],
        deliverablesSummary: 'TikTok 1 คลิป',
        campaignHighlight: 'นำเสนอจุดเด่นและการใช้งานจริงในชีวิตประจำวันแบบกระชับเข้าใจง่าย',
        sampleClips: [
          {
            id: 'zato-clip-1',
            title: 'ไอเทมดีบอกต่อจาก Zato ที่ลองใช้แล้วต้องมาป้ายยาเพื่อน',
            platform: 'TikTok',
            views: '460K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Lifestyle Review',
          },
        ],
      },
      {
        id: 'brand-blb',
        brandName: 'BLB',
        brandNameTh: 'บีแอลบี',
        category: 'Retail, Home & Lifestyle',
        brandColor: '#334155',
        campaignCount: 1,
        isRepeatPartner: false,
        totalViews: '440K+',
        avgEngagement: '6.5%',
        latestPeriod: 'กรกฎาคม 2568',
        videoStyles: ['รีวิวการใช้งานจริง', 'UGC Storytelling'],
        deliverablesSummary: 'TikTok 1 คลิป',
        campaignHighlight: 'สร้างการรับรู้แบรนด์ผ่านคอนเทนต์สั้นที่ดูสนุกและเป็นกันเอง',
        sampleClips: [
          {
            id: 'blb-clip-1',
            title: 'รีวิวจัดเต็มกับ BLB ตัวช่วยที่ตอบโจทย์ไลฟ์สไตล์ยุคใหม่',
            platform: 'TikTok',
            views: '440K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'UGC Review',
          },
        ],
      },
      {
        id: 'brand-wisdom',
        brandName: 'Wisdom',
        brandNameTh: 'วิสดอม บุฟเฟต์ / ไลฟ์สไตล์',
        category: 'Retail, Home & Lifestyle',
        brandColor: '#B45309',
        campaignCount: 2,
        isRepeatPartner: true,
        totalViews: '1.3M+',
        avgEngagement: '7.9%',
        latestPeriod: 'มกราคม 2569',
        videoStyles: ['พาเพื่อนไปฉลองโอกาสพิเศษ', 'รีวิวประสบการณ์พรีเมียม'],
        deliverablesSummary: 'TikTok 2 คลิป + IG Reels',
        campaignHighlight: 'พาไปสัมผัสประสบการณ์สุดพิเศษกับเพื่อนซี้ ยอดเซฟคลิปเก็บไว้เป็นลิสต์ไปฉลองวันเกิดกับเพื่อนสูงมาก',
        sampleClips: [
          {
            id: 'wisdom-clip-1',
            title: 'พาเพื่อนซี้มาจัดเต็มความพรีเมียมที่ Wisdom บอกเลยว่าฟินทุกเมนู!',
            platform: 'TikTok',
            views: '720K',
            url: 'https://www.tiktok.com/@juijui.j',
            formatTag: 'Premium Lifestyle Vlog',
          },
        ],
      },
    ],
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
