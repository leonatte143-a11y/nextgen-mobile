import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePartner } from '../context/PartnerContext';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/types';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export function PartnerProfileScreen() {
  const navigation = useNavigation<NavigationProps>();
  const { userToken, logoutPartner } = useAuth();
  const { profile, updateProfile, isLoading } = usePartner();
  const [bio, setBio] = useState('Trusted expert for home electrical and repair services.');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  if (isLoading || !profile) {
    return null;
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ skills: profile.skills, categories: profile.categories });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutPartner();
    navigation.replace('UserLogin');
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.profileImage}>
          <Text style={styles.profileLetter}>{profile.name.charAt(0)}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileSub}>{profile.phone}</Text>
          <Text style={styles.profileSub}>{profile.verificationStatus}</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.tagsRow}>
          {profile.skills.map((skill) => (
            <View key={skill} style={styles.tag}>
              <Text style={styles.tagText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.tagsRow}>
          {profile.categories.map((category) => (
            <View key={category} style={styles.tagGrey}>
              <Text style={styles.tagText}>{category}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Partner Bio</Text>
        <TextInput value={bio} onChangeText={setBio} style={styles.textArea} multiline />
      </View>
      <View style={styles.settingRow}>
        <Text style={styles.sectionTitle}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={setIsDarkMode} trackColor={{ true: colors.primary }} />
      </View>
      <Pressable
        style={styles.switchModeBtn}
        onPress={() => {
          if (userToken) {
            navigation.replace('MainTabs');
          } else {
            navigation.navigate('UserLogin');
          }
        }}
      >
        <Ionicons name="swap-horizontal-outline" size={18} color={colors.white} />
        <Text style={styles.switchModeTxt}>{userToken ? 'Switch to User Mode' : 'Sign in as User'}</Text>
      </Pressable>
      <View style={styles.bankCard}>
        <Text style={styles.sectionTitle}>Bank Details</Text>
        <Text style={styles.sectionText}>{profile.bankName} • {profile.bankAccount}</Text>
      </View>
      <View style={styles.trainingCard}>
        <Text style={styles.sectionTitle}>Training Progress</Text>
        <Text style={styles.sectionText}>{profile.trainingProgress}% complete</Text>
        <Text style={styles.sectionText}>Watch app safety and customer service clips to unlock new categories.</Text>
      </View>
      <PrimaryButton title={loading ? 'Saving...' : 'Save Profile'} onPress={handleSave} loading={loading} />
      <PrimaryButton title="Logout" variant="outline" onPress={handleLogout} style={styles.logoutButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  profileCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  profileImage: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  profileLetter: { color: colors.primary, fontSize: 28, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { color: colors.white, fontSize: 20, fontWeight: '800' },
  profileSub: { color: colors.orangeTint, marginTop: spacing.xs },
  section: { marginTop: spacing.lg, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg },
  sectionTitle: { fontSize: 14, color: colors.grey, fontWeight: '700', marginBottom: spacing.sm },
  sectionText: { fontSize: 15, color: colors.charcoal, marginBottom: spacing.xs },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  tagGrey: { backgroundColor: colors.greyLight, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  tagText: { color: colors.white, fontWeight: '700' },
  textArea: { borderRadius: radius.md, backgroundColor: colors.greyLight, minHeight: 120, padding: spacing.md, textAlignVertical: 'top' },
  settingRow: { marginTop: spacing.lg, backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bankCard: { marginTop: spacing.lg, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg },
  trainingCard: { marginTop: spacing.lg, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg },
  logoutButton: { marginTop: spacing.md, borderWidth: 1, borderColor: colors.primary },
  switchModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  switchModeTxt: { color: colors.white, fontWeight: '800' },
});
