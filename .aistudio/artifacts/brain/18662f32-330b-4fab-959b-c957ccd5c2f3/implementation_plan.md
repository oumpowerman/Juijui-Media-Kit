# แผนการ Refactor `PlatformSyncTab.tsx` สู่สถาปัตยกรรมระดับ Enterprise

## 1. วัตถุประสงค์และภาพรวม (Objective & Architectural Overview)
ปรับโครงสร้าง UI ของหน้า **Platform Sync (การเชื่อมต่อและดึงสถิติแพลตฟอร์ม)** เพื่อแก้ไขปัญหาข้อมูลหนาแน่นเกินไป (Data Density) โดยแบ่งหน้าจอเป็น **Internal Sub-Tabs** พร้อมการแสดงผลแบบ **Horizontal Snap-Scroll Card Deck (เลื่อนเป็น CARD)** ที่รองรับ 2 โหมดการทำงานหลักระดับองค์กร:

1. **⚡ โหมด Smart Media Kit Importer (ไม่ต้องขอ API Key)**:
   - ผู้ใช้งานหรือ Creator สามารถอัปเดตสถิติทั้ง 4 แพลตฟอร์ม (YouTube, TikTok, Instagram, Facebook) ได้ทันทีโดยไม่ต้องไปสมัคร Developer Console ขอ API Key ให้ยุ่งยาก
   - มี **Unified 4-Platform Overview Card**: การ์ดภาพรวมแดชบอร์ดสถิติ 4 แพลตฟอร์ม พร้อมปุ่ม *“⚡ 1-Click อัปเดตสถิติ 4 แพลตฟอร์มพร้อมกัน (Smart Sync All)”*
   - มี **Individual Platform Cards (Horizontal Snap-Scroll)**: การ์ดแยกรายแพลตฟอร์ม เลื่อนแนวนอน ปรับแต่งได้ตามต้องการ
   - เชื่อมโยงเครื่องมือ Smart Importer ทั้ง 3 ระบบ (AI Screenshot OCR, CSV Analytics, Public Profile Handle) ไว้อย่างแนบเนียนและใช้งานง่าย
2. **🔑 โหมด Official API & Cloud Sync (สำหรับนักพัฒนาระดับ Enterprise)**:
   - จัดแสดงการ์ด Credentials ของ 4 แพลตฟอร์มแบบ Card Deck ที่สะอาดตา เลื่อนแนวนอนหรือเปิดดูทีละแพลตฟอร์มได้
   - คืนค่าการ์ด **TikTok Official OAuth 2.0** ตัวจริง (Client Key, Client Secret, Access Token, ปุ่ม Connect TikTok OAuth, Status Badges) ที่เคยถูกแทนที่
   - รองรับ YouTube Data API v3, Instagram Graph API v20.0, Facebook Page Graph API พร้อมปุ่ม **[ทดสอบเชื่อมต่อสด]** และ **[จำลองทดสอบ]**
3. **🕒 แท็บประวัติและจุดคืนค่า (Snapshot & Rollback Buffer)**:
   - แยก Ring Buffer ประวัติการซิงก์ 5 เวอร์ชันล่าสุด พร้อมระบบ Diff View และ Rollback ออกมาเป็นแท็บเฉพาะ ทำให้หน้าจอซิงก์ไม่รก

---

## 2. โครงสร้างไฟล์และคอมโพเนนต์ใหม่ (Proposed Architecture & File Structure)

```
src/components/admin/
├── PlatformSyncTab.tsx                 <-- Entry point ปรับเป็น Tab Switcher + Header Hero + Diff Section
└── platform-sync/
    ├── types.ts                        <-- เพิ่ม Interface สำหรับ Sub-Tab state และ Smart Importer
    ├── index.ts                        <-- Barrel export
    ├── SyncHeaderHero.tsx               <-- ส่วนหัวสถิติ พร้อมตัวสลับ Internal Sub-Tabs
    ├── SmartImporterSection.tsx        <-- [NEW] แท็บ Smart Media Kit Importer ทั้ง 4 แพลตฟอร์ม
    │   ├── UnifiedOverviewCard.tsx     <-- [NEW] การ์ดภาพรวม 4 แพลตฟอร์ม + 1-Click Smart Sync All
    │   └── SmartPlatformCardDeck.tsx   <-- [NEW] การ์ดเลื่อนแนวนอน 4 แพลตฟอร์ม (Snap-scroll)
    ├── OfficialApiSection.tsx          <-- [NEW] แท็บ Official API & Credentials แบบ Card Deck
    │   └── ApiCardDeck.tsx             <-- [NEW] Horizontal scroll card deck สำหรับ 4 แพลตฟอร์ม
    ├── TikTokOAuthCard.tsx             <-- [UPDATE] คืนค่า TikTok OAuth UI เต็มรูปแบบ
    ├── YouTubeCredentialCard.tsx       <-- [REUSED]
    ├── InstagramCredentialCard.tsx     <-- [REUSED]
    ├── FacebookCredentialCard.tsx      <-- [REUSED]
    ├── DiffComparisonSection.tsx       <-- [REUSED]
    ├── SnapshotHistorySection.tsx      <-- [REUSED]
    └── ApiSetupGuideModal.tsx          <-- [REUSED]
```

