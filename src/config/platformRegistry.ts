/**
 * src/config/platformRegistry.ts
 * Centralized Platform Registry
 * Defines metadata, supported sync protocols, brand styling, and credential fields
 * for all social networks. Easily extendable for new networks (Lemon8, Threads, X).
 */

import { PlatformStat } from '../data/types';
import { PlatformDefinition } from '../types/platformSync';

export const PLATFORM_REGISTRY: Record<string, PlatformDefinition> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube Data API v3',
    brandColor: '#FF0000',
    iconName: 'Youtube',
    supportedMethods: ['official_api', 'simulation', 'scraping'],
    officialDocUrl: 'https://developers.google.com/youtube/v3',
    description: 'ดึงข้อมูล Subscriber, Channel Views, และสถิติวิดีโอผ่าน Google Cloud Console API Key',
    credentialFields: [
      {
        key: 'apiKey',
        label: 'Google Cloud API Key (v3)',
        placeholder: 'AIzaSy...',
        isSecret: true,
        helpText: 'สร้างได้ฟรีที่ Google Cloud Console พร้อมเปิด YouTube Data API v3',
      },
      {
        key: 'channelId',
        label: 'Channel ID (UC...)',
        placeholder: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
        isSecret: false,
        helpText: 'รหัสแชนแนลขึ้นต้นด้วย UC จาก URL ช่อง YouTube ของคุณ',
      },
    ],
  },

  tiktok: {
    id: 'tiktok',
    name: 'TikTok Official OAuth 2.0 & Smart Import',
    brandColor: '#000000',
    iconName: 'Video',
    supportedMethods: ['oauth', 'smart_import', 'simulation', 'scraping'],
    officialDocUrl: 'https://developers.tiktok.com/doc/login-kit-web',
    description: 'เชื่อมต่อบัญชี TikTok ทางการผ่าน OAuth 2.0 หรือนำเข้าตัวเลขด้วย AI OCR และ @username',
    credentialFields: [
      {
        key: 'clientKey',
        label: 'TikTok Client Key',
        placeholder: 'aw8... หรือ Client Key จาก TikTok for Developers',
        isSecret: false,
        helpText: 'Client Key จากแอปของคุณบน TikTok for Developers',
      },
      {
        key: 'clientSecret',
        label: 'TikTok Client Secret',
        placeholder: 'Client Secret จาก TikTok for Developers',
        isSecret: true,
        helpText: 'ความลับสำหรับการแลก Refresh Token และ Access Token อย่างปลอดภัย',
      },
    ],
  },

  instagram: {
    id: 'instagram',
    name: 'Instagram Graph API v20.0',
    brandColor: '#E1306C',
    iconName: 'Instagram',
    supportedMethods: ['official_api', 'simulation', 'smart_import', 'scraping'],
    officialDocUrl: 'https://developers.facebook.com/docs/instagram-api',
    description: 'ดึงข้อมูล Followers, Reach, และ Impressions ของบัญชี Creator / Business ผ่าน Meta Graph API',
    credentialFields: [
      {
        key: 'accessToken',
        label: 'Meta User Access Token / Page Token',
        placeholder: 'EAA...',
        isSecret: true,
        helpText: 'Long-lived Token 60 วันจาก Meta for Developers Graph API Explorer',
      },
      {
        key: 'instagramAccountId',
        label: 'Instagram Professional Account ID',
        placeholder: '178414...',
        isSecret: false,
        helpText: 'รหัสตัวเลข 17 หลักที่เชื่อมกับเพจ Facebook',
      },
    ],
  },

  facebook: {
    id: 'facebook',
    name: 'Facebook Page Graph API v20.0',
    brandColor: '#1877F2',
    iconName: 'Facebook',
    supportedMethods: ['official_api', 'simulation', 'scraping'],
    officialDocUrl: 'https://developers.facebook.com/docs/graph-api',
    description: 'ดึงยอด Followers, Page Likes, และ Engagement ของ Facebook Page',
    credentialFields: [
      {
        key: 'pageAccessToken',
        label: 'Page Access Token (Permanent / Long-lived)',
        placeholder: 'EAAB...',
        isSecret: true,
        helpText: 'Page Token ที่มีสิทธิ์ pages_read_engagement และ read_insights',
      },
      {
        key: 'pageId',
        label: 'Facebook Page ID (ตัวเลข 15-16 หลัก)',
        placeholder: '10008...',
        isSecret: false,
        helpText: 'ดูได้จากแท็บ About หรือการตั้งค่าเพจบน Facebook',
      },
    ],
  },

  // Future-ready platforms (extensible plug-in architecture)
  lemon8: {
    id: 'lemon8' as any,
    name: 'Lemon8 Creator Sync',
    brandColor: '#FFD700',
    iconName: 'Sparkles',
    supportedMethods: ['smart_import', 'simulation', 'scraping'],
    description: 'นำเข้าสถิติผู้ติดตามและการมีส่วนร่วมของ Lemon8 Creator ผ่านระบบ Smart OCR และโปรไฟล์สาธารณะ',
    credentialFields: [],
  },

  threads: {
    id: 'threads' as any,
    name: 'Meta Threads API',
    brandColor: '#101010',
    iconName: 'AtSign',
    supportedMethods: ['official_api', 'simulation', 'scraping'],
    officialDocUrl: 'https://developers.facebook.com/docs/threads',
    description: 'ดึงสถิติยอดผู้ติดตามและการมีส่วนร่วมของ Threads ผ่าน Meta Threads API',
    credentialFields: [],
  },
};

/**
 * Retrieve platform definition by ID with fallback
 */
export function getPlatformDefinition(platformId: PlatformStat['id'] | string): PlatformDefinition {
  return (
    PLATFORM_REGISTRY[platformId] || {
      id: platformId as any,
      name: platformId.toUpperCase(),
      brandColor: '#6366f1',
      iconName: 'Share2',
      supportedMethods: ['simulation'],
      description: `การเชื่อมต่อสถิติสำหรับ ${platformId}`,
      credentialFields: [],
    }
  );
}

/**
 * Returns list of all active registered platforms
 */
export function getAllRegisteredPlatforms(): PlatformDefinition[] {
  return Object.values(PLATFORM_REGISTRY);
}

/**
 * Checks if a platform supports a specific synchronization engine
 */
export function isMethodSupported(
  platformId: PlatformStat['id'] | string,
  method: string
): boolean {
  const def = PLATFORM_REGISTRY[platformId];
  return def ? def.supportedMethods.includes(method as any) : false;
}
