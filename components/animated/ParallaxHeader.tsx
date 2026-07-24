import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';

interface ParallaxHeaderProps {
  children: React.ReactNode;
  headerHeight?: number;
  scrollY: SharedValue<number>;
  className?: string;
  style?: ViewStyle;
}

export function ParallaxHeader({
  children,
  headerHeight = 300,
  scrollY,
  className = '',
  style,
}: ParallaxHeaderProps) {
  const containerStyle = useAnimatedStyle(() => {
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

  return (
    <View className={`relative ${className}`} style={[{ height: headerHeight }, style]}>
      {/* Parallax background */}
      <Animated.View
        style={[containerStyle, { position: 'absolute', inset: 0 }]}
        className="overflow-hidden"
      >
        {children}
      </Animated.View>

      {/* Content overlay */}
      <Animated.View
        style={contentStyle}
        className="absolute inset-0"
      />
    </View>
  );
}
