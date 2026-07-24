import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'save' | 'folder' | 'system';
  read: boolean;
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'New save added',
    description: 'A new item was added to your “UI Inspiration” folder.',
    time: '2m ago',
    type: 'save',
    read: false,
  },
  {
    id: '2',
    title: 'Folder updated',
    description: 'Motion Design folder now has 25 items.',
    time: '1h ago',
    type: 'folder',
    read: false,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = () => {
    setLoading(true);
    setError(null);
    const t = setTimeout(() => {
      try {
        setNotifications(MOCK_NOTIFICATIONS);
      } catch (err) {
        setError('Unable to load notifications right now.');
      } finally {
        setLoading(false);
      }
    }, 700);
    return () => clearTimeout(t);
  };

  useEffect(() => {
    const clearTimer = loadNotifications();
    return () => clearTimer && clearTimer();
  }, []);

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'save':
        return 'bookmark-outline';
      case 'folder':
        return 'folder-outline';
      case 'system':
        return 'notifications-outline';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Notifications</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#888" />
          <Text style={styles.loadingText}>Loading notifications…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>

        <Text style={styles.title}>Notifications</Text>

        <View style={{ width: 22 }} />
      </View>

      {error ? (
        <View style={styles.centered}>
          <Ionicons name="warning-outline" size={44} color="#E05252" />
          <Text style={styles.emptyTitle}>Could not load notifications</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadNotifications}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (!notifications || notifications.length === 0) ? (
        <View style={styles.centered}>
          <Ionicons name="notifications-outline" size={44} color="#444" />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptySubtitle}>You're all caught up.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/notifications/${item.id}`)}>
              <View style={styles.iconBox}>
                <Ionicons name={getIcon(item.type)} size={20} color="#AAA" />
              </View>

              <View style={styles.content}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </Pressable>
          )}
        />
      )}
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
    paddingVertical: 10,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  list: {
    padding: 16,
    paddingTop: 28,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8EC934',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  content: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardDesc: { color: '#888', fontSize: 12, marginTop: 4 },
  time: { color: '#555', fontSize: 11, marginTop: 6 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#888', marginTop: 12 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptySubtitle: { color: '#888', marginTop: 6, textAlign: 'center', maxWidth: 250 },
  retryButton: {
    marginTop: 18,
    backgroundColor: '#8EC934',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: {
    color: '#0A0A0A',
    fontWeight: '700',
  },
});