---

## 3. รายละเอียดการออกแบบ (Design & Implementation Details)

### 3.1 การจัดเลย์เอาต์ Internal Sub-Tabs และ Card Scroll
- ออกแบบ Segmented Sub-Tab Bar ที่ด้านบนสุดของหน้า:
  - `⚡ Smart Media Kit Importer (ไม่ต้องขอ API Key)` (Default Tab)
  - `🔑 Official API & Cloud Sync (Developer & Enterprise)`
  - `🕒 ประวัติจุดคืนค่า (Snapshot History)`
- ใช้ CSS Snap-Scroll (`flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-thin scrollbar-thumb-slate-200`) พร้อมปุ่มเลื่อนซ้าย-ขวา (Scroll Chevrons) เพื่อให้ผู้ใช้สามารถเลื่อนการ์ดดูได้อย่างลื่นไหลทั้งบน Desktop และ Mobile

### 3.2 ระบบ Smart Media Kit Importer ทั้ง 4 แพลตฟอร์ม (No API Key Required)
1. **Unified 4-Platform Overview Card**:
   - แสดงสถานะสถิติปัจจุบันของทั้ง 4 แพลตฟอร์ม (Followers, Engagement Rate, Avg Views, Last Synced)
   - ฟังก์ชัน **`handleSyncAllSmart()`**: สกัดและอัปเดตสถิติที่แม่นยำตาม Public Handle / Benchmarking Data ของผู้ใช้ทั้ง 4 แพลตฟอร์มในคลิกเดียว พร้อมคำนวณ Weighted Engagement Rate และสรุปผลในรูปแบบ Toast สวยงาม
2. **Individual Platform Cards (4 แพลตฟอร์ม)**:
   - **YouTube**: ดึงสถิติ Subs, Views, Engagement จาก Handle `@juijuinetwork` หรืออัปโหลด CSV/ภาพถ่ายหน้าจอ
   - **TikTok**: ดึงสถิติ Followers, Likes, Views, Engagement แบบไม่ต้องมี Developer Key
   - **Instagram**: ดึง Followers, Posts, Engagement Rate ทันที
   - **Facebook**: ดึง Followers, Page Likes, Reach ได้ทันที
   - การ์ดแต่ละใบมีปุ่มด่วน **“ดึงสถิติทันที”**, **“อัปโหลดภาพหน้าจอ AI OCR”**, และ **“นำเข้า CSV”**

### 3.3 การฟื้นฟู TikTok OAuth Card ใน Official API Mode
- ฟื้นฟู UI ของ `TikTokOAuthCard.tsx` ให้มีฟิลด์ Client Key, Client Secret, สถานะการเชื่อมต่อ OAuth Token (Active / Expired), ปุ่ม Connect with TikTok (Popup flow), ปุ่ม Refresh Token, และปุ่ม Disconnect ตามมาตรฐานของ TikTok for Developers v2

### 3.4 ประสิทธิภาพและความปลอดภัยระดับ Enterprise (Enterprise-Grade Standards)
- **Memoization & Lazy Loading**: ใช้ `React.useMemo` และ `React.useCallback` ป้องกัน unnecessary re-renders ของการ์ดสถิติ
- **Strict Typography Discipline**: ปฏิบัติตามมาตรฐานแบบอักษร ไม่ใช้ `font-black` กับปุ่ม ป้าย หรือข้อความกำกับ (ใช้ `font-bold` และ `font-semibold` เท่านั้น)
- **Zero Data Loss Guarantee**: มี Diff Review และ Snapshot Rollback ป้องกันการเขียนทับข้อมูลโดยไม่ตั้งใจ
- **Graceful Error Handling**: ข้อความแจ้งเตือนภาษาไทยที่ชัดเจน เป็นมิตร และมีทางเลือกแก้ไขปัญหา (Actionable Feedback)

---

## 4. แผนการทดสอบและการตรวจสอบ (Verification Plan)
1. **TypeScript Type Safety**: ตรวจสอบด้วย `tsc --noEmit` ให้ไม่มี Type Error หรือ Interface Mismatch
2. **UI & Build Integrity**: รัน `compile_applet` เพื่อยืนยันว่าโปรเจกต์คอมไพล์ผ่าน 100%
3. **Interactive Testing**:
   - ทดสอบการสลับระหว่างแท็บ Smart Importer, Official API และ Snapshot History
   - ทดสอบการเลื่อนการ์ดแนวนอน (Horizontal Snap-Scroll)
   - ทดสอบการกด 1-Click Smart Sync All ทั้ง 4 แพลตฟอร์ม
   - ทดสอบการแสดงผล Diff Review และการ Apply ข้อมูล
