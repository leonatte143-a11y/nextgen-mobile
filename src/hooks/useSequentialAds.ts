import { useEffect, useState } from 'react';

/** Rotate through queued ads one at a time (15s per doc 8). */
export function useSequentialAdIndex(count: number, durationMs = 15_000): number {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return undefined;
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % count);
    }, durationMs);
    return () => clearInterval(timer);
  }, [count, durationMs]);

  return idx;
}

export function sortBannersByQueue<T extends { displayOrder?: number; priority?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const da = a.displayOrder ?? 0;
    const db = b.displayOrder ?? 0;
    if (da !== db) return da - db;
    return (b.priority ?? 0) - (a.priority ?? 0);
  });
}
