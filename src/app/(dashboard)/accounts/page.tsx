"use client";
import { useSyncData } from "@/hooks/useSyncData";
import { formatPesosFull } from "@/lib/formatters";
import { TransactionDto, AccountDto } from "@/types";
import { Wallet, Building2, TrendingUp, CreditCard } from "lucide-react";

function calcBalance(account: AccountDto, transactions: TransactionDto[]): number {
  const txns = transactions.filter((t) => t.accountId === account.id);
  const delta = txns.reduce((acc, t) => acc + (t.type === "INCOME" ? t.amount : -t.amount), 0);
  return account.initialBalance + delta;
}

const typeConfig: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  CASH: { label: "Efectivo", icon: <Wallet size={20} />, bg: "rgba(46,204,113,0.12)", color: "#2ECC71" },
  BANK: { label: "Banco", icon: <Building2 size={20} />, bg: "rgba(72,202,228,0.10)", color: "#48CAE4" },
  INVESTMENT: { label: "Inversión", icon: <TrendingUp size={20} />, bg: "rgba(255,214,10,0.10)", color: "#FFD60A" },
  CREDIT: { label: "Crédito", icon: <CreditCard size={20} />, bg: "rgba(255,77,109,0.12)", color: "#FF4D6D" },
};

export default function AccountsPage() {
  const { data } = useSyncData();

  const accounts = data?.accounts || [];
  const transactions = data?.transactions || [];

  const totalBalance = accounts.reduce((sum, acc) => sum + calcBalance(acc, transactions), 0);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Total */}
      <div className="glass-card-elevated rounded-2xl p-6">
        <p className="text-text-secondary text-sm mb-2">Balance Total</p>
        <p className="text-4xl font-extrabold" style={{ color: totalBalance >= 0 ? "#2ECC71" : "#FF4D6D" }}>
          {formatPesosFull(Math.abs(totalBalance))}
        </p>
        <p className="text-text-muted text-xs mt-1">{accounts.length} cuenta{accounts.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Account cards */}
      {accounts.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Wallet size={32} style={{ color: "rgba(255,255,255,0.2)" }} className="mx-auto mb-3" />
          <p className="text-text-muted text-sm">Sin cuentas registradas</p>
          <p className="text-text-muted text-xs mt-1">Sincronizá para ver tus cuentas</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {accounts.map((acc) => {
            const bal = calcBalance(acc, transactions);
            const cfg = typeConfig[acc.accountType] || typeConfig.CASH;
            const txCount = transactions.filter((t) => t.accountId === acc.id).length;
            return (
              <div key={acc.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.icon}
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p className="text-text-primary font-semibold text-sm mb-1">{acc.name}</p>
                <p className="text-2xl font-extrabold mb-2" style={{ color: bal >= 0 ? "#2ECC71" : "#FF4D6D" }}>
                  {formatPesosFull(Math.abs(bal))}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>{acc.currency}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>{txCount} mov.</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
