import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string, color: string, icon: string) => void;
}

const ACCENT_BRIGHT = '#8EC934';

export default function CreateFolderModal({
  isOpen,
  onClose,
  onCreateFolder,
}: CreateFolderModalProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#8EC934');
  const [selectedIcon, setSelectedIcon] = useState('folder-sharp');

  // Reset fields on modal open
  useEffect(() => {
    if (isOpen) {
      setNewFolderName('');
      setSelectedColor('#8EC934');
      setSelectedIcon('folder-sharp');
    }
  }, [isOpen]);

  const handleCreate = () => {
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), selectedColor, selectedIcon);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.modalContent}>
          {/* Modal Drag handle indicator */}
          <View style={styles.dragHandle} />

          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Create Smart Folder</Text>
              <Text style={styles.modalSubtitle}>AI will auto-cluster similar saves here.</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={16} color="rgba(255,255,255,0.6)" />
            </Pressable>
          </View>

          {/* Live Interactive Preview Card */}
          <Text style={styles.label}>Live Preview</Text>
          <View style={styles.previewContainer}>
            <View style={{ width: 130, height: 112 }}>
              {/* Folder Main Body */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#111111',
                  borderWidth: 1.2,
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 14,
                  padding: 12,
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}
              >
                <View style={[styles.iconShieldPreview, { backgroundColor: selectedColor + '10', borderColor: selectedColor + '20' }]}>
                  <Ionicons name={selectedIcon as any} size={14} color={selectedColor} />
                </View>

                <View style={{ marginTop: 6 }}>
                  <Text style={styles.previewName} numberOfLines={1}>
                    {newFolderName.trim() || 'Untitled Folder'}
                  </Text>
                  <Text style={styles.previewCount}>
                    0 saves
                  </Text>
                </View>

                <View style={styles.previewMeter}>
                  <View style={[styles.previewMeterFill, { backgroundColor: selectedColor }]} />
                </View>
              </View>
            </View>
          </View>

          {/* Input Field */}
          <Text style={styles.label}>Folder Name</Text>
          <TextInput
            placeholder="e.g. Motion Design, Tutorials..."
            placeholderTextColor="rgba(255,255,255,0.2)"
            value={newFolderName}
            onChangeText={setNewFolderName}
            autoFocus
            style={[
              styles.input,
              { borderColor: newFolderName.trim() ? ACCENT_BRIGHT : 'rgba(255,255,255,0.05)' }
            ]}
          />

          {/* Curated Colors row */}
          <Text style={styles.label}>Select Curated Color</Text>
          <View style={styles.colorsRow}>
            {['#8EC934', '#FF6B35', '#bf97ff', '#ff8c9e', '#5ac8fa', '#ffcc00'].map((color) => {
              const isSelected = selectedColor === color;
              return (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: color,
                      borderColor: isSelected ? '#FFFFFF' : 'rgba(0,0,0,0.2)',
                      shadowColor: color,
                      shadowOpacity: isSelected ? 0.4 : 0,
                    }
                  ]}
                >
                  {isSelected && <Ionicons name="checkmark" size={14} color="#0A0A0A" />}
                </Pressable>
              );
            })}
          </View>

          {/* Curated Icons row */}
          <Text style={styles.label}>Select Icon Symbol</Text>
          <View style={styles.iconsRow}>
            {['folder-sharp', 'videocam-sharp', 'bulb-sharp', 'headset-sharp', 'color-palette-sharp', 'code-slash-sharp', 'text-sharp', 'image-sharp'].map((icon) => {
              const isSelected = selectedIcon === icon;
              return (
                <Pressable
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor: isSelected ? 'rgba(99,153,34,0.08)' : '#181818',
                      borderColor: isSelected ? '#639922' : 'rgba(255,255,255,0.04)',
                    }
                  ]}
                >
                  <Ionicons name={icon as any} size={18} color={isSelected ? '#8EC934' : 'rgba(255,255,255,0.35)'} />
                </Pressable>
              );
            })}
          </View>

          {/* Action CTAs */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={onClose}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleCreate}
              disabled={!newFolderName.trim()}
              style={[
                styles.createBtn,
                {
                  backgroundColor: newFolderName.trim() ? '#639922' : 'rgba(99,153,34,0.1)',
                  opacity: newFolderName.trim() ? 1 : 0.6,
                }
              ]}
            >
              <Text style={styles.createBtnText}>Create Folder</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 24,
    paddingVertical: 28,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontFamily: 'Syne_700Bold',
    fontSize: 20,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderStyle: 'dashed',
  },
  iconShieldPreview: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    color: '#FFFFFF',
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
  },
  previewCount: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
  },
  previewMeter: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  previewMeterFill: {
    height: '100%',
    width: '40%',
  },
  input: {
    backgroundColor: '#181818',
    borderWidth: 1.5,
    borderRadius: 14,
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    marginBottom: 20,
  },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  iconsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 28,
  },
  iconOption: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cancelBtnText: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
  createBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
});
