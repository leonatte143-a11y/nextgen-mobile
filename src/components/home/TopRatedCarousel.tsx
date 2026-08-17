import React, { useCallback, useRef, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import type { CatalogService } from '../../mock/types';
import { getAccentTint } from '../../utils/accentColor';
import { useSequentialAdIndexState } from '../../hooks/useSequentialAds';

const ROTATE_MS = 4_000;

type Props = {
  items: CatalogService[];
  onItemPress: (item: CatalogService) => void;
};

export function TopRatedCarousel({ items, onItemPress }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const isManualScroll = useRef(false);
  const [cardWidth, setCardWidth] = useState(0);
  const [idx, setIdx] = useSequentialAdIndexState(items.length, ROTATE_MS);

  React.useEffect(() => {
    if (isManualScroll.current) {
      isManualScroll.current = false;
      return;
    }
    if (cardWidth > 0) {
      scrollRef.current?.scrollTo({ x: idx * cardWidth, animated: true });
    }
  }, [idx, cardWidth]);

  const onCardLayout = useCallback((e: LayoutChangeEvent) => {
    if (cardWidth === 0) setCardWidth(e.nativeEvent.layout.width + spacing.sm);
  }, [cardWidth]);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (cardWidth <= 0) return;
    const newIdx = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    if (newIdx !== idx && newIdx >= 0 && newIdx < items.length) {
      isManualScroll.current = true;
      setIdx(newIdx);
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={onMomentumScrollEnd}
      contentContainerStyle={styles.carousel}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          style={styles.topCard}
          onLayout={onCardLayout}
          onPress={() => onItemPress(item)}
        >
          <View style={[styles.topPhoto, { backgroundColor: getAccentTint(item.id) }]}>
            {item.partner.photoUrl ? (
              <Image source={{ uri: item.partner.photoUrl }} style={styles.topPhotoImg} />
            ) : (
              <Text style={styles.topPhotoTxt}>{item.partner.name[0]}</Text>
            )}
          </View>
          <Text style={styles.topName} numberOfLines={1}>{item.name}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.md, gap: spacing.sm },
  topCard: {
    width: 110,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  topPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  topPhotoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  topPhotoTxt: { fontSize: 20, fontWeight: '800', color: colors.primary },
  topName: { fontSize: 12, fontWeight: '700', color: colors.charcoal, textAlign: 'center' },
});
