import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface AnimatedPressableProps extends Omit<PressableProps, 'onPress'> {
  children: React.ReactNode;
  onPress?: () => void;
  scale?: number;
  haptic?: boolean;
  className?: string;
  style?: ViewStyle;
}

export function AnimatedPressable({
  children,
  onPress,
  scale = 0.96,
  haptic = true,
  className = '',
  style,
  ...rest
}: AnimatedPressableProps) {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const handlePressIn = () => {
    scaleValue.value = withSpring(scale, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={className}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
