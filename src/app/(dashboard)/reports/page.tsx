"use client";
import { useMemo } from "react";
import { useSyncData } from "@/hooks/useSyncData";
import { formatPesosFull } from "@/lib/formatters";
import { TransactionDto, CategoryDto } from "@/types";
import { BarChart2 } from "lucide-react";

interface MonthSummary {
  label: string;
  income: number;
  expense: number;
}

function getMonthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string): string {
  const [y, m] = key.split("-");
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
}

export default function ReportsPage() {
  const { data } = useSyncData();
  const transactions: TransactionDto[] = data?.transactions || [];
  const categories: CategoryDto[] = data?.categories || [];

  const catMap = new Map<string, CategoryDto>(categories.map((c) => [c.id, c]));

  // Last 6 months summary
  const monthSummaries = useMemo((): MonthSummary[] => {
    const now = new Date();
    const months: MonthSummary[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = getMonthKey(d.getTime());
      const label = getMonthLabel(key);
      const start = d.getTime();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
      const month = transactions.filter((t) => t.date >= start && t.date <= end);
      months.push({
        label,
        income: month.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0),
        expense: month.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0),
      });
    }
    return months;
  }, [transactions]);

  const currentMonth = monthSummaries[monthSummaries.length - 1];
  const net = currentMonth.income - currentMonth.expense;
  const savingsRate = currentMonth.income > 0 ? Math.round((net / currentMonth.income) * 100) : 0;

  // All-time totals
  const allTimeIncome = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const allTimeExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  // Top 5 expense categories (current month)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();
  const monthExpenses = transactions.filter((t) => t.type === "EXPENSE" && t.date >= monthStart && t.date <= monthEnd);
  const expByCategory = monthExpenses.reduce<Record<string, number>>((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {});
  const topCategories = Object.entries(expByCategory)
    .map(([id, amount]) => ({ id, amount, cat: catMap.get(id) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  const maxCatAmount = topCategories[0]?.amount || 1;

  const maxBar = Math.max(...monthSummaries.map((m) => Math.max(m.income, m.expense)), 1);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* This month */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Ingresos (mes)</p>
          <p className="text-lg font-bold" style={{ color: "#2ECC71" }}>{formatPesosFull(currentMonth.income)}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Gastos (mes)</p>
          <p className="text-lg font-bold" style={{ color: "#FF4D6D" }}>{formatPesosFull(currentMonth.expense)}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Tasa de ahorro</p>
          <p className="text-lg font-bold" style={{ color: savingsRate >= 0 ? "#48CAE4" : "#FF4D6D" }}>{savingsRate}%</p>
        </div>
      </div>

      {/* Last 6 months bar chart */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 size={16} style={{ color: "#2ECC71" }} />
          <p className="text-text-primary font-semibold text-sm">Últimos 6 meses</p>
        </div>
        {/* Legend */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#2ECC71" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Ingresos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#FF4D6D" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Gastos</span>
          </div>
        </div>
        {/* Bars */}
        <div className="flex items-end gap-3 h-36">
          {monthSummaries.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end" style={{ height: "120px" }}>
                <div
                  className="flex-1 rounded-t-sm transition-all duration-500"
                  style={{
                    background: "#2ECC71",
                    height: `${(m.income / maxBar) * 100}%`,
                    minHeight: m.income > 0 ? "3px" : "0",
                    opacity: 0.85,
                  }}
                />
                <div
                  className="flex-1 rounded-t-sm transition-all duration-500"
                  style={{
                    background: "#FF4D6D",
                    height: `${(m.expense / maxBar) * 100}%`,
                    minHeight: m.expense > 0 ? "3px" : "0",
                    opacity: 0.85,
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top expense categories */}
      {topCategories.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <p className="text-text-primary font-semibold text-sm mb-4">Top gastos del mes</p>
          <div className="space-y-3">
            {topCategories.map(({ id, amount, cat }) => (
              <div key={id}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: cat?.colorHex || "#FF4D6D" }}
                    />
                    <span className="text-sm text-text-primary">{cat?.name || "Sin categoría"}</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "#FF4D6D" }}>
                    {formatPesosFull(amount)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(amount / maxCatAmount) * 100}%`,
                      background: cat?.colorHex || "#FF4D6D",
                      opacity: 0.8,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All time */}
      <div className="glass-card rounded-2xl p-5">
        <p className="text-text-primary font-semibold text-sm mb-4">Totales históricos</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Ingresos totales</p>
            <p className="text-base font-bold" style={{ color: "#2ECC71" }}>{formatPesosFull(allTimeIncome)}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Gastos totales</p>
            <p className="text-base font-bold" style={{ color: "#FF4D6D" }}>{formatPesosFull(allTimeExpense)}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Balance neto</p>
            <p className="text-base font-bold" style={{ color: allTimeIncome - allTimeExpense >= 0 ? "#2ECC71" : "#FF4D6D" }}>
              {formatPesosFull(Math.abs(allTimeIncome - allTimeExpense))}
            </p>
          </div>
        </div>
        <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.28)" }}>
          Basado en {transactions.length} transacciones
        </p>
      </div>
    </div>
  );
}
