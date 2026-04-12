"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, loginWithGoogle, forgotPassword, resetPassword } from "@/lib/api";
import { saveTokens } from "@/lib/auth";
import { doSync } from "@/lib/sync";
import { Eye, EyeOff } from "lucide-react";

// ── Google Sign-In via GIS (no package needed) ────────────────────────────────
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

type ForgotStep = "email" | "code";

export default function LoginPage() {
  const router = useRouter();

  // ── Login state ───────────────────────────────────────────────────────────
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // ── Forgot password state ─────────────────────────────────────────────────
  const [showForgot, setShowForgot]         = useState(false);
  const [forgotStep, setForgotStep]         = useState<ForgotStep>("email");
  const [forgotEmail, setForgotEmail]       = useState("");
  const [forgotCode, setForgotCode]         = useState("");
  const [forgotPw, setForgotPw]             = useState("");
  const [forgotLoading, setForgotLoading]   = useState(false);
  const [forgotError, setForgotError]       = useState("");
  const [forgotSuccess, setForgotSuccess]   = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
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

  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    setLoading(true);
    setError("");
    try {
      const tokens = await loginWithGoogle(response.credential);
      saveTokens(tokens);
      await doSync();
      router.replace("/dashboard");
    } catch {
      setError("Error al iniciar sesión con Google");
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
        text: "signin_with",
        locale: "es",
      });
    };
    document.head.appendChild(script);
  }, [handleGoogleResponse]);

  const handleForgotSendCode = async () => {
    if (!forgotEmail) { setForgotError("Ingresá tu email"); return; }
    setForgotLoading(true);
    setForgotError("");
    try {
      await forgotPassword(forgotEmail);
      setForgotStep("code");
    } catch {
      setForgotError("No se pudo enviar el código");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotReset = async () => {
    if (forgotCode.length !== 6) { setForgotError("El código tiene 6 dígitos"); return; }
    if (forgotPw.length < 6)     { setForgotError("Mínimo 6 caracteres"); return; }
    setForgotLoading(true);
    setForgotError("");
    try {
      await resetPassword(forgotEmail, forgotCode, forgotPw);
      setForgotSuccess(true);
    } catch {
      setForgotError("Código inválido o expirado");
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotStep("email");
    setForgotEmail("");
    setForgotCode("");
    setForgotPw("");
    setForgotError("");
    setForgotSuccess(false);
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "#fff",
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      {/* Background glow */}
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
          <p className="text-text-secondary text-sm mt-1">Controlá tu dinero. Sin estrés.</p>
        </div>

        {/* Card */}
        <div className="glass-card-elevated rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                style={inputStyle} placeholder="tu@email.com" required />
            </div>

            {/* Password */}
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none transition-all"
                  style={inputStyle} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Olvidé mi contraseña */}
            <div className="text-right">
              <button type="button" onClick={() => { setForgotEmail(email); setShowForgot(true); }}
                className="text-xs transition-colors hover:opacity-80" style={{ color: "#2ECC71" }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3" style={{ background: "#26100F", border: "1px solid rgba(255,77,109,0.3)" }}>
                <p className="text-red-primary text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full text-white font-semibold rounded-xl py-3.5 transition-all duration-200 text-sm disabled:opacity-50"
              style={{ background: "#00B050", boxShadow: "0 0 20px rgba(46,204,113,0.3)" }}>
              {loading ? "Ingresando..." : "Ingresar"}
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
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-green-primary hover:text-green-bright font-medium transition-colors">
            Registrarse
          </Link>
        </p>
      </div>

      {/* ── Modal: Olvidé mi contraseña ────────────────────────────────────── */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: "#0a1810", border: "1px solid rgba(255,255,255,0.1)" }}>

            {forgotSuccess ? (
              <div className="text-center space-y-4">
                <div className="text-4xl">✅</div>
                <p className="text-text-primary font-semibold">¡Contraseña actualizada!</p>
                <p className="text-text-secondary text-sm">Ya podés ingresar con tu nueva contraseña.</p>
                <button onClick={closeForgot}
                  className="w-full py-3 rounded-xl text-sm font-semibold"
                  style={{ background: "#00B050", color: "#fff" }}>
                  Volver al inicio
                </button>
              </div>
            ) : forgotStep === "email" ? (
              <>
                <h2 className="text-text-primary font-bold text-lg mb-1">Recuperar contraseña</h2>
                <p className="text-text-secondary text-sm mb-5">Te enviamos un código de 6 dígitos a tu email.</p>
                <div className="space-y-4">
                  <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                    style={inputStyle} placeholder="tu@email.com" />
                  {forgotError && <p className="text-sm" style={{ color: "#FF4D6D" }}>{forgotError}</p>}
                  <div className="flex gap-2">
                    <button onClick={closeForgot} className="flex-1 py-3 rounded-xl text-sm"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)" }}>
                      Cancelar
                    </button>
                    <button onClick={handleForgotSendCode} disabled={forgotLoading}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
                      style={{ background: "#00B050", color: "#fff" }}>
                      {forgotLoading ? "Enviando..." : "Enviar código"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-text-primary font-bold text-lg mb-1">Ingresá el código</h2>
                <p className="text-text-secondary text-sm mb-5">Revisá tu email <strong>{forgotEmail}</strong></p>
                <div className="space-y-4">
                  <input type="text" value={forgotCode} onChange={(e) => setForgotCode(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm text-center tracking-[0.3em] font-bold focus:outline-none"
                    style={inputStyle} placeholder="000000" maxLength={6} />
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={forgotPw}
                      onChange={(e) => setForgotPw(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none"
                      style={inputStyle} placeholder="Nueva contraseña" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {forgotError && <p className="text-sm" style={{ color: "#FF4D6D" }}>{forgotError}</p>}
                  <div className="flex gap-2">
                    <button onClick={closeForgot} className="flex-1 py-3 rounded-xl text-sm"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)" }}>
                      Cancelar
                    </button>
                    <button onClick={handleForgotReset} disabled={forgotLoading}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
                      style={{ background: "#00B050", color: "#fff" }}>
                      {forgotLoading ? "Guardando..." : "Actualizar"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
