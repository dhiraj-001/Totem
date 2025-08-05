import React, { useState, useEffect, useRef } from 'react';
import img from '../AdminClient/Vector.png'
import button from './icon.png'
import india from '../AdminClient/india.svg'
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import axios from 'axios';

const PersonalDetailsForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    personalMail: '',
    mobile: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    bloodGroup: '',
    guardianName: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',
    emergencyContactAddress: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Create ref for calendar popup
  const calendarRef = useRef(null);
  
  // Extract ID from URL
  const location = useLocation();
  const pathname = location.pathname;
  const pathParts = pathname.split('/');
  const id = pathParts[pathParts.length - 1];
  
  // Format date for display (from ISO to DD/MM/YYYY)
  const formatDateForDisplay = (isoDate: string | number | Date) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };
  
  // Format date for API (from DD/MM/YYYY to ISO)
  const formatDateForAPI = (displayDate: string) => {
    if (!displayDate) return null;
    const [day, month, year] = displayDate.split('/');
    return `${year}-${month}-${day}T00:00:00.000Z`;
  };
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://totem-consultancy-beta.vercel.app/api/crm/teamm/${id}`);
        
        // Format the date for display
        const data = response.data;
        const formattedData = {
          ...data,
          dob: formatDateForDisplay(data.dob),
          // Map API field names to form field names
          name: data.name,
          personalMail: data.personalMail,
        };
        
        setFormData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load employee data. Please try again.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: { target: any; }) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleDateIconClick = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setShowCalendar(!showCalendar);
  };
  
  const handleDateSelect = (date: Date) => {
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    setFormData(prevState => ({
      ...prevState,
      dob: formattedDate
    }));
    setShowCalendar(false);
  };
  
  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for API - convert date format and map form fields to API fields
      const apiData = {
        ...formData,
        dob: formatDateForAPI(formData.dob),
      };
      
      // Send update request
      await axios.put(`https://totem-consultancy-beta.vercel.app/api/crm/teamm/${id}`, apiData);
      
      setSuccessMessage("Personal details updated successfully!");
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      console.error("Error updating data:", err);
      setError("Failed to update details. Please try again.");
      setLoading(false);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };
  
  // Calendar component
  const Calendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const currentYear = currentMonth.getFullYear();
    const currentMonthNum = currentMonth.getMonth();
    
    const daysInMonth = new Date(currentYear, currentMonthNum + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonthNum, 1).getDay();
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const prevMonth = () => {
      setCurrentMonth(new Date(currentYear, currentMonthNum - 1));
    };
    
    const nextMonth = () => {
      setCurrentMonth(new Date(currentYear, currentMonthNum + 1));
    };
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="text-center py-1"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div 
          key={day} 
          className="text-center py-1 cursor-pointer hover:bg-gray-200 rounded"
          onClick={() => handleDateSelect(new Date(currentYear, currentMonthNum, day))}
        >
          {day}
        </div>
      );
    }
    
    return (
      <div className="bg-white border shadow-md rounded p-2" ref={calendarRef}>
        <div className="flex justify-between items-center mb-2">
          <button 
            onClick={prevMonth}
            className="text-gray-600 hover:text-gray-800"
          >
            &lt;
          </button>
          <div className="font-medium">
            {months[currentMonthNum]} {currentYear}
          </div>
          <button 
            onClick={nextMonth}
            className="text-gray-600 hover:text-gray-800"
          >
            &gt;
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs">
          <div className="text-center font-medium">Su</div>
          <div className="text-center font-medium">Mo</div>
          <div className="text-center font-medium">Tu</div>
          <div className="text-center font-medium">We</div>
          <div className="text-center font-medium">Th</div>
          <div className="text-center font-medium">Fr</div>
          <div className="text-center font-medium">Sa</div>
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-stone-100 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="bg-gray-800 p-3 rounded-lg mr-3">
            <img src={img} className='w-14 h-10' alt="Logo" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Team Management</h1>
            <p className="font-semibold mt-1 text-gray-600">Manage Team</p>
          </div>
        </div>
      </div>
      
      {/* Bio Data Button - Now positioned between header and main content */}
      <div className="flex justify-end mb-8">
        {/* <button className="bg-gray-800 text-white px-4 py-4 rounded-lg flex items-center text-sm">
          <img src={button} className='mr-2' alt="Bio icon" />
          Bio Data
        </button> */}
      </div>

      {/* Main Content with max-width container */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link to="/crm/admin/team" className='flex items-center'>
            <ChevronLeft className="w-4 h-5 mr-1" />
            <span>Team</span>
          </Link>
          <Link to={`/crm/admin/teamprofile/${id}`}>
            <span className="mx-1">/</span>
            <span>Profile</span>
          </Link>
          <span className="mx-1">/</span>
          <span className="font-medium">Personal Details</span>
        </div>

        {/* Loading indicator */}
        {loading && <div className="text-center py-4">Loading...</div>}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Success message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {/* Centered Container for Form */}
        <div className="max-w-xl mx-auto mt-10">
          {/* Form */}
          {!loading && (
            <form onSubmit={handleSubmit}>
              <div className="bg-gray-100 p-12 rounded-3xl">
                <div className="grid grid-cols-2 gap-4">
                  {/* Staff Name */}
                  <div>
                    <label className="block text-sm mb-1">Staff Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Personal Email ID */}
                  <div>
                    <label className="block text-sm mb-1">Personal Email ID</label>
                    <input
                      type="email"
                      name="personalMail"
                      value={formData.personalMail || ''}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm mb-1">Mobile Number</label>
                    <div className="flex">
                      <div className="flex items-center border rounded p-2 bg-white mr-1">
                        <img 
                          src={india}
                          alt="India" 
                          className="h-3 mr-1" 
                        />
                        <span className="text-sm">+91</span>
                      </div>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile || ''}
                        onChange={handleChange}
                        className="w-full border rounded p-2 bg-white"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm mb-1">Date of Birth</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="dob"
                        placeholder="DD/MM/YYYY"
                        value={formData.dob || ''}
                        onChange={handleChange}
                        className="w-full border rounded p-2 bg-white"
                      />
                      <div 
                        className="absolute right-2 top-2 cursor-pointer"
                        onClick={handleDateIconClick}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      {showCalendar && (
                        <div className="absolute z-10 mt-1 right-0">
                          <Calendar />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm mb-1">Gender</label>
                    <input
                      type="text"
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-sm mb-1">Marital Status</label>
                    <input
                      type="text"
                      name="maritalStatus"
                      value={formData.maritalStatus || ''}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-sm mb-1">Blood Group</label>
                    <input
                      type="text"
                      name="bloodGroup"
                      value={formData.bloodGroup || ''}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Guardian Name */}
                  <div>
                    <label className="block text-sm mb-1">Guardian Name</label>
                    <input
                      type="text"
                      name="guardianName"
                      placeholder="e.g. Name"
                      value={formData.guardianName || ''}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Emergency Contact Name */}
                  <div>
                    <label className="block text-sm mb-1">Emergency Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName || ''}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Emergency Contact Relationship */}
                  <div>
                    <label className="block text-sm mb-1">Emergency Contact Relationship</label>
                    <input
                      type="text"
                      name="emergencyContactRelationship"
                      placeholder="e.g. Father"
                      value={formData.emergencyContactRelationship || ''}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Emergency Contact Number */}
                  <div>
                    <label className="block text-sm mb-1">Emergency Contact Number</label>
                    <div className="flex">
                      <div className="flex items-center border rounded p-2 bg-white mr-1">
                        <img 
                          src={india}
                          alt="India" 
                          className="h-3 mr-1" 
                        />
                        <span className="text-sm">+91</span>
                      </div>
                      <input
                        type="tel"
                        name="emergencyContactNumber"
                        value={formData.emergencyContactNumber || ''}
                        onChange={handleChange}
                        className="w-full border rounded p-2 bg-white"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact Address */}
                  <div>
                    <label className="block text-sm mb-1">Emergency Contact Address</label>
                    <input
                      type="text"
                      name="emergencyContactAddress"
                      placeholder="e.g. XYZ, Sector, KSR"
                      value={formData.emergencyContactAddress || ''}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full bg-gray-800 text-white p-2 rounded-lg font-medium"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Details'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsForm;