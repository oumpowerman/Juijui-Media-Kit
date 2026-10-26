# แผนการพัฒนาระบบ In-App Viral Video Preview & Smartphone Showcase Modal พร้อมระบบฐานข้อมูล Firestore

## 1. บทสรุปภาพรวม (Executive Summary)
พัฒนาประสบการณ์การรับชมผลงานไวรัล (Viral Works) ให้อยู่บนหน้าเว็บโดยตรง ไม่ต้องเด้งออกไปเว็บภายนอก:
1. **Smartphone Player UI (หน้าจอโทรศัพท์สมาร์ตโฟน):** ออกแบบ Modal ในสไตล์กรอบมือถือเสมือนจริง (TikTok / Instagram Reels UI) ที่มี Bezel, Dynamic Island / Notch, Action Buttons (หัวใจ, คอมเมนต์, แชร์, บันทึก), และข้อมูลคลิป
2. **แอนิเมชันหัวใจลอยพวยพุ่งต่อเนื่อง (Continuous Live Floating Hearts):** จำลองบรรยากาศห้องไลฟ์สด โดยมีหัวใจหลายสี (แดง, ชมพู, ส้ม, ม่วงนีออน) ลอยขึ้นด้านขวาล่างของจอโทรศัพท์อย่างต่อเนื่อง และเมื่อผู้ใช้เคาะ/แตะหน้าจอ (Double Tap / Tap) จะมีหัวใจเอฟเฟกต์ระเบิดพุ่งขึ้นตามจุดสัมผัส
3. **Smart Video Engine (รองรับทั้ง Google Drive และวิดีโอทั่วไป):**
   - **Google Drive Video:** แปลงลิงก์แชร์ Google Drive (`/view`, `/usp=sharing`, `/open?id=...`) เป็น Preview Embed Player (`https://drive.google.com/file/d/{ID}/preview`) รันสตรีมได้อย่างลื่นไหลไม่มีปัญหาติดขัด
   - **Direct Video / MP4 URLs:** เล่นผ่าน HTML5 `<video>` พร้อมปุ่ม Play/Pause, Mute/Unmute, และ Loop
   - **External Fallback:** มีปุ่มกดเปิดลิงก์ต้นทางของจริง (เช่น TikTok, IG, YouTube) ในแท็บใหม่ได้ตลอดเวลา
4. **การเชื่อมต่อฐานข้อมูล Firestore & Admin Studio:**
   - ขยายโครงสร้างข้อมูล `ViralWorkItem` ให้รองรับ `driveVideoUrl?: string` และ `videoSourceType?: 'drive' | 'direct' | 'auto'`
   - อัปเดต `ViralMediaTab.tsx` ใน Admin Studio ให้มีช่องกรอกและทดสอบ Google Drive Video Link พร้อมปุ่มกดทดสอบ Preview แบบสดๆ ก่อนบันทึก
   - บันทึกการเปลี่ยนแปลงลง Firestore `/creators/{creatorId}` (ผ่าน Real-time Listener) ทำให้ทุกคนที่เปิดเว็บเห็นคลิปที่อัปเดตได้ทันที

---

## 2. สรุปคำตอบจากผู้ใช้ (Clarified Requirements)
- **แหล่งที่มาของวิดีโอ:** รองรับทั้งลิงก์วิดีโอจาก **Google Drive** และ **ลิงก์วิดีโอทั่วไป (Direct Video / MP4 / WebM)**
- **ลักษณะแอนิเมชันหัวใจ:** **มีหัวใจลอยพวยพุ่งขึ้นอย่างต่อเนื่องแบบห้องไลฟ์สดตลอดเวลา** ที่เปิดดูคลิป (พร้อมรองรับการเคาะหัวใจเพิ่มเมื่อคลิก)
- **ขอบเขตฐานข้อมูล:** สามารถ **จัดการเพิ่ม, แก้ไข, ลบ ลิงก์ Drive และคลิปไวรัลผ่านหน้า Admin** และบันทึกลง Firestore ได้อย่างสมบูรณ์

---

## 3. สถาปัตยกรรมและโครงสร้างคอมโพเนนต์ (Architecture & Components)

