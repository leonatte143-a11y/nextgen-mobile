import { Alert, Linking, Platform } from 'react-native';

export type Coords = { latitude: number; longitude: number };

let Location: typeof import('expo-location') | null = null;

async function getLocationModule() {
  if (!Location) {
    try {
      Location = await import('expo-location');
    } catch {
      Location = null;
    }
  }
  return Location;
}

export async function requestLocationPermission(): Promise<boolean> {
  const mod = await getLocationModule();
  if (!mod) {
    Alert.alert(
      'Location required',
      'NEXGEN needs location access for hyperlocal services. Enable it in device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ],
    );
    return false;
  }
  const { status: existing } = await mod.getForegroundPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await mod.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Location required',
      'Please allow location access to find nearby service partners.',
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Settings', onPress: () => Linking.openSettings() },
      ],
    );
    return false;
  }
  return true;
}

export async function getCurrentCoords(): Promise<Coords | null> {
  const mod = await getLocationModule();
  if (!mod) return null;
  const ok = await requestLocationPermission();
  if (!ok) return null;
  try {
    const pos = await mod.getCurrentPositionAsync({
      accuracy: Platform.OS === 'android' ? mod.Accuracy.Balanced : mod.Accuracy.High,
    });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return null;
  }
}
