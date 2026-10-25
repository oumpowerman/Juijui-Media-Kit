import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  AlertCircle,
  Building2,
  User,
  Phone,
  Calendar,
  FileText,
  Link2,
  Wand2,
  Check,
  ShoppingBag,
  Megaphone,
  HeartHandshake,
} from 'lucide-react';
import { EASE_OUT_EXPO } from '../sections/motionVariants';

export interface BookingStep2BrandFormProps {
  brandName: string;
  onChangeBrandName: (val: string) => void;
  contactName: string;
  onChangeContactName: (val: string) => void;
  contactChannel: string;
  onChangeContactChannel: (val: string) => void;
  targetCampaignDate: string;
  onChangeTargetCampaignDate: (val: string) => void;
  productDetails: string;
  onChangeProductDetails: (val: string) => void;
  referenceLinks: string;
  onChangeReferenceLinks: (val: string) => void;
  errorMsg: string | null;
  onQuickDemoFill: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const QUICK_BRIEF_TAGS = [
  {
    id: 'launch',
    text: 'เปิดตัวสินค้าใหม่ สร้างกระแสไวรัล',
    icon: Sparkles,
  },
  {
    id: 'sales',
    text: 'ปั้นยอดขาย + ปักตะกร้า TikTok Shop',
    icon: ShoppingBag,
  },
  {
    id: 'awareness',
    text: 'สร้างการรับรู้แบรนด์ (Brand Awareness)',
    icon: Megaphone,
  },
  {
    id: 'review',
    text: 'รีวิวทดลองใช้จริง เคมีเพื่อนซี้ป้ายยา',
    icon: HeartHandshake,
  },
];

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const BookingStep2BrandForm: React.FC<BookingStep2BrandFormProps> = ({
  brandName,
  onChangeBrandName,
  contactName,
  onChangeContactName,
  contactChannel,
  onChangeContactChannel,
  targetCampaignDate,
  onChangeTargetCampaignDate,
  productDetails,
  onChangeProductDetails,
  referenceLinks,
  onChangeReferenceLinks,
  errorMsg,
  onQuickDemoFill,
  onSubmit,
}) => {
  const handleToggleBriefTag = (tag: string) => {
    if (productDetails.includes(tag)) {
      // Remove tag cleanly
      let updated = productDetails
        .replace(new RegExp(`\\s*·\\s*${escapeRegExp(tag)}`, 'g'), '')
        .replace(new RegExp(`${escapeRegExp(tag)}\\s*·\\s*`, 'g'), '')
        .replace(new RegExp(escapeRegExp(tag), 'g'), '')
        .trim();

      // Clean up leading/trailing separator or leftover prefix
      updated = updated.replace(/^·\s*/, '').replace(/\s*·$/, '').trim();
      if (
        updated === 'เป้าหมายแคมเปญ:' ||
        updated === 'เป้าหมายแคมเปญ' ||
        updated === 'เป้าหมายแคมเปญ: ·' ||
        updated === 'เป้าหมายแคมเปญ: '
      ) {
        updated = '';
      }
      onChangeProductDetails(updated);
    } else {
      // Add tag
      const trimmed = productDetails.trim();
      const prefix = trimmed ? `${trimmed} · ` : 'เป้าหมายแคมเปญ: ';
      onChangeProductDetails(`${prefix}${tag}`);
    }
  };

  return (
    <motion.form
      id="booking-step2-form"
      key="step-2"
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
      onSubmit={onSubmit}
      className="space-y-4"
    >
      {/* Top Helper Banner + Quick Demo Fill */}
      <div className="p-3.5 rounded-2xl bg-linear-to-r from-violet-50/90 via-indigo-50/40 to-white border border-violet-200/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              กรอกข้อมูลเพื่อออกใบเสนอราคาทางการ (Official Quotation)
            </p>
            <p className="text-[11px] text-slate-500">
              ใช้เวลาไม่ถึง 1 นาที หรือกดปุ่มด้านขวาเพื่อดูตัวอย่างการกรอกทันที
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onQuickDemoFill}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>กรอกข้อมูลตัวอย่างด่วน (Quick Fill)</span>
        </motion.button>
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </motion.div>
      )}

      {/* Brand & Contact Person */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            ชื่อแบรนด์ / บริษัท <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-violet-600 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => onChangeBrandName(e.target.value)}
              placeholder="เช่น บริษัท ออร่าโกลว์ จำกัด"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-600/15 focus:outline-hidden text-slate-900 font-medium transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            ชื่อผู้ติดต่อ / ตำแหน่ง
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-indigo-600 absolute left-3.5 top-3" />
            <input
              type="text"
              value={contactName}
              onChange={(e) => onChangeContactName(e.target.value)}
              placeholder="เช่น คุณพลอย (ฝ่ายการตลาด / PR)"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-600/15 focus:outline-hidden text-slate-900 font-medium transition-all"
            />
          </div>
        </div>
      </div>

      {/* Contact Channel & Campaign Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            ช่องทางติดต่อกลับ (เบอร์ / LINE ID / อีเมล) <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={contactChannel}
              onChange={(e) => onChangeContactChannel(e.target.value)}
              placeholder="เช่น LINE: @brand_pr หรือ 081-234-5678"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-600/15 focus:outline-hidden text-slate-900 font-medium transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            วันที่คาดว่าจะเริ่มแคมเปญ / เผยแพร่
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-violet-600 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="date"
              value={targetCampaignDate}
              onChange={(e) => onChangeTargetCampaignDate(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-600/15 focus:outline-hidden text-slate-900 font-medium transition-all"
            />
          </div>
        </div>
      </div>

      {/* Product Brief + Quick Objective Chips */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-violet-600" />
            <span>รายละเอียดสินค้า จุดขายหลัก และแนวคอนเทนต์ที่อยากได้</span>
          </label>
          <span className="text-[11px] text-slate-500">คลิกป้ายด่วนด้านล่างเพื่อช่วยกรอกได้</span>
        </div>

        {/* Stable 2x2 Structured Quick Objective Grid (Zero Layout Shift) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
          {QUICK_BRIEF_TAGS.map((item) => {
            const isIncluded = productDetails.includes(item.text);
            const ItemIcon = item.icon;

            return (
              <motion.button
                key={item.id}
                whileHover={{ y: -1.5, scale: 1.008 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleToggleBriefTag(item.text)}
                className={`w-full flex items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border text-left ${
                  isIncluded
                    ? 'bg-violet-50/90 border-violet-600 text-violet-950 shadow-2xs ring-1 ring-violet-600/20'
                    : 'bg-slate-50/80 hover:bg-white border-slate-200 text-slate-700 hover:border-violet-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isIncluded
                        ? 'bg-violet-700 text-white'
                        : 'bg-slate-200/70 text-slate-500'
                    }`}
                  >
                    <ItemIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate text-[11px] sm:text-xs font-medium text-slate-900">
                    {item.text}
                  </span>
                </div>

                <div
                  className={`w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                    isIncluded
                      ? 'bg-violet-700 border-violet-700 text-white shadow-2xs'
                      : 'bg-white border-slate-300 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              </motion.button>
            );
          })}
        </div>

        <textarea
          rows={3}
          value={productDetails}
          onChange={(e) => onChangeProductDetails(e.target.value)}
          placeholder="ระบุชื่อสินค้า จุดเด่น คีย์แมสเสจ หรือมู้ดที่อยากให้จุ๊ยจุ๊ยนำเสนอ..."
          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-600/15 focus:outline-hidden text-slate-900 font-medium transition-all leading-relaxed"
        />
      </div>

      {/* Reference Links */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1.5">
          ลิงก์บรีฟ Google Drive หรือคลิปอ้างอิงที่ชอบ (ถ้ามี)
        </label>
        <div className="relative">
          <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={referenceLinks}
            onChange={(e) => onChangeReferenceLinks(e.target.value)}
            placeholder="วางลิงก์ Google Drive หรือชื่อคลิปไวรัลของช่องที่อยากได้มู้ดใกล้เคียงกัน"
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-600/15 focus:outline-hidden text-slate-900 font-medium transition-all"
          />
        </div>
      </div>
    </motion.form>
  );
};
