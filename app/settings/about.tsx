import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AboutSettingsScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setIsLoading(false);
      } catch (err) {
        setLoadError('Unable to load about info.');
        setIsLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      // Handle error
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>About</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8EC934" />
          <Text style={styles.loadingText}>Loading…</Text>
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
          <Text style={styles.headerTitle}>About</Text>
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
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* APP INFO */}
        <View style={styles.section}>
          <View style={styles.appInfoCard}>
            <View style={styles.appLogo}>
              <Ionicons name="bookmark" size={40} color="#8EC934" />
            </View>
            <Text style={styles.appName}>Stash</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appTagline}>Your bookmark brain</Text>
          </View>
        </View>

        {/* LINKS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Links</Text>
          <View style={styles.card}>
            <AboutLink
              icon="globe-outline"
              label="Website"
              value="stash.app"
              onPress={() => handleLink('https://stash.app')}
            />
            <View style={styles.divider} />
            <AboutLink
              icon="document-text-outline"
              label="Privacy Policy"
              value="View policy"
              onPress={() => handleLink('https://stash.app/privacy')}
            />
            <View style={styles.divider} />
            <AboutLink
              icon="file-tray-outline"
              label="Terms of Service"
              value="View terms"
              onPress={() => handleLink('https://stash.app/terms')}
            />
            <View style={styles.divider} />
            <AboutLink
              icon="help-circle-outline"
              label="Help & Support"
              value="Get help"
              onPress={() => handleLink('https://stash.app/help')}
            />
          </View>
        </View>

        {/* SOCIAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social</Text>
          <View style={styles.card}>
            <AboutLink
              icon="logo-twitter"
              label="Twitter"
              value="@stashapp"
              onPress={() => handleLink('https://twitter.com/stashapp')}
            />
            <View style={styles.divider} />
            <AboutLink
              icon="logo-instagram"
              label="Instagram"
              value="@stashapp"
              onPress={() => handleLink('https://instagram.com/stashapp')}
            />
          </View>
        </View>

        {/* CREDITS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credits</Text>
          <View style={styles.card}>
            <View style={styles.creditItem}>
              <Text style={styles.creditLabel}>Made with</Text>
              <Text style={styles.creditValue}>❤️ by the Stash team</Text>
            </View>
          </View>
        </View>

        {/* LICENSE */}
        <View style={styles.section}>
          <View style={styles.licenseCard}>
            <Text style={styles.licenseText}>
              © 2024 Stash. All rights reserved.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function AboutLink({
  icon,
  label,
  value,
  onPress,
}: {
  icon: any;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.linkRow} onPress={onPress}>
      <View style={styles.linkLeft}>
        <Ionicons name={icon} size={20} color="#666" style={styles.linkIcon} />
        <Text style={styles.linkLabel}>{label}</Text>
      </View>
      <View style={styles.linkRight}>
        <Text style={styles.linkValue}>{value}</Text>
        <Ionicons name="chevron-forward" size={16} color="#444" />
      </View>
    </Pressable>
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
  appInfoCard: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  appLogo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: 'rgba(142, 201, 52, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  appVersion: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  appTagline: {
    color: '#8EC934',
    fontSize: 13,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkIcon: {
    marginRight: 12,
  },
  linkLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  linkRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkValue: {
    color: '#888',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#1f1f1f',
    marginLeft: 16,
  },
  creditItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  creditLabel: {
    color: '#888',
    fontSize: 14,
  },
  creditValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  licenseCard: {
    padding: 16,
    alignItems: 'center',
  },
  licenseText: {
    color: '#666',
    fontSize: 12,
  },
});
