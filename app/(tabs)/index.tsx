import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useStore } from '../../hooks/useStore';
import SearchOverlay from '../../components/library/SearchOverlay';
import BottomDock from '../../components/library/BottomDock';
import Carousel from '../../components/library/Carousel';
import SmartFolders from '../../components/library/SmartFolders';

export default function HomeScreen() {
  const router = useRouter();
  const { saves, folders } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');

  const filteredSuggestions = saves
    .map((item) => ({
      id: item.id,
      title: item.title,
      folder: item.platform,
      source: item.platform,
      color: item.platform === 'tiktok' ? '#ffffff' : '#E1306C',
      time: 'Saved ' + new Date(item.savedAt).toLocaleDateString(),
      thumbnailType: 'video-timeline',
    }))
    .filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.folder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const carouselData = saves.slice(0, 5).map((item) => ({
    id: item.id,
    title: item.title,
    platform: item.platform,
    color: item.platform === 'tiktok' ? '#ffffff' : '#E1306C',
    subtitle: `Saved from ${item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}`,
    icon: item.platform === 'tiktok' ? 'play-circle-outline' : 'image-outline',
  }));

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'library') {
      router.push('/folders');
    } else if (tab === 'settings') {
      router.push('/settings');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* MAIN SCROLL CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.brandImage}
              />
            </View>

            <View style={styles.brandTextContainer}>
              <Text style={styles.brandLabel}>Stash</Text>
              <Text style={styles.brandSub}>Your bookmark brain</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Pressable
              style={styles.iconButton}
              onPress={() => setIsSearchOpen(true)}
            >
              <Ionicons name="search" size={20} color="#fff" />
            </Pressable>

            <Pressable 
              style={styles.iconButton}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={20} color="#8EC934" />
            </Pressable>

            <SearchOverlay
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredSuggestions={filteredSuggestions}
            />
          </View>
        </View>

        {/* HERO */}
        <View style={styles.heroCard}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.greetingName}>Mina.</Text>
            <Text style={styles.heroCopy}>Your saves are vector indexed and sorted into dynamic categories.</Text>
          </View>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => router.push('/folders')}
          >
            <MaterialCommunityIcons name="library" size={18} color="#0A0A0A" />
            <Text style={styles.saveText}>Library</Text>
          </TouchableOpacity>
        </View>

        {/* CAROUSEL */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent saves</Text>
        </View>
        <Carousel data={carouselData} />

        {/* SMART FOLDERS */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Smart folders</Text>
        </View>
        <SmartFolders data={folders} />

      </ScrollView>

      {/* BOTTOM DOCK */}
      <BottomDock
        activeTab="home"
        setActiveTab={handleTabChange}
        onOpenSettings={() => router.push('/settings')}
        onResetFilters={() => {
          setSearchQuery('');
          setIsSearchOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    paddingBottom: 140, // prevents BottomDock overlap
  },

  // TOP BAR
  header: {
    marginTop: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  brandBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1A2410',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#639922',
  },

  brandImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  brandTextContainer: {
    justifyContent: 'center',
  },

  brandLabel: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  brandSub: {
    color: '#8EC934',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  heroCard: {
    marginHorizontal: 18,
    marginTop: 20,
    backgroundColor: '#111111',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },

  greeting: {
    color: '#888888',
    fontSize: 14,
  },

  greetingName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
  },

  heroCopy: {
    color: '#888888',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8EC934',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    gap: 6,
  },

  saveText: {
    color: '#0A0A0A',
    fontSize: 15,
    fontWeight: '700',
  },

  sectionHeader: {
    paddingHorizontal: 18,
    marginBottom: 10,
    marginTop: 24,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
