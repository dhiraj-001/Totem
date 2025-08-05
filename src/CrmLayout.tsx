import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
// import CrmLogin from './components/Crm/Login';
import AdminLogin from './components/Crm/Admin/AdminLogin'; 
import Navbar from './components/Crm/Navbar';
import Sidebar from "./components/Crm/Sidebar";
import Dashboard from './components/Crm/Admin/Dashboard';
import DashboardTeam from "./components/Crm/TeamMember/DashboardTeam";

// Import admin components
import AdminClientManagement from './components/Crm/Admin/AdminClient/ClientManagent';
import AdminContactManagement from './components/Crm/Admin/ContactManagement';
import AdminProjectManagement from './components/Crm/Admin/ProjectManagement';
// import AdminTaskManagement from './components/Crm/Admin/TaskManagement';
import Settings from './components/Crm/Admin/Settings'
import ClientProfile from './components/Crm/Admin/AdminClient/ClientProfile'
import PropsalGeneration from "./components/Crm/Admin/PropsalGeneration";
import InvoiceGeneration from "./components/Crm/Admin/InvoiceGeneration";
import Contract from "./components/Crm/Admin/Contract";
import Signup from './components/Crm/Signup'

import AdminTeamManagement from './components/Crm/Admin/AdminTeam/AdminTeamManagement'
import Team1 from './components/Crm/Admin/AdminTeam/Team1'
import Team2 from './components/Crm/Admin/AdminTeam/Team2'
import Team3 from './components/Crm/Admin/AdminTeam/Team3'
import ExpenseManagement from "./components/Crm/Admin/ExpenseManagement";
import AssetsManagement from "./components/Crm/Admin/AssetsManagement";
import Sales from "./components/Crm/Admin/HR/Sales/Sales";
import Leads from "./components/Crm/Admin/HR/Leads";
import Finance from "./components/Crm/Admin/HR/Finance/Finance";
import KPI from "./components/Crm/Admin/HR/KPI";
import UserLogin from "./components/Crm/Manager/UserLogin";
import ManagerDashboard from "./components/Crm/Manager/ManagerDashboard";

// Import manager components
import ManagerClientManagement from './components/Crm/Manager/AdminClient/ManagerClientManagent';
import ManagerSidebar from "./components/Crm/Manager/ManagerSidebar";
import ManagerClientProfile from "./components/Crm/Manager/AdminClient/ManagerClientProfile";
import ManagerProject from "./components/Crm/Manager/ManagerProject";
import ManagerTask from "./components/Crm/Manager/ManagerTask";
import ManagerTeamManagement from "./components/Crm/Manager/ManagerTeam/ManagerTeamManagement";
import MTeam1 from "./components/Crm/Manager/ManagerTeam/MTeam1";
import MTeam2 from "./components/Crm/Manager/ManagerTeam/MTeam2";
import MTeam3 from "./components/Crm/Manager/ManagerTeam/MTeam3";
import ManagerSales from "./components/Crm/Manager/HR/Sales/ManagerSales";
import ManagerLeads from "./components/Crm/Manager/HR/ManagerLeads";
import ManagerFinance from "./components/Crm/Manager/HR/Finance/ManagerFinance";
import ManagerKPI from "./components/Crm/Manager/HR/ManagerKPI";
import TeamSidebar from "./components/Crm/TeamMember/TeamSidebar";
import TeamProject from "./components/Crm/TeamMember/TeamProject";
import TeamTask from "./components/Crm/TeamMember/TeamTask";
import TaskManagement from "./components/Crm/Admin/TaskManagement";
import AdminAttendance from "./components/Crm/Admin/AdminAttendance";
import ManagerAttendance from "./components/Crm/Manager/ManagerAttendance";
import Team4 from "./components/Crm/Admin/AdminTeam/Team4";
import Team5 from "./components/Crm/Admin/AdminTeam/Team5";
import Team6 from "./components/Crm/Admin/AdminTeam/Team6";


interface LayoutProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

type UserRole = "admin" | "manager" | "team" | null;

