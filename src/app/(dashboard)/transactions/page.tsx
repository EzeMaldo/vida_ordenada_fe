"use client";
import { useState, useMemo } from "react";
import { useSyncData } from "@/hooks/useSyncData";
import { formatPesosFull, formatDate } from "@/lib/formatters";
import { CategoryDto, AccountDto } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getMonthBounds(year: number, month: number) {
  const start = new Date(year, month, 1).getTime();
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
  return { start, end };
}

export default function TransactionsPage() {
  const { data } = useSyncData();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

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
                  {/* Color dot */}
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: cat?.colorHex || (t.type === "INCOME" ? "#2ECC71" : "#FF4D6D") }}
                  />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-medium truncate">{cat?.name || "Sin categoría"}</p>
                    <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.28)" }}>
                      {acc?.name || "Cuenta"} · {formatDate(t.date)}
                    </p>
                    {t.note && <p className="text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{t.note}</p>}
                  </div>
                  {/* Amount */}
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
    </div>
  );
}
