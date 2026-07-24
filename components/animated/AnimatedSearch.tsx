import React, { useState, useCallback, useRef } from 'react';
import { View, TextInput, Pressable, TextInputProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface AnimatedSearchProps extends Omit<TextInputProps, 'onFocus' | 'onBlur'> {
  onFocus?: () => void;
  onBlur?: () => void;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function AnimatedSearch({
  onFocus,
  onBlur,
  value,
  onChangeText,
  placeholder = 'Search...',
  className = '',
  ...rest
}: AnimatedSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const expandValue = useSharedValue(0);
  const cancelOpacity = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => {
    return {
      flex: interpolate(expandValue.value, [0, 1], [1, 1.4]),
    };
  });

  const cancelStyle = useAnimatedStyle(() => {
    return {
      opacity: cancelOpacity.value,
      transform: [{ scale: interpolate(cancelOpacity.value, [0, 1], [0.8, 1]) }],
    };
  });

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    expandValue.value = withSpring(1, { damping: 18, stiffness: 250 });
    cancelOpacity.value = withSpring(1, { damping: 18, stiffness: 250 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFocus?.();
  }, [expandValue, cancelOpacity, onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    expandValue.value = withSpring(0, { damping: 18, stiffness: 250 });
    cancelOpacity.value = withSpring(0, { damping: 18, stiffness: 250 });
    onBlur?.();
  }, [expandValue, cancelOpacity, onBlur]);

  const handleCancel = useCallback(() => {
    inputRef.current?.blur();
    onChangeText('');
  }, [onChangeText]);

  return (
    <View className={`flex-row items-center gap-2 ${className}`}>
      <Animated.View style={containerStyle} className="flex-1">
        <View
          className={`flex-row items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors ${
            isFocused
              ? 'bg-background-tertiary border-accent-base/30'
              : 'bg-background-secondary border-borderCustom-subtle'
          }`}
        >
          <Ionicons
            name="search"
            size={16}
            color={isFocused ? '#639922' : '#888888'}
          />
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor="#555555"
            className="flex-1 text-textCustom-primary text-sm font-dmsans"
            style={{ fontFamily: 'DMSans_400Regular' }}
            returnKeyType="search"
            autoCorrect={false}
            {...rest}
          />
          {value.length > 0 && (
            <Pressable
              onPress={() => onChangeText('')}
              className="w-5 h-5 rounded-full bg-background-tertiary items-center justify-center"
            >
              <Ionicons name="close" size={12} color="#888888" />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {isFocused && (
        <Animated.View style={cancelStyle}>
          <Pressable onPress={handleCancel} className="py-2 px-1">
            <Animated.Text
              className="text-sm text-accent-base font-medium"
              style={{ fontFamily: 'DMSans_500Medium' }}
            >
              Cancel
            </Animated.Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

function interpolate(value: number, inputRange: number[], outputRange: number[]): number {
  'worklet';
  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;
  const clamped = Math.min(Math.max(value, inMin), inMax);
  return outMin + ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin);
}
