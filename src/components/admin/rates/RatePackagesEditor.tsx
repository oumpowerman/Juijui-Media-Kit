import React from 'react';
import { DollarSign, Star } from 'lucide-react';
import { RatePackagesEditorProps } from './types';

export const RatePackagesEditor: React.FC<RatePackagesEditorProps> = ({
  packages,
  onUpdatePackageField,
}) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-violet-700" />
          <span>1. แพ็กเกจหลัก (Starter / Standard / Premium)</span>
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          แก้ไขชื่อ ป้ายกำกับ ราคา ขอบเขตงาน ความคุ้มค่า ป้ายแนะนำ (Most Popular) และรายการสิ่งที่ได้รับในแต่ละแพ็กเกจ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {packages.map((pkg, idx) => {
          const isPopularActive = pkg.isPopular ?? idx === 1;
          return (
            <div
              key={pkg.id}
              className={`p-4 rounded-xl border space-y-3 flex flex-col justify-between transition-colors ${
                isPopularActive
                  ? 'border-violet-400 bg-violet-50/40'
                  : 'border-slate-200 bg-slate-50/60'
              }`}
            >
              <div className="space-y-2.5">
                {/* Popular Toggle */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-700">
                    การ์ดแพ็กเกจที่ #{idx + 1}
                  </span>
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPopularActive}
                      onChange={(e) =>
                        onUpdatePackageField(pkg.id, 'isPopular', e.target.checked)
                      }
                      className="accent-violet-700 rounded"
                    />
                    <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>ป้ายแนะนำสูงสุด (Most Popular)</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      ชื่อแพ็กเกจ
                    </label>
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) => onUpdatePackageField(pkg.id, 'name', e.target.value)}
                      className="w-full px-2.5 py-1 text-xs font-bold text-slate-900 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      ป้ายกำกับด้านบน
                    </label>
                    <input
                      type="text"
                      value={pkg.badgeText}
                      onChange={(e) => onUpdatePackageField(pkg.id, 'badgeText', e.target.value)}
                      className="w-full px-2.5 py-1 text-xs font-semibold text-violet-700 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ราคาแพ็กเกจ (บาท)
                    </label>
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={(e) =>
                        onUpdatePackageField(pkg.id, 'price', Number(e.target.value))
                      }
                      className="w-full px-3 py-1.5 text-sm font-bold font-mono-num rounded-lg bg-white border border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ความยาวคลิปสูงสุด
                    </label>
                    <input
                      type="text"
                      value={pkg.maxDuration}
                      onChange={(e) =>
                        onUpdatePackageField(pkg.id, 'maxDuration', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      จำนวนวิดีโอ
                    </label>
                    <input
                      type="text"
                      value={pkg.videoCount}
                      onChange={(e) =>
                        onUpdatePackageField(pkg.id, 'videoCount', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      จำนวนโพสต์รวม
                    </label>
                    <input
                      type="text"
                      value={pkg.totalPosts}
                      onChange={(e) =>
                        onUpdatePackageField(pkg.id, 'totalPosts', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    แพลตฟอร์มที่เผยแพร่ (ระบุชื่อช่องทาง เช่น TikTok, Facebook, Instagram, YouTube)
                  </label>
                  <input
                    type="text"
                    value={pkg.platforms}
                    onChange={(e) => onUpdatePackageField(pkg.id, 'platforms', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      ป้ายขอบเขตช่องทาง (ถ้าต้องการระบุเอง)
                    </label>
                    <input
                      type="text"
                      value={pkg.platformScopeLabel ?? ''}
                      onChange={(e) =>
                        onUpdatePackageField(pkg.id, 'platformScopeLabel', e.target.value)
                      }
                      placeholder="คำนวณอัตโนมัติจากแพลตฟอร์ม"
                      className="w-full px-2.5 py-1 text-[11px] rounded-lg bg-white border border-slate-300 text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      คำอธิบายการกระจายโพสต์ (ถ้ามี)
                    </label>
                    <input
                      type="text"
                      value={pkg.distributionSubLabel ?? ''}
                      onChange={(e) =>
                        onUpdatePackageField(pkg.id, 'distributionSubLabel', e.target.value)
                      }
                      placeholder="เช่น กระจายทุกช่องทางพร้อมกัน"
                      className="w-full px-2.5 py-1 text-[11px] rounded-lg bg-white border border-slate-300 text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    ข้อความสรุปความคุ้มค่า (ใต้ราคา)
                  </label>
                  <input
                    type="text"
                    value={pkg.costEfficiency}
                    onChange={(e) =>
                      onUpdatePackageField(pkg.id, 'costEfficiency', e.target.value)
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-violet-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    รายการสิ่งที่ได้รับ (บรรทัดละ 1 ข้อ)
                  </label>
                  <textarea
                    rows={4}
                    value={pkg.features.join('\n')}
                    onChange={(e) =>
                      onUpdatePackageField(
                        pkg.id,
                        'features',
                        e.target.value.split('\n').filter((line) => line.trim() !== '')
                      )
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-800 leading-relaxed slim-scroll"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
