import React from 'react';
import { View, Text } from 'react-native';

export function Logo() {
  return (
    <View className="w-16 h-16 bg-background-secondary border border-accent-base/40 rounded-2xl items-center justify-center shadow-lg shadow-black/50">
      <Text className="text-white text-3xl font-syne tracking-tighter" style={{ fontFamily: 'Syne_800ExtraBold' }}>
        S
      </Text>
    </View>
  );
}
