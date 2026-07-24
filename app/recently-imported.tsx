import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore, SaveItem } from '../hooks/useStore';

// ─── Filter chip data derived from platforms ──────────────────────────────────
const BASE_FILTERS = ['All'];

function getPlatformColor(platform: string) {
  switch (platform) {
    case 'tiktok':    return '#FFFFFF';
    case 'instagram': return '#E1306C';
    case 'behance':   return '#0057FF';
    case 'dribbble':  return '#EA4C89';
    default:          return '#8EC934';
  }
}

function getPlatformIcon(platform: string): any {
  switch (platform) {
    case 'tiktok':    return 'logo-tiktok';
    case 'instagram': return 'logo-instagram';
    case 'behance':   return 'briefcase-outline';
    case 'dribbble':  return 'basketball-outline';
    default:          return 'globe-outline';
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ─── Empty state illustration (ghost-like mascot built from shapes) ────────────
function EmptyMascot() {
  return (
    <View style={mascotStyles.container}>
      {/* Body */}
      <View style={mascotStyles.body}>
        {/* Eyes */}
        <View style={mascotStyles.eyeRow}>
          <View style={mascotStyles.eye} />
          <View style={mascotStyles.eye} />
        </View>
        {/* Mouth */}
        <View style={mascotStyles.mouth} />
      </View>
      {/* Shadow */}
      <View style={mascotStyles.shadow} />
      {/* Floating items */}
      <View style={[mascotStyles.floatItem, { top: 0, right: 20 }]}>
        <Ionicons name="bookmark" size={16} color="#8EC934" />
      </View>
      <View style={[mascotStyles.floatItem, { bottom: 20, left: 10 }]}>
        <Ionicons name="film" size={14} color="#4FD1FF" />
      </View>
      <View style={[mascotStyles.floatItem, { top: 20, left: 0 }]}>
        <Ionicons name="images" size={14} color="#FF8C42" />
      </View>
    </View>
  );
}

const mascotStyles = StyleSheet.create({
  container: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  body: {
    width: 80,
    height: 90,
    backgroundColor: '#1E1E1E',
    borderRadius: 40,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2E2E2E',
    gap: 8,
  },
  eyeRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: -8,
  },
  eye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#555',
  },
  mouth: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
  },
  shadow: {
    position: 'absolute',
    bottom: 8,
    width: 60,
    height: 8,
    borderRadius: 30,
    backgroundColor: '#1A1A1A',
  },
  floatItem: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
});

