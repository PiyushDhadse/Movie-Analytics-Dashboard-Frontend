"use client";

import { useState, useRef } from "react";
import { uploadCSV } from "@/services/api";
import { UploadCloud, FileText, BarChart3, List, Hash, Loader2, X, Check, AlertCircle } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    try {
      const result = await uploadCSV(file);
      setAnalysis(result);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setAnalysis(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '—';
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

  const renderNumericCard = (col) => (
    <div key={col.column} className="bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-blue-500" />
          <h3 className="font-medium text-sm text-foreground">{col.column}</h3>
        </div>
        <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-medium">Numeric</span>
      </div>
      
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground/70 mb-1">Mean</div>
            <div className="font-mono text-sm font-medium text-foreground">
              {col.mean !== null ? formatNumber(col.mean) : '—'}
            </div>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground/70 mb-1">Max</div>
            <div className="font-mono text-sm font-medium text-foreground">
              {col.max !== null ? formatNumber(col.max) : '—'}
            </div>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground/70 mb-1">Min</div>
            <div className="font-mono text-sm font-medium text-foreground">
              {col.min !== null ? formatNumber(col.min) : '—'}
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-border/50">
          <div className="flex justify-between text-xs text-muted-foreground/70">
            <span>Std Dev</span>
            <span className="font-mono text-foreground">
              {col.std_dev !== null ? formatNumber(col.std_dev) : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategoricalCard = (col) => {
    const hasTooManyUnique = col.unique_count > 100 || !col.top_categories?.length;
    
    return (
      <div key={col.column} className={`bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-md transition-shadow ${!hasTooManyUnique ? 'lg:col-span-2' : ''}`}>
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-purple-500" />
            <h3 className="font-medium text-sm text-foreground">{col.column}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground/70">{col.unique_count} unique</span>
            <span className="text-xs bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full font-medium">Categorical</span>
          </div>
        </div>
        
        {hasTooManyUnique ? (
          <div className="p-5 flex flex-col items-center justify-center text-center min-h-37.5">
            <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <div className="text-2xl font-semibold text-foreground mb-1">{col.unique_count.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground/70">unique values</div>
          </div>
        ) : (
          <div className="p-5">
            <div className="w-full h-50">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={col.top_categories} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#e2e8f0' }} 
                    tickLine={false}
                    tickFormatter={(v) => v.length > 12 ? v.substring(0, 10) + '…' : v}
                    width={80}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card px-4 py-3 rounded-xl border border-border/50 shadow-lg text-sm">
                            <p className="text-foreground font-medium mb-1">{payload[0].payload.name}</p>
                            <p className="text-muted-foreground text-xs">{payload[0].value} occurrences</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                    {col.top_categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Data Analysis
        </h1>
        <p className="text-sm text-muted-foreground/80 mt-1">
          Upload any CSV file for instant column analysis and insights
        </p>
      </div>

      {!analysis ? (
        /* Upload Area */
        <div 
          className={`
            relative bg-card rounded-2xl border-2 border-dashed p-12 flex flex-col items-center justify-center min-h-112.5 text-center
            transition-all duration-200
            ${dragActive ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <UploadCloud className="w-6 h-6 text-primary" />
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {file ? 'File ready to upload' : 'Upload your dataset'}
          </h3>
          
          <p className="text-sm text-muted-foreground/70 max-w-md mb-6">
            {file 
              ? `Ready to analyze "${file.name}"`
              : 'Drag and drop your CSV file here, or click to browse'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {!file ? (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                Browse Files
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setFile(null)}
                  className="px-5 py-2.5 bg-transparent border border-border/50 text-muted-foreground hover:text-foreground rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4" />
                      Generate Dashboard
                    </>
                  )}
                </button>
              </>
            )}
          </div>
          
          {file && (
            <div className="mt-6 flex items-center gap-3 text-sm bg-muted/30 px-4 py-3 rounded-xl border border-border/50">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground/70 px-2 py-0.5 bg-background rounded-full">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Analysis Results */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* File Info Bar */}
          <div className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-medium text-foreground flex items-center gap-2">
                  {analysis.filename}
                  <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                    {analysis.row_count.toLocaleString()} rows
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  Successfully parsed {analysis.columns.length} columns
                </p>
              </div>
            </div>
            
            <button 
              onClick={resetUpload}
              className="px-4 py-2 bg-muted/30 hover:bg-muted/50 text-sm font-medium rounded-xl transition-colors border border-border/50"
            >
              Upload New File
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
            {analysis.columns.map((col) => 
              col.type === "numeric" ? renderNumericCard(col) : renderCategoricalCard(col)
            )}
          </div>
        </div>
      )}
    </div>
  );
}