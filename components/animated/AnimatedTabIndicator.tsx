import React, { useState, useCallback } from 'react';
import { Pressable, Text, View, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface AnimatedTabIndicatorProps {
  tabs: string[];
  activeIndex: number;
  onTabPress: (index: number) => void;
  className?: string;
}

export function AnimatedTabIndicator({
  tabs,
  activeIndex,
  onTabPress,
  className = '',
}: AnimatedTabIndicatorProps) {
  const [tabWidths, setTabWidths] = useState<number[]>([]);
  const [tabPositions, setTabPositions] = useState<number[]>([]);

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const handleTabLayout = useCallback(
    (index: number, event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      setTabWidths((prev) => {
        const next = [...prev];
        next[index] = width;
        return next;
      });
      setTabPositions((prev) => {
        const next = [...prev];
        next[index] = x;
        return next;
      });
    },
    []
  );

  React.useEffect(() => {
    if (tabPositions[activeIndex] !== undefined && tabWidths[activeIndex] !== undefined) {
      indicatorX.value = withSpring(tabPositions[activeIndex], {
        damping: 20,
        stiffness: 280,
      });
      indicatorWidth.value = withSpring(tabWidths[activeIndex], {
        damping: 20,
        stiffness: 280,
      });
    }
  }, [activeIndex, tabPositions, tabWidths]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorX.value }],
      width: indicatorWidth.value,
    };
  });

  const handlePress = useCallback(
    (index: number) => {
      if (index !== activeIndex) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onTabPress(index);
      }
    },
    [activeIndex, onTabPress]
  );

  return (
    <View className={`relative flex-row ${className}`}>
      {/* Animated indicator */}
      <Animated.View
        style={indicatorStyle}
        className="absolute bottom-0 h-[2px] bg-accent-base rounded-full"
      />

      {/* Tabs */}
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={tab}
            onLayout={(e: LayoutChangeEvent) => handleTabLayout(index, e)}
            onPress={() => handlePress(index)}
            className="flex-1 items-center py-3"
          >
            <Text
              className={`text-sm font-dmsans transition-colors ${
                isActive ? 'text-accent-base font-semibold' : 'text-textCustom-secondary font-medium'
              }`}
              style={{ fontFamily: isActive ? 'Inter_500Medium' : 'Inter_400Regular' }}
            >
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
