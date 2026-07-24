import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: disabled ? 0.5 : 1,
        }
      ]}
      className={`w-full py-4 px-4 rounded-[14px] flex-row items-center justify-center ${
        isPrimary 
          ? 'bg-accent-base active:bg-accent-muted' 
          : 'bg-transparent border border-borderCustom-medium active:bg-background-tertiary'
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : '#888888'} size="small" />
      ) : (
        <Text
          className={`text-[15px] text-center font-dmsans ${
            isPrimary ? 'text-white font-medium' : 'text-textCustom-secondary font-normal'
          }`}
          style={{ fontFamily: isPrimary ? 'DMSans_500Medium' : 'DMSans_400Regular' }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
