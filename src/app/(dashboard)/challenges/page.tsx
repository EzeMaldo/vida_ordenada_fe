"use client";
import { useState } from "react";
import { Trophy, CheckCircle, Circle, Plus, X } from "lucide-react";
import { useSyncData } from "@/hooks/useSyncData";
import { pushSync } from "@/lib/api";
import { ChallengeDto } from "@/types";

export default function ChallengesPage() {
  const { data, sync } = useSyncData();
  const challenges: ChallengeDto[] = data?.challenges || [];

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newEmoji, setNewEmoji] = useState("🎯");
  const [newDesc, setNewDesc] = useState("");

  const completed = challenges.filter((c) => c.isCompleted);
  const pending   = challenges.filter((c) => !c.isCompleted);

  const toggle = async (c: ChallengeDto) => {
    await pushSync([{
      operation: "UPDATE",
      entityType: "challenge",
      clientId: Date.now(),
      serverId: c.id,
      payload: JSON.stringify({ title: c.title, emoji: c.emoji, description: c.description, isCompleted: !c.isCompleted, isCustom: c.isCustom }),
    }]);
    await sync();
  };

  const remove = async (c: ChallengeDto) => {
    await pushSync([{
      operation: "DELETE",
      entityType: "challenge",
      clientId: Date.now(),
      serverId: c.id,
      payload: "{}",
    }]);
    await sync();
  };

  const addCustom = async () => {
    if (!newTitle.trim()) return;
    await pushSync([{
      operation: "INSERT",
      entityType: "challenge",
      clientId: Date.now(),
      payload: JSON.stringify({
        title: newTitle.trim(),
        emoji: newEmoji || "🎯",
        description: newDesc.trim(),
        isCompleted: false,
        isCustom: true,
      }),
    }]);
    setNewTitle(""); setNewEmoji("🎯"); setNewDesc(""); setShowAdd(false);
    await sync();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Summary */}
      <div className="glass-card-elevated rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,214,10,0.12)" }}>
              <Trophy size={20} style={{ color: "#FFD60A" }} />
            </div>
            <div>
              <p className="text-text-primary font-semibold">Retos Financieros</p>
              <p className="text-text-muted text-xs">{completed.length}/{challenges.length} completados</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: "rgba(46,204,113,0.12)", color: "#2ECC71", border: "1px solid rgba(46,204,113,0.2)" }}
          >
            <Plus size={14} />
            Nuevo
          </button>
        </div>

        <div className="mt-4">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${challenges.length > 0 ? Math.round((completed.length / challenges.length) * 100) : 0}%`,
                background: "#FFD60A",
              }}
            />
          </div>
          <p className="text-xs mt-1 text-right" style={{ color: "#FFD60A" }}>
            {challenges.length > 0 ? Math.round((completed.length / challenges.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {showAdd && (
        <div className="glass-card-elevated rounded-2xl p-5">
          <h3 className="text-text-primary font-semibold mb-4">Nuevo reto personalizado</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-16 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-center text-text-primary text-lg focus:outline-none focus:border-green-primary/50"
                maxLength={2}
              />
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-green-primary/50 text-sm"
                placeholder="Nombre del reto"
              />
            </div>
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-green-primary/50 text-sm"
              placeholder="Descripción (opcional)"
            />
            <div className="flex gap-2">
              <button onClick={addCustom} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "#00B050", color: "#fff" }}>
                Agregar
              </button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-xl text-sm hover:bg-white/5" style={{ color: "rgba(255,255,255,0.55)" }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.28)" }}>
            Pendientes ({pending.length})
          </p>
          <div className="space-y-3">
            {pending.map((c) => (
              <div key={c.id} className="glass-card rounded-2xl p-4 flex items-start gap-3">
                <button onClick={() => toggle(c)} className="mt-0.5 flex-shrink-0">
                  <Circle size={20} style={{ color: "rgba(255,255,255,0.3)" }} />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{c.emoji}</span>
                    <p className="text-text-primary text-sm font-semibold">{c.title}</p>
                  </div>
                  {c.description && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>{c.description}</p>}
                </div>
                {c.isCustom && (
                  <button onClick={() => remove(c)} className="flex-shrink-0 hover:opacity-70">
                    <X size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.28)" }}>
            Completados ({completed.length})
          </p>
          <div className="space-y-3">
            {completed.map((c) => (
              <div key={c.id} className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(46,204,113,0.06)", border: "1px solid rgba(46,204,113,0.15)" }}>
                <button onClick={() => toggle(c)} className="mt-0.5 flex-shrink-0">
                  <CheckCircle size={20} style={{ color: "#2ECC71" }} />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{c.emoji}</span>
                    <p className="text-sm font-semibold line-through" style={{ color: "rgba(255,255,255,0.4)" }}>{c.title}</p>
                  </div>
                  {c.description && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{c.description}</p>}
                </div>
                {c.isCustom && (
                  <button onClick={() => remove(c)} className="flex-shrink-0 hover:opacity-70">
                    <X size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {challenges.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Trophy size={32} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
          <p className="text-text-muted text-sm">Sin retos</p>
          <p className="text-text-muted text-xs mt-1">Los retos se sincronizan con tu cuenta</p>
        </div>
      )}
    </div>
  );
}
