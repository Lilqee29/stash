import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ModalShell from './ModalShell';

interface BulkImportModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function BulkImportModal({ visible, onClose }: BulkImportModalProps) {
  return (
    <ModalShell
      visible={visible}
      title="Bulk Import"
      description="Import multiple items at once from supported platforms."
      onClose={onClose}
    >
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>What you can do</Text>
        <Text style={styles.infoText}>Add multiple links, notes, or screenshots in a single flow. This screen is for layout only.</Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={() => {}}>
        <Text style={styles.primaryButtonText}>Choose source</Text>
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
  infoBox: {
    backgroundColor: '#181818',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 18,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    color: '#888',
    fontSize: 13,
    lineHeight: 20,
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
