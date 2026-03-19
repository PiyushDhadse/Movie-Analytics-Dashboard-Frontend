"use client";

import { useEffect, useState } from "react";
import { getMovies, addMovie } from "@/services/api";
import AddMovieModal from "@/components/AddMovieModal";
import { 
  Search, Plus, Film, Calendar, DollarSign, Star, TrendingUp, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUpDown, ArrowUp, ArrowDown 
} from "lucide-react";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const itemsPerPageOptions = [5, 10, 15, 20, 30, 50, 100];
  
  // Sorting states
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'desc'
  });

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const data = await getMovies();
      setMovies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleAddMovie = async (movieData) => {
    try {
      await addMovie(movieData);
      setIsModalOpen(false);
      fetchMovies();
    } catch (err) {
      console.error("Failed to add movie", err);
    }
  };

  const formatGenre = (genreStr) => {
    try {
      if (!genreStr) return "";
      
      if (genreStr.includes("[") && genreStr.includes("]")) {
        const start = genreStr.indexOf("[");
        const end = genreStr.lastIndexOf("]") + 1;
        const jsonPart = genreStr.substring(start, end);
        const genres = JSON.parse(jsonPart);
        if (Array.isArray(genres)) {
          return genres.map(g => g.name || g).join(", ");
        }
      }
      
      return genreStr.replace("Unknown", "").split("[")[0].trim();
    } catch (e) {
      return genreStr.replace("Unknown", "").split("[")[0].trim();
    }
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-muted-foreground/40" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="w-3.5 h-3.5 ml-1 text-primary" />;
    }
    return <ArrowDown className="w-3.5 h-3.5 ml-1 text-primary" />;
  };

  // Filter and sort movies
  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    formatGenre(m.genre).toLowerCase().includes(search.toLowerCase())
  );

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    
    switch (sortConfig.key) {
      case 'title':
        return direction * a.title.localeCompare(b.title);
      
      case 'year':
        return direction * (a.year - b.year);
      
      case 'budget':
        return direction * (a.budget - b.budget);
      
      case 'revenue':
        return direction * (a.revenue - b.revenue);
      
      case 'rating':
        return direction * (a.rating - b.rating);
      
      default:
        return direction * (a.id - b.id);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedMovies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovies = sortedMovies.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded mt-2 animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
        </div>
        
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
          </div>
          <div className="p-4 space-y-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Movies
          </h1>
          <p className="text-sm text-muted-foreground/80 mt-1">
            Manage and explore your movie collection
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Movie
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {/* Search and Controls */}
        <div className="p-4 border-b border-border/50 space-y-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input 
              type="text"
              placeholder="Search by title or genre..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 bg-background border border-border/50 rounded-xl pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Items Per Page */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground/70">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 px-2 bg-background border border-border/50 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground/70">per page</span>
            </div>

            {/* Results Count */}
            <div className="text-xs text-muted-foreground/70">
              Showing <span className="font-medium text-foreground">{startIndex + 1}</span> -{' '}
              <span className="font-medium text-foreground">
                {Math.min(startIndex + itemsPerPage, sortedMovies.length)}
              </span> of{' '}
              <span className="font-medium text-foreground">{sortedMovies.length}</span> movies
            </div>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground/70 uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    Title
                    {getSortIcon('title')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                  Genre
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground/70 uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('year')}
                >
                  <div className="flex items-center">
                    Year
                    {getSortIcon('year')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground/70 uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('budget')}
                >
                  <div className="flex items-center">
                    Budget
                    {getSortIcon('budget')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground/70 uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('revenue')}
                >
                  <div className="flex items-center">
                    Revenue
                    {getSortIcon('revenue')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground/70 uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center">
                    Rating
                    {getSortIcon('rating')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedMovies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Film className="w-8 h-8 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">No movies found</p>
                      <p className="text-xs text-muted-foreground/60">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{movie.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/30 text-secondary-foreground border border-border/50">
                        {formatGenre(movie.genre)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{movie.year}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span className="font-mono text-xs">{formatCurrency(movie.budget)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="font-mono text-xs font-medium">{formatCurrency(movie.revenue)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Star className={`w-3.5 h-3.5 ${getRatingColor(movie.rating)}`} />
                        <span className={`font-medium ${getRatingColor(movie.rating)}`}>
                          {movie.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground/70">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-sm text-foreground min-w-[40px] text-center">
                {currentPage}
              </span>
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <AddMovieModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddMovie} 
      />
    </div>
  );
}