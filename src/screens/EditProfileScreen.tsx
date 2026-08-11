import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { KairoTextInput } from '../components/KairoTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import type { RootStackParamList } from '../navigation/types';

const PHOTO_KEY = 'kairo_user_photo';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function EditProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(PHOTO_KEY).then((v) => {
      if (v) setPhotoUri(v);
    });
  }, []);

  const pickFrom = async (source: 'camera' | 'library') => {
    const perm =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', `Allow ${source === 'camera' ? 'camera' : 'photo library'} access to update your profile photo.`);
      return;
    }
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true, aspect: [1, 1] })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.6,
            allowsEditing: true,
            aspect: [1, 1],
          });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const uri = result.assets[0].uri;
    setPhotoUri(uri);
    await AsyncStorage.setItem(PHOTO_KEY, uri);
  };

  const choosePhoto = () => {
    Alert.alert('Update profile photo', undefined, [
      { text: 'Take Photo', onPress: () => void pickFrom('camera') },
      { text: 'Choose from Gallery', onPress: () => void pickFrom('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

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
      await userService.updateProfile({ firstName, lastName, address });
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
      <View style={styles.avatarWrap}>
        <Pressable style={styles.avatarOuter} onPress={choosePhoto}>
          <View style={styles.avatar}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avText}>{`${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || 'N'}</Text>
            )}
          </View>
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={16} color={colors.white} />
          </View>
        </Pressable>
      </View>
      <KairoTextInput label="First name" value={firstName} onChangeText={setFirstName} />
      <KairoTextInput label="Last name" value={lastName} onChangeText={setLastName} />
      <KairoTextInput label="Phone" value={phone} editable={false} />
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
  avatarWrap: { alignItems: 'center', marginBottom: spacing.lg },
  avatarOuter: {
    width: 104,
    height: 104,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avText: { fontSize: 34, fontWeight: '800', color: colors.primary },
  cameraBadge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navy,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
});
