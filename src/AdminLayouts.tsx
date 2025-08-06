import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Admin/Sidebar";
import Navbar from "./components/Admin/Navbar";
import Dashboard from "./components/Admin/Dashboard";
import EditReview from "./components/Admin/SidebarContents/EditReview";
import TeamMember from "./components/Admin/SidebarContents/TeamMember";
import Pricing from "./components/Admin/SidebarContents/Pricing";
import Project from "./components/Admin/SidebarContents/Project";
import Certificate from "./components/Admin/SidebarContents/Certificate";
import RecentActivity from "./components/Admin/SidebarContents/RecentActivity";
import Login from "./components/Admin/Login";
import Settings from "./components/Admin/SidebarContents/Settings";
import ContactForm from "./components/Admin/SidebarContents/ContactForm";
import Testimonials from "./components/home/Testimonials";
import TestimonialManager from "./components/Admin/SidebarContents/Testimonial";
import Contacts from "./components/Admin/SidebarContents/Contacts";
import InvoicePDFGenerator from "./components/Crm/Admin/InvoicePDFGenerator";

interface LayoutProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AdminRoutes = ({ darkMode, setDarkMode }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-800/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentPath={location.pathname}
      />

      <div className="transition-all duration-300 lg:ml-[280px]">
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="p-4 lg:p-6">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/edit-reviews" element={<EditReview />} />
              <Route path="/add-team" element={<TeamMember />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/new-project" element={<Project />} />
              <Route path="/certificate" element={<Certificate />} />
              <Route path="/admin-contact" element={<Contacts />} />
              <Route path="/testimonial" element={<TestimonialManager />} />
              <Route path="/recent-activity" element={<RecentActivity />} />
              <Route path="/settings" element={<Settings />} />
              
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
};

export default function Layout({ darkMode, setDarkMode }: LayoutProps) {
  return (
    <Routes>
      {/* Root admin route - redirects to dashboard if authenticated */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        }
      />

      {/* Login route */}
      <Route
        path="/login"
        element={
          localStorage.getItem("isAuthenticated") === "true" ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Protected admin routes with sidebar and navbar */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminRoutes darkMode={darkMode} setDarkMode={setDarkMode} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}