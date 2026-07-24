import { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

/**
 * Swipe gesture configuration
 */
export const swipeConfig = {
  threshold: 100,
  velocityThreshold: 1000,
  damping: 15,
  stiffness: 200,
} as const;

/**
 * Spring animation presets
 * Use these for consistent physics across the app
 */
export const springConfig = {
  /** Default spring — snappy, minimal bounce */
  default: { damping: 15, stiffness: 300 } as WithSpringConfig,

  /** Bouncy spring — playful, noticeable bounce */
  bouncy: { damping: 10, stiffness: 400 } as WithSpringConfig,

  /** Smooth spring — gentle, fluid feel */
  smooth: { damping: 20, stiffness: 200 } as WithSpringConfig,

  /** Gentle spring — slow, subtle motion */
  gentle: { damping: 25, stiffness: 150 } as WithSpringConfig,

  /** Quick snap — instant feedback, no bounce */
  snap: { damping: 30, stiffness: 500 } as WithSpringConfig,

  /** Elastic — exaggerated bounce for playful UI */
  elastic: { damping: 8, stiffness: 250 } as WithSpringConfig,
} as const;

/**
 * Timing animation presets
 * Use these for non-interactive, choreographed animations
 */
export const timingConfig = {
  /** Fast — micro-interactions, hover states */
  fast: { duration: 150 } as WithTimingConfig,

  /** Normal — standard transitions, reveals */
  normal: { duration: 300 } as WithTimingConfig,

  /** Slow — dramatic reveals, page transitions */
  slow: { duration: 500 } as WithTimingConfig,
} as const;

/**
 * Stagger delay presets for list animations
 */
export const staggerConfig = {
  /** Fast stagger — dense lists, minimal delay between items */
  fast: 40,

  /** Normal stagger — standard list spacing */
  normal: 60,

  /** Slow stagger — dramatic reveals, hero content */
  slow: 100,
} as const;

/**
 * Scale presets for interactive elements
 */
export const scaleConfig = {
  /** Button press — subtle, professional */
  button: 0.96,

  /** Card press — more noticeable feedback */
  card: 0.97,

  /** Icon press — snappy, immediate */
  icon: 0.92,

  /** Selection — checkbox, toggle, pill */
  selection: 0.95,
} as const;

/**
 * Layout animation presets for mount/unmount
 */
export const layoutConfig = {
  fadeIn: {
    from: { opacity: 0 },
    animate: { opacity: 1 },
  },
  fadeInUp: {
    from: { opacity: 0, translateY: 20 },
    animate: { opacity: 1, translateY: 0 },
  },
  fadeInScale: {
    from: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  slideInLeft: {
    from: { opacity: 0, translateX: -30 },
    animate: { opacity: 1, translateX: 0 },
  },
  slideInRight: {
    from: { opacity: 0, translateX: 30 },
    animate: { opacity: 1, translateX: 0 },
  },
} as const;
