export function formatPesos(amount: number): string {
  const abs = Math.abs(amount);
  // amounts stored as centavos (×100)
  const value = abs / 100;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString("es-AR")}`;
}

export function formatPesosFull(amount: number): string {
  const value = Math.abs(amount) / 100;
  return `$${value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

export function formatMonthYear(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}
