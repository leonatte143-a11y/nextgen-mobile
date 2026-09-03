import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'kairo_fav_listings_v1';

type Ctx = {
  favoriteIds: string[];
  isFavorite: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => Promise<void>;
};

const MarketplaceFavoritesContext = createContext<Ctx | undefined>(undefined);

export function MarketplaceFavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const persist = useCallback(async (next: string[]) => {
    setFavoriteIds(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const ids = JSON.parse(raw) as string[];
          if (Array.isArray(ids)) setFavoriteIds(ids);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const isFavorite = useCallback((listingId: string) => favoriteIds.includes(listingId), [favoriteIds]);

  const toggleFavorite = useCallback(
    async (listingId: string) => {
      if (favoriteIds.includes(listingId)) {
        await persist(favoriteIds.filter((id) => id !== listingId));
      } else {
        await persist([listingId, ...favoriteIds]);
      }
    },
    [favoriteIds, persist],
  );

  const value = useMemo(() => ({ favoriteIds, isFavorite, toggleFavorite }), [favoriteIds, isFavorite, toggleFavorite]);

  return <MarketplaceFavoritesContext.Provider value={value}>{children}</MarketplaceFavoritesContext.Provider>;
}

export function useMarketplaceFavorites() {
  const c = useContext(MarketplaceFavoritesContext);
  if (!c) throw new Error('useMarketplaceFavorites must be used within MarketplaceFavoritesProvider');
  return c;
}
