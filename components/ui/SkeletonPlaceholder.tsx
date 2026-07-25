import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

interface ShimmerBarProps {
  width: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function ShimmerBar({
  width,
  height = 14,
  borderRadius = 8,
  style = {},
}: ShimmerBarProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#141414',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'row',
          transform: [{ translateX }],
        }}
      >
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              width: 120,
              height: '100%',
              backgroundColor: 'rgba(255,255,255,0.03)',
            }}
          />
        ))}
      </Animated.View>
    </View>
  );
}

export function HomeSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: 8 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          marginBottom: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ShimmerBar width={42} height={42} borderRadius={12} />
          <View>
            <ShimmerBar width={80} height={18} borderRadius={6} />
            <ShimmerBar
              width={100}
              height={10}
              borderRadius={4}
              style={{ marginTop: 6 }}
            />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <ShimmerBar width={36} height={36} borderRadius={10} />
          <ShimmerBar width={36} height={36} borderRadius={10} />
        </View>
      </View>

      {/* Search Bar */}
      <ShimmerBar
        width="90%"
        height={46}
        borderRadius={14}
        style={{ marginBottom: 16, alignSelf: 'center' }}
      />

      {/* Filter Chips */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          gap: 8,
          marginBottom: 20,
        }}
      >
        {[72, 56, 64, 52].map((w, i) => (
          <ShimmerBar key={i} width={w} height={34} borderRadius={10} />
        ))}
      </View>

      {/* Section Title */}
      <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
        <ShimmerBar width={100} height={16} borderRadius={6} />
      </View>

      {/* Masonry Grid Skeleton */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 10 }}>
        {/* Left column */}
        <View style={{ flex: 1, gap: 10 }}>
          <ShimmerBar width="100%" height={180} borderRadius={16} />
          <ShimmerBar width="100%" height={140} borderRadius={16} />
          <ShimmerBar width="100%" height={190} borderRadius={16} />
        </View>
        {/* Right column */}
        <View style={{ flex: 1, gap: 10 }}>
          <ShimmerBar width="100%" height={140} borderRadius={16} />
          <ShimmerBar width="100%" height={200} borderRadius={16} />
          <ShimmerBar width="100%" height={160} borderRadius={16} />
        </View>
      </View>

      {/* Folder Grid Skeleton */}
      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <ShimmerBar width={80} height={16} borderRadius={6} style={{ marginBottom: 14 }} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <ShimmerBar
              key={i}
              width={(200 - 40) / 3}
              height={84}
              borderRadius={14}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
