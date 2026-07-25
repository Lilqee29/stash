import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform as RNPlatform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import ModalShell from './ModalShell';
import { useStore } from '../../hooks/useStore';
import { detectPlatform, isValidUrl, platformLabel } from '../../lib/detectPlatform';
import {
  fetchVideoMetadata,
  getDisplayTitle,
  getPreviewSubtitle,
  VideoMetadata,
} from '../../lib/fetchMetadata';

interface PasteUrlModalProps {
  visible: boolean;
  value: string;
  onChangeText: (value: string) => void;
  onClose: () => void;
}

type SaveState = 'idle' | 'fetching' | 'preview' | 'saving' | 'success' | 'error';

const ACCENT = '#8EC934';

export default function PasteUrlModal({ visible, value, onChangeText, onClose }: PasteUrlModalProps) {
  const addSave = useStore((s) => s.addSave);
  const triggerEnrichment = useStore((s) => s.triggerEnrichment);
  const folders = useStore((s) => s.folders);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [editableTitle, setEditableTitle] = useState('');
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const detectedPlatform = value.trim() ? detectPlatform(value.trim()) : null;
  const urlValid = value.trim() ? isValidUrl(value.trim()) : false;

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSaveState('idle');
      setErrorMsg('');
      setSelectedFolderId(null);
      setMetadata(null);
      setEditableTitle('');
    }
  }, [visible]);

  // Auto-fetch metadata when URL stabilizes
  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    if (!urlValid || saveState === 'saving' || saveState === 'success') {
      return;
    }

    // Debounce: wait 600ms after user stops typing
    fetchTimeoutRef.current = setTimeout(async () => {
      setSaveState('fetching');
      try {
        const meta = await fetchVideoMetadata(value.trim());
        setMetadata(meta);
        setEditableTitle(getDisplayTitle(meta));
        setSaveState('preview');
      } catch {
        setSaveState('idle');
      }
    }, 600);

    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, [value, urlValid]);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        onChangeText(text.trim());
      }
    } catch {
      // Clipboard access failed silently
    }
  }, [onChangeText]);

  const handleSave = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || !isValidUrl(trimmed)) {
      setErrorMsg('Please enter a valid URL');
      setSaveState('error');
      return;
    }

    setSaveState('saving');
    setErrorMsg('');

    try {
      const platform = detectPlatform(trimmed);
      const title = editableTitle.trim() || metadata?.title || trimmed.replace(/^https?:\/\//, '').split('/')[0];

      await addSave({
        title,
        url: trimmed,
        platform,
        folderId: selectedFolderId, // null = unsorted
        savedAt: new Date().toISOString(),
        thumbnailUrl: metadata?.thumbnail || undefined,
        creator: metadata?.creator || undefined,
        description: metadata?.description || undefined,
        contentType: metadata?.contentType || undefined,
      });

      // Fire-and-forget: trigger Gemini enrichment in background
      // Get the save ID from the store (it was just added)
      const currentSaves = useStore.getState().saves;
      const newSave = currentSaves.find((s) => s.url === trimmed);
      if (newSave) {
        triggerEnrichment(newSave.id, trimmed);
      }

      setSaveState('success');

      // Auto-close after brief success feedback
      setTimeout(() => {
        onChangeText('');
        onClose();
      }, 1200);
    } catch (err) {
      setSaveState('error');
      setErrorMsg('Failed to save. Please try again.');
    }
  }, [value, selectedFolderId, editableTitle, metadata, addSave, onChangeText, onClose]);

  const handleClose = useCallback(() => {
    onChangeText('');
    onClose();
  }, [onChangeText, onClose]);

  const isWorking = saveState === 'fetching' || saveState === 'saving';
  const hasPreview = metadata && (saveState === 'preview' || saveState === 'saving' || saveState === 'success');

  return (
    <ModalShell
      visible={visible}
      title="Paste URL"
      description="Paste a link to any TikTok, Instagram reel, or webpage."
      onClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={RNPlatform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* URL Input */}
        <View style={styles.inputRow}>
          <TextInput
            value={value}
            onChangeText={(text) => {
              onChangeText(text);
              if (saveState === 'error') setSaveState('idle');
              if (saveState === 'preview') {
                setSaveState('idle');
                setMetadata(null);
              }
            }}
            placeholder="https://instagram.com/reel/..."
            placeholderTextColor="#555"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!isWorking}
          />
          {value.length > 0 && !isWorking && (
            <Pressable onPress={() => { onChangeText(''); setMetadata(null); setSaveState('idle'); }} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#555" />
            </Pressable>
          )}
        </View>

        {/* Paste from Clipboard */}
        <Pressable
          onPress={handlePasteFromClipboard}
          style={styles.pasteBtn}
          disabled={isWorking}
        >
          <Ionicons name="clipboard-outline" size={16} color={ACCENT} />
          <Text style={styles.pasteBtnText}>Paste from clipboard</Text>
        </Pressable>

        {/* ── RICH PREVIEW (when metadata loaded) ──────────── */}
        {hasPreview && metadata && (
          <Animated.View entering={FadeIn.duration(250)} style={styles.previewCard}>
            {/* Thumbnail */}
            {metadata.thumbnail ? (
              <Image
                source={{ uri: metadata.thumbnail }}
                style={styles.thumbnail}
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                <Ionicons
                  name={
                    metadata.platform === 'instagram'
                      ? 'logo-instagram'
                      : metadata.platform === 'tiktok'
                      ? 'logo-tiktok'
                      : 'globe-outline'
                  }
                  size={28}
                  color="#555"
                />
              </View>
            )}

            {/* Info + Editable Title */}
            <View style={styles.previewInfo}>
              {/* Platform badge */}
              <View style={styles.platformBadgeRow}>
                <View style={[styles.platformDot, { backgroundColor: getPlatformColor(metadata.platform) }]} />
                <Text style={styles.platformBadgeText}>
                  {platformLabel(metadata.platform)}
                </Text>
                {metadata.contentType && metadata.contentType !== 'default' && (
                  <>
                    <Text style={styles.platformSep}>·</Text>
                    <Text style={styles.platformBadgeText}>
                      {metadata.contentType.charAt(0).toUpperCase() + metadata.contentType.slice(1)}
                    </Text>
                  </>
                )}
              </View>

              {/* Editable title */}
              <TextInput
                value={editableTitle}
                onChangeText={setEditableTitle}
                style={styles.titleInput}
                placeholder="Enter title..."
                placeholderTextColor="#555"
                numberOfLines={2}
                multiline
                editable={!isWorking}
              />

              {/* Creator / subtitle */}
              {metadata.creator ? (
                <Text style={styles.creatorText} numberOfLines={1}>
                  @{metadata.creator}
                </Text>
              ) : null}
            </View>
          </Animated.View>
        )}

        {/* ── SIMPLE PREVIEW (before metadata loads) ────────── */}
        {!hasPreview && urlValid && (
          <View style={styles.previewCard}>
            <View style={styles.previewIcon}>
              <Ionicons
                name={
                  detectedPlatform === 'tiktok'
                    ? 'logo-tiktok'
                    : detectedPlatform === 'instagram'
                    ? 'logo-instagram'
                    : 'globe-outline'
                }
                size={20}
                color={ACCENT}
              />
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewUrl} numberOfLines={1}>
                {value.trim().replace(/^https?:\/\//, '')}
              </Text>
              <Text style={styles.previewPlatform}>
                {detectedPlatform ? platformLabel(detectedPlatform) : 'Web'} · Ready to save
              </Text>
            </View>
            {saveState === 'fetching' && (
              <ActivityIndicator size="small" color={ACCENT} />
            )}
          </View>
        )}

        {/* Invalid URL */}
        {value.trim().length > 0 && !urlValid && (
          <View style={styles.previewCard}>
            <View style={[styles.previewIcon, { backgroundColor: '#2C1A1A' }]}>
              <Ionicons name="alert-circle-outline" size={20} color="#FF453A" />
            </View>
            <View style={styles.previewInfo}>
              <Text style={[styles.previewUrl, { color: '#FF453A' }]}>Not a valid URL</Text>
              <Text style={styles.previewPlatform}>Enter a full URL starting with https://</Text>
            </View>
          </View>
        )}

        {/* ── FOLDER SELECTION ──────────────────────────────── */}
        {folders.length > 0 && (
          <View style={styles.folderSection}>
            <Text style={styles.folderLabel}>Save to folder</Text>
            <View style={styles.folderChips}>
              <Pressable
                onPress={() => setSelectedFolderId(null)}
                style={[
                  styles.folderChip,
                  selectedFolderId === null && styles.folderChipActive,
                ]}
              >
                <Ionicons
                  name="folder-outline"
                  size={13}
                  color={selectedFolderId === null ? ACCENT : '#888'}
                />
                <Text
                  style={[
                    styles.folderChipText,
                    selectedFolderId === null && styles.folderChipTextActive,
                  ]}
                >
                  Unsorted
                </Text>
              </Pressable>
              {folders.slice(0, 4).map((f) => (
                <Pressable
                  key={f.id}
                  onPress={() => setSelectedFolderId(f.id)}
                  style={[
                    styles.folderChip,
                    selectedFolderId === f.id && styles.folderChipActive,
                  ]}
                >
                  <Ionicons
                    name="folder-outline"
                    size={13}
                    color={selectedFolderId === f.id ? ACCENT : '#888'}
                  />
                  <Text
                    style={[
                      styles.folderChipText,
                      selectedFolderId === f.id && styles.folderChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {f.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ── STATUS MESSAGES ────────────────────────────────── */}
        {saveState === 'error' && errorMsg.length > 0 && (
          <Animated.View entering={FadeInDown.duration(200)} style={styles.errorRow}>
            <Ionicons name="alert-circle" size={14} color="#FF453A" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </Animated.View>
        )}

        {saveState === 'success' && (
          <Animated.View entering={FadeInDown.duration(200)} style={styles.successRow}>
            <Ionicons name="checkmark-circle" size={14} color="#30D158" />
            <Text style={styles.successText}>Saved to your library!</Text>
          </Animated.View>
        )}

        {/* ── ACTION BUTTONS ─────────────────────────────────── */}
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.secondaryButton}
            onPress={handleClose}
            disabled={isWorking}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[
              styles.primaryButton,
              (!urlValid || isWorking || saveState === 'success') &&
                styles.primaryButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!urlValid || isWorking || saveState === 'success'}
          >
            {saveState === 'fetching' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator color="#0A0A0A" size="small" />
                <Text style={styles.primaryButtonText}>Fetching...</Text>
              </View>
            ) : saveState === 'saving' ? (
              <ActivityIndicator color="#0A0A0A" size="small" />
            ) : saveState === 'success' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="checkmark" size={16} color="#0A0A0A" />
                <Text style={styles.primaryButtonText}>Saved</Text>
              </View>
            ) : (
              <Text style={styles.primaryButtonText}>
                {hasPreview ? 'Save to Stash' : 'Save URL'}
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ModalShell>
  );
}

function getPlatformColor(platform: string): string {
  switch (platform) {
    case 'tiktok':
      return '#EE1D52';
    case 'instagram':
      return '#E1306C';
    default:
      return ACCENT;
  }
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B1B1B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  clearBtn: {
    padding: 4,
  },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: 'rgba(142, 201, 52, 0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(142, 201, 52, 0.15)',
    marginBottom: 14,
  },
  pasteBtnText: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_500Medium',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#242424',
    marginBottom: 14,
    gap: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#222',
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(142, 201, 52, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
  },
  previewUrl: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_500Medium',
  },
  previewPlatform: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'Inter_400Regular',
  },
  platformBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  platformDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  platformBadgeText: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  platformSep: {
    color: '#555',
    fontSize: 11,
  },
  titleInput: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    padding: 0,
    marginBottom: 2,
  },
  creatorText: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  folderSection: {
    marginBottom: 14,
  },
  folderLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Inter_500Medium',
  },
  folderChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#1B1B1B',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  folderChipActive: {
    backgroundColor: 'rgba(142, 201, 52, 0.12)',
    borderColor: ACCENT,
  },
  folderChipText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_500Medium',
  },
  folderChipTextActive: {
    color: ACCENT,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  successText: {
    color: '#30D158',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: '#0A0A0A',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
});
