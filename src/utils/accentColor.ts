/** Distinct light background tints shared across sub-icon grids, Popular Services,
 * Top Rated cards, and the EXO card — keyed by a stable id so the same conceptual
 * service always gets the same color regardless of list position/reordering. */
export const SUB_ICON_TINTS = ['#FFF3E0', '#E3F2FD', '#E8F5E9', '#FCE4EC', '#F3E5F5', '#FFFDE7', '#E0F7FA', '#EFEBE9'];

export function getAccentTint(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % SUB_ICON_TINTS.length;
  return SUB_ICON_TINTS[index];
}
