import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Dimensions, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
// useHeaderHeight removed: not available from @react-navigation/elements in SDK 56+
// Auth screens use a standard 44pt nav bar height

import { Button } from '../../../components/Button';
import { OnboardingProgress } from '../../../components/OnboardingProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    lottieSource: require('../../../assets/lottie/brain-bookmark.json'),
    title: 'A unified brain\nfor your saved content',
    subtitle: 'TikTok and Instagram saves live in one intelligent workspace. Never lose a great find again.',
  },
  {
    id: '2',
    lottieSource: require('../../../assets/lottie/folder-sort.json'),
    title: 'Auto-Organized\ninto Smart Folders',
    subtitle: 'AI understands your saves and groups them by topic, mood, or intent. Zero effort required.',
  },
  {
    id: '3',
    lottieSource: require('../../../assets/lottie/tap-save.json'),
    title: 'Save with\nOne Tap',
    subtitle: 'Share from TikTok or Instagram and Stash handles the rest — title, creator, and AI tags.',
  },
  {
    id: '4',
    lottieSource: require('../../../assets/lottie/onboarding-success.json'),
    title: 'You are\nAll Set!',
    subtitle: 'Your personal save brain is ready. Start exploring or import your existing collection.',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = 44; // standard iOS nav bar
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const lottieRefs = useRef<(LottieView | null)[]>([]);

  const handleIndexChanged = (index: number) => {
    setCurrentIndex(index);

    // Play current animation, reset others
    lottieRefs.current.forEach((ref, i) => {
      if (ref) {
        if (i === index) {
          ref.reset();
          ref.play();
        } else {
          ref.pause();
        }
      }
    });
  };

  const scrollToIndex = (index: number) => {
    if (isAnimating || index < 0 || index >= SLIDES.length) return;
    setIsAnimating(true);
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setCurrentIndex(index);
    handleIndexChanged(index);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollToIndex(currentIndex + 1);
    } else {
      router.push('/import');
    }
  };

  const handleSkip = () => {
    router.push('/import');
  };

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (index !== currentIndex) {
      handleIndexChanged(index);
    }
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Skip button */}
      {!isLastSlide && (
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, alignItems: 'flex-end' }}>
          <Pressable onPress={handleSkip}>
            <Text
              style={{ color: '#888888', fontSize: 15, fontFamily: 'DMSans_400Regular' }}
            >
              Skip
            </Text>
          </Pressable>
        </View>
      )}

      {/* Progress */}
      <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
        <OnboardingProgress currentStep={currentIndex} totalSteps={SLIDES.length} />
      </View>

      {/* Swiper */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ width: SCREEN_WIDTH * SLIDES.length }}
      >
        {SLIDES.map((slide, index) => (
          <View
            key={slide.id}
            style={{
              width: SCREEN_WIDTH,
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 32,
            }}
          >
            {/* Lottie Animation */}
            <View
              style={{
                width: 280,
                height: 280,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LottieView
                ref={(ref) => { lottieRefs.current[index] = ref; }}
                source={slide.lottieSource}
                autoPlay={index === 0}
                loop
                style={{ width: 280, height: 280 }}
              />
            </View>

            {/* Text */}
            <View style={{ alignItems: 'center', marginTop: 48 }}>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: '800',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  fontFamily: 'Syne_800ExtraBold',
                  lineHeight: 40,
                }}
              >
                {slide.title}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: '#888888',
                  textAlign: 'center',
                  fontFamily: 'DMSans_400Regular',
                  lineHeight: 24,
                  marginTop: 16,
                  maxWidth: 300,
                }}
              >
                {slide.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 20,
          paddingTop: 16,
        }}
      >
        <Button
          title={isLastSlide ? 'Start Importing' : 'Next'}
          onPress={handleNext}
          loading={false}
          disabled={false}
        />
      </View>
    </View>
  );
}
