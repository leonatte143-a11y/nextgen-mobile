import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainCategoryId } from '../data/serviceCatalog';
import type { BucketId } from '../mock/types';
import type { AdvertisementBanner, BannerRedirectType } from '../types/banner';
import type { RootStackParamList } from './types';

const BUCKET_IDS: BucketId[] = [
  'home_services',
  'home_repair',
  'tech_supply',
  'life_health',
  'professional_education',
  'events',
];

const MAIN_CATEGORY_IDS: MainCategoryId[] = [
  'home_services',
  'home_repair',
  'professional_education',
  'life_health',
  'events',
];

function asBucketId(value: string): BucketId | null {
  const v = value.trim() as BucketId;
  return BUCKET_IDS.includes(v) ? v : null;
}

function asMainCategoryId(value: string): MainCategoryId | null {
  const v = value.trim() as MainCategoryId;
  return MAIN_CATEGORY_IDS.includes(v) ? v : null;
}

export function handleBannerPress(
  banner: AdvertisementBanner,
  navigation: NativeStackNavigationProp<RootStackParamList>,
): void {
  const type = (banner.redirectType || 'none') as BannerRedirectType;
  const value = (banner.redirectValue || '').trim();

  switch (type) {
    case 'category': {
      const cat = asMainCategoryId(value);
      if (cat) {
        navigation.navigate('CategoryServices', { categoryId: cat });
        return;
      }
      const bucket = asBucketId(value);
      if (bucket) {
        navigation.navigate('ServiceList', { bucketId: bucket, title: banner.title });
        return;
      }
      navigation.navigate('AllServices');
      return;
    }
    case 'event':
      navigation.navigate('CategoryServices', { categoryId: 'events' });
      return;
    case 'service':
      if (value) navigation.navigate('ServiceProviders', { serviceId: value });
      return;
    case 'partner':
      navigation.navigate('ServiceList', {
        bucketId: null,
        title: banner.title,
        searchQuery: value || banner.title,
      });
      return;
    case 'external':
      if (value) {
        WebBrowser.openBrowserAsync(value).catch(() => Linking.openURL(value).catch(() => {}));
      }
      return;
    case 'offer':
      navigation.navigate('Rewards');
      return;
    case 'all_services':
      navigation.navigate('AllServices');
      return;
    case 'none':
    default:
      break;
  }
}
