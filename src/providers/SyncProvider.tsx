"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getSyncData, doSync, getLastSync } from "@/lib/sync";
import { SyncData } from "@/types";

interface SyncContextValue {
  data: SyncData | null;
  syncing: boolean;
  lastSync: number;
  sync: () => Promise<void>;
  reload: () => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SyncData | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(0);
  const didSync = useRef(false);

  const reload = useCallback(() => {
    const d = getSyncData();
    setData(d);
    setLastSync(getLastSync());
  }, []);

  const sync = useCallback(async () => {
    if (syncing) return;
    console.log("[VidaSync] sync() disparado");
    setSyncing(true);
    try {
      const result = await doSync();
      setData(result);
      setLastSync(result.lastSync);
      console.log("[VidaSync] sync() ✓ UI actualizada");
    } catch (err) {
      console.error("[VidaSync] sync() falló", err);
    } finally {
      setSyncing(false);
    }
  }, [syncing]);

  // Auto-sync una sola vez al montar el provider (layout del dashboard)
  useEffect(() => {
    reload();
    if (!didSync.current) {
      didSync.current = true;
      sync();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SyncContext.Provider value={{ data, syncing, lastSync, sync, reload }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSyncContext debe usarse dentro de SyncProvider");
  return ctx;
}
