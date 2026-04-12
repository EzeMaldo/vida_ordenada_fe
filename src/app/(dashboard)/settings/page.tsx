"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useSyncData } from "@/hooks/useSyncData";
import { generateWppToken } from "@/lib/api";
import { RefreshCcw, LogOut, Clock, Database, ChevronRight, MessageCircle } from "lucide-react";

function formatSyncTime(ts: number): string {
  if (!ts) return "Nunca";
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH}h`;
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data, syncing, lastSync, sync } = useSyncData();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ── WhatsApp token state ──────────────────────────────────────────────────
  const [wppToken, setWppToken]       = useState<string | null>(null);
  const [wppSecsLeft, setWppSecsLeft] = useState(0);
  const [wppLoading, setWppLoading]   = useState(false);
  const [wppError, setWppError]       = useState<string | null>(null);
  const countdownRef                  = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleGenerateToken = async () => {
    setWppLoading(true);
    setWppError(null);
    setWppToken(null);
    try {
      const res      = await generateWppToken();
      const secsLeft = Math.max(0, Math.floor((res.expiresAt - Date.now()) / 1000));
      setWppToken(res.token);
      setWppSecsLeft(secsLeft);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setWppSecsLeft(s => {
          if (s <= 1) {
            clearInterval(countdownRef.current!);
            setWppToken(null);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch {
      setWppError("No se pudo generar el código. Intentá de nuevo.");
    } finally {
      setWppLoading(false);
    }
  };

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  const stats = {
    accounts: data?.accounts.length || 0,
    categories: data?.categories.length || 0,
    transactions: data?.transactions.length || 0,
    savings: data?.savingsGoals.length || 0,
    fixed: data?.fixedExpenses.length || 0,
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* User card */}
      <div className="glass-card-elevated rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: "#0D2415", border: "1px solid rgba(46,204,113,0.3)", color: "#2ECC71" }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-text-primary text-lg font-bold">{user?.name || "Usuario"}</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>ID: {user?.userId?.slice(0, 8) || "—"}...</p>
          </div>
        </div>
      </div>

      {/* WhatsApp Bot section */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.28)" }}>WhatsApp Bot</p>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-start gap-3 mb-4">
            <MessageCircle size={18} style={{ color: "#25D366", marginTop: 2, flexShrink: 0 }} />
            <div>
              <p className="text-text-primary text-sm font-medium">Vincular Samu Bot</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Generá un código y enviáselo al bot de WhatsApp para vincular tu cuenta
              </p>
            </div>
          </div>

          {wppToken ? (
            <div className="text-center space-y-3">
              <p
                className="text-4xl font-bold tracking-[0.3em]"
                style={{ color: "#25D366", fontVariantNumeric: "tabular-nums" }}
              >
                {wppToken}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                Enviá este código al bot de WhatsApp
              </p>
              <span
                className="inline-block px-3 py-1 rounded-lg text-xs font-semibold"
                style={{
                  background: wppSecsLeft > 15 ? "rgba(46,204,113,0.12)" : "rgba(255,77,109,0.12)",
                  color: wppSecsLeft > 15 ? "#2ECC71" : "#FF4D6D"
                }}
              >
                Expira en {wppSecsLeft}s
              </span>
            </div>
          ) : (
            <>
              {wppError && (
                <p className="text-xs mb-3" style={{ color: "#FF4D6D" }}>{wppError}</p>
              )}
              <button
                onClick={handleGenerateToken}
                disabled={wppLoading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: "rgba(37,211,102,0.12)", color: "#25D366", border: "1px solid rgba(37,211,102,0.25)" }}
              >
                {wppLoading ? "Generando..." : "Generar código"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sync section */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.28)" }}>Sincronización</p>
        </div>

        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <Clock size={16} style={{ color: "rgba(255,255,255,0.45)" }} />
            <div>
              <p className="text-text-primary text-sm">Última sincronización</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{formatSyncTime(lastSync)}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <button
            onClick={sync}
            disabled={syncing}
            className="flex items-center gap-3 w-full transition-all"
          >
            <RefreshCcw size={16} className={syncing ? "animate-spin" : ""} style={{ color: "#2ECC71" }} />
            <p className="text-sm font-medium" style={{ color: "#2ECC71" }}>
              {syncing ? "Sincronizando..." : "Sincronizar ahora"}
            </p>
            {!syncing && <ChevronRight size={14} className="ml-auto" style={{ color: "rgba(255,255,255,0.28)" }} />}
          </button>
        </div>
      </div>

      {/* Data stats */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.28)" }}>
            Datos locales
          </p>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {[
            { label: "Transacciones", value: stats.transactions, icon: Database },
            { label: "Cuentas", value: stats.accounts, icon: Database },
            { label: "Categorías", value: stats.categories, icon: Database },
            { label: "Metas de ahorro", value: stats.savings, icon: Database },
            { label: "Gastos fijos", value: stats.fixed, icon: Database },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-3.5 flex items-center justify-between">
              <p className="text-text-secondary text-sm">{label}</p>
              <p className="text-text-primary text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Account section */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.28)" }}>Cuenta</p>
        </div>

        <div className="px-5 py-4">
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-3 w-full transition-all"
            >
              <LogOut size={16} style={{ color: "#FF4D6D" }} />
              <p className="text-sm font-medium" style={{ color: "#FF4D6D" }}>Cerrar sesión</p>
              <ChevronRight size={14} className="ml-auto" style={{ color: "rgba(255,77,109,0.4)" }} />
            </button>
          ) : (
            <div>
              <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
                ¿Seguro que querés cerrar sesión?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={logout}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "rgba(255,77,109,0.15)", color: "#FF4D6D", border: "1px solid rgba(255,77,109,0.3)" }}
                >
                  Cerrar sesión
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)" }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* App info */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#0D2415" }}>
            <span className="text-xs">💚</span>
          </div>
          <span className="text-text-primary text-sm font-semibold">Vida Ordenada</span>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>v1.0.0 · Web App</p>
      </div>
    </div>
  );
}
