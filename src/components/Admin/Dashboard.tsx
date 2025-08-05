import {
  Book,
  Users,
  Award,
  Settings,
  Star,
} from "lucide-react";
import { useEffect,useState } from "react";

interface QuickAction {
  title: string;
  icon: JSX.Element;
  bgColor: string;
  description: string;
  route: string;
}
interface Category {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  projects: any[]; // We don't need the full Project interface since we're not using it
}

export default function Dashboard(): JSX.Element {
  const [totalProjects, setTotalProjects] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTeamMembers, setTotalTeamMembers] = useState<number>(0);
  const [totalCertificates, setTotalCertificates] = useState<number>(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://totem-consultancy-beta.vercel.app/api/categories');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: Category[] = await response.json();
        // Simply count the number of categories since each category is a project
        const projectCount = data.length;
        
        setTotalProjects(projectCount);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('https://totem-consultancy-beta.vercel.app/api/team');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setTotalTeamMembers(data.length);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };
  
    fetchTeamMembers();
  }, []);
  
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch('https://totem-consultancy-beta.vercel.app/api/certificates');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setTotalCertificates(data.length);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      }
    };
  
    fetchCertificates();
  }, []);

  const quickActions: QuickAction[] = [
    { 
      title: "Edi Reviews", 
      icon: <Star className="h-8 w-8 text-purple-600" />,
      bgColor: "bg-purple-100 dark:bg-purple-900",
      description: "Manage course reviews and student feedback",
      route: "/admin/edit-reviews"
    },
    { 
      title: "Manage Team", 
      icon: <Users className="h-8 w-8 text-yellow-600" />,
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
      description: "Manage team member information and roles",
      route: "/admin/add-team"
    },
    { 
      title: "Update Pricing", 
      icon: <Settings className="h-8 w-8 text-green-600" />,
      bgColor: "bg-green-100 dark:bg-green-900",
      description: "Update course pricing and special offers",
      route: "/admin/pricing"
    },
    { 
      title: "Generate Certificate", 
      icon: <Award className="h-8 w-8 text-blue-600" />,
      bgColor: "bg-blue-100 dark:bg-blue-900",
      description: "Create and issue course completion certificates",
      route: "/admin/certificate"
    }
  ];

  const handleActionClick = (route: string): void => {
    window.location.href = route;
  };

  return (
    <main className="px-4 md:px-6 lg:px-8 xl:px-12 pb-12 bg-gray-50 dark:bg-gray-900 min-h-screen lg:h-screen">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
              Dashboard
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-blue-600">Overview</span>
            </div>
          </div>
        </div>

        {/* Existing Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-6 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Book className="h-12 w-12 text-blue-600" />
              </div>
              <div className="ml-6">
              <h3 className="text-3xl xl:text-4xl font-bold text-gray-800 dark:text-white">
                  {isLoading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : error ? (
                    <span className="text-red-500">Error</span>
                  ) : (
                    totalProjects
                  )}
                </h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                  Total Projects
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-6 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                <Users className="h-12 w-12 text-yellow-600" />
              </div>
              <div className="ml-6">
              <h3 className="text-3xl xl:text-4xl font-bold text-gray-800 dark:text-white">
  {isLoading ? (
    <span className="text-gray-400">Loading...</span>
  ) : error ? (
    <span className="text-red-500">Error</span>
  ) : (
    totalTeamMembers
  )}
</h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                  Team Members
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-6 bg-green-100 dark:bg-green-900 rounded-xl">
                <Award className="h-12 w-12 text-green-600" />
              </div>
              <div className="ml-6">
                <h3 className="text-3xl xl:text-4xl font-bold text-gray-800 dark:text-white">
  {isLoading ? (
    <span className="text-gray-400">Loading...</span>
  ) : error ? (
    <span className="text-red-500">Error</span>
  ) : (
    totalCertificates
  )}
</h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                  Certificates Issued
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quick Actions</h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
              {quickActions.map((action, index) => (
                <div 
                  key={index}
                  onClick={() => handleActionClick(action.route)}
                  className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer hover:shadow-lg"
                >
                  <div className={`w-16 h-16 ${action.bgColor} rounded-xl flex items-center justify-center mb-6`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                    {action.title}
                  </h3>
                  <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}