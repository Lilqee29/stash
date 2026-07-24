import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import * as Clipboard from 'expo-clipboard';

import { Button } from '../../../components/Button';
import { OnboardingProgress } from '../../../components/OnboardingProgress';
import { useStore } from '../../../hooks/useStore';
import { detectPlatform, isValidUrl } from '../../../lib/detectPlatform';

export default function ImportScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const setImportedData = useStore((s) => s.setImportedData);
  const [link, setLink] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'tiktok' | 'instagram'>('tiktok');

  const urlValid = link.trim() ? isValidUrl(link.trim()) : false;
  const rawDetected = link.trim() ? detectPlatform(link.trim()) : null;
  // Narrow to onboarding-compatible platforms
  const detectedPlatform: 'tiktok' | 'instagram' | null =
    rawDetected === 'tiktok' || rawDetected === 'instagram' ? rawDetected : null;

  const handleImport = () => {
    const trimmed = link.trim();
    if (!trimmed) return;

    // Set imported data in store so processing screen can access it
    const platform = detectedPlatform || selectedPlatform;
    setImportedData({
      platform,
      count: 1,
      posts: [
        {
          url: trimmed,
          title: trimmed.replace(/^https?:\/\//, '').split('/')[0] + ' save',
          savedAt: new Date().toISOString(),
        },
      ],
    });

    router.push({
      pathname: '/processing',
      params: { link: trimmed, platform },
    });
  };

  const handleSkip = () => {
    router.push('/sign-up');
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setLink(text.trim());
      }
    } catch {
      // Clipboard access failed silently
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + headerHeight + 16,
          paddingHorizontal: 24,
          marginBottom: 8,
        }}
      >
        <OnboardingProgress currentStep={2} totalSteps={4} />
      </View>

      {/* Content */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Platform Toggle */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#1A1A1A',
            borderRadius: 12,
            padding: 4,
            marginBottom: 32,
          }}
        >
          {(['tiktok', 'instagram'] as const).map((platform) => (
            <Pressable
              key={platform}
              onPress={() => setSelectedPlatform(platform)}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 10,
                backgroundColor: selectedPlatform === platform ? '#639922' : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  fontFamily: 'DMSans_500Medium',
                  color: selectedPlatform === platform ? '#FFFFFF' : '#888888',
                }}
              >
                {platform === 'tiktok' ? 'TikTok' : 'Instagram'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Link Input */}
        <View style={{ width: '100%', marginBottom: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1A1A1A',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: link.trim()
                ? urlValid
                  ? '#639922'
                  : '#FF453A'
                : '#2E2E2E',
              paddingHorizontal: 16,
              height: 56,
            }}
          >
            <Ionicons
              name="link-outline"
              size={20}
              color={link.trim() ? (urlValid ? '#639922' : '#FF453A') : '#888888'}
              style={{ marginRight: 12 }}
            />
            <TextInput
              value={link}
              onChangeText={setLink}
              placeholder={`Paste your ${selectedPlatform === 'tiktok' ? 'TikTok' : 'Instagram'} link here`}
              placeholderTextColor="#555555"
              style={{
                flex: 1,
                fontSize: 15,
                fontFamily: 'DMSans_400Regular',
                color: '#FFFFFF',
              }}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {link.length > 0 && (
              <Pressable onPress={() => setLink('')}>
                <Ionicons name="close-circle" size={20} color="#555555" />
              </Pressable>
            )}
          </View>

          {/* URL Validation Hint */}
          {link.trim().length > 0 && !urlValid && (
            <Text
              style={{
                color: '#FF453A',
                fontSize: 12,
                fontFamily: 'DMSans_500Medium',
                marginTop: 8,
                paddingHorizontal: 4,
              }}
            >
              Please enter a valid URL starting with https://
            </Text>
          )}

          {/* Paste Button */}
          <Pressable
            onPress={handlePaste}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 12,
              paddingVertical: 10,
              backgroundColor: '#1A1A1A',
              borderRadius: 10,
              gap: 8,
            }}
          >
            <Ionicons name="clipboard-outline" size={16} color="#C4FB46" />
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'DMSans_500Medium',
                color: '#C4FB46',
              }}
            >
              Paste from clipboard
            </Text>
          </Pressable>
        </View>

        {/* Info */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            backgroundColor: '#111111',
            borderRadius: 10,
          }}
        >
          <Ionicons name="information-circle-outline" size={16} color="#888888" />
          <Text
            style={{
              fontSize: 12,
              fontFamily: 'DMSans_400Regular',
              color: '#888888',
              flex: 1,
            }}
          >
            {detectedPlatform
              ? `Detected: ${detectedPlatform === 'tiktok' ? 'TikTok' : 'Instagram'} link`
              : selectedPlatform === 'tiktok'
              ? 'Paste a TikTok video link to import'
              : 'Paste an Instagram post or reel link to import'}
          </Text>
        </View>
      </View>

      {/* Bottom */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 20,
          gap: 12,
        }}
      >
        <Button
          title="Import"
          onPress={handleImport}
          disabled={!urlValid}
        />
        <Button title="I'll do this later" onPress={handleSkip} variant="ghost" />
      </View>
    </View>
  );
}
