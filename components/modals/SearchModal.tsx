import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ActivityIndicator } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../hooks/useStore';

export default function SearchModal() {
  const { modal, setModal, searchTag, setSearchTag, saves } = useStore();
  const isSearchOpen = modal === 'search';
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const { height } = Dimensions.get('window');
  const SHEET_HEIGHT = height * 0.85;

  useEffect(() => {
    if (isSearchOpen) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;

    setIsLoading(true);
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 180);

    return () => clearTimeout(timeout);
  }, [query, searchTag, isSearchOpen]);

  const normalizedTag = searchTag?.label.toLowerCase() ?? '';
  const results = saves.filter((save) => {
    const searchText = `${save.title} ${save.platform} ${save.genre ?? ''}`.toLowerCase();
    const matchesQuery = query.trim().length > 0 ? searchText.includes(query.toLowerCase()) : true;
    const matchesTag = searchTag ? searchText.includes(normalizedTag) : true;
    return matchesQuery && matchesTag;
  });

  if (!isSearchOpen) return null;

  return (
    <Modal transparent visible={isSearchOpen} animationType="none">
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          
            onPress={() => {
            setModal(null);
            setSearchTag(null);
            }}
                    
        />

        <Animated.View
          style={[
            styles.sheet,
            {
              height: SHEET_HEIGHT,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SHEET_HEIGHT, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Search</Text>

            <Pressable onPress={() => {
                setModal('add');
                setSearchTag(null);
                }}>
              <Ionicons name="close" size={22} color="#888" />
            </Pressable>
          </View>

          {/* SEARCH BAR */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#888" />

            {searchTag && (
              <View style={styles.tagChip}>
                <Ionicons name={searchTag.icon as any} size={14} color="#fff" />
                <Text style={styles.tagText}>{searchTag.label}</Text>
                <Pressable onPress={() => setSearchTag(null)}>
                  <Ionicons name="close-circle" size={16} color="#aaa" />
                </Pressable>
              </View>
            )}

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchTag ? 'Search inside category...' : 'Search saves, folders...'}
              placeholderTextColor="#555"
              style={styles.input}
            />
          </View>

          {isLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator size="large" color="#888" />
              <Text style={styles.emptyText}>Searching your saved content…</Text>
            </View>
          ) : query.trim().length === 0 && !searchTag ? (
            <View style={styles.empty}>
              <Ionicons name="search" size={60} color="#222" />
              <Text style={styles.emptyText}>Search your saved content</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="alert-circle-outline" size={60} color="#888" />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>Try a different keyword or clear the tag.</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.searchResultsCount}>FOUND {results.length} MATCHING SAVES</Text>
              {results.map((item) => (
                <View key={item.id} style={styles.searchResultItem}>
                  <View style={[styles.searchResultOrb, { backgroundColor: '#8EC93420', borderColor: '#8EC93440' }]}>
                    <Ionicons name="bookmark" size={12} color="#8EC934" />
                  </View>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.searchResultTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.searchResultMetadata}>{item.platform} • {item.genre ?? 'Saved item'}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.2)" />
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    gap: 8,
  },

  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },

  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginLeft: 6,
  },

  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  empty: {
    alignItems: 'center',
    marginTop: 60,
  },

  emptyText: {
    color: '#555',
    marginTop: 12,
    textAlign: 'center',
  },

  emptySubtext: {
    color: '#777',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 260,
  },

  searchResultsCount: {
    color: '#8EC934',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 16,
  },

  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },

  searchResultOrb: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  searchResultTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  searchResultMetadata: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
});