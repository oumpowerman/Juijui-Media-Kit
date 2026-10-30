import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Eye,
  Sparkles,
  Check,
  Disc3,
  Flame,
  ArrowRight,
  Film,
} from 'lucide-react';
import {
  ViralWorkItem,
  resolveGoogleDriveImage,
  resolveVideoSource,
} from '../data/creatorData';
import { PlatformBrandIcon } from './ui/PlatformBrandIcon';
import { EASE_OUT_EXPO } from './sections/motionVariants';

interface FloatingHeart {
  id: number;
  x: number; // offset X in px
  size: number;
  color: string;
  duration: number;
  sway: number;
  rotate: number;
}

interface BurstHeart {
  id: number;
  x: number; // client coordinate inside phone
  y: number;
  size: number;
  color: string;
}

interface ViralPhoneModalProps {
  item: ViralWorkItem | null;
  onClose: () => void;
  onBookSimilar?: (referenceTitle: string) => void;
  onOpenAdmin?: () => void;
}

const HEART_COLORS = [
  '#EF4444', // Red
  '#F43F5E', // Rose
  '#EC4899', // Pink
  '#FB7185', // Coral
  '#F97316', // Orange
  '#A855F7', // Violet
  '#EAB308', // Amber gold
];

// Gentle web audio pop synth for like interaction
function playPopSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // Audio context may be restricted before user gesture
  }
}

