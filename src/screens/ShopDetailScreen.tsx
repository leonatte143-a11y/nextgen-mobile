import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import { getCurrentCoords } from '../services/locationService';
import { shopService } from '../services/shopService';
import type { ShopSummary } from '../types/shop';
import { formatTelUrl } from '../utils/phone';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'ShopDetail'>;

export function ShopDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const [shop, setShop] = useState<ShopSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const coords = await getCurrentCoords();
        const s = await shopService.getShop(
          route.params.shopId,
          coords?.latitude,
          coords?.longitude,
        );
        setShop(s);
      } catch {
        setShop(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params.shopId]);

  if (loading) return <ScreenLoader />;
  if (!shop) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Shop not found</Text>
      </View>
    );
  }

  const onCall = async () => {
    const tel = formatTelUrl(shop.phone);
    if (!tel) {
      Alert.alert('Unavailable', 'Phone number not available for this shop.');
      return;
    }
    try {
      await shopService.trackCall(shop.id);
    } catch {
      /* non-blocking */
    }
    Linking.openURL(tel);
  };

  const onDirections = async () => {
    try {
      await shopService.trackDirections(shop.id);
    } catch {
      /* non-blocking */
    }
    const dest = shop.latitude && shop.longitude
      ? `${shop.latitude},${shop.longitude}`
      : encodeURIComponent(shop.address || shop.city || '');
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${dest}`);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>{shop.shopName}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <Ionicons name="storefront" size={48} color={colors.primary} />
          {shop.isFeatured ? <Text style={styles.verified}>KAIRO Verified</Text> : null}
        </View>
        <Text style={styles.name}>{shop.shopName}</Text>
        <Text style={styles.meta}>
          {shop.categoryName} · ★ {shop.rating.toFixed(1)} · {shop.distanceLabel} away
        </Text>
        {shop.partnerNearby ? (
          <View style={styles.partnerBox}>
            <Text style={styles.partnerTxt}>
              KAIRO Partner nearby{shop.nearbyPartnerName ? ` — ${shop.nearbyPartnerName}` : ''}
            </Text>
            <Text style={styles.partnerHint}>Great time to buy materials while your expert is here.</Text>
          </View>
        ) : null}
        {shop.address ? <Text style={styles.addr}>{shop.address}</Text> : null}
        {shop.city ? <Text style={styles.city}>{shop.city}</Text> : null}
        <Text style={styles.pref}>
          Lead type: {shop.leadPreference === 'online' ? 'Online bookings' : 'Visit shop (offline sale)'}
        </Text>
        <View style={styles.actions}>
          <Pressable style={styles.actBtn} onPress={onCall}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.actTxt}>Call</Text>
          </Pressable>
          <Pressable style={styles.actBtn} onPress={onDirections}>
            <Ionicons name="navigate-outline" size={20} color={colors.primary} />
            <Text style={styles.actTxt}>Directions</Text>
          </Pressable>
        </View>
        <PrimaryButton title="Refer this shop" variant="outline" onPress={onDirections} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topTitle: { flex: 1, textAlign: 'center', fontWeight: '800', fontSize: 16 },
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  hero: {
    height: 120,
    backgroundColor: colors.orangeTint,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  verified: {
    marginTop: spacing.sm,
    fontWeight: '800',
    color: colors.primary,
    fontSize: 12,
  },
  name: { fontSize: 22, fontWeight: '900', color: colors.charcoal },
  meta: { color: colors.grey, marginTop: spacing.sm },
  partnerBox: {
    marginTop: spacing.md,
    backgroundColor: colors.trustTeal + '12',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.trustTeal + '40',
  },
  partnerTxt: { fontWeight: '800', color: colors.trustTeal },
  partnerHint: { color: colors.grey, fontSize: 12, marginTop: 4 },
  addr: { marginTop: spacing.lg, color: colors.charcoal, fontWeight: '600' },
  city: { color: colors.grey, marginTop: 4 },
  pref: { marginTop: spacing.md, color: colors.grey, fontSize: 13 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  actBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.orangeTint,
  },
  actTxt: { fontWeight: '800', color: colors.primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  err: { color: colors.error, fontWeight: '700' },
});
