"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatPesos } from "@/lib/formatters";

interface DonutDataPoint {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutDataPoint[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: DonutDataPoint }> }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="glass-card rounded-xl p-3 text-xs">
        <p className="text-text-secondary mb-1">{item.name}</p>
        <p className="font-semibold" style={{ color: item.payload.color }}>
          {formatPesos(item.value * 100)}
        </p>
      </div>
    );
  }
  return null;
};

export default function DonutChart({ data, height = 200, innerRadius = 50, outerRadius = 80 }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
