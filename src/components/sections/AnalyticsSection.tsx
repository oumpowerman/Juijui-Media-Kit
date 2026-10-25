import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { CreatorProfile } from '../../data/creatorData';
import {
  AnalyticsBackgroundCanvas,
  AnalyticsHeaderTabs,
  PlatformPerformanceCard,
  AudienceDemographicsCard,
} from './analytics';

export interface AnalyticsSectionProps {
  currentCreator: CreatorProfile;
  activePlatformHighlight: string;
  onSelectPlatformHighlight: (platformId: string) => void;
  onOpenAdmin?: () => void;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  currentCreator,
  activePlatformHighlight,
  onSelectPlatformHighlight,
  onOpenAdmin,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    restDelta: 0.001,
  });

  // Parallax transforms for background canvas vs foreground cards
  const telemetryGraphY = useTransform(smoothProgress, [0, 1], [65, -65]);
  const cardsGridParallaxY = useTransform(smoothProgress, [0, 1], [24, -24]);
  const demographicsParallaxY = useTransform(smoothProgress, [0, 1], [32, -16]);

  // iOS-style smooth scroll to center the selected card
  const handleSelectPlatform = (platformId: string) => {
    onSelectPlatformHighlight(platformId);

    if (platformId === 'all') {
      if (cardsContainerRef.current) {
        cardsContainerRef.current.scrollTo({
          left: 0,
          behavior: 'smooth',
        });
      }
    } else {
      const targetCard = cardRefs.current[platformId];
      if (targetCard) {
        targetCard.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  };

  // Keep selected card smoothly in view when platform prop changes
  useEffect(() => {
    if (activePlatformHighlight && activePlatformHighlight !== 'all') {
      const targetCard = cardRefs.current[activePlatformHighlight];
      if (targetCard) {
        targetCard.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activePlatformHighlight]);

  return (
    <section
      ref={sectionRef}
      id="analytics"
      className="relative py-16 bg-[#F8FAFC] overflow-hidden"
    >
      {/* 1. THEMATIC BACKGROUND CANVAS: Live Telemetry & Animated SVG Curves */}
      <AnalyticsBackgroundCanvas telemetryGraphY={telemetryGraphY} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 2. SECTION HEADER & IOS SEGMENTED CONTROL TABS */}
        <AnalyticsHeaderTabs
          platforms={currentCreator.platforms}
          activePlatformHighlight={activePlatformHighlight}
          onSelectPlatform={handleSelectPlatform}
          onOpenAdmin={onOpenAdmin}
        />

        {/* 3. 4 PLATFORM PERFORMANCE CARDS: Zero-Clipping + Multi-Tier iOS Ambient Aura */}
        <motion.div
          ref={cardsContainerRef}
          style={{ y: cardsGridParallaxY }}
          className="flex overflow-x-auto overflow-y-visible sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 py-10 px-6 sm:px-2 -my-6 sm:my-0 snap-x snap-mandatory scrollbar-none"
        >
          {currentCreator.platforms.map((plat) => {
            const isActive = activePlatformHighlight === plat.id;
            const isDimmed = activePlatformHighlight !== 'all' && !isActive;

            return (
              <PlatformPerformanceCard
                key={plat.id}
                ref={(el) => {
                  cardRefs.current[plat.id] = el;
                }}
                platform={plat}
                isActive={isActive}
                isDimmed={isDimmed}
                onSelect={() =>
                  handleSelectPlatform(
                    activePlatformHighlight === plat.id ? 'all' : plat.id
                  )
                }
              />
            );
          })}
        </motion.div>

        {/* Mobile Swipe Indicators */}
        <div className="sm:hidden flex items-center justify-center gap-2 pt-1 pb-2">
          {currentCreator.platforms.map((plat) => {
            const isActive = activePlatformHighlight === plat.id;
            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => handleSelectPlatform(plat.id)}
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-6 h-2 bg-violet-700'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Select ${plat.name}`}
              />
            );
          })}
        </div>

        {/* 4. AUDIENCE DEMOGRAPHICS BREAKDOWN (Age, Gender, Geographic Locations) */}
        <AudienceDemographicsCard
          demographics={currentCreator.demographics}
          demographicsParallaxY={demographicsParallaxY}
        />
      </div>
    </section>
  );
};
