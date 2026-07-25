import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const ACCENT_BRIGHT = '#8EC934';

export default function SettingsOverlay({
  isOpen,
  onClose,
  onLogout,
}: SettingsOverlayProps) {
  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={Platform.OS === 'ios' ? false : true}
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
      onRequestClose={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onClose();
      }}
    >
      <View style={[styles.settingsModalContainer, Platform.OS === 'ios' && { backgroundColor: '#0A0A0A', flex: 1 }]}>
        <SafeAreaView style={{ flex: 1 }}>
          
          {/* Settings Header */}
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Settings</Text>
            <Pressable onPress={onClose} style={styles.settingsCloseBtn}>
              <Ionicons name="close-sharp" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Config list */}
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            
            {/* Account profile card */}
            <View style={styles.profileCard}>
              <View style={styles.profileAvatar}>
                <Text style={{ color: '#0A0A0A', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}>IQ</Text>
              </View>
              <View>
                <Text style={{ color: '#FFFFFF', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}>Ibrahim Qoyum</Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 }}>ibrahim@stash.app</Text>
              </View>
            </View>

            {/* Preferences group */}
            <View style={styles.settingsGroup}>
              <Text style={styles.settingsGroupHeader}>ACCOUNT PREFERENCES</Text>

              <Pressable style={styles.settingsRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="sync" size={16} color="rgba(255,255,255,0.5)" style={{ marginRight: 12 }} />
                  <Text style={styles.settingsRowText}>Re-import saves history</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
              </Pressable>

              <Pressable style={styles.settingsRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="notifications-outline" size={16} color="rgba(255,255,255,0.5)" style={{ marginRight: 12 }} />
                  <Text style={styles.settingsRowText}>Weekly Sunday summary digest</Text>
                </View>
                <Ionicons name="toggle" size={20} color={ACCENT_BRIGHT} />
              </Pressable>

              <Pressable style={styles.settingsRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="cloud-download-outline" size={16} color="rgba(255,255,255,0.5)" style={{ marginRight: 12 }} />
                  <Text style={styles.settingsRowText}>Export backup data</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
              </Pressable>
            </View>

            {/* AI parameters details */}
            <View style={styles.settingsGroup}>
              <Text style={styles.settingsGroupHeader}>AI MODEL PARAMETERS</Text>
              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="sparkles-outline" size={16} color={ACCENT_BRIGHT} style={{ marginRight: 12 }} />
                  <Text style={styles.settingsRowText}>Confidence threshold (0.70)</Text>
                </View>
                <Text style={{ color: ACCENT_BRIGHT, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>Active</Text>
              </View>
            </View>

            {/* Logout button */}
            <Pressable
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                onLogout();
              }}
              style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.8 }]}
            >
              <Ionicons name="log-out" size={16} color="#E05252" style={{ marginRight: 8 }} />
              <Text style={{ color: '#E05252', fontFamily: 'Inter_700Bold', fontSize: 13 }}>Logout from Stash</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  settingsModalContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 12 : 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  settingsTitle: {
    color: '#ffffff',
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
  },
  settingsCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 28,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8EC934',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  settingsGroupHeader: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 10,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  settingsRowText: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(224,82,82,0.2)',
    backgroundColor: 'rgba(224,82,82,0.05)',
    marginTop: 20,
  },
});
