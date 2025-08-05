import React, { useState, useEffect } from 'react';
import { Trash2, Loader, AlertCircle, RefreshCw, User, Star, Quote, Calendar } from 'lucide-react';

interface Testimonial {
  id: string;
  email: string;
  name?: string;
  message?: string;
  rating?: number;
  position?: string;
  company?: string;
  date?: string;
}

const TestimonialManager: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [refreshRotate, setRefreshRotate] = useState<boolean>(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setRefreshRotate(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/test');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch testimonials: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      // Handle both array and single object responses
      const testimonialsData = Array.isArray(data) ? data : [data];
      setTestimonials(testimonialsData);
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      setError("Failed to load testimonials. Please try again later.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setRefreshRotate(false), 600);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent): Promise<void> => {
    // Prevent event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Show confirmation dialog before proceeding with deletion
    const confirmDelete = window.confirm("Are you sure you want to delete this testimonial?");
    
    if (!confirmDelete) {
      return; // User canceled the deletion
    }
    
    setDeleteLoading(id);
    
    try {
      // Ensure we're passing the ID in the URL correctly
      const response = await fetch(`http://localhost:5000/api/test/${id}`, {
        method: 'DELETE',
        // headers: {
        //   'Content-Type': 'application/json'
        // }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete testimonial: ${response.status} ${response.statusText}`);
      }
      
      // Remove the deleted testimonial from state
      setTestimonials(testimonials.filter(testimonial => testimonial.id !== id));
      
      // Show success message
      alert("Testimonial deleted successfully.");
    } catch (err) {
      console.error("Error deleting testimonial:", err);
      alert("Failed to delete testimonial. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Function to render stars based on rating
  const renderRating = (rating: number = 5): JSX.Element[] => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} 
      />
    ));
  };

  // Format date if available
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Get display name (use email if name is not available)
  const getDisplayName = (testimonial: Testimonial): string => {
    return testimonial.name || testimonial.email.split('@')[0] || 'Anonymous';
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-gradient-to-b from-blue-950/5 to-black/5 min-h-screen">
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-800 p-6 sm:p-8 mb-16 rounded-2xl shadow-xl border border-blue-600/20">
        <div className="absolute -bottom-3 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Newsletter</h1>
            <p className="text-sm sm:text-base text-blue-200/80 mt-2">View and manage newsletter</p>
            <div className="hidden sm:block absolute -bottom-4 left-0 w-16 h-1 bg-blue-400"></div>
          </div>
          <button
            onClick={fetchTestimonials}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 disabled:opacity-70 group"
          >
            <RefreshCw className={`w-5 h-5 ${refreshRotate ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 p-5 text-red-100 bg-gradient-to-r from-red-900/60 to-red-800/60 rounded-xl border border-red-700/30 shadow-lg">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <p>{error}</p>
        </div>
      )}

      {isLoading && testimonials.length === 0 ? (
        <div className="flex flex-col justify-center items-center p-16">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-blue-400 animate-pulse">Loading testimonials...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-24 px-6">
          <div className="w-20 h-20 rounded-full bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
            <Quote className="w-10 h-10 text-blue-400/70" />
          </div>
          <h3 className="text-xl font-medium text-blue-500 mb-2">No testimonials</h3>
          <p className="text-gray-400 max-w-md mx-auto">You don't have any testimonials at the moment. New testimonials will appear here when added.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="relative bg-gradient-to-b from-black to-blue-900 p-7 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-blue-800/30 overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              
              {/* Quote decoration */}
              <div className="absolute top-4 right-4 opacity-10">
                <Quote className="w-16 h-16 text-blue-300" />
              </div>
              
              <div className="flex justify-between">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <User className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-300">{getDisplayName(testimonial)}</h3>
                    <p className="text-sm text-blue-400/70">{testimonial.email}</p>
                    {(testimonial.position || testimonial.company) && (
                      <p className="text-sm text-blue-400/70">
                        {testimonial.position && <span>{testimonial.position}</span>}
                        {testimonial.position && testimonial.company && <span> • </span>}
                        {testimonial.company && <span>{testimonial.company}</span>}
                      </p>
                    )}
                  </div>
                </div>
                {/* <div className="flex items-start">
                  <button
                    onClick={(e) => handleDelete(testimonial.id, e)}
                    disabled={deleteLoading === testimonial.id}
                    className="p-2.5 bg-blue-900/50 text-blue-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    aria-label="Delete testimonial"
                    type="button"
                  >
                    {deleteLoading === testimonial.id ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div> */}
              </div>
              
              {/* Rating stars if available */}
              {testimonial.rating && (
                <div className="flex items-center gap-1 mt-2 mb-4">
                  {renderRating(testimonial.rating)}
                </div>
              )}
              
              {/* Testimonial content */}
              {testimonial.message && (
                <div className="mt-4 p-5 bg-gradient-to-r from-black/60 to-blue-950/40 rounded-xl border border-blue-900/30">
                  <p className="text-gray-300 leading-relaxed italic">"{testimonial.message}"</p>
                </div>
              )}
              
              {/* Date if available */}
              {testimonial.date && (
                <div className="flex items-center gap-2 mt-4 text-sm text-blue-400/70">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(testimonial.date)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialManager;