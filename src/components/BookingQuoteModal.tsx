import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { CreatorProfile, BookingRecord } from '../data/creatorData';
import { EASE_OUT_EXPO } from './sections/motionVariants';
import { db, doc, setDoc, sanitizeForFirestore } from './firestoreBookingHelper';
import {
  generatePlainQuoteText,
  BookingModalHeader,
  BookingModalFooter,
  BookingStep1PackageConfig,
  BookingStep2BrandForm,
  BookingStep3Confirmation,
} from './booking';

interface BookingQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: CreatorProfile;
  selectedPackageId: string;
  onSelectPackageId: (id: string) => void;
  selectedAddOnIds: string[];
  onToggleAddOnId: (id: string) => void;
  initialReferenceClip?: string;
  onBookingCreated: (booking: BookingRecord) => void;
}

export const BookingQuoteModal: React.FC<BookingQuoteModalProps> = ({
  isOpen,
  onClose,
  creator,
  selectedPackageId,
  onSelectPackageId,
  selectedAddOnIds,
  onToggleAddOnId,
  initialReferenceClip,
  onBookingCreated,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [collaborationType, setCollaborationType] = useState<
    'standard_package' | 'budget_friendly' | 'barter_trade'
  >('standard_package');
  const [customBudgetAmount, setCustomBudgetAmount] = useState('');
  const [brandName, setBrandName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactChannel, setContactChannel] = useState('');
  const [targetCampaignDate, setTargetCampaignDate] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<BookingRecord | null>(null);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    if (initialReferenceClip) {
      setReferenceLinks(`สนใจสไตล์คอนเทนต์แนว: "${initialReferenceClip}"`);
    }
  }, [initialReferenceClip]);

  // Lock body scroll while Booking modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  const activePackage =
    creator.packages.find((p) => p.id === selectedPackageId) ||
    creator.packages[1] ||
    creator.packages[0];

  const chosenAddOns = creator.addOns.filter((a) => selectedAddOnIds.includes(a.id));
  const addOnsTotal = chosenAddOns.reduce((sum, item) => sum + item.price, 0);
  const basePrice = collaborationType === 'standard_package' ? activePackage?.price || 0 : 0;
  const totalPrice =
    collaborationType === 'standard_package'
      ? basePrice + addOnsTotal
      : collaborationType === 'budget_friendly'
      ? Number(customBudgetAmount.replace(/[^0-9]/g, '')) || 0
      : 0;

  const currentFormattedQuoteText = generatePlainQuoteText({
    creator,
    booking: submittedBooking,
    collaborationType,
    activePackage,
    customBudgetAmount,
    chosenAddOns,
    totalPrice,
    brandName,
    contactName,
    contactChannel,
    targetCampaignDate,
    productDetails,
    referenceLinks,
  });

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(currentFormattedQuoteText).then(() => {
      setCopiedQuote(true);
      setShowToast('คัดลอกสรุปใบเสนอราคาลงคลิปบอร์ดแล้ว!');
      setTimeout(() => {
        setCopiedQuote(false);
        setShowToast(null);
      }, 3500);
    });
  };

  const handleClearAllAddOns = () => {
    selectedAddOnIds.forEach((id) => onToggleAddOnId(id));
  };

  const handleQuickDemoFill = () => {
    setBrandName('บริษัท สกินแคร์โกลว์ จำกัด (Skin Glow Thailand)');
    setContactName('คุณปานชีวา (Brand Marketing Lead)');
    setContactChannel('LINE: @skinglow หรือ 089-456-7890');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    setTargetCampaignDate(futureDate.toISOString().split('T')[0]);
    setProductDetails(
      'เซรั่มไฮยาหน้าใสบำรุงลึก เน้นคอนเทนต์ตลกเป็นธรรมชาติแบบเพื่อนชวนเพื่อนลองใช้ มุกหยอกล้อกันก่อนออกไปข้างนอก มีช่วงโชว์ผิวจริงและโปรโมชั่นพิเศษ'
    );
    setReferenceLinks('สนใจมู้ดแบบคลิปไวรัล "แกล้งเพื่อนแต่งหน้าไปทำงาน"');
    setErrorMsg(null);
    setShowToast('กรอกข้อมูลตัวอย่างแบรนด์เรียบร้อยแล้ว');
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleProceedToStep2 = () => {
    if (collaborationType === 'budget_friendly' && !customBudgetAmount.trim()) {
      setErrorMsg('กรุณาระบุงบประมาณที่แบรนด์ตั้งไว้ หรือคลิกปุ่มเลือกงบด่วน');
      return;
    }
    setErrorMsg(null);
    setCurrentStep(2);
  };

  const submitBookingAction = async () => {
    if (!brandName.trim()) {
      setErrorMsg('กรุณาระบุชื่อแบรนด์หรือบริษัท (หรือกดปุ่มกรอกข้อมูลตัวอย่างด่วนด้านบน)');
      return;
    }
    if (!contactChannel.trim()) {
      setErrorMsg('กรุณาระบุช่องทางติดต่อกลับ (เช่น เบอร์โทร, LINE ID หรืออีเมล)');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const clientBooking: BookingRecord = {
        id: `bk-${Date.now()}`,
        quoteNumber: `QT-2026-${randomNum}`,
        creatorId: creator.id,
        creatorName: `${creator.nameTh} (${creator.nameEn})`,
        packageId: activePackage.id,
        packageName:
          collaborationType === 'standard_package'
            ? activePackage.name
            : collaborationType === 'budget_friendly'
            ? 'Custom Budget Friendly'
            : 'Custom Barter Trade',
        basePrice,
        selectedAddOns: chosenAddOns.map((a) => ({ id: a.id, name: a.name, price: a.price })),
        collaborationType,
        customBudgetAmount,
        totalPrice,
        brandName: brandName.trim(),
        contactName: contactName.trim(),
        contactChannel: contactChannel.trim(),
        productDetails: productDetails.trim(),
        targetCampaignDate,
        referenceLinks: referenceLinks.trim(),
        createdAt: new Date().toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'รอดำเนินการ',
      };

      // Persist directly to Firebase Cloud Firestore (shared across all visitors)
      await setDoc(doc(db, 'bookings', clientBooking.id), sanitizeForFirestore(clientBooking));

      setSubmittedBooking(clientBooking);
      setCurrentStep(3);
      onBookingCreated(clientBooking);

      // Auto copy to clipboard for immediate convenience
      navigator.clipboard.writeText(currentFormattedQuoteText).catch(() => {});
    } catch (err: any) {
      setErrorMsg(err?.message || 'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitBookingAction();
  };

  const handleResetAndClose = () => {
    setCurrentStep(1);
    setSubmittedBooking(null);
    setErrorMsg(null);
    onClose();
  };

  const handleStartNewBooking = () => {
    setSubmittedBooking(null);
    setErrorMsg(null);
    setCurrentStep(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="booking-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.26, ease: 'easeOut' }}
          onClick={handleResetAndClose}
          className="fixed inset-0 z-[80] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          {/* Fixed Balanced Modal Height Across All Devices & Steps */}
          <motion.div
            key="booking-modal-dialog"
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.96 }}
            transition={{ duration: 0.42, ease: EASE_OUT_EXPO }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl w-full max-w-4xl h-[88vh] sm:h-[690px] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative"
          >
            {/* 1. Sticky Top Header & Step Breadcrumbs (Without Duplicate Numbers) */}
            <BookingModalHeader
              creator={creator}
              currentStep={currentStep}
              onSelectStep={(step) => {
                if (step === 2) handleProceedToStep2();
                else {
                  setErrorMsg(null);
                  setCurrentStep(1);
                }
              }}
              onClose={handleResetAndClose}
            />

            {/* Floating Toast Notification */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.95 }}
                  className="absolute top-28 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 border border-white/15 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{showToast}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 2. Scrollable Middle Body Content (Consistent Height Container) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAFAFC]">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <BookingStep1PackageConfig
                    creator={creator}
                    collaborationType={collaborationType}
                    onSelectCollaborationType={(mode) => {
                      setErrorMsg(null);
                      setCollaborationType(mode);
                    }}
                    activePackage={activePackage}
                    onSelectPackageId={onSelectPackageId}
                    customBudgetAmount={customBudgetAmount}
                    onChangeCustomBudgetAmount={(val) => {
                      setErrorMsg(null);
                      setCustomBudgetAmount(val);
                    }}
                    selectedAddOnIds={selectedAddOnIds}
                    chosenAddOns={chosenAddOns}
                    onToggleAddOnId={onToggleAddOnId}
                    onClearAddOns={handleClearAllAddOns}
                    errorMsg={errorMsg}
                  />
                )}

                {currentStep === 2 && (
                  <BookingStep2BrandForm
                    brandName={brandName}
                    onChangeBrandName={setBrandName}
                    contactName={contactName}
                    onChangeContactName={setContactName}
                    contactChannel={contactChannel}
                    onChangeContactChannel={setContactChannel}
                    targetCampaignDate={targetCampaignDate}
                    onChangeTargetCampaignDate={setTargetCampaignDate}
                    productDetails={productDetails}
                    onChangeProductDetails={setProductDetails}
                    referenceLinks={referenceLinks}
                    onChangeReferenceLinks={setReferenceLinks}
                    errorMsg={errorMsg}
                    onQuickDemoFill={handleQuickDemoFill}
                    onSubmit={handleFormSubmit}
                  />
                )}

                {currentStep === 3 && submittedBooking && (
                  <BookingStep3Confirmation
                    creator={creator}
                    booking={submittedBooking}
                    copiedQuote={copiedQuote}
                    onCopyQuote={handleCopyQuote}
                    plainQuoteText={currentFormattedQuoteText}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* 3. Sticky Bottom Summary & Action Bar (Never Cut Off) */}
            <BookingModalFooter
              currentStep={currentStep}
              collaborationType={collaborationType}
              activePackage={activePackage}
              chosenAddOns={chosenAddOns}
              totalPrice={totalPrice}
              customBudgetAmount={customBudgetAmount}
              isSubmitting={isSubmitting}
              copiedQuote={copiedQuote}
              submittedBooking={submittedBooking}
              onCopyQuote={handleCopyQuote}
              onProceedToStep2={handleProceedToStep2}
              onBackToStep1={() => {
                setErrorMsg(null);
                setCurrentStep(1);
              }}
              onTriggerSubmitStep2={submitBookingAction}
              onStartNewBooking={handleStartNewBooking}
              onClose={handleResetAndClose}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
