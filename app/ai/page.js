"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Search, Mic, MicOff, Sparkles, Film, DollarSign, Star, Calendar, TrendingUp, Loader2, AlertCircle } from "lucide-react";

export default function AIPage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a question");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/analyze`,
        null,
        { params: { query } }
      );
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    setListening(true);
    setError(null);

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setListening(false);
    };

    recognitionRef.current.onerror = () => {
      setListening(false);
      setError("Could not recognize speech. Try typing instead.");
    };

    recognitionRef.current.onend = () => {
      setListening(false);
    };

    try {
      recognitionRef.current.start();
    } catch (err) {
      setListening(false);
      setError("Speech recognition failed to start");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setListening(false);
    }
  };

  const formatCurrency = (val) => {
    if (!val) return "$0";
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return "text-emerald-600";
    if (rating >= 6) return "text-amber-600";
    return "text-slate-400";
  };

  const chartColors = {
    budget: "#3b82f6",
    revenue: "#10b981"
  };

  const suggestions = [
    "Analyze Inception",
    "Compare Interstellar and The Martian",
    "Highest grossing movie of 2020",
    "Movies directed by Nolan"
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          AI Movie Analytics
          <Sparkles className="w-5 h-5 text-primary" />
        </h1>
        <p className="text-sm text-muted-foreground/80 mt-1">
          Ask questions about movies in natural language
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask something like 'Analyze Interstellar' or 'Compare Inception and Tenet'..."
              className="w-full h-11 bg-background border border-border/50 rounded-xl pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={loading}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={listening ? stopListening : handleVoiceInput}
              disabled={loading}
              className={`
                h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200
                ${listening 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse' 
                  : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground border border-border/50'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="h-11 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Listening Indicator */}
        {listening && (
          <div className="flex items-center gap-2 text-sm text-rose-500 animate-in fade-in">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            Listening... speak your question
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-500 bg-rose-500/10 px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 pt-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setQuery(suggestion);
                inputRef.current?.focus();
              }}
              className="px-3 py-1.5 text-xs bg-muted/30 hover:bg-muted/50 text-muted-foreground rounded-lg border border-border/50 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-7 w-48 bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
        </div>
      )}

      {/* Analytics Output */}
      {response?.data && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Card */}
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-foreground">
                    {response.data.title}
                  </h2>
                  {response.source === "ai_generated" && (
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      AI Estimated
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground/80 mt-1">
                  {response.data.genre} • {response.data.year}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className={`font-medium ${getRatingColor(response.data.rating)}`}>
                    {response.data.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">/10</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-b border-border/50">
              <div className="p-5">
                <p className="text-xs text-muted-foreground/70 mb-1">Budget</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground/40" />
                  <span className="font-mono font-medium text-foreground">
                    {formatCurrency(response.data.budget)}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <p className="text-xs text-muted-foreground/70 mb-1">Revenue</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono font-medium text-emerald-600">
                    {formatCurrency(response.data.revenue)}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <p className="text-xs text-muted-foreground/70 mb-1">Profit</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground/40" />
                  <span className="font-mono font-medium text-foreground">
                    {formatCurrency(response.data.revenue - response.data.budget)}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <p className="text-xs text-muted-foreground/70 mb-1">ROI</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground/40" />
                  <span className="font-mono font-medium text-foreground">
                    {response.data.budget > 0 
                      ? `${((response.data.revenue - response.data.budget) / response.data.budget * 100).toFixed(0)}%`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="p-6">
              <h3 className="text-sm font-medium text-foreground mb-4">Budget vs Revenue</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[{
                      name: response.data.title,
                      budget: response.data.budget,
                      revenue: response.data.revenue,
                    }]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                      tickFormatter={(value) => `$${(value / 1e6).toFixed(0)}M`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card px-4 py-3 rounded-xl border border-border/50 shadow-lg text-sm">
                              <p className="font-medium text-foreground mb-2">{response.data.title}</p>
                              {payload.map((entry, index) => (
                                <p key={index} className="text-xs text-muted-foreground">
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
                    <Bar 
                      dataKey="budget" 
                      fill={chartColors.budget} 
                      radius={[6, 6, 0, 0]} 
                      barSize={40}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill={chartColors.revenue} 
                      radius={[6, 6, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rating Bar */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Rating</span>
                <span className="text-sm text-muted-foreground">
                  {response.data.rating.toFixed(1)} / 10
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(response.data.rating || 0) * 10}%` }}
                />
              </div>
            </div>
          </div>

          {/* Source Attribution */}
          <p className="text-xs text-center text-muted-foreground/60">
            {response.source === "ai_generated" 
              ? "This data was estimated by AI based on available information"
              : "Data retrieved from the movie database"
            }
          </p>
        </div>
      )}
    </div>
  );
}