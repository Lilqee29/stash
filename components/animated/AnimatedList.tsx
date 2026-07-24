import React, { useCallback } from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { MotiView } from 'moti';

type EntryAnimation = 'fadeInUp' | 'fadeInScale';

interface AnimatedListProps<T>
  extends Omit<FlatListProps<T>, 'renderItem' | 'data'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  staggerDelay?: number;
  entryAnimation?: EntryAnimation;
  keyExtractor: (item: T) => string;
}

const animationVariants: Record<EntryAnimation, { from: object; animate: object }> = {
  fadeInUp: {
    from: { opacity: 0, translateY: 24 },
    animate: { opacity: 1, translateY: 0 },
  },
  fadeInScale: {
    from: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
  },
};

export function AnimatedList<T>({
  data,
  renderItem,
  staggerDelay = 60,
  entryAnimation = 'fadeInUp',
  keyExtractor,
  ...rest
}: AnimatedListProps<T>) {
  const variant = animationVariants[entryAnimation];

  const animatedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      return (
        <MotiView
          key={keyExtractor(item)}
          from={variant.from}
          animate={variant.animate}
          transition={{
            type: 'spring',
            damping: 18,
            stiffness: 200,
            delay: index * staggerDelay,
          }}
        >
          {renderItem(item, index)}
        </MotiView>
      );
    },
    [renderItem, staggerDelay, variant, keyExtractor]
  );

  return (
    <FlatList
      data={data}
      renderItem={animatedRenderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      {...rest}
    />
  );
}
