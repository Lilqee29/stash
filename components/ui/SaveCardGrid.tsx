import React, { useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { SaveItem } from '../../hooks/useStore';

const ACCENT = '#8EC934';

interface SaveCardProps {
  save: SaveItem;
  onPress: (id: string) => void;
  height?: number;
}

function SaveCard({ save, onPress, height = 180 }: SaveCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(save.id);
  }, [save.id, onPress]);

  const getPlatformColor = (platform?: string) => {
    switch (platform) {
      case 'tiktok':
        return '#EE1D52';
      case 'instagram':
        return '#E1306C';
      default:
        return ACCENT;
    }
  };

  const getTimeAgo = (date?: string) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: '#141414',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
        }}
      >
        {/* Thumbnail */}
        <View style={{ height, position: 'relative' }}>
          {(save.thumbnailUrl) ? (
            <Image
              source={{ uri: save.thumbnailUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={400}
            />
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: '#1A1A1A',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="image-outline" size={32} color="#333" />
            </View>
          )}

          {/* Platform dot */}
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: getPlatformColor(save.platform),
            }}
          />

          {/* Content type badge */}
          {save.contentType && save.contentType !== 'default' && (
            <View
              style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                backgroundColor: 'rgba(0,0,0,0.6)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  fontFamily: 'Inter_700Bold',
                  color: '#fff',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                }}
              >
                {save.contentType}
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ padding: 12 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 14,
              fontWeight: '600',
              fontFamily: 'Inter_600SemiBold',
              color: '#fff',
              letterSpacing: -0.2,
              marginBottom: 2,
            }}
          >
            {save.title}
          </Text>
          {save.creator ? (
            <Text
              numberOfLines={1}
              style={{
                fontSize: 11,
                fontFamily: 'Inter_400Regular',
                color: '#888',
                marginBottom: 2,
              }}
            >
              @{save.creator}
            </Text>
          ) : null}
          <Text
            style={{
              fontSize: 12,
              fontFamily: 'Inter_400Regular',
              color: '#555',
            }}
          >
            {getTimeAgo(save.savedAt || save.createdAt)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface SaveMasonryGridProps {
  saves: SaveItem[];
  onCardPress: (id: string) => void;
}

export function SaveMasonryGrid({ saves, onCardPress }: SaveMasonryGridProps) {
  const leftCol: SaveItem[] = [];
  const rightCol: SaveItem[] = [];

  saves.forEach((save, i) => {
    if (i % 2 === 0) leftCol.push(save);
    else rightCol.push(save);
  });

  const getCardHeight = (index: number) => {
    const heights = [180, 140, 200, 150, 190, 160, 170, 210];
    return heights[index % heights.length];
  };

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 10 }}>
      <View style={{ flex: 1, gap: 10 }}>
        {leftCol.map((save, i) => (
          <SaveCard
            key={save.id}
            save={save}
            onPress={onCardPress}
            height={getCardHeight(i * 2)}
          />
        ))}
      </View>
      <View style={{ flex: 1, gap: 10 }}>
        {rightCol.map((save, i) => (
          <SaveCard
            key={save.id}
            save={save}
            onPress={onCardPress}
            height={getCardHeight(i * 2 + 1)}
          />
        ))}
      </View>
    </View>
  );
}
