import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../hooks/useStore';
import PasteUrlModal from './PasteUrlModal';
import NotesModal from './NotesModal';
import ScreenshotsModal from './ScreenshotsModal';
import BulkImportModal from './BulkImportModal';

type ActionModalType = 'paste-url' | 'notes' | 'screenshots' | 'bulk-import' | null;

const CATEGORIES = [
  { icon: 'logo-web', label: 'Software', bg: '#E5E5EA', color: '#1C1C1E' },
  { icon: 'restaurant', label: 'Recipes', bg: '#FF453A', color: '#FFFFFF' },
  { icon: 'map', label: 'Places', bg: '#0A84FF', color: '#FFFFFF' },
  { icon: 'film', label: 'Films', bg: '#30D158', color: '#FFFFFF' },
  { icon: 'book', label: 'Books', bg: '#5E5CE6', color: '#FFFFFF' },
];

export default function AddAnythingModal() {
  const modal = useStore((s) => s.modal);
  const setModal = useStore((s) => s.setModal);
  const setSearchTag = useStore((s) => s.setSearchTag);
  const [activeAction, setActiveAction] = useState<ActionModalType>(null);
  const [actionInput, setActionInput] = useState('');
  const [restoreAddOnClose, setRestoreAddOnClose] = useState(false);
  const isAddModalOpen = modal === 'add';
  
  const prevModal = React.useRef(modal);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isAddModalOpen) {
      if (prevModal.current === 'search') {
        slideAnim.setValue(1);
      } else {
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }).start();
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    prevModal.current = modal;
  }, [isAddModalOpen, modal, slideAnim]);

  const openActionModal = (action: Exclude<ActionModalType, null>) => {
    setActionInput('');
    setActiveAction(action);
    setRestoreAddOnClose(true);
    setModal(null);
  };

  const closeActionModal = () => {
    setActiveAction(null);
    setActionInput('');
    if (restoreAddOnClose) {
      setModal('add');
      setRestoreAddOnClose(false);
    }
  };

  return (
    <>
      <Modal
        transparent
        visible={isAddModalOpen}
        animationType="none"
        onRequestClose={() => setModal(null)}
      >
        <View style={styles.overlay}>
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={() => setModal(null)} 
          />
          
          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Add anything</Text>
                <Text style={styles.subtitle}>
                  Search up anything you want to save or you have done!
                </Text>
              </View>
              <Pressable 
                style={styles.closeBtn}
                onPress={() => setModal(null)}
              >
                <Ionicons name="close" size={15} color="#888" />
              </Pressable>
            </View>

            {/* 2x2 Action Grid */}
            <View style={styles.grid}>
              {/* Paste URL */}
              <Pressable style={[styles.actionCard, styles.actionCardDark]} onPress={() => openActionModal('paste-url')}>
                <View style={[styles.iconBox, { backgroundColor: '#2C2C2E' }]}> 
                  <Ionicons name="link" size={24} color="#A1A1A6" />
                </View>
                <Text style={styles.actionTitle}>Paste any URL</Text>
                <Text style={styles.actionSub}>Articles, blogs, TikTok, Instagram & more</Text>
              </Pressable>

              {/* Notes */}
              <Pressable style={[styles.actionCard, styles.actionCardDark]} onPress={() => openActionModal('notes')}>
                <View style={[styles.iconBox, { backgroundColor: '#FFE6C7' }]}> 
                  <Ionicons name="document-text-outline" size={24} color="#FF9F0A" />
                </View>
                <Text style={styles.actionTitle}>Notes</Text>
                <Text style={styles.actionSub}>Make a note of anything and we'll an...</Text>
              </Pressable>

              {/* Screenshots */}
              <Pressable style={[styles.actionCard, styles.actionCardDark]} onPress={() => openActionModal('screenshots')}>
                <View style={[styles.iconBox, { backgroundColor: '#D7F0FA' }]}> 
                  <Ionicons name="image-outline" size={24} color="#0A84FF" />
                </View>
                <Text style={styles.actionTitle}>Screenshots</Text>
                <Text style={styles.actionSub}>Add from your camera roll</Text>
              </Pressable>

              {/* Bulk Import */}
              <Pressable style={[styles.actionCard, styles.actionCardDark]} onPress={() => openActionModal('bulk-import')}>
                <View style={styles.proBadge}>
                  <Ionicons name="lock-closed" size={10} color="#000" />
                  <Text style={styles.proText}>Pro</Text>
                </View>
                <View style={[styles.iconBox, { backgroundColor: '#EAD5FF' }]}> 
                  <MaterialCommunityIcons name="layers-outline" size={24} color="#BF5AF2" />
                </View>
                <Text style={styles.actionTitle}>Bulk Import</Text>
                <Text style={styles.actionSub}>Add everything from TikTok & Insta in one ...</Text>
              </Pressable>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>OR MANUALLY SEARCH THESE</Text>
              <View style={styles.line} />
            </View>

            {/* Quick Categories */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {CATEGORIES.map((cat, i) => (
                <Pressable
                  key={i}
                  style={styles.catItem}
                  onPress={() => {
                    setModal('search');
                    setSearchTag({
                      label: cat.label,
                      icon: cat.icon,
                    });
                  }}
                >
                  <View style={styles.catIconWrapper}>
                    <View style={[styles.catIconBg, { backgroundColor: cat.bg }]}> 
                      <Ionicons name={cat.icon as any} size={26} color={cat.color} />
                    </View>
                    <View style={styles.catSearchBadge}>
                      <Ionicons name="search" size={10} color="#888" />
                    </View>
                  </View>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

          </Animated.View>
        </View>
      </Modal>

      <PasteUrlModal
        visible={activeAction === 'paste-url'}
        value={actionInput}
        onChangeText={setActionInput}
        onClose={closeActionModal}
      />
      <NotesModal
        visible={activeAction === 'notes'}
        value={actionInput}
        onChangeText={setActionInput}
        onClose={closeActionModal}
      />
      <ScreenshotsModal
        visible={activeAction === 'screenshots'}
        onClose={closeActionModal}
      />
      <BulkImportModal
        visible={activeAction === 'bulk-import'}
        onClose={closeActionModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
    position: 'relative',
  },
  actionCardDark: {
    backgroundColor: '#1C1C1E',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: 4,
  },
  actionSub: {
    color: '#666',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter_400Regular',
  },
  proBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  proText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 24,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  categoriesRow: {
    paddingHorizontal: 24,
    gap: 20,
  },
  catItem: {
    alignItems: 'center',
    gap: 8,
  },
  catIconWrapper: {
    position: 'relative',
  },
  catIconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  catSearchBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#121212',
  },
  catLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
});
