import React, { useState } from 'react';
import { Download, Search, Copy, Check, ClipboardList, CheckCircle2, Clock, Wallet } from 'lucide-react';
import { BookingRecord } from '../../data/creatorData';

interface BookingsLedgerTabProps {
  bookings: BookingRecord[];
  onUpdateBookingStatus: (bookingId: string, status: BookingRecord['status']) => Promise<void>;
  onExportBookingsToCsv: () => void;
}

export const BookingsLedgerTab: React.FC<BookingsLedgerTabProps> = ({
  bookings,
  onUpdateBookingStatus,
  onExportBookingsToCsv,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | BookingRecord['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredBookings = bookings.filter((bk) => {
    if (statusFilter !== 'all' && bk.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      bk.brandName.toLowerCase().includes(q) ||
      bk.quoteNumber.toLowerCase().includes(q) ||
      bk.contactName.toLowerCase().includes(q) ||
      bk.packageName.toLowerCase().includes(q)
    );
  });

  const pendingCount = bookings.filter((b) => b.status === 'รอดำเนินการ').length;
  const quotedCount = bookings.filter((b) => b.status === 'ส่งใบเสนอราคาแล้ว').length;
  const confirmedCount = bookings.filter((b) => b.status === 'ยืนยันคิวงานแล้ว').length;
  const totalBudgetValue = bookings.reduce(
    (sum, b) => sum + (b.collaborationType === 'barter_trade' ? 0 : b.totalPrice || 0),
    0
  );

  const handleCopyBookingSummary = (bk: BookingRecord) => {
    const summary = [
      `ใบเสนอราคา: ${bk.quoteNumber} (${bk.status})`,
      `แบรนด์: ${bk.brandName} · ผู้ติดต่อ: ${bk.contactName || '-'} (${bk.contactChannel})`,
      `ครีเอเตอร์: ${bk.creatorName} · แพ็กเกจ: ${bk.packageName}`,
      `ยอดรวมสุทธิ: ${bk.totalPrice.toLocaleString()} บาท`,
      `วันที่เริ่มแคมเปญ: ${bk.targetCampaignDate || 'ตามตกลง'}`,
      `รายละเอียดบรีฟ: ${bk.productDetails || '-'}`,
    ].join('\n');

    navigator.clipboard.writeText(summary);
    setCopiedId(bk.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  return (
    <div className="space-y-5">
      {/* Executive KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">รายการจองทั้งหมด</p>
            <p className="text-xl font-bold text-slate-900 font-mono-num mt-0.5">
              {bookings.length} รายการ
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <ClipboardList className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">รอดำเนินการ / ส่งใบเสนอราคา</p>
            <p className="text-xl font-bold text-amber-700 font-mono-num mt-0.5">
              {pendingCount + quotedCount} คิว
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">ยืนยันคิวงานแล้ว</p>
            <p className="text-xl font-bold text-emerald-700 font-mono-num mt-0.5">
              {confirmedCount} คิว
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">มูลค่าใบเสนอราคารวม</p>
            <p className="text-xl font-bold text-violet-800 font-mono-num mt-0.5">
              ฿{totalBudgetValue.toLocaleString()}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-700">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Top Toolbar: Filter Tabs, Search Input & Export CSV Button */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('รอดำเนินการ')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              statusFilter === 'รอดำเนินการ'
                ? 'bg-white text-amber-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รอดำเนินการ ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ส่งใบเสนอราคาแล้ว')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              statusFilter === 'ส่งใบเสนอราคาแล้ว'
                ? 'bg-white text-violet-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ส่งใบเสนอราคาแล้ว ({quotedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ยืนยันคิวงานแล้ว')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              statusFilter === 'ยืนยันคิวงานแล้ว'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ยืนยันคิวงานแล้ว ({confirmedCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อแบรนด์ / รหัส QT..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50/70 focus:bg-white text-slate-800 focus:outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={onExportBookingsToCsv}
            disabled={bookings.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E1B4B] hover:bg-violet-900 disabled:opacity-40 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="p-10 text-center rounded-xl border border-slate-200 bg-white text-xs text-slate-500">
          ไม่พบรายการจองคิวงานที่ตรงกับตัวกรองในขณะนี้
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((bk) => (
            <div
              key={bk.id}
              className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 text-xs min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-num font-bold text-violet-700">{bk.quoteNumber}</span>
                  <span className="text-slate-300">·</span>
                  <span className="font-bold text-slate-900 text-sm">{bk.brandName}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500">{bk.createdAt}</span>
                </div>

                <p className="text-slate-600">
                  ผู้ติดต่อ: <strong className="font-semibold">{bk.contactName || '-'}</strong> (
                  {bk.contactChannel}) · วันที่เริ่มแคมเปญ: {bk.targetCampaignDate || 'ตามตกลง'}
                </p>

                <p className="text-slate-700">
                  ครีเอเตอร์: <strong className="font-semibold">{bk.creatorName}</strong> · แพ็กเกจ:{' '}
                  <strong className="font-semibold">{bk.packageName}</strong>{' '}
                  {bk.selectedAddOns.length > 0 &&
                    `+ บริการเสริม (${bk.selectedAddOns.map((a) => a.name).join(', ')})`}
                </p>

                {bk.productDetails && (
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1.5 leading-relaxed">
                    บรีฟ: {bk.productDetails}
                  </p>
                )}
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2.5 shrink-0">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">ยอดรวมสุทธิ</span>
                  <span className="text-base font-bold text-slate-900 font-mono-num">
                    {bk.collaborationType === 'barter_trade'
                      ? 'Barter Trade'
                      : `${bk.totalPrice.toLocaleString()} บาท`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyBookingSummary(bk)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                    title="คัดลอกรายละเอียดคิวงานนี้"
                  >
                    {copiedId === bk.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอก</span>
                      </>
                    )}
                  </button>

                  <select
                    value={bk.status}
                    onChange={(e) =>
                      onUpdateBookingStatus(bk.id, e.target.value as BookingRecord['status'])
                    }
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-slate-50 text-slate-800 cursor-pointer"
                  >
                    <option value="รอดำเนินการ">สถานะ: รอดำเนินการ</option>
                    <option value="ส่งใบเสนอราคาแล้ว">สถานะ: ส่งใบเสนอราคาแล้ว</option>
                    <option value="ยืนยันคิวงานแล้ว">สถานะ: ยืนยันคิวงานแล้ว</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
