"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, loginWithGoogle } from "@/lib/api";
import { saveTokens } from "@/lib/auth";
import { doSync } from "@/lib/sync";
import { Eye, EyeOff } from "lucide-react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: () => void;
          renderButton: (el: HTMLElement, config: object) => void;
        };
      };
    };
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const tokens = await register(email, password, name);
      saveTokens(tokens);
      await doSync();
      router.replace("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    setLoading(true);
    setError("");
    try {
      const tokens = await loginWithGoogle(response.credential);
      saveTokens(tokens);
      await doSync();
      router.replace("/dashboard");
    } catch {
      setError("Error al registrarse con Google");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const initGoogle = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });
      window.google?.accounts.id.renderButton(el, {
        theme: "outline",
        size: "large",
        width: el.offsetWidth || 320,
        text: "signup_with",
        locale: "es",
      });
    };
    document.head.appendChild(script);
  }, [handleGoogleResponse]);

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "#fff",
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "rgba(46,204,113,0.05)" }} />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo + Samu */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 text-5xl select-none"
            style={{ background: "#0D2415", border: "1px solid rgba(46,204,113,0.3)" }}>
            🐸
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Vida Ordenada</h1>
          <p className="text-text-secondary text-sm mt-1">Creá tu cuenta gratis</p>
        </div>

        <div className="glass-card-elevated rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5 uppercase tracking-wider">Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                style={inputStyle} placeholder="Tu nombre" required />
            </div>

            {/* Email */}
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                style={inputStyle} placeholder="tu@email.com" required />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none transition-all"
                  style={inputStyle} placeholder="Mínimo 8 caracteres" required minLength={8} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3" style={{ background: "#26100F", border: "1px solid rgba(255,77,109,0.3)" }}>
                <p className="text-red-primary text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full text-white font-semibold rounded-xl py-3.5 transition-all duration-200 text-sm disabled:opacity-50"
              style={{ background: "#00B050", boxShadow: "0 0 20px rgba(46,204,113,0.3)" }}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>o</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Google Sign-In */}
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
            <div ref={initGoogle} className="w-full flex justify-center" />
          ) : (
            <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              Google Sign-In no configurado
            </p>
          )}
        </div>

        <p className="text-center text-text-muted text-sm mt-6">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-green-primary hover:text-green-bright font-medium transition-colors">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
