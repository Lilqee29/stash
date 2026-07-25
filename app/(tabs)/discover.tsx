import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Image } from 'expo-image';

import { useStore, SaveItem } from '../../hooks/useStore';
import BottomDock from '../../components/library/BottomDock';
import { AnimatedPressable } from '../../components/animated/AnimatedPressable';
import { AnimatedView } from '../../components/animated/AnimatedView';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getPlatformColor(platform: string) {
  switch (platform) {
    case 'tiktok':
      return '#FFFFFF';
    case 'instagram':
      return '#E1306C';
    default:
      return '#8EC934';
  }
}

// ─── Quick Action Card ────────────────────────────────────────────────────────
function QuickAction({
  icon,
  label,
  count,
  onPress,
  delay,
}: {
  icon: string;
  label: string;
  count: number;
  onPress: () => void;
  delay: number;
}) {
  return (
    <AnimatedView entry="fadeInUp" delay={delay} className="flex-1">
      <AnimatedPressable onPress={onPress}>
        <View className="bg-background-secondary rounded-2xl p-4 border border-white/[0.07] items-center">
          <View className="w-10 h-10 rounded-xl bg-accent-surface items-center justify-center mb-2.5">
            <Ionicons name={icon as any} size={20} color="#8EC934" />
          </View>
          <View className="text-textCustom-primary text-xl font-extrabold tracking-tight">
            {count}
          </View>
          <View className="text-textCustom-tertiary text-[11px] font-medium mt-0.5">
            {label}
          </View>
        </View>
      </AnimatedPressable>
    </AnimatedView>
  );
}

// ─── Category Row ─────────────────────────────────────────────────────────────
function CategoryRow({
  emoji,
  label,
  count,
  onPress,
  delay,
}: {
  emoji: string;
  label: string;
  count: number;
  onPress: () => void;
  delay: number;
}) {
  return (
    <AnimatedView entry="fadeInUp" delay={delay}>
      <AnimatedPressable onPress={onPress}>
        <View className="flex-row items-center px-5 py-3.5 border-b border-white/[0.03]">
          <View className="w-11 h-11 rounded-xl bg-background-secondary items-center justify-center mr-3.5 border border-white/[0.07]">
            <View className="text-xl">{emoji}</View>
          </View>
          <View className="flex-1">
            <View className="text-textCustom-primary text-sm font-semibold">
              {label}
            </View>
            <View className="text-textCustom-tertiary text-[11px] mt-0.5">
              {count} saves
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#333" />
        </View>
      </AnimatedPressable>
    </AnimatedView>
  );
}

// ─── Save Card (Horizontal) ───────────────────────────────────────────────────
function SaveCard({
  item,
  onPress,
  delay,
}: {
  item: SaveItem;
  onPress: () => void;
  delay: number;
}) {
  return (
    <AnimatedView entry="fadeInUp" delay={delay} className="mr-3">
      <AnimatedPressable onPress={onPress}>
        <View className="w-[140px]">
          <View className="w-[140px] h-[180px] rounded-[14px] overflow-hidden bg-background-tertiary mb-2">
            {item.thumbnailUrl ? (
              <Image
                source={{ uri: item.thumbnailUrl }}
                className="absolute inset-0"
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View className="flex-1 items-center justify-center bg-background-tertiary">
                <Ionicons name="bookmark" size={24} color="#333" />
              </View>
            )}
            <View
              className="absolute bottom-2 left-2 w-2 h-2 rounded-full"
              style={{ backgroundColor: getPlatformColor(item.platform) }}
            />
          </View>
          <Text className="text-textCustom-primary text-xs font-semibold leading-4" numberOfLines={2}>
            {item.title}
          </Text>
          <View className="text-textCustom-tertiary text-[10px] mt-0.5">
            {timeAgo(item.savedAt)}
          </View>
        </View>
      </AnimatedPressable>
    </AnimatedView>
  );
}

