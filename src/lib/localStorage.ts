import AsyncStorage from '@react-native-async-storage/async-storage';

export const LOCAL_STORAGE_KEYS = {
  notificationBookingUpdates: 'kairo_notify_booking_updates',
  notificationSpecialOffers: 'kairo_notify_special_offers',
  notificationAppUpdates: 'kairo_notify_app_updates',
  searchQueryCount: 'kairo_search_query_count',
};

export async function getBooleanSetting(key: string, defaultValue = false): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw === '1' ? true : raw === '0' ? false : defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function setBooleanSetting(key: string, value: boolean): Promise<void> {
  await AsyncStorage.setItem(key, value ? '1' : '0');
}

export async function getSearchQueryCount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.searchQueryCount);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

export async function incrementSearchQueryCount(): Promise<number> {
  const current = await getSearchQueryCount();
  const next = current + 1;
  await AsyncStorage.setItem(LOCAL_STORAGE_KEYS.searchQueryCount, String(next));
  return next;
}
