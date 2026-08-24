export const JABATAN_TARGET_STORAGE_KEY = 'siapskk-target-jabatan';

export function getSavedJabatanTarget(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(JABATAN_TARGET_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveJabatanTarget(jabatanId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(JABATAN_TARGET_STORAGE_KEY, jabatanId);
    return true;
  } catch {
    return false;
  }
}