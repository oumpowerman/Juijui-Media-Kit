import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { INITIAL_CREATORS, CreatorProfile, BookingRecord } from './src/data/creatorData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistent JSON file store on server
const DATA_FILE = path.join(__dirname, 'ratecard-store.json');

export interface TikTokOAuthData {
  clientKey?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  openId?: string;
  scope?: string;
  expiresIn?: number;
  expiresAt?: number;
  displayName?: string;
  avatarUrl?: string;
  followerCount?: number;
  likesCount?: number;
  videoCount?: number;
  lastSyncedAt?: string;
}

interface StoreState {
  creators: CreatorProfile[];
  bookings: BookingRecord[];
  tiktokOAuth?: TikTokOAuthData;
}

function loadStore(): StoreState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.creators) && parsed.creators.length > 0) {
        // Ensure any newly added default viralWorks (e.g. 16:9 horizontal clips) & orientation fields are synced
        const syncedCreators = parsed.creators.map((creator: CreatorProfile) => {
          const initialMatch = INITIAL_CREATORS.find((ic) => ic.id === creator.id);
          if (!initialMatch) return creator;

          const existingWorks: CreatorProfile['viralWorks'] = Array.isArray(creator.viralWorks)
            ? creator.viralWorks
            : [];
          const existingIds = new Set(existingWorks.map((w) => w.id));
          const missingDefaultWorks = initialMatch.viralWorks.filter(
            (iw) => !existingIds.has(iw.id)
          );

          const enrichedExistingWorks = existingWorks.map((w) => {
            const defaultWork = initialMatch.viralWorks.find((iw) => iw.id === w.id);
            return {
              ...defaultWork,
              ...w,
              orientation: w.orientation || defaultWork?.orientation || 'vertical',
              duration: w.duration || defaultWork?.duration || '00:45',
            };
          });

          return {
            ...creator,
            viralWorks: [...missingDefaultWorks, ...enrichedExistingWorks],
          };
        });

        return {
          creators: syncedCreators,
          bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
          tiktokOAuth: parsed.tiktokOAuth || undefined,
        };
      }
    }
  } catch (e) {
    console.error('Failed to read store file, using initial defaults:', e);
  }
  return {
    creators: structuredClone(INITIAL_CREATORS),
    tiktokOAuth: undefined,
    bookings: [
      {
        id: 'bk-sample-1',
        quoteNumber: 'QT-2026-0891',
        creatorId: 'juijui-main',
        creatorName: 'จุ๊ยจุ๊ย | JUIJUI',
        packageId: 'pkg-standard',
        packageName: 'STANDARD',
        basePrice: 10000,
        selectedAddOns: [
          { id: 'addon-cart-link', name: 'ปักตะกร้า + แปะลิงก์พิกัดสินค้าทุกแพลตฟอร์ม', price: 1000 },
        ],
        collaborationType: 'standard_package',
        totalPrice: 11000,
        brandName: 'Aura Glow Skincare Thailand',
        contactName: 'คุณมินตรา (Senior PR)',
        contactChannel: 'LINE: @mintra_pr / 089-456-7890',
        productDetails: 'เซรั่มบำรุงผิวสำหรับวัยรุ่น Gen Z เน้นมุกตลกเพื่อนป้ายยาเพื่อนตอนไปเที่ยวทะเล',
        targetCampaignDate: '2026-11-15',
        referenceLinks: 'https://www.tiktok.com/@juijui.j',
        createdAt: '23 ต.ค. 2569 · 10:30 น.',
        status: 'ยืนยันคิวงานแล้ว',
      },
    ],
  };
}

function saveStore(state: StoreState) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write store file:', e);
  }
}

let store = loadStore();

// GET /api/creators
app.get('/api/creators', (_req: Request, res: Response) => {
  return res.json({ creators: store.creators });
});

// PUT /api/creators/:id
app.put('/api/creators/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedCreator = req.body as CreatorProfile;
  const idx = store.creators.findIndex((c) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'ไม่พบโปรไฟล์ครีเอเตอร์ที่ระบุ' });
  }
  store.creators[idx] = { ...store.creators[idx], ...updatedCreator, id };
  saveStore(store);
  return res.json({ creator: store.creators[idx] });
});

