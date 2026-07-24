import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'save' | 'folder' | 'system';
  read: boolean;
  fullContent?: string;
  relatedItem?: {
    id: string;
    title: string;
    type: 'save' | 'folder';
  };
};

const MOCK_NOTIFICATIONS: Record<string, NotificationItem> = {
  '1': {
    id: '1',
    title: 'New save added',
    description: 'A new item was added to your "UI Inspiration" folder.',
    time: '2m ago',
    type: 'save',
    read: false,
    fullContent: 'A new save has been added to your "UI Inspiration" folder. The item "Top 10 Figma Plugins for Better Workflows" was saved from Behance. This collection now has 19 items total.',
    relatedItem: {
      id: 's1',
      title: 'Top 10 Figma Plugins',
      type: 'save',
    },
  },
  '2': {
    id: '2',
    title: 'Folder updated',
    description: 'Motion Design folder now has 25 items.',
    time: '1h ago',
    type: 'folder',
    read: false,
    fullContent: 'Your "Motion Design" folder has been updated. It now contains 25 items, including 3 new saves from TikTok and 2 from Instagram. This is your largest collection.',
    relatedItem: {
      id: 'f1',
      title: 'Motion Design',
      type: 'folder',
    },
  },
};

export default function NotificationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationItem | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const notif = MOCK_NOTIFICATIONS[id];
        if (notif) {
          setNotification(notif);
        } else {
          setLoadError('Notification not found');
        }
        setIsLoading(false);
      } catch (err) {
        setLoadError('Unable to load notification.');
        setIsLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [id]);

  const handleMarkAsRead = () => {
    setIsMarkingRead(true);
    setTimeout(() => {
      setIsMarkingRead(false);
      setNotification(prev => prev ? { ...prev, read: true } : null);
    }, 800);
  };

  const handleNavigateToRelated = () => {
    if (notification?.relatedItem) {
      if (notification.relatedItem.type === 'folder') {
        router.push(`/folder/${notification.relatedItem.id}`);
      } else {
        router.push(`/save/${notification.relatedItem.id}`);
      }
    }
  };

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

  const getIconColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'save':
        return '#8EC934';
      case 'folder':
        return '#4FD1FF';
      case 'system':
        return '#FF8C42';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Notification</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8EC934" />
          <Text style={styles.loadingText}>Loading notification…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError || !notification) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Notification</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#E05252" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{loadError || 'Notification not found'}</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const iconColor = getIconColor(notification.type);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Notification</Text>
        <Pressable
          style={[styles.markReadButton, { backgroundColor: notification.read ? '#222' : '#8EC934' }]}
          onPress={handleMarkAsRead}
          disabled={isMarkingRead || notification.read}
        >
          {isMarkingRead ? (
            <ActivityIndicator size={16} color="#0A0A0A" />
          ) : (
            <Text style={styles.markReadButtonText}>
              {notification.read ? 'Read' : 'Mark Read'}
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* NOTIFICATION CARD */}
        <View style={styles.notificationCard}>
          <View style={styles.notificationHeader}>
            <View style={[styles.iconBox, { backgroundColor: iconColor + '20' }]}>
              <Ionicons name={getIcon(notification.type)} size={24} color={iconColor} />
            </View>
            <View style={styles.notificationMeta}>
              <Text style={styles.notificationType}>
                {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
              </Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
            {!notification.read && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationDescription}>{notification.description}</Text>

          {notification.fullContent && (
            <View style={styles.fullContentSection}>
              <Text style={styles.fullContentText}>{notification.fullContent}</Text>
            </View>
          )}
        </View>

        {/* RELATED ITEM */}
        {notification.relatedItem && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Related Item</Text>
            <Pressable
              style={styles.relatedItemCard}
              onPress={handleNavigateToRelated}
            >
              <View style={styles.relatedItemIcon}>
                <Ionicons
                  name={notification.relatedItem.type === 'folder' ? 'folder-outline' : 'bookmark-outline'}
                  size={20}
                  color="#8EC934"
                />
              </View>
              <View style={styles.relatedItemInfo}>
                <Text style={styles.relatedItemTitle}>{notification.relatedItem.title}</Text>
                <Text style={styles.relatedItemType}>
                  {notification.relatedItem.type.charAt(0).toUpperCase() + notification.relatedItem.type.slice(1)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#666" />
            </Pressable>
          </View>
        )}

        {/* ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="list-outline" size={18} color="#8EC934" />
            <Text style={styles.actionButtonText}>View All Notifications</Text>
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
  markReadButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markReadButtonText: {
    color: '#0A0A0A',
    fontSize: 13,
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
  backButton: {
    marginTop: 16,
    backgroundColor: '#8EC934',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#0A0A0A',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  notificationCard: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationMeta: {
    flex: 1,
  },
  notificationType: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationTime: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8EC934',
  },
  notificationTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  notificationDescription: {
    color: '#AAA',
    fontSize: 15,
    lineHeight: 22,
  },
  fullContentSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  fullContentText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  relatedItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#222',
  },
  relatedItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(142, 201, 52, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  relatedItemInfo: {
    flex: 1,
  },
  relatedItemTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  relatedItemType: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#222',
    gap: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
