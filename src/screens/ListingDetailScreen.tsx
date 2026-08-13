import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import { marketplaceService } from '../services/marketplaceService';
import type { ListingType, MarketplaceListing } from '../types/marketplace';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'ListingDetail'>;

const BADGE_LABEL: Record<ListingType, string> = { rent: 'RENT', sell: 'SELL', resale: 'RE-SELL' };
const SCREEN_WIDTH = Dimensions.get('window').width;

export function ListingDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    marketplaceService
      .getListing(route.params.listingId)
      .then(setListing)
      .finally(() => setLoading(false));
  }, [route.params.listingId]);

  if (loading || !listing) return <ScreenLoader />;

  const priceLabel =
    listing.listingType === 'rent'
      ? `₹${listing.rentPricePerDay ?? 0}/day · ₹${listing.depositAmount ?? 0} security deposit`
      : `₹${listing.price ?? 0}`;

  const submitReport = async () => {
    setReporting(true);
    try {
      await marketplaceService.reportListing('user', listing.id, reportReason.trim());
      setReportOpen(false);
      setReportReason('');
      Alert.alert('Reported', 'Thanks — our team will review this listing.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not submit report.');
    } finally {
      setReporting(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Pressable onPress={() => setReportOpen((v) => !v)} hitSlop={12}>
          <Ionicons name="flag-outline" size={22} color={colors.error} />
        </Pressable>
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView contentContainerStyle={styles.body}>
        {listing.photos.length > 0 ? (
          <FlatList
            data={listing.photos}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <Image source={{ uri: item }} style={styles.photo} resizeMode="cover" />}
          />
        ) : (
          <View style={[styles.photo, styles.photoFallback]}>
            <Ionicons name="image-outline" size={40} color={colors.grey} />
          </View>
        )}

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{BADGE_LABEL[listing.listingType]}</Text>
          </View>
          {listing.distanceKm != null ? (
            <Text style={styles.distance}>{listing.distanceKm} km away</Text>
          ) : null}
        </View>

        <Text style={styles.name}>{listing.title}</Text>
        <Text style={styles.price}>{priceLabel}</Text>
        {listing.description ? <Text style={styles.desc}>{listing.description}</Text> : null}
        <Text style={styles.meta}>{listing.city || 'Location shared in chat'}</Text>

        {reportOpen ? (
          <View style={styles.reportBox}>
            <Text style={styles.reportLabel}>Report this listing</Text>
            <TextInput
              style={styles.reportInput}
              placeholder="Why are you reporting this? (illegal item, broken machine, scam...)"
              value={reportReason}
              onChangeText={setReportReason}
              multiline
            />
            <PrimaryButton title="Submit report" onPress={submitReport} loading={reporting} variant="danger" />
          </View>
        ) : null}
      </ScrollView>
      </KeyboardAvoidingView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <PrimaryButton
          title="Chat with Seller"
          onPress={() => navigation.navigate('MarketplaceChat', { listingId: listing.id, otherPartyName: listing.title })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.white },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 16, fontWeight: '800', flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
  body: { paddingBottom: spacing.xl },
  photo: { width: SCREEN_WIDTH, height: 240, backgroundColor: colors.greyLight },
  photoFallback: { alignItems: 'center', justifyContent: 'center' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, marginHorizontal: spacing.lg },
  badge: { backgroundColor: colors.primary, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt: { color: colors.white, fontWeight: '800', fontSize: 11 },
  distance: { color: colors.grey, fontSize: 12 },
  name: { fontSize: 20, fontWeight: '800', color: colors.charcoal, marginHorizontal: spacing.lg, marginTop: spacing.sm },
  price: { fontSize: 17, fontWeight: '800', color: colors.primary, marginHorizontal: spacing.lg, marginTop: 4 },
  desc: { color: colors.grey, marginHorizontal: spacing.lg, marginTop: spacing.md, lineHeight: 20 },
  meta: { color: colors.grey, marginHorizontal: spacing.lg, marginTop: spacing.md, fontSize: 12 },
  reportBox: { marginHorizontal: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.greyLight, borderRadius: radius.md, padding: spacing.md },
  reportLabel: { fontWeight: '800', marginBottom: spacing.sm },
  reportInput: { backgroundColor: colors.white, borderRadius: radius.sm, padding: spacing.sm, minHeight: 70, textAlignVertical: 'top', marginBottom: spacing.sm },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
