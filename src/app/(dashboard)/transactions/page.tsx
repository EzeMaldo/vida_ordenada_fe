"use client";
import { useState, useMemo } from "react";
import { useSyncData } from "@/hooks/useSyncData";
import { formatPesosFull, formatDate } from "@/lib/formatters";
import { pushSync } from "@/lib/api";
import { CategoryDto, AccountDto } from "@/types";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

function getMonthBounds(year: number, month: number) {
  const start = new Date(year, month, 1).getTime();
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
  return { start, end };
}

export default function TransactionsPage() {
  const { data, sync } = useSyncData();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [showModal, setShowModal] = useState(false);

  const transactions = data?.transactions || [];
  const categories = data?.categories || [];
  const accounts = data?.accounts || [];

  const catMap = new Map<string, CategoryDto>(categories.map((c) => [c.id, c]));
  const accMap = new Map<string, AccountDto>(accounts.map((a) => [a.id, a]));

  const { start, end } = getMonthBounds(year, month);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => t.date >= start && t.date <= end)
      .filter((t) => typeFilter === "ALL" || t.type === typeFilter)
      .sort((a, b) => b.date - a.date);
  }, [transactions, start, end, typeFilter]);

  const income = filtered.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const monthLabel = new Date(year, month, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <ChevronLeft size={18} style={{ color: "rgba(255,255,255,0.55)" }} />
          </button>
          <span className="text-text-primary font-semibold text-sm capitalize min-w-36 text-center">{monthLabel}</span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <ChevronRight size={18} style={{ color: "rgba(255,255,255,0.55)" }} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["ALL", "INCOME", "EXPENSE"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: typeFilter === f ? (f === "INCOME" ? "rgba(46,204,113,0.2)" : f === "EXPENSE" ? "rgba(255,77,109,0.2)" : "rgba(255,255,255,0.1)") : "transparent",
                  color: typeFilter === f ? (f === "INCOME" ? "#2ECC71" : f === "EXPENSE" ? "#FF4D6D" : "#fff") : "rgba(255,255,255,0.45)",
                }}
              >
                {f === "ALL" ? "Todos" : f === "INCOME" ? "Ingresos" : "Gastos"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: "rgba(46,204,113,0.15)", border: "1px solid rgba(46,204,113,0.3)", color: "#2ECC71" }}
          >
            <Plus size={14} />
            Nueva
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Ingresos</p>
          <p className="text-sm font-bold" style={{ color: "#2ECC71" }}>{formatPesosFull(income)}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Gastos</p>
          <p className="text-sm font-bold" style={{ color: "#FF4D6D" }}>{formatPesosFull(expense)}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Balance</p>
          <p className="text-sm font-bold" style={{ color: income - expense >= 0 ? "#2ECC71" : "#FF4D6D" }}>
            {formatPesosFull(Math.abs(income - expense))}
          </p>
        </div>
      </div>

      {/* Transaction list */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-text-muted text-sm">Sin transacciones este mes</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {filtered.map((t) => {
              const cat = catMap.get(t.categoryId);
              const acc = accMap.get(t.accountId);
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: cat?.colorHex || (t.type === "INCOME" ? "#2ECC71" : "#FF4D6D") }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-medium truncate">{cat?.name || "Sin categoría"}</p>
                    <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.28)" }}>
                      {acc?.name || "Cuenta"} · {formatDate(t.date)}
                    </p>
                    {t.note && <p className="text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{t.note}</p>}
                  </div>
                  <span className="text-sm font-semibold flex-shrink-0" style={{ color: t.type === "INCOME" ? "#2ECC71" : "#FF4D6D" }}>
                    {t.type === "INCOME" ? "+" : "-"}{formatPesosFull(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-text-muted text-xs text-center">{filtered.length} transacciones</p>

      {showModal && (
        <AddTransactionModal
          categories={categories}
          accounts={accounts}
          onClose={() => setShowModal(false)}
          onSaved={async () => {
            setShowModal(false);
            await sync();
          }}
        />
      )}
    </div>
  );
}

// ── Modal para agregar transacción ────────────────────────────────────────────

function AddTransactionModal({
  categories,
  accounts,
  onClose,
  onSaved,
}: {
  categories: CategoryDto[];
  accounts: AccountDto[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredCats = categories.filter((c) => c.type === type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!amount || isNaN(amountCents) || amountCents <= 0) { setError("Ingresá un monto válido"); return; }
    if (!categoryId) { setError("Seleccioná una categoría"); return; }
    if (!accountId) { setError("Seleccioná una cuenta"); return; }

    const payload = JSON.stringify({
      accountId,
      categoryId,
      type,
      amount: amountCents,
      date: new Date(date).getTime(),
      ...(note.trim() && { note: note.trim() }),
    });

    console.log("[VidaSync] AddTransaction — payload:", payload);
    setSaving(true);
    try {
      const results = await pushSync([{
        operation: "INSERT",
        entityType: "transaction",
        clientId: Date.now(),
        payload,
      }]);
      console.log("[VidaSync] AddTransaction — resultado:", results);
      onSaved();
    } catch (err) {
      console.error("[VidaSync] AddTransaction — error:", err);
      setError("Error al guardar. Revisá la consola.");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-5"
        style={{ background: "#0a1410", border: "1px solid rgba(46,204,113,0.2)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-text-primary font-semibold text-base">Nueva transacción</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X size={18} style={{ color: "rgba(255,255,255,0.45)" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div className="flex gap-2 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["EXPENSE", "INCOME"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setCategoryId(""); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: type === t ? (t === "INCOME" ? "rgba(46,204,113,0.2)" : "rgba(255,77,109,0.2)") : "transparent",
                  color: type === t ? (t === "INCOME" ? "#2ECC71" : "#FF4D6D") : "rgba(255,255,255,0.45)",
                }}
              >
                {t === "INCOME" ? "Ingreso" : "Gasto"}
              </button>
            ))}
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Monto ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Categoría</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle}>
              <option value="">Seleccionar...</option>
              {filteredCats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Cuenta */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Cuenta</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={inputStyle}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ ...inputStyle, colorScheme: "dark" }}
            />
          </div>

          {/* Nota opcional */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Nota (opcional)</label>
            <input
              type="text"
              placeholder="Descripción..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={inputStyle}
            />
          </div>

          {error && <p className="text-xs" style={{ color: "#FF4D6D" }}>{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            style={{ background: "rgba(46,204,113,0.2)", border: "1px solid rgba(46,204,113,0.35)", color: "#2ECC71" }}
          >
            {saving ? "Guardando..." : "Guardar transacción"}
          </button>
        </form>
      </div>
    </div>
  );
}
