import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface Review {
  id: string;
  name: string;
  description: string;
  profileUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface NewReview {
  name: string;
  description: string;
  profileUrl: string;
}

const EditReview: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [newReview, setNewReview] = useState<NewReview>({
    name: "",
    description: "",
    profileUrl: "/api/placeholder/128/128"
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        "https://totem-consultancy-alpha.vercel.app/api/reviews",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      alert("Failed to fetch reviews. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        `https://totem-consultancy-alpha.vercel.app/api/reviews/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      setReviews(reviews.filter(review => review.id !== id));
      alert("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again later.");
    }
  };

  const handleEdit = (review: Review): void => {
    setEditingReview(review);
    setNewReview({
      name: review.name,
      description: review.description,
      profileUrl: review.profileUrl
    });
    setIsModalOpen(true);
  };

  const handleAdd = (): void => {
    setEditingReview(null);
    setNewReview({
      name: "",
      description: "",
      profileUrl: "/api/placeholder/128/128"
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      if (!newReview.profileUrl || newReview.profileUrl === "/api/placeholder/128/128") {
        alert("Please upload an image before saving.");
        return;
      }

      const url = editingReview 
        ? `https://totem-consultancy-alpha.vercel.app/api/reviews/${editingReview.id}`
        : "https://totem-consultancy-alpha.vercel.app/api/reviews";

      const response = await fetch(url, {
        method: editingReview ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newReview.name,
          description: newReview.description,
          profileUrl: newReview.profileUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingReview ? 'update' : 'create'} review`);
      }

      const savedReview = await response.json();
      
      if (editingReview) {
        setReviews(reviews.map(review =>
          review.id === editingReview.id ? savedReview.review : review
        ));
      } else {
        setReviews([...reviews, savedReview.review]);
      }

      setIsModalOpen(false);
      setNewReview({
        name: "",
        description: "",
        profileUrl: "/api/placeholder/128/128"
      });
      setEditingReview(null);
      alert(`Review ${editingReview ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error(`Error ${editingReview ? 'updating' : 'saving'} review:`, error);
      alert(`Failed to ${editingReview ? 'update' : 'save'} review. Please check the data and try again.`);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");
  
    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dgagkq1cs/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        setNewReview(prevReview => ({
          ...prevReview,
          profileUrl: data.secure_url
        }));
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      alert("Failed to upload image. Please try again.");
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-black/5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-16">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Manage Reviews</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Add, edit, or remove testimonials</p>
        </div>
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Review
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 text-center text-blue-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="col-span-3 text-center text-blue-400">No reviews found. Add your first review!</div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="relative bg-gradient-to-b from-black to-blue-900 mt-16 p-6 rounded-2xl w-full sm:w-[370px] h-[280px] shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-blue-900/20">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-32 rounded-full border-4 border-blue-600 p-1 bg-black">
                  <img
                    alt={review.name}
                    className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    src={review.profileUrl}
                  />
                </div>
              </div>
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
                <button
                  onClick={() => handleEdit(review)}
                  className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-300 transition-colors"
                  title="Edit review"
                >
                  <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-1.5 sm:p-2 text-blue-400 hover:text-red-400 transition-colors"
                  title="Delete review"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
              <div className="mt-16 text-center">
                <h3 className="text-lg sm:text-xl font-semibold uppercase text-blue-400">{review.name}</h3>
                <p className="mt-4 text-sm sm:text-sm text-gray-300 leading-relaxed">{review.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-b from-black to-blue-900 rounded-2xl p-8 w-full max-w-md relative border border-blue-900/20">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-blue-400 mb-6">
              {editingReview ? 'Edit Review' : 'Add New Review'}
            </h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-blue-300 mb-2">
                  Name
                </label>
                <input
                  id="name"
                  className="w-full px-4 py-3 bg-black/50 text-white rounded-lg border border-blue-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  placeholder="Enter reviewer's name"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-blue-300 mb-2">
                  Review Content
                </label>
                <textarea
                  id="description"
                  className="w-full px-4 py-3 bg-black/50 text-white rounded-lg border border-blue-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 min-h-[120px]"
                  value={newReview.description}
                  onChange={(e) => setNewReview({ ...newReview, description: e.target.value })}
                  placeholder="Enter review content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">
                  Upload Image
                </label>
                <div
                  {...getRootProps()}
                  className="w-full px-4 py-6 bg-black/50 text-white rounded-lg border border-dashed border-blue-900 hover:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center cursor-pointer"
                >
                  <input {...getInputProps()} />
                  <p className="text-sm text-blue-300">
                    Drag & drop an image here, or <span className="text-blue-500 underline">click to select</span>
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditReview;