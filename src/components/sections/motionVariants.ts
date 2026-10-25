export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const REPEAT_VIEWPORT = {
  once: false,
  amount: 0.15,
  margin: '-35px 0px -35px 0px',
};

export const fadeUpVariant = {
  hidden: { opacity: 0, y: 36, scale: 0.98 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      delay,
      ease: EASE_OUT_EXPO,
    },
  }),
};

export const slideFromLeftVariant = {
  hidden: { opacity: 0, x: -52, y: 16 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: EASE_OUT_EXPO,
    },
  }),
};

export const slideFromRightVariant = {
  hidden: { opacity: 0, x: 52, y: 16 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: EASE_OUT_EXPO,
    },
  }),
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.04,
    },
  },
};
