import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function StorageSettingsScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const storageData = {
    total: 1024, // MB
    used: 342, // MB
    saves: 156,
    thumbnails: 128,
    cache: 58,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setIsLoading(false);
      } catch (err) {
        setLoadError('Unable to load storage data.');
        setIsLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleClearCache = () => {
    setIsClearing(true);
    setTimeout(() => {
      setIsClearing(false);
    }, 1500);
  };

  const getPercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Storage</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8EC934" />
          <Text style={styles.loadingText}>Loading storage info…</Text>
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
          <Text style={styles.headerTitle}>Storage</Text>
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

  const percentage = getPercentage(storageData.used, storageData.total);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Storage</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* STORAGE OVERVIEW */}
        <View style={styles.section}>
          <View style={styles.storageCard}>
            <View style={styles.storageHeader}>
              <View style={styles.storageIcon}>
                <Ionicons name="cloud-outline" size={28} color="#8EC934" />
              </View>
              <View style={styles.storageInfo}>
                <Text style={styles.storageUsed}>{storageData.used} MB</Text>
                <Text style={styles.storageTotal}>of {storageData.total} MB used</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <LinearGradient
                colors={['#8EC934', '#6B9928']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBar, { width: `${percentage}%` }]}
              />
            </View>
            <Text style={styles.percentageText}>{percentage}% used</Text>
          </View>
        </View>

        {/* BREAKDOWN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Breakdown</Text>
          <View style={styles.card}>
            <StorageItem
              icon="bookmark-outline"
              label="Saves"
              value={`${storageData.saves} MB`}
              color="#8EC934"
            />
            <View style={styles.divider} />
            <StorageItem
              icon="image-outline"
              label="Thumbnails"
              value={`${storageData.thumbnails} MB`}
              color="#4FD1FF"
            />
            <View style={styles.divider} />
            <StorageItem
              icon="cube-outline"
              label="Cache"
              value={`${storageData.cache} MB`}
              color="#FF8C42"
            />
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.card}>
            <Pressable
              style={[styles.actionRow, isClearing && styles.actionRowDisabled]}
              onPress={handleClearCache}
              disabled={isClearing}
            >
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                </View>
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Clear cache</Text>
                  <Text style={styles.actionDesc}>Free up {storageData.cache} MB</Text>
                </View>
              </View>
              {isClearing ? (
                <ActivityIndicator size={16} color="#8EC934" />
              ) : (
                <Ionicons name="chevron-forward" size={18} color="#666" />
              )}
            </Pressable>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#8EC934" />
            <Text style={styles.infoText}>
              Cache is temporary data that helps the app run faster. Clearing it won't delete your saves.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StorageItem({
  icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.storageItem}>
      <View style={[styles.storageItemIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.storageItemLabel}>{label}</Text>
      <Text style={styles.storageItemValue}>{value}</Text>
    </View>
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
  storageCard: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storageIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(142, 201, 52, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  storageInfo: {
    flex: 1,
  },
  storageUsed: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  storageTotal: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    color: '#8EC934',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
  },
  storageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  storageItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  storageItemLabel: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  storageItemValue: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#1f1f1f',
    marginLeft: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionRowDisabled: {
    opacity: 0.5,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  actionDesc: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(142, 201, 52, 0.08)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(142, 201, 52, 0.2)',
  },
  infoText: {
    flex: 1,
    color: '#AAA',
    fontSize: 13,
    lineHeight: 18,
  },
});
