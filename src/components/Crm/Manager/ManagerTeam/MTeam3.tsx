import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import vector from '../AdminClient/Vector.png';
import bio from './icon.png';
import { ChevronLeft } from 'lucide-react';
import axios from 'axios';

const CurrentEmploymentForm = () => {
  const [formData, setFormData] = useState({
    branch: '',
    department: '',
    employeeType: '',
    jobTitle: '',
    dateOfJoining: '',
    employeeID: '',
    officialEmailID: '',
    pfAccNo: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  
  const location = useLocation();
  
  // Extract ID from URL
  const getEmployeeIdFromUrl = () => {
    const pathParts = location.pathname.split('/');
    return pathParts[pathParts.length - 1];
  };
  
  const employeeId = getEmployeeIdFromUrl();
  
  // Fetch employee data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://totem-consultancy-beta.vercel.app/api/crm/teamm/${employeeId}`);
        const data = response.data;
        
        // Format date from ISO to readable format
        const formattedDate = data.dateofJoining ? 
          new Date(data.dateofJoining).toLocaleDateString('en-US', {
            day: 'numeric', 
            month: 'short', 
            year: 'numeric'
          }) : '';
        
        setFormData({
          branch: data.branch || '',
          department: data.department || '',
          employeeType: data.employeeType || '',
          jobTitle: data.jobTitle || '',
          dateOfJoining: formattedDate,
          employeeID: data.employeeId || '',
          officialEmailID: data.officialMail || '',
          pfAccNo: data.pfAcNo || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError('Failed to load employee data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchEmployeeData();
  }, [employeeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitStatus('submitting');
      
      // Parse date back to ISO format
      let dateISO = null;
      if (formData.dateOfJoining) {
        const dateParts = formData.dateOfJoining.split(' ');
        if (dateParts.length === 3) {
          const months = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
          };
          const day = parseInt(dateParts[0]);
          const month = months[dateParts[1] as keyof typeof months];
          const year = parseInt(dateParts[2]);
          
          if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            dateISO = new Date(year, month, day).toISOString();
          }
        }
      }
      
      // Get existing data first to keep other fields intact
      const getCurrentData = await axios.get(`https://totem-consultancy-beta.vercel.app/api/crm/teamm/${employeeId}`);
      const existingData = getCurrentData.data;
      
      // Prepare data for update
      const updateData = {
        ...existingData,
        branch: formData.branch,
        department: formData.department,
        employeeType: formData.employeeType,
        jobTitle: formData.jobTitle,
        dateofJoining: dateISO || existingData.dateofJoining,
        employeeId: formData.employeeID,
        officialMail: formData.officialEmailID,
        pfAcNo: formData.pfAccNo
      };
      
      // Send update request
      await axios.put(`https://totem-consultancy-beta.vercel.app/api/crm/teamm/${employeeId}`, updateData);
      
      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err) {
      console.error('Error updating employee data:', err);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  return (
    <div className="bg-stone-100 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="bg-gray-800 p-3 rounded-lg mr-3">
            <img src={vector} className='w-14 h-10' alt="Team Management Logo"/>
          </div>
          <div>
            <h1 className="text-4xl font-bold">Team Management</h1>
            <p className="font-semibold mt-1 text-gray-600">Manage Team</p>
          </div>
        </div>
      </div>
      
      {/* Bio Data Button */}
      <div className="flex justify-end mb-8">
        {/* <button className="bg-gray-800 text-white px-4 py-4 rounded-lg flex items-center text-sm">
          <img src={bio} className='mr-4' alt="Bio Icon"/>
          Bio Data
        </button> */}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/crm/admin/team" className='flex items-center'>
            <ChevronLeft className="w-4 h-5 mr-1" />
            <span>Team</span>
          </Link>
          <span className="mx-1">/</span>
          <Link to={`/crm/admin/teamprofile/${employeeId}`}>
            <span>Profile</span>
          </Link>
          <span className="mx-1">/</span>
          <span className="font-medium">Current Employment</span>
        </div>

        {/* Centered Container for Form */}
        <div className="max-w-xl mx-auto">
          {loading ? (
            <div className="text-center py-10">
              <p>Loading employee data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit}>
              <div className="bg-gray-100 p-6 rounded-3xl">
                <div className="grid grid-cols-2 gap-4">
                  {/* Branch */}
                  <div>
                    <label className="block text-sm mb-1">Branch</label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm mb-1">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Employee type */}
                  <div>
                    <label className="block text-sm mb-1">Employee type</label>
                    <input
                      type="text"
                      name="employeeType"
                      value={formData.employeeType}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="block text-sm mb-1">Job Title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Date of Joining */}
                  <div>
                    <label className="block text-sm mb-1">Date of Joining</label>
                    <input
                      type="text"
                      name="dateOfJoining"
                      value={formData.dateOfJoining}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label className="block text-sm mb-1">Employee ID</label>
                    <input
                      type="text"
                      name="employeeID"
                      value={formData.employeeID}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Official Email ID */}
                  <div>
                    <label className="block text-sm mb-1">Official Email ID</label>
                    <input
                      type="text"
                      name="officialEmailID"
                      value={formData.officialEmailID}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* PF A/C No. */}
                  <div>
                    <label className="block text-sm mb-1">PF A/C No.</label>
                    <input
                      type="text"
                      name="pfAccNo"
                      placeholder="Enter the PF A/C no."
                      value={formData.pfAccNo}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>
                </div>

                {/* Save Button with Status */}
                <div className="mt-6">
                  <button
                    type="submit"
                    className={`w-full ${submitStatus === 'submitting' ? 'bg-gray-500' : 'bg-gray-800'} text-white p-2 rounded-lg font-medium flex justify-center items-center`}
                    disabled={submitStatus === 'submitting'}
                  >
                    {submitStatus === 'submitting' ? 'Saving...' : 'Save Details'}
                  </button>
                  
                  {submitStatus === 'success' && (
                    <p className="text-green-600 text-center mt-2">Details saved successfully!</p>
                  )}
                  
                  {submitStatus === 'error' && (
                    <p className="text-red-600 text-center mt-2">Failed to save details. Please try again.</p>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentEmploymentForm;