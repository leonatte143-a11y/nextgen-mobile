/** Normalize Indian mobile numbers for tel: links (avoids duplicate country-code dialer bugs). */
export function formatTelUrl(raw: string | undefined | null): string | null {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10) return `tel:+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `tel:+${digits}`;
  if (digits.length > 10) return `tel:+${digits}`;
  return null;
}

export function displayPhone(raw: string | undefined | null): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits}`;
  return raw || '';
}