### 3.1 ขยาย Type Definition (`src/data/types.ts`)
```typescript
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
  driveVideoUrl?: string; // ลิงก์วิดีโอ Google Drive หรือ Direct Video Link
  tiktokUrl: string;
  category: string;
  topComments: {
    user: string;
    text: string;
    likes: string;
  }[];
}
```

### 3.2 ยูทิลิตี้ตัวแปลงลิงก์วิดีโอ (`src/data/helpers.ts`)
- สร้างฟังก์ชัน `resolveGoogleDriveVideoPreview(url: string): { type: 'drive' | 'direct' | 'none'; embedUrl?: string; rawUrl?: string }`
  - ตรวจจับ File ID ของ Google Drive: `https://drive.google.com/file/d/{FILE_ID}/...` หรือ `drive.google.com/open?id={FILE_ID}`
  - แปลงเป็น iframe preview URL: `https://drive.google.com/file/d/{FILE_ID}/preview`
  - หากเป็นลิงก์ `.mp4`, `.webm`, หรือ direct video ให้ระบุเป็น `direct`
  - หากไม่มีลิงก์วิดีโอ ให้แสดง Animated Mock Player ร่วมกับปก thumbnail คุณภาพสูง

### 3.3 คอมโพเนนต์ใหม่: `ViralPhoneModal.tsx` (`src/components/ViralPhoneModal.tsx`)
1. **Mockup Frame สมาร์ตโฟนพรีเมียม:**
   - กรอบตัวเครื่องโค้งมน สัดส่วน 9:16 (และขยายได้สำหรับแนวนอน 16:9), Dynamic Island ด้านบน, แถบ Home Indicator ด้านล่าง
   - ไฟนีออนเรืองแสงด้านหลังเครื่อง (Backdrop Ambient Lighting) ตามโทนสีของแบรนด์/แพลตฟอร์ม
2. **Video Viewport & Controls:**
   - ถ้ามี Google Drive link -> เรนเดอร์ `<iframe>` ความคมชัดสูง ไร้ขอบ
   - ถ้ามี Direct Video URL -> เรนเดอร์ `<video autoPlay loop playsInline>` พร้อมปุ่ม Mute/Unmute
   - กรณีคลิกบนวิดีโอ -> ส่งสัญญาณเคาะหัวใจ (Burst Hearts)
3. **Live Streaming Floating Hearts Engine:**
   - หัวใจแอนิเมชันลอยขึ้นอย่างต่อเนื่องจากมุมขวาล่างด้วยคณิตศาสตร์ฟังก์ชันสุ่ม (Wobble drift, ความเร็วหลากหลาย, ขนาดต่างกัน 18px - 32px, สีแดง/ส้ม/ชมพู/ทอง)
   - แอนิเมชันเบา ไม่กิน CPU/GPU ด้วย CSS transform + Framer Motion
   - Interactive Double-Tap: เคาะตรงไหนบนจอมือถือ หัวใจดวงใหญ่จะเด้งผุดขึ้นมาตรงจุดนั้นทันที
4. **TikTok/Reels Overlay:**
   - ไอคอนด้านข้าง: หัวใจ (กด Like เพิ่มยอดได้จริงใน session), คอมเมนต์ (กดดู Drawer คอมเมนต์ท็อปคอมเมนต์), แชร์ (คัดลอกลิงก์), เสียงเพลงหมุน (Vinyl Record)
   - ข้อมูลด้านล่าง: ชื่อช่อง `@juijui.j`, แท็กหมวดหมู่, คำบรรยายคลิป, ยอดวิวสะสม

### 3.4 อัปเดต `ViralShowcaseSection.tsx`
- เปลี่ยนการคลิกการ์ดผลงานไวรัล จากเดิมที่เปิด Lightbox ธรรมดา ให้เปิด `ViralPhoneModal` ทันที
- มีปุ่มทางเลือกรอง "เปิดลิงก์ภายนอก" เล็กๆ ที่มุม สำหรับคนที่ต้องการไปแอป TikTok โดยตรง

### 3.5 อัปเดต `ViralMediaTab.tsx` และ `useCreatorStudio.ts` ใน Admin Studio
- เพิ่มช่อง Input สำหรับ **"ลิงก์วิดีโอ (Google Drive หรือ MP4)"**
- มีปุ่ม **"ทดสอบพรีวิววิดีโอ"** ในหน้า Admin ทันที เพื่อให้แอดมินมั่นใจว่า Drive Link ถูกตั้งสิทธิ์เป็น Anyone with the link can view เรียบร้อยแล้ว
- บันทึกค่าลง Firestore ผ่าน `upsertViralWork` และ sync ทันที

