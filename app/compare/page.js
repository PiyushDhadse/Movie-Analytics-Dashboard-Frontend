"use client";

import { useEffect, useState } from "react";
import { getMovies } from "@/services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";
import { Search, Film, DollarSign, Star, TrendingUp, Check, X } from "lucide-react";

export default function ComparePage() {
  const [movies, setMovies] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const data = await getMovies();
        data.sort((a, b) => a.title.localeCompare(b.title));
        setMovies(data);
        if (data.length >= 2) {
          setSelectedMovies([data[0].id, data[1].id]);
        }
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, []);

  const handleToggleMovie = (id) => {
    if (selectedMovies.includes(id)) {
      setSelectedMovies(selectedMovies.filter(mId => mId !== id));
    } else {
      if (selectedMovies.length >= 4) {
        return;
      }
      setSelectedMovies([...selectedMovies, id]);
    }
  };

  const comparisonData = selectedMovies.map(id => {
    return movies.find(m => m.id === id);
  }).filter(Boolean);

  const colors = ["#3b82f6", "#ec4899", "#10b981", "#f59e0b"];

  const formatCurrency = (val) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <div>
          <div className="h-8 w-64 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-card rounded-2xl border border-border/50 h-[600px] animate-pulse" />
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card rounded-2xl border border-border/50 h-[350px] animate-pulse" />
            <div className="bg-card rounded-2xl border border-border/50 h-[300px] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Compare Movies
        </h1>
        <p className="text-sm text-muted-foreground/80 mt-1">
          Select up to 4 movies to compare metrics side by side
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Selection Sidebar */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-border/50">
            <h3 className="text-sm font-medium text-foreground mb-3">Select Movies</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input 
                type="text" 
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 bg-background border border-border/50 rounded-xl pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            {selectedMovies.length === 4 && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <X className="w-3 h-3" />
                Maximum 4 movies selected
              </p>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Film className="w-6 h-6 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No movies found</p>
              </div>
            ) : (
              filteredMovies.map((movie) => {
                const isSelected = selectedMovies.includes(movie.id);
                return (
                  <button
                    key={movie.id}
                    onClick={() => handleToggleMovie(movie.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200
                      ${isSelected 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'hover:bg-muted/30 border border-transparent'
                      }
                      ${selectedMovies.length >= 4 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={selectedMovies.length >= 4 && !isSelected}
                  >
                    <div className={`
                      w-4 h-4 rounded border flex items-center justify-center transition-colors
                      ${isSelected 
                        ? 'bg-primary border-primary' 
                        : 'border-muted-foreground/30'
                      }
                    `}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium flex-1 truncate">
                      {movie.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{movie.year}</span>
                  </button>
                );
              })
            )}
          </div>
          
          <div className="p-3 border-t border-border/50 bg-muted/20">
            <div className="text-xs text-muted-foreground/70 flex justify-between">
              <span>Selected: {selectedMovies.length}/4</span>
              {selectedMovies.length > 0 && (
                <button 
                  onClick={() => setSelectedMovies([])}
                  className="text-primary hover:text-primary/80"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Charts Area */}
        <div className="lg:col-span-3 space-y-6">
          {comparisonData.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 flex flex-col items-center justify-center p-12 h-[600px] text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Film className="w-6 h-6 text-primary/50" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-1">No movies selected</h3>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                Select movies from the left panel to start comparing
              </p>
            </div>
          ) : (
            <>
              {/* Financial Comparison */}
              <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-medium text-foreground">Financial Comparison</h2>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">Budget vs Revenue (millions)</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} margin={{ left: 20, right: 20, bottom: 20 }}>
                        <XAxis 
                          dataKey="title" 
                          tick={{ fill: '#94a3b8', fontSize: 11 }} 
                          tickLine={false} 
                          axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                          tickFormatter={(v) => v.length > 12 ? v.substring(0, 10) + '…' : v}
                          interval={0}
                          angle={-30}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tick={{ fill: '#94a3b8', fontSize: 11 }} 
                          tickLine={false} 
                          axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                          tickFormatter={(value) => `$${(value / 1e6).toFixed(0)}M`}
                          label={{ 
                            value: 'Amount (millions)', 
                            angle: -90, 
                            position: 'left',
                            offset: 10,
                            fill: '#64748b', 
                            fontSize: 11,
                            fontWeight: 500
                          }}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-card px-4 py-3 rounded-xl border border-border/50 shadow-lg text-sm">
                                  <p className="font-medium text-foreground mb-2">{payload[0].payload.title}</p>
                                  {payload.map((entry, index) => (
                                    <p key={index} className="text-muted-foreground text-xs">
                                      {entry.name}: {formatCurrency(entry.value)}
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                          cursor={{ fill: '#f8fafc' }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} 
                          iconType="circle"
                          iconSize={8}
                        />
                        <Bar 
                          dataKey="budget" 
                          name="Budget" 
                          fill="#3b82f6" 
                          radius={[6, 6, 0, 0]} 
                          barSize={32}
                          animationDuration={400}
                        />
                        <Bar 
                          dataKey="revenue" 
                          name="Revenue" 
                          fill="#10b981" 
                          radius={[6, 6, 0, 0]} 
                          barSize={32}
                          animationDuration={400}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Rating Comparison */}
              <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-border/50">
                  <h2 className="text-base font-medium text-foreground">Rating Comparison</h2>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">Out of 10</p>
                </div>
                <div className="p-4">
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={comparisonData} 
                        layout="vertical" 
                        margin={{ left: 100, right: 20, top: 20, bottom: 20 }}
                      >
                        <XAxis 
                          type="number" 
                          domain={[0, 10]} 
                          tick={{ fill: '#94a3b8', fontSize: 11 }} 
                          axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }} 
                          tickLine={false}
                          ticks={[0, 2, 4, 6, 8, 10]}
                        />
                        <YAxis 
                          dataKey="title" 
                          type="category" 
                          tick={{ fill: '#94a3b8', fontSize: 12 }} 
                          axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }} 
                          tickLine={false}
                          tickFormatter={(v) => v.length > 18 ? v.substring(0, 15) + '…' : v}
                          width={100}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-card px-4 py-3 rounded-xl border border-border/50 shadow-lg text-sm">
                                  <p className="font-medium text-foreground mb-1">{payload[0].payload.title}</p>
                                  <p className="text-muted-foreground text-xs">
                                    Rating: {payload[0].value.toFixed(1)} / 10
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                          cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar 
                          dataKey="rating" 
                          name="Rating" 
                          radius={[0, 6, 6, 0]}
                          barSize={24}
                          animationDuration={400}
                        >
                          {comparisonData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={colors[index % colors.length]} 
                              fillOpacity={0.8}
                              className="hover:fill-opacity-100 transition-opacity"
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}