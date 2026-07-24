import React, { useEffect, useState, useRef } from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useHeaderHeight } from '@react-navigation/elements';

import { useStore } from '../../../hooks/useStore';
import { OnboardingProgress } from '../../../components/OnboardingProgress';
import { Button } from '../../../components/Button';
import { detectPlatform } from '../../../lib/detectPlatform';

export default function ProcessingScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { importedData, finishProcessing, addSave } = useStore();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Extracting saved posts...');
  const [isSaved, setIsSaved] = useState(false);
  const lottieRef = useRef<LottieView>(null);

  // Save the URL(s) to Supabase on mount
  useEffect(() => {
    const saveToLibrary = async () => {
      if (!importedData || importedData.posts.length === 0) return;

      try {
        for (const post of importedData.posts) {
          const platform = importedData.platform || detectPlatform(post.url || '');
          await addSave({
            title: post.title || 'Imported save',
            url: post.url || '',
            platform,
            folderId: null,
            savedAt: post.savedAt || new Date().toISOString(),
          });
        }
        setIsSaved(true);
      } catch (err) {
        console.error('Failed to save during processing:', err);
      }
    };

    saveToLibrary();
  }, []);

  // Progress bar animation
  useEffect(() => {
    lottieRef.current?.play();
    const totalDuration = 4500;
    const intervalTime = 50;
    const steps = totalDuration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      const nextProgress = Math.min(currentStep / steps, 1);
      setProgress(nextProgress);

      if (nextProgress < 0.25) {
        setStatusText(`Analyzing your ${importedData?.platform || 'content'} link...`);
      } else if (nextProgress < 0.50) {
        setStatusText('Extracting content metadata...');
      } else if (nextProgress < 0.75) {
        setStatusText('Generating smart tags with AI...');
      } else if (nextProgress < 0.98) {
        setStatusText('Saving to your library...');
      } else {
        setStatusText('Done! Your save is ready.');
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [importedData]);

  const handleFinish = () => {
    finishProcessing(['Imported Saves']);
    router.push('/onboarding/how-to-use');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + headerHeight + 16, paddingHorizontal: 24 }}>
        <OnboardingProgress currentStep={2} totalSteps={4} />
      </View>

      {/* Content */}
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 32,
        }}
      >
        {/* Lottie Animation */}
        <View
          style={{
            width: 200,
            height: 200,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <LottieView
            ref={lottieRef}
            source={require('../../../assets/lottie/search-pulse.json')}
            loop
            style={{ width: 200, height: 200 }}
          />
        </View>

        {/* Title */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 12,
              fontFamily: 'DMSans_500Medium',
              color: '#639922',
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            AI PROCESSING
          </Text>
          <Text
            style={{
              fontSize: 28,
              fontFamily: 'Syne_700Bold',
              color: '#FFFFFF',
              textAlign: 'center',
              letterSpacing: -0.02,
            }}
          >
            Organizing your library
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={{ width: '100%', marginBottom: 24 }}>
          <View
            style={{
              width: '100%',
              height: 24,
              backgroundColor: '#1A1A1A',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#222222',
              overflow: 'hidden',
              padding: 4,
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                backgroundColor: '#639922',
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'flex-end',
                paddingRight: 8,
              }}
            >
              {progress > 0.15 && (
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: 'DMSans_500Medium',
                    color: '#FFFFFF',
                  }}
                >
                  {Math.round(progress * 100)}%
                </Text>
              )}
            </View>
          </View>

          <Text
            style={{
              fontSize: 13,
              fontFamily: 'DMSans_500Medium',
              color: '#FFFFFF',
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            {isSaved ? '✓ ' : '⚡ '}{statusText}
          </Text>
        </View>
      </View>

      {/* Bottom */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <Button
          title="Next"
          onPress={handleFinish}
          disabled={progress < 1}
        />
      </View>
    </View>
  );
}
