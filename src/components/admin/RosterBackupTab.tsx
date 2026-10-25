import React, { useState, useRef } from 'react';
import { Download, Upload, Plus, Users, AlertCircle, FileJson } from 'lucide-react';
import { CreatorProfile } from '../../data/creatorData';

interface RosterBackupTabProps {
  currentCreator: CreatorProfile;
  allCreators: CreatorProfile[];
  onSelectCreatorId: (id: string) => void;
  onCreateNewRosterCreator: (params: {
    nameTh: string;
    nameEn: string;
    roleTitle: string;
    totalFollowers: string;
    starterPrice: number;
  }) => Promise<void>;
  onExportCreatorJson: () => void;
  onImportCreatorJson: (jsonString: string) => Promise<void>;
}

export const RosterBackupTab: React.FC<RosterBackupTabProps> = ({
  currentCreator,
  allCreators,
  onSelectCreatorId,
  onCreateNewRosterCreator,
  onExportCreatorJson,
  onImportCreatorJson,
}) => {
  const [nameTh, setNameTh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [roleTitle, setRoleTitle] = useState('ครีเอเตอร์สายบิวตี้และไลฟ์สไตล์');
  const [totalFollowers, setTotalFollowers] = useState('350K+');
  const [starterPrice, setStarterPrice] = useState(5000);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameTh.trim()) return;
    await onCreateNewRosterCreator({
      nameTh,
      nameEn,
      roleTitle,
      totalFollowers,
      starterPrice,
    });
    setNameTh('');
    setNameEn('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result as string;
        await onImportCreatorJson(text);
      } catch (err: any) {
        setImportError(err?.message || 'ไฟล์ JSON ไม่ถูกต้อง');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Creator Roster List (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-700" />
              <span>รายชื่อครีเอเตอร์ในสังกัด ({allCreators.length} ช่อง)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              คลิกเลือกครีเอเตอร์เพื่อสลับข้อมูลที่แสดงบนหน้าเว็บหลักและแก้ไขเรทการ์ดแยกตามรายบุคคล
            </p>
          </div>

          <div className="space-y-2.5">
            {allCreators.map((c) => {
              const isCurrent = c.id === currentCreator.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCreatorId(c.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-violet-600 bg-violet-50/50'
                      : 'border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={c.avatarUrl}
                      alt={c.nameTh}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/assets/juijui/page-1.png';
                      }}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {c.nameTh} | {c.nameEn}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {c.roleTitle} · ผู้ติดตามรวม{' '}
                        <span className="font-mono-num font-semibold text-slate-700">
                          {c.overview.totalFollowers}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold shrink-0 px-2.5 py-1 rounded-lg ${
                      isCurrent
                        ? 'bg-violet-700 text-white'
                        : 'text-violet-700 bg-violet-50 hover:bg-violet-100'
                    }`}
                  >
                    {isCurrent ? '✓ กำลังแสดงผล' : 'สลับไปดูช่องนี้'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Add New Creator Form (6 cols) */}
        <form
          onSubmit={handleCreateCreator}
          className="lg:col-span-6 space-y-3.5 p-5 rounded-xl bg-white border border-slate-200/90"
        >
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-700" />
              <span>เพิ่มครีเอเตอร์คนใหม่ในสังกัด</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              สร้างโปรไฟล์แยกพร้อมเรทการ์ดเริ่มต้นสำหรับอินฟลูเอนเซอร์คนอื่นในทีมของคุณ
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อช่อง (ภาษาไทย) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={nameTh}
                onChange={(e) => setNameTh(e.target.value)}
                placeholder="เช่น มินนี่ สตอรี่"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อภาษาอังกฤษ
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="เช่น MINNIE STORY"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สายคอนเทนต์หลัก
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ยอดผู้ติดตามรวม
              </label>
              <input
                type="text"
                value={totalFollowers}
                onChange={(e) => setTotalFollowers(e.target.value)}
                placeholder="เช่น 350K+"
                className="w-full px-3 py-2 text-xs font-mono-num rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ราคาแพ็กเกจเริ่มต้น Starter (บาท)
            </label>
            <input
              type="number"
              value={starterPrice}
              onChange={(e) => setStarterPrice(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono-num rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            + สร้างโปรไฟล์ครีเอเตอร์ใหม่
          </button>
        </form>
      </div>

      {/* Data Backup & Restore Section (Export / Import JSON) */}
      <div className="p-5 rounded-xl bg-white border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-700 shrink-0">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              สำรองและกู้คืนข้อมูล Media Kit (JSON Backup & Restore)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              ส่งออกข้อมูลการตั้งค่า เรทราคา และรายการผลงานของช่อง {currentCreator.nameTh} เก็บไว้เป็นไฟล์ .json หรือนำเข้าไฟล์ที่สำรองไว้
            </p>
            {importError && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {importError}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>

          <button
            type="button"
            onClick={onExportCreatorJson}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E1B4B] hover:bg-violet-900 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
