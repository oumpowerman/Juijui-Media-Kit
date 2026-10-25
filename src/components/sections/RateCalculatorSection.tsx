import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { CreatorProfile, RatePackage, AddOnItem } from '../../data/creatorData';
import {
  fadeUpVariant,
  slideFromLeftVariant,
  slideFromRightVariant,
  REPEAT_VIEWPORT,
} from './motionVariants';
import {
  RateViewMode,
  RateViewModeTabs,
  Package3DCard,
  PackageMatrixTable,
  FreePerksCard,
  AddOnsCalculatorCard,
  SupportedFormatsStrip,
  ContactCollaborationSection,
  RateCardFooter,
  RateCardBackgroundCanvas,
} from './ratecard';

export type { RateViewMode };

export interface RateCalculatorSectionProps {
  currentCreator: CreatorProfile;
  selectedPackageId: string;
  activePackage: RatePackage;
  selectedAddOnIds: string[];
  chosenAddOns: AddOnItem[];
  estimatedNetTotal: number;
  rateViewMode: RateViewMode;
  onSelectRateViewMode: (mode: RateViewMode) => void;
  onSelectPackageId: (pkgId: string) => void;
  onToggleAddOn: (addonId: string) => void;
  onClearAddOns: () => void;
  onOpenBookingForPackage: (pkgId: string) => void;
  onOpenPdf: () => void;
  onOpenAdmin?: () => void;
  onOpenAdminContact?: () => void;
  onUnlockAdminToolbar?: () => void;
}

