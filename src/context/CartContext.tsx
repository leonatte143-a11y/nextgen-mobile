import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CatalogService } from '../mock/types';

const CART_KEY = 'nexgen_cart_v1';

export type CartLine = {
  lineId: string;
  serviceId: string;
  qty: number;
  service: CatalogService;
};

type CartContextValue = {
  lines: CartLine[];
  addService: (service: CatalogService, qty?: number) => Promise<void>;
  setQty: (lineId: string, qty: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  clear: () => Promise<void>;
  visitingFee: number;
  subtotal: number;
  estimatedTotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const persist = useCallback(async (next: CartLine[]) => {
    setLines(next);
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CART_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as CartLine[];
          if (Array.isArray(parsed)) setLines(parsed);
        }
      } catch {
        /* ignore corrupt cart */
      }
    })();
  }, []);

  const addService = useCallback(
    async (service: CatalogService, qty = 1) => {
      const existing = lines.find((l) => l.serviceId === service.id);
      if (existing) {
        const next = lines.map((l) =>
          l.lineId === existing.lineId ? { ...l, qty: l.qty + qty } : l,
        );
        await persist(next);
        return;
      }
      const line: CartLine = {
        lineId: `ln_${service.id}_${Date.now()}`,
        serviceId: service.id,
        qty,
        service,
      };
      await persist([...lines, line]);
    },
    [lines, persist],
  );

  const setQty = useCallback(
    async (lineId: string, qty: number) => {
      if (qty < 1) {
        await persist(lines.filter((l) => l.lineId !== lineId));
        return;
      }
      await persist(lines.map((l) => (l.lineId === lineId ? { ...l, qty } : l)));
    },
    [lines, persist],
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      await persist(lines.filter((l) => l.lineId !== lineId));
    },
    [lines, persist],
  );

  const clear = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.service.basePrice * l.qty, 0),
    [lines],
  );
  const visitingFee = 30;
  const estimatedTotal = useMemo(() => {
    if (lines.length === 0) return 0;
    return subtotal + visitingFee;
  }, [lines.length, subtotal]);

  const value = useMemo(
    () => ({
      lines,
      addService,
      setQty,
      removeLine,
      clear,
      visitingFee,
      subtotal,
      estimatedTotal,
    }),
    [lines, addService, setQty, removeLine, clear, visitingFee, subtotal, estimatedTotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