// POST /api/creators (Add new creator to roster)
app.post('/api/creators', (req: Request, res: Response) => {
  const newCreator = req.body as CreatorProfile;
  if (!newCreator || !newCreator.nameTh) {
    return res.status(400).json({ error: 'กรุณาระบุชื่อครีเอเตอร์' });
  }
  const created: CreatorProfile = {
    ...INITIAL_CREATORS[0],
    ...newCreator,
    id: newCreator.id || `creator-${Date.now()}`,
  };
  store.creators.push(created);
  saveStore(store);
  return res.status(201).json({ creator: created, creators: store.creators });
});

// POST /api/creators/reset
app.post('/api/creators/reset', (_req: Request, res: Response) => {
  store.creators = structuredClone(INITIAL_CREATORS);
  saveStore(store);
  return res.json({ creators: store.creators });
});

// GET /api/bookings
app.get('/api/bookings', (_req: Request, res: Response) => {
  return res.json({ bookings: store.bookings });
});

// POST /api/bookings
app.post('/api/bookings', (req: Request, res: Response) => {
  const payload = req.body;
  if (!payload.brandName || !payload.contactChannel) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อแบรนด์และช่องทางติดต่อกลับ' });
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newBooking: BookingRecord = {
    id: `bk-${Date.now()}`,
    quoteNumber: payload.quoteNumber || `QT-2026-${randomNum}`,
    creatorId: payload.creatorId || 'juijui-main',
    creatorName: payload.creatorName || 'จุ๊ยจุ๊ย | JUIJUI',
    packageId: payload.packageId || 'pkg-standard',
    packageName: payload.packageName || 'STANDARD',
    basePrice: Number(payload.basePrice) || 0,
    selectedAddOns: Array.isArray(payload.selectedAddOns) ? payload.selectedAddOns : [],
    collaborationType: payload.collaborationType || 'standard_package',
    customBudgetAmount: payload.customBudgetAmount || '',
    totalPrice: Number(payload.totalPrice) || 0,
    brandName: payload.brandName,
    contactName: payload.contactName || '',
    contactChannel: payload.contactChannel,
    productDetails: payload.productDetails || '',
    targetCampaignDate: payload.targetCampaignDate || '',
    referenceLinks: payload.referenceLinks || '',
    createdAt: new Date().toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: 'รอดำเนินการ',
  };

  store.bookings.unshift(newBooking);
  saveStore(store);
  return res.status(201).json({ booking: newBooking, bookings: store.bookings });
});

// PATCH /api/bookings/:id/status
app.patch('/api/bookings/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const booking = store.bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: 'ไม่พบรายการจองคิวงาน' });
  }
  booking.status = status;
  saveStore(store);
  return res.json({ booking, bookings: store.bookings });
});

// ==========================================
// TikTok Official OAuth 2.0 & Stats Proxy
// ==========================================

function getEffectiveTikTokCredentials() {
  return {
    clientKey: store.tiktokOAuth?.clientKey || process.env.TIKTOK_CLIENT_KEY || '',
    clientSecret: store.tiktokOAuth?.clientSecret || process.env.TIKTOK_CLIENT_SECRET || '',
  };
}

function getTikTokRedirectUri(req: Request): string {
  if (process.env.APP_URL) {
    const baseUrl = process.env.APP_URL.replace(/\/$/, '');
    return `${baseUrl}/api/tiktok/callback`;
  }
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${protocol}://${host}/api/tiktok/callback`;
}

async function refreshTikTokAccessToken(): Promise<{ success: boolean; error?: string }> {
  const creds = getEffectiveTikTokCredentials();
  const refreshToken = store.tiktokOAuth?.refreshToken;
  if (!refreshToken || !creds.clientKey || !creds.clientSecret) {
    return { success: false, error: 'ไม่พบ Refresh Token หรือข้อมูล Client Credentials' };
  }
  try {
    const resp = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: creds.clientKey,
        client_secret: creds.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    const data = await resp.json();
    if (data.data?.access_token) {
      store.tiktokOAuth = {
        ...store.tiktokOAuth,
        accessToken: data.data.access_token,
        refreshToken: data.data.refresh_token || refreshToken,
        expiresIn: data.data.expires_in,
        expiresAt: Date.now() + (data.data.expires_in || 86400) * 1000,
      };
      saveStore(store);
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Refresh token failed' };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network error refreshing token' };
  }
}

