import React, { useState, useEffect, useCallback } from 'react';
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
import * as Clipboard from 'expo-clipboard';
import ModalShell from './ModalShell';
import { useStore } from '../../hooks/useStore';
import { detectPlatform, isValidUrl, platformLabel } from '../../lib/detectPlatform';

interface PasteUrlModalProps {
  visible: boolean;
  value: string;
  onChangeText: (value: string) => void;
  onClose: () => void;
}

type SaveState = 'idle' | 'saving' | 'success' | 'error';

export default function PasteUrlModal({ visible, value, onChangeText, onClose }: PasteUrlModalProps) {
  const addSave = useStore((s) => s.addSave);
  const folders = useStore((s) => s.folders);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const detectedPlatform = value.trim() ? detectPlatform(value.trim()) : null;
  const urlValid = value.trim() ? isValidUrl(value.trim()) : false;

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSaveState('idle');
      setErrorMsg('');
      setSelectedFolderId(null);
    }
  }, [visible]);

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

      await addSave({
        title: trimmed.replace(/^https?:\/\//, '').split('/')[0] + ' save',
        url: trimmed,
        platform,
        folderId: selectedFolderId,
        savedAt: new Date().toISOString(),
      });

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
  }, [value, selectedFolderId, addSave, onChangeText, onClose]);

  const handleClose = useCallback(() => {
    onChangeText('');
    onClose();
  }, [onChangeText, onClose]);

  return (
    <ModalShell
      visible={visible}
      title="Paste URL"
      description="Paste a link to any TikTok, Instagram post, or webpage."
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
            }}
            placeholder="https://tiktok.com/@user/video/..."
            placeholderTextColor="#555"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={saveState !== 'saving'}
          />
          {value.length > 0 && saveState !== 'saving' && (
            <Pressable onPress={() => onChangeText('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#555" />
            </Pressable>
          )}
        </View>

        {/* Paste from Clipboard */}
        <Pressable
          onPress={handlePasteFromClipboard}
          style={styles.pasteBtn}
          disabled={saveState === 'saving'}
        >
          <Ionicons name="clipboard-outline" size={16} color="#8EC934" />
          <Text style={styles.pasteBtnText}>Paste from clipboard</Text>
        </Pressable>

        {/* Platform Detection Badge */}
        {detectedPlatform && urlValid && (
          <View style={styles.platformBadge}>
            <View style={styles.platformDot} />
            <Text style={styles.platformText}>{platformLabel(detectedPlatform)}</Text>
          </View>
        )}

        {/* Preview Card */}
        {urlValid ? (
          <View style={styles.previewCard}>
            <View style={styles.previewIcon}>
              <Ionicons
                name={detectedPlatform === 'tiktok' ? 'logo-tiktok' : detectedPlatform === 'instagram' ? 'logo-instagram' : 'globe-outline'}
                size={20}
                color="#8EC934"
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
          </View>
        ) : value.trim().length > 0 && !urlValid ? (
          <View style={styles.previewCard}>
            <View style={[styles.previewIcon, { backgroundColor: '#2C1A1A' }]}>
              <Ionicons name="alert-circle-outline" size={20} color="#FF453A" />
            </View>
            <View style={styles.previewInfo}>
              <Text style={[styles.previewUrl, { color: '#FF453A' }]}>Not a valid URL</Text>
              <Text style={styles.previewPlatform}>Enter a full URL starting with https://</Text>
            </View>
          </View>
        ) : null}

        {/* Folder Selection (compact) */}
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

        {/* Error Message */}
        {saveState === 'error' && errorMsg.length > 0 && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={14} color="#FF453A" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Success Message */}
        {saveState === 'success' && (
          <View style={styles.successRow}>
            <Ionicons name="checkmark-circle" size={14} color="#30D158" />
            <Text style={styles.successText}>Saved to your library!</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.secondaryButton}
            onPress={handleClose}
            disabled={saveState === 'saving'}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[
              styles.primaryButton,
              (!urlValid || saveState === 'saving' || saveState === 'success') &&
                styles.primaryButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!urlValid || saveState === 'saving' || saveState === 'success'}
          >
            {saveState === 'saving' ? (
              <ActivityIndicator color="#0A0A0A" size="small" />
            ) : saveState === 'success' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="checkmark" size={16} color="#0A0A0A" />
                <Text style={styles.primaryButtonText}>Saved</Text>
              </View>
            ) : (
              <Text style={styles.primaryButtonText}>Save URL</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ModalShell>
  );
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
    fontFamily: 'DMSans_400Regular',
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
    color: '#8EC934',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8EC934',
  },
  platformText: {
    color: '#8EC934',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#242424',
    marginBottom: 14,
    gap: 12,
  },
  previewIcon: {
    width: 40,
    height: 40,
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
    fontFamily: 'DMSans_500Medium',
  },
  previewPlatform: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'DMSans_400Regular',
  },
  folderSection: {
    marginBottom: 14,
  },
  folderLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'DMSans_500Medium',
  },
  folderChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  folderChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#1B1B1B',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  folderChipActive: {
    backgroundColor: 'rgba(142, 201, 52, 0.12)',
    borderColor: '#8EC934',
  },
  folderChipText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  folderChipTextActive: {
    color: '#8EC934',
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
    fontFamily: 'DMSans_500Medium',
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
    fontFamily: 'DMSans_500Medium',
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
    fontFamily: 'DMSans_700Bold',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#8EC934',
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
    fontFamily: 'DMSans_700Bold',
  },
});
