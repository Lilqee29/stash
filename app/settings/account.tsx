import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AccountSettingsScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [email, setEmail] = useState('razal@example.com');
  const [username, setUsername] = useState('razal');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setIsLoading(false);
      } catch (err) {
        setLoadError('Unable to load account data.');
        setIsLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    if (email.trim() === '' || username.trim() === '') {
      Alert.alert('Required Fields', 'Email and username are required');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New passwords do not match');
      return;
    }

    if (newPassword && !currentPassword) {
      Alert.alert('Current Password Required', 'Enter your current password to change password');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert('Success', 'Account settings updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.', [
              { text: 'OK', onPress: () => router.replace('/(auth)/sign-in') },
            ]);
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Account</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8EC934" />
          <Text style={styles.loadingText}>Loading account settings…</Text>
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
          <Text style={styles.headerTitle}>Account</Text>
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
        <Text style={styles.headerTitle}>Account</Text>
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
        {/* EMAIL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* USERNAME */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Username</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor="#555"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* PASSWORD SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <Text style={styles.sectionDesc}>Leave blank to keep current password</Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current password"
              placeholderTextColor="#555"
              secureTextEntry
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password"
              placeholderTextColor="#555"
              secureTextEntry
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#555"
              secureTextEntry
            />
          </View>
        </View>

        {/* DANGER ZONE */}
        <View style={[styles.section, styles.dangerSection]}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Text style={styles.dangerDesc}>Irreversible actions</Text>

          <Pressable style={styles.dangerButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </Pressable>
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
  sectionDesc: {
    color: '#666',
    fontSize: 13,
    marginTop: -8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#222',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 14,
  },
  dangerSection: {
    marginTop: 32,
    paddingBottom: 20,
  },
  dangerTitle: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '700',
  },
  dangerDesc: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 12,
  },
  dangerButtonText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '700',
  },
});
