import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import type { PartnerPricingRow, PartnerPriceLimits } from '../mock/types';
import { partnerService } from '../services/partnerService';

type EditState = {
  id: string;
  serviceName: string;
  category: string;
  baseCost: string;
};

type Props = {
  showBack?: boolean;
  onBack?: () => void;
};

export function PartnerMyServicesScreen({ showBack, onBack }: Props = {}) {
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<PartnerPricingRow[]>([]);
  const [limits, setLimits] = useState<PartnerPriceLimits>({ min: 100, max: 1000 });
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState('');
  const [addPrice, setAddPrice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await partnerService.getPricingRows();
      setRows(data.items);
      setLimits(data.limits);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const openEdit = (row: PartnerPricingRow) => {
    setEdit({
      id: row.id,
      serviceName: row.serviceName,
      category: row.category,
      baseCost: String(row.baseCost),
    });
  };

  const saveEdit = async () => {
    if (!edit) return;
    const price = parseInt(edit.baseCost.replace(/\D/g, ''), 10);
    if (!edit.serviceName.trim() || !price) {
      Alert.alert('Invalid', 'Enter service name and price.');
      return;
    }
    try {
      const res = await partnerService.updatePricingRow(edit.id, {
        serviceName: edit.serviceName.trim(),
        category: edit.category.trim() || 'General',
        baseCost: price,
      });
      setRows(res.items);
      setLimits(res.limits);
      const updated = res.items.find((r) => r.id === edit.id);
      if (updated?.approvalStatus === 'pending_review') {
        Alert.alert(
          'Admin review',
          `Price is outside ₹${res.limits.min}–₹${res.limits.max}. It will go live after approval.`,
        );
      }
      setEdit(null);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save');
    }
  };

  const saveAdd = async () => {
    const price = parseInt(addPrice.replace(/\D/g, ''), 10);
    if (!addName.trim() || !price) {
      Alert.alert('Invalid', 'Enter service name and price.');
      return;
    }
    try {
      const { list } = await partnerService.addPricingRow(
        addName.trim(),
        addCategory.trim() || 'General',
        price,
      );
      setRows(list.items);
      setLimits(list.limits);
      const pending = list.items.find((r) => r.serviceName === addName.trim() && r.approvalStatus === 'pending_review');
      if (pending) {
        Alert.alert(
          'Admin review',
          `Price is outside ₹${list.limits.min}–₹${list.limits.max}. Service saved but hidden until approved.`,
        );
      }
      setAddOpen(false);
      setAddName('');
      setAddCategory('');
      setAddPrice('');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not add service');
    }
  };

  const toggleActive = async (row: PartnerPricingRow, value: boolean) => {
    if (row.approvalStatus === 'pending_review' && value) {
      Alert.alert('Pending review', 'This service cannot go live until admin approves the price.');
      return;
    }
    try {
      const res = await partnerService.updatePricingRow(row.id, { isActive: value });
      setRows(res.items);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not update status');
    }
  };

  const confirmDelete = (row: PartnerPricingRow) => {
    Alert.alert('Delete service', `Remove "${row.serviceName}" from your menu?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await partnerService.deletePricingRow(row.id);
            setRows(res.items);
          } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Could not delete');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <ScreenLoader />;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {showBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
          </Pressable>
        ) : null}
        <Text style={styles.title}>My Services</Text>
        <Text style={styles.sub}>Manage what customers can book from you</Text>
      </View>

      <View style={styles.limitsCard}>
        <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
        <Text style={styles.limitsTxt}>
          Allowed price range: ₹{limits.min} – ₹{limits.max}. Outside this range requires admin approval.
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.addBtn} onPress={() => setAddOpen(true)}>
          <Ionicons name="add" size={22} color={colors.white} />
          <Text style={styles.addBtnTxt}>Add service</Text>
        </Pressable>

        {rows.length === 0 ? (
          <Text style={styles.empty}>
            No services yet. Add items like Pipe Fixes, Bathroom Fitting, or Tap Leaks.
          </Text>
        ) : (
          rows.map((row) => (
            <View key={row.id} style={[styles.card, !row.isActive && styles.cardOff]}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.svcName}>{row.serviceName}</Text>
                  <Text style={styles.price}>₹{row.baseCost}</Text>
                  {row.category ? <Text style={styles.cat}>{row.category}</Text> : null}
                  {row.approvalStatus === 'pending_review' ? (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingTxt}>Pending admin review</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.activeCol}>
                  <Text style={styles.activeLab}>{row.isActive ? 'Active' : 'Inactive'}</Text>
                  <Switch
                    value={row.isActive}
                    onValueChange={(v) => void toggleActive(row, v)}
                    trackColor={{ true: colors.primary }}
                    disabled={row.approvalStatus === 'pending_review'}
                  />
                </View>
              </View>
              <View style={styles.cardActions}>
                <Pressable onPress={() => openEdit(row)} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                  <Text style={styles.actionTxt}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => confirmDelete(row)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                  <Text style={[styles.actionTxt, { color: colors.error }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={!!edit} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit service</Text>
            <TextInput
              style={styles.input}
              value={edit?.serviceName}
              onChangeText={(t) => setEdit((e) => (e ? { ...e, serviceName: t } : e))}
              placeholder="Service name"
            />
            <TextInput
              style={styles.input}
              value={edit?.category}
              onChangeText={(t) => setEdit((e) => (e ? { ...e, category: t } : e))}
              placeholder="Category"
            />
            <TextInput
              style={styles.input}
              value={edit?.baseCost}
              onChangeText={(t) => setEdit((e) => (e ? { ...e, baseCost: t } : e))}
              placeholder={`Price (₹${limits.min}–₹${limits.max})`}
              keyboardType="number-pad"
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setEdit(null)}>
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </Pressable>
              <PrimaryButton title="Save" onPress={() => void saveEdit()} style={{ flex: 1 }} />
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
              placeholder="e.g. Pipe Fixes"
            />
            <TextInput
              style={styles.input}
              value={addCategory}
              onChangeText={setAddCategory}
              placeholder="Category (e.g. Plumbing)"
            />
            <TextInput
              style={styles.input}
              value={addPrice}
              onChangeText={setAddPrice}
              placeholder={`Your price ₹${limits.min}–${limits.max}`}
              keyboardType="number-pad"
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setAddOpen(false)}>
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </Pressable>
              <PrimaryButton title="Add" onPress={() => void saveAdd()} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.greyLight },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { marginBottom: spacing.sm, alignSelf: 'flex-start' },
  title: { fontSize: 22, fontWeight: '900', color: colors.charcoal },
  sub: { color: colors.grey, marginTop: 4, fontSize: 13 },
  limitsCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.md,
    backgroundColor: colors.orangeTint,
    borderRadius: radius.md,
    alignItems: 'flex-start',
  },
  limitsTxt: { flex: 1, fontSize: 12, color: colors.charcoal, lineHeight: 18 },
  body: { padding: spacing.md, paddingBottom: spacing.xl },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  addBtnTxt: { color: colors.white, fontWeight: '800', fontSize: 15 },
  empty: { textAlign: 'center', color: colors.grey, marginTop: spacing.xl, lineHeight: 22 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardOff: { opacity: 0.75, backgroundColor: colors.greyLight },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  svcName: { fontSize: 16, fontWeight: '800', color: colors.charcoal },
  price: { fontSize: 20, fontWeight: '900', color: colors.primary, marginTop: 4 },
  cat: { fontSize: 12, color: colors.grey, marginTop: 2 },
  pendingBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  pendingTxt: { fontSize: 11, fontWeight: '700', color: colors.charcoal },
  activeCol: { alignItems: 'center' },
  activeLab: { fontSize: 11, fontWeight: '700', color: colors.grey, marginBottom: 4 },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionTxt: { fontWeight: '700', color: colors.primary, fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: spacing.md },
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
});
