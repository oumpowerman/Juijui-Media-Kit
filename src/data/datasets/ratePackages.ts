import type { RatePackage, FreeIncludedItem, AddOnItem } from '../types';

export const INITIAL_PACKAGES: RatePackage[] = [
  {
    id: 'pkg-starter',
    name: 'STARTER',
    badgeText: 'สำหรับแบรนด์เริ่มต้น',
    tagline: 'เหมาะสำหรับแบรนด์เริ่มต้น และแคมเปญทดลองตลาด',
    price: 9000,
    isPopular: false,
    videoCount: '1 วิดีโอคอนเทนต์',
    maxDuration: 'ไม่เกิน 90 วินาที',
    platforms: 'เฉพาะ TikTok (1 ช่องทาง)',
    totalPosts: '1 โพสต์ (TikTok)',
    bestFor: 'แคมเปญทดลองตลาด / โปรโมทสินค้าระยะสั้น',
    costEfficiency: '9,000.- / คอนเทนต์',
    features: [
      '1 วิดีโอคอนเทนต์ (คิดสตอรี่และถ่ายทำโดยจุ๊ยจุ๊ย)',
      'ความยาววิดีโอไม่เกิน 90 วินาที',
      'เผยแพร่เฉพาะช่องทาง TikTok (1 ช่องทาง)',
      'เหมาะสำหรับแคมเปญทดลองตลาด',
      'ฟรี! Gencode / Boost Code + รายงาน Insights 30 วัน',
    ],
  },
  {
    id: 'pkg-standard',
    name: 'STANDARD',
    badgeText: 'คุ้มค่าที่สุด · ยอดนิยม',
    tagline: 'เหมาะสำหรับแคมเปญทั่วไป เพิ่มการมองเห็นสูงสุดทุกแพลตฟอร์ม',
    price: 10000,
    isPopular: true,
    videoCount: '1 วิดีโอคอนเทนต์',
    maxDuration: 'ไม่เกิน 300 วินาที (5 นาที)',
    platforms: 'ทุกแพลตฟอร์ม (TikTok / IG / FB / YT Shorts)',
    totalPosts: '4 โพสต์ (กระจายครบ 4 แพลตฟอร์ม)',
    bestFor: 'แคมเปญทั่วไปที่ต้องการ Cross-Platform Reach สูงสุด',
    costEfficiency: 'เฉลี่ยเพียง 2,500.- / แพลตฟอร์ม',
    features: [
      '1 วิดีโอคอนเทนต์คุณภาพสูง',
      'ความยาววิดีโอจัดเต็มไม่เกิน 300 วินาที',
      'เผยแพร่กระจายทุกแพลตฟอร์ม (TikTok / IG / FB / YT Shorts)',
      'เพิ่มการมองเห็นแบบ Cross-Platform สูงสุด (ฐานผู้ติดตามรวม 979K+)',
      'ฟรี! สิทธิ์เชิงพาณิชย์ 6 เดือน + แก้ไขได้สูงสุด 3 ครั้ง',
    ],
  },
  {
    id: 'pkg-premium',
    name: 'PREMIUM',
    badgeText: 'แคมเปญขนาดใหญ่ · ประหยัดสุด',
    tagline: 'เหมาะสำหรับแคมเปญขนาดใหญ่ ทำเป็นซีรีส์สร้างการจดจำระยะยาว',
    price: 20000,
    isPopular: false,
    videoCount: '3 วิดีโอคอนเทนต์ (คละแนวทาง/ทำซีรีส์ได้)',
    maxDuration: 'ไม่เกิน 300 วินาที / คลิป',
    platforms: 'ทุกแพลตฟอร์ม (TikTok / IG / FB / YT Shorts)',
    totalPosts: 'รวม 12 โพสต์ (3 คลิป × 4 แพลตฟอร์ม)',
    bestFor: 'แคมเปญขนาดใหญ่ / เปิดตัวสินค้า / ซีรีส์ระยะยาว',
    costEfficiency: 'เฉลี่ย 6,666.- / คลิป',
    features: [
      '3 วิดีโอคอนเทนต์ (คละแนวทางหรือทำเป็นซีรีส์ต่อเนื่องได้)',
      'เผยแพร่กระจายทุกแพลตฟอร์ม (รวมทั้งหมด 12 โพสต์)',
      'ครอบคลุม TikTok / IG Reels / Facebook / YouTube Shorts',
      'เฉลี่ยประหยัดกว่าซื้อแยกถึง 10,000 บาท เหมาะสำหรับแคมเปญระยะยาว',
      'ฟรี! บริการรวมในแพ็กเกจครบทั้ง 4 รายการ',
    ],
  },
];

