# แผนงานติดตั้งระบบเชื่อมต่อ TikTok OAuth 2.0 (Connect TikTok)

อัปเกรดระบบดึงข้อมูลสถิติของ TikTok จากการกรอก User Access Token ด้วยตนเอง ไปเป็น **Official TikTok OAuth 2.0 Flow** แบบมาตรฐาน Enterprise ผ่านปุ่ม **"Connect TikTok"** โดยรองรับทั้งการล็อกอินผ่านหน้าต่าง Popup, การแลกเปลี่ยน Token อัตโนมัติในฝั่ง Backend, และคงช่องทางเลือกสำรองไว้สำหรับการทดสอบใน Sandbox Mode

---

## 1. การเปลี่ยนแปลงสถาปัตยกรรม (Architecture & Flow)

```
[Admin Studio UI]
       │ 1. คลิกปุ่ม "เชื่อมต่อ TikTok (Connect)"
       ▼
[เปิด Popup Window] ────► https://www.tiktok.com/v2/auth/authorize/?client_key=...&scope=user.info.basic,user.info.stats
       │ 2. ผู้ใช้กดยืนยันสิทธิ์ (Authorize)
       ▼
[Callback Route] ◄────── https://.../api/tiktok/callback?code=clt.xxxx
(server.ts)
       │ 3. Backend ส่ง POST แลกเปลี่ยน Token กับ TikTok Server
       ▼
[TikTok OAuth API] ◄──── POST https://open.tiktokapis.com/v2/oauth/token/
       │ 4. ส่งมอบ access_token, refresh_token, open_id, expires_in
       ▼
[Server Data Store] ───► บันทึก Token ลงฐานข้อมูลอัตโนมัติ
       │ 5. ส่ง window.opener.postMessage() แล้วปิดหน้าต่าง Popup
       ▼
[Admin Studio UI] ────► อัปเดตสถานะ "เชื่อมต่อแล้ว (Connected)" พร้อมดึงสถิติจริงทันที
```

---

## 2. รายละเอียดขั้นตอนการดำเนินงาน (Implementation Steps)

### Step 1: เพิ่ม OAuth Backend Endpoints ใน `server.ts`
- **GET `/api/tiktok/auth-url`**:
  - รับพารามิเตอร์ `redirect_uri` หรือคำนวณจาก Hostname / App URL
  - ดึง `client_key` จาก Store หรือ Environment Variable (`TIKTOK_CLIENT_KEY`)
  - คืนค่า Authorization URL พร้อม Scope: `user.info.basic,user.info.stats`
- **GET `/api/tiktok/callback`**:
  - รับ Query parameter `code` (เช่น `clt.xxxx`) และ `state`
  - ทำการส่ง HTTP POST ไปยัง `https://open.tiktokapis.com/v2/oauth/token/` พร้อม `client_key`, `client_secret`, `grant_type: authorization_code`, `redirect_uri`
  - บันทึก Token ข้อมูลลงใน Store (`ratecard-store.json`)
  - ตอบกลับด้วย HTML หน้าต่างสั้นๆ ที่มี JavaScript สั่ง `window.opener.postMessage({ type: 'TIKTOK_OAUTH_SUCCESS', tokens }, '*')` และ `window.close()`
- **POST `/api/tiktok/refresh-token`**:
  - รองรับการรีเฟรช Token อัตโนมัติผ่าน `refresh_token` โดยไม่ต้องให้ผู้ใช้ล็อกอินใหม่
- **GET / POST `/api/tiktok/config`**:
  - บันทึกและเรียกดูการตั้งค่า `client_key`, `client_secret` (มาสก์รหัสผ่าน) พร้อมแสดง Exact Redirect URI ให้แอดมินคัดลอกไปวางใน TikTok Developer Portal ได้ทันที

### Step 2: อัปเดต Services & Hooks (`platformApiService.ts` & `usePlatformSync.ts`)
- ปรับปรุงฟังก์ชัน `syncTikTokStats`:
  - เมื่อได้รับ `access_token` จาก OAuth จะเรียก TikTok Open API v2 Endpoint:
    `GET https://open.tiktokapis.com/v2/user/info/?fields=avatar_url,display_name,follower_count,likes_count,video_count`
  - ดึงยอดผู้ติดตาม (Followers), ยอดไลก์รวม (Likes), และจำนวนคลิปวิดีโอมาอัปเดตสถิติช่องจุ๊ยจุ๊ย
  - คำนวณ Engagement Rate และยอดวิวสะสมโดยอัตโนมัติ
- เพิ่ม Event Listener ใน Client รองรับ PostMessage `TIKTOK_OAUTH_SUCCESS` เพื่ออัปเดตสถานะและข้อมูลทันทีโดยไม่ต้องรีเฟรชหน้าเว็บ

### Step 3: ปรับปรุง UI หน้า Admin Studio (`PlatformSyncTab.tsx`)
- **การ์ด TikTok Credentials**:
  - **ปุ่มหลัก**: "เชื่อมต่อบัญชี TikTok (Connect TikTok)" สไตล์ TikTok พร้อมสถานะการเชื่อมต่อ (Connected / Expired / Not Connected)
  - **กล่องรายละเอียดการเชื่อมต่อ**: แสดงไอคอนสถานะสีเขียว, วันหมดอายุของ Token, ปุ่ม "รีเฟรชสิทธิ์ (Refresh)" และ "ตัดการเชื่อมต่อ (Disconnect)"
  - **ส่วนตั้งค่า API Key & Secret**: กรอก Client Key และ Client Secret ได้โดยตรงผ่าน UI (และดึงค่าดีฟอลต์จาก `.env` ได้)
  - **ปุ่มคัดลอก Redirect URI**: มีปุ่มคัดลอก Callback URL แบบ 1-Click สำหรับนำไปกรอกในช่อง Redirect Domain ของ TikTok Developer Portal
  - **Accordion ทางเลือกสำรอง**: "กรอก User Access Token ด้วยตนเอง (Manual Fallback / Sandbox)" สำหรับกรณีต้องการทดสอบ Token ตรงๆ
- **คู่มือ Step-by-Step API Setup Modal**:
  - อัปเดตแท็บ TikTok ให้มีคำอธิบายการสร้าง App, การใส่ Redirect URI, และการเพิ่ม Sandbox Tester ในแท็บ Roles & Access ของ TikTok Developer Portal

---

## 3. ข้อมูล Redirect URI สำหรับตั้งค่าใน TikTok Developer Portal

- **Development URL**:
  `https://ais-dev-f6wioyvvasi5v7ndzz7sls-608846585493.asia-southeast1.run.app/api/tiktok/callback`
- **Shared / Production URL**:
  `https://ais-pre-f6wioyvvasi5v7ndzz7sls-608846585493.asia-southeast1.run.app/api/tiktok/callback`

---

## 4. มาตรฐานดีไซน์และการตรวจสอบ (Design & Quality Standards)
- **Zero-Pill Discipline**: ใช้รูปทรงขอบมนสมดุล (`rounded-lg`, `rounded-xl`) ไม่ใช้ `rounded-full` กับกล่องข้อมูล
- **Typography Standards**: ใช้ `font-semibold` และ `font-bold` สำหรับปุ่ม ป้ายสถานะ และหัวข้อย่อย (งดใช้ `font-black`)
- **การตรวจสอบ**: ตรวจสอบด้วย `lint_applet` และ `compile_applet` ปราศจากข้อผิดพลาด TypeScript/Vite Build ก่อนส่งมอบงาน