export const RateCalculatorSection: React.FC<RateCalculatorSectionProps> = ({
  currentCreator,
  selectedPackageId,
  activePackage,
  selectedAddOnIds,
  chosenAddOns,
  estimatedNetTotal,
  rateViewMode,
  onSelectRateViewMode,
  onSelectPackageId,
  onToggleAddOn,
  onClearAddOns,
  onOpenBookingForPackage,
  onOpenPdf,
  onOpenAdmin,
  onOpenAdminContact,
  onUnlockAdminToolbar,
}) => {
  const rateSectionRef = useRef<HTMLElement>(null);
  const contactSectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress: rateScroll } = useScroll({
    target: rateSectionRef,
    offset: ['start end', 'end start'],
  });
  const smoothRateScroll = useSpring(rateScroll, {
    stiffness: 110,
    damping: 26,
    restDelta: 0.001,
  });

  const { scrollYProgress: contactScroll } = useScroll({
    target: contactSectionRef,
    offset: ['start end', 'end start'],
  });
  const smoothContactScroll = useSpring(contactScroll, {
    stiffness: 110,
    damping: 26,
    restDelta: 0.001,
  });

  // 3-Layer Background Parallax Offsets + Foreground Parallax
  const numeralsParallaxY = useTransform(smoothRateScroll, [0, 1], [38, -38]);
  const midIconsLeftY = useTransform(smoothRateScroll, [0, 1], [-55, 55]);
  const midIconsRightY = useTransform(smoothRateScroll, [0, 1], [60, -50]);
  const coinsParallaxY = useTransform(smoothRateScroll, [0, 1], [-85, 85]);

  const packagesParallaxY = useTransform(smoothRateScroll, [0, 1], [16, -16]);
  const portraitParallaxY = useTransform(smoothContactScroll, [0, 1], [0, -22]);

  return (
    <>
      {/* SECTION 05: RATE CARD & PACKAGE CALCULATOR */}
      <section
        ref={rateSectionRef}
        id="ratecard"
        className="py-16 bg-linear-to-b from-[#FAFAFC] via-[#F8FAFC] to-[#FAFAFC] border-t border-slate-200/80 relative overflow-hidden"
      >
        {/* 1. 3-LAYER FINANCIAL & SMART VALUE PARALLAX BACKGROUND CANVAS */}
        <RateCardBackgroundCanvas
          numeralsParallaxY={numeralsParallaxY}
          midIconsLeftY={midIconsLeftY}
          midIconsRightY={midIconsRightY}
          coinsParallaxY={coinsParallaxY}
        />

        <div className="relative z-10 w-full max-w-7xl xl:max-w-[94vw] 2xl:max-w-[95vw] min-[2400px]:max-w-[2280px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-6 2xl:px-8 space-y-10 2xl:space-y-12">
          {/* Section Header + View Mode Switcher */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={REPEAT_VIEWPORT}
              variants={slideFromLeftVariant}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider">
                  05 · RATE CARD & PACKAGES
                </p>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#1E1B4B] mt-1">
                แพ็กเกจและเรทราคา
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                เปรียบเทียบสโคปงาน คำนวณงบประมาณรวมแบบสด และกดออกใบเสนอราคาได้ทันที
              </p>
            </motion.div>

            {/* View Mode Switcher Tabs */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={REPEAT_VIEWPORT}
              variants={slideFromRightVariant}
            >
              <RateViewModeTabs
                rateViewMode={rateViewMode}
                onSelectRateViewMode={onSelectRateViewMode}
                onOpenAdmin={onOpenAdmin}
              />
            </motion.div>
          </div>

          {/* 3 RATE CARD PACKAGE TIERS (Interactive 3D Mouse Tilt Cards) */}
          {(rateViewMode === 'both' || rateViewMode === 'cards') && (
            <motion.div
              style={{ y: packagesParallaxY }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 2xl:gap-8 items-stretch pt-2"
            >
              {currentCreator.packages.map((pkg, idx) => (
                <Package3DCard
                  key={pkg.id}
                  pkg={pkg}
                  idx={idx}
                  isSelected={pkg.id === selectedPackageId}
                  onSelect={() => onSelectPackageId(selectedPackageId === pkg.id ? '' : pkg.id)}
                  onBook={() => onOpenBookingForPackage(pkg.id)}
                />
              ))}
            </motion.div>
          )}

          {/* SIDE-BY-SIDE PACKAGE COMPARISON MATRIX TABLE */}
          {(rateViewMode === 'both' || rateViewMode === 'matrix') && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={REPEAT_VIEWPORT}
              variants={fadeUpVariant}
            >
              <PackageMatrixTable
                packages={currentCreator.packages}
                selectedPackageId={selectedPackageId}
                onSelectPackageId={onSelectPackageId}
                onOpenBookingForPackage={onOpenBookingForPackage}
              />
            </motion.div>
          )}

          {/* FREE INCLUDED SERVICES + INTERACTIVE ADD-ONS CALCULATOR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-8 items-stretch">
            {/* Left: Free Included Perks + Custom Collaboration */}
            <FreePerksCard
              freePerks={currentCreator.freePerks}
              customCollabNotes={currentCreator.customCollabNotes}
              onConsultCustomCollab={() => onOpenBookingForPackage(selectedPackageId)}
            />

            {/* Right: Interactive Add-on Services & Live Net Price Calculator */}
            <AddOnsCalculatorCard
              addOns={currentCreator.addOns}
              selectedAddOnIds={selectedAddOnIds}
              chosenAddOns={chosenAddOns}
              activePackage={activePackage}
              estimatedNetTotal={estimatedNetTotal}
              onToggleAddOn={onToggleAddOn}
              onClearAddOns={onClearAddOns}
              onOpenBooking={() => onOpenBookingForPackage(selectedPackageId)}
            />
          </div>

          {/* Supported Content Formats Strip */}
          <SupportedFormatsStrip supportedFormats={currentCreator.supportedFormats} />
        </div>
      </section>

      {/* SECTION 06: CONTACT & COLLABORATION */}
      <div ref={contactSectionRef as React.RefObject<HTMLDivElement>}>
        <ContactCollaborationSection
          currentCreator={currentCreator}
          portraitParallaxY={portraitParallaxY}
          onOpenPdf={onOpenPdf}
          onOpenBookingForPackage={onOpenBookingForPackage}
          selectedPackageId={selectedPackageId}
          onOpenAdmin={onOpenAdmin}
          onOpenAdminContact={onOpenAdminContact}
        />
      </div>

      {/* QUIET FOOTER */}
      <RateCardFooter
        nameTh={currentCreator.nameTh}
        nameEn={currentCreator.nameEn}
        onOpenPdf={onOpenPdf}
        onOpenAdmin={onOpenAdmin}
        onUnlockAdminToolbar={onUnlockAdminToolbar}
      />
    </>
  );
};
