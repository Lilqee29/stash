import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ModalShellProps {
  visible: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

export default function ModalShell({
  visible,
  title,
  description,
  onClose,
  children,
  contentStyle,
}: ModalShellProps) {
  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, contentStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={18} color="#888" />
            </Pressable>
          </View>

          {description ? <Text style={styles.description}>{description}</Text> : null}

          {children}
        </View>
      </View>
    </Modal>
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
});
