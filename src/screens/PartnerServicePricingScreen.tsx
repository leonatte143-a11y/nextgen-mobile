import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../constants/theme';
import type { PartnerStackParamList } from '../navigation/PartnerStackTypes';

type Row = { id: string; serviceName: string; category: string; base: number };
const initialRows: Row[] = [
  { id: '1', serviceName: 'Fan Repair', category: 'Electrical', base: 250 },
  { id: '2', serviceName: 'Light Fitting', category: 'Electrical', base: 200 },
  { id: '3', serviceName: 'Switch Board', category: 'Electrical', base: 300 },
];

type Nav = NativeStackNavigationProp<PartnerStackParamList>;

function calcRow(base: number) {
  const admin = Math.round(base * 0.1);
  return { admin, earning: base - admin };
}

export function PartnerServicePricingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [rows, setRows] = useState<Row[]>(initialRows);
  const nextId = useMemo(() => {
    const maxN = Math.max(0, ...rows.map((r) => parseInt(r.id, 10) || 0));
    return String(maxN + 1);
  }, [rows]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.h1}>Service and pricing</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.addRow}>
          <Pressable
            style={styles.addBtn}
            onPress={() =>
              setRows((p) => [
                ...p,
                {
                  id: nextId,
                  serviceName: 'New service (mock)',
                  category: 'General',
                  base: 100,
                },
              ])
            }
          >
            <Ionicons name="add" size={20} color={colors.primary} />
            <Text style={styles.addTxt}>[+] Add More Service</Text>
          </Pressable>
        </View>

        <View style={styles.info}>
          <Text style={styles.tipH}>Partner success tips</Text>
          <Text style={styles.infoTxt}>
            Setting competitive base costs in Rajahmundry increases lead volume by 15%.
          </Text>
        </View>

        <View style={styles.thead}>
          <Text style={[styles.tcell, styles.th]}>Service name</Text>
          <Text style={[styles.tcell, styles.th, styles.narrow]}>Category</Text>
          <Text style={[styles.tcell, styles.th, styles.num]}>Base cost</Text>
          <Text style={[styles.tcell, styles.th, styles.num]}>Admin 10%</Text>
          <Text style={[styles.tcell, styles.th, styles.num]}>Your earning</Text>
          <Text style={[styles.tcell, styles.th, styles.tiny]}>Action</Text>
        </View>
        {rows.map((r) => {
          const c = calcRow(r.base);
          return (
            <View key={r.id} style={styles.tr}>
              <Text style={styles.tcell} numberOfLines={2}>
                {r.serviceName}
              </Text>
              <Text style={[styles.tcell, styles.narrow]} numberOfLines={1}>
                {r.category}
              </Text>
              <Text style={[styles.tcell, styles.num]}>₹{r.base.toFixed(2)}</Text>
              <Text style={[styles.tcell, styles.num]}>₹{c.admin.toFixed(2)}</Text>
              <Text style={[styles.tcell, styles.num, styles.earn]}>₹{c.earning.toFixed(2)}</Text>
              <Pressable
                onPress={() => {
                  setRows((p) => p.map((x) => (x.id === r.id ? { ...x, base: x.base + 20 } : x)));
                }}
                style={styles.edit}
              >
                <Text style={styles.editTxt}>Edit</Text>
              </Pressable>
            </View>
          );
        })}

        <View style={styles.foot} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderColor: colors.border },
  h1: { fontSize: 17, fontWeight: '800' },
  body: { padding: spacing.md, paddingBottom: spacing.xl },
  addRow: { marginBottom: spacing.md },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  addTxt: { color: colors.primary, fontWeight: '800' },
  info: { backgroundColor: colors.orangeTint, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderLeftWidth: 3, borderColor: colors.primary },
  tipH: { fontSize: 11, fontWeight: '800', color: colors.primary, marginBottom: 6, textTransform: 'uppercase' },
  infoTxt: { color: colors.charcoal, fontSize: 13, lineHeight: 20 },
  thead: { flexDirection: 'row', backgroundColor: colors.white, paddingVertical: 8, borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md, borderWidth: 1, borderColor: colors.border, borderBottomWidth: 0 },
  tr: { flexDirection: 'row', backgroundColor: colors.white, borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border, paddingVertical: 10, alignItems: 'center' },
  tcell: { flex: 2, fontSize: 11, paddingHorizontal: 4, color: colors.charcoal, fontWeight: '600' },
  th: { color: colors.grey, fontSize: 10, fontWeight: '800' },
  narrow: { flex: 1.2 },
  num: { flex: 0.8, textAlign: 'right' },
  tiny: { flex: 0.5 },
  earn: { color: colors.success, fontWeight: '800' },
  edit: { flex: 0.6, alignItems: 'flex-end', paddingRight: 6 },
  editTxt: { color: colors.primary, fontWeight: '800', fontSize: 11 },
  foot: { height: spacing.lg, borderWidth: 1, borderColor: colors.border, borderTopWidth: 0, backgroundColor: colors.white, borderBottomLeftRadius: radius.md, borderBottomRightRadius: radius.md },
});
