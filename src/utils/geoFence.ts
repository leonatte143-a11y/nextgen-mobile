import type { Coords } from '../services/locationService';

/** Ray-casting point-in-polygon test, mirrors the backend's utils/geoFence.js. */
export function isPointInPolygon(point: Coords, polygon: { lat: number; lng: number }[]): boolean {
  if (!point || !Array.isArray(polygon) || polygon.length < 3) return false;
  const y = point.latitude;
  const x = point.longitude;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** True when `point` is inside at least one zone's polygon, or no zone in the list defines a
 * polygon yet (fail open — mirrors the backend's geo-fenced-banner behavior). */
export function isServiceableLocation(
  point: Coords,
  zones: { polygon?: { lat: number; lng: number }[] | null }[],
): boolean {
  const fenced = zones.filter((z) => Array.isArray(z.polygon) && z.polygon.length >= 3);
  if (fenced.length === 0) return true;
  return fenced.some((z) => isPointInPolygon(point, z.polygon as { lat: number; lng: number }[]));
}
