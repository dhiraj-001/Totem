import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X, Upload, Image } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface Project {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  projects?: ProjectMedia[];
}

interface ProjectMedia {
  id: string;
  mediaUrl: string;
  categoryId: string;
  createdAt: string;
}

interface ProjectFormData {
  name: string;
  imageUrl: string;
}

const ProjectManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    imageUrl: "/api/placeholder/128/128",
  });
  const [isLoading, setIsLoading] = useState(false);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await fetch('https://totem-consultancy-alpha.vercel.app/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }
  
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`https://totem-consultancy-alpha.vercel.app/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete project');
      }
  
      setProjects(projects.filter(project => project.id !== id));
    } catch (error: any) {
      console.error('Error deleting project:', error);
      alert(error.message || 'Failed to delete project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`https://totem-consultancy-alpha.vercel.app/api/projects/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete image');
      }

      // Update the local state to remove the deleted image
      if (selectedProject) {
        const updatedProjects = projects.map(project => {
          if (project.id === selectedProject.id) {
            return {
              ...project,
              projects: project.projects?.filter(media => media.id !== mediaId) || []
            };
          }
          return project;
        });
        setProjects(updatedProjects);
      }
    } catch (error: any) {
      console.error('Error deleting image:', error);
      alert(error.message || 'Failed to delete image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      imageUrl: project.imageUrl,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedProject(null);
    setFormData({
      name: "",
      imageUrl: "/api/placeholder/128/128",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const endpoint = selectedProject 
        ? `https://totem-consultancy-alpha.vercel.app/api/categories/${selectedProject.id}`
        : 'https://totem-consultancy-alpha.vercel.app/api/categories';
      
      const method = selectedProject ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          imageUrl: formData.imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server response:', errorData);
        throw new Error(errorData?.message || 'Failed to save project');
      }
      
      const updatedProject = await response.json();
      
      if (selectedProject) {
        setProjects(projects.map(project => 
          project.id === selectedProject.id ? updatedProject : project
        ));
      } else {
        setProjects([...projects, updatedProject]);
      }
      setIsModalOpen(false);
    } catch (error : any) {
      console.error('Error saving project:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadToCloudinary = async (file: File) => {
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

      if (!response.ok) throw new Error("Failed to upload image");
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

  const handleMediaUpload = async (categoryId: string, file: File) => {
    try {
      const token = getToken();
      const mediaUrl = await uploadToCloudinary(file);
      
      const response = await fetch('https://totem-consultancy-alpha.vercel.app/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mediaUrl,
          categoryId,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add media');
      
      await fetchProjects();
      setIsMediaModalOpen(false);
    } catch (error) {
      console.error('Error adding media:', error);
    }
  };

  const handleViewImages = (project: Project) => {
    setSelectedProject(project);
    setIsGalleryModalOpen(true);
  };

  const onProjectImageDrop = async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      if (!file) return;
      
      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        imageUrl,
      }));
    } catch (error) {
      console.error("Error uploading project image:", error);
    }
  };

  const onMediaDrop = async (acceptedFiles: File[]) => {
    if (!selectedProject || !acceptedFiles.length) return;
    await handleMediaUpload(selectedProject.id, acceptedFiles[0]);
  };

  const { getRootProps: getProjectImageRootProps, getInputProps: getProjectImageInputProps } = 
    useDropzone({ onDrop: onProjectImageDrop });
    
  const { getRootProps: getMediaRootProps, getInputProps: getMediaInputProps } = 
    useDropzone({ onDrop: onMediaDrop });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-black/5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-16">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
            Manage Projects
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Add, edit, or remove projects and their media
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-blue-600 text-center w-full col-span-3">Loading projects...</p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="relative bg-gradient-to-b from-black to-blue-900 mt-16 p-6 rounded-2xl w-full sm:w-[290px] h-[210px] shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-blue-900/20"
            >
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-32 rounded-full border-4 border-blue-600 p-1 bg-black">
                  <img
                    alt={project.name}
                    className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    src={project.imageUrl}
                  />
                </div>
              </div>
              <div className="absolute top-2 sm:top-4 right-3 sm:right-1 flex gap-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-300 transition-colors"
                  title="Edit project"
                >
                  <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-1.5 sm:p-2 text-blue-400 hover:text-red-400 transition-colors"
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setIsMediaModalOpen(true);
                  }}
                  className="p-1.5 sm:p-2 text-blue-400 hover:text-green-400 transition-colors"
                  title="Add media"
                >
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="mt-16 text-center">
                <h3 className="text-lg sm:text-xl font-semibold uppercase text-blue-400">
                  {project.name}
                </h3>
                {project.projects && (
                  <div className="mt-2 flex flex-col items-center gap-2">
                    <p className="text-sm text-blue-300">
                      {project.projects.length} media items
                    </p>
                    <button
                      onClick={() => handleViewImages(project)}
                      className="flex items-center gap-2 text-sm bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-1.5 rounded-lg transition-all duration-300"
                    >
                      <Image className="w-4 h-4" />
                      View Images
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Modal */}
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
              {selectedProject ? "Edit Project" : "Add New Project"}
            </h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-blue-300 mb-2">
                  Name
                </label>
                <input
                  id="name"
                  className="w-full px-4 py-3 bg-black/50 text-white rounded-lg border border-blue-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>
              <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">
                  Project Image
                </label>
                <div
                  {...getProjectImageRootProps()}
                  className="w-full px-4 py-6 bg-black/50 text-white rounded-lg border border-dashed border-blue-900 hover:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center cursor-pointer"
                >
                  <input {...getProjectImageInputProps()} />
                  <p className="text-sm text-blue-300">
                    Drag & drop an image here, or{" "}
                    <span className="text-blue-500 underline">click to select</span>
                  </p>
                </div>
                {formData.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover mx-auto"
                    />
                  </div>
                )}
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
                  disabled={isLoading || !formData.name}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Modal */}
      {isMediaModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-b from-black to-blue-900 rounded-2xl p-8 w-full max-w-md relative border border-blue-900/20">
            <button
              onClick={() => setIsMediaModalOpen(false)}
              className="absolute top-4 right-4 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-blue-400 mb-6">
              Add Media to {selectedProject.name}
            </h2>
            <div className="space-y-6">
              <div
                {...getMediaRootProps()}
                className="w-full px-4 py-6 bg-black/50 text-white rounded-lg border border-dashed border-blue-900 hover:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center cursor-pointer"
              >
                <input {...getMediaInputProps()} />
                <p className="text-sm text-blue-300">
                  Drag & drop media here, or{" "}
                  <span className="text-blue-500 underline">click to select</span>
                </p>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setIsMediaModalOpen(false)}
                  className="px-6 py-2.5 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {isGalleryModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-b from-black to-blue-900 rounded-2xl p-8 w-full max-w-4xl max-h-[80vh] overflow-y-auto relative border border-blue-900/20">
            <button
              onClick={() => setIsGalleryModalOpen(false)}
              className="absolute top-4 right-4 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-blue-400 mb-6">
              {selectedProject.name} - Gallery
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {selectedProject.projects?.map((media) => (
                <div key={media.id} className="relative aspect-square group">
                  <img
                    src={media.mediaUrl}
                    alt={`Media ${media.id}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleDeleteMedia(media.id)}
                    className="absolute top-2 right-2 p-2 bg-red-600/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
                    title="Delete image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {(!selectedProject.projects || selectedProject.projects.length === 0) && (
              <p className="text-center text-blue-300">No images available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;