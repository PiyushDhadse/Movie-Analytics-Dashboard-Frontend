"use client";

import { useEffect, useState } from "react";
import { getCorrelation } from "@/services/api";
import * as ss from "simple-statistics";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function CorrelationHeatmap() {
  const [correlation, setCorrelation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getCorrelation();

        const budgets = data.map(d => d.budget);
        const revenues = data.map(d => d.revenue);
        const ratings = data.map(d => d.rating);

        const corr = {
          budget_revenue: ss.sampleCorrelation(budgets, revenues),
          budget_rating: ss.sampleCorrelation(budgets, ratings),
          revenue_rating: ss.sampleCorrelation(revenues, ratings)
        };

        setCorrelation(corr);
      } catch (error) {
        console.error("Failed to fetch correlation data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full h-full rounded-xl border border-border/50 bg-card p-5 space-y-4">
        <div className="h-6 w-32 bg-muted rounded-md animate-pulse" />
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!correlation || Object.values(correlation).some(v => isNaN(v))) {
    return (
      <div className="w-full h-full rounded-xl border border-border/50 bg-card flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <TrendingUp className="w-6 h-6 text-primary/50" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-1">Insufficient data</h3>
        <p className="text-sm text-muted-foreground max-w-50">
          Add more movies to see correlation patterns
        </p>
      </div>
    );
  }

  const getCorrelationInfo = (value) => {
    const abs = Math.abs(value);
    if (abs > 0.7) return { color: 'text-emerald-600', icon: TrendingUp, label: 'Strong' };
    if (abs > 0.3) return { color: 'text-amber-600', icon: Minus, label: 'Moderate' };
    return { color: 'text-slate-400', icon: TrendingDown, label: 'Weak' };
  };

  const correlations = [
    { pair: 'Budget vs Revenue', value: correlation.budget_revenue, color: '#3b82f6' },
    { pair: 'Budget vs Rating', value: correlation.budget_rating, color: '#8b5cf6' },
    { pair: 'Revenue vs Rating', value: correlation.revenue_rating, color: '#ec4899' }
  ];

  return (
    <div className="w-full h-full rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50">
        <h3 className="text-sm font-medium text-foreground">Correlation Analysis</h3>
        <p className="text-xs text-muted-foreground mt-0.5">How metrics relate to each other</p>
      </div>
      
      <div className="divide-y divide-border/50">
        {correlations.map(({ pair, value, color }) => {
          const { color: textColor, icon: Icon, label } = getCorrelationInfo(value);
          
          return (
            <div key={pair} className="px-5 py-4 flex items-center justify-between group hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm text-foreground">{pair}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <div className="flex items-center gap-1.5 min-w-15 justify-end">
                  <Icon className={`w-3.5 h-3.5 ${textColor}`} />
                  <span className={`font-mono text-sm font-medium ${textColor}`}>
                    {value.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}