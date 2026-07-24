import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ModalShell from './ModalShell';

interface ScreenshotsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ScreenshotsModal({ visible, onClose }: ScreenshotsModalProps) {
  return (
    <ModalShell
      visible={visible}
      title="Screenshots"
      description="Add a screenshot from your photo library for a quick preview."
      onClose={onClose}
    >
      <View style={styles.previewPlaceholder}>
        <Ionicons name="image-outline" size={40} color="#555" />
        <Text style={styles.previewText}>Screenshot preview will appear here.</Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={() => {}}>
        <Text style={styles.primaryButtonText}>Open photo library</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={onClose}>
        <Text style={styles.secondaryButtonText}>Close</Text>
      </Pressable>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#222',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  description: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 18,
  },
  previewPlaceholder: {
    height: 180,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#181818',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  previewText: {
    color: '#666',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: '#8EC934',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#0A0A0A',
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#444',
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
