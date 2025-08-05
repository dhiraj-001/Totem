import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom'; // Added useParams
import icon from './icon.png'
import profile from './team.png'
import img from '../AdminClient/Vector.png'

// Import your icon images
import personIcon from './1.png';
import workIcon from './2.png';
import documentIcon from './3.png';
import calendarIcon from './4.png';
import bankIcon from './5.png';
import lockIcon from './6.png';
import img7 from './7.png'
import { ChevronLeft } from 'lucide-react';

const ProfilePage: React.FC = () => {
  // State to store member data
  const [memberData, setMemberData] = useState({
    name: "",
    personalMail: "",
    jobTitle: "",
    imageURL:""
  });
  const [loading, setLoading] = useState(true);
  
  // Get the id from the URL
  const { id } = useParams();
  
  // Fetch member data when component mounts
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const response = await fetch(`https://totem-consultancy-beta.vercel.app/api/crm/teamm/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch team member data');
        }
        const data = await response.json();
        setMemberData(data);
      } catch (error) {
        console.error('Error fetching team member:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchMemberData();
    }
  }, [id]);
  
  return (
    <div className="bg-[#f8f5f0] min-h-screen p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gray-800 p-3 rounded-lg">
            <img src={img} className="w-14 h-10" alt="Team logo" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Team Management</h1>
            <p className="font-semibold mt-1 text-gray-600">Manage Team</p>
          </div>
        </div>
      </div>
      
      {/* Button moved down */}
      <div className="flex justify-end mb-6">
        {/* <button className="bg-gray-800 text-white px-4 py-4 rounded-lg flex items-center text-sm gap-1">
          <img src={icon} className="mr-2" alt="Bio icon" />
          Bio Data
        </button> */}
      </div>

      {/* Main content */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        {/* Breadcrumb - Fixed */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link 
            to="/crm/admin/team" 
            className="flex items-center hover:text-gray-700"
          >
            <ChevronLeft className="w-4 h-5 mr-1" />
            <span className="text-sm">Team</span>
          </Link>
          <span className="mx-1">/</span>
          <span className="font-medium text-sm">Profile</span>
        </div>

        {/* Profile Card */}
        <div className="bg-[#f1f3f7] rounded-2xl p-8 max-w-md mx-auto">
          <div className="flex flex-col items-center mb-8">
            {/* Profile Image */}
            <div className="w-28 h-28 mb-4">
              <img
                src={memberData.imageURL}
                alt={`${memberData.name}'s profile`}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            
            {/* Display the fetched data */}
            {loading ? (
              <p>Loading profile data...</p>
            ) : (
              <>
                <h2 className="text-lg font-bold text-center">{memberData.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{memberData.personalMail}</p>
                <p className="text-sm text-gray-500 mt-0.5">{memberData.jobTitle}</p>
              </>
            )}
          </div>

          {/* Menu Items - Updated to match reference */}
          <div className="">
            <div className="mb-4">
              <Link to={`/crm/admin/team/personal/${id}`}>
              <MenuItemSimple label="Personal Details" icon="person" />
              </Link>
              <Link to={`/crm/admin/team/employment/${id}`}>
              <MenuItemSimple label="Current Employment" icon="work" />
              </Link>
              <Link to={`/crm/admin/team/kpi/${id}`}>
              <MenuItemSimple label="KPI" icon="document" />
              </Link>
            </div>
            <Link to={`/crm/admin/team/attendance/${id}`}>
            <div className="py-1 mb-4">
              <MenuItemSimple label="Attendance Details" icon="calendar" />
            </div>
            </Link>
            <Link to={`/crm/admin/team/bank/${id}`}>
            <div className="mb-4">
              <MenuItemSimple label="Bank Details" icon="bank" />
            </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified menu item to match the design in reference image
const MenuItemSimple: React.FC<{ icon: string; label: string }> = ({ icon, label }) => {
  return (
    <div className="bg-white rounded-md p-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {getIconImage(icon)}
        <span className="text-sm">{label}</span>
      </div>
      <img 
        src={img7}
        className="h-3 w-2 text-gray-400" 
        alt="chevron right" 
      />
    </div>
  );
};

// Helper function to return the appropriate icon image
const getIconImage = (iconType: string) => {
  switch(iconType) {
    case 'person':
      return <img src={personIcon} className="h-5 w-5" alt="Person icon" />;
    case 'work':
      return <img src={workIcon} className="h-5 w-5" alt="Work icon" />;
    case 'document':
      return <img src={documentIcon} className="h-5 w-5" alt="Document icon" />;
    case 'calendar':
      return <img src={calendarIcon} className="h-5 w-5" alt="Calendar icon" />;
    case 'bank':
      return <img src={bankIcon} className="h-5 w-5" alt="Bank icon" />;
    case 'lock':
      return <img src={lockIcon} className="h-5 w-5" alt="Lock icon" />;
    default:
      return <img src={personIcon} className="h-5 w-5" alt="Default icon" />;
  }
};

export default ProfilePage;