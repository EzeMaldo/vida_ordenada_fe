"use client";
import { useSyncData } from "@/hooks/useSyncData";
import { formatPesosFull, formatDate } from "@/lib/formatters";
import { TransactionDto, AccountDto, CategoryDto } from "@/types";
import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";

function getMonthBounds(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).getTime();
  return { start, end };
}

function calcAccountBalance(account: AccountDto, transactions: TransactionDto[]): number {
  const txns = transactions.filter((t) => t.accountId === account.id);
  const delta = txns.reduce((acc, t) => {
    return acc + (t.type === "INCOME" ? t.amount : -t.amount);
  }, 0);
  return account.initialBalance + delta;
}

export default function DashboardPage() {
  const { data } = useSyncData();

  const now = new Date();
  const { start, end } = getMonthBounds(now);

  const transactions = data?.transactions || [];
  const accounts = data?.accounts || [];
  const categories = data?.categories || [];
  const savingsGoals = data?.savingsGoals || [];

  const monthTxns = transactions.filter((t) => t.date >= start && t.date <= end);
  const income = monthTxns.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expense = monthTxns.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;

  const netWorth = accounts.reduce((sum, acc) => sum + calcAccountBalance(acc, transactions), 0);

  const recentTxns = [...transactions]
    .sort((a, b) => b.date - a.date)
    .slice(0, 10);

  const catMap = new Map<string, CategoryDto>(categories.map((c) => [c.id, c]));

  const monthLabel = now.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Net Worth */}
      <div className="glass-card-elevated rounded-2xl p-6 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(46,204,113,0.06)", transform: "translate(30%, -30%)" }}
        />
        <p className="text-text-secondary text-sm font-medium mb-2">Patrimonio Neto</p>
        <p className="text-5xl font-extrabold mb-1" style={{ color: netWorth >= 0 ? "#2ECC71" : "#FF4D6D" }}>
          {formatPesosFull(Math.abs(netWorth))}
        </p>
        <p className="text-text-muted text-xs">Total en {accounts.length} cuenta{accounts.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Month Summary */}
      <div>
        <p className="text-text-secondary text-sm font-medium mb-3">{capitalizedMonth}</p>
        <div className="grid grid-cols-3 gap-4">
          {/* Income */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(46,204,113,0.12)" }}>
                <TrendingUp size={16} style={{ color: "#2ECC71" }} />
              </div>
              <span className="text-text-secondary text-xs font-medium">Ingresos</span>
            </div>
            <p className="text-xl font-bold" style={{ color: "#2ECC71" }}>{formatPesosFull(income)}</p>
          </div>

          {/* Expense */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,77,109,0.12)" }}>
                <TrendingDown size={16} style={{ color: "#FF4D6D" }} />
              </div>
              <span className="text-text-secondary text-xs font-medium">Gastos</span>
            </div>
            <p className="text-xl font-bold" style={{ color: "#FF4D6D" }}>{formatPesosFull(expense)}</p>
          </div>

          {/* Savings rate */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(72,202,228,0.10)" }}>
                <Target size={16} style={{ color: "#48CAE4" }} />
              </div>
              <span className="text-text-secondary text-xs font-medium">Ahorro</span>
            </div>
            <p className="text-xl font-bold" style={{ color: savingsRate >= 0 ? "#48CAE4" : "#FF4D6D" }}>{savingsRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="glass-card rounded-2xl p-5">
          <p className="text-text-primary font-semibold text-sm mb-4">Últimas transacciones</p>
          {recentTxns.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">Sin transacciones</p>
          ) : (
            <div className="space-y-2">
              {recentTxns.map((t) => {
                const cat = catMap.get(t.categoryId);
                return (
                  <div key={t.id} className="flex items-center gap-3 py-1.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                      style={{ background: cat ? `${cat.colorHex}20` : "rgba(255,255,255,0.08)", border: `1px solid ${cat ? cat.colorHex + "40" : "rgba(255,255,255,0.1)"}` }}
                    >
                      <span style={{ color: cat?.colorHex || "#fff", fontSize: "10px", fontWeight: 600 }}>
                        {cat?.name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-xs font-medium truncate">{cat?.name || "Sin categoría"}</p>
                      <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.28)" }}>{formatDate(t.date)}</p>
                    </div>
                    <span className="text-xs font-semibold flex-shrink-0" style={{ color: t.type === "INCOME" ? "#2ECC71" : "#FF4D6D" }}>
                      {t.type === "INCOME" ? "+" : "-"}{formatPesosFull(t.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Accounts + Savings */}
        <div className="space-y-4">
          {/* Accounts */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={16} style={{ color: "#2ECC71" }} />
              <p className="text-text-primary font-semibold text-sm">Cuentas</p>
            </div>
            {accounts.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">Sin cuentas</p>
            ) : (
              <div className="space-y-2">
                {accounts.slice(0, 4).map((acc) => {
                  const bal = calcAccountBalance(acc, transactions);
                  return (
                    <div key={acc.id} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-text-primary text-xs font-medium">{acc.name}</p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>{acc.accountType}</p>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: bal >= 0 ? "#2ECC71" : "#FF4D6D" }}>
                        {formatPesosFull(bal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Savings Goals */}
          {savingsGoals.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <p className="text-text-primary font-semibold text-sm mb-4">Metas de ahorro</p>
              <div className="space-y-3">
                {savingsGoals.slice(0, 3).map((goal) => {
                  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100)) : 0;
                  const barColor = pct < 30 ? "#FF4D6D" : pct < 70 ? "#FFD60A" : "#2ECC71";
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-text-primary">{goal.emoji} {goal.name}</span>
                        <span className="text-xs" style={{ color: barColor }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
