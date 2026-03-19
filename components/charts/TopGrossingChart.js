"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getTopGrossing } from "@/services/api";

export default function TopGrossingChart() {
  const [data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const movies = await getTopGrossing();
      setData(movies);
    };

    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card px-4 py-3 rounded-xl border border-border/50 shadow-lg text-sm">
          <p className="font-medium text-foreground mb-1">{payload[0].payload.title}</p>
          <p className="text-muted-foreground">Revenue: ${payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (value) => {
    if (value.length > 12) {
      return value.substring(0, 10) + '…';
    }
    return value;
  };

  return (
    <div className="w-full h-full min-h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <XAxis 
            dataKey="title" 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 400 }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={70}
            tickFormatter={formatXAxis}
          />
          
          <YAxis 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 400 }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
            tickFormatter={(value) => `$${(value / 1e6).toFixed(0)}M`}
            label={{ value: 'Revenue (millions)', angle: -90, position: 'left', offset: 15, fill: '#64748b', fontSize: 11, fontWeight: 500 }}
          />
          
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: '#f8fafc' }}
          />
          
          <Bar 
            dataKey="revenue" 
            radius={[6, 6, 0, 0]} 
            barSize={36}
            animationDuration={400}
            animationEasing="ease-out"
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {data.map((entry, index) => (
              <defs key={`gradient-${index}`}>
                <linearGradient id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={index === activeIndex ? 1 : 0.9} />
                  <stop offset="100%" stopColor="#6d28d9" stopOpacity={index === activeIndex ? 1 : 0.8} />
                </linearGradient>
              </defs>
            ))}
            {data.map((entry, index) => (
              <rect
                key={`bar-${index}`}
                fill={`url(#barGradient-${index})`}
                className="transition-all duration-200"
                style={{
                  filter: index === activeIndex ? 'brightness(1.05)' : 'none'
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}