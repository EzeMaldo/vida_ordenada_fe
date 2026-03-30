"use client";
import { useState } from "react";
import { Trophy, CheckCircle, Circle, Plus, X } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  emoji: string;
  description: string;
  completed: boolean;
  isCustom: boolean;
}

const PRESETS: Challenge[] = [
  { id: "1", title: "Sin delivery por 7 días", emoji: "🥗", description: "Cociná en casa todos los días de la semana", completed: false, isCustom: false },
  { id: "2", title: "Semana sin cafetería", emoji: "☕", description: "Preparate el café en casa por 7 días", completed: false, isCustom: false },
  { id: "3", title: "Día sin gastos", emoji: "🚫", description: "Pasá un día completo sin gastar ni un peso", completed: false, isCustom: false },
  { id: "4", title: "Ahorrá el 10% del sueldo", emoji: "💰", description: "Destiná el 10% de tus ingresos al ahorro este mes", completed: false, isCustom: false },
  { id: "5", title: "Revisá tus suscripciones", emoji: "📋", description: "Cancelá al menos 1 suscripción que no usás", completed: false, isCustom: false },
  { id: "6", title: "Mes sin compras impulsivas", emoji: "🛒", description: "30 días sin compras no planificadas", completed: false, isCustom: false },
];

const STORAGE_KEY = "vo_challenges";

function loadChallenges(): Challenge[] {
  if (typeof window === "undefined") return PRESETS;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : PRESETS;
}

function saveChallenges(challenges: Challenge[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>(() => loadChallenges());
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newEmoji, setNewEmoji] = useState("🎯");
  const [newDesc, setNewDesc] = useState("");

  const update = (updated: Challenge[]) => {
    setChallenges(updated);
    saveChallenges(updated);
  };

  const toggle = (id: string) => {
    update(challenges.map((c) => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const remove = (id: string) => {
    update(challenges.filter((c) => c.id !== id));
  };

  const addCustom = () => {
    if (!newTitle.trim()) return;
    const newChallenge: Challenge = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      emoji: newEmoji || "🎯",
      description: newDesc.trim(),
      completed: false,
      isCustom: true,
    };
    update([...challenges, newChallenge]);
    setNewTitle("");
    setNewEmoji("🎯");
    setNewDesc("");
    setShowAdd(false);
  };

  const completed = challenges.filter((c) => c.completed);
  const pending = challenges.filter((c) => !c.completed);

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

        {/* Progress bar */}
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

      {/* Add custom challenge */}
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
              <button
                onClick={addCustom}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "#00B050", color: "#fff" }}
              >
                Agregar
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2.5 rounded-xl text-sm transition-all hover:bg-white/5"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending challenges */}
      {pending.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.28)" }}>
            Pendientes ({pending.length})
          </p>
          <div className="space-y-3">
            {pending.map((c) => (
              <div key={c.id} className="glass-card rounded-2xl p-4 flex items-start gap-3">
                <button onClick={() => toggle(c.id)} className="mt-0.5 flex-shrink-0">
                  <Circle size={20} style={{ color: "rgba(255,255,255,0.3)" }} />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{c.emoji}</span>
                    <p className="text-text-primary text-sm font-semibold">{c.title}</p>
                  </div>
                  {c.description && (
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>{c.description}</p>
                  )}
                </div>
                {c.isCustom && (
                  <button onClick={() => remove(c.id)} className="flex-shrink-0 hover:opacity-70 transition-opacity">
                    <X size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed challenges */}
      {completed.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.28)" }}>
            Completados ({completed.length})
          </p>
          <div className="space-y-3">
            {completed.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: "rgba(46,204,113,0.06)", border: "1px solid rgba(46,204,113,0.15)" }}
              >
                <button onClick={() => toggle(c.id)} className="mt-0.5 flex-shrink-0">
                  <CheckCircle size={20} style={{ color: "#2ECC71" }} />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{c.emoji}</span>
                    <p className="text-sm font-semibold line-through" style={{ color: "rgba(255,255,255,0.4)" }}>{c.title}</p>
                  </div>
                  {c.description && (
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{c.description}</p>
                  )}
                </div>
                {c.isCustom && (
                  <button onClick={() => remove(c.id)} className="flex-shrink-0 hover:opacity-70 transition-opacity">
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
        </div>
      )}
    </div>
  );
}