export const ViralPhoneModal: React.FC<ViralPhoneModalProps> = ({
  item,
  onClose,
  onBookSimilar,
  onOpenAdmin,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [userLikesDelta, setUserLikesDelta] = useState(0);
  const [isHeartLiked, setIsHeartLiked] = useState(false);

  // Live streaming floating hearts state
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  // Double-tap burst hearts state
  const [burstHearts, setBurstHearts] = useState<BurstHeart[]>([]);

  const phoneRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const heartIdCounter = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Lock body scroll and close on Escape key
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [item, onClose]);

  // Spawn continuous live streaming hearts floating upward from bottom right
  useEffect(() => {
    if (!item) return;

    const interval = setInterval(() => {
      heartIdCounter.current += 1;
      const newHeart: FloatingHeart = {
        id: heartIdCounter.current,
        x: (Math.random() - 0.5) * 54, // random wobble spread
        size: Math.floor(Math.random() * 14) + 18, // 18px to 32px
        color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
        duration: Math.random() * 1.2 + 2.2, // 2.2s to 3.4s
        sway: (Math.random() - 0.5) * 40,
        rotate: (Math.random() - 0.5) * 45,
      };

      setFloatingHearts((prev) => [...prev.slice(-16), newHeart]);
    }, 420);

    return () => clearInterval(interval);
  }, [item]);

  // Clean up completed floating hearts
  const handleRemoveFloatingHeart = useCallback((id: number) => {
    setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const handleRemoveBurstHeart = useCallback((id: number) => {
    setBurstHearts((prev) => prev.filter((h) => h.id !== id));
  }, []);

  // Trigger double-tap / tap heart effect
  const handlePhoneAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    lastTapRef.current = now;

    const rect = phoneRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Trigger burst heart on double-tap OR single-click on video
    heartIdCounter.current += 1;
    const burst: BurstHeart = {
      id: heartIdCounter.current,
      x,
      y,
      size: timeSinceLastTap < 360 ? 54 : 36,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
    };

    setBurstHearts((prev) => [...prev.slice(-8), burst]);
    playPopSound();

    if (!isHeartLiked) {
      setIsHeartLiked(true);
      setUserLikesDelta((d) => d + 1);
    } else {
      setUserLikesDelta((d) => d + 1);
    }
  };

  const handleHeartButtonPress = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHeartLiked(true);
    setUserLikesDelta((d) => d + 1);
    playPopSound();

    // Spawn 3 rapid burst hearts
    if (phoneRef.current) {
      const rect = phoneRef.current.getBoundingClientRect();
      const x = rect.width - 48;
      const y = rect.height * 0.55;
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          heartIdCounter.current += 1;
          setBurstHearts((prev) => [
            ...prev,
            {
              id: heartIdCounter.current,
              x: x + (Math.random() - 0.5) * 20,
              y: y + (Math.random() - 0.5) * 20,
              size: 42,
              color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
            },
          ]);
        }, i * 90);
      }
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item) return;
    const shareUrl = item.driveVideoUrl || item.tiktokUrl || window.location.href;
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const toggleDirectVideoPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  if (!item) return null;

  // Resolve video source
  const videoSource = resolveVideoSource(item.driveVideoUrl || item.tiktokUrl);
  const resolvedThumb = item.driveImageUrl
    ? resolveGoogleDriveImage(item.driveImageUrl)
    : item.thumbnailUrl;

  const isHorizontal = item.orientation === 'horizontal';

  return (
    <AnimatePresence>
      <motion.div
        key="viral-phone-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        onClick={onClose}
        className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Glow halo behind smartphone */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[520px] h-[720px] bg-gradient-to-tr from-rose-500/25 via-violet-600/20 to-amber-500/25 blur-3xl rounded-full opacity-60" />
        </div>

        {/* Modal Container */}
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.88, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 flex flex-col items-center my-auto max-w-full"
        >
          {/* Top Floating Action Bar */}
          <div className="w-full flex items-center justify-between gap-3 mb-3 text-white px-2 max-w-[420px]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/90 text-white text-[11px] font-bold shadow-lg uppercase tracking-wider backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Live Preview
              </span>
              <span className="text-xs text-white/70 font-semibold truncate max-w-[170px]">
                {item.platform}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {item.tiktokUrl && (
                <a
                  href={item.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                  title="เปิดคลิปจริงในแอป"
                >
                  <span>เปิดดูในแอป</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-xs"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SMARTPHONE CHASSIS */}
          <div
            ref={phoneRef}
            onClick={handlePhoneAreaClick}
            className={`relative select-none transition-all duration-300 ${
              isHorizontal
                ? 'w-[92vw] max-w-[680px] aspect-[16/10] sm:aspect-[16/9.5]'
                : 'w-[92vw] max-w-[380px] sm:max-w-[410px] aspect-[9/18.5] max-h-[82vh]'
            } bg-slate-900 border-[8px] sm:border-[10px] border-slate-900 rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.15)] overflow-hidden flex flex-col`}
          >
            {/* Top Dynamic Island / Speaker Pill */}
            <div className="absolute top-2 inset-x-0 z-40 flex justify-center pointer-events-none">
              <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2.5 gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#1e293b]" />
                <span className="w-2.5 h-2.5 rounded-full bg-black border border-slate-800" />
              </div>
            </div>

            {/* SCREEN VIEWPORT */}
            <div className="relative flex-1 w-full h-full bg-black rounded-[34px] overflow-hidden">
              {/* VIDEO LAYER */}
              {videoSource.type === 'drive' ? (
                // Google Drive Embed Player
                <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                  <iframe
                    src={videoSource.embedUrl}
                    title={item.title}
                    allow="autoplay; fullscreen"
                    referrerPolicy="no-referrer"
                    className="w-full h-full border-0 absolute inset-0"
                  />
                  {/* Subtle top gradient */}
                  <div className="absolute top-0 inset-x-0 h-16 pointer-events-none bg-gradient-to-b from-black/60 to-transparent" />
                </div>
              ) : videoSource.type === 'direct' ? (
                // HTML5 Direct Video Player
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={videoSource.src}
                    poster={resolvedThumb}
                    autoPlay
                    loop
                    playsInline
                    muted={isMuted}
                    className="w-full h-full object-cover"
                  />
                  {/* Big Play/Pause Toggle Indicator on click */}
                  {!isPlaying && (
                    <button
                      type="button"
                      onClick={toggleDirectVideoPlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 text-white cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
                        <Play className="w-8 h-8 fill-white text-white ml-1" />
                      </div>
                    </button>
                  )}
                </div>
              ) : videoSource.type === 'youtube' ? (
                // YouTube Player
                <div className="relative w-full h-full bg-black">
                  <iframe
                    src={videoSource.embedUrl}
                    title={item.title}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                // Cinematic Fallback with Play Prompt & Thumbnail
                <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center">
                  <img
                    src={resolvedThumb}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-80 scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-16 h-16 rounded-full bg-rose-600/90 shadow-[0_0_30px_rgba(239,68,68,0.7)] flex items-center justify-center mb-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.tiktokUrl) window.open(item.tiktokUrl, '_blank');
                      }}
                    >
                      <Play className="w-7 h-7 fill-white text-white ml-1" />
                    </motion.div>
                    <p className="text-sm font-bold text-white drop-shadow-md">
                      ดูคลิปต้นฉบับใน {item.platform}
                    </p>
                    <p className="text-xs text-white/70 mt-1 max-w-[240px]">
                      (แอดมินสามารถนำลิงก์ Google Drive Video มาใส่ใน Admin เพื่อให้เล่นบนนี้ได้ทันที)
                    </p>
                    {onOpenAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onOpenAdmin();
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                      >
                        <Film className="w-3.5 h-3.5 text-amber-300" />
                        <span>เพิ่มลิงก์ Google Drive ใน Admin</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* FLOATING HEARTS LAYER (Continuous Live Streaming Hearts) */}
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                <AnimatePresence>
                  {floatingHearts.map((heart) => (
                    <motion.div
                      key={heart.id}
                      initial={{
                        opacity: 0,
                        scale: 0.3,
                        x: 0,
                        y: 0,
                        rotate: 0,
                      }}
                      animate={{
                        opacity: [0, 0.95, 0.95, 0],
                        scale: [0.3, 1.15, 1, 0.75],
                        x: [0, heart.sway, heart.sway * 1.5, heart.sway * 0.5],
                        y: [0, -180, -360, -560],
                        rotate: [0, heart.rotate, -heart.rotate, heart.rotate * 1.5],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: heart.duration,
                        ease: 'easeOut',
                      }}
                      onAnimationComplete={() => handleRemoveFloatingHeart(heart.id)}
                      style={{
                        position: 'absolute',
                        right: 32 + heart.x,
                        bottom: 96,
                      }}
                    >
                      <Heart
                        className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                        style={{
                          width: heart.size,
                          height: heart.size,
                          fill: heart.color,
                          color: heart.color,
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* BURST HEARTS (Tap / Double-tap spawned at exact cursor position) */}
                <AnimatePresence>
                  {burstHearts.map((burst) => (
                    <motion.div
                      key={burst.id}
                      initial={{
                        opacity: 0.95,
                        scale: 0.2,
                        x: burst.x - burst.size / 2,
                        y: burst.y - burst.size / 2,
                      }}
                      animate={{
                        opacity: [1, 1, 0],
                        scale: [0.2, 1.35, 1.6],
                        y: [burst.y - burst.size / 2, burst.y - burst.size / 2 - 90],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
                      onAnimationComplete={() => handleRemoveBurstHeart(burst.id)}
                      style={{ position: 'absolute', top: 0, left: 0 }}
                    >
                      <Heart
                        className="drop-shadow-[0_4px_16px_rgba(244,63,94,0.8)]"
                        style={{
                          width: burst.size,
                          height: burst.size,
                          fill: burst.color,
                          color: '#FFFFFF',
                          strokeWidth: 1.5,
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* RIGHT-HAND TIKTOK / REELS INTERACTION SIDEBAR */}
              <div className="absolute right-2.5 bottom-24 z-35 flex flex-col items-center gap-3.5 text-white">
                {/* LIKE BUTTON */}
                <div className="flex flex-col items-center">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={handleHeartButtonPress}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-lg ${
                      isHeartLiked
                        ? 'bg-rose-600 text-white shadow-rose-600/50'
                        : 'bg-black/45 text-white hover:bg-black/60'
                    }`}
                    aria-label="ถูกใจคลิป"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isHeartLiked ? 'fill-white stroke-white' : 'stroke-white'
                      }`}
                    />
                  </motion.button>
                  <span className="text-[11px] font-bold mt-1 text-white drop-shadow-md">
                    {userLikesDelta > 0
                      ? `${item.likes} (+${userLikesDelta})`
                      : item.likes}
                  </span>
                </div>

                {/* COMMENTS BUTTON */}
                <div className="flex flex-col items-center">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowComments(!showComments);
                    }}
                    className="w-11 h-11 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-colors cursor-pointer"
                    aria-label="ดูความคิดเห็น"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </motion.button>
                  <span className="text-[11px] font-bold mt-1 text-white drop-shadow-md">
                    {item.commentsCount}
                  </span>
                </div>

                {/* SHARE BUTTON */}
                <div className="flex flex-col items-center">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={handleCopyLink}
                    className="w-11 h-11 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-colors cursor-pointer relative"
                    aria-label="แชร์คลิป"
                  >
                    {copiedLink ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-5 h-5" />
                    )}
                  </motion.button>
                  <span className="text-[11px] font-bold mt-1 text-white drop-shadow-md">
                    {copiedLink ? 'คัดลอกแล้ว' : item.sharesCount}
                  </span>
                </div>

                {/* AUDIO TOGGLE (For Direct Video) */}
                {videoSource.type === 'direct' && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full bg-black/45 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-colors cursor-pointer"
                    aria-label={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-rose-300" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-amber-300" />
                    )}
                  </motion.button>
                )}

                {/* ROTATING SOUND VINYL */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  className="w-9 h-9 rounded-full bg-slate-900 border-2 border-slate-700 p-1 flex items-center justify-center shadow-lg mt-1"
                >
                  <Disc3 className="w-full h-full text-amber-400" />
                </motion.div>
              </div>

              {/* BOTTOM INFORMATION OVERLAY */}
              <div className="absolute inset-x-0 bottom-0 z-30 p-4 pb-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white pointer-events-auto">
                <div className="pr-16">
                  {/* Channel & Badge */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5 shadow-md shrink-0">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-amber-300">
                        JJ
                      </div>
                    </div>
                    <span className="font-bold text-xs text-white drop-shadow-sm">
                      @juijui.j
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-semibold border border-amber-400/30">
                      <PlatformBrandIcon platform={item.platform} size="sm" />
                      {item.platform}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xs sm:text-sm font-bold line-clamp-2 leading-snug drop-shadow-md text-white">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">
                    {item.subtitle}
                  </p>

                  {/* Metrics bar */}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-white/90 font-semibold">
                    <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      <Eye className="w-3 h-3 text-amber-300" /> {item.views} วิว
                    </span>
                    <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      <Flame className="w-3 h-3 text-rose-400" /> {item.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* COMMENTS SLIDE-UP DRAWER */}
              <AnimatePresence>
                {showComments && (
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-x-0 bottom-0 top-1/3 z-45 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/80 rounded-t-3xl flex flex-col p-4 shadow-2xl text-white"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold">
                          ความคิดเห็นยอดนิยม ({item.topComments?.length || 0})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowComments(false)}
                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
                      {item.topComments && item.topComments.length > 0 ? (
                        item.topComments.map((c, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-amber-300">
                                {c.user}
                              </span>
                              <span className="text-[10px] text-rose-300 flex items-center gap-1">
                                <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />{' '}
                                {c.likes}
                              </span>
                            </div>
                            <p className="text-slate-200 text-[11px] leading-relaxed">
                              {c.text}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-slate-400">
                          ยังไม่มีคอมเมนต์ตัวอย่าง
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom iOS Home Indicator Bar */}
              <div className="absolute bottom-1 inset-x-0 z-40 flex justify-center pointer-events-none">
                <div className="w-32 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
          </div>

          {/* Quick CTA below phone */}
          {onBookSimilar && (
            <div className="mt-3 flex items-center gap-2 text-white">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookSimilar(item.title);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>จองคลิปสไตล์นี้สำหรับแบรนด์ของคุณ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
