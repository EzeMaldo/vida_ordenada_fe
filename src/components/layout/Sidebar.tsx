"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  Home,
  ArrowUpDown,
  Wallet,
  Target,
  RefreshCcw,
  Tag,
  BarChart2,
  Calendar,
  Trophy,
  Settings,
  LogOut,
  PieChart,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/transactions", label: "Transacciones", icon: ArrowUpDown },
  { href: "/accounts", label: "Cuentas", icon: Wallet },
  { href: "/reports", label: "Presupuesto", icon: PieChart },
  { href: "/savings", label: "Ahorros", icon: Target },
  { href: "/fixed", label: "Fijos", icon: RefreshCcw },
  { href: "/categories", label: "Categorías", icon: Tag },
  { href: "/reports", label: "Reportes", icon: BarChart2 },
  { href: "/calendar", label: "Calendario", icon: Calendar },
  { href: "/challenges", label: "Retos", icon: Trophy },
];

const navItemsUnique = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/transactions", label: "Transacciones", icon: ArrowUpDown },
  { href: "/accounts", label: "Cuentas", icon: Wallet },
  { href: "/savings", label: "Ahorros", icon: Target },
  { href: "/fixed", label: "Fijos", icon: RefreshCcw },
  { href: "/categories", label: "Categorías", icon: Tag },
  { href: "/reports", label: "Reportes", icon: BarChart2 },
  { href: "/calendar", label: "Calendario", icon: Calendar },
  { href: "/challenges", label: "Retos", icon: Trophy },
  { href: "/settings", label: "Configuración", icon: Settings },
];

// suppress unused warning
void navItems;

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className="w-60 h-screen flex flex-col flex-shrink-0"
      style={{ background: "#040808", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <div className="p-5 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: "#0D2415", border: "1px solid rgba(46,204,113,0.3)" }}
        >
          💚
        </div>
        <div>
          <p className="text-text-primary font-bold text-sm leading-tight">Vida Ordenada</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>Finanzas personales</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItemsUnique.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href + label}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group"
              style={{
                background: isActive ? "rgba(46,204,113,0.12)" : "transparent",
                border: isActive ? "1px solid rgba(46,204,113,0.2)" : "1px solid transparent",
              }}
            >
              <Icon
                size={18}
                style={{ color: isActive ? "#2ECC71" : "rgba(255,255,255,0.45)" }}
                className="flex-shrink-0 transition-colors"
              />
              <span
                className="text-sm font-medium transition-colors"
                style={{ color: isActive ? "#2ECC71" : "rgba(255,255,255,0.65)" }}
              >
                {label}
              </span>
              {isActive && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: "#2ECC71" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "#0D2415", color: "#2ECC71" }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-sm font-medium truncate">{user?.name || "Usuario"}</p>
            <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.28)" }}>Mi cuenta</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 hover:bg-white/5"
        >
          <LogOut size={16} style={{ color: "rgba(255,77,109,0.8)" }} />
          <span className="text-sm" style={{ color: "rgba(255,77,109,0.8)" }}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
