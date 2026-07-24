import React from 'react';
import { View } from 'react-native';

interface OnboardingProgressProps {
  currentStep: number; // 0-indexed
  totalSteps?: number;
}

export function OnboardingProgress({ currentStep, totalSteps = 4 }: OnboardingProgressProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 6, paddingVertical: 8 }}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompletedOrActive = index <= currentStep;
        return (
          <View
            key={index}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 1.5,
              backgroundColor: isCompletedOrActive ? '#C4FB46' : 'rgba(255, 255, 255, 0.12)',
            }}
          />
        );
      })}
    </View>
  );
}