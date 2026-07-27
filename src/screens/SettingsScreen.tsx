import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { LOCAL_STORAGE_KEYS, getBooleanSetting, setBooleanSetting } from '../lib/localStorage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { RootStackParamList } from '../navigation/types';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { logoutUser } = useAuth();
  const { isDark, setDarkMode } = useTheme();
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [specialOffers, setSpecialOffers] = useState(true);
  const [appUpdates, setAppUpdates] = useState(false);

  useEffect(() => {
    void (async () => {
      setBookingUpdates(await getBooleanSetting(LOCAL_STORAGE_KEYS.notificationBookingUpdates, true));
      setSpecialOffers(await getBooleanSetting(LOCAL_STORAGE_KEYS.notificationSpecialOffers, true));
      setAppUpdates(await getBooleanSetting(LOCAL_STORAGE_KEYS.notificationAppUpdates, false));
    })();
  }, []);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.body}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.section}>Account</Text>
      <NavRow icon="person-outline" label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
      <NavRow
        icon="lock-closed-outline"
        label="Change Password"
        onPress={() =>
          Alert.alert(
            'No password needed',
            'NEXGEN accounts sign in securely with a one-time OTP sent to your phone — there is no password to change.',
          )
        }
      />
      <NavRow icon="location-outline" label="Manage Addresses" onPress={() => navigation.navigate('SavedAddresses')} />

      <Text style={styles.section}>Preferences</Text>
      <Row label="Dark mode" value={isDark} onChange={(v) => void setDarkMode(v)} />
      <Row
        label="Booking updates"
        value={bookingUpdates}
        onChange={(next) => {
          setBookingUpdates(next);
          void setBooleanSetting(LOCAL_STORAGE_KEYS.notificationBookingUpdates, next);
        }}
      />
      <Row
        label="Special offers"
        value={specialOffers}
        onChange={(next) => {
          setSpecialOffers(next);
          void setBooleanSetting(LOCAL_STORAGE_KEYS.notificationSpecialOffers, next);
        }}
      />
      <Row
        label="App updates"
        value={appUpdates}
        onChange={(next) => {
          setAppUpdates(next);
          void setBooleanSetting(LOCAL_STORAGE_KEYS.notificationAppUpdates, next);
        }}
      />
      <NavRow icon="globe-outline" label="Language" onPress={() => navigation.navigate('Language')} />

      <Text style={styles.section}>Support</Text>
      <NavRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => navigation.navigate('Privacy')} />
      <NavRow icon="document-text-outline" label="Terms of Service" onPress={() => navigation.navigate('Terms')} />
      <NavRow icon="alert-circle-outline" label="Report an Issue" onPress={() => navigation.navigate('Support')} />
      <View style={styles.versionRow}>
        <Text style={styles.versionTxt}>NEXGEN v{APP_VERSION}</Text>
      </View>

      <Text style={styles.section}>Actions</Text>
      <PrimaryButton
        title="Logout"
        variant="danger"
        onPress={async () => {
          await logoutUser();
          navigation.reset({ index: 0, routes: [{ name: 'UserLogin' }] });
        }}
      />
    </ScrollView>
  );
}

function Row({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowTxt}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

function NavRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
      <Text style={styles.rowTxt}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.grey} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  body: { padding: spacing.lg, paddingTop: 48 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { fontSize: 18, fontWeight: '800' },
  section: { fontWeight: '800', marginBottom: spacing.sm, marginTop: spacing.md },
  actionGroup: { marginTop: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  rowTxt: { fontWeight: '600', flex: 1 },
  versionRow: { alignItems: 'center', paddingVertical: spacing.md },
  versionTxt: { color: colors.grey, fontSize: 12 },
});
