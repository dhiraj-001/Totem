import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  mediaUrl: string;
  categoryId: string;
  type?: string; // Add type field to identify video editing projects
  category: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

// This is a placeholder component for the specific project ID
// You can replace this with your actual component later
const SpecificVideoProject = ({ project, categoryProjects }: { project: Project, categoryProjects: Project[] }) => {
  // Extract video URL from the project or related projects for the grid
  const defaultVideoUrl = project.mediaUrl || (categoryProjects.length > 0 ? categoryProjects[0].mediaUrl : '');
  
  return (
    <div className="w-full bg-gray-50 py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Grid layout for videos - Mobile responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-10">
          {/* First column - video embed */}
          <div className="col-span-1">
            <div className="rounded-lg overflow-hidden shadow-sm h-[550px] sm:h-[500px] lg:h-[550px]">
              <iframe 
                src="https://player.cloudinary.com/embed/?cloud_name=dgagkq1cs&public_id=-273e-46bb-b880-85774fdbbbf3_ggtj4v&profile=cld-default"
                className="w-full h-full object-cover"
                title="Video 1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          
          {/* Second column - project video */}
          <div className="col-span-1">
            <div className="rounded-lg overflow-hidden shadow-sm h-[550px] sm:h-[550px] lg:h-[550px]">
              <iframe 
                src="https://player.cloudinary.com/embed/?cloud_name=dgagkq1cs&public_id=-dcd2-4f36-ab9a-a1a60e7f09b5_zfjgfi&profile=cld-adaptive-stream"
                className="w-full h-full object-cover"
                title="Video 2"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          
          {/* Third column - project video */}
          <div className="col-span-1">
            <div className="rounded-lg overflow-hidden shadow-sm h-[550px] sm:h-[550px] lg:h-[550px]">
              <iframe 
                src="https://player.cloudinary.com/embed/?cloud_name=dgagkq1cs&public_id=-dcd2-4f36-ab9a-a1a60e7f09b5_zfjgfi&profile=cld-adaptive-stream"
                className="w-full h-full object-cover"
                title="Video 3"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          
          {/* Fourth column - video embed */}
          <div className="col-span-1">
            <div className="rounded-lg overflow-hidden shadow-sm h-[550px] sm:h-[550px] lg:h-[550px]">
              <iframe 
                src="https://player.cloudinary.com/embed/?cloud_name=dgagkq1cs&public_id=-273e-46bb-b880-85774fdbbbf3_ggtj4v&profile=cld-default"
                className="w-full h-full object-cover"
                title="Video 4"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          
          {/* Fifth column - project video */}
          <div className="col-span-1">
            <div className="rounded-lg overflow-hidden shadow-sm h-[550px] sm:h-[550px] lg:h-[550px]">
              <iframe 
                src="https://player.cloudinary.com/embed/?cloud_name=dgagkq1cs&public_id=-dcd2-4f36-ab9a-a1a60e7f09b5_zfjgfi&profile=cld-adaptive-stream"
                className="w-full h-full object-cover"
                title="Video 5"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          
          {/* Sixth column - project video */}
          <div className="col-span-1">
            <div className="rounded-lg overflow-hidden shadow-sm h-[550px] sm:h-[550px] lg:h-[550px]">
              <iframe 
                src="https://player.cloudinary.com/embed/?cloud_name=dgagkq1cs&public_id=-dcd2-4f36-ab9a-a1a60e7f09b5_zfjgfi&profile=cld-adaptive-stream"
                className="w-full h-full object-cover"
                title="Video 6"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Standard project display component (existing carousel implementation)
const StandardProject = ({ 
  project, 
  carouselImages, 
  staticImages 
}: { 
  project: Project, 
  carouselImages: string[], 
  staticImages: string[] 
}) => {
  return (
    <>
      {/* Carousel Section */}
      <div className="relative w-full h-[400px] md:h-[600px] overflow-visible mb-8">
        <div className="absolute w-full top-1/3 -translate-y-1/2 flex justify-center items-center">
          {carouselImages.map((imageUrl, index) => {
            let className = "absolute transition-all duration-1000 ease-in-out ";
            let style: React.CSSProperties = { opacity: 0 };

            if (index === 0) {
              className += "w-[160px] h-[160px] md:w-[318px] md:h-[318px]";
              style = { 
                transform: 'translateX(-110%)', 
                opacity: 0.7,
                filter: 'brightness(0.7)'
              };
            } else if (index === 1) {
              className += "w-[240px] h-[240px] md:w-[531px] md:h-[531px] z-10";
              style = { 
                transform: 'translateX(0)', 
                opacity: 1,
                filter: 'brightness(1)'
              };
            } else if (index === 2) {
              className += "w-[160px] h-[160px] md:w-[318px] md:h-[318px]";
              style = { 
                transform: 'translateX(110%)', 
                opacity: 0.7,
                filter: 'brightness(0.7)'
              };
            }

            return (
              <div
                key={index}
                className={className}
                style={{
                  ...style,
                  transition: 'all 1000ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <img
                  src={imageUrl}
                  alt={`Project image ${index + 1}`}
                  className="w-full h-full rounded-lg shadow-xl object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Static Images */}
      {staticImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {staticImages.map((imageUrl, index) => (
            <div 
              key={index}
              className="aspect-square w-full overflow-hidden rounded-lg shadow-lg"
            >
              <img
                src={imageUrl}
                alt={`Project image ${index + 4}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [categoryProjects, setCategoryProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [staticImages, setStaticImages] = useState<string[]>([]);
  
  // Function to determine if this is a video editing project
  const isVideoEditingProject = (project: Project) => {
    // Check if this is our specific project ID
    if (project.id === "ca27e5f1-b557-4fa4-98a4-6adcc00094d8") return false; // Don't treat specific ID as a regular video project
    
    // You can determine this based on:
    // 1. Project type field if available
    if (project.type === "video_editing") return true;
    
    // 2. Category name or ID
    if (project.category?.name?.toLowerCase().includes("video") || 
        project.categoryId === "video-editing-category-id") return true;
    
    // 3. Media URL extension
    if (project.mediaUrl?.toLowerCase().endsWith(".mp4") || 
        project.mediaUrl?.toLowerCase().endsWith(".mov") ||
        project.mediaUrl?.toLowerCase().endsWith(".avi")) return true;
    
    return false;
  };
  
  // Function to check if this is our specific project
  const isSpecificProject = (project: Project) => {
    return project.id === "ca27e5f1-b557-4fa4-98a4-6adcc00094d8";
  };

  useEffect(() => {
    const fetchProjectAndRelated = async () => {
      try {
        setIsLoading(true);
        
        const projectResponse = await fetch(`https://totem-consultancy-alpha.vercel.app/api/projects/${id}`);
        
        if (!projectResponse.ok) {
          throw new Error('Failed to fetch project');
        }

        const projectData = await projectResponse.json();
        setProject(projectData);

        const allProjectsResponse = await fetch('https://totem-consultancy-alpha.vercel.app/api/projects');
        
        if (!allProjectsResponse.ok) {
          throw new Error('Failed to fetch related projects');
        }

        const allProjects = await allProjectsResponse.json();
        const relatedProjects = allProjects.filter(
          (p: Project) => p.categoryId === projectData.categoryId
        );
        
        setCategoryProjects(relatedProjects);

        // Split images into carousel and static
        const allImages = relatedProjects.map((p: Project) => p.mediaUrl);
        setCarouselImages(allImages.slice(0, 3));  // Only first 3 for carousel
        setStaticImages(allImages.slice(3));       // Rest are static

      } catch (err) {
        setError('Failed to load project');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProjectAndRelated();
    }
  }, [id]);

  useEffect(() => {
    if (carouselImages.length === 3) {  // Only run carousel if we have exactly 3 images
      const interval = setInterval(() => {
        setCarouselImages(prev => {
          const newImages = [...prev];
          const firstImage = newImages.shift();
          if (firstImage) newImages.push(firstImage);
          return newImages;
        });
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [carouselImages.length]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="w-full min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
          <button 
            onClick={() => navigate('/projects')}
            className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors duration-300"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const showVideoEditingComponent = isVideoEditingProject(project);
  const showSpecificComponent = isSpecificProject(project);

  return (
    <div className={`w-full min-h-screen ${showSpecificComponent ? 'bg-[#FDF8F3]' : showVideoEditingComponent ? 'bg-[#FDF8F3]' : 'bg-[#FDF8F3]'} py-16`}>
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/projects')}
            className={`px-6 py-2 ${(showVideoEditingComponent || showSpecificComponent) ? 
              'border border-black text-black hover:bg-black hover:text-white' : 
              'border border-black hover:bg-black hover:text-white'} transition-colors duration-300`}
          >
            ← Back to Projects
          </button>
        </div>

        {showSpecificComponent ? (
          <SpecificVideoProject 
            project={project}
            categoryProjects={categoryProjects}
          />
        ) :  (
          <StandardProject 
            project={project}
            carouselImages={carouselImages}
            staticImages={staticImages}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;