// ─── Main Discover Screen ──────────────────────────────────────────────────────
export default function DiscoverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const saves = useStore((s) => s.saves);
  const folders = useStore((s) => s.folders);

  const [isLoading, setIsLoading] = useState(true);

  const totalSaves = saves.length;
  const totalFolders = folders.length;
  const recentSaves = useMemo(
    () =>
      saves.filter((s) => {
        const d = Date.now() - new Date(s.savedAt).getTime();
        return d < 7 * 24 * 60 * 60 * 1000;
      }).length,
    [saves]
  );

  const categoryData = useMemo(
    () =>
      folders.map((f) => ({
        emoji:
          f.platforms?.[0] === 'tiktok'
            ? '♪'
            : f.platforms?.[0] === 'instagram'
            ? '◎'
            : '📁',
        label: f.name,
        count: f.count,
      })),
    [folders]
  );

  const recentSavesList = useMemo(
    () =>
      [...saves]
        .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
        .slice(0, 8),
    [saves]
  );

  const topPicks = useMemo(
    () =>
      [...saves]
        .sort((a, b) => (b.savesCount || 0) - (a.savesCount || 0))
        .slice(0, 4),
    [saves]
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab: string) => {
    if (tab === 'home') router.push('/home');
    if (tab === 'library') router.push('/folders');
    if (tab === 'settings') router.push('/settings');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary">
        <View className="px-5 pt-2 pb-5">
          <View className="text-textCustom-primary text-[32px] font-extrabold tracking-tight">
            Discover
          </View>
        </View>
        <View className="px-5 gap-3">
          {[1, 2, 3].map((i) => (
            <View key={i} className="h-[100px] bg-background-secondary rounded-2xl" />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
      >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <AnimatedView entry="fadeIn" delay={0} className="flex-row justify-between items-center px-5 pb-5">
          <View className="text-textCustom-primary text-[32px] font-extrabold tracking-tight">
            Discover
          </View>
          <AnimatedPressable onPress={() => router.push('/notifications')}>
            <View className="w-[38px] h-[38px] rounded-xl items-center justify-center bg-white/[0.06]">
              <Ionicons name="notifications-outline" size={20} color="#888" />
            </View>
          </AnimatedPressable>
        </AnimatedView>

        {/* ── QUICK STATS ────────────────────────────────────── */}
        <View className="flex-row px-4 gap-2.5 mb-7">
          <QuickAction
            icon="bookmark"
            label="Saves"
            count={totalSaves}
            onPress={() => router.push('/folders')}
            delay={100}
          />
          <QuickAction
            icon="folder"
            label="Folders"
            count={totalFolders}
            onPress={() => router.push('/folders')}
            delay={160}
          />
          <QuickAction
            icon="time"
            label="This Week"
            count={recentSaves}
            onPress={() => router.push('/recently-imported')}
            delay={220}
          />
        </View>

        {/* ── RECENTLY ADDED ─────────────────────────────────── */}
        {recentSavesList.length > 0 && (
          <>
            <View className="flex-row justify-between items-center px-5 mb-3.5 mt-1">
              <View className="text-textCustom-primary text-lg font-bold tracking-tight">
                Recently Added
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
              contentContainerStyle={{ paddingLeft: 20, paddingRight: 8, paddingBottom: 4 }}
            >
              {recentSavesList.map((item, i) => (
                <SaveCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/save/${item.id}`)}
                  delay={280 + i * 50}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* ── TOP PICKS ──────────────────────────────────────── */}
        {topPicks.length > 0 && (
          <>
            <View className="flex-row justify-between items-center px-5 mb-3.5 mt-1">
              <View className="text-textCustom-primary text-lg font-bold tracking-tight">
                Top Picks
              </View>
              <View className="flex-row items-center gap-1 bg-accent-surface px-2 py-1 rounded-lg">
                <Ionicons name="trending-up" size={12} color="#8EC934" />
                <View className="text-textCustom-accent text-[11px] font-semibold">
                  Trending
                </View>
              </View>
            </View>

            <View className="flex-row flex-wrap px-4 gap-2.5">
              {topPicks.map((item, i) => (
                <AnimatedView
                  key={item.id}
                  entry="fadeInUp"
                  delay={400 + i * 60}
                  className="w-[48%] mb-1"
                >
                  <AnimatedPressable onPress={() => router.push(`/save/${item.id}`)}>
                    <View className="bg-background-secondary rounded-[14px] border border-white/[0.07] overflow-hidden">
                      <View className="h-[120px] bg-background-tertiary">
                        {item.thumbnailUrl ? (
                          <Image
                            source={{ uri: item.thumbnailUrl }}
                            className="absolute inset-0"
                            contentFit="cover"
                            transition={300}
                          />
                        ) : (
                          <View className="flex-1 items-center justify-center">
                            <Ionicons name="bookmark" size={20} color="#333" />
                          </View>
                        )}
                        {item.savesCount && (
                          <View className="absolute top-2 right-2 flex-row items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded-md">
                            <Ionicons name="diamond" size={10} color="#8EC934" />
                            <View className="text-textCustom-accent text-[10px] font-bold">
                              {item.savesCount}
                            </View>
                          </View>
                        )}
                      </View>
                      <Text className="text-textCustom-primary text-xs font-semibold p-2.5 pb-3" numberOfLines={1}>
                        {item.title}
                      </Text>
                    </View>
                  </AnimatedPressable>
                </AnimatedView>
              ))}
            </View>
          </>
        )}

        {/* ── BROWSE BY FOLDER ───────────────────────────────── */}
        {categoryData.length > 0 && (
          <>
            <View className="flex-row justify-between items-center px-5 mb-3.5 mt-1">
              <View className="text-textCustom-primary text-lg font-bold tracking-tight">
                Browse Folders
              </View>
              <View className="text-textCustom-tertiary text-xs font-medium">
                {categoryData.length} categories
              </View>
            </View>

            {categoryData.map((cat, i) => (
              <CategoryRow
                key={cat.label}
                emoji={cat.emoji}
                label={cat.label}
                count={cat.count}
                onPress={() => router.push('/folders')}
                delay={500 + i * 60}
              />
            ))}
          </>
        )}

        {/* ── EMPTY STATE ────────────────────────────────────── */}
        {saves.length === 0 && (
          <AnimatedView entry="fadeInUp" delay={300} className="items-center py-[60px] px-10">
            <View className="w-20 h-20 rounded-[20px] bg-background-secondary items-center justify-center mb-5 border border-white/[0.07]">
              <Ionicons name="compass" size={40} color="#333" />
            </View>
            <View className="text-textCustom-primary text-lg font-bold mb-2">
              Nothing to discover yet
            </View>
            <View className="text-textCustom-tertiary text-[13px] text-center leading-[18px] mb-6">
              Import your TikTok or Instagram saves to see them here.
            </View>
            <AnimatedPressable
              onPress={() => useStore.getState().setModal('add')}
            >
              <View className="bg-accent-base px-6 py-3 rounded-xl">
                <View className="text-textCustom-primary text-sm font-bold">
                  Import Saves
                </View>
              </View>
            </AnimatedPressable>
          </AnimatedView>
        )}
      </ScrollView>

      {/* ── BOTTOM DOCK ──────────────────────────────────────── */}
      <BottomDock
        activeTab="discover"
        setActiveTab={handleTabChange}
        onOpenSettings={() => router.push('/settings')}
        onResetFilters={() => {}}
      />
    </SafeAreaView>
  );
}
