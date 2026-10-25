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

interface StoreState {
  creators: CreatorProfile[];
  bookings: BookingRecord[];
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
        };
      }
    }
  } catch (e) {
    console.error('Failed to read store file, using initial defaults:', e);
  }
  return {
    creators: structuredClone(INITIAL_CREATORS),
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