// GET /api/tiktok/config
app.get('/api/tiktok/config', (req: Request, res: Response) => {
  const creds = getEffectiveTikTokCredentials();
  const redirectUri = getTikTokRedirectUri(req);
  return res.json({
    clientKey: creds.clientKey,
    hasClientSecret: Boolean(creds.clientSecret),
    isConnected: Boolean(store.tiktokOAuth?.accessToken),
    expiresAt: store.tiktokOAuth?.expiresAt || null,
    openId: store.tiktokOAuth?.openId || null,
    displayName: store.tiktokOAuth?.displayName || null,
    avatarUrl: store.tiktokOAuth?.avatarUrl || null,
    followerCount: store.tiktokOAuth?.followerCount || null,
    likesCount: store.tiktokOAuth?.likesCount || null,
    videoCount: store.tiktokOAuth?.videoCount || null,
    lastSyncedAt: store.tiktokOAuth?.lastSyncedAt || null,
    redirectUri,
  });
});

// POST /api/tiktok/config
app.post('/api/tiktok/config', (req: Request, res: Response) => {
  const { clientKey, clientSecret } = req.body;
  if (!store.tiktokOAuth) {
    store.tiktokOAuth = {};
  }
  if (typeof clientKey === 'string') {
    store.tiktokOAuth.clientKey = clientKey.trim();
  }
  if (typeof clientSecret === 'string') {
    store.tiktokOAuth.clientSecret = clientSecret.trim();
  }
  saveStore(store);
  const creds = getEffectiveTikTokCredentials();
  return res.json({
    success: true,
    clientKey: creds.clientKey,
    hasClientSecret: Boolean(creds.clientSecret),
    isConnected: Boolean(store.tiktokOAuth?.accessToken),
    redirectUri: getTikTokRedirectUri(req),
  });
});

// GET /api/tiktok/auth-url
app.get('/api/tiktok/auth-url', (req: Request, res: Response) => {
  const creds = getEffectiveTikTokCredentials();
  if (!creds.clientKey) {
    return res.status(400).json({
      error: 'กรุณาระบุ TikTok Client Key ก่อนทำการเชื่อมต่อ OAuth',
    });
  }
  const redirectUri = (req.query.redirectUri as string) || getTikTokRedirectUri(req);
  const state = Math.random().toString(36).substring(2, 15);
  const params = new URLSearchParams({
    client_key: creds.clientKey,
    scope: 'user.info.basic,user.info.stats',
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
  });
  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  return res.json({ authUrl, state, redirectUri });
});

