import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import LottieView from 'lottie-react-native';
import { Image } from 'expo-image';

import { useStore } from '../../hooks/useStore';
import BottomDock from '../../components/library/BottomDock';
import { AnimatedPressable } from '../../components/animated/AnimatedPressable';
import { AnimatedView } from '../../components/animated/AnimatedView';

// ─── Lottie Component ─────────────────────────────────────────────────────────
function LottieAnim({
  source,
  size = 40,
  loop = true,
  autoPlay = true,
}: {
  source: any;
  size?: number;
  loop?: boolean;
  autoPlay?: boolean;
}) {
  return (
    <LottieView
      source={source}
      autoPlay={autoPlay}
      loop={loop}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QuickAction({
  icon,
  label,
  lottie,
  onPress,
  delay,
}: {
  icon: string;
  label: string;
  lottie: any;
  onPress: () => void;
  delay: number;
}) {
  return (
    <AnimatedView entry="fadeInUp" delay={delay} className="flex-1">
      <AnimatedPressable onPress={onPress}>
        <View className="bg-background-secondary rounded-2xl p-4 border border-borderCustom-subtle items-center">
          <View className="w-12 h-12 rounded-[14px] bg-accent-surface items-center justify-center mb-3">
            <LottieAnim source={lottie} size={36} />
          </View>
          <View className="text-textCustom-secondary text-xs font-medium">
            {label}
          </View>
        </View>
      </AnimatedPressable>
    </AnimatedView>
  );
}

// ─── Save Card ────────────────────────────────────────────────────────────────
function SaveCard({
  item,
  onPress,
  delay,
}: {
  item: any;
  onPress: () => void;
  delay: number;
}) {
  const getPlatformColor = (p: string) => {
    if (p === 'tiktok') return '#FFFFFF';
    if (p === 'instagram') return '#E1306C';
    return '#639922';
  };

  return (
    <AnimatedView entry="fadeInUp" delay={delay} className="mr-3">
      <AnimatedPressable onPress={onPress}>
        <View className="w-[130px]">
          <View className="w-[130px] h-[170px] rounded-[14px] overflow-hidden bg-background-tertiary mb-2">
            {item.thumbnailUrl ? (
              <Image
                source={{ uri: item.thumbnailUrl }}
                className="absolute inset-0"
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="bookmark" size={24} color="#333" />
              </View>
            )}
            <View
              className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: getPlatformColor(item.platform) }}
            />
          </View>
          <Text className="text-textCustom-primary text-xs font-semibold leading-4" numberOfLines={2}>
            {item.title}
          </Text>
          <View className="text-textCustom-tertiary text-[10px] mt-0.5 capitalize">
            {item.platform}
          </View>
        </View>
      </AnimatedPressable>
    </AnimatedView>
  );
}

// ─── Folder Row ───────────────────────────────────────────────────────────────
function FolderRow({
  folder,
  onPress,
  delay,
}: {
  folder: any;
  onPress: () => void;
  delay: number;
}) {
  return (
    <AnimatedView entry="fadeInUp" delay={delay}>
      <AnimatedPressable onPress={onPress}>
        <View className="flex-row items-center px-5 py-3.5 border-b border-white/5">
          <View className="w-10 h-10 rounded-[10px] bg-accent-surface items-center justify-center mr-3.5">
            <LottieAnim
              source={require('../../assets/lottie/folder-open.json')}
              size={24}
              loop={false}
            />
          </View>
          <View className="flex-1">
            <View className="text-textCustom-primary text-sm font-semibold">
              {folder.name}
            </View>
            <View className="text-textCustom-tertiary text-[11px] mt-0.5">
              {folder.count} saves
            </View>
          </View>
          <Ionicons name="chevron-forward" size={14} color="#333" />
        </View>
      </AnimatedPressable>
    </AnimatedView>
  );
}

