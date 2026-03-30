"use client";
import { useState, useMemo } from "react";
import { useSyncData } from "@/hooks/useSyncData";
import { formatPesosFull } from "@/lib/formatters";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { TransactionDto, CategoryDto } from "@/types";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sunday
}

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

export default function CalendarPage() {
  const { data } = useSyncData();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const transactions = data?.transactions || [];
  const categories = data?.categories || [];
  const categoryMap = useMemo(() => {
    const m = new Map<string, CategoryDto>();
    categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [categories]);

  // Group transactions by day
  const txByDay = useMemo(() => {
    const map = new Map<number, TransactionDto[]>();
    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(tx);
      }
    });
    return map;
  }, [transactions, year, month]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const selectedTxs = selectedDay ? (txByDay.get(selectedDay) || []) : [];

  // Monthly totals
  const monthIncome = Array.from(txByDay.values()).flat().filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const monthExpense = Array.from(txByDay.values()).flat().filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Month summary chips */}
      <div className="flex gap-3">
        <div className="flex-1 glass-card rounded-xl p-4">
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.28)" }}>Ingresos del mes</p>
          <p className="text-lg font-bold" style={{ color: "#2ECC71" }}>{formatPesosFull(monthIncome)}</p>
        </div>
        <div className="flex-1 glass-card rounded-xl p-4">
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.28)" }}>Gastos del mes</p>
          <p className="text-lg font-bold" style={{ color: "#FF4D6D" }}>{formatPesosFull(monthExpense)}</p>
        </div>
      </div>

      {/* Calendar card */}
      <div className="glass-card-elevated rounded-2xl p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft size={18} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: "#2ECC71" }} />
            <h2 className="text-text-primary font-semibold">{MONTHS[month]} {year}</h2>
          </div>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronRight size={18} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium py-1" style={{ color: "rgba(255,255,255,0.28)" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const txs = txByDay.get(day) || [];
            const hasIncome = txs.some(t => t.type === "INCOME");
            const hasExpense = txs.some(t => t.type === "EXPENSE");
            const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className="relative flex flex-col items-center justify-center rounded-xl py-2 transition-all duration-150"
                style={{
                  background: isSelected ? "rgba(46,204,113,0.15)" : isToday ? "rgba(255,255,255,0.06)" : "transparent",
                  border: isSelected ? "1px solid rgba(46,204,113,0.4)" : isToday ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                  minHeight: "44px",
                }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: isSelected ? "#2ECC71" : isToday ? "#fff" : "rgba(255,255,255,0.75)" }}
                >
                  {day}
                </span>
                {txs.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {hasIncome && <div className="w-1 h-1 rounded-full" style={{ background: "#2ECC71" }} />}
                    {hasExpense && <div className="w-1 h-1 rounded-full" style={{ background: "#FF4D6D" }} />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day transactions */}
      {selectedDay && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-text-primary font-semibold mb-4">
            {selectedDay} de {MONTHS[month]}
            <span className="ml-2 text-sm font-normal" style={{ color: "rgba(255,255,255,0.4)" }}>
              {selectedTxs.length} movimiento{selectedTxs.length !== 1 ? "s" : ""}
            </span>
          </h3>
          {selectedTxs.length === 0 ? (
            <p className="text-center text-sm py-4" style={{ color: "rgba(255,255,255,0.28)" }}>Sin movimientos</p>
          ) : (
            <div className="space-y-3">
              {selectedTxs.map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                const isIncome = tx.type === "INCOME";
                return (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: cat ? `${cat.colorHex}20` : "rgba(255,255,255,0.06)" }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: cat?.colorHex || "rgba(255,255,255,0.4)" }} />
                      </div>
                      <div>
                        <p className="text-text-primary text-sm font-medium">{cat?.name || "Sin categoría"}</p>
                        {tx.note && <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>{tx.note}</p>}
                      </div>
                    </div>
                    <p className="font-semibold text-sm" style={{ color: isIncome ? "#2ECC71" : "#FF4D6D" }}>
                      {isIncome ? "+" : "-"}{formatPesosFull(tx.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
