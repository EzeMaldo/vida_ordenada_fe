"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getUser, isLoggedIn, clearTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AuthCtx {
  user: { userId: string; name: string } | null;
  logout: () => void;
  refresh: () => void;
}

const Ctx = createContext<AuthCtx>({ user: null, logout: () => {}, refresh: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ userId: string; name: string } | null>(null);
  const router = useRouter();

  const refresh = () => setUser(getUser());

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
    } else {
      setUser(getUser());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    clearTokens();
    setUser(null);
    router.replace("/login");
  };

  return <Ctx.Provider value={{ user, logout, refresh }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
