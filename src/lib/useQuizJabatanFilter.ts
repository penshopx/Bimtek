'use client';

import { useEffect, useState } from 'react';

export function useQuizJabatanFilter(userId: string | undefined, hasJabatan: boolean) {
  const [preference, setPreference] = useState<{ userId: string; active: boolean } | null>(null);
  const storageKey = userId ? `quiz-jabatan-filter:${userId}` : null;

  useEffect(() => {
    if (!userId || !storageKey || !hasJabatan) {
      setPreference(null);
      return;
    }
    let active = false;
    try {
      active = localStorage.getItem(storageKey) === 'true';
    } catch (error) {
      console.warn('Tidak dapat membaca preferensi filter jabatan.', error);
    }
    setPreference({ userId, active });
  }, [userId, storageKey, hasJabatan]);

  // Never expose the previous account's preference while auth is changing.
  const active = Boolean(hasJabatan && userId && preference?.userId === userId && preference.active);

  const setActive = (nextActive: boolean) => {
    if (!userId || !storageKey || !hasJabatan) return;
    setPreference({ userId, active: nextActive });
    // Only save explicit changes, so hydration cannot overwrite a stored preference.
    try {
      localStorage.setItem(storageKey, String(nextActive));
    } catch (error) {
      console.warn('Tidak dapat menyimpan preferensi filter jabatan.', error);
    }
  };

  return [active, setActive] as const;
}
