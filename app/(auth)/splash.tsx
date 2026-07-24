import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import { Button } from '../../components/Button';

export default function SplashScreen() {
  const router = useRouter();

  // Animated values for floating effect
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  // Fade-in animations on load
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in screen content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Floating loop animations
    const createFloatAnimation = (anim: Animated.Value, delay: number, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -12,
            duration: duration,
            useNativeDriver: true,
            delay: delay,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 12,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const float1 = createFloatAnimation(floatAnim1, 0, 2400);
    const float2 = createFloatAnimation(floatAnim2, 400, 2800);
    const float3 = createFloatAnimation(floatAnim3, 800, 2600);

    float1.start();
    float2.start();
    float3.start();

    return () => {
      float1.stop();
      float2.stop();
      float3.stop();
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background-primary justify-between">
      <Animated.View 
        className="flex-1 px-6 justify-between py-8"
        style={{ opacity: fadeAnim }}
      >
        {/* Top Section — Header branding */}
        <View className="items-center mt-8">
          <Image 
            source={require('../../icon.jpeg')} 
            style={{ width: 88, height: 88, borderRadius: 24, marginBottom: 8 }} 
          />
          <Text 
            className="text-white text-[32px] font-syne mt-4 tracking-tighter" 
            style={{ fontFamily: 'Syne_800ExtraBold', letterSpacing: -0.02 }}
          >
            Stash
          </Text>
          <Text 
            className="text-textCustom-tertiary text-sm font-dmsans mt-2 text-center"
            style={{ fontFamily: 'DMSans_400Regular' }}
          >
            Personal bookmark brain for TikTok and Instagram saves.
          </Text>
        </View>

        {/* Middle Section — Slide-style preview bookmark cards floating */}
        <View className="relative w-full h-[280px] justify-center items-center my-6">
          {/* Card 1: TikTok Save preview */}
          <Animated.View
            style={{ transform: [{ translateY: floatAnim1 }] }}
            className="absolute left-2 top-0 w-[72%] bg-background-secondary border border-borderCustom-subtle p-4 rounded-2xl shadow-xl shadow-black/80 rotate-[-6deg]"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-dmsans text-textCustom-tertiary" style={{ fontFamily: 'DMSans_400Regular' }}>@motion_des</Text>
              <View className="bg-background-tertiary border border-borderCustom-medium px-2 py-0.5 rounded-full">
                <Text className="text-[8px] font-medium text-white">TikTok</Text>
              </View>
            </View>
            <Text 
              className="text-white text-xs font-dmsans leading-[18px]"
              style={{ fontFamily: 'DMSans_500Medium' }}
              numberOfLines={2}
            >
              How to create super smooth speed ramps in Premiere Pro #editing
            </Text>
            <View className="flex-row justify-between items-center mt-3 pt-2 border-t border-borderCustom-subtle/50">
              <Text className="text-[9px] text-textCustom-tertiary" style={{ fontFamily: 'DMSans_400Regular' }}>Saved 2d ago</Text>
              <Text className="text-[9px] text-accent-bright font-medium" style={{ fontFamily: 'DMSans_500Medium' }}>📁 Video Editing</Text>
            </View>
          </Animated.View>

          {/* Card 2: Instagram Save preview */}
          <Animated.View
            style={{ transform: [{ translateY: floatAnim2 }] }}
            className="absolute right-4 top-16 w-[70%] bg-background-secondary border border-borderCustom-subtle p-4 rounded-2xl shadow-2xl shadow-black/90 rotate-[4deg] z-10"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-dmsans text-textCustom-tertiary" style={{ fontFamily: 'DMSans_400Regular' }}>@design_grid</Text>
              <View className="bg-background-tertiary border border-borderCustom-medium px-2 py-0.5 rounded-full">
                <Text className="text-[8px] font-medium text-textCustom-accent">Instagram</Text>
              </View>
            </View>
            <Text 
              className="text-white text-xs font-dmsans leading-[18px]"
              style={{ fontFamily: 'DMSans_500Medium' }}
              numberOfLines={2}
            >
              Minimalist grid poster templates and typography layouts.
            </Text>
            <View className="flex-row justify-between items-center mt-3 pt-2 border-t border-borderCustom-subtle/50">
              <Text className="text-[9px] text-textCustom-tertiary" style={{ fontFamily: 'DMSans_400Regular' }}>Saved 5d ago</Text>
              <Text className="text-[9px] text-accent-bright font-medium" style={{ fontFamily: 'DMSans_500Medium' }}>📁 Inspiration</Text>
            </View>
          </Animated.View>

          {/* Card 3: TikTok Save preview (Unsorted Example) */}
          <Animated.View
            style={{ transform: [{ translateY: floatAnim3 }] }}
            className="absolute left-6 bottom-2 w-[68%] bg-background-secondary border border-borderCustom-subtle p-4 rounded-2xl shadow-lg shadow-black/80 rotate-[-2deg]"
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-[10px] font-dmsans text-textCustom-tertiary" style={{ fontFamily: 'DMSans_400Regular' }}>@color_grad</Text>
              <View className="bg-background-tertiary border border-borderCustom-medium px-2 py-0.5 rounded-full">
                <Text className="text-[8px] font-medium text-white">TikTok</Text>
              </View>
            </View>
            <Text 
              className="text-white text-xs font-dmsans leading-[18px]"
              style={{ fontFamily: 'DMSans_500Medium' }}
              numberOfLines={1}
            >
              Cinematic color grading tutorial...
            </Text>
            <View className="flex-row justify-between items-center mt-2.5 pt-1.5 border-t border-borderCustom-subtle/30">
              <Text className="text-[8px] text-textCustom-tertiary" style={{ fontFamily: 'DMSans_400Regular' }}>Saved 1w ago</Text>
              <Text className="text-[8px] text-textCustom-secondary font-medium" style={{ fontFamily: 'DMSans_400Regular' }}>📥 Unsorted</Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom Section — Swiper pagination dots, CTA, Privacy */}
        <View className="px-2 mt-4">
          {/* Swiper Pagination Dots */}
          <View className="flex-row justify-center space-x-1.5 mb-6">
            <View className="w-2 h-2 rounded-full bg-accent-base" />
            <View className="w-1.5 h-1.5 rounded-full bg-borderCustom-medium" />
            <View className="w-1.5 h-1.5 rounded-full bg-borderCustom-medium" />
            <View className="w-1.5 h-1.5 rounded-full bg-borderCustom-medium" />
          </View>

          {/* CTA Button */}
          <Button 
            title="Next" 
            onPress={() => router.push('/onboarding/how-found')} 
            variant="primary"
          />

          {/* Privacy Note */}
          <Text 
            className="text-textCustom-tertiary text-[10px] text-center mt-4 font-dmsans px-4"
            style={{ fontFamily: 'DMSans_400Regular' }}
          >
            By signing up, you agree to our Privacy Policy. All imported posts are processed securely and kept private to your account.
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
