# แผนการแก้ไขปัญหาการเชื่อมต่อ TikTok OAuth 2.0 และระบบทดสอบแยกแพลตฟอร์ม (Individual Test) บน Vercel

## 1. สาเหตุของปัญหา (Root Cause Analysis)
จากอาการแจ้งเตือน `Unexpected token '<', "<!doctype "... is not valid JSON` ทั้งตอนกดปุ่ม **"เชื่อมต่อ TikTok อัตโนมัติ (OAuth 2.0)"** และตอนกด **"ทดสอบเฉพาะ TikTok (Individual Test)"** เกิดจาก 3 สาเหตุหลักเมื่อนำเว็บขึ้นใช้งานบน Vercel:

1. **กฎการ Rewrite ใน `vercel.json` ดักจับ `/api/*` ไปที่หน้าเว็บหลัก (`index.html`)**
   - ปัจจุบัน `vercel.json` ตั้งค่า `"source": "/((?!assets/.*).*)"` ให้ส่งกลับไปที่ `/index.html` เสมอ
   - เมื่อโค้ดฝั่งหน้าบ้านเรียก `/api/tiktok/auth-url` หรือ `/api/tiktok/stats` บน Vercel ระบบจึงส่งไฟล์ HTML (`<!doctype html>...`) กลับมาพร้อมสถานะ `200 OK` แทนที่จะเป็นข้อมูล JSON
2. **เซิร์ฟเวอร์ Express (`server.ts`) ไม่ได้ถูกใช้งานแบบ Serverless บน Vercel**
   - โค้ด `/api/tiktok/*` เดิมอยู่ในไฟล์ `server.ts` สำหรับรันโหมดพัฒนาและเซิร์ฟเวอร์ Node.js เท่านั้น เมื่อ Deploy ขึ้น Vercel แบบ Vite Static/Serverless จำเป็นต้องมีไฟล์ Serverless Functions ในโฟลเดอร์ `/api/tiktok/*` รองรับโดยตรง
3. **การแปลงค่า `resp.json()` โดยไม่ตรวจสอบ `Content-Type` และการเรียก TikTok API โดยตรงจากเบราว์เซอร์ติด CORS**
   - เมื่อ `/api/tiktok/stats` คืนค่า HTML กลับมา โค้ดใช้ `await proxyResp.json()` ทันที จึงเกิด Error `Unexpected token '<'` และเมื่อเข้าสู่บล็อกสำรอง (Fallback) เพื่อยิงตรงไปที่ `https://open.tiktokapis.com/v2/...` จากเบราว์เซอร์ ก็จะถูก TikTok บล็อกด้วยนโยบาย CORS

---

## 2. แนวทางการแก้ไขและสถาปัตยกรรมที่ปรับปรุงใหม่

### ส่วนที่ 1: ปรับปรุง `vercel.json` ให้แยกเส้นทาง `/api/*` ออกจากหน้าเว็บ SPA
- แก้ไขกฎ `rewrites` ใน `/vercel.json` จาก `/((?!assets/.*).*)` เป็น `/((?!api/|assets/.*).*)` เพื่อให้ทุกคำขอที่ขึ้นต้นด้วย `/api/` ถูกส่งไปยัง Vercel Serverless Functions อย่างถูกต้อง

### ส่วนที่ 2: สร้าง Vercel Serverless API (`/api/tiktok/*`) รองรับไร้รอยต่อทั้ง Vercel และเซิร์ฟเวอร์หลัก
สร้าง Endpoints มาตรฐานสำหรับ Vercel Serverless Functions ที่ทำงานสอดคล้องกับ `server.ts`:
- **`/api/tiktok/auth-url.ts`**: สร้าง URL สำหรับเชื่อมต่อ TikTok OAuth 2.0 (`https://www.tiktok.com/v2/auth/authorize/`) โดยรองรับทั้ง `client_key` ที่ส่งมาจากหน้า Admin และจาก Environment Variable (`TIKTOK_CLIENT_KEY`)
- **`/api/tiktok/callback.ts`**: รับ `code` จาก TikTok OAuth Popup, แลกเปลี่ยนเป็น `access_token`, `refresh_token`, `open_id` กับ `https://open.tiktokapis.com/v2/oauth/token/` และส่งผลลัพธ์กลับไปยังหน้าต่างหลักผ่าน `window.opener.postMessage` พร้อมบันทึกลง Storage/Firestore อัตโนมัติแล้วปิดหน้าต่างป๊อปอัปทันที
- **`/api/tiktok/stats.ts`**: ทำหน้าที่เป็น Server-side Proxy ดึงข้อมูลโปรไฟล์ (`follower_count`, `likes_count`, `video_count`, `display_name`, `avatar_url`) และรายการวิดีโอล่าสุดจาก TikTok Official API v2 เพื่อหลีกเลี่ยงปัญหา CORS บนเบราว์เซอร์ พร้อมรองรับการต่ออายุ Token (`refresh_token`) อัตโนมัติหาก Token หมดอายุ
- **`/api/tiktok/disconnect.ts`**: ล้างสถานะการเชื่อมต่อและเพิกถอนสิทธิ์เมื่อผู้ใช้กดยกเลิกการเชื่อมต่อ

