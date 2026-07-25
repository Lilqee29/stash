# Onboarding & Splash Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the onboarding flow with a clean auto-advancing splash, Reanimated-powered transitions, and Zustand-gated routing for first-launch detection.

**Architecture:** Zustand persist middleware stores `hasCompletedOnboarding` in AsyncStorage. Root layout conditionally renders `(auth)` or `(tabs)` group. All onboarding screens use Reanimated for animations instead of React Native Animated API.

**Tech Stack:** React Native Reanimated 4.5.0, Lottie React Native, Zustand 5 with persist middleware, Expo Router, NativeWind

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `hooks/useStore.ts` | Modify | Add `hasCompletedOnboarding`, `completeOnboarding`, persist middleware |
| `app/_layout.tsx` | Modify | Gate `(auth)` vs `(tabs)` based on onboarding state |
| `app/index.tsx` | Modify | Conditional redirect based on onboarding state |
| `app/(auth)/splash.tsx` | Rewrite | Auto-advancing splash with Reanimated fade-in |
| `app/(auth)/onboarding/index.tsx` | Rewrite | 3 slides, Reanimated transitions, dot indicators |
| `app/(auth)/onboarding/how-found.tsx` | Polish | Add Reanimated transitions to existing survey |
| `app/(auth)/onboarding/how-to-use.tsx` | Polish | Add Reanimated transitions to existing tutorial |
| `app/(auth)/onboarding/import.tsx` | Delete | Deferred to post-auth |
| `app/(auth)/onboarding/processing.tsx` | Delete | Deferred to post-auth |

---

### Task 1: Add onboarding state to Zustand store

**Files:**
- Modify: `hooks/useStore.ts:1-10` (imports) and add new state slice

- [ ] **Step 1: Read current store structure**

Read `hooks/useStore.ts` to understand the existing store shape and find the `create()` call.

- [ ] **Step 2: Add persist middleware import**

At the top of `hooks/useStore.ts`, add the persist import:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
```

- [ ] **Step 3: Add onboarding state to the store interface**

Find the store interface type (likely `AppState` or the type parameter of `create`). Add these fields:

```typescript
// Add to existing interface
hasCompletedOnboarding: boolean;
completeOnboarding: () => void;
```

- [ ] **Step 4: Add initial state values**

In the `create()` call, add default values:

```typescript
hasCompletedOnboarding: false,
```

- [ ] **Step 5: Add the action implementation**

In the `create()` call, add the action:

```typescript
completeOnboarding: () => set({ hasCompletedOnboarding: true }),
```

- [ ] **Step 6: Wrap store with persist middleware**

Find the `create((set, get) => ({ ... }))` call. Change it to:

```typescript
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ... existing state ...
      
      hasCompletedOnboarding: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: 'stash-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
```

The `partialize` ensures only the onboarding flag is persisted, not the entire store.

- [ ] **Step 7: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors (or only pre-existing errors unrelated to this change)

- [ ] **Step 8: Commit**

```bash
git add hooks/useStore.ts
git commit -m "feat: add onboarding completion state with Zustand persist"
```

---

### Task 2: Gate routing based on onboarding state

**Files:**
- Modify: `app/_layout.tsx`
- Modify: `app/index.tsx`

- [ ] **Step 1: Update root layout to conditionally render auth group**

In `app/_layout.tsx`, inside `InnerLayout`, import the store and conditionally render:

```typescript
import { useStore } from '../hooks/useStore';
```

Then in the `InnerLayout` component, before the return:

```typescript
const hasCompletedOnboarding = useStore((s) => s.hasCompletedOnboarding);
```

Update the Stack to conditionally show screens:

```typescript
<Stack
  screenOptions={{
    headerShown: false,
    contentStyle: { backgroundColor: '#0A0A0A' },
    animation: 'fade',
  }}
>
  {!hasCompletedOnboarding ? (
    <Stack.Screen name="(auth)" />
  ) : (
    <>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </>
  )}
  <Stack.Screen name="share" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
