import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Share } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
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
import { supabase } from '../../lib/supabase';
import { AnimatedPressable } from '../../components/animated/AnimatedPressable';
import { AnimatedView } from '../../components/animated/AnimatedView';
import { EnrichmentCard, EnrichmentShimmer } from '../../components/ui/EnrichmentCard';

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

  // ── Enrichment polling: re-fetch save data when screen focuses ──
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [enrichProgress, setEnrichProgress] = useState(0);
  const startTime = useRef<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      // Re-fetch save from Supabase when screen focuses
      const refreshSave = async () => {
        try {
          const { data } = await supabase
            .from('saves')
            .select('enrichment')
            .eq('id', id)
            .single();
          if (data?.enrichment) {
            // Enrichment arrived — update local state
            useStore.setState((state) => ({
              saves: state.saves.map((s) =>
                s.id === id ? { ...s, enrichment: data.enrichment } : s
              ),
            }));
            if (pollRef.current) clearInterval(pollRef.current);
            setEnrichProgress(100);
          }
        } catch {
          // Silent — will retry on next poll
        }
      };

      // If enrichment is pending, poll every 3 seconds
      if (item && !item.enrichment) {
        // Only set start time if not already set (prevents countdown restart)
        if (startTime.current === null) {
          startTime.current = Date.now();
        }

        // Check immediately
        refreshSave();

        pollRef.current = setInterval(() => {
          const elapsed = (Date.now() - startTime.current!) / 1000;
          // Progress: 0% at 0s, 90% at 25s (cap at 90% until confirmed)
          const progress = Math.min(90, (elapsed / 25) * 90);
          setEnrichProgress(progress);
          refreshSave();
        }, 3000);
      }

      return () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
    }, [id, item?.enrichment])
  );

  // Reset start time when enrichment arrives
  useEffect(() => {
    if (item?.enrichment) {
      startTime.current = null;
      setEnrichProgress(100);
    }
  }, [item?.enrichment]);

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
        <Text className="text-textCustom-primary text-base">Save not found.</Text>
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

  // ─── ENRICHMENT LAYOUT (Gemini-enriched content) ──────────────────────────
  if (item.enrichment) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          {/* Hero Thumbnail */}
          {item.thumbnailUrl && (
            <View style={{ height: 280, position: 'relative' }}>
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 120,
                  backgroundColor: 'transparent',
                }}
              />
            </View>
          )}

          {/* Top Nav */}
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 }}>
              <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </Pressable>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable onPress={handleShare} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="share-outline" size={18} color="#fff" />
                </Pressable>
                <Pressable onPress={handleDelete} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="trash-outline" size={18} color="#FF453A" />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>

          {/* Content */}
          <View style={{ marginTop: item.thumbnailUrl ? -20 : 0, paddingHorizontal: 0 }}>
            {/* Title + Type Badge */}
            <View style={{ paddingHorizontal: 20, marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <View style={{ backgroundColor: 'rgba(142,201,52,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#8EC934', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    {item.enrichment.type.replace('_', ' ')}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, fontFamily: 'Inter_400Regular', color: '#555' }}>
                  {item.platform}
                </Text>
              </View>
              <Text style={{ fontSize: 22, fontFamily: 'PlusJakartaSans_700Bold', color: '#fff', letterSpacing: -0.4, lineHeight: 28 }}>
                {item.enrichment.type === 'recipe' && item.enrichment.recipe_name
                  ? item.enrichment.recipe_name
                  : item.title}
              </Text>
            </View>

            {/* Enrichment Content */}
            <EnrichmentCard enrichment={item.enrichment} />

            {/* Source Link */}
            <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
              <Pressable
                onPress={() => {}}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 }}
              >
                <Ionicons name="open-outline" size={14} color="#8EC934" />
                <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: '#8EC934' }}>
                  Open original
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── ENRICHMENT PENDING (no enrichment yet — show progress) ────────────────
  if (item.contentType === 'video' || item.contentType === 'reel' || item.contentType === 'post') {
    const elapsed = startTime.current ? (Date.now() - startTime.current) / 1000 : 0;
    const eta = Math.max(0, Math.ceil(25 - elapsed));

    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          {/* Top Nav */}
          <SafeAreaView edges={['top']} style={{ position: 'relative', zIndex: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 }}>
              <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </Pressable>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable onPress={handleShare} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="share-outline" size={18} color="#fff" />
                </Pressable>
                <Pressable onPress={handleDelete} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="trash-outline" size={18} color="#FF453A" />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>

          {/* Hero Thumbnail */}
          {item.thumbnailUrl && (
            <View style={{ height: 260, position: 'relative', marginTop: -44 }}>
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 120,
                  backgroundColor: 'transparent',
                }}
              />
            </View>
          )}

          {/* Content — positioned below hero */}
          <View style={{ paddingHorizontal: 20, marginTop: item.thumbnailUrl ? -24 : 60 }}>
            {/* Title */}
            <Text style={{ fontSize: 22, fontFamily: 'PlusJakartaSans_700Bold', color: '#fff', letterSpacing: -0.4, lineHeight: 28, marginBottom: 4 }}>
              {item.title}
            </Text>
            {item.creator && (
              <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: '#888', marginBottom: 20 }}>
                @{item.creator}
              </Text>
            )}
            {!item.creator && <View style={{ height: 20 }} />}

            {/* Progress Card */}
            <View
              style={{
                backgroundColor: '#141414',
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: '#222',
              }}
            >
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(142,201,52,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="sparkles" size={16} color="#8EC934" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' }}>
                      Analyzing content
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: '#666', marginTop: 1 }}>
                      {eta > 0 ? `~${eta}s remaining` : 'Almost done...'}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: '#8EC934' }}>
                  {Math.round(enrichProgress)}%
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={{ height: 4, borderRadius: 2, backgroundColor: '#222', overflow: 'hidden', marginBottom: 16 }}>
                <View
                  style={{
                    height: '100%',
                    borderRadius: 2,
                    backgroundColor: '#8EC934',
                    width: `${enrichProgress}%`,
                  }}
                />
              </View>

              {/* Steps */}
              <View style={{ gap: 10 }}>
                {[
                  { label: 'Fetching page content', done: enrichProgress > 15 },
                  { label: 'Classifying content type', done: enrichProgress > 35 },
                  { label: 'Extracting key information', done: enrichProgress > 55 },
                  { label: 'Building enrichment card', done: enrichProgress > 80 },
                ].map((step, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons
                      name={step.done ? 'checkmark-circle' : 'ellipse-outline'}
                      size={16}
                      color={step.done ? '#8EC934' : '#333'}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: 'Inter_400Regular',
                        color: step.done ? '#aaa' : '#444',
                      }}
                    >
                      {step.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Tip */}
            <Text style={{ fontSize: 12, fontFamily: 'Inter_400Regular', color: '#555', textAlign: 'center', marginTop: 16 }}>
              You can leave this screen — enrichment continues in the background
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

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
              <Text className="text-textCustom-primary text-[32px] font-extrabold w-[70%] leading-[36px] tracking-tight">
                {item.title}
              </Text>
              <View className="flex-row items-center mt-2 gap-1.5">
                <Ionicons name="film-outline" size={14} color="#888" />
                <Text className="text-textCustom-secondary text-[13px]">
                  {item.genre} • {item.rating} • {item.duration}
                </Text>
              </View>

              <View className="flex-row items-center mt-5 justify-between">
                <AnimatedPressable onPress={() => {}}>
                  <View className="flex-row items-center bg-background-secondary px-4 py-3 rounded-xl gap-2 border border-white/[0.07]">
                    <Ionicons name="play-outline" size={16} color="#fff" />
                    <Text className="text-textCustom-primary text-sm font-semibold">
                      Watch trailer
                    </Text>
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
                <Text className="text-textCustom-secondary text-xs ml-1.5">
                  {item.savesCount} saves
                </Text>
              </View>
              <View className="flex-row items-center bg-sky-500/15 px-2 py-1 rounded-xl gap-1">
                <Ionicons name="diamond" size={12} color="#4FD1FF" />
                <Text className="text-sky-400 text-xs font-bold">
                  {item.diamonds}
                </Text>
              </View>
              <AnimatedPressable onPress={() => setIsCollectionModalOpen(true)}>
                <View className="flex-row items-center border border-white/10 px-3 py-1.5 rounded-full gap-1">
                  <Ionicons name="add" size={14} color="#fff" />
                  <Text className="text-textCustom-primary text-xs font-semibold">
                    Collections
                  </Text>
                </View>
              </AnimatedPressable>
            </View>

            {/* Watched / Wanna Toggles */}
            <View className="flex-row px-5 mt-6 gap-3">
              <AnimatedPressable onPress={() => {}}>
                <View className="flex-1 flex-row items-center justify-center bg-background-secondary py-3.5 rounded-3xl gap-1.5">
                  <Ionicons name="chevron-forward" size={16} color="#888" />
                  <Text className="text-textCustom-secondary text-sm font-semibold">
                    Watched it?
                  </Text>
                </View>
              </AnimatedPressable>
              <AnimatedPressable onPress={() => {}}>
                <View className="flex-1 flex-row items-center justify-center bg-background-secondary border border-white/10 py-3.5 rounded-3xl gap-1.5">
                  <Ionicons name="megaphone-outline" size={16} color="#fff" />
                  <Text className="text-textCustom-primary text-sm font-semibold">
                    Wanna
                  </Text>
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
                <Text className="text-textCustom-secondary text-sm">
                  Released on {item.releaseDate}
                </Text>
              </View>
              <View className="flex-row items-center py-4 gap-3">
                <Ionicons name="videocam-outline" size={18} color="#888" />
                <Text className="text-textCustom-secondary text-sm">
                  Directed by {item.director}
                </Text>
              </View>
            </View>

            {/* Cast */}
            <View className="mt-8">
              <Text className="text-textCustom-primary text-base font-bold px-5 mb-4">
                Cast
              </Text>
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
                    <Text className="text-textCustom-primary text-[13px] font-semibold text-center">
                      {actor.name}
                    </Text>
                    <Text className="text-textCustom-tertiary text-[11px] text-center mt-0.5">
                      {actor.role}
                    </Text>
                  </AnimatedView>
                ))}
              </ScrollView>
            </View>

            {/* Available On */}
            <View className="mt-8">
              <Text className="text-textCustom-primary text-base font-bold px-5 mb-4">
                Available on
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
              >
                {item.availableOn?.map((plat: any, idx: number) => (
                  <AnimatedView key={idx} entry="fadeInUp" delay={idx * 80} className="items-center">
                    <View className="w-[60px] h-[60px] rounded-full bg-[#0A84FF]" />
                    <Text className="text-textCustom-secondary text-xs mt-1.5">
                      {plat.platform}
                    </Text>
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
              <Text className="text-textCustom-secondary text-[13px]">
                {item.creator}
              </Text>
            </View>
            <Text className="text-textCustom-primary text-[28px] font-extrabold mt-3">
              {item.title}
            </Text>

            <View className="flex-row items-center mt-4">
              <View className="flex-row items-center bg-sky-500/10 px-3 py-1.5 rounded-2xl gap-1.5 border border-sky-500/20">
                <Ionicons name="code-slash" size={12} color="#4FD1FF" />
                <Text className="text-sky-400 text-xs font-semibold">
                  Software
                </Text>
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
              <Text className="text-textCustom-secondary text-xs ml-1.5">
                {item.savesCount} saves
              </Text>
            </View>
          </View>

          <View className="px-5 mt-6 gap-5">
            {item.extractedText?.map((txt: any, idx: number) => (
              <AnimatedView key={idx} entry="fadeInUp" delay={idx * 80} className="flex-row items-start gap-3">
                <Ionicons name={txt.icon as any} size={20} color="#fff" />
                <View className="flex-1">
                  <Text className="text-textCustom-secondary text-sm leading-5">
                    <Text className="text-textCustom-primary font-bold">
                      {txt.title}
                    </Text>{' '}
                    - {txt.description}
                  </Text>
                </View>
              </AnimatedView>
            ))}
            <AnimatedPressable onPress={() => {}}>
              <View className="self-end mt-3">
                <Text className="text-textCustom-tertiary text-xs font-semibold">
                  Show Original
                </Text>
              </View>
            </AnimatedPressable>
          </View>

          <View className="mt-8 px-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-textCustom-secondary text-[13px] font-semibold">
                Things Albo found
              </Text>
              <AnimatedPressable onPress={() => {}}>
                <View className="flex-row items-center bg-background-secondary px-2.5 py-1 rounded-xl gap-1">
                  <Ionicons name="add" size={12} color="#fff" />
                  <Text className="text-textCustom-primary text-[11px] font-semibold">
                    Add
                  </Text>
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
                  <Text className="text-textCustom-primary text-[15px] font-bold">
                    {entity.title}
                  </Text>
                  <View className="flex-row items-center mt-1 gap-1">
                    <Ionicons name="grid-outline" size={10} color="#888" />
                    <Text className="text-textCustom-secondary text-xs">
                      {entity.category}
                    </Text>
                    <Text className="text-textCustom-tertiary text-[11px] ml-1.5">
                      {entity.count} saves
                    </Text>
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
        <Text className="text-textCustom-primary text-2xl font-bold">{item.title}</Text>
        <Text className="text-textCustom-secondary text-sm mt-2">URL: {item.url}</Text>
      </View>
    </SafeAreaView>
  );
}
