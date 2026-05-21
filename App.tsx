import { NavigationContainer } from '@react-navigation/native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';

ExpoSplashScreen.preventAutoHideAsync().catch(() => {});
import { DevDebugPanel } from './src/components/DevDebugPanel';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { PartnerProvider } from './src/context/PartnerContext';
import { onNavigationStateChange } from './src/navigation/navigationDev';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SHOULD_USE_API } from './src/services/api';
import { apiService } from './src/services/apiService';
import { IS_DEV } from './src/lib/devLog';

export default function App() {
  useEffect(() => {
    if (!SHOULD_USE_API) return;
    apiService
      .health()
      .then((x) => console.log('[API health]', apiService.baseUrl, x))
      .catch((e) => console.log('[API health failed]', apiService.baseUrl, String(e?.message ?? e)));
  }, []);
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PartnerProvider>
          <FavoritesProvider>
            <CartProvider>
            <View style={{ flex: 1 }}>
              <NavigationContainer onStateChange={onNavigationStateChange}>
                <StatusBar style="dark" />
                <RootNavigator />
              </NavigationContainer>
              {IS_DEV ? <DevDebugPanel /> : null}
            </View>
            </CartProvider>
          </FavoritesProvider>
        </PartnerProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
