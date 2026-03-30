import { formatPesosFull } from "@/lib/formatters";

interface AmountDisplayProps {
  amount: number;
  type?: "INCOME" | "EXPENSE" | "neutral";
  size?: "sm" | "md" | "lg" | "xl";
  showSign?: boolean;
}

const sizeMap = {
  sm: "text-sm font-medium",
  md: "text-base font-semibold",
  lg: "text-xl font-bold",
  xl: "text-3xl font-extrabold",
};

export default function AmountDisplay({ amount, type = "neutral", size = "md", showSign = false }: AmountDisplayProps) {
  const color =
    type === "INCOME" ? "#2ECC71" :
    type === "EXPENSE" ? "#FF4D6D" :
    "#FFFFFF";

  const sign = showSign ? (type === "EXPENSE" ? "- " : type === "INCOME" ? "+ " : "") : "";

  return (
    <span className={sizeMap[size]} style={{ color }}>
      {sign}{formatPesosFull(amount)}
    </span>
  );
}
