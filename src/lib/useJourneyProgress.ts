'use client';

import { useEffect, useState } from 'react';
import { emptyJourneyProgress, type JourneyProgress } from './learning-journey';
import { JOURNEY_PROGRESS_EVENT, journeyStorageKey, readJourneyProgress } from './learning-journey-storage';

export function useJourneyProgress(userId: string | undefined) {
  const [snapshot, setSnapshot] = useState<{
    owner: string | undefined; progress: JourneyProgress; warning: string | null;
  }>({ owner: undefined, progress: emptyJourneyProgress(), warning: null });
  useEffect(() => {
    const refresh = () => setSnapshot({
      owner: userId,
      ...(userId ? readJourneyProgress(userId) : { progress: emptyJourneyProgress(), warning: null }),
    });
    const onStorage = (event: StorageEvent) => {
      if (userId && (event.key === null || event.key === journeyStorageKey(userId))) refresh();
    };
    const onUpdate = (event: Event) => {
      if ((event as CustomEvent<string>).detail === userId) refresh();
    };
    refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener(JOURNEY_PROGRESS_EVENT, onUpdate);
    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(JOURNEY_PROGRESS_EVENT, onUpdate);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('pageshow', refresh);
    };
  }, [userId]);
  return snapshot.owner === userId
    ? { progress: snapshot.progress, warning: snapshot.warning, loading: false }
    : { progress: emptyJourneyProgress(), warning: null, loading: true };
}
