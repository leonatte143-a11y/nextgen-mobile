import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NexgenTextInput } from '../components/NexgenTextInput';
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

  useEffect(() => {
    (async () => {
      const p = await userService.getProfile();
      setFirstName(p.firstName);
      setLastName(p.lastName);
      setEmail(p.email);
      setPhone(p.phone);
      setAddress(p.address);
    })();
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      await userService.updateProfile({ firstName, lastName, email, address });
      await refreshProfile();
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.body}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Edit profile</Text>
        <View style={{ width: 24 }} />
      </View>
      <NexgenTextInput label="First name" value={firstName} onChangeText={setFirstName} />
      <NexgenTextInput label="Last name" value={lastName} onChangeText={setLastName} />
      <NexgenTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <NexgenTextInput label="Phone (OTP login)" value={phone} editable={false} />
      <NexgenTextInput label="Address" value={address} onChangeText={setAddress} multiline />
      <PrimaryButton title="Save changes" onPress={save} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  body: { padding: spacing.lg, paddingTop: 48 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { fontSize: 18, fontWeight: '800' },
});
