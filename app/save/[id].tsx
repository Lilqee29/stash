import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Share } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

import { useStore, SaveItem } from '../../hooks/useStore';
import { AnimatedPressable } from '../../components/animated/AnimatedPressable';
import { AnimatedView } from '../../components/animated/AnimatedView';

export default function SaveDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const saves = useStore((s) => s.saves);
  const folders = useStore((s) => s.folders);
  const moveSaveToFolder = useStore((s) => s.moveSaveToFolder);
  const addFolder = useStore((s) => s.addFolder);
  const deleteSave = useStore((s) => s.deleteSave);

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [newFolderMode, setNewFolderMode] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const scrollY = useSharedValue(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const item = useMemo(() => saves.find((s: SaveItem) => s.id === id), [saves, id]);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-200, 0, 200],
      [1.2, 1, 0.8],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollY.value,
      [-100, 0, 100],
      [1, 1, 0],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }], opacity };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 200],
      [0, -80],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary">
        <View className="flex-1 justify-center px-5">
          <View className="h-[180px] rounded-[20px] bg-background-secondary mb-[18px]" />
          <View className="h-4 rounded-[10px] bg-background-secondary mb-3" />
          <View className="w-[55%] h-4 rounded-[10px] bg-background-secondary mb-3" />
          <View className="h-4 rounded-[10px] bg-background-secondary mt-2.5" />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary items-center justify-center">
        <View className="text-textCustom-primary text-base">Save not found.</View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my stash: ${item.title}\nSaved from ${item.platform.toUpperCase()}\nLink: ${item.url}`,
        url: item.url,
      });
    } catch (error) {
      console.error('Error sharing item:', error);
    }
  };

  const handleDelete = () => {
    deleteSave(item.id);
    router.back();
  };

  // ─── MOVIE LAYOUT ──────────────────────────────────────────────────────────
  if (item.contentType === 'movie') {
    return (
      <View className="flex-1 bg-background-primary">
        <ScrollView
          onScroll={(e) => {
            scrollY.value = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        >
          {/* Hero Poster */}
          <Animated.View style={headerAnimatedStyle} className="h-[380px] justify-between">
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?q=80&w=600&auto=format&fit=crop' }}
              className="absolute inset-0"
              contentFit="cover"
            />
            <LinearGradient
              colors={['rgba(10,10,10,0.1)', 'rgba(10,10,10,0.8)', '#0A0A0A']}
              className="absolute inset-0"
            />

            <SafeAreaView edges={['top']} className="flex-row justify-between px-4 py-3">
              <AnimatedPressable onPress={() => router.back()}>
                <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center">
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </View>
              </AnimatedPressable>
              <View className="flex-row gap-3">
                <AnimatedPressable onPress={handleShare}>
                  <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center">
                    <Ionicons name="share-outline" size={22} color="#fff" />
                  </View>
                </AnimatedPressable>
                <AnimatedPressable onPress={handleDelete}>
                  <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center">
                    <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
                  </View>
                </AnimatedPressable>
              </View>
            </SafeAreaView>

            <View className="px-5 pb-5">
              <View className="text-textCustom-primary text-[32px] font-extrabold w-[70%] leading-[36px] tracking-tight">
                {item.title}
              </View>
              <View className="flex-row items-center mt-2 gap-1.5">
                <Ionicons name="film-outline" size={14} color="#888" />
                <View className="text-textCustom-secondary text-[13px]">
                  {item.genre} • {item.rating} • {item.duration}
                </View>
              </View>

              <View className="flex-row items-center mt-5 justify-between">
                <AnimatedPressable onPress={() => {}}>
                  <View className="flex-row items-center bg-background-secondary px-4 py-3 rounded-xl gap-2 border border-white/[0.07]">
                    <Ionicons name="play-outline" size={16} color="#fff" />
                    <View className="text-textCustom-primary text-sm font-semibold">
                      Watch trailer
                    </View>
                  </View>
                </AnimatedPressable>
                <View className="absolute right-0 bottom-[-60px] w-[90px] h-[135px] rounded-lg overflow-hidden border border-white/10">
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=150&auto=format&fit=crop' }}
                    className="flex-1"
                    contentFit="cover"
                  />
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={contentAnimatedStyle}>
            {/* Social Stats & Collections */}
            <View className="flex-row items-center px-5 mt-4 gap-3">
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-[#333] border-2 border-background-primary" />
                <View className="w-6 h-6 rounded-full bg-[#555] border-2 border-background-primary -ml-2" />
                <View className="text-textCustom-secondary text-xs ml-1.5">
                  {item.savesCount} saves
                </View>
              </View>
              <View className="flex-row items-center bg-sky-500/15 px-2 py-1 rounded-xl gap-1">
                <Ionicons name="diamond" size={12} color="#4FD1FF" />
                <View className="text-sky-400 text-xs font-bold">
                  {item.diamonds}
                </View>
              </View>
              <AnimatedPressable onPress={() => setIsCollectionModalOpen(true)}>
                <View className="flex-row items-center border border-white/10 px-3 py-1.5 rounded-full gap-1">
                  <Ionicons name="add" size={14} color="#fff" />
                  <View className="text-textCustom-primary text-xs font-semibold">
                    Collections
                  </View>
                </View>
              </AnimatedPressable>
            </View>

            {/* Watched / Wanna Toggles */}
            <View className="flex-row px-5 mt-6 gap-3">
              <AnimatedPressable onPress={() => {}}>
                <View className="flex-1 flex-row items-center justify-center bg-background-secondary py-3.5 rounded-3xl gap-1.5">
                  <Ionicons name="chevron-forward" size={16} color="#888" />
                  <View className="text-textCustom-secondary text-sm font-semibold">
                    Watched it?
                  </View>
                </View>
              </AnimatedPressable>
              <AnimatedPressable onPress={() => {}}>
                <View className="flex-1 flex-row items-center justify-center bg-background-secondary border border-white/10 py-3.5 rounded-3xl gap-1.5">
                  <Ionicons name="megaphone-outline" size={16} color="#fff" />
                  <View className="text-textCustom-primary text-sm font-semibold">
                    Wanna
                  </View>
                </View>
              </AnimatedPressable>
            </View>

            {/* Description */}
            <Text className="text-textCustom-secondary text-sm leading-[22px] px-5 mt-6" numberOfLines={4}>
              {item.description}{' '}
              <Text className="text-textCustom-primary font-bold">Read More</Text>
            </Text>

            {/* Metadata List */}
            <View className="px-5 mt-5">
              <View className="flex-row items-center py-4 border-b border-background-secondary gap-3">
                <Ionicons name="calendar-outline" size={18} color="#888" />
                <View className="text-textCustom-secondary text-sm">
                  Released on {item.releaseDate}
                </View>
              </View>
              <View className="flex-row items-center py-4 gap-3">
                <Ionicons name="videocam-outline" size={18} color="#888" />
                <View className="text-textCustom-secondary text-sm">
                  Directed by {item.director}
                </View>
              </View>
            </View>

            {/* Cast */}
            <View className="mt-8">
              <View className="text-textCustom-primary text-base font-bold px-5 mb-4">
                Cast
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
              >
                {item.cast?.map((actor: any, idx: number) => (
                  <AnimatedView key={idx} entry="fadeInUp" delay={idx * 80} className="items-center w-20">
                    <Image
                      source={{ uri: actor.image }}
                      className="w-[70px] h-[90px] rounded-[40px] bg-[#333] mb-2"
                      contentFit="cover"
                    />
                    <View className="text-textCustom-primary text-[13px] font-semibold text-center">
                      {actor.name}
                    </View>
                    <View className="text-textCustom-tertiary text-[11px] text-center mt-0.5">
                      {actor.role}
                    </View>
                  </AnimatedView>
                ))}
              </ScrollView>
            </View>

            {/* Available On */}
            <View className="mt-8">
              <View className="text-textCustom-primary text-base font-bold px-5 mb-4">
                Available on
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
              >
                {item.availableOn?.map((plat: any, idx: number) => (
                  <AnimatedView key={idx} entry="fadeInUp" delay={idx * 80} className="items-center">
                    <View className="w-[60px] h-[60px] rounded-full bg-[#0A84FF]" />
                    <View className="text-textCustom-secondary text-xs mt-1.5">
                      {plat.platform}
                    </View>
                  </AnimatedView>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Floating Input Bar */}
        <View className="absolute bottom-0 left-0 right-0 px-5 py-4 pb-10 bg-background-primary border-t border-background-secondary flex-row items-center gap-3">
          <TextInput
            className="flex-1 h-11 bg-background-secondary rounded-full px-4 text-textCustom-primary border border-borderCustom-subtle"
            placeholder="Add a note..."
            placeholderTextColor="#666"
          />
          <AnimatedPressable onPress={() => {}}>
            <View className="w-11 h-11 rounded-full bg-[#333] items-center justify-center">
              <Ionicons name="sparkles" size={18} color="#0A0A0A" />
            </View>
          </AnimatedPressable>
        </View>

        {/* Collection Modal */}
        {/* Collection modal would go here */}
      </View>
    );
  }

  // ─── LIST / VIDEO LAYOUT ────────────────────────────────────────────────────
  if (item.contentType === 'list') {
    return (
      <View className="flex-1 bg-background-primary">
        {/* Video Hero */}
        <View className="h-[360px] bg-background-primary items-center justify-center overflow-hidden">
          {item.thumbnailUrl && (
            <Image
              source={{ uri: item.thumbnailUrl }}
              className="absolute inset-0 opacity-35"
              contentFit="cover"
              blurRadius={20}
            />
          )}
          <View className="absolute inset-0 bg-black/55" />

          <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 flex-row justify-between px-4 py-3">
            <AnimatedPressable onPress={() => router.back()}>
              <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center">
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </View>
            </AnimatedPressable>
            <View className="flex-row gap-3">
              <AnimatedPressable onPress={handleShare}>
                <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center">
                  <Ionicons name="share-outline" size={22} color="#fff" />
                </View>
              </AnimatedPressable>
              <AnimatedPressable onPress={() => setIsCollectionModalOpen(true)}>
                <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center">
                  <Ionicons name="bookmark" size={22} color="#fff" />
                </View>
              </AnimatedPressable>
            </View>
          </SafeAreaView>

          <View className="w-[68%] h-[240px] rounded-[22px] overflow-hidden bg-[#1A1A1A] border border-white/[0.12] shadow-black/60">
            {item.thumbnailUrl ? (
              <Image
                source={{ uri: item.thumbnailUrl }}
                className="absolute inset-0"
                contentFit="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center bg-[#1A1A1A]">
                <Ionicons name="play-circle-outline" size={48} color="#666" />
              </View>
            )}
            <View className="absolute bottom-2.5 left-2.5 bg-black/60 rounded-xl w-7 h-7 items-center justify-center">
              <Ionicons name="volume-mute" size={14} color="#fff" />
            </View>
          </View>

          <View className="absolute bottom-4 flex-row gap-1.5 items-center">
            <View className="w-[18px] h-[6px] rounded-[3px] bg-white" />
            <View className="w-[6px] h-[6px] rounded-[3px] bg-white/35" />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
          <View className="px-5 mt-2.5">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="logo-instagram" size={14} color="#E1306C" />
              <View className="text-textCustom-secondary text-[13px]">
                {item.creator}
              </View>
            </View>
            <View className="text-textCustom-primary text-[28px] font-extrabold mt-3">
              {item.title}
            </View>

            <View className="flex-row items-center mt-4">
              <View className="flex-row items-center bg-sky-500/10 px-3 py-1.5 rounded-2xl gap-1.5 border border-sky-500/20">
                <Ionicons name="code-slash" size={12} color="#4FD1FF" />
                <View className="text-sky-400 text-xs font-semibold">
                  Software
                </View>
              </View>
              <AnimatedPressable onPress={() => setIsCollectionModalOpen(true)}>
                <View className="ml-auto">
                  <Ionicons name="bookmark" size={24} color="#fff" />
                </View>
              </AnimatedPressable>
            </View>

            <View className="flex-row items-center mt-6">
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-[#333] border-2 border-background-primary" />
                <View className="w-6 h-6 rounded-full bg-[#555] border-2 border-background-primary -ml-2" />
              </View>
              <View className="text-textCustom-secondary text-xs ml-1.5">
                {item.savesCount} saves
              </View>
            </View>
          </View>

          <View className="px-5 mt-6 gap-5">
            {item.extractedText?.map((txt: any, idx: number) => (
              <AnimatedView key={idx} entry="fadeInUp" delay={idx * 80} className="flex-row items-start gap-3">
                <Ionicons name={txt.icon as any} size={20} color="#fff" />
                <View className="flex-1 text-textCustom-secondary text-sm leading-5">
                  <View className="text-textCustom-primary font-bold">
                    {txt.title}
                  </View>{' '}
                  - {txt.description}
                </View>
              </AnimatedView>
            ))}
            <AnimatedPressable onPress={() => {}}>
              <View className="self-end mt-3">
                <View className="text-textCustom-tertiary text-xs font-semibold">
                  Show Original
                </View>
              </View>
            </AnimatedPressable>
          </View>

          <View className="mt-8 px-5">
            <View className="flex-row justify-between items-center mb-4">
              <View className="text-textCustom-secondary text-[13px] font-semibold">
                Things Albo found
              </View>
              <AnimatedPressable onPress={() => {}}>
                <View className="flex-row items-center bg-background-secondary px-2.5 py-1 rounded-xl gap-1">
                  <Ionicons name="add" size={12} color="#fff" />
                  <View className="text-textCustom-primary text-[11px] font-semibold">
                    Add
                  </View>
                </View>
              </AnimatedPressable>
            </View>

            {item.foundEntities?.map((entity: any, idx: number) => (
              <AnimatedView key={idx} entry="fadeInUp" delay={idx * 80} className="flex-row items-center bg-background-secondary rounded-2xl p-3 mb-3 border border-borderCustom-subtle">
                <Image
                  source={{ uri: entity.image }}
                  className="w-[60px] h-[60px] rounded-[10px] bg-[#333]"
                  contentFit="cover"
                />
                <View className="flex-1 ml-3">
                  <View className="text-textCustom-primary text-[15px] font-bold">
                    {entity.title}
                  </View>
                  <View className="flex-row items-center mt-1 gap-1">
                    <Ionicons name="grid-outline" size={10} color="#888" />
                    <View className="text-textCustom-secondary text-xs">
                      {entity.category}
                    </View>
                    <View className="text-textCustom-tertiary text-[11px] ml-1.5">
                      {entity.count} saves
                    </View>
                  </View>
                  <View className="flex-row items-center mt-1.5 gap-1.5">
                    <View className="flex-row items-center">
                      <View className="w-4 h-4 rounded-full bg-[#333] border border-background-primary" />
                      <View className="w-4 h-4 rounded-full bg-[#555] border border-background-primary -ml-1" />
                    </View>
                    <Text className="text-textCustom-tertiary text-[10px] flex-1" numberOfLines={1}>
                      Razal, Leticia & 5 others saved t...
                    </Text>
                  </View>
                </View>
                <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
              </AnimatedView>
            ))}
          </View>
        </ScrollView>

        {/* Floating Input Bar */}
        <View className="absolute bottom-0 left-0 right-0 px-5 py-4 pb-10 bg-background-primary border-t border-background-secondary flex-row items-center gap-3">
          <TextInput
            className="flex-1 h-11 bg-background-secondary rounded-full px-4 text-textCustom-primary border border-borderCustom-subtle"
            placeholder="Add a note..."
            placeholderTextColor="#666"
          />
          <AnimatedPressable onPress={() => {}}>
            <View className="w-11 h-11 rounded-full bg-[#333] items-center justify-center">
              <Ionicons name="sparkles" size={18} color="#0A0A0A" />
            </View>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  // ─── DEFAULT LAYOUT ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <View className="flex-row justify-between px-4 py-3">
        <AnimatedPressable onPress={() => router.back()}>
          <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center">
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </View>
        </AnimatedPressable>
        <View className="flex-row gap-3">
          <AnimatedPressable onPress={handleShare}>
            <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center">
              <Ionicons name="share-outline" size={22} color="#fff" />
            </View>
          </AnimatedPressable>
          <AnimatedPressable onPress={handleDelete}>
            <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center">
              <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
            </View>
          </AnimatedPressable>
        </View>
      </View>
      <View className="flex-1 p-5">
        <View className="text-textCustom-primary text-2xl font-bold">{item.title}</View>
        <View className="text-textCustom-secondary text-sm mt-2">URL: {item.url}</View>
      </View>
    </SafeAreaView>
  );
}
