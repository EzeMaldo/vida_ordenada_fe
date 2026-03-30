"use client";
import { useState, useEffect, useCallback } from "react";
import { getSyncData, doSync, getLastSync } from "@/lib/sync";
import { SyncData } from "@/types";

export function useSyncData() {
  const [data, setData] = useState<SyncData | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number>(0);

  const load = useCallback(() => {
    const d = getSyncData();
    setData(d);
    setLastSync(getLastSync());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await doSync();
      setData(result);
      setLastSync(result.lastSync);
    } finally {
      setSyncing(false);
    }
  }, []);

  return { data, syncing, lastSync, sync, reload: load };
}
