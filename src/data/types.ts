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
  driveVideoUrl?: string;
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
  faviconMode?: 'emoji' | 'avatar' | 'custom';
  faviconEmoji?: string;
  faviconUrl?: string;
  faviconShape?: 'circle' | 'rounded' | 'square';
  browserTabTitle?: string;
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
