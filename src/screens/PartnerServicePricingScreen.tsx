import React from 'react';
import type { PartnerServicePricingScreenProps } from '../navigation/PartnerStackTypes';
import { PartnerMyServicesScreen } from './PartnerMyServicesScreen';

/** Legacy stack route — same as My Services tab */
export function PartnerServicePricingScreen({ navigation }: PartnerServicePricingScreenProps) {
  return <PartnerMyServicesScreen showBack onBack={() => navigation.goBack()} />;
}
