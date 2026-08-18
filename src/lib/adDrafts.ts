import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFTS_KEY = 'kairo_ad_drafts';

export type AdDraft = {
  id: string;
  savedAt: string;
  businessName: string;
  businessAddress: string;
  socialLink?: string;
  whatsappNumber?: string;
  bannerUri?: string;
  bannerBase64?: string;
  bannerType?: 'image' | 'video';
};

async function readAll(): Promise<AdDraft[]> {
  try {
    const raw = await AsyncStorage.getItem(DRAFTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(drafts: AdDraft[]): Promise<void> {
  await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export async function listDrafts(): Promise<AdDraft[]> {
  const drafts = await readAll();
  return drafts.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function getDraft(id: string): Promise<AdDraft | undefined> {
  const drafts = await readAll();
  return drafts.find((d) => d.id === id);
}

export async function saveDraft(draft: Omit<AdDraft, 'id' | 'savedAt'> & { id?: string }): Promise<AdDraft> {
  const drafts = await readAll();
  const id = draft.id || `draft_${Date.now()}`;
  const next: AdDraft = { ...draft, id, savedAt: new Date().toISOString() };
  const filtered = drafts.filter((d) => d.id !== id);
  await writeAll([next, ...filtered]);
  return next;
}

export async function deleteDraft(id: string): Promise<void> {
  const drafts = await readAll();
  await writeAll(drafts.filter((d) => d.id !== id));
}
