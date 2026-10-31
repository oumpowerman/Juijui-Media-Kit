export type StatsTimeframe = '28d' | '60d' | 'lifetime';

export interface TimeframePlatformMetrics {
  views: string;
  likes: string;
  comments: string;
  shares: string;
  er: string;
  erNum: number;
}

export interface TimeframeOverviewMetrics {
  totalViews: string;
  totalEr: string;
  avgViewsPerContent: string;
  monthlyReach: string;
  monthlyLikes: string;
  periodBadgeLabel?: string;
}

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
  timeframes?: Record<StatsTimeframe, TimeframePlatformMetrics>;
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
  platformScopeLabel?: string;
  distributionSubLabel?: string;
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
  description?: string;
  campaignName?: string;
  driveVideoUrl?: string;
  thumbnailUrl?: string;
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

export interface ProofSummaryConfig {
  ratingScore?: string;
  ratingLabel?: string;
  ratingSubtitle?: string;
  sentimentPercent?: string;
  sentimentTitle?: string;
  sentimentSubtitle?: string;
  verifiedTitle?: string;
  verifiedSubtitle?: string;
}

export interface SectionHeadersConfig {
  analyticsBadge?: string;
  analyticsTitle?: string;
  analyticsSubtitle?: string;
  viralBadge?: string;
  viralTitle?: string;
  viralSubtitle?: string;
  proofBadge?: string;
  proofTitle?: string;
  proofSubtitle?: string;
  rateCardBadge?: string;
  rateCardTitle?: string;
  rateCardSubtitle?: string;
  contactBadge?: string;
  contactTitle?: string;
  contactSubtitle?: string;
}

export interface DemographicAgeGroup {
  range: string;
  percent: number;
}

export interface DemographicGender {
  label: string;
  percent: number;
}

export interface DemographicLocation {
  name: string;
  percent: number;
}

export interface PlatformDemographicsData {
  ageGroups: DemographicAgeGroup[];
  gender: DemographicGender[];
  locations: DemographicLocation[];
  ageBadge?: string;
  ageSubtitle?: string;
  ageFooterLeft?: string;
  ageFooterRight?: string;
  ageTooltipStrategy?: string;
  ageTooltipProducts?: string;
  genderBadge?: string;
  genderSubtitle?: string;
  genderFooter?: string;
  genderTooltipStrategy?: string;
  genderTooltipProducts?: string;
  locationBadge?: string;
  locationSubtitle?: string;
  locationFooter?: string;
  locationTooltipStrategy?: string;
  locationTooltipProducts?: string;
}

export interface CreatorDemographics extends PlatformDemographicsData {
  platformDemographics?: Record<string, PlatformDemographicsData>;
  defaultDemographicView?: 'overall' | 'tiktok' | 'facebook' | 'instagram' | 'youtube' | string;
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
  heroTimeframeBadge?: string;
  defaultStatsTimeframe?: StatsTimeframe;
  overviewTimeframes?: Record<StatsTimeframe, TimeframeOverviewMetrics>;
  sectionHeaders?: SectionHeadersConfig;
  proofSummaryConfig?: ProofSummaryConfig;
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
  demographics: CreatorDemographics;
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
