import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NotificationPreferencesScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [newSaves, setNewSaves] = useState(true);
  const [folderUpdates, setFolderUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [mentions, setMentions] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setIsLoading(false);
      } catch (err) {
        setLoadError('Unable to load notification settings.');
        setIsLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      router.back();
    }, 800);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8EC934" />
          <Text style={styles.loadingText}>Loading notification settings…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#E05252" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              setLoadError(null);
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 600);
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size={16} color="#0A0A0A" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* DELIVERY METHODS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Methods</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <View style={styles.iconRow}>
                  <Ionicons name="notifications-outline" size={20} color="#8EC934" />
                  <Text style={styles.settingLabel}>Push notifications</Text>
                </View>
                <Text style={styles.settingDesc}>Get notified on your device</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#222222', true: 'rgba(142,201,52,0.3)' }}
                thumbColor={pushNotifications ? '#8EC934' : '#555555'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <View style={styles.iconRow}>
                  <Ionicons name="mail-outline" size={20} color="#4FD1FF" />
                  <Text style={styles.settingLabel}>Email notifications</Text>
                </View>
                <Text style={styles.settingDesc}>Receive updates via email</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#222222', true: 'rgba(142,201,52,0.3)' }}
                thumbColor={emailNotifications ? '#8EC934' : '#555555'}
              />
            </View>
          </View>
        </View>

        {/* NOTIFICATION TYPES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Notify</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>New saves</Text>
                <Text style={styles.settingDesc}>When items are saved to your folders</Text>
              </View>
              <Switch
                value={newSaves}
                onValueChange={setNewSaves}
                trackColor={{ false: '#222222', true: 'rgba(142,201,52,0.3)' }}
                thumbColor={newSaves ? '#8EC934' : '#555555'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Folder updates</Text>
                <Text style={styles.settingDesc}>When folders are modified</Text>
              </View>
              <Switch
                value={folderUpdates}
                onValueChange={setFolderUpdates}
                trackColor={{ false: '#222222', true: 'rgba(142,201,52,0.3)' }}
                thumbColor={folderUpdates ? '#8EC934' : '#555555'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Weekly digest</Text>
                <Text style={styles.settingDesc}>Summary of your activity</Text>
              </View>
              <Switch
                value={weeklyDigest}
                onValueChange={setWeeklyDigest}
                trackColor={{ false: '#222222', true: 'rgba(142,201,52,0.3)' }}
                thumbColor={weeklyDigest ? '#8EC934' : '#555555'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Mentions</Text>
                <Text style={styles.settingDesc}>When someone mentions you</Text>
              </View>
              <Switch
                value={mentions}
                onValueChange={setMentions}
                trackColor={{ false: '#222222', true: 'rgba(142,201,52,0.3)' }}
                thumbColor={mentions ? '#8EC934' : '#555555'}
              />
            </View>
          </View>
        </View>

        {/* QUIET HOURS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Enable quiet hours</Text>
                <Text style={styles.settingDesc}>Pause notifications overnight</Text>
              </View>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: '#222222', true: 'rgba(142,201,52,0.3)' }}
                thumbColor="#555555"
              />
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#8EC934',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#0A0A0A',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#8EC934',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#0A0A0A',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingText: {
    flex: 1,
    paddingRight: 12,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDesc: {
    color: '#888',
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#1f1f1f',
    marginLeft: 16,
  },
});
