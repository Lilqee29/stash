import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, {
  FadeInDown,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';

import { useStore } from '../../hooks/useStore';
import BottomDock from '../../components/library/BottomDock';
import { HomeSkeleton } from '../../components/ui/SkeletonPlaceholder';
import { PlatformFilter } from '../../components/ui/PlatformFilter';
import { SaveMasonryGrid } from '../../components/ui/SaveCardGrid';
import { FolderGrid } from '../../components/ui/FolderGrid';

const ACCENT = '#8EC934';
const SKELETON_DELAY = 300;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const saves = useStore((s) => s.saves);
  const folders = useStore((s) => s.folders);
  const setModal = useStore((s) => s.setModal);

  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) setShowSkeleton(true);
    }, SKELETON_DELAY);
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredSaves = useMemo(() => {
    if (activeFilter === 'all') return saves;
    return saves.filter((s) => s.platform === activeFilter);
  }, [saves, activeFilter]);

  const handleCardPress = useCallback(
    (id: string) => router.push(`/save/${id}`),
    [router]
  );

  const handleFolderPress = useCallback(
    (id: string) => router.push(`/folder/${id}`),
    [router]
  );

  const handleSeeAllFolders = useCallback(
    () => router.push('/folders'),
    [router]
  );

  const handleTabChange = useCallback(
    (tab: string) => {
      if (tab === 'library') router.push('/folders');
      if (tab === 'discover') router.push('/discover');
      if (tab === 'settings') router.push('/settings');
    },
    [router]
  );

  if (showSkeleton && isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }} edges={['top']}>
        <HomeSkeleton />
        <BottomDock
          activeTab="home"
          setActiveTab={handleTabChange}
          onOpenSettings={() => router.push('/settings')}
        />
      </SafeAreaView>
    );
  }

  if (saves.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }} edges={['top']}>
        <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: '#141414',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Ionicons name="bookmark-outline" size={36} color="#333" />
          </View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              fontFamily: 'PlusJakartaSans_700Bold',
              color: '#fff',
              marginBottom: 8,
              textAlign: 'center',
              letterSpacing: -0.4,
            }}
          >
            Nothing here yet
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontFamily: 'Inter_400Regular',
              color: '#666',
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 28,
            }}
          >
            Share a TikTok or Instagram link to start building your stash
          </Text>
          <Pressable
            onPress={() => setModal('add')}
            style={{
              backgroundColor: ACCENT,
              paddingHorizontal: 28,
              paddingVertical: 14,
              borderRadius: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="add" size={18} color="#0A0A0A" />
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                fontFamily: 'Inter_600SemiBold',
                color: '#0A0A0A',
              }}
            >
              Import your first save
            </Text>
          </Pressable>
        </Animated.View>
        <BottomDock
          activeTab="home"
          setActiveTab={handleTabChange}
          onOpenSettings={() => router.push('/settings')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: 'rgba(142,201,52,0.12)',
                borderWidth: 1.5,
                borderColor: ACCENT,
              }}
            >
              <Image
                source={require('../../assets/icon.png')}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '800',
                  fontFamily: 'PlusJakartaSans_800ExtraBold',
                  color: '#fff',
                  letterSpacing: -0.6,
                }}
              >
                Stash
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '500',
                  fontFamily: 'Inter_500Medium',
                  color: ACCENT,
                  marginTop: 1,
                  letterSpacing: 0.3,
                }}
              >
                Your bookmark brain
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => router.push('/notifications')}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: '#141414',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <Ionicons name="notifications-outline" size={17} color="#888" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/settings')}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: '#141414',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <Ionicons name="settings-outline" size={17} color="#888" />
            </Pressable>
          </View>
        </Animated.View>

        {/* ── SEARCH BAR ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(300)}>
          <Pressable
            onPress={() => setModal('search')}
            style={{
              marginHorizontal: 20,
              marginBottom: 16,
              height: 46,
              borderRadius: 14,
              backgroundColor: '#141414',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              gap: 10,
            }}
          >
            <Ionicons name="search" size={16} color="#555" />
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'Inter_400Regular',
                color: '#555',
                flex: 1,
              }}
            >
              Search your stash...
            </Text>
            <View
              style={{
                backgroundColor: '#1A1A1A',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <Text style={{ fontSize: 11, color: '#666', fontFamily: 'Inter_500Medium' }}>
                ⌘K
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* ── PLATFORM FILTERS ───────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(140).duration(300)} style={{ marginBottom: 20 }}>
          <PlatformFilter
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            saves={saves}
          />
        </Animated.View>

        {/* ── SECTION: Recent Saves ──────────────────────────── */}
        {filteredSaves.length > 0 && (
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '700',
                  fontFamily: 'PlusJakartaSans_700Bold',
                  color: '#fff',
                  letterSpacing: -0.3,
                }}
              >
                Recent saves
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'Inter_400Regular',
                  color: '#555',
                }}
              >
                {filteredSaves.length} items
              </Text>
            </View>

            <SaveMasonryGrid
              saves={filteredSaves}
              onCardPress={handleCardPress}
            />
          </Animated.View>
        )}

        {/* ── SECTION: Folders ───────────────────────────────── */}
        {folders.length > 0 && (
          <Animated.View
            entering={FadeInUp.delay(350).duration(400)}
            style={{ marginTop: 12, marginBottom: 8 }}
          >
            <FolderGrid
              folders={folders}
              onFolderPress={handleFolderPress}
              onSeeAll={handleSeeAllFolders}
            />
          </Animated.View>
        )}
      </ScrollView>

      {/* ── BOTTOM DOCK ──────────────────────────────────────── */}
      <BottomDock
        activeTab="home"
        setActiveTab={handleTabChange}
        onOpenSettings={() => router.push('/settings')}
      />
    </SafeAreaView>
  );
}
