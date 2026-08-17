import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import type { PartnerSummary } from '../../mock/types';

const PAN_STEP_MS = 2_000;
const CARD_IMAGE_HEIGHT = 220;

/** Loops a 0..(steps-1) "frame" value back and forth — multiplied by -cardWidth it drives a
 * slow filmstrip pan across a partner's photos. Direction alternates by card position so
 * neighbouring cards in the feed don't all pan the same way. */
function useAutoPanFrame(steps: number, reverse: boolean) {
  const frame = useRef(new Animated.Value(reverse ? steps - 1 : 0)).current;

  useEffect(() => {
    if (steps <= 1) return undefined;
    const start = reverse ? steps - 1 : 0;
    const end = reverse ? 0 : steps - 1;
    frame.setValue(start);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(frame, { toValue: end, duration: (steps - 1) * PAN_STEP_MS, useNativeDriver: true }),
        Animated.timing(frame, { toValue: start, duration: (steps - 1) * PAN_STEP_MS, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [steps, reverse, frame]);

  return frame;
}

function PremiumPartnerCard({ partner, panLeft }: { partner: PartnerSummary; panLeft: boolean }) {
  const [cardWidth, setCardWidth] = useState(0);
  const photos = partner.photos && partner.photos.length > 0 ? partner.photos : partner.photoUrl ? [partner.photoUrl] : [];
  const frame = useAutoPanFrame(photos.length, !panLeft);
  const translateX = cardWidth
    ? Animated.multiply(frame, -cardWidth)
    : new Animated.Value(0);

  const onLayout = (e: LayoutChangeEvent) => setCardWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.card}>
      <View style={styles.imageClip} onLayout={onLayout}>
        {photos.length > 0 ? (
          <Animated.View style={[styles.filmstrip, { transform: [{ translateX }] }]}>
            {photos.map((uri, i) => (
              <Animated.Image key={`${uri}-${i}`} source={{ uri }} style={[styles.image, { width: cardWidth || undefined }]} resizeMode="cover" />
            ))}
          </Animated.View>
        ) : (
          <View style={styles.imageFallback} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{partner.name}</Text>
        {partner.description ? (
          <Text style={styles.description} numberOfLines={2}>{partner.description}</Text>
        ) : null}
      </View>
    </View>
  );
}

type Props = { partners: PartnerSummary[] };

export function PremiumPartnerFeed({ partners }: Props) {
  return (
    <View>
      {partners.map((partner, index) => (
        <PremiumPartnerCard key={partner.id} partner={partner} panLeft={index % 2 === 0} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg, backgroundColor: colors.white, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  imageClip: { width: '100%', height: CARD_IMAGE_HEIGHT, overflow: 'hidden', backgroundColor: colors.greyLight },
  filmstrip: { flexDirection: 'row', height: CARD_IMAGE_HEIGHT },
  image: { height: CARD_IMAGE_HEIGHT },
  imageFallback: { width: '100%', height: '100%', backgroundColor: colors.orangeTint },
  info: { padding: spacing.md },
  name: { fontSize: 17, fontWeight: '800', color: colors.charcoal },
  description: { fontSize: 13, color: colors.grey, marginTop: 4, lineHeight: 18 },
});
