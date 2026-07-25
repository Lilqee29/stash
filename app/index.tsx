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
