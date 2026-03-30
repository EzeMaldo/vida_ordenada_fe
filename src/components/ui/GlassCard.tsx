import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className = "", elevated = false, onClick }: GlassCardProps) {
  const base = elevated ? "glass-card-elevated" : "glass-card";
  return (
    <div
      className={`${base} rounded-2xl ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