// GET ['/api/tiktok/callback', '/api/tiktok/callback/']
app.get(['/api/tiktok/callback', '/api/tiktok/callback/'], async (req: Request, res: Response) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    const errDesc = (error_description as string) || (error as string) || 'Authentication cancelled';
    return res.send(`<!DOCTYPE html>
<html>
  <head><title>TikTok Authentication</title></head>
  <body style="font-family: system-ui, sans-serif; background: #09090b; color: #f43f5e; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center;">
    <div style="padding: 24px; max-width: 460px; background: #18181b; border: 1px solid #27272a; border-radius: 12px; color: #fff;">
      <h3 style="margin-top: 0; color: #f43f5e;">การเชื่อมต่อไม่สำเร็จ</h3>
      <p style="color: #a1a1aa; font-size: 14px;">${errDesc}</p>
      <button onclick="window.close()" style="background: #27272a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">ปิดหน้าต่างนี้</button>
    </div>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'TIKTOK_OAUTH_ERROR', error: ${JSON.stringify(errDesc)} }, '*');
        setTimeout(() => window.close(), 2500);
      }
    </script>
  </body>
</html>`);
  }

  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  const creds = getEffectiveTikTokCredentials();
  const redirectUri = getTikTokRedirectUri(req);

  try {
    const tokenResp = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: creds.clientKey,
        client_secret: creds.clientSecret,
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResp.json();

    if (!tokenResp.ok || !tokenData.data?.access_token) {
      const errMsg =
        tokenData.error?.message ||
        tokenData.error_description ||
        'Failed to exchange token with TikTok Open API';
      return res.send(`<!DOCTYPE html>
<html>
  <head><title>TikTok Authentication Failed</title></head>
  <body style="font-family: system-ui, sans-serif; background: #09090b; color: #f43f5e; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center;">
    <div style="padding: 24px; max-width: 480px; background: #18181b; border: 1px solid #27272a; border-radius: 12px; color: #fff;">
      <h3 style="margin-top: 0; color: #f43f5e;">ไม่สามารถแลกเปลี่ยน Access Token ได้</h3>
      <p style="color: #a1a1aa; font-size: 14px;">${errMsg}</p>
      <p style="color: #71717a; font-size: 12px;">ตรวจสอบว่า TikTok Developer App ของคุณได้เพิ่ม Sandbox Testers หรือยัง</p>
      <button onclick="window.close()" style="background: #27272a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">ปิดหน้าต่างนี้</button>
    </div>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'TIKTOK_OAUTH_ERROR', error: ${JSON.stringify(errMsg)} }, '*');
      }
    </script>
  </body>
</html>`);
    }

    const data = tokenData.data;
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;
    const openId = data.open_id;
    const expiresIn = data.expires_in || 86400;
    const expiresAt = Date.now() + expiresIn * 1000;

    // Fetch user profile info
    let displayName = '';
    let avatarUrl = '';
    let followerCount = 0;
    let likesCount = 0;
    let videoCount = 0;

    try {
      const userResp = await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=avatar_url,display_name,follower_count,likes_count,video_count',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (userResp.ok) {
        const userData = await userResp.json();
        const user = userData.data?.user;
        if (user) {
          displayName = user.display_name || '';
          avatarUrl = user.avatar_url || '';
          followerCount = user.follower_count || 0;
          likesCount = user.likes_count || 0;
          videoCount = user.video_count || 0;
        }
      }
    } catch (userErr) {
      console.warn('Could not fetch user profile info:', userErr);
    }

    if (!store.tiktokOAuth) store.tiktokOAuth = {};
    store.tiktokOAuth = {
      ...store.tiktokOAuth,
      accessToken,
      refreshToken,
      openId,
      scope: data.scope,
      expiresIn,
      expiresAt,
      displayName: displayName || store.tiktokOAuth.displayName,
      avatarUrl: avatarUrl || store.tiktokOAuth.avatarUrl,
      followerCount: followerCount || store.tiktokOAuth.followerCount,
      likesCount: likesCount || store.tiktokOAuth.likesCount,
      videoCount: videoCount || store.tiktokOAuth.videoCount,
      lastSyncedAt: new Date().toISOString(),
    };
    saveStore(store);

    return res.send(`<!DOCTYPE html>
<html>
  <head><title>TikTok Authentication Succeeded</title></head>
  <body style="font-family: system-ui, -apple-system, sans-serif; background: #09090b; color: #10b981; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center;">
    <div style="padding: 28px; max-width: 440px; background: #18181b; border: 1px solid #27272a; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
      <div style="width: 48px; height: 48px; background: rgba(16,185,129,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; font-size: 24px; color: #10b981;">✓</div>
      <h3 style="color: #ffffff; margin: 0 0 8px 0; font-size: 18px; font-weight: 700;">เชื่อมต่อ TikTok สำเร็จ!</h3>
      <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 16px 0;">ระบบได้บันทึก Access Token และสิทธิ์ของ ${displayName || 'บัญชีของคุณ'} เรียบร้อยแล้ว</p>
      <p style="color: #71717a; font-size: 12px; margin: 0;">หน้าต่างนี้จะปิดตัวลงโดยอัตโนมัติ...</p>
    </div>
    <script>
      try {
        if (window.opener) {
          window.opener.postMessage({
            type: 'TIKTOK_OAUTH_SUCCESS',
            data: {
              openId: ${JSON.stringify(openId)},
              displayName: ${JSON.stringify(displayName)},
              avatarUrl: ${JSON.stringify(avatarUrl)}
            }
          }, '*');
          setTimeout(() => window.close(), 700);
        } else {
          window.location.href = '/';
        }
      } catch(e) {
        window.close();
      }
    </script>
  </body>
</html>`);
  } catch (err: any) {
    console.error('TikTok OAuth Callback Error:', err);
    return res.status(500).send(`Authentication error: ${err?.message || 'Unknown error'}`);
  }
});

