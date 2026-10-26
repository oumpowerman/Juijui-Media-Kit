/**
 * creatorData.ts - Barrel file for backward compatibility
 * Re-exports all types, helpers, datasets, and INITIAL_CREATORS
 */

// Types & Interfaces
export type {
  PlatformStat,
  ViralWorkItem,
  BrandReplyItem,
  CommentProofItem,
  RatePackage,
  AddOnItem,
  FreeIncludedItem,
  BrandSampleClip,
  BrandCategoryType,
  BrandCollaborationItem,
  BrandShowcaseConfig,
  CreatorProfile,
  BookingRecord,
} from './types';

// Helper utilities
export { resolveGoogleDriveImage, extractGoogleDriveId, resolveVideoSource } from './helpers';
export type { VideoSourceInfo } from './helpers';

// Modular Datasets
export { INITIAL_PLATFORMS, INITIAL_DEMOGRAPHICS } from './datasets/channelOverview';
export { INITIAL_VIRAL_WORKS } from './datasets/viralWorks';
export { INITIAL_COMMENT_PROOFS } from './datasets/commentProofs';
export {
  INITIAL_PACKAGES,
  INITIAL_FREE_PERKS,
  INITIAL_ADD_ONS,
  INITIAL_CUSTOM_COLLAB_NOTES,
} from './datasets/ratePackages';
export {
  INITIAL_BRAND_SHOWCASE_CONFIG,
  INITIAL_BRAND_COLLABORATIONS,
} from './datasets/brandCollaborations';

// Initial Creator Profile
export { INITIAL_CREATORS } from './initialCreator';
