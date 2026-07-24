import React, { useState, useEffect } from 'react';
import { View, Pressable, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useStore } from '../../hooks/useStore';
import { AnimatedPressable } from '../animated/AnimatedPressable';

interface BottomDockProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  onResetFilters?: () => void;
}

const ACCENT = '#8EC934';

export default function BottomDock({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onResetFilters,
}: BottomDockProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const router = useRouter();
  const setModal = useStore((s) => s.setModal);

  const translateX = useSharedValue(0);

  const tabs = [
    {
      key: 'home',
      label: 'Home',
      icon: 'home',
      onPress: () => {
        setActiveTab('home');
        onResetFilters?.();
        router.push('/home');
      },
    },
    {
      key: 'discover',
      label: 'Discover',
      icon: 'compass-outline',
      onPress: () => {
        setActiveTab('discover');
        onResetFilters?.();
        router.push('/discover');
      },
    },
    {
      key: 'add',
      label: 'Add',
      icon: 'add-circle',
      isSpecial: true,
      onPress: () => {
        setModal('add');
      },
    },
    {
      key: 'library',
      label: 'Library',
      icon: 'albums',
      onPress: () => {
        setActiveTab('library');
        router.push('/folders');
      },
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: 'person',
      onPress: () => router.push('/profile'),
    },
  ];

  useEffect(() => {
    const index = tabs.findIndex((t) => t.key === activeTab);
    const segmentWidth = containerWidth / tabs.length;
    if (index !== -1 && segmentWidth > 0) {
      translateX.value = withSpring(index * segmentWidth + 4, {
        damping: 18,
        stiffness: 200,
      });
    }
  }, [activeTab, containerWidth]);

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const segmentWidth = containerWidth ? containerWidth / tabs.length : 0;

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: segmentWidth - 8,
  }));

  return (
    <View className="absolute bottom-6 w-full items-center">
      <View
        onLayout={onLayout}
        className="w-[94%] h-[70px] flex-row items-center px-1 rounded-[35px] bg-[rgba(18,18,18,0.95)] border border-white/[0.08] overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        {/* Active Indicator */}
        {segmentWidth > 0 && (
          <Animated.View
            style={indicatorStyle}
            className="absolute top-1.5 bottom-1.5 left-0 rounded-[20px] bg-background-primary border border-accent-base/[0.12]"
          />
        )}

        {/* Tabs */}
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          if (tab.isSpecial) {
            return (
              <AnimatedPressable key={tab.key} onPress={tab.onPress}>
                <View className="flex-1 h-full items-center justify-center">
                  <View
                    className="w-[50px] h-[50px] rounded-full bg-accent-base items-center justify-center border-2 border-background-primary"
                    style={{
                      shadowColor: '#8EC934',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.35,
                      shadowRadius: 10,
                      elevation: 6,
                      transform: [{ translateY: -12 }],
                    }}
                  >
                    <Ionicons name="add" size={24} color="#0A0A0A" />
                  </View>
                </View>
              </AnimatedPressable>
            );
          }

          return (
            <AnimatedPressable key={tab.key} onPress={tab.onPress}>
              <View className="flex-1 h-full items-center justify-center gap-1">
                <Ionicons
                  name={tab.icon as any}
                  size={18}
                  color={isActive ? ACCENT : 'rgba(255,255,255,0.4)'}
                />
                <View
                  className={`text-[10px] font-bold ${
                    isActive ? 'text-textCustom-accent' : 'text-white/40'
                  }`}
                  style={{ opacity: isActive ? 1 : 0.6 }}
                >
                  {tab.label}
                </View>
              </View>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}
