import React, { useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const ACCENT = '#8EC934';

interface Folder {
  id: string;
  name: string;
  icon?: string;
  saveCount?: number;
}

interface FolderGridProps {
  folders: Folder[];
  onFolderPress: (id: string) => void;
  onSeeAll?: () => void;
}

function FolderCard({
  folder,
  onPress,
}: {
  folder: Folder;
  onPress: (id: string) => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(folder.id);
  }, [folder.id, onPress]);

  const icon = (folder.icon || 'folder') as keyof typeof Ionicons.glyphMap;

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          alignItems: 'center',
          paddingVertical: 16,
          borderRadius: 16,
          backgroundColor: '#141414',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: `${ACCENT}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
          }}
        >
          <Ionicons name={icon} size={20} color={ACCENT} />
        </View>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 13,
            fontWeight: '600',
            fontFamily: 'Inter_600SemiBold',
            color: '#fff',
            letterSpacing: -0.2,
            marginBottom: 2,
            textAlign: 'center',
          }}
        >
          {folder.name}
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'Inter_400Regular',
            color: '#555',
          }}
        >
          {folder.saveCount ?? 0}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function FolderGrid({ folders, onFolderPress, onSeeAll }: FolderGridProps) {
  const displayFolders = folders.slice(0, 6);

  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            fontSize: 17,
            fontWeight: '700',
            fontFamily: 'PlusJakartaSans_700Bold',
            color: '#fff',
            letterSpacing: -0.3,
          }}
        >
          Folders
        </Text>
        {folders.length > 6 && onSeeAll && (
          <Pressable onPress={onSeeAll}>
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'Inter_400Regular',
                color: '#666',
              }}
            >
              See all
            </Text>
          </Pressable>
        )}
      </View>

      {/* Row 1 */}
      {displayFolders.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          {displayFolders.slice(0, 3).map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onPress={onFolderPress}
            />
          ))}
          {displayFolders.length < 3 &&
            Array.from({ length: 3 - displayFolders.length }).map((_, i) => (
              <View key={`empty-${i}`} style={{ flex: 1 }} />
            ))}
        </View>
      )}

      {/* Row 2 */}
      {displayFolders.length > 3 && (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {displayFolders.slice(3, 6).map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onPress={onFolderPress}
            />
          ))}
          {displayFolders.length < 6 &&
            Array.from({ length: 6 - Math.min(displayFolders.length, 6) }).map(
              (_, i) => <View key={`empty-${i}`} style={{ flex: 1 }} />
            )}
        </View>
      )}
    </View>
  );
}
