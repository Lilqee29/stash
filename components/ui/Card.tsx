import React from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
  interactive?: boolean;
  glowColor?: string;
  style?: ViewStyle;
}

export function Card({
  children,
  className = '',
  onPress,
  interactive = false,
  glowColor,
  style,
}: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (interactive) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (interactive) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  if (interactive) {
    return (
      <Animated.View style={[animatedStyle, style, { width: '100%' }]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className={`relative overflow-hidden bg-background-secondary border border-borderCustom-subtle rounded-2xl active:border-borderCustom-medium ${className}`}
        >
          {/* Premium subtle top glow */}
          {glowColor ? (
            <View 
              className="absolute top-0 left-0 right-0 h-[60px] opacity-10" 
              style={{ backgroundColor: glowColor }}
            />
          ) : (
            <View className="absolute top-0 left-0 right-0 h-[60px] bg-white/[0.02]" />
          )}
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View
      style={style}
      className={`relative overflow-hidden bg-background-secondary border border-borderCustom-subtle rounded-2xl ${className}`}
    >
      {/* Premium subtle top glow */}
      {glowColor ? (
        <View 
          className="absolute top-0 left-0 right-0 h-[60px] opacity-10" 
          style={{ backgroundColor: glowColor }}
        />
      ) : (
        <View className="absolute top-0 left-0 right-0 h-[60px] bg-white/[0.02]" />
      )}
      {children}
    </View>
  );
}


export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`p-4 pb-2 flex-row justify-between items-center ${className}`}>{children}</View>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Text 
      className={`text-white text-base font-syne tracking-tight ${className}`}
      style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
      numberOfLines={1}
    >
      {children}
    </Text>
  );
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Text 
      className={`text-textCustom-secondary text-xs font-dmsans ${className}`}
      style={{ fontFamily: 'Inter_400Regular' }}
    >
      {children}
    </Text>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`p-4 pt-2 flex-1 ${className}`}>{children}</View>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`p-4 pt-2 border-t border-borderCustom-subtle/40 ${className}`}>{children}</View>;
}
