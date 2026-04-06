"use client";
// Re-exporta el contexto compartido para que los componentes no cambien su import
export { useSyncContext as useSyncData } from "@/providers/SyncProvider";
