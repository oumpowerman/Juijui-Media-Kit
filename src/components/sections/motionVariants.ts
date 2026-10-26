import { Variants } from 'motion/react';

export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_IN_SMOOTH: [number, number, number, number] = [0.32, 0, 0.67, 0];

export const REPEAT_VIEWPORT = {
  once: false,
  amount: 0.12,
  margin: '0px 0px -20px 0px',
};

export const fadeUpVariant: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: EASE_IN_SMOOTH,
    },
  },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      delay,
      ease: EASE_OUT_EXPO,
    },
  }),
};

export const slideFromLeftVariant: Variants = {
  hidden: {
    opacity: 0,
    x: -36,
    y: 10,
    transition: {
      duration: 0.28,
      ease: EASE_IN_SMOOTH,
    },
  },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.55,
      delay,
      ease: EASE_OUT_EXPO,
    },
  }),
};

export const slideFromRightVariant: Variants = {
  hidden: {
    opacity: 0,
    x: 36,
    y: 10,
    transition: {
      duration: 0.28,
      ease: EASE_IN_SMOOTH,
    },
  },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.55,
      delay,
      ease: EASE_OUT_EXPO,
    },
  }),
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.04,
    },
  },
};
