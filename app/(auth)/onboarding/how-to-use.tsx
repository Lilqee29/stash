import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { Button } from '../../../components/Button';

const STEPS = [
  {
    icon: '📱',
    title: 'Share from TikTok or Instagram',
    description: 'Tap the share button and select Stash',
  },
  {
    icon: '✨',
    title: 'AI does the work',
    description: 'We extract title, creator, and auto-tag your save',
  },
  {
    icon: '📂',
    title: 'Find anything instantly',
    description: 'Smart folders and search across all your saves',
  },
];

export default function HowToUseScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = 44; // standard iOS nav bar

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Content */}
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 32,
        }}
      >
        {/* Lottie Animation */}
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={{
            width: 200,
            height: 200,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <LottieView
            source={require('../../../assets/lottie/bookmark-pulse.json')}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
          />
        </Animated.View>

        {/* Steps */}
        <View style={{ width: '100%', gap: 24 }}>
          {STEPS.map((step, index) => (
            <Animated.View
              key={index}
              entering={FadeInRight.delay(200 + index * 150).duration(400)}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <Text style={{ fontSize: 28 }}>{step.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#FFFFFF',
                    fontFamily: 'Inter_500Medium',
                    marginBottom: 4,
                  }}
                >
                  {step.title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#888888',
                    fontFamily: 'Inter_400Regular',
                    lineHeight: 20,
                  }}
                >
                  {step.description}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Bottom */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 20,
          gap: 12,
        }}
      >
        <Button title="Got it" onPress={() => router.replace('/(tabs)/home')} />
        <Button title="Skip tutorial" onPress={() => router.replace('/(tabs)/home')} variant="ghost" />
      </View>
    </View>
  );
}
