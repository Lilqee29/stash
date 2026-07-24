import React from 'react';
import { ViewStyle } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';

type EntryAnimation = 'fadeIn' | 'fadeInUp' | 'fadeInScale' | 'slideInLeft';
type ExitAnimation = 'fadeOut' | 'fadeOutDown';

interface AnimatedViewProps {
  children: React.ReactNode;
  entry?: EntryAnimation;
  exit?: ExitAnimation;
  delay?: number;
  duration?: number;
  className?: string;
  style?: ViewStyle;
}

interface MotiVariant {
  from?: Record<string, number>;
  animate: Record<string, number>;
}

const entryVariants: Record<EntryAnimation, MotiVariant> = {
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
};

const exitVariants: Record<ExitAnimation, MotiVariant> = {
  fadeOut: {
    animate: { opacity: 0 },
  },
  fadeOutDown: {
    animate: { opacity: 0, translateY: 20 },
  },
};

export function AnimatedView({
  children,
  entry = 'fadeIn',
  exit,
  delay = 0,
  duration = 300,
  className = '',
  style,
}: AnimatedViewProps) {
  const entryVariant = entryVariants[entry];
  const exitVariant = exit ? exitVariants[exit] : undefined;

  return (
    <AnimatePresence>
      <MotiView
        from={entryVariant.from}
        animate={entryVariant.animate}
        exit={exitVariant?.animate}
        transition={{
          type: 'spring',
          damping: 18,
          stiffness: 200,
          delay,
        }}
        className={className}
        style={style}
      >
        {children}
      </MotiView>
    </AnimatePresence>
  );
}
