import React, { useCallback } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onArchive?: () => void;
  onPin?: () => void;
}

const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 1000;

export function SwipeableRow({
  children,
  onDelete,
  onArchive,
  onPin,
}: SwipeableRowProps) {
  const translateX = useSharedValue(0);
  const activeAction = useSharedValue<'none' | 'delete' | 'archive' | 'pin'>('none');

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete?.();
  }, [onDelete]);

  const handleArchive = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onArchive?.();
  }, [onArchive]);

  const handlePin = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPin?.();
  }, [onPin]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((event: { translationX: number }) => {
      translateX.value = event.translationX;

      if (event.translationX < -SWIPE_THRESHOLD * 0.5) {
        activeAction.value = 'delete';
      } else if (event.translationX > SWIPE_THRESHOLD * 0.5) {
        if (onPin) {
          activeAction.value = 'pin';
        } else if (onArchive) {
          activeAction.value = 'archive';
        }
      } else {
        activeAction.value = 'none';
      }
    })
    .onEnd((event: { translationX: number; velocityX: number }) => {
      if (event.translationX < -SWIPE_THRESHOLD || event.velocityX < -VELOCITY_THRESHOLD) {
        if (onDelete) {
          translateX.value = withSpring(-300, { damping: 20, stiffness: 300 });
          runOnJS(handleDelete)();
          return;
        }
      }

      if (event.translationX > SWIPE_THRESHOLD || event.velocityX > VELOCITY_THRESHOLD) {
        if (onPin && activeAction.value === 'pin') {
          translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
          runOnJS(handlePin)();
          return;
        }
        if (onArchive && activeAction.value === 'archive') {
          translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
          runOnJS(handleArchive)();
          return;
        }
      }

      translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      activeAction.value = 'none';
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const deleteActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.5, 0],
      [1, 0.5, 0],
      'clamp'
    );
    return { opacity };
  });

  const archiveActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD],
      [0, 0.5, 1],
      'clamp'
    );
    return { opacity };
  });

  const pinActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD],
      [0, 0.5, 1],
      'clamp'
    );
    return { opacity };
  });

  const hasLeftActions = !!onPin || !!onArchive;
  const hasRightActions = !!onDelete;

  return (
    <View className="relative overflow-hidden">
      {/* Left actions (archive / pin) */}
      {hasLeftActions && (
        <View className="absolute inset-y-0 left-0 flex-row items-center">
          {onPin && (
            <Animated.View style={pinActionStyle} className="items-center justify-center w-20 h-full bg-accent-base/20">
              <Pressable
                onPress={handlePin}
                className="items-center justify-center w-12 h-12 rounded-full bg-accent-base"
              >
                <Ionicons name="pin" size={20} color="#FFFFFF" />
              </Pressable>
              <Text className="text-xs text-accent-base mt-1 font-medium">Pin</Text>
            </Animated.View>
          )}
          {onArchive && (
            <Animated.View style={archiveActionStyle} className="items-center justify-center w-20 h-full bg-blue-500/20">
              <Pressable
                onPress={handleArchive}
                className="items-center justify-center w-12 h-12 rounded-full bg-blue-500"
              >
                <Ionicons name="archive" size={20} color="#FFFFFF" />
              </Pressable>
              <Text className="text-xs text-blue-400 mt-1 font-medium">Archive</Text>
            </Animated.View>
          )}
        </View>
      )}

      {/* Right actions (delete) */}
      {hasRightActions && (
        <Animated.View
          style={deleteActionStyle}
          className="absolute inset-y-0 right-0 items-center justify-center w-20 h-full bg-semantic-error/20"
        >
          <Pressable
            onPress={handleDelete}
            className="items-center justify-center w-12 h-12 rounded-full bg-semantic-error"
          >
            <Ionicons name="trash" size={20} color="#FFFFFF" />
          </Pressable>
          <Text className="text-xs text-semantic-error mt-1 font-medium">Delete</Text>
        </Animated.View>
      )}

      {/* Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
