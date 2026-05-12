import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { PartnerProvider } from './src/context/PartnerContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SHOULD_USE_API } from './src/services/api';
import { apiService } from './src/services/apiService';

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
            <NavigationContainer>
              <StatusBar style="dark" />
              <RootNavigator />
            </NavigationContainer>
            </CartProvider>
          </FavoritesProvider>
        </PartnerProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
