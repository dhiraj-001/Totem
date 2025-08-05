import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  mediaUrl: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

const PortfolioShowcase = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch both categories and projects
      const [categoriesResponse, projectsResponse] = await Promise.all([
        fetch('https://totem-consultancy-alpha.vercel.app/api/categories'),
        fetch('https://totem-consultancy-alpha.vercel.app/api/projects')
      ]);

      if (!categoriesResponse.ok || !projectsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const categoriesData = await categoriesResponse.json();
      const projectsData = await projectsResponse.json();

      setCategories(categoriesData);
      setProjects(projectsData);
    } catch (err) {
      setError('Failed to load content. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = (categoryId: string) => {
    // Find the first project for this category
    const project = projects.find(p => p.categoryId === categoryId);
    if (project) {
      navigate(`/project/${project.id}`); // Use the project ID, not category ID
    } else {
      console.error('No project found for category:', categoryId);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-red-600 text-center p-4">
          <p className="text-xl">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-6 py-2 border border-black hover:bg-black hover:text-white transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FDF8F3] -mt-8 -mb-8">
      <div className="max-w-[1000px] mx-auto px-4 py-12">
        <div className="text-center mb-20">
          <h1 className="text-[2.8rem] md:text-[3.8rem] font-bold leading-tight mt-14">
            Transforming Visions
            <br />
            into Reality
          </h1>
          <p className="text-gray-700 text-lg mt-5 max-w-2xl mx-auto">
            Discover the experiences of our clients and how we've made an impact on their projects.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-20 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-12 justify-items-center mb-28">
          {categories.map((category) => {
            const categoryProject = projects.find(p => p.categoryId === category.id);
            
            return (
              <div
                key={category.id}
                className="flex flex-col items-center md:p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow w-full max-w-[320px]"
              >
                <div className="w-full aspect-[320/225] mb-6 overflow-hidden">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h2 className="text-2xl font-semibold mb-5">{category.name}</h2>

                <button
                  className="w-full max-w-[290px] py-3 border border-black hover:bg-black hover:text-white transition-colors duration-300"
                  onClick={() => categoryProject && handleClick(category.id)}
                  disabled={!categoryProject}
                >
                  {categoryProject ? 'View' : 'No Projects Available'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PortfolioShowcase;