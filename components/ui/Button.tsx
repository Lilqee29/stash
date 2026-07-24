import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  // Variant styling
  const variantStyles = {
    primary: 'bg-accent-base border border-accent-bright/20 active:bg-accent-bright',
    secondary: 'bg-background-secondary border border-borderCustom-subtle active:bg-background-tertiary',
    ghost: 'bg-transparent active:bg-background-secondary/50',
    destructive: 'bg-semantic-error/10 border border-semantic-error/20 active:bg-semantic-error/20',
  };

  // Text variant styling
  const textStyles = {
    primary: 'text-white font-medium',
    secondary: 'text-textCustom-secondary font-medium',
    ghost: 'text-textCustom-secondary font-normal',
    destructive: 'text-semantic-error font-medium',
  };

  // Size styling
  const sizeStyles = {
    sm: 'py-2 px-3 rounded-lg text-xs gap-1.5',
    md: 'py-3.5 px-4 rounded-xl text-[14px] gap-2',
    lg: 'py-4 px-6 rounded-2xl text-[16px] gap-2.5',
  };

  const isPrimary = variant === 'primary';

  return (
    <Animated.View style={[animatedStyle, { width: '100%' }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        className={`flex-row items-center justify-center ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-40' : ''} ${className}`}
      >
        {loading ? (
          <ActivityIndicator color={isPrimary ? '#FFFFFF' : '#888888'} size="small" />
        ) : (
          <>
            {leftIcon && <View className="opacity-90">{leftIcon}</View>}
            <Text
              className={`font-dmsans text-center ${textStyles[variant]}`}
              style={{ fontFamily: 'DMSans_500Medium' }}
            >
              {title}
            </Text>
            {rightIcon && <View className="opacity-90">{rightIcon}</View>}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

