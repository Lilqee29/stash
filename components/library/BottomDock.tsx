import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useStore } from '../../hooks/useStore';

interface BottomDockProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  onResetFilters?: () => void;
}

const ACCENT = '#8EC934';
const INACTIVE = 'rgba(255,255,255,0.45)';
const INACTIVE_LABEL = 'rgba(255,255,255,0.4)';

const SPRING_TAB = { damping: 20, stiffness: 250, mass: 1 };

export default function BottomDock({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onResetFilters,
}: BottomDockProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setModal = useStore((s) => s.setModal);

  const scaleValues = useSharedValue<Record<string, number>>({});

  const tabs = [
    {
      key: 'home',
      label: 'Home',
      icon: 'home' as const,
      onPress: () => {
        setActiveTab('home');
        onResetFilters?.();
        router.push('/home');
      },
    },
    {
      key: 'discover',
      label: 'Discover',
      icon: 'compass' as const,
      onPress: () => {
        setActiveTab('discover');
        onResetFilters?.();
        router.push('/discover');
      },
    },
    {
      key: 'add',
      label: '',
      icon: 'add' as const,
      isSpecial: true,
      onPress: () => {
        setModal('add');
      },
    },
    {
      key: 'library',
      label: 'Library',
      icon: 'folder-open' as const,
      onPress: () => {
        setActiveTab('library');
        router.push('/folders');
      },
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: 'person' as const,
      onPress: () => router.push('/profile'),
    },
  ];

  return (
    <View
      className="absolute bottom-0 left-0 right-0"
      style={{ paddingBottom: insets.bottom }}
    >
      <View
        className="flex-row items-center bg-[#141414] border-t border-white/[0.06]"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          if (tab.isSpecial) {
            return (
              <Pressable
                key={tab.key}
                onPress={tab.onPress}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 56 }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: ACCENT,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: ACCENT,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Ionicons name="add" size={26} color="#0A0A0A" />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={tab.key}
              onPress={tab.onPress}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 56 }}
            >
              <Ionicons
                name={isActive ? tab.icon : `${tab.icon}-outline` as any}
                size={22}
                color={isActive ? ACCENT : INACTIVE}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  color: isActive ? ACCENT : INACTIVE_LABEL,
                  marginTop: 2,
                  letterSpacing: 0.2,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
