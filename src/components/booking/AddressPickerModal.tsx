import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import { LOCAL_STORAGE_KEYS } from '../../lib/localStorage';
import { isServiceableLocation } from '../../utils/geoFence';
import { geoZoneService } from '../../services/geoZoneService';
import { getCurrentCoords, reverseGeocodeCityName, type Coords } from '../../services/locationService';
import type { SavedAddress } from '../../screens/SavedAddressesScreen';

export type PickedAddress = { line: string; latitude?: number; longitude?: number };

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (address: PickedAddress) => void;
  initialAddress?: PickedAddress;
};

export function AddressPickerModal({ visible, onClose, onConfirm, initialAddress }: Props) {
  const navigation = useNavigation();
  const [line, setLine] = useState(initialAddress?.line ?? '');
  const [coords, setCoords] = useState<Coords | null>(
    initialAddress?.latitude != null && initialAddress?.longitude != null
      ? { latitude: initialAddress.latitude, longitude: initialAddress.longitude }
      : null,
  );
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [locating, setLocating] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLine(initialAddress?.line ?? '');
    setCoords(
      initialAddress?.latitude != null && initialAddress?.longitude != null
        ? { latitude: initialAddress.latitude, longitude: initialAddress.longitude }
        : null,
    );
    AsyncStorage.getItem(LOCAL_STORAGE_KEYS.savedAddresses).then((raw) => {
      if (!raw) return;
      try {
        setSavedAddresses(JSON.parse(raw) as SavedAddress[]);
      } catch {
        setSavedAddresses([]);
      }
    });
  }, [visible, initialAddress]);

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const c = await getCurrentCoords();
      if (!c) {
        Alert.alert('Location unavailable', 'Could not fetch your current location. Try again.');
        return;
      }
      setCoords(c);
      const city = await reverseGeocodeCityName(c);
      if (city) setLine((prev) => (prev.trim() ? prev : city));
    } finally {
      setLocating(false);
    }
  };

  const pickSaved = (a: SavedAddress) => {
    setLine(a.line);
    setCoords(a.latitude != null && a.longitude != null ? { latitude: a.latitude, longitude: a.longitude } : null);
  };

  const confirm = async () => {
    if (!line.trim()) {
      Alert.alert('Address required', 'Enter or pick a delivery address.');
      return;
    }
    if (!coords) {
      onConfirm({ line: line.trim() });
      return;
    }
    setChecking(true);
    try {
      const zones = await geoZoneService.getActiveZones();
      if (!isServiceableLocation(coords, zones)) {
        Alert.alert('Not serviceable', "We don't have partners serving this location yet.");
        return;
      }
      onConfirm({ line: line.trim(), latitude: coords.latitude, longitude: coords.longitude });
    } catch {
      onConfirm({ line: line.trim(), latitude: coords.latitude, longitude: coords.longitude });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>Deliver to</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.charcoal} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
              <Pressable style={styles.locBtn} onPress={() => void useMyLocation()} disabled={locating}>
                {locating ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="locate-outline" size={18} color={colors.primary} />
                )}
                <Text style={styles.locTxt}>
                  {locating ? 'Fetching location…' : coords ? 'Location pin added ✓' : 'Use my current location'}
                </Text>
              </Pressable>

              {savedAddresses.length > 0 ? (
                <>
                  <Text style={styles.section}>Saved addresses</Text>
                  {savedAddresses.map((a) => (
                    <Pressable
                      key={a.id}
                      style={[styles.savedCard, line === a.line && styles.savedCardActive]}
                      onPress={() => pickSaved(a)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.savedLabel}>{a.label}</Text>
                        <Text style={styles.savedLine} numberOfLines={2}>
                          {a.line}
                        </Text>
                      </View>
                      {line === a.line ? (
                        <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                      ) : null}
                    </Pressable>
                  ))}
                </>
              ) : null}

              <Text style={styles.section}>Or type an address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="House no, street, area, city"
                value={line}
                onChangeText={(v) => {
                  setLine(v);
                  setCoords(null);
                }}
                multiline
              />

              <Pressable
                onPress={() => {
                  onClose();
                  navigation.navigate('SavedAddresses' as never);
                }}
              >
                <Text style={styles.manageLink}>Manage saved addresses</Text>
              </Pressable>

              <Pressable
                style={[styles.confirmBtn, checking && styles.confirmBtnDisabled]}
                disabled={checking}
                onPress={() => void confirm()}
              >
                {checking ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.confirmTxt}>Confirm address</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 17, fontWeight: '800', color: colors.navy },
  body: { padding: spacing.md, paddingBottom: spacing.xl },
  locBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  locTxt: { color: colors.primary, fontWeight: '700' },
  section: { fontWeight: '800', color: colors.navy, marginTop: spacing.md, marginBottom: spacing.sm },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  savedCardActive: { borderColor: colors.primary, backgroundColor: colors.orangeTint },
  savedLabel: { fontWeight: '800', color: colors.navy, fontSize: 13 },
  savedLine: { color: colors.slate, marginTop: 2, fontSize: 13 },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  manageLink: { color: colors.primary, fontWeight: '700', marginTop: spacing.md, textAlign: 'center' },
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    minHeight: 52,
    justifyContent: 'center',
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmTxt: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
