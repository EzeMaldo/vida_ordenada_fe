import { pullSync } from "./api";
import { SyncData } from "@/types";

const SYNC_KEY = "vo_sync_data";
const LAST_SYNC_KEY = "vo_last_sync";

export function getSyncData(): SyncData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SYNC_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getLastSync(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(LAST_SYNC_KEY) || "0");
}

export async function doSync(): Promise<SyncData> {
  const since = getLastSync();
  const response = await pullSync(since);

  // Merge with existing data
  const existing = getSyncData();

  const merged: SyncData = {
    accounts: mergeById(existing?.accounts || [], response.accounts),
    categories: mergeById(existing?.categories || [], response.categories),
    transactions: mergeById(existing?.transactions || [], response.transactions),
    savingsGoals: mergeById(existing?.savingsGoals || [], response.savingsGoals),
    fixedExpenses: mergeById(existing?.fixedExpenses || [], response.fixedExpenses),
    lastSync: response.serverTime,
  };

  localStorage.setItem(SYNC_KEY, JSON.stringify(merged));
  localStorage.setItem(LAST_SYNC_KEY, String(response.serverTime));
  return merged;
}

function mergeById<T extends { id: string; updatedAt: number; deletedAt?: number }>(
  existing: T[], incoming: T[]
): T[] {
  const map = new Map<string, T>(existing.map((i) => [i.id, i]));
  for (const item of incoming) {
    const ex = map.get(item.id);
    if (!ex || item.updatedAt > ex.updatedAt) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values()).filter((i) => !i.deletedAt);
}
