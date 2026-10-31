import React, { useRef, useState } from 'react';
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  AnimatePresence,
} from 'motion/react';
import {
  Cake,
  Users,
  MapPin,
  Sparkles,
  Info,
  Lightbulb,
  ShoppingBag,
  Globe,
} from 'lucide-react';
import {
  CreatorProfile,
  PlatformStat,
  resolveDemographicsForView,
  PlatformDemographicsData,
} from '../../../data/creatorData';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import {
  EASE_OUT_EXPO,
  REPEAT_VIEWPORT,
  fadeUpVariant,
  slideFromLeftVariant,
  slideFromRightVariant,
} from '../motionVariants';

interface AudienceDemographicsCardProps {
  demographics: CreatorProfile['demographics'];
  platforms?: PlatformStat[];
  creator?: CreatorProfile;
  demographicsParallaxY: MotionValue<number>;
}

// Ambient floating particles configuration
const AMBIENT_PARTICLES = [
  { id: 1, top: '15%', left: '8%', size: 6, color: 'bg-violet-400', duration: 5.5, delay: 0 },
  { id: 2, top: '75%', left: '18%', size: 4, color: 'bg-indigo-400', duration: 6.2, delay: 0.8 },
  { id: 3, top: '22%', left: '48%', size: 5, color: 'bg-pink-400', duration: 4.8, delay: 1.2 },
  { id: 4, top: '82%', left: '55%', size: 4, color: 'bg-violet-400', duration: 6.8, delay: 0.4 },
  { id: 5, top: '18%', left: '88%', size: 5, color: 'bg-amber-300', duration: 5.2, delay: 1.6 },
  { id: 6, top: '78%', left: '82%', size: 6, color: 'bg-indigo-400', duration: 6.0, delay: 2.0 },
];

