import { useState, useEffect } from 'react';
import { FunnelChart, Funnel, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const LeadStatusChart = () => {
  const [leadsData, setLeadsData] = useState([]);
  const [statusCounts, setStatusCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Status color mapping
  const statusColors = {
    'NON_CONTACTED': '#EF4444', // Red
    'CONTACTED': '#F97316',     // Orange
    'INTERESTED': '#FBBF24',    // Yellow
    'QUALIFIED': '#38BDF8',     // Light Blue
    'CONVERTED': '#22C55E',     // Green
    'DISQUALIFIED': '#6B7280',  // Gray
    'FOLLOWUP': '#8B5CF6',      // Purple
    'MEETING_SCHEDULED': '#0C4A6E' // Dark Blue
  };

  // Fetch leads data
  useEffect(() => {
    const fetchLeadsData = async () => {
      try {
        setLoading(true);
        
        // Fetch leads data from API
        const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/leads');
        const data = await response.json();
        
        if (data.success && Array.isArray(data.leads)) {
          setLeadsData(data.leads);
          processLeadStatusCounts(data.leads);
        } else {
          console.error('Invalid leads data format:', data);
        }
      } catch (error) {
        console.error('Error fetching leads data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeadsData();
  }, []);

  // Process leads data to count statuses
  const processLeadStatusCounts = (leads) => {
    // Count leads by status
    const counts = {};
    
    leads.forEach(lead => {
      const status = lead.status || 'UNKNOWN';
      counts[status] = (counts[status] || 0) + 1;
    });
    
    // Define standard status flow (all important statuses)
    const statusPriority = [
      'NON_CONTACTED', 
      'CONTACTED', 
      'INTERESTED',
      'FOLLOWUP',
      'MEETING_SCHEDULED',
      'QUALIFIED',
      'CONVERTED',
      'DISQUALIFIED'
    ];
    
    // Include all important statuses, even with 0 value
    const chartData = statusPriority.map(status => ({
      name: formatStatusName(status),
      value: counts[status] || 0, // Default to 0 if not present
      fill: statusColors[status] || '#CBD5E1' // Default gray color if not defined
    }));
    
    // Get the 5 most important statuses
    const finalChartData = chartData.slice(0, 5);
    
    setStatusCounts(finalChartData);
  };
  
  // Format status name for display
  const formatStatusName = (status) => {
    if (!status) return 'Unknown';
    
    // Replace underscores with spaces and capitalize each word
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Custom tooltip for funnel chart
  const FunnelTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow rounded border border-gray-200">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="text-lg text-gray-600">Loading leads data...</div>
      </div>
    );
  }

  // Since we now always show statuses (even with 0 value), this check is only for API failures
  if (leadsData.length === 0 && !loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="text-lg text-gray-600">No lead data available. Please check API connection.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold">Lead Status</h3>
          <p className="text-gray-600 text-sm">Total Leads: {leadsData.length}</p>
        </div>
        <button className="text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
      
      <div className="flex justify-center items-center h-80 mt-8">
        <ResponsiveContainer width="100%" height="120%">
          <FunnelChart width={400} height={300}>
            <Tooltip content={<FunnelTooltip />} />
            <Funnel
              dataKey="value"
              data={statusCounts}
              isAnimationActive={true}
              trapezoidHeight={60}
              paddingAngle={0}
            >
              {statusCounts.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {statusCounts.map((item, index) => (
          <div key={index} className="flex items-center">
            <span 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: item.fill }}
            ></span>
            <span className="text-sm text-gray-600">
              {item.name} 
              <span className="font-medium">
                {item.value > 0 ? ` (${item.value})` : ' (0)'}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadStatusChart;