import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ChartConvergencia({ historia }) {
  if (!historia) return null;

  const { mejor = [], promedio = [] } = historia;
  const data = (mejor || []).map((v, i) => ({
    gen: i + 1,
    mejor: v,
    promedio: promedio?.[i] ?? null,
  }));

  if (!data.length) return <p>No hay datos de convergencia aún.</p>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="5 5" />
        <XAxis dataKey="gen" label={{ value: "Generación", position: "insideBottom", offset: -4 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="mejor" stroke="#1d4ed8" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="promedio" stroke="#16a34a" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
