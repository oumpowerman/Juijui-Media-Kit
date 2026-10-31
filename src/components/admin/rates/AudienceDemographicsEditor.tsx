import React, { useState } from 'react';
import {
  Users,
  Check,
  Globe,
  Calculator,
  Copy,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { PlatformDemographicsData } from '../../../data/creatorData';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import { AudienceDemographicsEditorProps } from './types';

export const AudienceDemographicsEditor: React.FC<AudienceDemographicsEditorProps> = ({
  draftCreator,
  onUpdateAgeGroupField,
  onAddAgeGroupItem,
  onDeleteAgeGroupItem,
  onUpdateGenderField,
  onUpdateLocationField,
  onAddLocationItem,
  onDeleteLocationItem,
  onUpdateDemographicsMeta,
  onCopyDemographicsBetweenPlatforms,
  onRecalculateDemographicsWeightedAverage,
  onUpdateDefaultDemographicView,
}) => {
  const [selectedDemographicPlatform, setSelectedDemographicPlatform] = useState<string>('overall');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyTargets, setCopyTargets] = useState<string[]>([
    'tiktok',
    'facebook',
    'instagram',
    'youtube',
  ]);
  const [showRecalcSuccess, setShowRecalcSuccess] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // Resolve demographics object for currently selected view
  const demo: PlatformDemographicsData =
    selectedDemographicPlatform === 'overall'
      ? draftCreator.demographics
      : draftCreator.demographics.platformDemographics?.[selectedDemographicPlatform] ||
        draftCreator.demographics;

  const ageSum = (demo.ageGroups || []).reduce(
    (acc, curr) => acc + (Number(curr.percent) || 0),
    0
  );
  const isAge100 = Math.abs(ageSum - 100) < 0.1;

  const genderSum = (demo.gender || []).reduce(
    (acc, curr) => acc + (Number(curr.percent) || 0),
    0
  );
  const isGender100 = Math.abs(genderSum - 100) < 0.2;

  const locSum = (demo.locations || []).reduce(
    (acc, curr) => acc + (Number(curr.percent) || 0),
    0
  );
  const isLoc100 = Math.abs(locSum - 100) < 0.2;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
      <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-700" />
            <span>4. ข้อมูลสัดส่วนผู้ชมเชิงลึก ป้ายกำกับ และคำอธิบายกลยุทธ์ (Demographics 100%)</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            รองรับการแยกข้อมูลสถิติทั้ง 4 แพลตฟอร์มอย่างอิสระ พร้อมคำนวณค่าเฉลี่ยภาพรวมถ่วงน้ำหนัก (Follower-Weighted) อัตโนมัติ
          </p>
        </div>

        {/* Quick Status Notice */}
        {showRecalcSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 animate-fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>คำนวณค่าเฉลี่ยถ่วงน้ำหนักสำเร็จ!</span>
          </span>
        )}
        {showCopySuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 animate-fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>คัดลอกข้อมูลไปยังช่องทางที่เลือกสำเร็จ!</span>
          </span>
        )}
      </div>

      {/* Platform Switcher & Tooling Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-violet-50/70 border border-violet-200">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-violet-950 mr-1 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-violet-700" />
            <span>เลือกช่องทางที่ต้องการจัดการ:</span>
          </span>

          {/* Overall Tab */}
          <button
            type="button"
            onClick={() => setSelectedDemographicPlatform('overall')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedDemographicPlatform === 'overall'
                ? 'bg-violet-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>ภาพรวม (Weighted Avg)</span>
          </button>

          {/* 4 Platforms */}
          {draftCreator.platforms.map((plat) => {
            const isSelected = selectedDemographicPlatform === plat.id;
            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => setSelectedDemographicPlatform(plat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-violet-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <PlatformBrandIcon platform={plat.id} size="xs" />
                <span>{plat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono-num font-normal ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {plat.followers}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {onRecalculateDemographicsWeightedAverage && (
            <button
              type="button"
              onClick={() => {
                onRecalculateDemographicsWeightedAverage();
                setShowRecalcSuccess(true);
                setTimeout(() => setShowRecalcSuccess(false), 2500);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-violet-800 border border-violet-300 hover:bg-violet-100/70 transition-colors shadow-2xs cursor-pointer"
              title="คำนวณเฉลี่ยอัตโนมัติตามสัดส่วนผู้ติดตามของแต่ละแพลตฟอร์มไปยังแท็บภาพรวม"
            >
              <Calculator className="w-3.5 h-3.5 text-violet-700" />
              <span>คำนวณค่าเฉลี่ยภาพรวมใหม่</span>
            </button>
          )}

          {onCopyDemographicsBetweenPlatforms && (
            <button
              type="button"
              onClick={() => setShowCopyModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-700 text-white hover:bg-violet-800 transition-colors shadow-2xs cursor-pointer"
              title="คัดลอกสถิติของช่องทางปัจจุบันไปยังช่องทางอื่นอย่างรวดเร็ว"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>คัดลอกไปช่องทางอื่น...</span>
            </button>
          )}
        </div>
      </div>

      {/* Client Default Demographic View Config */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-semibold">แท็บสถิติเริ่มต้นที่ลูกค้าเห็นบนหน้าเว็บ:</span>
          <span className="font-bold text-violet-900 bg-violet-100 px-2 py-0.5 rounded text-[11px]">
            {draftCreator.demographics.defaultDemographicView === 'tiktok'
              ? 'TikTok'
              : draftCreator.demographics.defaultDemographicView === 'facebook'
              ? 'Facebook'
              : draftCreator.demographics.defaultDemographicView === 'instagram'
              ? 'Instagram'
              : draftCreator.demographics.defaultDemographicView === 'youtube'
              ? 'YouTube'
              : 'ภาพรวมทุกช่องทาง (Overall Weighted)'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-500 mr-1">เปลี่ยนค่าเริ่มต้น:</span>
          {(['overall', 'tiktok', 'facebook', 'instagram', 'youtube'] as const).map((viewKey) => {
            const isCurrent =
              (draftCreator.demographics.defaultDemographicView || 'overall') === viewKey;
            return (
              <button
                key={viewKey}
                type="button"
                onClick={() => onUpdateDefaultDemographicView?.(viewKey)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-violet-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {viewKey === 'overall' ? 'ภาพรวม' : viewKey.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Platform Banner Indicator */}
      <div className="px-3.5 py-2 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-indigo-950">
        <span className="font-semibold">
          กำลังแก้ไขข้อมูล:{' '}
          <span className="font-bold text-violet-900 underline">
            {selectedDemographicPlatform === 'overall'
              ? 'ภาพรวม (Overall Weighted)'
              : draftCreator.platforms.find((p) => p.id === selectedDemographicPlatform)?.name ||
                selectedDemographicPlatform.toUpperCase()}
          </span>
          {selectedDemographicPlatform !== 'overall' && (
            <span className="text-indigo-600 ml-1.5">
              (ระบบจะบันทึกแยกเป็นสถิติเฉพาะของช่องนี้โดยตรง)
            </span>
          )}
        </span>
        <span className="text-[11px] text-slate-500">
          * ข้อมูล 3 ส่วนด้านล่างจะสลับตามช่องทางที่เลือกด้านบน
        </span>
      </div>

      {/* 3 Demographic Cards (Age, Gender, Locations) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Age Groups Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-900">1. ช่วงอายุผู้ติดตาม (%)</p>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isAge100
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isAge100 ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>100% ครบ</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>รวม {ageSum}%</span>
                  </>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onAddAgeGroupItem('45+ ปี', 5, selectedDemographicPlatform)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-[11px] font-semibold cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>เพิ่มช่วงอายุ</span>
            </button>
          </div>

          <div className="space-y-2">
            {(demo.ageGroups || []).map((ag, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs">
                <input
                  type="text"
                  value={ag.range}
                  onChange={(e) =>
                    onUpdateAgeGroupField(
                      idx,
                      'range',
                      e.target.value,
                      selectedDemographicPlatform
                    )
                  }
                  className="flex-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white rounded-lg border border-slate-300"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={ag.percent}
                  onChange={(e) =>
                    onUpdateAgeGroupField(
                      idx,
                      'percent',
                      Number(e.target.value),
                      selectedDemographicPlatform
                    )
                  }
                  className="w-16 px-2 py-1 text-xs font-mono-num font-bold text-right bg-white rounded-lg border border-slate-300"
                />
                <span className="text-slate-500">%</span>
                {(demo.ageGroups || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      onDeleteAgeGroupItem(idx, selectedDemographicPlatform)
                    }
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="ลบช่วงอายุนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2.5 border-t border-slate-200 space-y-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                ป้ายกำกับมุมขวาบน (Badge) & คำโปรยใต้หัวข้อ
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={demo.ageBadge ?? ''}
                  onChange={(e) =>
                    onUpdateDemographicsMeta(
                      'ageBadge',
                      e.target.value,
                      selectedDemographicPlatform
                    )
                  }
                  placeholder="Gen Z & Young Adults"
                  className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                />
                <input
                  type="text"
                  value={demo.ageSubtitle ?? ''}
                  onChange={(e) =>
                    onUpdateDemographicsMeta(
                      'ageSubtitle',
                      e.target.value,
                      selectedDemographicPlatform
                    )
                  }
                  placeholder="กำลังซื้อหลัก 18–34 ปี (77%)"
                  className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                ข้อความสรุปด้านล่างการ์ด (ซ้าย / ขวา)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={demo.ageFooterLeft ?? ''}
                  onChange={(e) =>
                    onUpdateDemographicsMeta(
                      'ageFooterLeft',
                      e.target.value,
                      selectedDemographicPlatform
                    )
                  }
                  placeholder="กลุ่มผู้ชมหลัก: 25-34 ปี (45%)"
                  className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                />
                <input
                  type="text"
                  value={demo.ageFooterRight ?? ''}
                  onChange={(e) =>
                    onUpdateDemographicsMeta(
                      'ageFooterRight',
                      e.target.value,
                      selectedDemographicPlatform
                    )
                  }
                  placeholder="วัยทำงานเริ่มต้น & นักศึกษา"
                  className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                Tooltip กลยุทธ์การตลาด & สินค้าที่เหมาะ
              </label>
              <input
                type="text"
                value={demo.ageTooltipStrategy ?? ''}
                onChange={(e) =>
                  onUpdateDemographicsMeta(
                    'ageTooltipStrategy',
                    e.target.value,
                    selectedDemographicPlatform
                  )
                }
                placeholder="กลยุทธ์: กลุ่มวัยรุ่นและวัยทำงานตอนต้น..."
                className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300 mb-1"
              />
              <input
                type="text"
                value={demo.ageTooltipProducts ?? ''}
                onChange={(e) =>
                  onUpdateDemographicsMeta(
                    'ageTooltipProducts',
                    e.target.value,
                    selectedDemographicPlatform
                  )
                }
                placeholder="สินค้าที่เหมาะ: อาหารและเครื่องดื่ม, แก็ดเจ็ต..."
                className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* 2. Gender Split Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-900">2. สัดส่วนเพศผู้ชม (%)</p>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isGender100
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isGender100 ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>100% ครบ</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span>รวม {genderSum}%</span>
                </>
              )}
            </span>
          </div>

          <div className="space-y-2">
            {(demo.gender || []).map((g, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs">
                <input
                  type="text"
                  value={g.label}
                  onChange={(e) =>
                    onUpdateGenderField(
                      idx,
                      'label',
                      e.target.value,
                      selectedDemographicPlatform
                    )
                  }
                  className="flex-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white rounded-lg border border-slate-300"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={g.percent}
                  onChange={(e) =>
                    onUpdateGenderField(
                      idx,
                      'percent',
                      Number(e.target.value),
                      selectedDemographicPlatform
                    )
                  }
                  className="w-16 px-2 py-1 text-xs font-mono-num font-bold text-right bg-white rounded-lg border border-slate-300"
                />
                <span className="text-slate-500">%</span>
              </div>
            ))}
          </div>

          <div className="pt-2.5 border-t border-slate-200 space-y-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                ป้ายกำกับมุมขวาบน (Badge) & คำโปรยใต้หัวข้อ
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={demo.genderBadge ?? ''}
                  onChange={(e) =>
                    onUpdateDemographicsMeta(
                      'genderBadge',
                      e.target.value,
                      selectedDemographicPlatform
                    )
                  }
                  placeholder="Mass Appeal"
                  className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                />
                <input
                  type="text"
                  value={demo.genderSubtitle ?? ''}
                  onChange={(e) =>
                    onUpdateDemographicsMeta(
                      'genderSubtitle',
                      e.target.value,
                      selectedDemographicPlatform
                    )
                  }
                  placeholder="เข้าถึงง่ายทั้งผู้หญิงและผู้ชาย"
                  className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                ข้อความสรุปด้านล่างการ์ด
              </label>
              <input
                type="text"
                value={demo.genderFooter ?? ''}
                onChange={(e) =>
                  onUpdateDemographicsMeta(
                    'genderFooter',
                    e.target.value,
                    selectedDemographicPlatform
                  )
                }
                placeholder="สมดุลดีเยี่ยม เหมาะกับสินค้าทุกหมวดหมู่ (Unisex & Mass)"
                className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                Tooltip กลยุทธ์การตลาด & สินค้าที่เหมาะ
              </label>
              <input
                type="text"
                value={demo.genderTooltipStrategy ?? ''}
                onChange={(e) =>
                  onUpdateDemographicsMeta(
                    'genderTooltipStrategy',
                    e.target.value,
                    selectedDemographicPlatform
                  )
                }
                placeholder="กลยุทธ์: สัดส่วนผู้หญิงและผู้ชายใกล้เคียงกัน..."
                className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300 mb-1"
              />
              <input
                type="text"
                value={demo.genderTooltipProducts ?? ''}
                onChange={(e) =>
                  onUpdateDemographicsMeta(
                    'genderTooltipProducts',
                    e.target.value,
                    selectedDemographicPlatform
                  )
                }
                placeholder="สินค้าที่เหมาะ: สินค้าอุปโภคบริโภค (FMCG)..."
                className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* 3. Top Locations Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-900">3. พื้นที่ผู้ชมสูงสุด (%)</p>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isLoc100
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isLoc100 ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>100% ครบ</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>รวม {locSum}%</span>
                  </>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onAddLocationItem('จังหวัดอื่นๆ', 2, selectedDemographicPlatform)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-[11px] font-semibold cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>เพิ่มพื้นที่</span>
            </button>
          </div>

          <div className="space-y-2">
            {(demo.locations || []).map((loc, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs">
                <input
                  type="text"
                  value={loc.name}
                  onChange={(e) =>
                    onUpdateLocationField(
                      idx,
                      'name',
                      e.target.value,
                      selectedDemographicPlatform
                    )
                  }
                  className="flex-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white rounded-lg border border-slate-300"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={loc.percent}
                  onChange={(e) =>
                    onUpdateLocationField(
                      idx,
                      'percent',
                      Number(e.target.value),
                      selectedDemographicPlatform
                    )
                  }
                  className="w-16 px-2 py-1 text-xs font-mono-num font-bold text-right bg-white rounded-lg border border-slate-300"
                />
                <span className="text-slate-500">%</span>
                {(demo.locations || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      onDeleteLocationItem(idx, selectedDemographicPlatform)
                    }
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="ลบพื้นที่นี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2.5 border-t border-slate-200 space-y-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                ป้ายกำกับมุมขวาบน (เว้นว่างเพื่อดึงจากอันดับ 1 อัตโนมัติ) & คำโปรย
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={demo.locationBadge ?? ''}
                  onChange={(e) =>
                    onUpdateDemographicsMeta(
                      'locationBadge',
                      e.target.value,
                      selectedDemographicPlatform
                    )
                  }
                  placeholder="ดึงจากพื้นที่อันดับ 1 อัตโนมัติ"
                  className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                />
                <input
                  type="text"
                  value={demo.locationSubtitle ?? ''}
                  onChange={(e) =>
                    onUpdateDemographicsMeta(
                      'locationSubtitle',
                      e.target.value,
                      selectedDemographicPlatform
                    )
                  }
                  placeholder="ฐานผู้ชมในเขตเมืองและหัวเมืองหลัก"
                  className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                ข้อความสรุปด้านล่างการ์ด
              </label>
              <input
                type="text"
                value={demo.locationFooter ?? ''}
                onChange={(e) =>
                  onUpdateDemographicsMeta(
                    'locationFooter',
                    e.target.value,
                    selectedDemographicPlatform
                  )
                }
                placeholder="เหมาะสำหรับแคมเปญหน้าร้าน อีเวนต์ และเดลิเวอรี"
                className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                Tooltip กลยุทธ์การตลาด & สินค้าที่เหมาะ
              </label>
              <input
                type="text"
                value={demo.locationTooltipStrategy ?? ''}
                onChange={(e) =>
                  onUpdateDemographicsMeta(
                    'locationTooltipStrategy',
                    e.target.value,
                    selectedDemographicPlatform
                  )
                }
                placeholder="กลยุทธ์: ฐานผู้ชมหนาแน่นในกรุงเทพฯ..."
                className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300 mb-1"
              />
              <input
                type="text"
                value={demo.locationTooltipProducts ?? ''}
                onChange={(e) =>
                  onUpdateDemographicsMeta(
                    'locationTooltipProducts',
                    e.target.value,
                    selectedDemographicPlatform
                  )
                }
                placeholder="สินค้าที่เหมาะ: แคมเปญดึงคนเข้าหน้าร้าน..."
                className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modal: Copy Demographics Between Platforms */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Copy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">คัดลอกข้อมูล Demographic</h4>
                  <p className="text-[11px] text-slate-500">
                    จากช่องทาง:{' '}
                    <span className="font-bold text-violet-700">
                      {selectedDemographicPlatform === 'overall'
                        ? 'ภาพรวม (Overall)'
                        : draftCreator.platforms.find((p) => p.id === selectedDemographicPlatform)?.name ||
                          selectedDemographicPlatform.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700">
                เลือกช่องทางปลายทางที่ต้องการคัดลอกข้อมูลไปแทนที่:
              </p>
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                {[
                  { id: 'overall', name: 'ภาพรวมทุกช่องทาง (Overall View)' },
                  { id: 'tiktok', name: 'TikTok' },
                  { id: 'facebook', name: 'Facebook' },
                  { id: 'instagram', name: 'Instagram' },
                  { id: 'youtube', name: 'YouTube' },
                ]
                  .filter((p) => p.id !== selectedDemographicPlatform)
                  .map((p) => {
                    const isChecked = copyTargets.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors text-xs font-medium text-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCopyTargets((prev) => [...prev, p.id]);
                            } else {
                              setCopyTargets((prev) => prev.filter((id) => id !== p.id));
                            }
                          }}
                          className="rounded text-violet-600 focus:ring-violet-500"
                        />
                        <span>{p.name}</span>
                      </label>
                    );
                  })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const allOthers = [
                    'overall',
                    'tiktok',
                    'facebook',
                    'instagram',
                    'youtube',
                  ].filter((id) => id !== selectedDemographicPlatform);
                  setCopyTargets(allOthers);
                }}
                className="text-[11px] text-violet-700 hover:underline font-semibold cursor-pointer"
              >
                เลือกปลายทางทั้งหมด
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCopyModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={copyTargets.length === 0}
                  onClick={() => {
                    if (copyTargets.length > 0 && onCopyDemographicsBetweenPlatforms) {
                      onCopyDemographicsBetweenPlatforms(
                        selectedDemographicPlatform,
                        copyTargets
                      );
                      setShowCopyModal(false);
                      setShowCopySuccess(true);
                      setTimeout(() => setShowCopySuccess(false), 2500);
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-violet-700 hover:bg-violet-800 text-white disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  ยืนยันการคัดลอก ({copyTargets.length} ช่องทาง)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
