import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, Pressable, Alert, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { MotiView } from 'moti';

import { useStore, SaveItem } from '../../hooks/useStore';
import { AnimatedPressable } from '../../components/animated/AnimatedPressable';
import { AnimatedView } from '../../components/animated/AnimatedView';
import { SwipeableRow } from '../../components/animated/SwipeableRow';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getContentTypeBadge(item: SaveItem) {
  switch (item.contentType) {
    case 'movie':
      return { label: 'Movie', color: '#FF8C42', icon: 'film-outline' as const };
    case 'list':
      return { label: 'Software', color: '#4FD1FF', icon: 'code-slash-outline' as const };
    default:
      return {
        label: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
        color: '#8EC934',
        icon: 'globe-outline' as const,
      };
  }
}

function getPlatformIcon(platform: string): any {
  switch (platform) {
    case 'tiktok':
      return 'logo-tiktok';
    case 'instagram':
      return 'logo-instagram';
    case 'behance':
      return 'briefcase-outline';
    case 'dribbble':
      return 'basketball-outline';
    default:
      return 'globe-outline';
  }
}

// ─── Save Poster Card (in grid) ───────────────────────────────────────────────
function SavePosterCard({
  item,
  onPress,
  delay,
}: {
  item: SaveItem;
  onPress: () => void;
  delay: number;
}) {
  const badge = getContentTypeBadge(item);
  return (
    <AnimatedView entry="fadeInUp" delay={delay} className="flex-1 max-w-[50%]">
      <AnimatedPressable onPress={onPress}>
        <View className="h-[200px] rounded-[18px] overflow-hidden bg-background-tertiary border border-borderCustom-subtle justify-end">
          {item.thumbnailUrl ? (
            <Image
              source={{ uri: item.thumbnailUrl }}
              className="absolute inset-0"
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-background-tertiary">
              <Ionicons name={getPlatformIcon(item.platform)} size={28} color="#444" />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            className="absolute bottom-0 left-0 right-0 h-[100px]"
          />
          <View
            className="absolute top-2.5 right-2.5 flex-row items-center gap-[3px] bg-black/65 px-[7px] py-[3px] rounded-2xl border"
            style={{ borderColor: badge.color + '60' }}
          >
            <Ionicons name={badge.icon} size={9} color={badge.color} />
            <Text style={{ color: badge.color }} className="text-[9px] font-bold tracking-wider">
              {badge.label}
            </Text>
          </View>
          <Text className="text-textCustom-primary text-[13px] font-bold leading-[17px] px-2.5 pb-2.5" numberOfLines={2}>
            {item.title}
          </Text>
        </View>
        <View className="text-textCustom-tertiary text-[11px] mt-1.5 ml-1">
          {timeAgo(item.savedAt)}
        </View>
      </AnimatedPressable>
    </AnimatedView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function FolderDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const saves = useStore((s) => s.saves);
  const folders = useStore((s) => s.folders);
  const renameFolder = useStore((s) => s.renameFolder);
  const deleteFolder = useStore((s) => s.deleteFolder);
  const deleteSave = useStore((s) => s.deleteSave);

  const folder = useMemo(() => folders.find((f) => f.id === id), [folders, id]);
  const folderSaves = useMemo(
    () => saves.filter((s) => s.folderId === id),
    [saves, id]
  );

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(folder?.name || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary">
        <View className="flex-1 justify-center px-6">
          <View className="h-[18px] bg-background-secondary rounded-[10px] mb-3.5" />
          <View className="w-[60%] h-[18px] bg-background-secondary rounded-[10px] mb-3.5" />
          <View className="w-[80%] h-[18px] bg-background-secondary rounded-[10px]" />
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary items-center justify-center gap-3 pb-20">
        <Ionicons name="alert-circle-outline" size={56} color="#FF695E" />
        <View className="text-textCustom-primary text-lg font-bold">{loadError}</View>
        <AnimatedPressable onPress={() => router.back()}>
          <View className="bg-accent-base py-3 px-6 rounded-xl mt-2">
            <View className="text-background-primary text-sm font-bold">Go Back</View>
          </View>
        </AnimatedPressable>
      </SafeAreaView>
    );
  }

  if (!folder) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary items-center justify-center gap-3 pb-20">
        <Ionicons name="folder-open-outline" size={56} color="#2A2A2A" />
        <View className="text-textCustom-primary text-lg font-bold">Folder not found</View>
        <AnimatedPressable onPress={() => router.back()}>
          <View className="bg-accent-base py-3 px-6 rounded-xl mt-2">
            <View className="text-background-primary text-sm font-bold">Go Back</View>
          </View>
        </AnimatedPressable>
      </SafeAreaView>
    );
  }

  const handleRename = () => {
    if (newName.trim() === '') return;
    renameFolder(folder.id, newName.trim());
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Folder',
      'Are you sure? Saved items inside will be moved to Unsorted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteFolder(folder.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleDeleteSave = (saveId: string) => {
    deleteSave(saveId);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <AnimatedView entry="fadeIn" delay={0} className="flex-row justify-between items-center px-5 pt-2.5 pb-1">
        <AnimatedPressable onPress={() => router.back()}>
          <View className="w-[38px] h-[38px] rounded-xl bg-background-secondary border border-borderCustom-subtle items-center justify-center">
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </View>
        </AnimatedPressable>

        <View className="flex-row gap-2">
          <AnimatedPressable
            onPress={() => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))}
          >
            <View className="w-[38px] h-[38px] rounded-xl bg-background-secondary border border-borderCustom-subtle items-center justify-center">
              <Ionicons
                name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
                size={18}
                color="#FFFFFF"
              />
            </View>
          </AnimatedPressable>
          <AnimatedPressable onPress={() => setIsEditing(!isEditing)}>
            <View className="w-[38px] h-[38px] rounded-xl bg-background-secondary border border-borderCustom-subtle items-center justify-center">
              <Ionicons name="pencil-outline" size={18} color="#FFFFFF" />
            </View>
          </AnimatedPressable>
          <AnimatedPressable onPress={handleDelete}>
            <View className="w-[38px] h-[38px] rounded-xl bg-background-secondary border border-borderCustom-subtle items-center justify-center">
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
            </View>
          </AnimatedPressable>
        </View>
      </AnimatedView>

      {/* ── FOLDER INFO ─────────────────────────────────────── */}
      <View className="px-5 mt-4 mb-5">
        {isEditing ? (
          <View className="flex-row items-center gap-2.5">
            <TextInput
              className="flex-1 text-textCustom-primary text-[22px] font-extrabold border-b-2 border-accent-base py-1"
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onSubmitEditing={handleRename}
            />
            <AnimatedPressable onPress={handleRename}>
              <View className="w-[38px] h-[38px] rounded-[10px] bg-accent-base items-center justify-center">
                <Ionicons name="checkmark" size={20} color="#0A0A0A" />
              </View>
            </AnimatedPressable>
          </View>
        ) : (
          <View className="text-textCustom-primary text-[28px] font-extrabold tracking-tight">
            {folder.name}
          </View>
        )}
        <View className="text-textCustom-tertiary text-[13px] mt-1 font-medium">
          {folderSaves.length} {folderSaves.length === 1 ? 'save' : 'saves'}
        </View>
      </View>

      {/* ── CONTENT ─────────────────────────────────────────── */}
      {folderSaves.length === 0 ? (
        <View className="flex-1 justify-center items-center gap-2 pb-[100px]">
          <Ionicons name="folder-open-outline" size={56} color="#222" />
          <View className="text-textCustom-primary text-base font-bold mt-2">
            Empty Folder
          </View>
          <View className="text-textCustom-tertiary text-[13px] text-center px-10">
            No saves have been classified here yet.
          </View>
        </View>
      ) : viewMode === 'grid' ? (
        <FlatList
          data={folderSaves}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 60 }}
          columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
          renderItem={({ item, index }) => (
            <SavePosterCard
              item={item}
              onPress={() => router.push(`/save/${item.id}`)}
              delay={index * 60}
            />
          )}
        />
      ) : (
        <FlatList
          data={folderSaves}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60 }}
          renderItem={({ item, index }) => {
            const badge = getContentTypeBadge(item);
            return (
              <AnimatedView entry="fadeInUp" delay={index * 40}>
                <SwipeableRow onDelete={() => handleDeleteSave(item.id)}>
                  <AnimatedPressable onPress={() => router.push(`/save/${item.id}`)}>
                    <View className="flex-row items-center bg-background-secondary rounded-[18px] p-3 mb-2.5 border border-borderCustom-subtle gap-3">
                      {item.thumbnailUrl && (
                        <Image
                          source={{ uri: item.thumbnailUrl }}
                          className="w-[58px] h-[72px] rounded-[10px] bg-[#222]"
                          contentFit="cover"
                        />
                      )}
                      <View className="flex-1 gap-1">
                        <View
                          className="flex-row items-center gap-[3px] self-start bg-black/40 px-[7px] py-[2px] rounded-2xl border"
                          style={{ borderColor: badge.color + '50' }}
                        >
                          <Ionicons name={badge.icon} size={9} color={badge.color} />
                          <Text style={{ color: badge.color }} className="text-[9px] font-bold">
                            {badge.label}
                          </Text>
                        </View>
                        <Text className="text-textCustom-primary text-sm font-bold leading-[19px]" numberOfLines={2}>
                          {item.title}
                        </Text>
                        <View className="text-textCustom-tertiary text-[11px]">
                          {timeAgo(item.savedAt)}
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#333" />
                    </View>
                  </AnimatedPressable>
                </SwipeableRow>
              </AnimatedView>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
