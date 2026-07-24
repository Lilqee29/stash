// NativeWind v4 type augmentation
// The top-level import makes this a MODULE, so `declare module` below
// AUGMENTS (merges with) the existing module instead of replacing it.

import type {} from 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
    children?: import('react').ReactNode;
  }
  interface TextProps {
    className?: string;
    children?: import('react').ReactNode;
  }
  interface ScrollViewProps {
    className?: string;
    children?: import('react').ReactNode;
  }
  interface PressableProps {
    className?: string;
    children?: import('react').ReactNode;
  }
  interface TextInputProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface KeyboardAvoidingViewProps {
    className?: string;
    children?: import('react').ReactNode;
  }
}

import type {} from 'react-native-safe-area-context';

declare module 'react-native-safe-area-context' {
  interface NativeSafeAreaViewProps {
    className?: string;
  }
}

// ─── Missing module declarations ────────────────────────────────────────────

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module 'expo-clipboard' {
  export function getStringAsync(): Promise<string>;
  export function setStringAsync(string: string): Promise<void>;
  export function hasStringAsync(): Promise<boolean>;
}

declare module 'expo-image' {
  import type React from 'react';
  import type { ImageProps as RNImageProps, ViewProps } from 'react-native';

  type ContentFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  type Transition = number | { duration?: number; timing?: string };

  export interface ImageProps extends Omit<RNImageProps, 'source'> {
    source: { uri: string } | number;
    contentFit?: ContentFit;
    transition?: Transition;
    placeholder?: string;
    cachePolicy?: 'memory' | 'disk' | 'memory-disk' | 'none';
    priority?: 'low' | 'normal' | 'high';
  }

  export const Image: React.FC<ImageProps>;
}

declare module 'moti' {
  export * from 'moti/build';
}

declare module 'moti/skeleton' {
  import type { Component } from 'react';
  export const Skeleton: Component<{ colorMode?: string; children?: unknown }>;
}

// @react-navigation/elements declaration removed (SDK 56+ — no longer auto-linked via expo-router)

declare module 'expo-haptics' {
  export enum ImpactFeedbackStyle {
    Light = 'light',
    Medium = 'medium',
    Heavy = 'heavy',
    Rigid = 'rigid',
    Soft = 'soft',
  }
  export enum NotificationFeedbackType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
  }
  export function impactAsync(style: ImpactFeedbackStyle): Promise<void>;
  export function notificationAsync(type: NotificationFeedbackType): Promise<void>;
  export function selectionAsync(): Promise<void>;
}

declare module 'lottie-react-native' {
  import type React from 'react';
  interface LottieViewProps {
    source: string | object;
    autoPlay?: boolean;
    loop?: boolean;
    style?: object;
    resizeMode?: 'cover' | 'contain' | 'center';
  }
  export interface LottieViewRef {
    play(): void;
    pause(): void;
    reset(): void;
  }
  const LottieView: React.FC<LottieViewProps & { ref?: React.Ref<LottieViewRef> }>;
  export default LottieView;
}
