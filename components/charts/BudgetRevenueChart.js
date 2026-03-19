"use client";

import { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";

import { getBudgetRevenue } from "@/services/api";

export default function BudgetRevenueChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const movies = await getBudgetRevenue();
      setData(movies);
    };

    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card px-4 py-3 rounded-xl border border-border/50 shadow-lg text-sm">
          <p className="font-medium text-foreground mb-1">{payload[0].payload.title}</p>
          <p className="text-muted-foreground">Budget: ${payload[0].payload.budget.toLocaleString()}</p>
          <p className="text-muted-foreground">Revenue: ${payload[0].payload.revenue.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 40 }}>
          <CartesianGrid stroke="#f1f5f9" strokeDasharray="none" vertical={false} />
          
          <XAxis 
            type="number" 
            dataKey="budget" 
            name="Budget"
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 400 }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
            tickFormatter={(value) => `$${(value / 1e6).toFixed(0)}M`}
            domain={['auto', 'auto']}
            padding={{ left: 10, right: 10 }}
            label={{ value: 'Budget (millions)', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 11, fontWeight: 500 }}
          />
          
          <YAxis 
            type="number" 
            dataKey="revenue" 
            name="Revenue"
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 400 }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
            tickFormatter={(value) => `$${(value / 1e6).toFixed(0)}M`}
            domain={['auto', 'auto']}
            padding={{ top: 10, bottom: 10 }}
            label={{ value: 'Revenue (millions)', angle: -90, position: 'left', offset: 10, fill: '#64748b', fontSize: 11, fontWeight: 500 }}
          />
          
          <ZAxis range={[50, 400]} />
          
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          
          <Scatter 
            data={data} 
            fill="#ec4899" 
            fillOpacity={0.7}
            stroke="transparent"
            shape="circle"
            hover={{ fill: '#ec4899', fillOpacity: 1 }}
            animationDuration={400}
            animationEasing="ease-out"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}