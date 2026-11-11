'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { emptyJourneyProgress, type JourneyProgress } from './learning-journey';
import {
  JOURNEY_PROGRESS_EVENT,
  hasJourneyActivity,
  journeyProgressEqual,
  journeyStorageKey,
  mergeJourneyProgress,
  readJourneyProgress,
  writeJourneyProgress,
} from './learning-journey-storage';
import { readAccountJourneyProgress, writeAccountJourneyProgress } from './learning-journey-account';

export type JourneySyncState = 'ready' | 'needs-confirmation' | 'error';
type SaveResult = { ok: boolean; error: string | null };
type Snapshot = {
  owner: string | undefined;
  progress: JourneyProgress;
  warning: string | null;
  syncState: JourneySyncState;
  syncError: string | null;
  syncNotice: string | null;
  loading: boolean;
  syncing: boolean;
};

function accountSyncError(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Progres akun belum tersinkron. Data browser tetap tersedia; coba lagi.';
}

export function useJourneyProgress(userId: string | undefined) {
  const [snapshot, setSnapshot] = useState<Snapshot>({
    owner: undefined,
    progress: emptyJourneyProgress(),
    warning: null,
    syncState: 'ready',
    syncError: null,
    syncNotice: null,
    loading: Boolean(userId),
    syncing: false,
  });
  const userRef = useRef(userId);
  const refreshSequence = useRef(0);
  const syncQueue = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    userRef.current = userId;
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) {
      setSnapshot({
        owner: undefined, progress: emptyJourneyProgress(), warning: null,
        syncState: 'ready', syncError: null, syncNotice: null, loading: false, syncing: false,
      });
      return;
    }

    const sequence = ++refreshSequence.current;
    const local = readJourneyProgress(userId);
    setSnapshot(previous => ({
      owner: userId,
      progress: previous.owner === userId ? previous.progress : local.progress,
      warning: local.warning,
      syncState: previous.owner === userId ? previous.syncState : 'ready',
      syncError: previous.owner === userId ? previous.syncError : null,
      syncNotice: previous.owner === userId ? previous.syncNotice : null,
      loading: true,
      syncing: previous.owner === userId ? previous.syncing : false,
    }));

    try {
      const remote = await readAccountJourneyProgress();
      if (refreshSequence.current !== sequence || userRef.current !== userId) return;

      const latestLocal = readJourneyProgress(userId);
      const merged = mergeJourneyProgress(latestLocal.progress, remote.progress);
      const needsConfirmation = !remote.hasServerProgress
        ? hasJourneyActivity(latestLocal.progress)
        : !journeyProgressEqual(merged, remote.progress);
      let warning = latestLocal.warning;
      if (!warning && (remote.hasServerProgress || !needsConfirmation)) {
        const localWrite = writeJourneyProgress(userId, merged);
        if (!localWrite.ok) warning = localWrite.error;
      }
      const syncState: JourneySyncState = warning
        ? 'error'
        : needsConfirmation ? 'needs-confirmation' : 'ready';
      setSnapshot({
        owner: userId,
        progress: merged,
        warning,
        syncState,
        syncError: warning ? 'Progres browser tidak dapat diperbarui dengan aman.' : null,
        syncNotice: !warning && remote.hasServerProgress && !needsConfirmation
          ? 'Progres akun tersinkron dan dapat dibuka lintas browser.'
          : null,
        loading: false,
        syncing: false,
      });
    } catch (error) {
      if (refreshSequence.current !== sequence || userRef.current !== userId) return;
      setSnapshot({
        owner: userId,
        progress: local.progress,
        warning: local.warning,
        syncState: 'error',
        syncError: accountSyncError(error),
        syncNotice: null,
        loading: false,
        syncing: false,
      });
    }
  }, [userId]);

  const syncNow = useCallback(async (): Promise<SaveResult> => {
    if (!userId) return { ok: false, error: 'Masuk terlebih dahulu untuk menyinkronkan progres.' };
    const local = readJourneyProgress(userId);
    if (local.warning) {
      setSnapshot(previous => ({ ...previous, warning: local.warning, syncState: 'error' }));
      return { ok: false, error: local.warning };
    }
    ++refreshSequence.current;
    setSnapshot(previous => ({ ...previous, syncing: true, syncError: null, syncNotice: null }));
    const operation = syncQueue.current.then(async () => {
      const result = await writeAccountJourneyProgress(local.progress);
      const merged = mergeJourneyProgress(local.progress, result.progress);
      const localWrite = writeJourneyProgress(userId, merged);
      if (!localWrite.ok) throw new Error(localWrite.error ?? 'Salinan browser belum diperbarui.');
      setSnapshot({
        owner: userId, progress: merged, warning: null,
        syncState: journeyProgressEqual(merged, result.progress) ? 'ready' : 'needs-confirmation',
        syncError: null, syncNotice: 'Progres berhasil disimpan ke akun dan dapat dibuka lintas browser.',
        loading: false, syncing: false,
      });
      return { ok: true, error: null };
    });
    syncQueue.current = operation.catch(() => undefined);
    try {
      return await operation;
    } catch (error) {
      const message = accountSyncError(error);
      setSnapshot(previous => ({
        ...previous, owner: userId, syncState: 'error', syncError: message,
        syncNotice: null, syncing: false,
      }));
      return { ok: false, error: message };
    }
  }, [userId]);

  const syncAfterLocalChange = useCallback(async (progress: JourneyProgress): Promise<SaveResult> => {
    if (!userId) return { ok: false, error: 'Masuk terlebih dahulu untuk mencatat progres.' };
    setSnapshot(previous => ({
      ...previous, owner: userId, progress, warning: null, syncNotice: null,
    }));
    if (snapshot.loading) {
      return {
        ok: false,
        error: 'Progres akun masih dimuat. Catatan tersimpan di browser; buka ulang alur untuk menyinkronkan.',
      };
    }
    if (snapshot.syncState === 'needs-confirmation') return { ok: true, error: null };
    if (snapshot.syncState === 'error') {
      return {
        ok: false,
        error: snapshot.syncError ?? 'Progres browser tersimpan, tetapi belum tersinkron ke akun.',
      };
    }

    ++refreshSequence.current;
    setSnapshot(previous => ({ ...previous, syncing: true, syncError: null, syncNotice: null }));
    const operation = syncQueue.current.then(async () => {
      const result = await writeAccountJourneyProgress(progress);
      const latestLocal = readJourneyProgress(userId);
      const merged = mergeJourneyProgress(
        result.progress,
        latestLocal.warning ? progress : latestLocal.progress,
      );
      const localWrite = writeJourneyProgress(userId, merged);
      if (!localWrite.ok) throw new Error(localWrite.error ?? 'Salinan browser belum diperbarui.');
      const needsConfirmation = !journeyProgressEqual(merged, result.progress);
      setSnapshot({
        owner: userId, progress: merged, warning: null,
        syncState: needsConfirmation ? 'needs-confirmation' : 'ready',
        syncError: null, syncNotice: 'Progres berhasil disimpan ke akun dan dapat dibuka lintas browser.',
        loading: false, syncing: false,
      });
      return { ok: true, error: null };
    });
    syncQueue.current = operation.catch(() => undefined);
    try {
      return await operation;
    } catch (error) {
      const message = accountSyncError(error);
      setSnapshot(previous => ({
        ...previous, owner: userId, progress, syncState: 'error', syncError: message,
        syncNotice: null, syncing: false,
      }));
      return { ok: false, error: message };
    }
  }, [snapshot.loading, snapshot.syncError, snapshot.syncState, userId]);

  useEffect(() => {
    let active = true;
    const runRefresh = () => {
      if (active) void refresh();
    };
    const onUpdate = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== userId || !userId) return;
      const local = readJourneyProgress(userId);
      setSnapshot(previous => ({
        ...previous, owner: userId, progress: local.progress, warning: local.warning,
      }));
    };
    const onStorage = (event: StorageEvent) => {
      if (userId && (event.key === null || event.key === journeyStorageKey(userId))) runRefresh();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') runRefresh();
    };
    runRefresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener(JOURNEY_PROGRESS_EVENT, onUpdate);
    window.addEventListener('focus', runRefresh);
    window.addEventListener('pageshow', runRefresh);
    document.addEventListener('visibilitychange', onVisibility);
    const interval = userId ? window.setInterval(() => {
      if (document.visibilityState === 'visible') runRefresh();
    }, 30_000) : undefined;
    return () => {
      active = false;
      if (interval !== undefined) window.clearInterval(interval);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(JOURNEY_PROGRESS_EVENT, onUpdate);
      window.removeEventListener('focus', runRefresh);
      window.removeEventListener('pageshow', runRefresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refresh, userId]);

  if (snapshot.owner !== userId) {
    return {
      progress: emptyJourneyProgress(), warning: null, loading: true,
      syncState: 'ready' as const, syncError: null, syncing: false,
      syncNotice: null,
      syncNow, syncAfterLocalChange,
    };
  }
  return {
    progress: snapshot.progress,
    warning: snapshot.warning,
    loading: snapshot.loading,
    syncState: snapshot.syncState,
    syncError: snapshot.syncError,
    syncNotice: snapshot.syncNotice,
    syncing: snapshot.syncing,
    syncNow,
    syncAfterLocalChange,
  };
}