// ─── Main Home Screen ─────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const saves = useStore((s) => s.saves);
  const folders = useStore((s) => s.folders);
  const setModal = useStore((s) => s.setModal);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuggestions = useMemo(
    () =>
      saves
        .map((item) => ({
          id: item.id,
          title: item.title,
          folder: item.platform,
          source: item.platform,
          color: item.platform === 'tiktok' ? '#ffffff' : '#E1306C',
          time: 'Saved ' + new Date(item.savedAt).toLocaleDateString(),
          thumbnailType: 'video-timeline',
        }))
        .filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.folder.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [saves, searchQuery]
  );

  const recentSaves = useMemo(
    () =>
      [...saves]
        .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
        .slice(0, 6),
    [saves]
  );

  const weekSaves = useMemo(
    () =>
      saves.filter((s) => {
        const d = Date.now() - new Date(s.savedAt).getTime();
        return d < 7 * 24 * 60 * 60 * 1000;
      }).length,
    [saves]
  );

  const handleTabChange = (tab: string) => {
    if (tab === 'library') router.push('/folders');
    if (tab === 'discover') router.push('/discover');
    if (tab === 'settings') router.push('/settings');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
      >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <AnimatedView entry="fadeIn" delay={0} className="flex-row justify-between items-center px-5 pb-5">
          <View className="flex-row items-center gap-3">
            <View className="w-[42px] h-[42px] rounded-xl overflow-hidden bg-accent-surface border-[1.5px] border-accent-base">
              <Image
                source={require('../../assets/icon.png')}
                className="w-full h-full"
                contentFit="cover"
              />
            </View>
            <View>
              <View className="text-textCustom-primary text-lg font-extrabold tracking-tight">
                Stash
              </View>
              <View className="text-textCustom-accent text-[11px] font-medium mt-0.5">
                Your bookmark brain
              </View>
            </View>
          </View>
          <View className="flex-row gap-2">
            <AnimatedPressable onPress={() => setIsSearchOpen(true)}>
              <View className="w-[38px] h-[38px] rounded-[11px] items-center justify-center bg-white/[0.06]">
                <Ionicons name="search" size={18} color="#fff" />
              </View>
            </AnimatedPressable>
            <AnimatedPressable onPress={() => router.push('/settings')}>
              <View className="w-[38px] h-[38px] rounded-[11px] items-center justify-center bg-white/[0.06]">
                <Ionicons name="settings-outline" size={18} color="#8EC934" />
              </View>
            </AnimatedPressable>
          </View>
        </AnimatedView>

        {/* ── HERO WITH LOTTIE ───────────────────────────────── */}
        <AnimatedView entry="fadeInUp" delay={100} className="mx-5 mb-6 bg-background-secondary rounded-[20px] p-5 border border-white/[0.07]">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <View className="text-textCustom-accent text-xs font-semibold tracking-wider uppercase mb-1">
                Welcome back
              </View>
              <View className="text-textCustom-primary text-xl font-extrabold tracking-tight">
                Your saves are organized
              </View>
              <View className="text-textCustom-tertiary text-xs mt-1">
                {saves.length} items · {folders.length} folders
              </View>
            </View>
            <View className="ml-3">
              <LottieAnim
                source={require('../../assets/lottie/bookmark-pulse.json')}
                size={80}
              />
            </View>
          </View>
          <AnimatedPressable onPress={() => router.push('/folders')}>
            <View className="flex-row items-center justify-center bg-accent-base py-3 rounded-xl gap-1.5">
              <Ionicons name="folder-open" size={16} color="#0A0A0A" />
              <View className="text-background-primary text-sm font-bold">
                Open Library
              </View>
            </View>
          </AnimatedPressable>
        </AnimatedView>

        {/* ── QUICK ACTIONS ──────────────────────────────────── */}
        <View className="mb-7">
          <View className="text-textCustom-primary text-[17px] font-bold tracking-tight px-5 mb-3.5">
            Quick actions
          </View>
          <View className="flex-row px-4 gap-2.5">
            <QuickAction
              icon="search"
              label="Search"
              lottie={require('../../assets/lottie/search-pulse.json')}
              onPress={() => setIsSearchOpen(true)}
              delay={200}
            />
            <QuickAction
              icon="folder"
              label="Folders"
              lottie={require('../../assets/lottie/folder-open.json')}
              onPress={() => router.push('/folders')}
              delay={260}
            />
            <QuickAction
              icon="compass"
              label="Discover"
              lottie={require('../../assets/lottie/bookmark-pulse.json')}
              onPress={() => router.push('/discover')}
              delay={320}
            />
          </View>
        </View>

        {/* ── RECENTLY SAVED ─────────────────────────────────── */}
        {recentSaves.length > 0 && (
          <View className="mb-7">
            <View className="flex-row justify-between items-center px-5 mb-3.5">
              <View className="text-textCustom-primary text-[17px] font-bold tracking-tight">
                Recently saved
              </View>
              <AnimatedPressable onPress={() => router.push('/recently-imported')}>
                <View className="text-textCustom-accent text-[13px] font-semibold">
                  See all
                </View>
              </AnimatedPressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
            >
              {recentSaves.map((item, i) => (
                <SaveCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/save/${item.id}`)}
                  delay={350 + i * 60}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── FOLDERS ─────────────────────────────────────────── */}
        {folders.length > 0 && (
          <View className="mb-7">
            <View className="flex-row justify-between items-center px-5 mb-3.5">
              <View className="text-textCustom-primary text-[17px] font-bold tracking-tight">
                Your folders
              </View>
              <AnimatedPressable onPress={() => router.push('/folders')}>
                <View className="text-textCustom-accent text-[13px] font-semibold">
                  See all
                </View>
              </AnimatedPressable>
            </View>
            {folders.slice(0, 4).map((folder, i) => (
              <FolderRow
                key={folder.id}
                folder={folder}
                onPress={() => router.push(`/folder/${folder.id}`)}
                delay={500 + i * 80}
              />
            ))}
          </View>
        )}

        {/* ── WEEKLY STATS ───────────────────────────────────── */}
        <AnimatedView entry="fadeInUp" delay={700} className="mx-5 bg-background-secondary rounded-2xl p-5 border border-white/[0.07]">
          <View className="flex-row items-center">
            <View className="flex-1 items-center">
              <View className="text-textCustom-accent text-2xl font-extrabold tracking-tight">
                {weekSaves}
              </View>
              <View className="text-textCustom-tertiary text-[11px] font-medium mt-1">
                This week
              </View>
            </View>
            <View className="w-px h-8 bg-white/[0.07]" />
            <View className="flex-1 items-center">
              <View className="text-textCustom-accent text-2xl font-extrabold tracking-tight">
                {saves.length}
              </View>
              <View className="text-textCustom-tertiary text-[11px] font-medium mt-1">
                Total saves
              </View>
            </View>
            <View className="w-px h-8 bg-white/[0.07]" />
            <View className="flex-1 items-center">
              <View className="text-textCustom-accent text-2xl font-extrabold tracking-tight">
                {folders.length}
              </View>
              <View className="text-textCustom-tertiary text-[11px] font-medium mt-1">
                Folders
              </View>
            </View>
          </View>
        </AnimatedView>

        {/* ── EMPTY STATE ────────────────────────────────────── */}
        {saves.length === 0 && (
          <AnimatedView entry="fadeInUp" delay={400} className="items-center py-10 px-10">
            <LottieAnim
              source={require('../../assets/lottie/empty-bounce.json')}
              size={100}
            />
            <View className="text-textCustom-primary text-lg font-bold mt-4 mb-1.5">
              Nothing here yet
            </View>
            <View className="text-textCustom-tertiary text-[13px] text-center leading-[18px] mb-5">
              Share a TikTok or Instagram link to Stash to get started
            </View>
            <AnimatedPressable
              onPress={() => router.push('/(auth)/onboarding/import')}
            >
              <View className="bg-accent-base px-6 py-3 rounded-xl">
                <View className="text-textCustom-primary text-sm font-bold">
                  Import saves
                </View>
              </View>
            </AnimatedPressable>
          </AnimatedView>
        )}
      </ScrollView>

      {/* ── SEARCH OVERLAY ───────────────────────────────────── */}
      {/* SearchOverlay component would go here */}

      {/* ── BOTTOM DOCK ──────────────────────────────────────── */}
      <BottomDock
        activeTab="home"
        setActiveTab={handleTabChange}
        onOpenSettings={() => router.push('/settings')}
        onResetFilters={() => {
          setSearchQuery('');
          setIsSearchOpen(false);
        }}
      />
    </SafeAreaView>
  );
}
