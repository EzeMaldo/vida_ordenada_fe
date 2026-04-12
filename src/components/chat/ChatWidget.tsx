"use client";

import { useRef, useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente financiero de Vida Ordenada 💚\n¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post<{ content: string }>("/chat", {
        messages: next,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ocurrió un error de conexión. Intentá de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* ── Burbuja flotante ─────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg border border-green-500/40 bg-gradient-to-br from-[#1a3a22] to-[#0f2018] hover:scale-105 transition-transform"
        aria-label="Asistente financiero"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* ── Panel de chat ────────────────────────────────────────── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-2xl border border-white/10 bg-[#0a1810] shadow-2xl overflow-hidden"
          style={{ maxHeight: "520px" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0d2018]">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg border border-green-500/30 bg-green-900/30">
              🤖
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">
                Asistente Financiero
              </p>
              <p className="text-xs text-green-400 mt-0.5">Vida Ordenada IA</p>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm border border-green-500/25 bg-green-900/20 mt-0.5">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-green-500/80 text-[#001a0a] rounded-tr-sm font-medium"
                      : "bg-[#0f2018] border border-white/8 text-white rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm border border-green-500/25 bg-green-900/20">
                  🤖
                </div>
                <div className="bg-[#0f2018] border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3 flex gap-2 items-end bg-[#0a1810]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Preguntá algo..."
              rows={1}
              className="flex-1 resize-none bg-[#0d1e12] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 leading-relaxed"
              style={{ maxHeight: "96px", overflowY: "auto" }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-sm transition-colors disabled:opacity-30 bg-green-500 hover:bg-green-400 disabled:bg-[#1a2a1a] text-[#001a0a] font-bold"
              aria-label="Enviar"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
