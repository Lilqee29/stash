import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Dimensions, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Button } from '../../../components/Button';

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
];

function Dot({ isActive }: { isActive: boolean }) {
  const scale = useSharedValue(isActive ? 1 : 0.7);

  React.useEffect(() => {
    scale.value = withSpring(isActive ? 1 : 0.7, {
      damping: 15,
      stiffness: 200,
    });
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: isActive ? 24 : 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: isActive ? '#C4FB46' : '#333333',
          marginHorizontal: 4,
        },
        animatedStyle,
      ]}
      layout={Layout.springify()}
    />
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  const lottieRefs = useRef<(LottieView | null)[]>([]);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleIndexChanged = (index: number) => {
    setCurrentIndex(index);
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
      router.push('/(auth)/onboarding/how-found');
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/onboarding/how-found');
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
      {showSkip && !isLastSlide && (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, alignItems: 'flex-end' }}
        >
          <Pressable onPress={handleSkip}>
            <Text
              style={{ color: '#888888', fontSize: 15, fontFamily: 'Inter_500Medium' }}
            >
              Skip
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: showSkip ? 8 : insets.top + 16, paddingBottom: 8 }}>
        {SLIDES.map((_, index) => (
          <Dot key={index} isActive={index === currentIndex} />
        ))}
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
            <View style={{ width: 280, height: 280, alignItems: 'center', justifyContent: 'center' }}>
              <LottieView
                ref={(ref) => { lottieRefs.current[index] = ref; }}
                source={slide.lottieSource}
                autoPlay={index === 0}
                loop
                style={{ width: 280, height: 280 }}
              />
            </View>

            {/* Text with staggered animation */}
            <View style={{ alignItems: 'center', marginTop: 48 }}>
              {index === currentIndex && (
                <>
                  <Animated.Text
                    entering={FadeInDown.delay(100).duration(500)}
                    style={{
                      fontSize: 32,
                      color: '#FFFFFF',
                      textAlign: 'center',
                      fontFamily: 'PlusJakartaSans_800ExtraBold',
                      lineHeight: 40,
                    }}
                  >
                    {slide.title}
                  </Animated.Text>
                  <Animated.Text
                    entering={FadeInDown.delay(200).duration(500)}
                    style={{
                      fontSize: 16,
                      color: '#888888',
                      textAlign: 'center',
                      fontFamily: 'Inter_400Regular',
                      lineHeight: 24,
                      marginTop: 16,
                      maxWidth: 300,
                    }}
                  >
                    {slide.subtitle}
                  </Animated.Text>
                </>
              )}
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
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Button
            title={isLastSlide ? 'Get Started' : 'Next'}
            onPress={handleNext}
          />
        </Animated.View>
      </View>
    </View>
  );
}
