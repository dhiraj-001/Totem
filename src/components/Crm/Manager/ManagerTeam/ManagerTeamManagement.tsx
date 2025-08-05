import React, { useState, useEffect } from 'react';
import img from '../AdminClient/Vector.png';
import team from '../ManagerTeam/team.png';
import { Link } from 'react-router-dom';
import { X, User, Mail, Phone, Building, Users, CreditCard, Calendar, Trash2, Upload } from 'lucide-react';

// Team member type definition
interface TeamMember {
  id: string;
  name: string;
  email: string;
  position: string;
  imageURL: string; // Changed from profileImage to imageURL
  personalMail: string;
  mobile: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  bloodGroup: string;
  guardianName: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  emergencyContactAddress: string;
  emergencyContactRelationship: string;
  branch: string;
  department: string;
  employeeType: string;
  jobTitle: string;
  dateofJoining: string;
  employeeId: string;
  officialMail: string;
  pfAcNo: string;
  bankName: string;
  bankBranch: string;
  acNo: string;
  ifscCode: string;
  upiId: string;
}

interface TeamFormData {
  name: string;
  personalMail: string;
  mobile: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  bloodGroup: string;
  guardianName: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  emergencyContactAddress: string;
  emergencyContactRelationship: string;
  branch: string;
  department: string;
  employeeType: string;
  jobTitle: string;
  dateofJoining: string;
  employeeId: string;
  officialMail: string;
  pfAcNo: string;
  bankName: string;
  bankBranch: string;
  acNo: string;
  ifscCode: string;
  upiId: string;
  imageURL: string; // Added imageURL field
}

const TeamManagementPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    personalMail: '',
    mobile: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    bloodGroup: '',
    guardianName: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    emergencyContactAddress: '',
    emergencyContactRelationship: '',
    branch: '',
    department: '',
    employeeType: '',
    jobTitle: '',
    dateofJoining: '',
    employeeId: '',
    officialMail: '',
    pfAcNo: '',
    bankName: '',
    bankBranch: '',
    acNo: '',
    ifscCode: '',
    upiId: '',
    imageURL: ''
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/teamm');
      if (!response.ok) throw new Error('Failed to fetch team members');
      const data = await response.json();
      setTeamMembers(data);
    } catch (err) {
      setError('Failed to load team members');
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default'); // Replace with your Cloudinary upload preset

      try {
        const response = await fetch('https://api.cloudinary.com/v1_1/dgagkq1cs/image/upload', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          imageURL: data.secure_url
        }));
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`https://totem-consultancy-beta.vercel.app/api/crm/teamm/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTeamMembers(prev => prev.filter(member => member.id !== id));
      } else {
        throw new Error('Failed to delete team member');
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedFormData = {
      ...formData,
      dob: formData.dob ? new Date(formData.dob).toISOString() : '',
      dateofJoining: formData.dateofJoining ? new Date(formData.dateofJoining).toISOString() : ''
    };

    try {
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/teamm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedFormData),
      });
      
      if (response.ok) {
        setIsModalOpen(false);
        fetchTeamMembers();
        setFormData({
          name: '',
          personalMail: '',
          mobile: '',
          dob: '',
          gender: '',
          maritalStatus: '',
          bloodGroup: '',
          guardianName: '',
          emergencyContactName: '',
          emergencyContactNumber: '',
          emergencyContactAddress: '',
          emergencyContactRelationship: '',
          branch: '',
          department: '',
          employeeType: '',
          jobTitle: '',
          dateofJoining: '',
          employeeId: '',
          officialMail: '',
          pfAcNo: '',
          bankName: '',
          bankBranch: '',
          acNo: '',
          ifscCode: '',
          upiId: '',
          imageURL: ''
        });
        setImageFile(null);
      } else {
        console.error('Failed to add team member');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  return (
    <div className="bg-pink-50 min-h-screen p-8">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gray-800 p-3 rounded-xl">
            <img src={img} className='h-10 w-14' alt="Vector" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Team Management</h1>
            <p className="font-semibold text-gray-600 mt-1">Manage Team</p>
          </div>
        </div>
      </div>
      
      {/* Add Team Member Button */}
      <div className="flex justify-end mb-12">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Team Member
        </button>
      </div>
      
      {/* Main content */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          {loading ? (
            <div className="col-span-3 text-center py-10">Loading team members...</div>
          ) : error ? (
            <div className="col-span-3 text-center text-red-600 py-10">{error}</div>
          ) : (
            teamMembers.map((member) => (
              <div key={member.id} className="bg-gray-100 rounded-3xl overflow-hidden relative">
                <button
                  onClick={() => handleDelete(member.id)}
                  className="absolute top-2 right-2 p-3   rounded-full  transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <div className="p-6 flex flex-col items-center">
                  <div className="w-28 h-28 mb-3">
                    <img 
                      src={member.imageURL || team}
                      alt={`${member.name}'s profile`}
                      className="w-full h-full rounded-full object-cover border-4 border-blue-500"
                    />
                  </div>
                  <h3 className="font-bold text-gray-800">{member.name}</h3>
                  <p className="text-sm text-gray-800 mb-1">{member.personalMail}</p>
                  <p className="text-xs text-gray-800">{member.jobTitle}</p>
                </div>
                <Link to={`/crm/admin/teamprofile/${member.id}`}>
                  <div className="bg-gray-900 py-3 px-4">
                    <button className="w-full text-white text-sm">View Profile</button>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add Team Member</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile Image Upload */}
                <div className="col-span-2 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={formData.imageURL || team}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Upload className="mr-2 h-5 w-5" />
                        Upload Photo
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Personal Information</h3>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-2 border rounded"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Personal Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="personalMail"
                        placeholder="Enter personal email"
                        value={formData.personalMail}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-2 border rounded"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="mobile"
                        placeholder="Enter mobile number"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-2 border rounded"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-2 border rounded"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select Marital Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                    <input
                      type="text"
                      name="bloodGroup"
                      placeholder="Enter blood group"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Emergency Contact</h3>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Guardian Name</label>
                    <input
                      type="text"
                      name="guardianName"
                      placeholder="Enter guardian name"
                      value={formData.guardianName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      placeholder="Enter emergency contact name"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact Number</label>
                    <input
                      type="tel"
                      name="emergencyContactNumber"
                      placeholder="Enter emergency contact number"
                      value={formData.emergencyContactNumber}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact Address</label>
                    <input
                      type="text"
                      name="emergencyContactAddress"
                      placeholder="Enter emergency contact address"
                      value={formData.emergencyContactAddress}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Relationship</label>
                    <input
                      type="text"
                      name="emergencyContactRelationship"
                      placeholder="Enter relationship"
                      value={formData.emergencyContactRelationship}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                {/* Employment Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Employment Details</h3>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Branch</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="branch"
                        placeholder="Enter branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-2 border rounded"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      name="department"
                      placeholder="Enter department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Employee Type</label>
                    <input
                      type="text"
                      name="employeeType"
                      placeholder="Enter employee type"
                      value={formData.employeeType}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      placeholder="Enter job title"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Date of Joining</label>
                    <input
                      type="date"
                      name="dateofJoining"
                      value={formData.dateofJoining}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                    <input
                      type="text"
                      name="employeeId"
                      placeholder="Enter employee ID"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Official Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="officialMail"
                        placeholder="Enter official email"
                        value={formData.officialMail}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Bank Details</h3>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">PF Account Number</label>
                    <input
                      type="text"
                      name="pfAcNo"
                      placeholder="Enter PF account number"
                      value={formData.pfAcNo}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                    <input
                      type="text"
                      name="bankName"
                      placeholder="Enter bank name"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Bank Branch</label>
                    <input
                      type="text"
                      name="bankBranch"
                      placeholder="Enter bank branch"
                      value={formData.bankBranch}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="acNo"
                        placeholder="Enter account number"
                        value={formData.acNo}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-2 border rounded"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                    <input
                      type="text"
                      name="ifscCode"
                      placeholder="Enter IFSC code"
                      value={formData.ifscCode}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                    <input
                      type="text"
                      name="upiId"
                      placeholder="Enter UPI ID"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="col-span-2 flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                  >
                    Add Team Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagementPage;