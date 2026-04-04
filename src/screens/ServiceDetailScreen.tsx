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
import { useCart } from '../context/CartContext';
import type { CatalogService } from '../mock/types';
import { catalogService } from '../services/catalogService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'ServiceDetail'>;

export function ServiceDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { addService } = useCart();
  const [svc, setSvc] = useState<CatalogService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const s = await catalogService.getServiceById(route.params.serviceId);
      setSvc(s);
      setLoading(false);
    })();
  }, [route.params.serviceId]);

  if (loading || !svc) {
    return <ScreenLoader />;
  }

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>{svc.name}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.cat}>
          {svc.categoryLabel} · ★ {svc.rating.toFixed(1)} ({svc.reviewsCount})
        </Text>
        <Text style={styles.desc}>{svc.description}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
          <Text style={styles.near}>Nearby · {svc.distanceKm.toFixed(1)} km</Text>
        </View>
        <Text style={styles.price}>₹{svc.basePrice}</Text>
        <View style={styles.partner}>
          <Text style={styles.pTitle}>Service Provider</Text>
          <Text style={styles.pName}>{svc.partner.name}</Text>
          <Text style={styles.pSub}>
            ★ {svc.partner.rating.toFixed(1)} · {svc.partner.jobsCompleted} jobs
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            style={styles.secondary}
            onPress={() => Linking.openURL('tel:9876543210')}
          >
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.secTxt}>Call</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={() => Alert.alert('Chat', 'In-app chat (mock).')}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={styles.secTxt}>Chat</Text>
          </Pressable>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          title="Add to cart"
          variant="outline"
          onPress={async () => {
            await addService(svc);
            Alert.alert('Cart', `${svc.name} added to cart.`);
          }}
        />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton
          title="Book service"
          onPress={() => navigation.navigate('ConfirmBooking', { serviceId: svc.id })}
        />
      </View>
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
  title: { fontSize: 18, fontWeight: '800', flex: 1, textAlign: 'center' },
  body: { padding: spacing.lg },
  cat: { color: colors.grey, fontWeight: '600' },
  desc: { marginTop: spacing.md, fontSize: 15, color: colors.charcoal, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  near: { color: colors.charcoal },
  price: { fontSize: 28, fontWeight: '800', color: colors.primary, marginTop: spacing.lg },
  partner: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
  },
  pTitle: { fontSize: 12, color: colors.grey },
  pName: { fontSize: 17, fontWeight: '800', marginTop: 4 },
  pSub: { color: colors.grey, marginTop: 4 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  secondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.md,
  },
  secTxt: { fontWeight: '700', color: colors.primary },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
