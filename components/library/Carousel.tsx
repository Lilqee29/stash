import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Item = {
  id: string;
  title: string;
  platform: string;
  color: string;
  subtitle: string;
  icon: string;
};

type Props = {
  data: Item[];
};

function getAccent(platform: string) {
  switch (platform.toLowerCase()) {
    case 'tiktok':
      return '#FFFFFF';
    case 'instagram':
      return '#E1306C';
    case 'behance':
      return '#0057FF';
    default:
      return '#8EC934';
  }
}

function getIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case 'tiktok':
      return 'logo-tiktok';
    case 'instagram':
      return 'logo-instagram';
    case 'behance':
      return 'briefcase';
    default:
      return 'folder';
  }
}

export default function Carousel({ data }: Props) {
  const router = useRouter();

  if (!data || data.length === 0) return null;

  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const accent = getAccent(item.platform);
        const icon = getIcon(item.platform);

        return (
          <Pressable 
            style={styles.card}
            onPress={() => router.push(`/save/${item.id}`)}
          >
            
            {/* ICON & PLATFORM ROW */}
            <View style={styles.cardTop}>
              <View style={[styles.iconBox, { borderColor: 'rgba(255,255,255,0.08)' }]}>
                <Ionicons name={icon as any} size={16} color={accent} />
              </View>
              <View style={[styles.platformBadge, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                <Text style={[styles.platformText, { color: accent }]}>
                  {item.platform.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* TITLE */}
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>

            {/* SUBTITLE */}
            <Text style={styles.subtitle}>
              {item.subtitle}
            </Text>

          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingLeft: 18,
    paddingVertical: 10,
  },

  card: {
    width: 200,
    height: 140,
    borderRadius: 20,
    backgroundColor: '#111111',
    marginRight: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },

  platformBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  platformText: {
    fontSize: 8,
    fontWeight: '800',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    lineHeight: 18,
    flex: 1,
  },

  subtitle: {
    color: '#888888',
    fontSize: 10,
    marginTop: 4,
  },
});