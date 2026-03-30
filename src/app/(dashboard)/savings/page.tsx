"use client";
import { useSyncData } from "@/hooks/useSyncData";
import { formatPesosFull } from "@/lib/formatters";
import { Target } from "lucide-react";

function progressColor(pct: number): string {
  if (pct < 30) return "#FF4D6D";
  if (pct < 70) return "#FFD60A";
  return "#2ECC71";
}

export default function SavingsPage() {
  const { data } = useSyncData();
  const goals = data?.savingsGoals || [];

  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Summary */}
      <div className="glass-card-elevated rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(46,204,113,0.12)" }}>
            <Target size={20} style={{ color: "#2ECC71" }} />
          </div>
          <div>
            <p className="text-text-primary font-semibold">Metas de Ahorro</p>
            <p className="text-text-muted text-xs">{goals.length} meta{goals.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-text-secondary text-xs mb-1">Ahorrado total</p>
            <p className="text-2xl font-extrabold" style={{ color: "#2ECC71" }}>{formatPesosFull(totalSaved)}</p>
          </div>
          <div className="text-right">
            <p className="text-text-secondary text-xs mb-1">Objetivo total</p>
            <p className="text-lg font-bold text-text-primary">{formatPesosFull(totalTarget)}</p>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${overallPct}%`, background: progressColor(overallPct) }}
          />
        </div>
        <p className="text-xs mt-2 text-right" style={{ color: progressColor(overallPct) }}>{overallPct}% del total</p>
      </div>

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Target size={32} style={{ color: "rgba(255,255,255,0.2)" }} className="mx-auto mb-3" />
          <p className="text-text-muted text-sm">Sin metas de ahorro</p>
          <p className="text-text-muted text-xs mt-1">Sincronizá para ver tus metas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100)) : 0;
            const color = progressColor(pct);
            const remaining = goal.targetAmount - goal.savedAmount;

            return (
              <div key={goal.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <p className="text-text-primary font-semibold">{goal.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>
                        Faltan {formatPesosFull(Math.max(0, remaining))}
                      </p>
                    </div>
                  </div>
                  <div
                    className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: `${color}20`, color }}
                  >
                    {pct}%
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>Ahorrado</p>
                    <p className="text-sm font-bold" style={{ color }}>{formatPesosFull(goal.savedAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>Objetivo</p>
                    <p className="text-sm font-bold text-text-primary">{formatPesosFull(goal.targetAmount)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
