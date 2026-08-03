import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { KairoTextInput } from '../components/KairoTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function EditProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setInitialLoading(true);
      setLoadError(null);
      try {
        const p = await userService.getProfile();
        if (cancelled) return;
        setFirstName(p.firstName);
        setLastName(p.lastName);
        setEmail(p.email);
        setPhone(p.phone);
        setAddress(p.address);
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Could not load profile.';
          setLoadError(msg);
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      await userService.updateProfile({ firstName, lastName, email, address });
      await refreshProfile();
      navigation.goBack();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not save profile.';
      Alert.alert('Update failed', msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.muted}>Loading profile…</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.root, styles.center, { padding: spacing.lg }]}>
        <Text style={styles.errorTitle}>Could not load profile</Text>
        <Text style={styles.muted}>{loadError}</Text>
        <PrimaryButton
          title="Try again"
          onPress={async () => {
            setLoadError(null);
            setInitialLoading(true);
            try {
              const p = await userService.getProfile();
              setFirstName(p.firstName);
              setLastName(p.lastName);
              setEmail(p.email);
              setPhone(p.phone);
              setAddress(p.address);
            } catch (e: unknown) {
              setLoadError(e instanceof Error ? e.message : 'Could not load profile.');
            } finally {
              setInitialLoading(false);
            }
          }}
          style={{ marginTop: spacing.lg }}
        />
        <PrimaryButton title="Go back" onPress={() => navigation.goBack()} style={{ marginTop: spacing.sm }} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.body}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Edit profile</Text>
        <View style={{ width: 24 }} />
      </View>
      <KairoTextInput label="First name" value={firstName} onChangeText={setFirstName} />
      <KairoTextInput label="Last name" value={lastName} onChangeText={setLastName} />
      <KairoTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <KairoTextInput label="Phone (OTP login)" value={phone} editable={false} />
      <KairoTextInput label="Address" value={address} onChangeText={setAddress} multiline />
      <PrimaryButton title="Save changes" onPress={save} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  body: { padding: spacing.lg, paddingTop: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { fontSize: 18, fontWeight: '800' },
  muted: { color: colors.grey, textAlign: 'center', marginTop: spacing.sm },
  errorTitle: { fontSize: 18, fontWeight: '800', color: colors.charcoal, marginBottom: spacing.sm },
});
