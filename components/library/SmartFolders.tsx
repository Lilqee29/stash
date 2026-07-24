import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Folder = {
  id: string;
  name: string;
  count: number;
  platforms: string[];
};

type Props = {
  data: Folder[];
};

// Use crisp emojis instead of flat icons for a 3D premium look
const FOLDER_ASSETS = [
  { emoji: '💻', bg: '#2C2C2E', border: '#444' }, // Software
  { emoji: '🍲', bg: '#4A1515', border: '#FF453A40' }, // Recipes
  { emoji: '🗺️', bg: '#102A4A', border: '#0A84FF40' }, // Places
  { emoji: '🎬', bg: '#153A20', border: '#30D15840' }, // Films
  { emoji: '📚', bg: '#2A1A4A', border: '#5E5CE640' }, // Books
  { emoji: '🛍️', bg: '#4A3010', border: '#FF9F0A40' }, // Products
  { emoji: '💪', bg: '#4A101C', border: '#FF375F40' }, // Fitness
];

export default function HomeSmartFolders({ data }: Props) {
  const router = useRouter();

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={{ fontSize: 32 }}>📁</Text>
        <Text style={styles.emptyText}>No folders yet</Text>
        <Text style={styles.emptySubtext}>Import saves to auto-generate folders</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Smart Folders</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data.map((folder, index) => {
          const asset = FOLDER_ASSETS[index % FOLDER_ASSETS.length];
          return (
            <Pressable
              key={folder.id}
              onPress={() => router.push(`/folder/${folder.id}`)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={[
                styles.iconContainer, 
                { backgroundColor: asset.bg, borderColor: asset.border }
              ]}>
                <Text style={styles.emoji}>{asset.emoji}</Text>
              </View>
              
              <Text style={styles.folderName} numberOfLines={1}>
                {folder.name}
              </Text>
              
              <Text style={styles.countText}>{folder.count} saves</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    width: 90,
    alignItems: 'center',
    gap: 8,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  emoji: {
    fontSize: 32,
  },
  folderName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  countText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  emptyText: {
    color: '#444444',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtext: {
    color: '#333333',
    fontSize: 12,
    textAlign: 'center',
  },
});