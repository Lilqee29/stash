import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useShareIntent } from 'expo-share-intent';
import { useStore } from '../hooks/useStore';
import { fetchVideoMetadata } from '../lib/fetchMetadata';

function detectPlatform(url: string): 'tiktok' | 'instagram' | 'behance' | 'dribbble' | 'other' {
  if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com') || url.includes('instagr.am')) return 'instagram';
  if (url.includes('behance.net')) return 'behance';
  if (url.includes('dribbble.com')) return 'dribbble';
  return 'other';
}

function getPlatformColor(platform: string) {
  switch (platform) {
    case 'tiktok': return '#FFFFFF';
    case 'instagram': return '#E1306C';
    case 'behance': return '#0057FF';
    case 'dribbble': return '#EA4C89';
    default: return '#8EC934';
  }
}

function getPlatformIcon(platform: string): string {
  switch (platform) {
    case 'tiktok': return 'logo-tiktok';
    case 'instagram': return 'logo-instagram';
    case 'behance': return 'briefcase-outline';
    case 'dribbble': return 'basketball-outline';
    default: return 'globe-outline';
  }
}

export default function ShareScreen() {
  const router = useRouter();
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent();
  const { addSave, folders, triggerEnrichment } = useStore();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<'tiktok' | 'instagram' | 'behance' | 'dribbble' | 'other'>('other');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showFolders, setShowFolders] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [creator, setCreator] = useState('');

  // Animations
  const slideAnim = React.useRef(new Animated.Value(80)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const checkAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 10 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (hasShareIntent && shareIntent) {
      // Extract URL from share intent
      const sharedUrl = shareIntent.webUrl || shareIntent.text || '';
      const sharedTitle = shareIntent.meta?.title || shareIntent.text || 'Shared Link';
      const detectedPlatform = detectPlatform(sharedUrl);

      setUrl(sharedUrl);
      setTitle(sharedTitle.length > 80 ? sharedTitle.substring(0, 80) : sharedTitle);
      setPlatform(detectedPlatform);

      // Fetch metadata in background
      if (sharedUrl) {
        fetchVideoMetadata(sharedUrl).then((meta) => {
          if (meta.thumbnail) setThumbnailUrl(meta.thumbnail);
          if (meta.creator) setCreator(meta.creator);
          // Use fetched title if share intent title is generic
          if (meta.title && !title.includes('Shared Link')) {
            // keep share intent title — it's usually better
          }
        }).catch(() => {
          // Silent fail — metadata is optional
        });
      }
    }
  }, [hasShareIntent, shareIntent]);

  const handleSave = async () => {
    if (!url.trim()) return;
    setSaving(true);

    try {
      await addSave({
        title: title.trim() || 'Shared Link',
        url: url.trim(),
        platform,
        savedAt: new Date().toISOString(),
        folderId: selectedFolder,
        contentType: 'default',
        thumbnailUrl: thumbnailUrl || undefined,
        creator: creator || undefined,
      });

      // Fire-and-forget: trigger Gemini enrichment in background
      const currentSaves = useStore.getState().saves;
      const newSave = currentSaves.find((s) => s.url === url.trim());
      if (newSave) {
        triggerEnrichment(newSave.id, url.trim());
      }

      // Success animation
      Animated.spring(checkAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();

      setSaved(true);
      resetShareIntent();

      // Auto-close after 1.5s
      setTimeout(() => {
        router.replace('/home');
      }, 1500);
    } catch (err) {
      console.error('Error saving share intent:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    resetShareIntent();
    router.back();
  };

  const platformColor = getPlatformColor(platform);
  const platformIcon = getPlatformIcon(platform);
  const selectedFolderName = folders.find(f => f.id === selectedFolder)?.name;

  if (saved) {
    return (
      <View style={styles.savedOverlay}>
        <Animated.View style={[styles.savedBadge, { transform: [{ scale: checkAnim }] }]}>
          <Ionicons name="checkmark-circle" size={64} color="#8EC934" />
          <Text style={styles.savedText}>Stashed!</Text>
          <Text style={styles.savedSub}>{title || 'Link saved to your library'}</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleDiscard} />

      <Animated.View
        style={[
          styles.sheet,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <SafeAreaView edges={['bottom']}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.platformBadge, { backgroundColor: platformColor + '20', borderColor: platformColor + '40' }]}>
                <Ionicons name={platformIcon as any} size={18} color={platformColor} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Save to Stash</Text>
                <Text style={[styles.headerPlatform, { color: platformColor }]}>
                  from {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Text>
              </View>
            </View>
            <Pressable style={styles.closeBtn} onPress={handleDiscard}>
              <Ionicons name="close" size={18} color="#666" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* URL Preview */}
            {url ? (
              <View style={styles.urlCard}>
                {thumbnailUrl ? (
                  <View style={styles.urlThumb}>
                    <Text style={{ fontSize: 12 }}>🎬</Text>
                  </View>
                ) : (
                  <Ionicons name="link" size={14} color="#555" />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.urlText} numberOfLines={1}>{url}</Text>
                  {creator ? (
                    <Text style={[styles.urlText, { marginTop: 2, color: '#8EC934' }]}>@{creator}</Text>
                  ) : null}
                </View>
              </View>
            ) : (
              <View style={styles.urlCard}>
                <ActivityIndicator size="small" color="#555" />
                <Text style={styles.urlText}>Reading shared link...</Text>
              </View>
            )}

            {/* Title Input */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>TITLE</Text>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Give it a name..."
                placeholderTextColor="#444"
                multiline
                maxLength={120}
              />
            </View>

            {/* Folder Picker */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>COLLECTION</Text>
              <Pressable
                style={styles.folderPicker}
                onPress={() => setShowFolders(!showFolders)}
              >
                <Ionicons name="folder-outline" size={16} color="#666" />
                <Text style={styles.folderPickerText}>
                  {selectedFolderName || 'Unsorted'}
                </Text>
                <Ionicons
                  name={showFolders ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color="#555"
                  style={{ marginLeft: 'auto' }}
                />
              </Pressable>

              {showFolders && (
                <View style={styles.folderList}>
                  <Pressable
                    style={[styles.folderRow, !selectedFolder && styles.folderRowActive]}
                    onPress={() => { setSelectedFolder(null); setShowFolders(false); }}
                  >
                    <Ionicons name="albums-outline" size={15} color={!selectedFolder ? '#8EC934' : '#555'} />
                    <Text style={[styles.folderRowText, !selectedFolder && { color: '#8EC934' }]}>
                      Unsorted
                    </Text>
                    {!selectedFolder && <Ionicons name="checkmark" size={14} color="#8EC934" style={{ marginLeft: 'auto' }} />}
                  </Pressable>
                  {folders.map(f => (
                    <Pressable
                      key={f.id}
                      style={[styles.folderRow, selectedFolder === f.id && styles.folderRowActive]}
                      onPress={() => { setSelectedFolder(f.id); setShowFolders(false); }}
                    >
                      <Ionicons name="folder-outline" size={15} color={selectedFolder === f.id ? '#8EC934' : '#555'} />
                      <Text style={[styles.folderRowText, selectedFolder === f.id && { color: '#8EC934' }]}>
                        {f.name}
                      </Text>
                      {selectedFolder === f.id && (
                        <Ionicons name="checkmark" size={14} color="#8EC934" style={{ marginLeft: 'auto' }} />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Platform Override */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>PLATFORM</Text>
              <View style={styles.platformRow}>
                {(['tiktok', 'instagram', 'behance', 'dribbble', 'other'] as const).map(p => (
                  <Pressable
                    key={p}
                    style={[
                      styles.platformChip,
                      platform === p && { backgroundColor: getPlatformColor(p) + '25', borderColor: getPlatformColor(p) },
                    ]}
                    onPress={() => setPlatform(p)}
                  >
                    <Ionicons
                      name={getPlatformIcon(p) as any}
                      size={13}
                      color={platform === p ? getPlatformColor(p) : '#555'}
                    />
                    <Text style={[styles.platformChipText, platform === p && { color: getPlatformColor(p) }]}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.actions}>
            <Pressable style={styles.discardBtn} onPress={handleDiscard}>
              <Text style={styles.discardText}>Discard</Text>
            </Pressable>
            <Pressable
              style={[styles.saveBtn, (!url || saving) && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={!url || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#0A0A0A" />
              ) : (
                <>
                  <Ionicons name="bookmark" size={16} color="#0A0A0A" />
                  <Text style={styles.saveBtnText}>Stash it</Text>
                </>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderBottomWidth: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  platformBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  headerPlatform: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#252525',
  },
  urlThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlText: {
    color: '#666',
    fontSize: 12,
    flex: 1,
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: '#555',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#252525',
    minHeight: 52,
  },
  folderPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#252525',
  },
  folderPickerText: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  folderList: {
    marginTop: 6,
    backgroundColor: '#161616',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#252525',
    overflow: 'hidden',
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  folderRowActive: {
    backgroundColor: 'rgba(142,201,52,0.07)',
  },
  folderRowText: {
    color: '#888',
    fontSize: 14,
  },
  platformRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  platformChipText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  discardBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  discardText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#8EC934',
    gap: 8,
  },
  saveBtnText: {
    color: '#0A0A0A',
    fontSize: 16,
    fontWeight: '800',
  },
  // Saved state
  savedOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedBadge: {
    alignItems: 'center',
    gap: 12,
  },
  savedText: {
    color: '#8EC934',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  savedSub: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
