import React, { useState, useEffect } from 'react';
import { 
  Clock,
  Circle,
  Activity,
} from 'lucide-react';

interface ActivityItem {
  id: number;
  action: string;
  changesBy: string;
  createdAt: string;
  updatedAt: string;
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch('https://totem-consultancy-alpha.vercel.app/api/recent', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          throw new Error('Unauthorized: Please login again');
        }

        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }

        const data = await response.json();
        setActivities(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load recent activities');
        }
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (action: string) => {
    const iconProps = { className: 'h-4 w-4' };
    
    if (action.toLowerCase().includes('created') || action.toLowerCase().includes('added')) {
      return <Circle {...iconProps} className="text-blue-500" />;
    } else if (action.toLowerCase().includes('deleted')) {
      return <Circle {...iconProps} className="text-red-400" />;
    } else if (action.toLowerCase().includes('updated')) {
      return <Circle {...iconProps} className="text-green-500" />;
    } else {
      return <Circle {...iconProps} className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex justify-center items-center">
          <Activity className="h-5 w-5 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-500">Loading activities...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Activity</h2>
          <Clock className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                {getActivityIcon(activity.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.changesBy}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(activity.createdAt)}
                  </span>
                </div>
                
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {activity.action}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;