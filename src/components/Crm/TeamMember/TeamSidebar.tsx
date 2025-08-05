import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  Users, 
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
  Home,
  UserRoundCheck,
  Bell,
} from "lucide-react";

import profile from '../../Admin/assets/assets/profile.png'

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentPath: string;
  userRole: string | null;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  currentPath,
  userRole = "team",
}: SidebarProps) {
  const navigate = useNavigate();
  const [expandedDropdowns, setExpandedDropdowns] = useState<Record<string, boolean>>({
    Projects: false,
  });
  
  // Notification bell state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("teamTaskNotifications");
    return saved ? JSON.parse(saved) : [];
  });
  const [unreadCount, setUnreadCount] = useState(() => notifications.length);

  useEffect(() => {
    // Listen for notification changes in localStorage (from TeamTask page)
    const handleStorage = () => {
      const saved = localStorage.getItem("teamTaskNotifications");
      setNotifications(saved ? JSON.parse(saved) : []);
      setUnreadCount(saved ? JSON.parse(saved).length : 0);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (showNotifications) setUnreadCount(0);
  }, [showNotifications]);

  // Format date utility
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  useEffect(() => {
    // Only block scrolling on mobile when sidebar is open
    if (sidebarOpen && window.innerWidth < 1024) { // 1024px is lg breakpoint in Tailwind
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [sidebarOpen]);

  const roleBasePath = `/crm/${userRole}`;

  // Initialize expanded state based on current path
  useEffect(() => {
    if (currentPath.includes('/projects') || currentPath.includes('/task')) {
      setExpandedDropdowns(prev => ({
        ...prev,
        Projects: true
      }));
    }
  }, [currentPath]);

  const toggleDropdown = (key: string) => {
    setExpandedDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper function to check if a path is active
  const isPathActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 transition-all duration-300 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        w-[240px] shadow-lg z-50 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center p-6 h-20 relative">
        <Link to={roleBasePath} className="flex items-center">
          <div className="h-10 w-8 mr-3">
            <img src={profile} alt="Totem" className="h-full w-full" />
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-white">
            TOTEM
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="ml-2 lg:hidden text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1">
        {/* MAIN MENU Section */}
        <div className="px-4 py-2">
          <div className="text-xs font-medium text-gray-500 mb-2 px-3">MAIN MENU</div>
          
          <Link
            to={`/crm/team/dashboard`}
            className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors mb-1 ${
              isPathActive('/crm/team/dashboard')
                ? "font-medium text-gray-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Home 
              size={18} 
              className={isPathActive('/crm/team/dashboard') ? "font-bold" : "group-hover:text-white"} 
            />
            <span className="ml-3">Dashboard</span>
          </Link>
          
          {/* <Link
            to={`/crm/team/clients`}
            className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors mb-1 ${
              isPathActive('/crm/team/clients')
                ? "font-medium text-gray-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Users 
              size={18} 
              className={isPathActive('/crm/team/clients') ? "font-bold" : "group-hover:text-white"} 
            />
            <span className="ml-3">Clients</span>
          </Link> */}
          
          {/* Projects with dropdown */}
          <div className="mb-1">
            <button
              onClick={() => toggleDropdown('Projects')}
              className={`group flex items-center justify-between w-full px-10 py-2 rounded-lg transition-colors ${
                isPathActive('/crm/team/projects') || isPathActive('/crm/team/task')
                  ? "font-medium text-gray-700 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <Users 
                  size={18} 
                  className={(isPathActive('/crm/team/projects') || isPathActive('/crm/team/task')) ? "font-bold" : "group-hover:text-white"} 
                />
                <span className="ml-3">Projects</span>
              </div>
              {expandedDropdowns.Projects ? (
                <ChevronDown 
                  size={16} 
                  className={(isPathActive('/crm/team/projects') || isPathActive('/crm/team/task')) ? "font-bold" : "group-hover:text-white"} 
                />
              ) : (
                <ChevronRight 
                  size={16} 
                  className={(isPathActive('/crm/team/projects') || isPathActive('/crm/team/task')) ? "font-bold" : "group-hover:text-white"} 
                />
              )}
            </button>
            
            {expandedDropdowns.Projects && (
              <div className="ml-6 mt-1 space-y-1">
                <Link
                  to={`/crm/team/projects`}
                  className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors ${
                    isPathActive('/crm/team/projects')
                      ? "font-medium text-gray-700 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span>Projects</span>
                </Link>
                <Link
                  to={`/crm/team/task`}
                  className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors ${
                    isPathActive('/crm/team/task')
                      ? "font-medium text-gray-700 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span>Tasks</span>
                </Link>
              </div>
            )}
          </div>
          
          {/* <Link
            to={`/crm/team/team`}
            className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors mb-1 ${
              isPathActive('/crm/team/team')
                ? "font-medium text-gray-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <UserRoundCheck 
              size={18} 
              className={isPathActive('/crm/team/team') ? "font-bold" : "group-hover:text-white"} 
            />
            <span className="ml-3">Team</span>
          </Link> */}
        </div>
        
        
      </div>
      
      {/* Logout button at bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            localStorage.removeItem("crmAuthenticated");
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            navigate("/crm/login");
            setSidebarOpen(false);
          }}
          className="group flex items-center w-full px-10 py-2 text-red-600 hover:bg-black hover:text-white rounded-lg"
        >
          <LogOut 
            size={18} 
            className="group-hover:text-white" 
          />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </aside>
  );
}