// ─── Save Card (list item) ────────────────────────────────────────────────────
function SaveCard({ item, onPress }: { item: SaveItem; onPress: () => void }) {
  const color  = getPlatformColor(item.platform);
  const icon   = getPlatformIcon(item.platform);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Thumbnail with Real Preview Image support */}
      <View style={[styles.thumb, { backgroundColor: color + '18' }]}>
        {item.thumbnailUrl ? (
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name={icon} size={26} color={color} />
        )}
        {/* Platform icon badge (only when there's a thumbnail) */}
        {item.thumbnailUrl ? (
          <View style={[styles.thumbBadge, styles.thumbBadgeImage]}> 
            <Ionicons name={icon} size={14} color="#FFF" />
          </View>
        ) : null}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.cardMeta}>
          <Ionicons name={icon} size={12} color={color} />
          <Text style={[styles.cardPlatform, { color }]}>
            {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
          </Text>
          <View style={styles.metaDot} />
          <Text style={styles.cardTime}>{timeAgo(item.savedAt)}</Text>
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward-outline" size={18} color="#333" />
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RecentlyImportedScreen() {
  const router = useRouter();
  const { saves } = useStore();

  const [activeFilter, setActiveFilter] = useState('All');
  const [selectMode,   setSelectMode]   = useState(false);
  const [selected,     setSelected]     = useState<Set<string>>(new Set());

  // ─── Smart category filters derived from genres in saves ─────────────────────
  const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
    'All':     { emoji: '✦',  color: '#8EC934' },
    'Recipes': { emoji: '🍳', color: '#FF8C42' },
    'Places':  { emoji: '📍', color: '#4FD1FF' },
    'Films':   { emoji: '🎬', color: '#A78BFA' },
    'Design':  { emoji: '✏️', color: '#F472B6' },
    'Software':{ emoji: '💻', color: '#34D399' },
  };

  // Build dynamic filter list from genres present in saves
  const presentGenres = Array.from(
    new Set(saves.map((s) => s.genre).filter(Boolean) as string[])
  );
  const filters = ['All', ...presentGenres.filter(g => CATEGORY_META[g])];

  // Sort saves newest first
  const sorted = [...saves].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  // Apply filter
  const filtered =
    activeFilter === 'All'
      ? sorted
      : sorted.filter((s) => s.genre === activeFilter);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ── HEADER ───────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Pressable
          onPress={() => {
            setSelectMode((v) => !v);
            setSelected(new Set());
          }}
        >
          <Text style={styles.selectBtn}>
            {selectMode ? 'Done' : 'Select'}
          </Text>
        </Pressable>
      </View>

      {/* ── TITLE ───────────────────────────────────────── */}
      <Text style={styles.pageTitle}>Recently imported</Text>

      {/* ── FILTER CHIPS ────────────────────────────────── */}
      <FlatList
        data={filters}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item: f }) => {
          const active = activeFilter === f;
          const meta = CATEGORY_META[f] ?? { emoji: '◆', color: '#8EC934' };
          return (
            <Pressable
              onPress={() => setActiveFilter(f)}
              style={[
                styles.filterChip,
                active && { backgroundColor: meta.color, borderColor: meta.color },
              ]}
            >
              <Text style={styles.filterChipEmoji}>{meta.emoji}</Text>
              <Text
                style={[
                  styles.filterChipText,
                  active ? styles.filterChipTextActive : { color: meta.color },
                ]}
              >
                {f}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* ── SELECT BAR ──────────────────────────────────── */}
      {selectMode && selected.size > 0 && (
        <View style={styles.selectBar}>
          <Text style={styles.selectBarText}>{selected.size} selected</Text>
          <View style={styles.selectBarActions}>
            <TouchableOpacity style={styles.selectAction}>
              <Ionicons name="folder-outline" size={18} color="#fff" />
              <Text style={styles.selectActionText}>Move</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.selectAction, styles.selectActionDelete]}>
              <Ionicons name="trash-outline" size={18} color="#FF453A" />
              <Text style={[styles.selectActionText, { color: '#FF453A' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── CONTENT ─────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <EmptyMascot />
          <Text style={styles.emptyTitle}>No imports found</Text>
          <Text style={styles.emptySubtitle}>
            Share some content to Stash to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selected.has(item.id);
            return (
              <View style={styles.cardWrapper}>
                {selectMode && (
                  <Pressable
                    onPress={() => toggleSelect(item.id)}
                    style={[
                      styles.selectCircle,
                      isSelected && styles.selectCircleActive,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color="#0A0A0A" />
                    )}
                  </Pressable>
                )}
                <View style={{ flex: 1 }}>
                  <SaveCard
                    item={item}
                    onPress={() => {
                      if (selectMode) toggleSelect(item.id);
                      else router.push(`/save/${item.id}`);
                    }}
                  />
                </View>
              </View>
            );
          }}
        />
      )}

      {/* ── FLOATING ADD BUTTON ──────────────────────────── */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/search')}>
        <Ionicons name="add" size={28} color="#0A0A0A" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  selectBtn: {
    color: '#8EC934',
    fontSize: 16,
    fontWeight: '600',
  },

  // TITLE
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
  },

  // FILTER CHIPS
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 50,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  filterChipEmoji: {
    marginRight: 6,
    fontSize: 14,
  },
  filterChipActive: {
    backgroundColor: '#8EC934',
    borderColor: '#8EC934',
  },
  filterChipText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#0A0A0A',
  },

  // SELECT BAR
  selectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#161616',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  selectBarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  selectBarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  selectAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  selectActionDelete: {
    backgroundColor: 'rgba(255,69,58,0.1)',
  },
  selectActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // LIST
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 10,
  },
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161616',
  },
  selectCircleActive: {
    backgroundColor: '#8EC934',
    borderColor: '#8EC934',
  },

  // SAVE CARD
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 18,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  cardPressed: {
    opacity: 0.85,
    backgroundColor: '#151515',
  },
  thumb: {
    width: 58,
    height: 68,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  thumbBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  thumbBadgeImage: {
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  thumbBadgeNoImage: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    right: 8,
  },
  thumbBadgeText: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardInfo: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardPlatform: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#444',
  },
  cardTime: {
    color: '#555',
    fontSize: 12,
  },

  // EMPTY STATE
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8EC934',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8EC934',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
