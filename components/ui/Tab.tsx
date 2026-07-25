import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

interface TabProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  activeBgColorClass?: string; // Custom active background Tailwind class
  activeTextColorClass?: string; // Custom active text Tailwind class
  className?: string;
}

export function Tab({
  label,
  active,
  onPress,
  icon,
  activeBgColorClass = 'bg-accent-base',
  activeTextColorClass = 'text-black',
  className = '',
}: TabProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`flex-row items-center px-4 py-2 rounded-full border ${
          active 
            ? `${activeBgColorClass} border-transparent` 
            : 'bg-background-secondary border-borderCustom-subtle active:bg-background-tertiary'
        } gap-1.5 ${className}`}
      >
        {icon && <View className={active ? 'opacity-100' : 'opacity-50'}>{icon}</View>}
        <Text
          className={`text-xs font-dmsans tracking-wide ${
            active ? `${activeTextColorClass} font-semibold` : 'text-textCustom-secondary font-medium'
          }`}
          style={{ fontFamily: 'Inter_500Medium' }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

