import en from './locales/en.json';
import te from './locales/te.json';

export type Lang = 'en' | 'te' | 'hi';

type Dict = Record<keyof typeof en, { en: string; te: string }>;

const dict: Dict = Object.keys(en).reduce((acc, key) => {
  const k = key as keyof typeof en;
  acc[k] = { en: en[k], te: te[k] ?? en[k] };
  return acc;
}, {} as Dict);

export function t(lang: Lang, key: keyof typeof dict): string {
  const row = dict[key];
  if (!row) return key;
  if (lang === 'hi') return row.en;
  return row[lang] ?? row.en;
}
