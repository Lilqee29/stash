import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(
      300,
      withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    translateY.value = withDelay(
      300,
      withTiming(0, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );

    const timer = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View style={[animatedStyle, { alignItems: 'center' }]}>
          <Image
            source={require('../../icon.jpeg')}
            style={{ width: 88, height: 88, borderRadius: 24, marginBottom: 16 }}
          />
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 32,
              fontFamily: 'PlusJakartaSans_800ExtraBold',
              letterSpacing: -0.02,
            }}
          >
            Stash
          </Text>
          <Text
            style={{
              color: '#888888',
              fontSize: 14,
              fontFamily: 'Inter_400Regular',
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            Personal bookmark brain for TikTok and Instagram saves.
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}