---

## 4. ขั้นตอนการลงมือปฏิบัติ (Step-by-Step Implementation)

1. **Step 1: ขยาย Data Types & Helpers**
   - อัปเดต `/src/data/types.ts` เพิ่ม `driveVideoUrl?: string`
   - เพิ่มฟังก์ชัน `resolveGoogleDriveVideoPreview` ใน `/src/data/helpers.ts` และอัปเดต barrel files ให้ครบถ้วน
   - ใส่ตัวอย่าง `driveVideoUrl` ในผลงานไวรัลไฮไลต์ใน `/src/data/datasets/viralWorks.ts`

2. **Step 2: สร้างคอมโพเนนต์ `ViralPhoneModal.tsx`**
   - พัฒนาโครงร่างโทรศัพท์มือถือ (Phone chassis, screen bezel, camera notch, glass reflection)
   - สร้าง Floating Hearts Generator ที่ปล่อยหัวใจลอยพวยพุ่งต่อเนื่องแบบไลฟ์สด (Continuous Live Hearts)
   - ใส่ระบบ Double-Tap to Heart
   - ฝังตัวเล่นวิดีโอ Google Drive Preview Embed และ HTML5 Direct Video
   - ใส่ TikTok/Reels UI overlay: ยอดไลก์, คอมเมนต์, ปุ่มแชร์, ลิงก์คลิปจริง

3. **Step 3: ปรับแต่ง `ViralShowcaseSection.tsx` & `App.tsx`**
   - เชื่อม State การเลือกผลงานไวรัลเข้ากับ `ViralPhoneModal`
   - ปรับการ์ดคลิปให้มี Badge แจ้งชัดเจนว่า "คลิกเพื่อดูคลิปบนเว็บ" (Watch in Phone Preview)

4. **Step 4: ปรับปรุง Admin Studio (`ViralMediaTab.tsx` & `useCreatorStudio.ts`)**
   - เพิ่มฟิลด์แก้ไข `driveVideoUrl` ในแบบฟอร์มเพิ่ม/แก้ไขผลงาน
   - แสดงตัวอย่าง Preview ขนาดกะทัดรัดในหน้า Admin เพื่อตรวจสอบความถูกต้องก่อนกดบันทึก
   - เชื่อมต่อ `upsertViralWork` บันทึกลง Firestore Database

5. **Step 5: ตรวจสอบความถูกต้องและประสิทธิภาพ (Verification & Lint)**
   - รัน `lint_applet` และ `compile_applet` เพื่อยืนยันว่าไม่มีข้อผิดพลาดด้าน TypeScript หรือ Syntax
   - ตรวจสอบ Typography Discipline (ใช้ `font-bold`/`font-semibold` ไม่ใช้ `font-black` กับ UI ทั่วไป)

---

## 5. การทดสอบและเกณฑ์การยอมรับ (Acceptance Criteria)
- [ ] เมื่อคลิกการ์ดผลงานไวรัลในหน้าเว็บ จะเปิดหน้าจอจำลองสมาร์ตโฟนขึ้นมาทันที
- [ ] มีหัวใจลอยพวยพุ่งขึ้นมาตลอดเวลาอย่างต่อเนื่องในสไตล์ Live Stream
- [ ] เมื่อแตะหรือดับเบิลคลิกบนหน้าจอโทรศัพท์ จะมีหัวใจเด้งขึ้นมาเพิ่มตามตำแหน่งที่แตะ
- [ ] ลิงก์ Google Drive Video สามารถเล่นพรีวิวได้จริงใน iframe embed ของเครื่องโทรศัพท์
- [ ] มีปุ่มกดเปิดลิงก์คลิปภายนอกของจริง (TikTok/Reels) เผื่อผู้ใช้ต้องการไปดูในแอป
- [ ] ในหน้า Admin Studio มีช่องใส่และแก้ไข Google Drive Video Link พร้อมบันทึกเข้า Firestore สำเร็จ
- [ ] รันคอมไพล์ผ่าน 100% ปราศจาก error
