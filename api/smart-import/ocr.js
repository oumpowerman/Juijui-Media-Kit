import { GoogleGenAI, Type } from '@google/genai';

function parseBody(req) {
  if (!req || !req.body) return {};
  if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf-8') : String(req.body);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        'ไม่พบ GEMINI_API_KEY ในระบบ: หาก Deploy บน Vercel กรุณาเพิ่ม GEMINI_API_KEY ในเมนู Project Settings > Environment Variables (สร้างคีย์ฟรีได้ที่ aistudio.google.com)',
    });
  }

  try {
    const body = parseBody(req);
    const { images, defaultPlatform, defaultTimeframe } = body;

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'กรุณาอัปโหลดรูปภาพแคปหน้าจออย่างน้อย 1 ภาพ' });
    }

    const parts = [];
    for (const img of images.slice(0, 8)) {
      const dataUrl = String(img.dataUrl || '');
      const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2].trim(),
          },
        });
      }
    }

    if (parts.length === 0) {
      return res.status(400).json({ error: 'รูปแบบไฟล์ภาพไม่ถูกต้อง กรุณาอัปโหลดไฟล์ PNG, JPG หรือ WEBP' });
    }

    const promptText = `คุณคือระบบ AI Analytics OCR สำหรับอ่านภาพแคปหน้าจอหลังบ้านของครีเอเตอร์ (TikTok Studio, Facebook Professional Dashboard, Instagram Insights, YouTube Studio)
ค่าเริ่มต้นที่ผู้ใช้เลือกไว้: แพลตฟอร์ม = "${defaultPlatform || 'auto'}", ช่วงเวลา = "${defaultTimeframe || 'auto'}"

กรุณาอ่านตัวเลขทั้งหมดที่ปรากฏในภาพแคปหน้าจออย่างแม่นยำ แล้วส่งกลับเป็น JSON ตามโครงสร้างดังนี้:
1. หากในภาพมีตัวเลขยอดผู้ติดตาม (Followers / Subscribers) ให้แปลงเป็นรูปแบบย่อ เช่น "660.2K", "1.15M" พร้อมตัวเลขดิบ followersNum
2. หากในภาพมีตัวเลขสถิติ (Views / Video Views / ยอดวิว, Reach / การเข้าถึง / Unique viewers, Likes / ยอดถูกใจ, Comments / ความคิดเห็น, Shares / การแชร์, Engagement Rate / ER%) ให้ระบุว่ามาจากแพลตฟอร์มใด ('tiktok' | 'facebook' | 'instagram' | 'youtube') และช่วงเวลาใด ('28d' สำหรับ 28 วันหรือ 30 วัน, '60d' สำหรับ 60 วัน, 'lifetime' สำหรับสะสมทั้งหมด หรือใช้ค่าเริ่มต้นหากภาพไม่ได้ระบุช่วงเวลา)
   - แปลงตัวเลข Views, Reach, Likes, Comments, Shares ให้เป็นรูปแบบย่อมาตรฐาน เช่น "12.7M", "893K", "5.3K"
   - หากมี Views และ (Likes + Comments + Shares) แต่ในภาพไม่มี % ER ให้คำนวณ ER% = ((Likes + Comments + Shares) / Views) * 100 ทศนิยม 2 ตำแหน่ง เช่น "8.12%" (หรือหากในภาพมีตัวเลขอัตราส่วนอยู่แล้วให้ใช้ตามภาพ)
3. หากในภาพมีข้อมูลกลุ่มผู้ชม (Audience / Followers Demographics):
   - ageGroups: จัดกลุ่มหรือดึงตามช่วงอายุในภาพ (เช่น "18 – 24 ปี", "25 – 34 ปี", "35 – 54 ปี", "55+ ปี") พร้อมค่า percent (ตัวเลข 0-100)
   - gender: สัดส่วนเพศ ใช้ป้ายกำกับ "ชาย (Male)" และ "หญิง (Female)" พร้อมค่า percent (รวมกันได้ 100)
   - locations: จังหวัดหรือพื้นที่หลัก (เช่น "กรุงเทพมหานคร (Bangkok)", "เชียงใหม่ (Chiang Mai)", "ชลบุรี (Chon Buri)") พร้อมค่า percent`;

    parts.push({ text: promptText });

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedPlatform: {
              type: Type.STRING,
              description: 'tiktok, facebook, instagram, or youtube',
            },
            detectedTimeframe: {
              type: Type.STRING,
              description: '28d, 60d, or lifetime',
            },
            followers: {
              type: Type.STRING,
              description: 'Compact follower count e.g. 660.2K if visible',
            },
            followersNum: {
              type: Type.NUMBER,
              description: 'Raw follower number if visible',
            },
            handle: {
              type: Type.STRING,
              description: '@username or page name if visible',
            },
            timeframeMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING },
                  timeframe: { type: Type.STRING },
                  views: { type: Type.STRING },
                  reach: { type: Type.STRING },
                  likes: { type: Type.STRING },
                  comments: { type: Type.STRING },
                  shares: { type: Type.STRING },
                  er: { type: Type.STRING },
                },
              },
            },
            demographics: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING },
                ageGroups: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      range: { type: Type.STRING },
                      percent: { type: Type.NUMBER },
                    },
                  },
                },
                gender: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      percent: { type: Type.NUMBER },
                    },
                  },
                },
                locations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      percent: { type: Type.NUMBER },
                    },
                  },
                },
              },
            },
            summaryNote: {
              type: Type.STRING,
              description: 'Short Thai summary of extracted statistics',
            },
          },
        },
      },
    });

    const rawText = response.text || '{}';
    const extracted = JSON.parse(rawText);
    return res.status(200).json({
      success: true,
      data: extracted,
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'ไม่สามารถอ่านตัวเลขจากภาพแคปหน้าจอได้ กรุณาลองใหม่อีกครั้ง',
    });
  }
}