export const INITIAL_FREE_PERKS: FreeIncludedItem[] = [
  { id: 'free-1', name: 'Gencode / Boost Code / Partnership Code', priceLabel: 'ราคา 0.- (ฟรี)' },
  { id: 'free-2', name: 'รายงาน Insights หลังโพสต์ไปแล้ว 30 วัน', priceLabel: 'ราคา 0.- (ฟรี)' },
  { id: 'free-3', name: 'สิทธิ์นำคลิปไปใช้เชิงพาณิชย์ 6 เดือน', priceLabel: 'ราคา 0.- (ฟรี)' },
  { id: 'free-4', name: 'แก้ไขสูงสุด 3 ครั้ง (ตามบรีฟ)', priceLabel: 'ราคา 0.- (ฟรี)' },
];

export const INITIAL_ADD_ONS: AddOnItem[] = [
  {
    id: 'addon-brand-cut',
    name: 'ตัดต่อเวอร์ชันพิเศษสำหรับลงช่องทางแบรนด์',
    description: 'ปรับอัตราส่วนหรือจังหวะคลิปเพิ่มเติมสำหรับนำไปโพสต์บน Official Account ของแบรนด์โดยเฉพาะ',
    price: 500,
  },
  {
    id: 'addon-cart-link',
    name: 'ปักตะกร้า + แปะลิงก์พิกัดสินค้าทุกแพลตฟอร์ม',
    description: 'ปักตะกร้า TikTok Shop พร้อมแนบลิงก์สั่งซื้อในคอมเมนต์/แคปชันครบทุกช่องทางเพื่อเร่งยอดขาย',
    price: 1000,
  },
  {
    id: 'addon-fast-track',
    name: 'คิวงานด่วน: ส่งดราฟต์แรกภายใน 24–48 ชม.',
    description: 'ลัดคิวถ่ายทำและตัดต่อด่วนพิเศษ เหมาะสำหรับแคมเปญเร่งด่วนหรือทันกระแสเทรนด์',
    price: 1000,
  },
  {
    id: 'addon-lifetime-rights',
    name: 'สิทธิ์นำคลิปไปใช้เชิงพาณิชย์ตลอดชีพ',
    description: 'อัปเกรดจากสิทธิ์ฟรี 6 เดือน เป็นสิทธิ์การใช้งานเชิงพาณิชย์และยิงโฆษณาได้ตลอดชีพ (Perpetual Buyout)',
    price: 1000,
  },
  {
    id: 'addon-photo-album',
    name: 'Photo Post / อัลบั้มภาพถ่าย 3–5 รูป (ลง Facebook & Instagram)',
    description: 'เซ็ตภาพนิ่งไลฟ์สไตล์คู่กับสินค้า 3–5 รูป โพสต์ลงทั้ง Facebook และ Instagram เพิ่มเติมจากคลิปวิดีโอ',
    price: 1500,
  },
];

export const INITIAL_CUSTOM_COLLAB_NOTES = [
  {
    title: 'Budget Friendly',
    description: 'ยินดีปรับลดหรือขยายขอบเขตงานให้ลงตัวกับงบประมาณที่แบรนด์ตั้งไว้ สามารถพูดคุยเพื่อจัดแพ็กเกจเฉพาะกิจได้',
  },
  {
    title: 'Barter Trade',
    description: 'เปิดรับการร่วมงานแบบรีวิวแลกเปลี่ยนสินค้าหรือบริการที่น่าสนใจและตรงกับแนวทางช่อง (เช่น ทริปท่องเที่ยว ที่พัก หรือแก็ดเจ็ต)',
  },
];
