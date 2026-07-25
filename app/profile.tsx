import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable style={styles.editBtn} onPress={() => router.push('/profile/edit')}>
          <Ionicons name="create-outline" size={20} color="#639922" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>R</Text>
              </View>
            </View>
            <View style={styles.onlineBadge} />
          </View>

          {/* Name & Handle */}
          <Text style={styles.name}>Razal Q.</Text>
          <Text style={styles.handle}>@razal</Text>

          {/* Bio */}
          <Text style={styles.bio}>
            Designer, curious about productive workflows. Loves recipes and movies.
          </Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>124</Text>
              <Text style={styles.statLabel}>Saves</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>12</Text>
              <Text style={styles.statLabel}>Folders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>7</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Pressable style={styles.actionCard} onPress={() => router.push('/settings')}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(99,153,34,0.15)' }]}>
                <Ionicons name="settings-outline" size={22} color="#639922" />
              </View>
              <Text style={styles.actionLabel}>Settings</Text>
            </Pressable>

            <Pressable style={styles.actionCard} onPress={() => router.push('/notifications')}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255,193,7,0.15)' }]}>
                <Ionicons name="notifications-outline" size={22} color="#FFC107" />
              </View>
              <Text style={styles.actionLabel}>Activity</Text>
            </Pressable>

            <Pressable style={styles.actionCard} onPress={() => router.push('/recently-imported')}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(79,209,255,0.15)' }]}>
                <Ionicons name="time-outline" size={22} color="#4FD1FF" />
              </View>
              <Text style={styles.actionLabel}>Recent</Text>
            </Pressable>

            <Pressable style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255,107,107,0.15)' }]}>
                <Ionicons name="heart-outline" size={22} color="#FF6B6B" />
              </View>
              <Text style={styles.actionLabel}>Favorites</Text>
            </Pressable>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <Pressable style={styles.menuRow} onPress={() => router.push('/settings/account')}>
              <View style={styles.menuLeft}>
                <Ionicons name="person-outline" size={18} color="#639922" />
                <Text style={styles.menuLabel}>Account Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#555" />
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable style={styles.menuRow} onPress={() => router.push('/settings/storage')}>
              <View style={styles.menuLeft}>
                <Ionicons name="cloud-outline" size={18} color="#4FD1FF" />
                <Text style={styles.menuLabel}>Storage</Text>
              </View>
              <View style={styles.menuRight}>
                <Text style={styles.menuValue}>342 MB</Text>
                <Ionicons name="chevron-forward" size={18} color="#555" />
              </View>
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable style={styles.menuRow} onPress={() => router.push('/settings/appearance')}>
              <View style={styles.menuLeft}>
                <Ionicons name="color-palette-outline" size={18} color="#FF8C42" />
                <Text style={styles.menuLabel}>Appearance</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#555" />
            </Pressable>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <Pressable style={styles.signOutBtn}>
            <Ionicons name="log-out-outline" size={18} color="#FF6B6B" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  editBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(99,153,34,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: 60,
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#111111',
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222222',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#639922',
    padding: 3,
  },
  avatarPlaceholder: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#639922',
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#639922',
    borderWidth: 2,
    borderColor: '#111111',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    marginBottom: 4,
  },
  handle: {
    color: '#639922',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginBottom: 12,
  },
  bio: {
    color: '#888888',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#888888',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#222222',
  },

  // Quick Actions
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },

  // Account Menu
  card: {
    backgroundColor: '#111111',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#222222',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuValue: {
    color: '#888888',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#222222',
    marginLeft: 48,
  },

  // Sign Out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.2)',
  },
  signOutText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
});
