import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

/** Simple persisted favorite-id set, keyed by `storageKey` — standalone, no Provider needed. */
export function useFavoriteIds(storageKey: string) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          const ids = JSON.parse(raw);
          if (Array.isArray(ids)) setFavoriteIds(ids);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [storageKey]);

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavoriteIds((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
        AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [storageKey],
  );

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  return { favoriteIds, isFavorite, toggleFavorite };
}
