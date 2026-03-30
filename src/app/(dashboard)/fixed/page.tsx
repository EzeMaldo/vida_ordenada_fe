"use client";
import { useSyncData } from "@/hooks/useSyncData";
import { formatPesosFull } from "@/lib/formatters";
import { FixedExpenseDto } from "@/types";
import { RefreshCcw, CheckCircle2, Clock } from "lucide-react";

export default function FixedPage() {
  const { data } = useSyncData();
  const items: FixedExpenseDto[] = data?.fixedExpenses || [];

  const incomeItems = items.filter((i) => i.recurringType === "INCOME");
  const expenseItems = items.filter((i) => i.recurringType === "EXPENSE");

  const totalIncome = incomeItems.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenseItems.reduce((s, i) => s + i.amount, 0);
  const paidExpense = expenseItems.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Ingresos fijos</p>
          <p className="text-lg font-bold" style={{ color: "#2ECC71" }}>{formatPesosFull(totalIncome)}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Gastos fijos</p>
          <p className="text-lg font-bold" style={{ color: "#FF4D6D" }}>{formatPesosFull(totalExpense)}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Pagado</p>
          <p className="text-lg font-bold" style={{ color: "#48CAE4" }}>
            {totalExpense > 0 ? Math.round((paidExpense / totalExpense) * 100) : 0}%
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <RefreshCcw size={32} style={{ color: "rgba(255,255,255,0.2)" }} className="mx-auto mb-3" />
          <p className="text-text-muted text-sm">Sin gastos fijos</p>
          <p className="text-text-muted text-xs mt-1">Sincronizá para ver tus gastos fijos</p>
        </div>
      ) : (
        <>
          {/* Income fixed */}
          {incomeItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: "#2ECC71" }} />
                <p className="text-sm font-semibold text-text-primary">Ingresos Recurrentes</p>
                <span className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.28)" }}>
                  {formatPesosFull(totalIncome)} / mes
                </span>
              </div>
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {incomeItems.map((item) => (
                    <FixedItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Expense fixed */}
          {expenseItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: "#FF4D6D" }} />
                <p className="text-sm font-semibold text-text-primary">Gastos Recurrentes</p>
                <span className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.28)" }}>
                  {formatPesosFull(totalExpense)} / mes
                </span>
              </div>
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {expenseItems.map((item) => (
                    <FixedItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FixedItem({ item }: { item: FixedExpenseDto }) {
  const isIncome = item.recurringType === "INCOME";
  const isPaid = item.status === "PAID";

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
      <span className="text-xl flex-shrink-0">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {isPaid ? (
            <CheckCircle2 size={11} style={{ color: "#2ECC71" }} />
          ) : (
            <Clock size={11} style={{ color: "#FFD60A" }} />
          )}
          <span className="text-xs" style={{ color: isPaid ? "#2ECC71" : "#FFD60A" }}>
            {isPaid ? "Pagado" : "Pendiente"}
          </span>
        </div>
      </div>
      <span className="text-sm font-semibold flex-shrink-0" style={{ color: isIncome ? "#2ECC71" : "#FF4D6D" }}>
        {isIncome ? "+" : "-"}{formatPesosFull(item.amount)}
      </span>
    </div>
  );
}
