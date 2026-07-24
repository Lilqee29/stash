import { useCallback } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

/**
 * Parallax effect hook for scroll-driven header animations
 * @param scrollY - Shared value from ScrollView onScroll
 * @param headerHeight - Height of the header element
 */
export function useParallax(
  scrollY: SharedValue<number>,
  headerHeight: number
) {
  const headerStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-headerHeight, 0, headerHeight],
      [1.2, 1, 0.8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [-headerHeight * 0.5, 0, headerHeight * 0.5],
      [1, 1, 0],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [-headerHeight, 0, headerHeight],
      [-headerHeight * 0.3, 0, headerHeight * 0.3],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, headerHeight],
      [0, -headerHeight * 0.4],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  return {
    headerStyle,
    contentStyle,
  };
}

/**
 * Swipe-to-delete gesture hook
 * @param onDelete - Callback when swipe threshold is reached
 */
export function useSwipeToDelete(onDelete: () => void) {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const resetPosition = useCallback(() => {
    translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
  }, [translateX]);

  const triggerDelete = useCallback(() => {
    translateX.value = withSpring(-300, { damping: 20, stiffness: 300 }, () => {
      // Animation complete
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete();
  }, [translateX, onDelete]);

  return {
    translateX,
    animatedStyle,
    resetPosition,
    triggerDelete,
  };
}

/**
 * Staggered grid animation delays
 * @param itemCount - Total number of items
 * @param columns - Number of columns in the grid
 */
export function useStaggeredGrid(itemCount: number, columns: number) {
  const getDelay = useCallback(
    (index: number): number => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      // Row-based stagger: each row delays by 60ms, each column adds 30ms
      return row * 60 + col * 30;
    },
    [columns]
  );

  const getTransition = useCallback(
    (index: number) => ({
      type: 'spring' as const,
      damping: 18,
      stiffness: 200,
      delay: getDelay(index),
    }),
    [getDelay]
  );

  return {
    getDelay,
    getTransition,
  };
}

/**
 * Haptic feedback hook with different intensities
 */
export function useHaptic() {
  const light = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const medium = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const heavy = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  const success = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const warning = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  const error = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
  };
}

/**
 * Page transition animation hook
 * Returns animated styles for mounting/unmounting content
 */
export function usePageTransition() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const enter = useCallback(() => {
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
  }, [opacity, translateY]);

  const exit = useCallback(
    (callback?: () => void) => {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(10, { duration: 200 }, () => {
        callback?.();
      });
    },
    [opacity, translateY]
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return {
    animatedStyle,
    enter,
    exit,
  };
}
