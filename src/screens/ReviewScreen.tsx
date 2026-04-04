import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { bookingService } from '../services/bookingService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'Review'>;

const TAGS = ['Punctual', 'Professional', 'Clean Work', 'Fair Price'];

export function ReviewScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const [stars, setStars] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const toggle = (t: string) => {
    setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  };

  const submit = async () => {
    setLoading(true);
    try {
      await bookingService.submitReview(route.params.bookingId, stars, picked, note);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.body}>
      <Text style={styles.h1}>Service completed!</Text>
      <Text style={styles.sub}>How was your experience with {route.params.partnerName}?</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Pressable key={s} onPress={() => setStars(s)} style={styles.starBtn}>
            <Text style={styles.star}>{s <= stars ? '★' : '☆'}</Text>
          </Pressable>
        ))}
      </View>
      {stars === 5 ? <Text style={styles.exc}>Excellent!</Text> : null}
      <View style={styles.tags}>
        {TAGS.map((t) => (
          <Pressable
            key={t}
            onPress={() => toggle(t)}
            style={[styles.tag, picked.includes(t) && styles.tagOn]}
          >
            <Text style={[styles.tagTxt, picked.includes(t) && styles.tagTxtOn]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        style={styles.ta}
        placeholder="Short note (optional)"
        value={note}
        onChangeText={setNote}
        multiline
      />
      <PrimaryButton title="Submit review" onPress={submit} disabled={stars < 1} loading={loading} />
      <Pressable onPress={() => navigation.goBack()} style={styles.skip}>
        <Text style={styles.skipTxt}>Skip for now</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  body: { padding: spacing.lg, paddingTop: 48 },
  h1: { fontSize: 22, fontWeight: '800' },
  sub: { color: colors.grey, marginTop: spacing.sm, marginBottom: spacing.lg },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  starBtn: { padding: spacing.sm },
  star: { fontSize: 44, color: colors.primary },
  exc: { textAlign: 'center', color: colors.primary, fontWeight: '700', marginBottom: spacing.lg },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  tagOn: { backgroundColor: colors.primary },
  tagTxt: { fontWeight: '600', color: colors.primary },
  tagTxtOn: { color: colors.white },
  ta: {
    minHeight: 100,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    textAlignVertical: 'top',
  },
  skip: { alignItems: 'center', marginTop: spacing.lg },
  skipTxt: { color: colors.grey, fontWeight: '600' },
});
