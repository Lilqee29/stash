import React from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface SuggestionItem {
  id: string;
  title: string;
  folder: string;
  source: string;
  color: string;
  time: string;
  thumbnailType: string;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredSuggestions: SuggestionItem[];
}

const ACCENT_BRIGHT = '#8EC934';

export default function SearchOverlay({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  filteredSuggestions,
}: SearchOverlayProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.searchOverlay, { paddingTop: insets.top }]}>
        {/* Header bar input */}
        <View style={styles.searchHeader}>
          <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={16} color="rgba(255,255,255,0.3)" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search speed ramps, grading, tech..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                style={styles.searchInputField}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.4)" />
                </Pressable>
              )}
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#888888" />
            </Pressable>
        </View>

        {/* Results */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {searchQuery.trim().length === 0 ? (
            <View>
              <Text style={styles.searchHelpHeading}>Suggested Searches</Text>
              {['After Effects speed ramps', 'Sound Design beat layering', 'Typography Rules', 'Teal and orange grading'].map((term) => (
                <Pressable
                  key={term}
                  onPress={() => setSearchQuery(term)}
                  style={styles.suggestedSearchRow}
                >
                  <Ionicons name="trending-up-outline" size={14} color={ACCENT_BRIGHT} style={{ marginRight: 10 }} />
                  <Text style={styles.suggestedSearchText}>{term}</Text>
                </Pressable>
              ))}

              {/* Empty state tip */}
              <View style={styles.searchTipBox}>
                <Ionicons name="bulb-outline" size={16} color={ACCENT_BRIGHT} style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={styles.searchTipText}>
                  Stash search is semantic. You can search by tags, ideas, or topics like "creative video tips" and the AI will scan captions automatically.
                </Text>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.searchResultsCount}>
                FOUND {filteredSuggestions.length} MATCHING SAVES
              </Text>

              {filteredSuggestions.length === 0 ? (
                <View style={styles.emptyResults}>
                  <Ionicons name="search" size={32} color="#222222" />
                  <Text style={styles.emptyResultsText}>No saves matched your query</Text>
                </View>
              ) : (
                filteredSuggestions.map((item) => (
                  <View key={item.id} style={styles.searchResultItem}>
                    <View style={[styles.searchResultOrb, { backgroundColor: item.color + '15', borderColor: item.color + '33' }]}>
                      <Ionicons name="bookmark" size={12} color={item.color} />
                    </View>
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultTitle} numberOfLines={2}>{item.title}</Text>
                      <Text style={styles.searchResultMetadata}>{item.folder} • {item.source}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.2)" />
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>

        {/* Bottom safe area padding */}
        <View style={{ height: insets.bottom }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  searchOverlay: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  clearBtn: {
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    height: 44,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInputField: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  searchHelpHeading: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  suggestedSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  suggestedSearchText: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  searchTipBox: {
    marginTop: 32,
    backgroundColor: 'rgba(99,153,34,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(99,153,34,0.1)',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
  },
  searchTipText: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  searchResultsCount: {
    color: '#8EC934',
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 18,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
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
  searchResultInfo: {
    flex: 1,
    marginRight: 10,
  },
  searchResultTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 17,
  },
  searchResultMetadata: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 2,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyResultsText: {
    color: '#555555',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 12,
  },
});
