import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import ModalShell from './ModalShell';

interface NotesModalProps {
  visible: boolean;
  value: string;
  onChangeText: (value: string) => void;
  onClose: () => void;
}

export default function NotesModal({ visible, value, onChangeText, onClose }: NotesModalProps) {
  return (
    <ModalShell
      visible={visible}
      title="Notes"
      description="Capture notes, or attach a PDF / TXT file as a reference."
      onClose={onClose}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Write something..."
        placeholderTextColor="#777"
        style={[styles.input, styles.textArea]}
        multiline
      />

      <Pressable style={styles.attachButton} onPress={() => {}}>
        <Text style={styles.attachButtonText}>Attach PDF or TXT</Text>
      </Pressable>

      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryButton} onPress={onClose}>
          <Text style={styles.secondaryButtonText}>Close</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={onClose}>
          <Text style={styles.primaryButtonText}>Save note</Text>
        </Pressable>
      </View>
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
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1B1B1B',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  attachButton: {
    backgroundColor: '#1F1F1F',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  attachButtonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
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
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#8EC934',
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0A0A0A',
    fontWeight: '700',
  },
});
