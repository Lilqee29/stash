import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useStore } from '../../../hooks/useStore';
import { OnboardingProgress } from '../../../components/OnboardingProgress';
import { Button } from '../../../components/Button';

const OPTIONS = [
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: 'logo-tiktok',
    badgeColor: '#121212',
    iconColor: '#FFFFFF',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'logo-instagram',
    badgeColor: '#1A1A1A',
    iconColor: '#E1306C',
  },
  {
    id: 'friend',
    label: 'A Friend',
    icon: 'people-sharp',
    badgeColor: '#1A2410',
    iconColor: '#8EC934',
  },
  {
    id: 'other',
    label: 'Other Source',
    icon: 'ellipsis-horizontal-sharp',
    badgeColor: '#1A1A1A',
    iconColor: '#888888',
  },
];

function OptionItem({
  opt,
  isSelected,
  onSelect,
}: {
  opt: typeof OPTIONS[number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onSelect}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            width: '100%',
            height: 68,
            backgroundColor: '#111111',
            borderWidth: 1.2,
            borderColor: isSelected ? '#639922' : '#222222',
            borderRadius: 18,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: isSelected ? '#639922' : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isSelected ? 0.08 : 0,
            shadowRadius: 10,
            elevation: isSelected ? 2 : 0,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: opt.badgeColor,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <Ionicons name={opt.icon as any} size={18} color={opt.iconColor} />
          </View>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontFamily: isSelected ? 'Inter_500Medium' : 'Inter_400Regular',
            }}
          >
            {opt.label}
          </Text>
        </View>
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 1.5,
            borderColor: isSelected ? '#639922' : '#333333',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isSelected ? 'rgba(99,153,34,0.08)' : 'transparent',
          }}
        >
          {isSelected && (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#639922',
              }}
            />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function HowFoundScreen() {
  const router = useRouter();
  const { setHowFound } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
  };

  const handleNext = () => {
    if (selected) {
      setHowFound(
        selected === 'other'
          ? otherText || 'other'
          : selected
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/(auth)/sign-up');
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(auth)/sign-up');
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#0A0A0A',
      }}
    >
      {/* TOP HEADER PROGRESS DOCK */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 8,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 48,
          }}
        >
          <View style={{ flex: 1, marginRight: 16 }}>
            <OnboardingProgress
              currentStep={0}
              totalSteps={4}
            />
          </View>

          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.03)',
            })}
          >
            <Text
              style={{
                color: '#888888',
                fontSize: 13,
                fontFamily: 'Inter_500Medium',
              }}
            >
              Skip
            </Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: 40,
          }}
        >
          {/* HEADER TEXT block */}
          <Animated.View
            entering={FadeInDown.duration(500)}
            style={{
              marginBottom: 32,
            }}
          >
            <Text
              style={{
                color: '#8EC934',
                fontSize: 11,
                fontFamily: 'Inter_500Medium',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              Discovery
            </Text>

            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 28,
                lineHeight: 34,
                fontFamily: 'PlusJakartaSans_700Bold',
                letterSpacing: -0.5,
                marginBottom: 12,
              }}
            >
              Where did you{'\n'}hear about Stash?
            </Text>

            <Text
              style={{
                color: '#888888',
                fontSize: 14,
                lineHeight: 22,
                fontFamily: 'Inter_400Regular',
              }}
            >
              Helps us refine Stash as the ultimate bookmark engine for creators.
            </Text>
          </Animated.View>

          {/* iOS GROUPED LIST SELECTIONS */}
          <View
            style={{
              gap: 12,
              marginBottom: 24,
            }}
          >
            {OPTIONS.map((opt, index) => (
              <Animated.View key={opt.id} entering={FadeInRight.delay(index * 100).duration(400)}>
                <OptionItem
                  opt={opt}
                  isSelected={selected === opt.id}
                  onSelect={() => handleSelect(opt.id)}
                />
              </Animated.View>
            ))}
          </View>

          {/* DYNAMIC TEXTFIELD FOR "OTHER" OPTION */}
          {selected === 'other' && (
            <Animated.View
              style={{
                marginBottom: 28,
              }}
            >
              <Text
                style={{
                  color: '#888888',
                  fontSize: 12,
                  fontFamily: 'Inter_500Medium',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 8,
                  paddingLeft: 4,
                }}
              >
                Tell us more
              </Text>
              
              <TextInput
                value={otherText}
                onChangeText={setOtherText}
                placeholder="Twitter, podcast, newsletter..."
                placeholderTextColor="#555555"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                  backgroundColor: '#1A1A1A',
                  borderWidth: 1.2,
                  borderColor: isFocused ? '#639922' : '#222222',
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  fontFamily: 'Inter_400Regular',
                  color: '#FFFFFF',
                  shadowColor: isFocused ? '#639922' : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isFocused ? 0.05 : 0,
                  shadowRadius: 8,
                }}
              />
            </Animated.View>
          )}

          {/* ACTION BUTTON */}
          <View style={{ marginTop: 8 }}>
            <Button
              title="Next Step →"
              onPress={handleNext}
              disabled={!selected}
              variant="primary"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}