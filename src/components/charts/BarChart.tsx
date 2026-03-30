"use client";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatPesos } from "@/lib/formatters";

interface DataPoint {
  label: string;
  income?: number;
  expense?: number;
  value?: number;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl p-3 text-xs">
        <p className="text-text-secondary mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="font-semibold" style={{ color: p.color }}>
            {p.name}: {formatPesos(p.value * 100)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BarChart({ data, height = 200 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="label"
          tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatPesos(v * 100)}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        {data[0]?.income !== undefined && (
          <Bar dataKey="income" name="Ingresos" fill="#2ECC71" radius={[4, 4, 0, 0]} />
        )}
        {data[0]?.expense !== undefined && (
          <Bar dataKey="expense" name="Gastos" fill="#FF4D6D" radius={[4, 4, 0, 0]} />
        )}
        {data[0]?.value !== undefined && (
          <Bar dataKey="value" name="Valor" fill="#48CAE4" radius={[4, 4, 0, 0]} />
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
