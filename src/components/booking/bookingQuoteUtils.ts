import { CreatorProfile, BookingRecord, RatePackage, AddOnItem } from '../../data/creatorData';

export interface GenerateQuoteParams {
  creator: CreatorProfile;
  booking?: BookingRecord | null;
  collaborationType: 'standard_package' | 'budget_friendly' | 'barter_trade';
  activePackage: RatePackage;
  customBudgetAmount: string;
  chosenAddOns: AddOnItem[];
  totalPrice: number;
  brandName: string;
  contactName: string;
  contactChannel: string;
  targetCampaignDate: string;
  productDetails: string;
  referenceLinks?: string;
}

export function generatePlainQuoteText({
  creator,
  booking,
  collaborationType,
  activePackage,
  customBudgetAmount,
  chosenAddOns,
  totalPrice,
  brandName,
  contactName,
  contactChannel,
  targetCampaignDate,
  productDetails,
  referenceLinks,
}: GenerateQuoteParams): string {
  const quoteNo = booking?.quoteNumber || 'QT-2026-DRAFT';
  const pkgLabel =
    collaborationType === 'standard_package'
      ? `${activePackage.name} (${activePackage.price.toLocaleString()} บาท)`
      : collaborationType === 'budget_friendly'
      ? `Budget Friendly (งบประมาณที่เสนอ: ${customBudgetAmount || 'รอพูดคุยรายละเอียด'})`
      : `Barter Trade (แลกเปลี่ยนสินค้า/บริการ)`;

  const addOnLines =
    chosenAddOns.length > 0
      ? chosenAddOns.map((a) => `  + ${a.name} (${a.price.toLocaleString()}.-)`).join('\n')
      : '  - ไม่มีบริการเสริมเพิ่มเติม';

  return [
    `📋 ใบสรุปรายการจองคิวงาน / ขอใบเสนอราคา (${quoteNo})`,
    `ครีเอเตอร์: ${creator.nameTh} | ${creator.nameEn} (JUIJUI Duo)`,
    `----------------------------------------`,
    `🏢 แบรนด์/บริษัท: ${brandName || (booking ? booking.brandName : '-')}`,
    `👤 ผู้ติดต่อ: ${contactName || (booking ? booking.contactName : '-')}`,
    `📞 ช่องทางติดต่อกลับ: ${contactChannel || (booking ? booking.contactChannel : '-')}`,
    `📅 ช่วงเวลาแคมเปญ: ${targetCampaignDate || 'ยืดหยุ่นได้'}`,
    `----------------------------------------`,
    `📦 รูปแบบความร่วมมือ: ${pkgLabel}`,
    `🔧 บริการเสริม:`,
    addOnLines,
    `🎁 ฟรีในแพ็กเกจ: Gencode ยิงแอด 30 วัน, สิทธิ์ใช้งาน 6 เดือน, แก้ไขได้ 3 รอบ, สรุป Insights`,
    `----------------------------------------`,
    `💰 ยอดรวมสุทธิประมาณการ: ${
      collaborationType === 'barter_trade' ? 'Barter Trade' : `${totalPrice.toLocaleString()} บาท`
    }`,
    `📝 บรีฟเบื้องต้น: ${productDetails || '-'}`,
    referenceLinks ? `🔗 ลิงก์อ้างอิง: ${referenceLinks}` : '',
    `----------------------------------------`,
    `ออกโดยระบบ Media Kit ออนไลน์: JUIJUI Creator Studio`,
  ]
    .filter(Boolean)
    .join('\n');
}
