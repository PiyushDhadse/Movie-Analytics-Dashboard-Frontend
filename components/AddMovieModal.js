import { useState, useEffect, useRef } from "react";
import { X, Film, Calendar, DollarSign, Star, TrendingUp } from "lucide-react";

export default function AddMovieModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    budget: "",
    revenue: "",
    rating: "",
    year: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  const titleInputRef = useRef(null);

  // Focus trap and auto-focus
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.genre.trim()) newErrors.genre = "Genre is required";
    
    const year = parseInt(formData.year);
    if (!formData.year) newErrors.year = "Year is required";
    else if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 5) {
      newErrors.year = "Enter a valid year";
    }
    
    const budget = parseFloat(formData.budget);
    if (!formData.budget) newErrors.budget = "Budget is required";
    else if (isNaN(budget) || budget < 0) newErrors.budget = "Enter a valid amount";
    
    const revenue = parseFloat(formData.revenue);
    if (!formData.revenue) newErrors.revenue = "Revenue is required";
    else if (isNaN(revenue) || revenue < 0) newErrors.revenue = "Enter a valid amount";
    
    const rating = parseFloat(formData.rating);
    if (!formData.rating) newErrors.rating = "Rating is required";
    else if (isNaN(rating) || rating < 0 || rating > 10) {
      newErrors.rating = "Rating must be between 0 and 10";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...formData,
        budget: parseFloat(formData.budget),
        revenue: parseFloat(formData.revenue),
        rating: parseFloat(formData.rating),
        year: parseInt(formData.year)
      });
      
      // Reset form after successful submission
      setFormData({
        title: "", genre: "", budget: "", revenue: "", rating: "", year: ""
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (fieldName) => `
    w-full h-11 bg-background border rounded-xl px-4 text-sm 
    focus:outline-none focus:ring-2 transition-all
    ${errors[fieldName] 
      ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400' 
      : 'border-border/50 focus:ring-primary/20 focus:border-primary'
    }
  `;

  const labelClasses = "text-xs font-medium text-muted-foreground/80 mb-1.5 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Add New Movie</h2>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Enter the movie details below</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1">
            <label className={labelClasses}>
              Movie Title
            </label>
            <div className="relative">
              <Film className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input 
                ref={titleInputRef}
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Inception"
                className={`${inputClasses('title')} pl-9`}
              />
            </div>
            {errors.title && (
              <p className="text-xs text-rose-500 mt-1">{errors.title}</p>
            )}
          </div>
          
          {/* Genre and Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClasses}>Genre</label>
              <input 
                required
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="e.g. Sci-Fi"
                className={inputClasses('genre')}
              />
              {errors.genre && (
                <p className="text-xs text-rose-500 mt-1">{errors.genre}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className={labelClasses}>Release Year</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input 
                  required
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="2010"
                  className={`${inputClasses('year')} pl-9`}
                />
              </div>
              {errors.year && (
                <p className="text-xs text-rose-500 mt-1">{errors.year}</p>
              )}
            </div>
          </div>
          
          {/* Budget and Revenue */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClasses}>Budget ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input 
                  required
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="160000000"
                  className={`${inputClasses('budget')} pl-9`}
                />
              </div>
              {errors.budget && (
                <p className="text-xs text-rose-500 mt-1">{errors.budget}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className={labelClasses}>Revenue ($)</label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input 
                  required
                  type="number"
                  name="revenue"
                  value={formData.revenue}
                  onChange={handleChange}
                  placeholder="820000000"
                  className={`${inputClasses('revenue')} pl-9`}
                />
              </div>
              {errors.revenue && (
                <p className="text-xs text-rose-500 mt-1">{errors.revenue}</p>
              )}
            </div>
          </div>
          
          {/* Rating */}
          <div className="space-y-1">
            <label className={labelClasses}>Rating (out of 10)</label>
            <div className="relative">
              <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input 
                required
                type="number"
                step="0.1"
                max="10"
                min="0"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                placeholder="8.8"
                className={`${inputClasses('rating')} pl-9`}
              />
            </div>
            {errors.rating && (
              <p className="text-xs text-rose-500 mt-1">{errors.rating}</p>
            )}
          </div>
          
          {/* Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Movie'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}