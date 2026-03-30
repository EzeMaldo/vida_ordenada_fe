interface StatChipProps {
  label: string;
  value: string;
  color?: "green" | "red" | "yellow" | "blue";
}

const colorMap = {
  green: { bg: "rgba(46,204,113,0.12)", border: "rgba(46,204,113,0.25)", text: "#2ECC71" },
  red: { bg: "rgba(255,77,109,0.12)", border: "rgba(255,77,109,0.25)", text: "#FF4D6D" },
  yellow: { bg: "rgba(255,214,10,0.10)", border: "rgba(255,214,10,0.25)", text: "#FFD60A" },
  blue: { bg: "rgba(72,202,228,0.10)", border: "rgba(72,202,228,0.25)", text: "#48CAE4" },
};

export default function StatChip({ label, value, color = "green" }: StatChipProps) {
  const c = colorMap[color];
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
      <span className="text-xs font-bold" style={{ color: c.text }}>{value}</span>
    </div>
  );
}
