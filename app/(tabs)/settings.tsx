import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';



export default function SettingsScreen() {
  const router = useRouter();

  const [autoSync, setAutoSync] = useState(true);
  const [smartSearch, setSmartSearch] = useState(true);
  const [notifications, setNotifications] = useState(false);

  const quickSettings = [
    {
      key: 'autoSync',
      label: 'Auto sync',
      description: 'Keep your saves updated across devices.',
      value: autoSync,
      onValueChange: setAutoSync,
    },
    {
      key: 'smartSearch',
      label: 'Smart search',
      description: 'Semantic search across all saved content.',
      value: smartSearch,
      onValueChange: setSmartSearch,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      description: 'Get updates for new saves and activity.',
      value: notifications,
      onValueChange: setNotifications,
    },
  ];

  const detailSettings = [
    {
      key: 'account',
      label: 'Account',
      description: 'Email, password, and account settings',
      icon: 'person-outline',
      onPress: () => router.push('/settings/account'),
    },
    {
      key: 'appearance',
      label: 'Appearance',
      description: 'Theme, accessibility, and display',
      icon: 'color-palette-outline',
      onPress: () => router.push('/settings/appearance'),
    },
    {
      key: 'notifications',
      label: 'Notification Preferences',
      description: 'Manage how you get notified',
      icon: 'notifications-outline',
      onPress: () => router.push('/settings/notifications'),
    },
    {
      key: 'storage',
      label: 'Storage',
      description: 'View and manage your storage',
      icon: 'cloud-outline',
      onPress: () => router.push('/settings/storage'),
    },
    {
      key: 'about',
      label: 'About',
      description: 'App info, credits, and legal',
      icon: 'information-circle-outline',
      onPress: () => router.push('/settings/about'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.push('/home')}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.title}>Settings</Text>
        </View>

        {/* INTRO CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Control Center</Text>
          <Text style={styles.cardText}>
            Manage sync, search, and notifications in one clean space.
          </Text>
        </View>

      {/* QUICK SETTINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Settings</Text>
        {quickSettings.map((item) => (
          <View key={item.key} style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Text style={styles.settingDesc}>{item.description}</Text>
            </View>

            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{
                false: '#222222',
                true: 'rgba(142,201,52,0.3)',
              }}
              thumbColor={item.value ? '#8EC934' : '#555555'}
            />
          </View>
        ))}
      </View>

      {/* DETAIL SETTINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>More Settings</Text>
        {detailSettings.map((item) => (
          <Pressable key={item.key} style={styles.settingRow} onPress={item.onPress}>
            <View style={styles.settingText}>
              <View style={styles.settingLabelRow}>
                <Ionicons name={item.icon as any} size={18} color="#8EC934" style={styles.settingIcon} />
                <Text style={styles.settingLabel}>{item.label}</Text>
              </View>
              <Text style={styles.settingDesc}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#666" />
          </Pressable>
        ))}
      </View>

      {/* SAVE BUTTON */}
      <Pressable style={styles.saveButton} onPress={() => router.push('/home')}>
        <Text style={styles.saveText}>Save changes</Text>
      </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  card: {
    marginTop: 22,
    backgroundColor: '#111111',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },

  cardText: {
    color: '#888888',
    fontSize: 13,
    lineHeight: 20,
  },

  section: {
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111111',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },

  settingText: {
    flex: 1,
    paddingRight: 10,
  },

  settingLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingIcon: {
    marginRight: 4,
  },

  settingDesc: {
    color: '#888888',
    fontSize: 12,
    lineHeight: 18,
  },

  saveButton: {
    marginTop: 24,
    backgroundColor: '#8EC934',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  saveText: {
    color: '#0A0A0A',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