### ส่วนที่ 3: ซิงค์สถานะการเชื่อมต่อและ Token ลงทั้ง Cloud Firestore และ LocalStorage
- **โครงสร้างข้อมูลใน Firestore**:
  - อัปเดต `firebase-blueprint.json` และ `firestore.rules` เพื่อรองรับการจัดเก็บข้อมูลการตั้งค่าการเชื่อมต่อ TikTok OAuth ในคอลเลกชัน `settings/platformConfig` (เฉพาะผู้ดูแลระบบ `dramaeveryday222@gmail.com` เท่านั้นที่อ่านและเขียนได้)
- **การทำงานร่วมกันระหว่าง Firestore และ LocalStorage**:
  - เมื่อเชื่อมต่อ TikTok สำเร็จ หรือกรอก Client Key / Client Secret / Access Token ในหน้า Admin ระบบจะบันทึกลงทั้ง `localStorage` (`mediakit_api_config_v1`) และซิงค์ขึ้น Cloud Firestore ทันที
  - เมื่อเปิดใช้งานบน Vercel หรือเปิดจากอุปกรณ์อื่น ระบบจะดึงค่าการเชื่อมต่อล่าสุดจาก Firestore มาเติมให้อัตโนมัติ ไม่ต้องตั้งค่าหรือเชื่อมต่อใหม่ซ้ำๆ

### ส่วนที่ 4: ระบบป้องกัน JSON Parse Error และปรับปรุงการแสดงผลใน `AdminModal.tsx`
- สร้างฟังก์ชันช่วยตรวจสอบ Response (`safeParseJsonResponse`) ที่เช็ค `content-type: application/json` ก่อนเรียก `.json()` ทุกครั้ง
- หากเซิร์ฟเวอร์ส่ง HTML หรือเกิดข้อผิดพลาดในการตั้งค่า ระบบจะแสดงข้อความแจ้งเตือนภาษาไทยที่ชัดเจนและเข้าใจง่าย แทนข้อความ `Unexpected token '<', "<!doctype "... is not valid JSON`
- เพิ่มระบบ Fallback สร้าง OAuth Authorization URL ฝั่ง Client ได้ทันทีหากตรวจพบ Client Key เพื่อให้ปุ่ม **"เชื่อมต่อ TikTok อัตโนมัติ (OAuth 2.0)"** เปิดหน้าต่างยืนยันสิทธิ์ได้เสมอ

---

## 3. รายการไฟล์ที่จะดำเนินการปรับปรุง
1. `/vercel.json` — แก้ไข Rewrite rule ไม่ให้ทับเส้นทาง `/api/*`
2. `/api/tiktok/auth-url.ts` — สร้าง Serverless Endpoint สำหรับขอ URL เชื่อมต่อ TikTok OAuth 2.0
3. `/api/tiktok/callback.ts` — สร้าง Serverless Endpoint สำหรับรับ Authorization Code และแลก Access Token / Refresh Token
4. `/api/tiktok/stats.ts` — สร้าง Serverless Endpoint สำหรับดึงสถิติผู้ติดตาม ยอดไลก์ และวิดีโอจาก TikTok API v2 (แก้ปัญหา CORS และรองรับ Individual Test)
5. `/api/tiktok/disconnect.ts` — สร้าง Serverless Endpoint สำหรับตัดการเชื่อมต่อ TikTok
6. `/server.ts` — ปรับปรุง Endpoint `/api/tiktok/*` ให้รองรับการรับค่า `clientKey` / `clientSecret` / `refreshToken` รูปแบบเดียวกับ Serverless บน Vercel
7. `/firebase-blueprint.json` และ `/firestore.rules` — เพิ่ม Schema และสิทธิ์การเข้าถึงสำหรับซิงค์ข้อมูลการเชื่อมต่อ TikTok ลง Firestore อย่างปลอดภัย
8. `/src/components/AdminModal.tsx` — เพิ่มการตรวจสอบ JSON ที่ปลอดภัย, เชื่อมต่อการดึง/บันทึก Token กับ Firestore + LocalStorage และส่งค่า Token/Credentials ไปยัง `/api/tiktok/stats` ตอนกดทดสอบแยกแพลตฟอร์ม (Individual Test)