// POST /api/tiktok/refresh-token
app.post('/api/tiktok/refresh-token', async (_req: Request, res: Response) => {
  const result = await refreshTikTokAccessToken();
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({
    success: true,
    expiresAt: store.tiktokOAuth?.expiresAt,
    lastSyncedAt: store.tiktokOAuth?.lastSyncedAt,
  });
});

// POST /api/tiktok/disconnect
app.post('/api/tiktok/disconnect', (_req: Request, res: Response) => {
  if (store.tiktokOAuth) {
    delete store.tiktokOAuth.accessToken;
    delete store.tiktokOAuth.refreshToken;
    delete store.tiktokOAuth.openId;
    delete store.tiktokOAuth.expiresAt;
    delete store.tiktokOAuth.expiresIn;
    saveStore(store);
  }
  return res.json({ success: true, isConnected: false });
});

// GET /api/tiktok/stats (Enterprise Proxy to TikTok Open API v2)
app.get('/api/tiktok/stats', async (req: Request, res: Response) => {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    if (!token && store.tiktokOAuth?.accessToken) {
      // Check if token is nearing expiration (within 5 minutes)
      if (
        store.tiktokOAuth.expiresAt &&
        store.tiktokOAuth.expiresAt - Date.now() < 300000 &&
        store.tiktokOAuth.refreshToken
      ) {
        await refreshTikTokAccessToken();
      }
      token = store.tiktokOAuth.accessToken || '';
    }

    if (!token) {
      return res.status(401).json({
        error: 'ยังไม่ได้เชื่อมต่อ TikTok หรือระบุ Access Token',
        requiresAuth: true,
      });
    }

    const response = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=avatar_url,display_name,follower_count,likes_count,video_count',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok || data.error?.code !== 'ok') {
      const errMsg = data.error?.message || `TikTok API responded with status ${response.status}`;
      return res.status(response.status >= 400 && response.status < 500 ? response.status : 502).json({
        error: errMsg,
        raw: data,
      });
    }

    const user = data.data?.user;
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบข้อมูล User จาก TikTok API' });
    }

    // Update store cache if using stored token
    if (store.tiktokOAuth && store.tiktokOAuth.accessToken === token) {
      store.tiktokOAuth.displayName = user.display_name || store.tiktokOAuth.displayName;
      store.tiktokOAuth.avatarUrl = user.avatar_url || store.tiktokOAuth.avatarUrl;
      store.tiktokOAuth.followerCount = user.follower_count ?? store.tiktokOAuth.followerCount;
      store.tiktokOAuth.likesCount = user.likes_count ?? store.tiktokOAuth.likesCount;
      store.tiktokOAuth.videoCount = user.video_count ?? store.tiktokOAuth.videoCount;
      store.tiktokOAuth.lastSyncedAt = new Date().toISOString();
      saveStore(store);
    }

    return res.json({
      success: true,
      user: {
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        followerCount: user.follower_count,
        likesCount: user.likes_count,
        videoCount: user.video_count,
      },
      source: 'official_api',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error fetching TikTok stats' });
  }
});

// Shared Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/analyze-pdf', async (req: Request, res: Response) => {
  try {
    const { pdfBase64, prompt } = req.body;
    if (!pdfBase64) {
      return res.status(400).json({ error: 'Missing pdfBase64' });
    }
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '').trim();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: cleanBase64 } },
          { text: prompt || 'สรุปสาระสำคัญของเอกสารนี้' },
        ],
      },
    });
    return res.json({ result: response.text || '' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Error' });
  }
});

const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
