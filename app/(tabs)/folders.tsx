import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Image } from 'expo-image';

import { useStore } from '../../hooks/useStore';
import BottomDock from '../../components/library/BottomDock';
import { AnimatedPressable } from '../../components/animated/AnimatedPressable';
import { AnimatedView } from '../../components/animated/AnimatedView';

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const saves = useStore((s) => s.saves);
  const folders = useStore((s) => s.folders);
  const addFolder = useStore((s) => s.addFolder);

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const isSearching = searchQuery.trim().length > 0;

  const filteredSaves = useMemo(
    () =>
      saves.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.platform.toLowerCase().includes(searchQuery.toLowerCase())
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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab: string) => {
    if (tab === 'home') router.push('/home');
    if (tab === 'discover') router.push('/discover');
    if (tab === 'settings') router.push('/settings');
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() === '') return;
    addFolder(newFolderName);
    setNewFolderName('');
    setIsCreateOpen(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary">
        <View className="px-5 pt-2 pb-5">
          <Text className="text-textCustom-primary text-[32px] font-extrabold tracking-tight">
            Library
          </Text>
        </View>
        <View className="px-5 gap-3">
          {[1, 2, 3].map((i) => (
            <View key={i} className="h-[60px] bg-background-secondary rounded-[14px]" />
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
        keyboardShouldPersistTaps="handled"
      >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <AnimatedView entry="fadeIn" delay={0} className="flex-row justify-between items-center px-5 pb-5">
          <Text className="text-textCustom-primary text-[32px] font-extrabold tracking-tight">
            Library
          </Text>
          <AnimatedPressable onPress={() => setIsCreateOpen(true)}>
            <View className="w-[38px] h-[38px] rounded-xl items-center justify-center bg-accent-surface border border-accent-base/20">
              <Ionicons name="add" size={20} color="#8EC934" />
            </View>
          </AnimatedPressable>
        </AnimatedView>

        {/* ── SEARCH ─────────────────────────────────────────── */}
        <AnimatedView entry="fadeInUp" delay={50} className="flex-row items-center bg-background-secondary rounded-xl mx-5 mb-6 px-3.5 h-11 border border-white/[0.07] gap-2">
          <Ionicons name="search-outline" size={16} color="#555" />
          <TextInput
            className="flex-1 text-textCustom-primary text-sm"
            placeholder="Search saves..."
            placeholderTextColor="#444"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <AnimatedPressable onPress={() => setSearchQuery('')}>
              <View className="p-1">
                <Ionicons name="close-circle" size={16} color="#444" />
              </View>
            </AnimatedPressable>
          )}
        </AnimatedView>

        {/* ── SEARCH RESULTS ─────────────────────────────────── */}
        {isSearching ? (
          <View className="mb-7">
            <Text className="text-textCustom-tertiary text-[13px] font-medium px-5 mb-2.5">
              {filteredSaves.length} results
            </Text>
            {filteredSaves.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-textCustom-tertiary text-[13px]">
                  No saves found
                </Text>
              </View>
            ) : (
              filteredSaves.map((item, i) => (
                <AnimatedView key={item.id} entry="fadeInUp" delay={i * 40}>
                  <AnimatedPressable onPress={() => router.push(`/save/${item.id}`)}>
                    <View className="flex-row items-center justify-between px-5 py-3.5 border-b border-white/[0.03]">
                      <View className="flex-1 pr-2.5">
                        <Text className="text-textCustom-primary text-sm font-semibold" numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text className="text-textCustom-tertiary text-[11px] mt-1">
                          {item.platform} · {timeAgo(item.savedAt)}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color="#333" />
                    </View>
                  </AnimatedPressable>
                </AnimatedView>
              ))
            )}
          </View>
        ) : (
          <>
            {/* ── RECENTLY SAVED ─────────────────────────────── */}
            {recentSaves.length > 0 && (
              <View className="mb-7">
                <View className="flex-row justify-between items-center px-5 mb-3.5">
                  <Text className="text-textCustom-primary text-[17px] font-bold tracking-tight">
                    Recently saved
                  </Text>
                  <AnimatedPressable onPress={() => router.push('/recently-imported')}>
                    <Text className="text-textCustom-accent text-[13px] font-semibold">
                      See all
                    </Text>
                  </AnimatedPressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
                >
                  {recentSaves.map((item, i) => (
                    <AnimatedView key={item.id} entry="fadeInUp" delay={100 + i * 60} className="mr-3">
                      <AnimatedPressable onPress={() => router.push(`/save/${item.id}`)}>
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
                                <Ionicons name="bookmark" size={20} color="#333" />
                              </View>
                            )}
                            <View
                              className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: getPlatformColor(item.platform) }}
                            />
                          </View>
                          <Text className="text-textCustom-primary text-xs font-semibold" numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text className="text-textCustom-tertiary text-[10px] mt-0.5">
                            {timeAgo(item.savedAt)}
                          </Text>
                        </View>
                      </AnimatedPressable>
                    </AnimatedView>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* ── FOLDERS ─────────────────────────────────────── */}
            <View className="mb-7">
              <View className="flex-row justify-between items-center px-5 mb-3.5">
                <Text className="text-textCustom-primary text-[17px] font-bold tracking-tight">
                  Folders
                </Text>
                <Text className="text-textCustom-tertiary text-[13px] font-medium">
                  {folders.length}
                </Text>
              </View>

              {folders.length === 0 ? (
                <View className="items-center py-10 px-10">
                  <View className="w-14 h-14 rounded-[14px] bg-background-secondary items-center justify-center mb-3.5 border border-white/[0.07]">
                    <Ionicons name="folder-outline" size={28} color="#333" />
                  </View>
                  <Text className="text-textCustom-primary text-[15px] font-semibold mb-1">
                    No folders yet
                  </Text>
                  <Text className="text-textCustom-tertiary text-xs text-center mb-4">
                    Create a folder to organize your saves
                  </Text>
                  <AnimatedPressable onPress={() => setIsCreateOpen(true)}>
                    <View className="bg-accent-base px-5 py-2.5 rounded-[10px]">
                      <Text className="text-textCustom-primary text-[13px] font-bold">
                        Create folder
                      </Text>
                    </View>
                  </AnimatedPressable>
                </View>
              ) : (
                folders.map((folder, i) => (
                  <AnimatedView key={folder.id} entry="fadeInUp" delay={200 + i * 60}>
                    <AnimatedPressable onPress={() => router.push(`/folder/${folder.id}`)}>
                      <View className="flex-row items-center px-5 py-3.5 border-b border-white/[0.03]">
                        <View className="w-10 h-10 rounded-[10px] bg-accent-surface items-center justify-center mr-3.5">
                          <Ionicons name="folder" size={18} color="#8EC934" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-textCustom-primary text-sm font-semibold">
                            {folder.name}
                          </Text>
                          <Text className="text-textCustom-tertiary text-[11px] mt-0.5">
                            {folder.count} saves
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={14} color="#333" />
                      </View>
                    </AnimatedPressable>
                  </AnimatedView>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* ── CREATE FOLDER MODAL ──────────────────────────────── */}
      <Modal
        visible={isCreateOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreateOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-center items-center px-6"
          onPress={() => setIsCreateOpen(false)}
        >
          <Pressable onPress={(event) => event.stopPropagation()}>
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 200 }}
              className="w-full bg-[#161616] rounded-[20px] p-6 border border-borderCustom-subtle"
            >
              <Text className="text-textCustom-primary text-lg font-bold text-center mb-5">
                New folder
              </Text>
              <TextInput
                className="bg-background-secondary rounded-xl border border-white/[0.07] px-3.5 h-12 text-textCustom-primary text-sm mb-5"
                placeholder="Folder name"
                placeholderTextColor="#444"
                value={newFolderName}
                onChangeText={setNewFolderName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateFolder}
              />
              <View className="flex-row gap-2.5">
                <AnimatedPressable onPress={() => setIsCreateOpen(false)}>
                  <View className="flex-1 h-11 rounded-xl items-center justify-center bg-[#1E1E1E]">
                    <Text className="text-textCustom-secondary text-sm font-semibold">
                      Cancel
                    </Text>
                  </View>
                </AnimatedPressable>
                <AnimatedPressable onPress={handleCreateFolder}>
                  <View
                    className={`flex-1 h-11 rounded-xl items-center justify-center ${
                      !newFolderName.trim() ? 'bg-accent-base/40' : 'bg-accent-base'
                    }`}
                  >
                    <Text className="text-textCustom-primary text-sm font-bold">
                      Create
                    </Text>
                  </View>
                </AnimatedPressable>
              </View>
            </MotiView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── BOTTOM DOCK ──────────────────────────────────────── */}
      <BottomDock
        activeTab="library"
        setActiveTab={handleTabChange}
        onOpenSettings={() => router.push('/settings')}
        onResetFilters={() => setSearchQuery('')}
      />
    </SafeAreaView>
  );
}
