import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenLoader } from '../components/ScreenLoader';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import type { PartnerServicePricingScreenProps } from '../navigation/PartnerStackTypes';
import type { PartnerPricingRow } from '../mock/types';
import { partnerService } from '../services/partnerService';

const COMMISSION_PCT = 10;

function commissionAmount(base: number) {
  return Math.round((base * COMMISSION_PCT) / 100 * 100) / 100;
}

export function PartnerServicePricingScreen({ navigation }: PartnerServicePricingScreenProps) {
  const [rows, setRows] = useState<PartnerPricingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState<PartnerPricingRow | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState('');
  const [addPrice, setAddPrice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await partnerService.getPricingRows();
    setRows(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (row: PartnerPricingRow) => {
    setEditRow(row);
    setEditValue(String(row.baseCost));
  };

  const saveEdit = async () => {
    if (!editRow) return;
    const n = parseInt(editValue.replace(/\D/g, ''), 10);
    if (!n || n < 1) return;
    const next = await partnerService.updatePricingBase(editRow.id, n);
    setRows(next);
    setEditRow(null);
  };

  const saveAdd = async () => {
    const price = parseInt(addPrice.replace(/\D/g, ''), 10);
    if (!addName.trim() || !addCategory.trim() || !price) return;
    const next = await partnerService.addPricingRow(addName.trim(), addCategory.trim(), price);
    setRows(next);
    setAddOpen(false);
    setAddName('');
    setAddCategory('');
    setAddPrice('');
  };

  if (loading) {
    return <ScreenLoader />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Service Pricing Management</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.toolbar}>
          <Pressable style={styles.addBtn} onPress={() => setAddOpen(true)}>
            <Ionicons name="add-circle-outline" size={20} color={colors.white} />
            <Text style={styles.addBtnTxt}>Add more service</Text>
          </Pressable>
        </View>

        <Text style={styles.subtitle}>Manage your services and view commission breakdown</Text>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Tip</Text>
            <Text style={styles.tipBody}>
              Lower prices during mornings can increase booking chances by ~20%. Keep your base cost
              competitive for your zone.
            </Text>
          </View>
        </View>

        <View style={styles.tableHead}>
          <Text style={styles.thFull}>Service · Base · Admin ({COMMISSION_PCT}%) · Your earning</Text>
        </View>

        {rows.map((row) => {
          const comm = commissionAmount(row.baseCost);
          const you = row.baseCost - comm;
          return (
            <View key={row.id} style={styles.row}>
              <View style={styles.rowTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.svcName}>{row.serviceName}</Text>
                  <Text style={styles.cat}>{row.category}</Text>
                </View>
                <Pressable onPress={() => openEdit(row)} hitSlop={8}>
                  <Text style={styles.editTxt}>Edit price</Text>
                </Pressable>
              </View>
              <View style={styles.numsRow}>
                <View style={styles.numCell}>
                  <Text style={styles.numLab}>Base</Text>
                  <Text style={styles.numVal}>₹{row.baseCost}</Text>
                </View>
                <View style={styles.numCell}>
                  <Text style={styles.numLab}>Admin</Text>
                  <Text style={styles.numVal}>₹{comm.toFixed(2)}</Text>
                </View>
                <View style={styles.numCell}>
                  <Text style={styles.numLab}>You earn</Text>
                  <Text style={[styles.numVal, styles.you]}>₹{you.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={!!editRow} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit base cost</Text>
            <Text style={styles.modalSub}>{editRow?.serviceName}</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={editValue}
              onChangeText={setEditValue}
              placeholder="Amount in ₹"
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setEditRow(null)}>
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </Pressable>
              <PrimaryButton title="Save" onPress={saveEdit} style={styles.modalSave} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={addOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add service</Text>
            <TextInput
              style={styles.input}
              value={addName}
              onChangeText={setAddName}
              placeholder="Service name"
            />
            <TextInput
              style={styles.input}
              value={addCategory}
              onChangeText={setAddCategory}
              placeholder="Category (e.g. Electrical)"
            />
            <TextInput
              style={styles.input}
              value={addPrice}
              onChangeText={setAddPrice}
              placeholder="Base price ₹"
              keyboardType="number-pad"
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setAddOpen(false)}>
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </Pressable>
              <PrimaryButton title="Add" onPress={saveAdd} style={styles.modalSave} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 48,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { padding: spacing.xs },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: colors.charcoal },
  body: { padding: spacing.md, paddingBottom: spacing.xl },
  toolbar: { marginBottom: spacing.sm },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  addBtnTxt: { color: colors.white, fontWeight: '800', fontSize: 14 },
  subtitle: { color: colors.grey, marginBottom: spacing.md, fontSize: 14 },
  tipCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.orangeTint,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  tipTitle: { fontWeight: '800', color: colors.charcoal, marginBottom: 4 },
  tipBody: { color: colors.grey, fontSize: 13, lineHeight: 20 },
  tableHead: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    marginBottom: spacing.xs,
  },
  thFull: { fontSize: 11, fontWeight: '800', color: colors.grey },
  row: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  numsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  numCell: { flex: 1, alignItems: 'center' },
  numLab: { fontSize: 10, color: colors.grey, fontWeight: '700' },
  numVal: { fontSize: 14, fontWeight: '700', color: colors.charcoal, marginTop: 4 },
  svcName: { fontWeight: '800', color: colors.charcoal, fontSize: 14 },
  cat: { fontSize: 11, color: colors.grey, marginTop: 2 },
  you: { color: colors.primary },
  editTxt: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.charcoal },
  modalSub: { color: colors.grey, marginBottom: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 16,
  },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, alignItems: 'center' },
  modalCancel: { padding: spacing.md },
  modalCancelTxt: { color: colors.grey, fontWeight: '700' },
  modalSave: { flex: 1 },
});
