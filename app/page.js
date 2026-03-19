"use client";

import { useEffect, useState } from "react";
import TopGrossingChart from "@/components/charts/TopGrossingChart";
import BudgetRevenueChart from "@/components/charts/BudgetRevenueChart";
import GenrePopularityChart from "@/components/charts/GenrePopularityChart";
import CorrelationHeatmap from "@/components/charts/CorrelationHeatmap";
import StatCard from "@/components/StatCard";
import {
  Film,
  UserSquare2,
  DollarSign,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import Link from "next/link";

export default function Home() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/summary`,
        );
        setSummary(data);
      } catch (err) {
        console.error("Failed to fetch summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const formatCurrency = (val) => {
    if (!val) return "$0";
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  const cards = [
    {
      title: "Total Movies",
      key: "total_movies",
      icon: Film,
      formatter: (v) => v?.toLocaleString(),
    },
    {
      title: "Average Rating",
      key: "avg_rating",
      icon: UserSquare2,
      formatter: (v) => (v ? `${v.toFixed(1)} / 10` : "—"),
    },
    {
      title: "Total Revenue",
      key: "total_revenue",
      icon: DollarSign,
      formatter: formatCurrency,
    },
    {
      title: "Total Budget",
      key: "total_budget",
      icon: TrendingUp,
      formatter: formatCurrency,
    },
  ];

  const chartSections = [
    {
      title: "Top Grossing Movies",
      component: TopGrossingChart,
      href: "/movies",
    },
    {
      title: "Genre Popularity",
      component: GenrePopularityChart,
      href: "/movies?tab=genres",
    },
    {
      title: "Budget vs Revenue",
      component: BudgetRevenueChart,
      span: "full",
      href: "/compare",
    },
    {
      title: "Correlation Matrix",
      component: CorrelationHeatmap,
      span: "full",
      href: "/ai",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground/80 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatCard
            key={card.key}
            title={card.title}
            value={loading ? "—" : card.formatter(summary?.[card.key])}
            icon={card.icon}
            loading={loading}
          />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartSections.map((section, index) => {
          const Component = section.component;
          const isFullSpan = section.span === "full";

          return (
            <div
              key={section.title}
              className={isFullSpan ? "lg:col-span-2" : ""}
            >
              <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                  <h2 className="text-base font-medium text-foreground">
                    {section.title}
                  </h2>
                  <Link
                    href={section.href}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    View all
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="p-4">
                  <div className="w-full h-87.5">
                    <Component />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
