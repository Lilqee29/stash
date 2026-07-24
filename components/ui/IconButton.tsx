import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  disabled = false,
  className = '',
  style,
}: IconButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 350 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 350 });
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        className={`w-10 h-10 rounded-full bg-background-secondary border border-borderCustom-subtle active:border-borderCustom-medium items-center justify-center ${
          disabled ? 'opacity-40' : ''
        } ${className}`}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
}

