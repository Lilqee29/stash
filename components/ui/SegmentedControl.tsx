import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  selectedIndex,
  onChange,
  className = '',
}: SegmentedControlProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndexShared = useSharedValue(0);

  useEffect(() => {
    activeIndexShared.value = withSpring(selectedIndex, {
      damping: 22,
      stiffness: 280,
    });
  }, [selectedIndex]);

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const count = options.length;
  const padding = 4; // Container padding
  const innerWidth = containerWidth - padding * 2;
  const segmentWidth = count > 0 ? innerWidth / count : 0;

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      width: segmentWidth,
      transform: [
        {
          translateX: activeIndexShared.value * segmentWidth,
        },
      ],
    };
  });

  return (
    <View
      onLayout={onLayout}
      className={`relative flex-row bg-background-secondary border border-borderCustom-subtle rounded-xl p-[4px] items-center ${className}`}
    >
      {/* Animated active pill background */}
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            animatedPillStyle,
            {
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: 4,
              borderRadius: 8,
              backgroundColor: 'rgba(196,251,70,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(196,251,70,0.1)',
            },
          ]}
        />
      )}

      {/* Segments */}
      {options.map((option, index) => {
        const isActive = index === selectedIndex;

        return (
          <Pressable
            key={option}
            onPress={() => {
              if (index !== selectedIndex) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(index);
              }
            }}
            className="flex-1 py-2.5 items-center justify-center z-10"
          >
            <Text
              className={`text-xs font-dmsans tracking-wide ${
                isActive ? 'text-textCustom-accent font-semibold' : 'text-textCustom-secondary font-medium'
              }`}
              style={{ fontFamily: 'Inter_500Medium' }}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
