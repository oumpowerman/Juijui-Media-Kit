/**
 * Single-Platform Diagnostics & Connection Test Runner
 * Benchmarks latency, runs targeted API or simulation checks, and provides actionable Thai remediation advice.
 */

import { PlatformStat } from '../../data/types';
import {
  PlatformApiCredentials,
  FetchedPlatformData,
  SinglePlatformTestResult,
} from './types';
import { fetchYouTubeStats } from './youtubeService';
import { fetchInstagramStats } from './instagramService';
import { fetchFacebookStats } from './facebookService';
import { fetchTikTokStats } from './tiktokService';
import { generateSimulatedLiveStats } from './simulationAndDiffService';

/**
 * Enterprise Single-Platform Connection & Live Stats Testing
 * Allows administrators to test each platform individually (YouTube, TikTok, Instagram, Facebook)
 * with real latency benchmark, payload inspection, and diagnostic error guidance.
 */
export async function testSinglePlatform(
  platformId: PlatformStat['id'],
  creds: PlatformApiCredentials,
  current: PlatformStat,
  forceSimulation: boolean = false
): Promise<SinglePlatformTestResult> {
  const startTime = Date.now();
  const timestamp = new Date().toLocaleTimeString('th-TH');
  const platformNames: Record<string, string> = {
    youtube: 'YouTube',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    facebook: 'Facebook Page',
  };
  const platformName = platformNames[platformId] || platformId;

  try {
    if (forceSimulation) {
      // Realistic network roundtrip latency simulation
      await new Promise((r) => setTimeout(r, 450 + Math.floor(Math.random() * 200)));
      const simulated = generateSimulatedLiveStats([current])[0];
      return {
        platformId,
        platformName,
        success: true,
        statusMessage: `เชื่อมต่อผ่าน Sandbox Feed จำลองสำเร็จ (ค่าเสมือนจริงสำหรับช่อง ${current.name})`,
        latencyMs: Date.now() - startTime,
        data: simulated,
        timestamp,
      };
    }

    let data: FetchedPlatformData;
    switch (platformId) {
      case 'youtube': {
        if (!creds.youtube.apiKey) {
          throw new Error('ยังไม่ได้ระบุ YouTube API Key (Google Cloud Console)');
        }
        if (!creds.youtube.channelId && !creds.youtube.customHandle) {
          throw new Error('ยังไม่ได้ระบุ YouTube Channel ID หรือ Custom Handle');
        }
        data = await fetchYouTubeStats(creds.youtube, current);
        break;
      }
      case 'tiktok': {
        data = await fetchTikTokStats(creds.tiktok, current);
        break;
      }
      case 'instagram': {
        if (!creds.instagram.accessToken) {
          throw new Error('ยังไม่ได้ระบุ Instagram Graph API Access Token');
        }
        data = await fetchInstagramStats(creds.instagram, current);
        break;
      }
      case 'facebook': {
        if (!creds.facebook.pageAccessToken) {
          throw new Error('ยังไม่ได้ระบุ Facebook Page Access Token');
        }
        if (!creds.facebook.pageId) {
          throw new Error('ยังไม่ได้ระบุ Facebook Page ID');
        }
        data = await fetchFacebookStats(creds.facebook, current);
        break;
      }
      default:
        throw new Error(`ไม่รองรับการทดสอบแพลตฟอร์ม ${platformId}`);
    }

    return {
      platformId,
      platformName,
      success: true,
      statusMessage: data.statusMessage || `เชื่อมต่อ ${platformName} สำเร็จและดึงสถิติตรงได้แล้ว`,
      latencyMs: Date.now() - startTime,
      data,
      timestamp,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
    let advice = 'ตรวจสอบการสะกดและสิทธิ์ของ Access Token อีกครั้ง';

    if (platformId === 'youtube') {
      if (errorMsg.includes('API Key') || errorMsg.includes('400')) {
        advice =
          'ตรวจสอบว่าได้เปิดใช้งาน "YouTube Data API v3" ใน Google Cloud Console และไม่มี IP/Referrer restriction ที่ขัดแย้ง';
      } else if (errorMsg.includes('quota') || errorMsg.includes('403')) {
        advice =
          'โควตาคำขอ YouTube Data API รายวันอาจเต็ม (Daily Quota Exceeded) หรือคีย์ยังไม่เปิดสิทธิ์';
      } else if (errorMsg.includes('ไม่พบข้อมูลช่อง')) {
        advice =
          'ตรวจสอบ Channel ID (เช่น UC...) หรือ Handle (เช่น @JUIJUIChannel) ให้ตรงกับช่องจริง';
      }
    } else if (platformId === 'tiktok') {
      if (errorMsg.includes('เชื่อมต่อ TikTok') || errorMsg.includes('401')) {
        advice =
          'กดปุ่ม "เชื่อมต่อ TikTok (OAuth 2.0)" ด้านบนเพื่อเข้าสู่ระบบ TikTok หรือใช้ Sandbox Tester Token';
      } else {
        advice =
          'ตรวจสอบว่าบัญชี TikTok อยู่ใน Sandbox Testers หรือแอปได้รับการอนุมัติ Scopes (user.info.basic, user.info.stats)';
      }
    } else if (platformId === 'instagram') {
      advice =
        'กดปุ่ม "ค้นหา IG Business ID อัตโนมัติ" ด้านบน หรือตรวจสอบว่า Token มีสิทธิ์ instagram_basic, instagram_manage_insights และ pages_show_list';
    } else if (platformId === 'facebook') {
      advice =
        'ตรวจสอบว่า Page Access Token มีสิทธิ์ pages_read_engagement และ Page ID ตรงกับหน้าแฟนเพจจริง';
    }

    return {
      platformId,
      platformName,
      success: false,
      statusMessage: `เชื่อมต่อ ${platformName} ไม่สำเร็จ: ${errorMsg}`,
      latencyMs: Date.now() - startTime,
      error: errorMsg,
      advice,
      timestamp,
    };
  }
}
