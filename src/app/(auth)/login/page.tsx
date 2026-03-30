"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";
import { saveTokens } from "@/lib/auth";
import { doSync } from "@/lib/sync";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const tokens = await login(email, password);
      saveTokens(tokens);
      await doSync();
      router.replace("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(46,204,113,0.05)" }} />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "#0D2415", border: "1px solid rgba(46,204,113,0.3)" }}>
            <span className="text-2xl">💚</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Vida Ordenada</h1>
          <p className="text-text-secondary text-sm mt-1">Iniciá sesión en tu cuenta</p>
        </div>

        {/* Card */}
        <div className="glass-card-elevated rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "#fff",
                }}
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5 uppercase tracking-wider">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "#fff",
                }}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3" style={{ background: "#26100F", border: "1px solid rgba(255,77,109,0.3)" }}>
                <p className="text-red-primary text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold rounded-xl py-3.5 transition-all duration-200 text-sm disabled:opacity-50"
              style={{ background: "#00B050", boxShadow: "0 0 20px rgba(46,204,113,0.3)" }}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="text-center text-text-muted text-sm mt-6">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-green-primary hover:text-green-bright font-medium transition-colors">
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  );
}
