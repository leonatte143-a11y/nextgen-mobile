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