const ROLE_BASE_PATHS: Record<NonNullable<UserRole>, string> = {
  admin: "/crm/admin",
  manager: "/crm/manager/dashboard",
  team: "/crm/team/dashboard"
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("crmAuthenticated") === "true" && localStorage.getItem("token");
  const location = useLocation();
  const userRole = localStorage.getItem("userRole") as UserRole;

  if (!isAuthenticated) {
    localStorage.removeItem("crmAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    
    // Redirect to the appropriate login page based on the attempted path
    const pathParts = location.pathname.split('/');
    if (pathParts.includes('admin')) {
      return <Navigate to="/crm/admin/login" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/crm/login" state={{ from: location }} replace />;
    }
    
  }

  const currentPath = location.pathname;
  const pathParts = currentPath.split('/');
  if (pathParts[1] === 'crm' && pathParts[2] && pathParts[2] !== userRole && 
     !['login', 'admin'].includes(pathParts[2])) {
    return <Navigate to={ROLE_BASE_PATHS[userRole || "admin"]} replace />;
  }

  return <>{children}</>;
};

const CrmRoutes = ({ darkMode, setDarkMode }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const userRole = localStorage.getItem("userRole") as UserRole;

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-800/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {userRole === "manager" ? (
        <ManagerSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentPath={location.pathname}
          userRole={null}
        />
      ) : userRole === "admin" ? (
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentPath={location.pathname}
          userRole={userRole}
        />
      ) : (
        <TeamSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentPath={location.pathname}
          userRole={userRole}
        />
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 lg:ml-[240px]">
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          userRole={userRole}
        />

        <main className={`flex-1 overflow-y-auto overflow-x-hidden pt-16 ${
  darkMode 
    ? 'bg-gray-900' 
    : userRole === 'team' 
      ? 'bg-gray-50' 
      : 'bg-pink-50'
}`}>
          <div className="p-4 lg:p-6">
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/crm/signup" element={<Signup />} />
              <Route path="/admin/clients" element={<AdminClientManagement />} />
              <Route path="/admin/personal-details/:id" element={<ClientProfile />} />
              <Route path="/admin/contacts" element={<AdminContactManagement />} />
              <Route path="/admin/projects" element={<AdminProjectManagement />} />
              <Route path="/admin/tasks" element={<TaskManagement />} />
              <Route path="/admin/team" element={<AdminTeamManagement />} />
              <Route path="/admin/teamprofile/:id" element={<Team1/>}/>
              <Route path="/admin/team/personal/:id" element={<Team2 />} />
              <Route path="/admin/team/employment/:id" element={<Team3 />} />
              <Route path="/admin/team/kpi/:id" element={<Team4 />} />
              <Route path="/admin/team/attendance/:id" element={<Team5 />} />
              <Route path="/admin/team/bank/:id" element={<Team6 />} />

              {/* HR Department */}
              <Route path="/admin/sales" element={<Sales />} />
              <Route path="/admin/leads" element={<Leads />} />
              <Route path="/admin/finance" element={<Finance />} />
              <Route path="/admin/kpis" element={<KPI />} />

              <Route path="/admin/expenses" element={<ExpenseManagement />} />
              <Route path="/admin/assets" element={<AssetsManagement />} />

              <Route path="/admin/proposal" element={<PropsalGeneration />} />
              <Route path="/admin/invoice" element={<InvoiceGeneration />} />
              <Route path="/admin/contract" element={<Contract />} />
              <Route path="/admin/attendance" element={<AdminAttendance />} />
              <Route path="/admin/settings" element={<Settings />} />

              {/* Manager Routes */}
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/manager/clients" element={<ManagerClientManagement />} />
              <Route path="/manager/personal-details/:id" element={<ManagerClientProfile />} />
              <Route path="/manager/projects" element={<ManagerProject />} />
              <Route path="/manager/task" element={<ManagerTask />} />
              <Route path="/manager/team" element={<ManagerTeamManagement />} />
              <Route path="/manager/teamprofile/:id" element={<MTeam1/>}/>
              <Route path="/manager/team/personal/:id" element={<MTeam2 />} />
              <Route path="/manager/team/employment/:id" element={<MTeam3 />} />
              <Route path="/manager/team/kpi/:id" element={<MTeam3 />} />
              <Route path="/manager/team/attendance/:id" element={<MTeam3 />} />
              <Route path="/manager/team/bank/:id" element={<MTeam3 />} />
              

              <Route path="/manager/sales" element={<ManagerSales />} />
              <Route path="/manager/leads" element={<ManagerLeads />} />
              <Route path="/manager/finance" element={<ManagerFinance />} />
              <Route path="/manager/kpis" element={<ManagerKPI />} />
              <Route path="/manager/attendance" element={<ManagerAttendance />} />

              {/* Team Member Routes */}
              <Route path="/team/dashboard" element={<DashboardTeam />} />
              <Route path="/team/clients" element={<AdminClientManagement />} />
              <Route path="/team/personal-details/:id" element={<ClientProfile />} />
              <Route path="/team/projects" element={<TeamProject />} />
              <Route path="/team/task" element={<TeamTask />} />
              
              
              {/* Default Redirect */}
              <Route
                path="*"
                element={
                  <Navigate
                    to={ROLE_BASE_PATHS[userRole || "admin"]}
                    replace
                  />
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default function CrmLayout({ darkMode, setDarkMode }: LayoutProps) {
  const userRole = localStorage.getItem("userRole") as UserRole;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to={ROLE_BASE_PATHS[userRole || "admin"]} replace />
          </ProtectedRoute>
        }
      />

      {/* Regular login for team members and managers */}
      <Route
        path="/login"
        element={
          localStorage.getItem("crmAuthenticated") === "true" && 
          localStorage.getItem("token") ? (
            <Navigate to={ROLE_BASE_PATHS[userRole || "admin"]} replace />
          ) : (
            <UserLogin />
          )
        }
      />

      {/* Admin login route */}
      <Route
        path="/admin/login"
        element={
          localStorage.getItem("crmAuthenticated") === "true" && 
          localStorage.getItem("token") && 
          localStorage.getItem("userRole") === "admin" ? (
            <Navigate to="/crm/admin" replace />
          ) : (
            <AdminLogin />
          )
        }
      />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <CrmRoutes darkMode={darkMode} setDarkMode={setDarkMode} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}