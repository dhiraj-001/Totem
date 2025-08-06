import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase,
  FileText,
  UserCog,
  CreditCard,
  BarChart3,
  DollarSign,
  Settings,
  Box,
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
  Home,
  UserRoundCheck,
  ClipboardList,
  CheckSquare,
  CalendarCheck
} from "lucide-react";

import profile from '../Admin/assets/assets/profile.png'

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

  const toggleDropdown = (key: string) => {
    setExpandedDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 transition-all duration-300 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        w-[240px] shadow-lg z-50 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center p-6 h-20">
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
          className="ml-auto lg:hidden text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation with custom scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* MAIN MENU Section */}
        <div className="px-4 py-2">
          <div className="text-xs font-medium text-gray-500 mb-2 px-3">MAIN MENU</div>
          
          <Link
            to={roleBasePath}
            className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors mb-1 ${
              currentPath === roleBasePath
                ? "font-medium text-gray-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Home 
              size={18} 
              className={currentPath === roleBasePath ? "font-extrabold" : "group-hover:text-white"} 
            />
            <span className="ml-3">Dashboard</span>
          </Link>
          
          <Link
            to={`${roleBasePath}/clients`}
            className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors mb-1 ${
              currentPath.includes('/clients')
                ? "font-medium text-gray-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Users 
              size={18} 
              className={currentPath.includes('/clients') ? "font-extrabold" : "group-hover:text-white"} 
            />
            <span className="ml-3">Clients</span>
          </Link>
          
          {/* Projects with dropdown */}
          <div className="mb-1">
            <button
              onClick={() => toggleDropdown('Projects')}
              className={`group flex items-center justify-between w-full px-10 py-2 rounded-lg transition-colors ${
                currentPath.includes('/crm/admin/projects')
                  ? "font-medium text-gray-700 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <Users 
                  size={18} 
                  className={currentPath.includes('/projects') ? "font-extrabold" : "group-hover:text-white"} 
                />
                <span className="ml-3">Projects</span>
              </div>
              {expandedDropdowns.Projects ? (
                <ChevronDown 
                  size={16} 
                  className={currentPath.includes('/projects') ? "font-extrabold" : "group-hover:text-white"} 
                />
              ) : (
                <ChevronRight 
                  size={16} 
                  className={currentPath.includes('/projects') ? "font-extrabold" : "group-hover:text-white"} 
                />
              )}
            </button>
            
            {expandedDropdowns.Projects && (
              <div className="ml-6 mt-1 space-y-1">
                <Link
                  to={`${roleBasePath}/projects`}
                  className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors ${
                    currentPath.includes('/crm/admin/projects')
                      ? "font-medium text-gray-700 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span>Projects</span>
                </Link>
                <Link
                  to={`${roleBasePath}/tasks`}
                  className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors ${
                    currentPath.includes('/crm/admin/projects')
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
          
          <Link
            to={`${roleBasePath}/team`}
            className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors mb-1 ${
              currentPath.includes('/team')
                ? "font-medium text-gray-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <UserRoundCheck 
              size={18} 
              className={currentPath.includes('/team') ? "font-extrabold" : "group-hover:text-white"} 
            />
            <span className="ml-3">Team</span>
          </Link>

          {/* Invoice PDF Generator Link - only for admin */}
          {userRole === 'admin' && (
            <Link
              to="/crm/admin/invoice-pdf-generator"
              className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors mb-1 ${
                currentPath === '/crm/invoice-pdf-generator'
                  ? "font-medium text-gray-700 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <FileText size={18} className={currentPath === '/crm/invoice-pdf-generator' ? "font-extrabold" : "group-hover:text-white"} />
              <span className="ml-3">Invoice </span>
            </Link>
          )}
        </div>
        
        {/* HR Section */}
        <div className="px-4 py-2 mt-2">
          <div className="text-xs font-medium text-gray-500 mb-2 px-3">HR</div>
          
          <Link
            to={`${roleBasePath}/leads`}
            className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors mb-1 ${
              currentPath.includes('/leads')
                ? "font-medium text-gray-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <ClipboardList 
              size={18} 
              className={currentPath.includes('/leads') ? "font-extrabold" : "group-hover:text-white"} 
            />
            <span className="ml-3">Leads</span>
          </Link>
          
          <Link
            to={`${roleBasePath}/sales`}
            className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors mb-1 ${
              currentPath.includes('/sales')
                ? "font-medium text-gray-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <DollarSign 
              size={18} 
              className={currentPath.includes('/sales') ? "font-extrabold" : "group-hover:text-white"} 
            />
            <span className="ml-3">Sales</span>
          </Link>
          
          <Link
            to={`${roleBasePath}/kpis`}
            className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors mb-1 ${
              currentPath.includes('/kpis')
                ? "font-medium text-gray-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <BarChart3 
              size={18} 
              className={currentPath.includes('/kpis') ? "font-extrabold" : "group-hover:text-white"} 
            />
            <span className="ml-3">KPI'S</span>
          </Link>
          
          <Link
            to={`${roleBasePath}/finance`}
            className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors mb-1 ${
              currentPath.includes('/finance')
                ? "font-medium text-gray-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <DollarSign 
              size={18} 
              className={currentPath.includes('/finance') ? "font-extrabold" : "group-hover:text-white"} 
            />
            <span className="ml-3">Finance</span>
          </Link>
        </div>
        
        {/* ADMINISTRATION Section */}
        <div className="px-4 py-2 mt-2">
          <div className="text-xs font-medium text-gray-500 mb-2 px-3">ADMINISTRATION</div>
          
          <Link
            to={`${roleBasePath}/expenses`}
            className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors mb-1 ${
              currentPath.includes('/expenses')
                ? "font-medium text-gray-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <CreditCard 
              size={18} 
              className={currentPath.includes('/expenses') ? "font-extrabold" : "group-hover:text-white"} 
            />
            <span className="ml-3">Expenses</span>
          </Link>
          
          <Link
            to={`${roleBasePath}/assets`}
            className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors mb-1 ${
              currentPath.includes('/assets')
                ? "font-medium text-gray-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Box 
              size={18} 
              className={currentPath.includes('/assets') ? "font-extrabold" : "group-hover:text-white"} 
            />
            <span className="ml-3">Assets</span>
          </Link>
          
          <Link
            to={`${roleBasePath}/attendance`}
            className={`group flex items-center w-full px-10 py-2 rounded-lg transition-colors mb-1 ${
              currentPath.includes('attendance')
                ? "font-medium text-gray-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <CalendarCheck 
              size={18} 
              className={currentPath.includes('/admin/attendance') ? "font-extrabold" : "group-hover:text-white"} 
            />
            <span className="ml-3">Attendance</span>
          </Link>
        </div>
      </div>
      
      {/* Logout button at bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            localStorage.removeItem("crmAuthenticated");
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            navigate("/crm/admin/login");
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

      {/* Custom scrollbar styles - invisible with hover reveal */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 10px;
          transition: background-color 0.3s;
        }
        
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(113, 128, 150, 0.3);
        }
        
        .custom-scrollbar:hover::-webkit-scrollbar-thumb:hover {
          background: rgba(113, 128, 150, 0.5);
        }
        
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        
        .custom-scrollbar:hover {
          scrollbar-color: rgba(113, 128, 150, 0.3) transparent;
        }
      `}</style>
    </aside>
  );
}