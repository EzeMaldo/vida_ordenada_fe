import { pullSync } from "./api";
import { SyncData } from "@/types";

const SYNC_KEY = "vo_sync_data";
const LAST_SYNC_KEY = "vo_last_sync";
const TAG = "[VidaSync]";

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
  console.log(`${TAG} doSync() — lastSync=${since} (${since > 0 ? new Date(since).toLocaleString() : "primera sync"})`);

  let response;
  try {
    response = await pullSync(since);
    console.log(`${TAG} pull OK — accounts=${response.accounts.length} categories=${response.categories.length} transactions=${response.transactions.length} savingsGoals=${response.savingsGoals?.length ?? 0} serverTime=${response.serverTime}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${TAG} pull FALLÓ — ${msg}`, err);
    throw err;
  }

  const existing = getSyncData();
  console.log(`${TAG} caché local — accounts=${existing?.accounts.length ?? 0} categories=${existing?.categories.length ?? 0} transactions=${existing?.transactions.length ?? 0}`);

  const merged: SyncData = {
    accounts: mergeById(existing?.accounts || [], response.accounts),
    categories: mergeById(existing?.categories || [], response.categories),
    transactions: mergeById(existing?.transactions || [], response.transactions),
    savingsGoals: mergeById(existing?.savingsGoals || [], response.savingsGoals),
    fixedExpenses: mergeById(existing?.fixedExpenses || [], response.fixedExpenses),
    challenges: mergeById(existing?.challenges || [], response.challenges || []),
    lastSync: response.serverTime,
  };

  console.log(`${TAG} merge resultado — accounts=${merged.accounts.length} categories=${merged.categories.length} transactions=${merged.transactions.length}`);

  localStorage.setItem(SYNC_KEY, JSON.stringify(merged));
  localStorage.setItem(LAST_SYNC_KEY, String(response.serverTime));
  console.log(`${TAG} doSync() ✓ completado`);
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