</Stack>
```

- [ ] **Step 2: Update index.tsx redirect**

In `app/index.tsx`:

```typescript
import React from 'react';
import { Redirect } from 'expo-router';
import { useStore } from '../hooks/useStore';

export default function IndexRedirect() {
  const hasCompletedOnboarding = useStore((s) => s.hasCompletedOnboarding);
  
  if (!hasCompletedOnboarding) {
    return <Redirect href="/(auth)/splash" />;
  }
  
  return <Redirect href="/(tabs)/home" />;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add app/_layout.tsx app/index.tsx
git commit -m "feat: gate routing based on onboarding completion state"
```

---

### Task 3: Rewrite splash screen as auto-advancing brand moment

**Files:**
- Rewrite: `app/(auth)/splash.tsx`

- [ ] **Step 1: Write the new splash screen**

Replace the entire content of `app/(auth)/splash.tsx`:

```typescript
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
  runOnJS,
  Easing,
} from 'react-native-reanimated';

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    // Fade in and slide down
    opacity.value = withDelay(
      300,
      withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    translateY.value = withDelay(
      300,
      withTiming(0, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );

    // Auto-advance after 2.5s total (300ms delay + 800ms fade + 1400ms hold)
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
        <Animated.View style={animatedStyle} alignItems="center">
          <Image
            source={require('../../icon.jpeg')}
            style={{ width: 88, height: 88, borderRadius: 24, marginBottom: 16 }}
          />
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 32,
              fontFamily: 'Syne_800ExtraBold',
              letterSpacing: -0.02,
            }}
          >
            Stash
          </Text>
          <Text
            style={{
              color: '#888888',
              fontSize: 14,
              fontFamily: 'DMSans_400Regular',
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add app/(auth)/splash.tsx
git commit -m "feat: rewrite splash as auto-advancing brand moment with Reanimated"
```

---

### Task 4: Rewrite onboarding slides with Reanimated transitions

**Files:**
- Rewrite: `app/(auth)/onboarding/index.tsx`

- [ ] **Step 1: Write the new onboarding screen**

Replace the entire content of `app/(auth)/onboarding/index.tsx`:

```typescript
import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Dimensions, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Easing,
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

function Dot({ isActive, index }: { isActive: boolean; index: number }) {
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
              style={{ color: '#888888', fontSize: 15, fontFamily: 'DMSans_500Medium' }}
            >
              Skip
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 16, paddingBottom: 8 }}>
        {SLIDES.map((_, index) => (
          <Dot key={index} isActive={index === currentIndex} index={index} />
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
                      fontFamily: 'Syne_800ExtraBold',
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
                      fontFamily: 'DMSans_400Regular',
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add app/(auth)/onboarding/index.tsx
git commit -m "feat: rewrite onboarding slides with Reanimated transitions and dot indicators"
```

---

### Task 5: Polish how-found screen with Reanimated transitions

**Files:**
- Modify: `app/(auth)/onboarding/how-found.tsx`

- [ ] **Step 1: Add Reanimated imports and wrap content**

In `app/(auth)/onboarding/how-found.tsx`, replace the `Animated` import from react-native with Reanimated:

Remove this line:
```typescript
import {
  // ... other imports
  Animated,
} from 'react-native';
```

Add this import:
```typescript
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
```

- [ ] **Step 2: Update the scale animation to use Reanimated**

Replace the `scaleAnims` state and the `handlePressIn`/`handlePressOut` functions:

Remove:
```typescript
const [scaleAnims] = useState(() => 
  OPTIONS.reduce((acc, opt) => {
    acc[opt.id] = new Animated.Value(1);
    return acc;
  }, {} as Record<string, Animated.Value>)
);

const handlePressIn = (id: string) => {
  Animated.spring(scaleAnims[id], {
    toValue: 0.97,
    useNativeDriver: true,
    tension: 100,
    friction: 6,
  }).start();
};

const handlePressOut = (id: string) => {
  Animated.spring(scaleAnims[id], {
    toValue: 1,
    useNativeDriver: true,
    tension: 100,
    friction: 6,
  }).start();
};
```

Add a new `OptionItem` component above `HowFoundScreen`:

```typescript
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
              fontFamily: isSelected ? 'DMSans_500Medium' : 'DMSans_400Regular',
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
```

- [ ] **Step 3: Update the OPTIONS mapping in the return statement**

Replace the `OPTIONS.map` block with:

```typescript
{OPTIONS.map((opt, index) => (
  <Animated.View key={opt.id} entering={FadeInRight.delay(index * 100).duration(400)}>
    <OptionItem
      opt={opt}
      isSelected={selected === opt.id}
      onSelect={() => handleSelect(opt.id)}
    />
  </Animated.View>
))}
```

- [ ] **Step 4: Add staggered animation to header text**

Wrap the header text block in Animated.View:

```typescript
<Animated.View entering={FadeInDown.duration(500)} style={{ marginBottom: 32 }}>
  {/* existing header text */}
</Animated.View>
```

- [ ] **Step 5: Remove unused imports**

Remove `Dimensions` from react-native imports (no longer needed).

- [ ] **Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 7: Commit**

```bash
git add app/(auth)/onboarding/how-found.tsx
git commit -m "feat: polish how-found screen with Reanimated transitions"
```

---

### Task 6: Polish how-to-use screen with Reanimated transitions

**Files:**
- Modify: `app/(auth)/onboarding/how-to-use.tsx`

- [ ] **Step 1: Add Reanimated imports**

Add to `app/(auth)/onboarding/how-to-use.tsx`:

```typescript
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
```

- [ ] **Step 2: Wrap the Lottie animation in Animated.View**

```typescript
<Animated.View entering={FadeInDown.duration(600)} style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
  <LottieView ... />
</Animated.View>
```

- [ ] **Step 3: Wrap the steps list with staggered animation**

```typescript
{STEPS.map((step, index) => (
  <Animated.View
    key={index}
    entering={FadeInRight.delay(200 + index * 150).duration(400)}
    style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}
  >
    {/* existing step content */}
  </Animated.View>
))}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 5: Commit**

```bash
git add app/(auth)/onboarding/how-to-use.tsx
git commit -m "feat: polish how-to-use screen with Reanimated transitions"
```

---

### Task 7: Delete deferred onboarding screens

**Files:**
- Delete: `app/(auth)/onboarding/import.tsx`
- Delete: `app/(auth)/onboarding/processing.tsx`

- [ ] **Step 1: Delete import.tsx**

Run: `rm app/(auth)/onboarding/import.tsx`

- [ ] **Step 2: Delete processing.tsx**

Run: `rm app/(auth)/onboarding/processing.tsx`

- [ ] **Step 3: Verify no remaining imports reference deleted files**

Run: `grep -r "import\|processing" app/ hooks/ components/ --include="*.tsx" --include="*.ts"`
Expected: No references to deleted files

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove deferred onboarding screens (import, processing)"
```

---

### Task 8: End-to-end verification

- [ ] **Step 1: Clear Expo cache and start dev server**

Run: `npx expo start --clear`

- [ ] **Step 2: Test fresh install flow**

- Open app on device/simulator
- Native splash should show briefly
- Auto-advancing splash fades in with icon + "Stash" + tagline
- After ~2.5 seconds, auto-navigates to onboarding
- 3 onboarding slides are swipeable with smooth Reanimated transitions
- Dots animate between active/inactive states
- Skip button appears after 500ms
- "Next" advances slides, "Get Started" on last slide goes to how-found
- How-found survey shows with staggered animations
- Sign-up screen is reachable

- [ ] **Step 3: Test returning user flow**

- Complete onboarding once
- Kill and reopen app
- App should skip directly to main tabs (no onboarding)

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: onboarding flow adjustments from e2e testing"
```
