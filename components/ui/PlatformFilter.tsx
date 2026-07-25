import React, { useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const ACCENT = '#8EC934';

interface Save {
  platform?: string;
}

interface PlatformFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  saves?: Save[];
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'tiktok', label: 'TikTok', icon: 'logo-tiktok' as const },
  { key: 'instagram', label: 'Instagram', icon: 'logo-instagram' as const },
  { key: 'other', label: 'Other' },
];

function FilterChip({
  label,
  icon,
  isActive,
  onPress,
}: {
  label: string;
  icon?: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.94, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 10,
          backgroundColor: isActive ? ACCENT : '#141414',
          borderWidth: 1,
          borderColor: isActive ? ACCENT : 'rgba(255,255,255,0.06)',
        }}
      >
        {icon && (
          <Ionicons
            name={icon as any}
            size={14}
            color={isActive ? '#0A0A0A' : '#888'}
          />
        )}
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            fontFamily: 'Inter_600SemiBold',
            color: isActive ? '#0A0A0A' : '#888',
            letterSpacing: -0.2,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function PlatformFilter({
  activeFilter,
  onFilterChange,
  saves = [],
}: PlatformFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
    >
      {FILTERS.map((f) => (
        <FilterChip
          key={f.key}
          label={f.label}
          icon={'icon' in f ? f.icon : undefined}
          isActive={activeFilter === f.key}
          onPress={() => onFilterChange(f.key)}
        />
      ))}
    </ScrollView>
  );
}
