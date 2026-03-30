"use client";
import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useSyncData } from "@/hooks/useSyncData";
import { formatDate } from "@/lib/formatters";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transacciones",
  "/accounts": "Cuentas",
  "/savings": "Ahorros",
  "/fixed": "Gastos Fijos",
  "/categories": "Categorías",
  "/reports": "Reportes",
  "/calendar": "Calendario",
  "/challenges": "Retos",
  "/settings": "Configuración",
};

export default function TopBar() {
  const pathname = usePathname();
  const { syncing, lastSync, sync } = useSyncData();

  const title = pageTitles[pathname] || "Vida Ordenada";
  const syncLabel = lastSync > 0
    ? `Última sync: ${formatDate(lastSync)}`
    : "Sin sincronizar";

  return (
    <header
      className="h-14 flex items-center justify-between px-6 flex-shrink-0"
      style={{ background: "#040808", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <h1 className="text-text-primary font-semibold text-base">{title}</h1>

      <div className="flex items-center gap-3">
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>{syncLabel}</span>
        <button
          onClick={sync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 disabled:opacity-50"
          style={{ background: "rgba(46,204,113,0.12)", border: "1px solid rgba(46,204,113,0.2)", color: "#2ECC71" }}
        >
          <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Sincronizando..." : "Sincronizar"}
        </button>
      </div>
    </header>
  );
}
