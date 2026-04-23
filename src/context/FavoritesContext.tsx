import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'nexgen_fav_partners_v1';

export type FavoritePartner = {
  partnerId: string;
  name: string;
  rating: number;
  jobsCompleted: number;
  serviceId: string;
  savedAt: number;
};

type Ctx = {
  favorites: FavoritePartner[];
  isFavorite: (partnerId: string) => boolean;
  toggleFavorite: (f: Omit<FavoritePartner, 'savedAt'> & { savedAt?: number }) => Promise<void>;
  refresh: () => Promise<void>;
};

const FavoritesContext = createContext<Ctx | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoritePartner[]>([]);

  const persist = useCallback(async (next: FavoritePartner[]) => {
    setFavorites(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as FavoritePartner[];
        if (Array.isArray(p)) setFavorites(p);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const isFavorite = useCallback(
    (partnerId: string) => favorites.some((x) => x.partnerId === partnerId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (f: Omit<FavoritePartner, 'savedAt'> & { savedAt?: number }) => {
      const existing = favorites.find((x) => x.partnerId === f.partnerId);
      if (existing) {
        await persist(favorites.filter((x) => x.partnerId !== f.partnerId));
        return;
      }
      const row: FavoritePartner = {
        ...f,
        savedAt: f.savedAt ?? Date.now(),
      };
      await persist([row, ...favorites]);
    },
    [favorites, persist],
  );

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, refresh: load }),
    [favorites, isFavorite, toggleFavorite, load],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const c = useContext(FavoritesContext);
  if (!c) throw new Error('useFavorites must be used within FavoritesProvider');
  return c;
}

/** Puts services whose partner is favorited first (listing order). */
export function sortByFavoritePartner<T extends { partner: { id: string } }>(
  items: T[],
  isFavorite: (partnerId: string) => boolean,
): T[] {
  return [...items].sort(
    (a, b) => (isFavorite(b.partner.id) ? 1 : 0) - (isFavorite(a.partner.id) ? 1 : 0),
  );
}
