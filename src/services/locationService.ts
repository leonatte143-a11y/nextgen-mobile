import { Alert, Linking, Platform } from 'react-native';

export type Coords = { latitude: number; longitude: number };

/** In-memory cache populated once per app session (see `HomeScreen`'s mount effect) so
 * screens that only best-effort check permission (`getCoordsIfPermitted`) still get a real
 * fix without each of them having to actively prompt. */
let cachedCoords: Coords | null = null;

export function setCachedCoords(coords: Coords | null): void {
  cachedCoords = coords;
}

export function getCachedCoordsSync(): Coords | null {
  return cachedCoords;
}

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
      'KAIRO needs location access for hyperlocal services. Enable it in device settings.',
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
    const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    cachedCoords = coords;
    return coords;
  } catch {
    return null;
  }
}

/** Best-effort coords for non-critical features (e.g. ad geo-fencing) — never prompts the
 * user; returns null unless location permission was already granted elsewhere. */
export async function getCoordsIfPermitted(): Promise<Coords | null> {
  if (cachedCoords) return cachedCoords;
  const mod = await getLocationModule();
  if (!mod) return null;
  try {
    const { status } = await mod.getForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await mod.getCurrentPositionAsync({
      accuracy: Platform.OS === 'android' ? mod.Accuracy.Balanced : mod.Accuracy.High,
    });
    const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    cachedCoords = coords;
    return coords;
  } catch {
    return null;
  }
}

/** Match GPS reverse-geocode result to a known AP city name. */
export async function detectCityFromGps(cityOptions: readonly string[]): Promise<string | null> {
  const mod = await getLocationModule();
  if (!mod) return null;
  const coords = await getCurrentCoords();
  if (!coords) return null;
  try {
    const results = await mod.reverseGeocodeAsync(coords);
    const raw = results[0];
    if (!raw) return null;
    const candidates = [raw.city, raw.subregion, raw.district, raw.region]
      .filter(Boolean)
      .map((s) => String(s).trim());
    const lowerOptions = cityOptions.map((c) => ({ label: c, lower: c.toLowerCase() }));
    for (const name of candidates) {
      const lower = name.toLowerCase();
      const exact = lowerOptions.find((o) => o.lower === lower);
      if (exact) return exact.label;
      const partial = lowerOptions.find((o) => lower.includes(o.lower) || o.lower.includes(lower));
      if (partial) return partial.label;
    }
    return null;
  } catch {
    return null;
  }
}
