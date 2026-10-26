import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  Move,
  Circle,
  Square,
  Sparkles,
  Globe,
} from 'lucide-react';
import {
  FaviconCropConfig,
  FaviconShape,
  drawCroppedFaviconToCanvas,
  exportCroppedFaviconDataUrl,
} from '../../utils/faviconUtils';

interface FaviconImageCropperModalProps {
  isOpen: boolean;
  imageSourceUrl: string;
  initialShape?: FaviconShape;
  browserTabTitlePreview: string;
  onCancel: () => void;
  onApplyCrop: (croppedDataUrl: string, shape: FaviconShape) => void;
}

export const FaviconImageCropperModal: React.FC<FaviconImageCropperModalProps> = ({
  isOpen,
  imageSourceUrl,
  initialShape = 'rounded',
  browserTabTitlePreview,
  onCancel,
  onApplyCrop,
}) => {
  const [zoom, setZoom] = useState<number>(1.15);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [shape, setShape] = useState<FaviconShape>(initialShape);
  const [imgDimensions, setImgDimensions] = useState<{ w: number; h: number } | null>(null);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number } | null>(
    null
  );
  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const mainCropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const preview64CanvasRef = useRef<HTMLCanvasElement | null>(null);
  const preview16CanvasRef = useRef<HTMLCanvasElement | null>(null);

  const renderAllPreviews = useCallback(() => {
    const img = loadedImageRef.current;
    if (!img) return;
    const config: FaviconCropConfig = { zoom, panX, panY, shape };

    if (mainCropCanvasRef.current) {
      drawCroppedFaviconToCanvas(mainCropCanvasRef.current, img, config, 240);
    }
    if (preview64CanvasRef.current) {
      drawCroppedFaviconToCanvas(preview64CanvasRef.current, img, config, 64);
    }
    if (preview16CanvasRef.current) {
      drawCroppedFaviconToCanvas(preview16CanvasRef.current, img, config, 32);
    }
  }, [zoom, panX, panY, shape]);

  useEffect(() => {
    if (!isOpen || !imageSourceUrl) return;
    setLoadError(false);
    setImgDimensions(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedImageRef.current = img;
      setImgDimensions({
        w: img.naturalWidth || img.width,
        h: img.naturalHeight || img.height,
      });
      renderAllPreviews();
    };
    img.onerror = () => {
      setLoadError(true);
    };
    img.src = imageSourceUrl;
  }, [isOpen, imageSourceUrl, renderAllPreviews]);

  useEffect(() => {
    if (isOpen && loadedImageRef.current) {
      renderAllPreviews();
    }
  }, [isOpen, zoom, panX, panY, shape, renderAllPreviews]);

  if (!isOpen) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: panX,
      startPanY: panY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Map 120px drag distance to 100% pan range
    const nextPanX = Math.max(-100, Math.min(100, dragStartRef.current.startPanX + dx * 0.9));
    const nextPanY = Math.max(-100, Math.min(100, dragStartRef.current.startPanY + dy * 0.9));
    setPanX(Math.round(nextPanX));
    setPanY(Math.round(nextPanY));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStartRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleResetCrop = () => {
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
  };

  const handleConfirm = () => {
    if (!loadedImageRef.current) return;
    try {
      const dataUrl = exportCroppedFaviconDataUrl(
        loadedImageRef.current,
        { zoom, panX, panY, shape },
        96
      );
      onApplyCrop(dataUrl, shape);
    } catch {
      // Fallback if external CORS blocks canvas export
      onApplyCrop(imageSourceUrl, shape);
    }
  };

  const isNonSquare =
    imgDimensions && Math.abs(imgDimensions.w - imgDimensions.h) > 8;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
              <Crop className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold">
                Preview & ครอปเลือกจุดที่ต้องการสำหรับไอคอนแท็บ (Favicon Cropper)
              </h4>
              <p className="text-[11px] text-slate-300">
                ใช้เมาส์ลากรูปภาพหรือเลื่อนแถบซูมเพื่อจัดวางตำแหน่งให้พอดีแม้รูปต้นฉบับจะไม่ใช่จัตุรัส
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 bg-slate-50/60">
          {loadError ? (
            <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-2">
              <p className="text-xs font-bold text-rose-800">
                ไม่สามารถโหลดรูปภาพนี้มาครอปได้ (อาจติดสิทธิ์การเข้าถึงลิงก์ภายนอก)
              </p>
              <p className="text-[11px] text-rose-600">
                แนะนำให้อัปโหลดไฟล์รูปภาพจากเครื่องคอมพิวเตอร์โดยตรงเพื่อครอปได้อย่างอิสระ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left Column: Interactive Drag & Crop Canvas (7 cols) */}
              <div className="md:col-span-7 flex flex-col items-center bg-white p-4 rounded-xl border border-slate-200/90 space-y-3">
                <div className="w-full flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-violet-600" />
                    <span>คลิกค้างแล้วลากที่ภาพเพื่อขยับตำแหน่ง</span>
                  </span>
                  {imgDimensions && (
                    <span
                      className={`font-mono-num font-semibold px-2 py-0.5 rounded-md ${
                        isNonSquare
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {imgDimensions.w} × {imgDimensions.h} px
                      {isNonSquare ? ' (ครอปเป็น 1:1)' : ' (1:1)'}
                    </span>
                  )}
                </div>

                {/* 240x240 Interactive Crop Viewport */}
                <div
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className={`relative w-[240px] h-[240px] rounded-2xl overflow-hidden border-2 select-none touch-none transition-colors ${
                    isDragging
                      ? 'border-violet-600 cursor-grabbing shadow-lg'
                      : 'border-slate-300 hover:border-violet-500 cursor-grab shadow-xs'
                  }`}
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
                  }}
                >
                  <canvas
                    ref={mainCropCanvasRef}
                    width={240}
                    height={240}
                    className="w-full h-full block pointer-events-none"
                  />

                  {/* Rule-of-Thirds Alignment Grid Overlay */}
                  <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/45" />
                    <div className="border-r border-b border-white/45" />
                    <div className="border-b border-white/45" />
                    <div className="border-r border-b border-white/45" />
                    <div className="border-r border-b border-white/45" />
                    <div className="border-b border-white/45" />
                    <div className="border-r border-white/45" />
                    <div className="border-r border-white/45" />
                    <div />
                  </div>
                </div>

                {/* Shape Selector */}
                <div className="w-full pt-1">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    รูปทรงกรอบไอคอนหน้าแท็บ (Icon Mask Shape)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'circle' as const, label: 'วงกลม', icon: Circle },
                      { id: 'rounded' as const, label: 'สี่เหลี่ยมขอบมน', icon: Sparkles },
                      { id: 'square' as const, label: 'สี่เหลี่ยมเต็ม', icon: Square },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = shape === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setShape(item.id)}
                          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            active
                              ? 'bg-violet-700 text-white border-violet-700 shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Zoom / Pan Controls + Live Actual Size Preview (5 cols) */}
              <div className="md:col-span-5 space-y-4">
                {/* Live Browser Tab Actual Size Preview */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    ตัวอย่างเมื่อแสดงบนแท็บจริง (Live Preview)
                  </span>

                  {/* Mini Chrome Tab Simulation */}
                  <div className="bg-slate-200/90 pt-2 px-2.5 rounded-t-xl border border-slate-300/80">
                    <div className="bg-white rounded-t-lg px-3 py-2 flex items-center gap-2 shadow-2xs max-w-full">
                      <canvas
                        ref={preview16CanvasRef}
                        width={32}
                        height={32}
                        className="w-4 h-4 shrink-0"
                      />
                      <span className="text-[11px] font-semibold text-slate-800 truncate">
                        {browserTabTitlePreview}
                      </span>
                      <X className="w-3 h-3 text-slate-400 shrink-0 ml-auto" />
                    </div>
                  </div>
                  <div className="bg-slate-100 px-3 py-1.5 rounded-b-xl border-x border-b border-slate-300/80 flex items-center gap-1.5 text-[10px] text-slate-500 -mt-3">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span className="truncate">juijui-mediakit.app</span>
                  </div>

                  {/* 64x64 & 16x16 Side-by-Side Comparison */}
                  <div className="flex items-center justify-around pt-2 border-t border-slate-100">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center p-1">
                        <canvas
                          ref={preview64CanvasRef}
                          width={64}
                          height={64}
                          className="w-14 h-14"
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">
                        ขนาดขยาย (64×64)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Zoom & Position Sliders */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      ปรับความซูม & ตำแหน่งละเอียด
                    </span>
                    <button
                      type="button"
                      onClick={handleResetCrop}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 hover:text-violet-900 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>รีเซ็ตกึ่งกลาง</span>
                    </button>
                  </div>

                  {/* Zoom */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">ซูมขยาย (Zoom)</span>
                      <span className="font-mono-num font-bold text-violet-700">
                        {zoom.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)))}
                        className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min={1}
                        max={4}
                        step={0.05}
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full accent-violet-700 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.min(4, +(z + 0.15).toFixed(2)))}
                        className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Pan X */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">เลื่อนซ้าย-ขวา (แนวนอน)</span>
                      <span className="font-mono-num font-semibold text-slate-700">{panX}%</span>
                    </div>
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      step={1}
                      value={panX}
                      onChange={(e) => setPanX(parseInt(e.target.value, 10))}
                      className="w-full accent-violet-700 cursor-pointer"
                    />
                  </div>

                  {/* Pan Y */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">เลื่อนบน-ล่าง (แนวตั้ง)</span>
                      <span className="font-mono-num font-semibold text-slate-700">{panY}%</span>
                    </div>
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      step={1}
                      value={panY}
                      onChange={(e) => setPanY(parseInt(e.target.value, 10))}
                      className="w-full accent-violet-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={loadError}
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>ยืนยันจุดที่ครอป & ใช้เป็นไอคอนแท็บ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
