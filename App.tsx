import { NavigationContainer } from '@react-navigation/native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';

ExpoSplashScreen.preventAutoHideAsync().catch(() => {});
import { DevDebugPanel } from './src/components/DevDebugPanel';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { PartnerProvider } from './src/context/PartnerContext';
import { onNavigationStateChange } from './src/navigation/navigationDev';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SHOULD_USE_API } from './src/services/api';
import { apiService } from './src/services/apiService';
import { IS_DEV } from './src/lib/devLog';

function AppShell() {
  const { isDark } = useTheme();
  useEffect(() => {
    if (!SHOULD_USE_API) return;
    if (IS_DEV) {
      apiService
        .health()
        .then((x) => console.log('[API health]', apiService.baseUrl, x))
        .catch((e) => console.log('[API health failed]', apiService.baseUrl, String(e?.message ?? e)));
    }
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer onStateChange={onNavigationStateChange}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <RootNavigator />
      </NavigationContainer>
      {IS_DEV ? <DevDebugPanel /> : null}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <PartnerProvider>
            <FavoritesProvider>
              <AppShell />
            </FavoritesProvider>
          </PartnerProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
