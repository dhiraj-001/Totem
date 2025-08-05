import { useState, useRef, useEffect } from "react";
import { Menu, Bell, Sun, Moon, Settings, LogOut } from "lucide-react";
import profile from '../Admin/assets/assets/profile.png';
import { useNavigate } from "react-router-dom";

// Add UserRole type definition
type UserRole = "admin" | "manager" | "team" | null;

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  userRole: UserRole;
}

interface RecentActivity {
  id: number;
  action: string;
  changesBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function Navbar({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  setDarkMode,
  userRole
}: NavbarProps) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [seenNotifications, setSeenNotifications] = useState<Set<number>>(
    () => {
      const stored = localStorage.getItem("seenNotifications");
      return new Set(stored ? JSON.parse(stored) : []);
    }
  );
  const [newActivitiesCount, setNewActivitiesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const lastFetchedIdsRef = useRef<Set<number>>(new Set());

  const fetchRecentActivities = async () => {
    // Don't fetch if notifications panel is open
    if (showNotifications) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://totem-consultancy-beta.vercel.app/api/recent", // Replace with your actual API endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Data is not an array");
      }

      const sortedActivities = [...data].sort((a, b) => b.id - a.id);
      setRecentActivities(sortedActivities);

      // Calculate new activities (only those that haven't been seen)
      const newCount = sortedActivities.filter(
        (activity) => !seenNotifications.has(activity.id)
      ).length;

      setNewActivitiesCount(newCount);
      lastFetchedIdsRef.current = new Set(sortedActivities.map((a) => a.id));
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);

      if (errorMessage.includes("authentication")) {
        localStorage.removeItem("token");
        navigate("/crm/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark all current notifications as seen
      const newSeen = new Set(seenNotifications);
      recentActivities.forEach((activity) => {
        newSeen.add(activity.id);
      });
      setSeenNotifications(newSeen);
      localStorage.setItem("seenNotifications", JSON.stringify([...newSeen]));
      setNewActivitiesCount(0);
    }
  };

  useEffect(() => {
    fetchRecentActivities();

    const interval = setInterval(() => {
      fetchRecentActivities();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [showNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSettings = () => {
    navigate("/crm/settings");
    setIsDropdownOpen(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <header className="bg-white dark:bg-gray-800 h-16 fixed top-0 right-0 left-0 z-40 px-4 lg:px-6">
      <div className="h-full max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 dark:text-gray-300 lg:hidden"
          >
            <Menu size={24} />
          </button>
          <div className="hidden lg:block text-xl font-semibold text-gray-800 dark:text-white">
            Your Brand
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 p-2"
          >
            {darkMode ? (
              <Sun className="h-6 w-6 text-gray-800 dark:text-gray-200" />
            ) : (
              <Moon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
            )}
          </button>

          <div className="relative" ref={notificationRef}>
            {/* <button
              onClick={handleNotificationClick}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
            >
              <Bell size={20} />
              {isLoading && !showNotifications && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-blue-500 rounded-full"></span>
              )}
              {newActivitiesCount > 0 && !isLoading && !showNotifications && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {newActivitiesCount}
                </span>
              )}
            </button> */}

            {showNotifications && (
              <div className="fixed sm:absolute left-0 sm:left-auto right-0 sm:right-0 top-16 sm:top-auto sm:mt-2 w-full sm:w-80 bg-white dark:bg-gray-800 shadow-lg py-1 z-50 sm:rounded-lg sm:border border-gray-200 dark:border-gray-700 max-h-[70vh] sm:max-h-96 overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 py-2 px-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Notifications
                  </h3>
                </div>

                {error ? (
                  <p className="px-4 py-3 text-sm text-red-500 dark:text-red-400">
                    Error: {error}
                  </p>
                ) : isLoading ? (
                  <p className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    Loading...
                  </p>
                ) : recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 ${
                        !seenNotifications.has(activity.id)
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                        {activity.action}
                      </p>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          By: {activity.changesBy}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    No recent activities
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <img
                src={profile}
                alt="Profile"
                className="h-7 w-7 rounded-full cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all object-cover"
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                {/* <button
                  onClick={handleSettings}
                  className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button> */}
                <button
                  onClick={() => {
                    localStorage.removeItem("isAuthenticated");
                    localStorage.removeItem("token");
                    navigate("/crm/login");
                    setSidebarOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}