export const AudienceDemographicsCard: React.FC<AudienceDemographicsCardProps> = ({
  demographics,
  platforms,
  creator,
  demographicsParallaxY,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedPlatformView, setSelectedPlatformView] = useState<string>(
    demographics.defaultDemographicView || 'overall'
  );
  const [activeTooltip, setActiveTooltip] = useState<'age' | 'gender' | 'location' | null>(
    null
  );

  const availablePlatforms: PlatformStat[] =
    platforms ||
    creator?.platforms || [
      { id: 'tiktok', name: 'TikTok', followers: '660.2K' } as PlatformStat,
      { id: 'facebook', name: 'Facebook', followers: '130K' } as PlatformStat,
      { id: 'instagram', name: 'Instagram', followers: '31.9K' } as PlatformStat,
      { id: 'youtube', name: 'YouTube', followers: '157K' } as PlatformStat,
    ];

  // Resolve demographic figures for active view (overall weighted average or single platform)
  const activeDemo: PlatformDemographicsData = resolveDemographicsForView(
    creator || ({ platforms: availablePlatforms, demographics } as any),
    selectedPlatformView
  );

  // 3D Tilt Coordinates & Smooth Springs
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 22, mass: 0.6 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Subtle natural 3D tilt angles (max 5° on X, 6° on Y)
  const rotateX = useTransform(smoothMouseY, [0, 1], [5, -5]);
  const rotateY = useTransform(smoothMouseX, [0, 1], [-6, 6]);

  // Dynamic Radial Spotlight gradient tracking pointer
  const spotlightGradient = useMotionTemplate`radial-gradient(650px circle at ${spotlightX}px ${spotlightY}px, rgba(124, 58, 237, 0.12), transparent 45%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
    spotlightX.set(e.clientX - rect.left);
    spotlightY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    // Return gracefully to neutral flat orientation
    mouseX.set(0.5);
    mouseY.set(0.5);
    setActiveTooltip(null);
  };

  // Compute dynamic fallbacks for badges & notes using activeDemo
  const topLocation = (activeDemo.locations || [])[0];
  const defaultLocShort = topLocation
    ? topLocation.name.includes('กรุงเทพ') || topLocation.name.toUpperCase().includes('BKK')
      ? `BKK ${topLocation.percent}%`
      : `${topLocation.name} ${topLocation.percent}%`
    : 'BKK 80.9%';

  const ageBadgeText = activeDemo.ageBadge?.trim() || '76% วัยรุ่น';
  const ageSubtitleText = activeDemo.ageSubtitle?.trim() || 'Gen Z & วัยทำงาน';
  const ageFooterLeftText = activeDemo.ageFooterLeft?.trim() || 'กลุ่มหลัก: 18–34 ปี';
  const ageFooterRightText = activeDemo.ageFooterRight?.trim() || 'มีกำลังซื้อสูง';
  const ageStrategyText =
    activeDemo.ageTooltipStrategy?.trim() ||
    'เปิดคลิปด้วยคอมเมดี้/ชาเลนจ์ 3 วิแรก แล้ว Tie-in สินค้าให้ดูเป็นของใช้ในชีวิตประจำวันแบบเพื่อนซี้';
  const ageProductsText =
    activeDemo.ageTooltipProducts?.trim() ||
    'สกินแคร์ & บิวตี้, แฟชั่นสตรีท, แกดเจ็ต/หูฟังไอที, ของกินเล่น/เครื่องดื่ม และคาเฟ่ท่องเที่ยว';

  const genderBadgeText = activeDemo.genderBadge?.trim() || 'สมดุลคู่';
  const genderSubtitleText = activeDemo.genderSubtitle?.trim() || 'เข้าถึงทั้งชายและหญิง';
  const genderFooterText =
    activeDemo.genderFooter?.trim() || 'เหมาะสำหรับ: สินค้าไลฟ์สไตล์ & คอนซูเมอร์';
  const genderStrategyText =
    activeDemo.genderTooltipStrategy?.trim() ||
    'ใช้เคมีคู่หูชายหญิงเล่าเรื่อง แฟนซื้อให้ หรือเพื่อนป้ายยากัน ทำให้เข้าถึงและดึงคอมเมนต์จากทั้งสองเพศได้สูง';
  const genderProductsText =
    activeDemo.genderTooltipProducts?.trim() ||
    'สินค้า Unisex, อุปกรณ์เกมมิ่ง/ไอที, เสื้อผ้าสตรีท, ของขวัญวันสำคัญ, น้ำหอม และประกัน/การเงินคนรุ่นใหม่';

  const locationBadgeText = activeDemo.locationBadge?.trim() || defaultLocShort;
  const locationSubtitleText =
    activeDemo.locationSubtitle?.trim() || 'กรุงเทพฯ & หัวเมืองหลัก';
  const locationFooterText =
    activeDemo.locationFooter?.trim() ||
    'เน้นกลุ่มในเมือง: กำลังซื้อและสั่งซื้อออนไลน์สูง';
  const locationStrategyText =
    activeDemo.locationTooltipStrategy?.trim() ||
    'ฐานคนเมืองกว่า 80% คุ้นเคยกับการกดสั่งซื้อผ่าน TikTok Shop และ Delivery ทันทีหลังดูคลิป ควรแปะโค้ดส่วนลดหรือปักตะกร้าส่งด่วน';
  const locationProductsText =
    activeDemo.locationTooltipProducts?.trim() ||
    'สินค้า E-Commerce ส่งด่วน 1-2 วัน, ร้านอาหาร & บุฟเฟต์ในห้าง, แอปพลิเคชัน & แพลตฟอร์มออนไลน์, อีเวนต์และตั๋วคอนเสิร์ต';

  return (
    <div style={{ perspective: 1200 }} className="relative">
      <motion.div
        ref={cardRef}
        style={{
          y: demographicsParallaxY,
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial="hidden"
        whileInView="visible"
        viewport={REPEAT_VIEWPORT}
        variants={fadeUpVariant}
        className="group relative bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 2xl:p-10 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08)] transition-shadow duration-300 hover:shadow-[0_28px_60px_-15px_rgba(124,58,237,0.15)] overflow-visible"
      >
        {/* Dynamic Cursor Spotlight Layer */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
          style={{ background: spotlightGradient }}
        />

        {/* Ambient Floating Light Particles (Drift while idle) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none rounded-3xl">
          {AMBIENT_PARTICLES.map((particle) => (
            <motion.div
              key={particle.id}
              animate={{
                y: [-8, 8, -8],
                x: [-4, 4, -4],
                opacity: [0.25, 0.75, 0.25],
                scale: [0.9, 1.25, 0.9],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                top: particle.top,
                left: particle.left,
                width: particle.size,
                height: particle.size,
              }}
              className={`absolute rounded-full blur-[1px] ${particle.color} shadow-xs`}
            />
          ))}
        </div>

        {/* Top Header Row (Clean, Professional Copy without AI hints) */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100/90 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>เจาะลึกกลุ่มผู้ชมและฐานแฟนคลับ (Audience DNA)</span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200/60 text-[10px] font-semibold text-violet-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                  Active Telemetry
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                วิเคราะห์ฐานผู้ชมคุณภาพสูง ครอบคลุมวัยรุ่น วัยทำงาน และหัวเมืองหลัก
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-[11px] font-semibold text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>ข้อมูลกลุ่มเป้าหมายเชิงลึก (Verified Insights)</span>
          </div>
        </div>

        {/* Interactive Platform Filter Tabs Bar (Right Aligned, Compact & Responsive) */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-2xl bg-slate-100/85 border border-slate-200/90 mb-6">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pl-1.5 sm:pl-2 shrink-0">
            <span>มุมมองที่แสดง:</span>
            <span className="font-bold text-violet-900 bg-white/80 px-2 py-0.5 rounded-md border border-violet-100/90">
              {selectedPlatformView === 'overall'
                ? 'เฉลี่ยรวม 4 ช่องทาง'
                : `เฉพาะช่องทาง ${
                    availablePlatforms.find((p) => p.id === selectedPlatformView)?.name ||
                    selectedPlatformView.toUpperCase()
                  }`}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-1.5 ml-auto">
            {/* Overall Tab */}
            <button
              type="button"
              onClick={() => setSelectedPlatformView('overall')}
              className={`relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedPlatformView === 'overall'
                  ? 'bg-white text-violet-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              <span>ภาพรวมทั้งหมด</span>
            </button>

            {/* Individual Platform Tabs */}
            {availablePlatforms.map((plat) => {
              const isSelected = selectedPlatformView === plat.id;
              return (
                <button
                  key={plat.id}
                  type="button"
                  onClick={() => setSelectedPlatformView(plat.id)}
                  className={`relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <PlatformBrandIcon platform={plat.id} size="xs" />
                  <span>{plat.name}</span>
                  <span
                    className={`hidden xl:inline-block text-[10px] px-1.5 py-0.2 rounded-md font-mono-num font-semibold ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {plat.followers}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Main Data Columns with 3D Interactive Marketing Tooltips */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-7 lg:gap-8 2xl:gap-10">
          {/* Column 1: Age Distribution */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REPEAT_VIEWPORT}
            variants={slideFromLeftVariant}
            className="relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 transition-colors hover:bg-white hover:border-violet-200 hover:shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Cake className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        ช่วงอายุผู้ติดตาม (Age)
                      </h4>
                      {/* Info Tooltip Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTooltip('age')}
                          onMouseLeave={() => setActiveTooltip(null)}
                          onClick={() =>
                            setActiveTooltip(activeTooltip === 'age' ? null : 'age')
                          }
                          className="p-0.5 rounded-full text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors cursor-pointer"
                          aria-label="ดูคำแนะนำการตลาดสำหรับช่วงอายุ"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>

                        {/* 3D Glass Tooltip for Age */}
                        <AnimatePresence>
                          {activeTooltip === 'age' && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.94, rotateX: -10 }}
                              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                              exit={{ opacity: 0, y: 6, scale: 0.95 }}
                              transition={{ type: 'spring', stiffness: 360, damping: 25 }}
                              className="absolute left-0 top-full mt-2 w-72 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/15 text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] z-50 pointer-events-none text-left"
                            >
                              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300 pb-2 border-b border-white/10">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                                <span>คำแนะนำกลยุทธ์: {ageSubtitleText}</span>
                              </div>
                              <div className="mt-2.5 space-y-2 text-[11px] leading-relaxed text-slate-300">
                                <p>
                                  <strong className="text-white font-semibold">
                                    💡 กลยุทธ์การตลาด:
                                  </strong>{' '}
                                  {ageStrategyText}
                                </p>
                                <p>
                                  <strong className="text-white font-semibold">
                                    🛍️ สินค้าปิดการขายง่าย:
                                  </strong>{' '}
                                  {ageProductsText}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{ageSubtitleText}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-lg bg-violet-100/80 text-violet-800 text-[10px] font-bold shrink-0">
                  {ageBadgeText}
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {(activeDemo.ageGroups || []).map((age, i) => (
                  <div key={`${age.range}-${i}`} className="space-y-1 group/bar">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 group-hover/bar:text-violet-700 transition-colors">
                        {age.range}
                      </span>
                      <span className="font-mono-num font-bold text-violet-700 transition-all">
                        <AnimatedCounter value={age.percent} suffix="%" duration={1.4} />
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${age.percent}%` }}
                        viewport={REPEAT_VIEWPORT}
                        transition={{
                          duration: 0.85,
                          delay: 0.08 + i * 0.08,
                          ease: EASE_OUT_EXPO,
                        }}
                        className="h-full bg-linear-to-r from-violet-600 to-indigo-600 rounded-full relative"
                      >
                        <motion.div
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{
                            duration: 3,
                            delay: 1 + i * 0.25,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent w-1/2"
                        />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>{ageFooterLeftText}</span>
              <span className="font-bold text-violet-700">{ageFooterRightText}</span>
            </div>
          </motion.div>

          {/* Column 2: Gender Breakdown */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REPEAT_VIEWPORT}
            variants={fadeUpVariant}
            custom={0.08}
            className="relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 transition-colors hover:bg-white hover:border-pink-200 hover:shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        สัดส่วนเพศผู้ชม (Gender)
                      </h4>
                      {/* Info Tooltip Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTooltip('gender')}
                          onMouseLeave={() => setActiveTooltip(null)}
                          onClick={() =>
                            setActiveTooltip(activeTooltip === 'gender' ? null : 'gender')
                          }
                          className="p-0.5 rounded-full text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                          aria-label="ดูคำแนะนำการตลาดสำหรับสัดส่วนเพศ"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>

                        {/* 3D Glass Tooltip for Gender */}
                        <AnimatePresence>
                          {activeTooltip === 'gender' && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.94, rotateX: -10 }}
                              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                              exit={{ opacity: 0, y: 6, scale: 0.95 }}
                              transition={{ type: 'spring', stiffness: 360, damping: 25 }}
                              className="absolute left-0 top-full mt-2 w-72 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/15 text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] z-50 pointer-events-none text-left"
                            >
                              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-300 pb-2 border-b border-white/10">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                                <span>คำแนะนำกลยุทธ์: {genderSubtitleText}</span>
                              </div>
                              <div className="mt-2.5 space-y-2 text-[11px] leading-relaxed text-slate-300">
                                <p>
                                  <strong className="text-white font-semibold">
                                    💡 กลยุทธ์การตลาด:
                                  </strong>{' '}
                                  {genderStrategyText}
                                </p>
                                <p>
                                  <strong className="text-white font-semibold">
                                    🛍️ สินค้าปิดการขายง่าย:
                                  </strong>{' '}
                                  {genderProductsText}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{genderSubtitleText}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-lg bg-pink-100/80 text-pink-800 text-[10px] font-bold shrink-0">
                  {genderBadgeText}
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {(activeDemo.gender || []).map((g, idx) => (
                  <div
                    key={`${g.label}-${idx}`}
                    className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between transition-transform hover:scale-[1.01]"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {g.label}
                      </span>
                      <div className="w-28 sm:w-32 xl:w-44 2xl:w-56 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${g.percent}%` }}
                          viewport={REPEAT_VIEWPORT}
                          transition={{
                            duration: 0.85,
                            delay: 0.15 + idx * 0.1,
                            ease: EASE_OUT_EXPO,
                          }}
                          className={`h-full rounded-full relative ${
                            idx === 0
                              ? 'bg-linear-to-r from-violet-600 to-indigo-600'
                              : 'bg-linear-to-r from-pink-500 to-rose-500'
                          }`}
                        >
                          <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{
                              duration: 3.2,
                              delay: 1.2 + idx * 0.3,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                            className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent w-1/2"
                          />
                        </motion.div>
                      </div>
                    </div>

                    <span
                      className={`text-xl font-bold font-mono-num ${
                        idx === 0 ? 'text-violet-700' : 'text-pink-600'
                      }`}
                    >
                      <AnimatedCounter value={g.percent} suffix="%" duration={1.5} />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>{genderFooterText}</span>
            </div>
          </motion.div>

          {/* Column 3: Geographic Locations */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REPEAT_VIEWPORT}
            variants={slideFromRightVariant}
            custom={0.12}
            className="relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 transition-colors hover:bg-white hover:border-indigo-200 hover:shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        พื้นที่ผู้ชมสูงสุด (Locations)
                      </h4>
                      {/* Info Tooltip Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTooltip('location')}
                          onMouseLeave={() => setActiveTooltip(null)}
                          onClick={() =>
                            setActiveTooltip(
                              activeTooltip === 'location' ? null : 'location'
                            )
                          }
                          className="p-0.5 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          aria-label="ดูคำแนะนำการตลาดสำหรับพื้นที่ผู้ชม"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>

                        {/* 3D Glass Tooltip for Locations */}
                        <AnimatePresence>
                          {activeTooltip === 'location' && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.94, rotateX: -10 }}
                              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                              exit={{ opacity: 0, y: 6, scale: 0.95 }}
                              transition={{ type: 'spring', stiffness: 360, damping: 25 }}
                              className="absolute right-0 sm:left-0 top-full mt-2 w-72 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/15 text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] z-50 pointer-events-none text-left"
                            >
                              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 pb-2 border-b border-white/10">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                                <span>คำแนะนำกลยุทธ์: {locationSubtitleText} ({locationBadgeText})</span>
                              </div>
                              <div className="mt-2.5 space-y-2 text-[11px] leading-relaxed text-slate-300">
                                <p>
                                  <strong className="text-white font-semibold">
                                    💡 กลยุทธ์การตลาด:
                                  </strong>{' '}
                                  {locationStrategyText}
                                </p>
                                <p>
                                  <strong className="text-white font-semibold">
                                    🛍️ สินค้าปิดการขายง่าย:
                                  </strong>{' '}
                                  {locationProductsText}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {locationSubtitleText}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-lg bg-indigo-100/80 text-indigo-800 text-[10px] font-bold shrink-0">
                  {locationBadgeText}
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {(activeDemo.locations || []).map((loc, i) => (
                  <div key={`${loc.name}-${i}`} className="space-y-1 group/loc">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 group-hover/loc:text-indigo-700 transition-colors">
                        {loc.name}
                      </span>
                      <span className="font-mono-num font-bold text-slate-900">
                        <AnimatedCounter value={loc.percent} suffix="%" duration={1.4} />
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${loc.percent}%` }}
                        viewport={REPEAT_VIEWPORT}
                        transition={{
                          duration: 0.85,
                          delay: 0.1 + i * 0.08,
                          ease: EASE_OUT_EXPO,
                        }}
                        className="h-full bg-linear-to-r from-indigo-600 to-sky-500 rounded-full relative"
                      >
                        <motion.div
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{
                            duration: 3.4,
                            delay: 1.4 + i * 0.25,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent w-1/2"
                        />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>{locationFooterText}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
