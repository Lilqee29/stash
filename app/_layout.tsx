
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { ShareIntentProvider, useShareIntent } from 'expo-share-intent';
import { 
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import '../global.css';
import { supabase } from '../lib/supabase';
import { useStore } from '../hooks/useStore';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Inner layout that has access to ShareIntentProvider context
function InnerLayout() {
  const router = useRouter();
  const { hasShareIntent } = useShareIntent();
  const hasCompletedOnboarding = useStore((s) => s.hasCompletedOnboarding);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // When a share intent arrives, navigate to the share screen
  useEffect(() => {
    if (hasShareIntent) {
      router.push('/share');
    }
  }, [hasShareIntent]);

  // Supabase auth session sync
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await useStore.getState().syncWithSupabase();
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0A' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="share" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ShareIntentProvider>
        <InnerLayout />
      </ShareIntentProvider>
    </GestureHandlerRootView>
  );
}
