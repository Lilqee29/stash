import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

import { useStore, SaveItem } from '../../hooks/useStore';
import BottomDock from '../../components/library/BottomDock';
import { AnimatedPressable } from '../../components/animated/AnimatedPressable';
import { AnimatedView } from '../../components/animated/AnimatedView';

const QUICK_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Recipes', value: 'Recipes' },
  { label: 'Places', value: 'Places' },
  { label: 'Design', value: 'Design' },
  { label: 'Films', value: 'Films' },
];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const saves = useStore((s) => s.saves);
  const folders = useStore((s) => s.folders);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const recentSaves = useMemo(
    () =>
      [...saves]
        .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
        .slice(0, 8),
    [saves]
  );

  const filteredSaves = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === '' && activeFilter === 'all') return [];

    return saves.filter((item) => {
      const matchesQuery =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.platform.toLowerCase().includes(q) ||
        (item.genre && item.genre.toLowerCase().includes(q)) ||
        (item.creator && item.creator.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.contentType && item.contentType.toLowerCase().includes(q)) ||
        (item.folderId &&
          folders.find((f) => f.id === item.folderId)?.name.toLowerCase().includes(q));

      const matchesFilter =
        activeFilter === 'all' ||
        item.platform.toLowerCase() === activeFilter.toLowerCase() ||
        (item.genre && item.genre.toLowerCase() === activeFilter.toLowerCase());

      return matchesQuery && matchesFilter;
    });
  }, [saves, folders, query, activeFilter]);

  const handleTabChange = (tab: string) => {
    if (tab === 'home') router.push('/home');
    else if (tab === 'library') router.push('/folders');
  };

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return 'Unsorted';
    return folders.find((f) => f.id === folderId)?.name ?? 'Unsorted';
  };

  const getContentTypeIcon = (item: SaveItem) => {
    if (item.contentType === 'movie') return 'film-outline';
    if (item.contentType === 'list') return 'list-outline';
    return 'bookmark-outline';
  };

  const renderSaveItem = (item: SaveItem, index: number) => (
    <AnimatedView key={item.id} entry="fadeInUp" delay={index * 40}>
      <AnimatedPressable onPress={() => router.push(`/save/${item.id}`)}>
        <View className="flex-row items-center justify-between bg-background-secondary rounded-2xl p-3.5 mb-2.5 border border-white/[0.07]">
          <View className="w-9 h-9 rounded-[10px] bg-accent-surface items-center justify-center mr-3">
            <Ionicons name={getContentTypeIcon(item)} size={18} color="#8EC934" />
          </View>
          <View className="flex-1 pr-2.5">
            <Text className="text-textCustom-primary text-sm font-semibold leading-5" numberOfLines={2}>
              {item.title}
            </Text>
            <View className="flex-row items-center mt-2 gap-2">
              <View className="bg-background-tertiary border border-borderCustom-medium px-1.5 py-0.5 rounded-md">
                <Text className="text-textCustom-secondary text-[8px] font-bold uppercase">
                  {item.platform}
                </Text>
              </View>
              {item.genre && (
                <View className="bg-accent-surface px-1.5 py-0.5 rounded-md">
                  <Text className="text-textCustom-accent text-[10px] font-semibold">
                    {item.genre}
                  </Text>
                </View>
              )}
              <Text className="text-textCustom-tertiary text-[11px] font-medium">
                {getFolderName(item.folderId)}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={14} color="#333" />
        </View>
      </AnimatedPressable>
    </AnimatedView>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {/* Header */}
      <AnimatedView entry="fadeIn" delay={0} className="px-6 mt-[18px] mb-4">
        <Text className="text-textCustom-primary text-[28px] font-extrabold tracking-tight">
          Search
        </Text>
        <Text className="text-textCustom-secondary text-[13px] mt-1">
          Find any saved reference instantly
        </Text>
      </AnimatedView>

      {/* Search Input */}
      <AnimatedView entry="fadeInUp" delay={50} className="flex-row items-center bg-background-secondary border border-borderCustom-subtle rounded-[14px] mx-6 px-3.5 h-[50px] mb-3">
        <Ionicons name="search-outline" size={18} color="#888" style={{ marginRight: 10 }} />
        <TextInput
          placeholder="Titles, platforms, genres, creators..."
          placeholderTextColor="#555"
          className="flex-1 text-textCustom-primary text-sm font-dmsans"
          value={query}
          onChangeText={setQuery}
          autoFocus={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <AnimatedPressable onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color="#888" />
          </AnimatedPressable>
        )}
      </AnimatedView>

      {/* Quick Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 14, gap: 8 }}
      >
        {QUICK_FILTERS.map((f, i) => (
          <AnimatedView key={f.value} entry="fadeIn" delay={100 + i * 30}>
            <AnimatedPressable onPress={() => setActiveFilter(f.value)}>
              <View
                className={`px-3.5 py-2 rounded-full border ${
                  activeFilter === f.value
                    ? 'bg-accent-surface border-accent-base'
                    : 'bg-background-secondary border-borderCustom-subtle'
                }`}
              >
                <Text
                  className={`text-[12px] font-semibold font-dmsans ${
                    activeFilter === f.value ? 'text-textCustom-accent' : 'text-textCustom-secondary'
                  }`}
                >
                  {f.label}
                </Text>
              </View>
            </AnimatedPressable>
          </AnimatedView>
        ))}
      </ScrollView>

      {/* Content */}
      {query.trim() === '' && activeFilter === 'all' ? (
        <View className="flex-1">
          <Text className="text-textCustom-tertiary text-[11px] font-bold tracking-wider px-6 mb-2.5">
            RECENT SAVES
          </Text>
          {recentSaves.length === 0 ? (
            <View className="flex-1 justify-center items-center px-10 pb-[100px]">
              <Ionicons name="bookmark-outline" size={56} color="#1A1A1A" />
              <Text className="text-textCustom-primary text-base font-bold mt-4 text-center">
                No saves yet
              </Text>
              <Text className="text-textCustom-tertiary text-[13px] mt-1.5 text-center leading-[18px]">
                Paste a TikTok or Instagram link to start building your library
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
            >
              {recentSaves.map((item, i) => renderSaveItem(item, i))}
            </ScrollView>
          )}
        </View>
      ) : filteredSaves.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10 pb-[100px]">
          <Ionicons name="search-outline" size={56} color="#1A1A1A" />
          <Text className="text-textCustom-primary text-base font-bold mt-4 text-center">
            No results found
          </Text>
          <Text className="text-textCustom-tertiary text-[13px] mt-1.5 text-center leading-[18px]">
            Try different keywords, or clear filters to browse all saves
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          <Text className="text-textCustom-tertiary text-[11px] font-bold tracking-wider px-6 mb-2.5">
            {filteredSaves.length} RESULT{filteredSaves.length !== 1 ? 'S' : ''}
          </Text>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
          >
            {filteredSaves.map((item, i) => renderSaveItem(item, i))}
          </ScrollView>
        </View>
      )}

      {/* Bottom Dock */}
      <BottomDock
        activeTab="search"
        setActiveTab={handleTabChange}
        onOpenSettings={() => router.push('/settings')}
      />
    </SafeAreaView>
  );
}
