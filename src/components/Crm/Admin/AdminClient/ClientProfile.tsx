import React, { useState, useEffect } from 'react';
import img from './Vector.png'
import profile from './Profile.png'
import india from './india.svg'
import { Link, useParams, useLocation } from 'react-router-dom';

interface ClientData {
  id: string;
  clientName: string;
  personalMail: string;
  mobile: string;
  gender: string; 
  category: string;
  address: string;
  billingAddress: string;
  shippingAddress: string;
  bankName: string;
  AcNumber: string;
  ifscCode: string;
  upiId: string;
  company?: string;
  industry?: string;
  status?: string;
  assignedTo?: string;
}

const ClientManagement: React.FC = () => {
  // Extract the client ID from the URL path directly
  const location = useLocation();
  const urlParts = location.pathname.split('/');
  const clientId = urlParts[urlParts.length - 1];
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sameAsAddress, setSameAsAddress] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  const [clientData, setClientData] = useState<ClientData>({
    id: '',
    clientName: '',
    personalMail: '',
    mobile: '',
    gender: '',
    category: '',
    address: '',
    billingAddress: '',
    shippingAddress: '',
    bankName: '',
    AcNumber: '',
    ifscCode: '',
    upiId: '',
    company: '',
    industry: '',
    status: '',
    assignedTo: ''
  });

  const [editFormData, setEditFormData] = useState<ClientData>({
    id: '',
    clientName: '',
    personalMail: '',
    mobile: '',
    gender: '',
    category: '',
    address: '',
    billingAddress: '',
    shippingAddress: '',
    bankName: '',
    AcNumber: '',
    ifscCode: '',
    upiId: '',
    company: '',
    industry: '',
    status: '',
    assignedTo: ''
  });

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching client with ID:', clientId);
        
        // First, try the general endpoint to get all clients
        const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/client');
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Find the client with the matching ID
        const clientInfo = Array.isArray(data) 
          ? data.find((client: ClientData) => client.id === clientId)
          : null;
        
        if (clientInfo) {
          setClientData(clientInfo);
          setEditFormData(clientInfo);
          
          // Check if shipping address is same as billing address
          if (clientInfo.shippingAddress === clientInfo.billingAddress) {
            setSameAsAddress(true);
          }
        } else {
          setError('Client not found with ID: ' + clientId);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
        setError('Failed to load client data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (clientId && clientId.length > 10) { // Basic validation to ensure we have what looks like a UUID
      fetchClientData();
    } else {
      setError('Client ID is missing or invalid: ' + clientId);
      setLoading(false);
    }
  }, [clientId]);

  const handleSameAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSameAsAddress(e.target.checked);
    if (e.target.checked) {
      setEditFormData(prev => ({
        ...prev,
        shippingAddress: prev.billingAddress
      }));
    }
  };

  const handleEditDetailsClick = () => {
    setShowEditDialog(true);
  };

  const handleCloseDialog = () => {
    setShowEditDialog(false);
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setEditFormData(prev => {
      const updatedData = { ...prev, [name]: value };
      
      // If "same as billing address" is checked, update shipping address when billing address changes
      if (name === 'billingAddress' && sameAsAddress) {
        updatedData.shippingAddress = value;
      }
      
      return updatedData;
    });
  };

  // Modify your handleEditFormSubmit function
const handleEditFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setIsSubmitting(true);
    setUpdateError(null);
    
    const apiUrl = `https://totem-consultancy-beta.vercel.app/api/crm/client/${clientId}`;
    
    // Create a copy of the data without the id field
    const { id, ...dataToSend } = editFormData as any
    delete dataToSend.project;
    console.log('Sending data:', dataToSend); // Debug log
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });
    
    if (!response.ok) {
      // Try to get more details about the error
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Update the client data in the state
    setClientData(editFormData);
    setUpdateSuccess(true);
    
    // Close the dialog after a delay to show success message
    setTimeout(() => {
      setShowEditDialog(false);
      setUpdateSuccess(false);
    }, 2000);
    
  } catch (error) {
    console.error('Error updating client data:', error);
    setUpdateError('Failed to update client data. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading) {
    return <div className="bg-pink-50 p-6 min-h-screen flex items-center justify-center">Loading client details...</div>;
  }

  if (error) {
    return <div className="bg-pink-50 p-6 min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-pink-50 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="bg-gray-800 rounded-xl p-3 mr-3">
            <img src={img} className='w-12 h-9' alt="" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Client Management</h1>
            <p className="font-semibold mt-1 text-gray-600">Manage Client Sheet</p>
          </div>
        </div>

        <div className="flex items-center mb-6 text-sm">
            
          <div className="flex items-center text-gray-500">
          <Link to="/crm/admin/clients">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            </Link>
            
            <span>Clients</span>
           
          </div>
          <Link to="/crm/admin/clients">
          <span className="mx-1 text-gray-500">/</span>
          
          <span className="text-gray-500">Profile</span>
          </Link>
          <span className="mx-1 text-gray-500">/</span>
          <span className="text-blue-500 font-medium">Personal Details</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left panel */}
          <div className="bg-white rounded-lg shadow-sm w-full md:w-1/3">
            <div className="p-4 border-b">
              <h2 className="font-medium">Clients Details</h2>
              <p className="text-xs text-gray-500">Full/Default Client</p>
            </div>
            
            <div className="p-6 flex flex-col items-center">
              <div className="bg-orange-500 rounded-full w-28 h-28 flex items-center justify-center mb-4 overflow-hidden">
                <img src={profile} alt="Client avatar" className="w-full h-full object-cover" />
              </div>
              
              <h3 className="font-medium text-lg">{clientData.clientName}</h3>
              <p className="text-sm text-gray-500 mb-6">{clientData.company ? `CEO at ${clientData.company}` : 'CEO at XYZ Furniture'}</p>
              
              <div className="w-full space-y-4">
                <div className="flex">
                  <span className="w-1/3 text-sm text-gray-500">Phone</span>
                  <span className="w-2/3 text-sm">+91{clientData.mobile}</span>
                </div>
                <div className="flex">
                  <span className="w-1/3 text-sm text-gray-500">Email</span>
                  <span className="w-2/3 text-sm">{clientData.personalMail}</span>
                </div>
                <div className="flex">
                  <span className="w-1/3 text-sm text-gray-500">Address</span>
                  <span className="w-2/3 text-sm">{clientData.address}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <button className="w-full bg-gray-900 text-white rounded py-3 font-medium">
                Save Details
              </button>
            </div>
          </div>
          
          {/* Right panel */}
          <div className="bg-white rounded-lg shadow-sm w-full md:w-2/3 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-1">Client Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2 text-sm bg-gray-50" 
                  value={clientData.clientName || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Personal Email ID</label>
                <input 
                  type="email" 
                  className="w-full border rounded p-2 text-sm bg-gray-50" 
                  value={clientData.personalMail || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Mobile Number</label>
                <div className="flex">
                  <div className="flex items-center border rounded-l px-2 bg-gray-50">
                    <img src={india} alt="India flag" className="h-3.5 mr-1" />
                    <span className="text-xs">+91</span>
                  </div>
                  <input 
                    type="text" 
                    className="w-full border border-l-0 rounded-r p-2 text-sm bg-gray-50" 
                    value={clientData.mobile || ''}
                    readOnly
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Category</label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2 text-sm bg-gray-50" 
                  value={clientData.category || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Gender</label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2 text-sm bg-gray-50" 
                  value={clientData.gender || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Address</label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2 text-sm bg-gray-50" 
                  value={clientData.address || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Billing Address</label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2 text-sm bg-gray-50" 
                  value={clientData.billingAddress || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Shipping Address</label>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    className="w-full border rounded p-2 text-sm bg-gray-50" 
                    value={sameAsAddress ? clientData.billingAddress || '' : clientData.shippingAddress || ''}
                    readOnly
                  />
                  <div className="ml-2 flex items-center text-xs">
                    <input 
                      type="checkbox" 
                      id="sameAsAddress" 
                      className="mr-1"
                      checked={sameAsAddress}
                      onChange={handleSameAddressChange}
                      disabled
                    />
                    <label htmlFor="sameAsAddress">same as billing address</label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Bank Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2 text-sm bg-gray-50" 
                  value={clientData.bankName || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">IFSC Code</label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2 text-sm bg-gray-50" 
                  value={clientData.ifscCode || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Account No.</label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2 text-sm bg-gray-50" 
                  value={clientData.AcNumber || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">UPI ID</label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2 text-sm bg-gray-50" 
                  value={clientData.upiId || ''}
                  readOnly
                />
              </div>
            </div>
            
            <div className="mt-6 ">
              <button 
                className="w-full bg-gray-900 text-white rounded-lg py-2 font-medium"
                onClick={handleEditDetailsClick}
              >
                Edit Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="border-b p-4 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-lg">Edit Client Details</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseDialog}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditFormSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First row */}
                <div>
                  <label className="block text-sm mb-1 font-medium">Client Name*</label>
                  <input 
                    type="text" 
                    name="clientName"
                    className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    value={editFormData.clientName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1 font-medium">Personal Email ID*</label>
                  <input 
                    type="email" 
                    name="personalMail"
                    className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    value={editFormData.personalMail || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {/* Second row */}
                <div>
                  <label className="block text-sm mb-1 font-medium">Mobile Number*</label>
                  <div className="flex">
                    <div className="flex items-center border rounded-l px-2 bg-gray-50">
                      <img src={india} alt="India flag" className="h-3.5 mr-1" />
                      <span className="text-xs">+91</span>
                    </div>
                    <input 
                      type="text" 
                      name="mobile"
                      className="w-full border border-l-0 rounded-r p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                      value={editFormData.mobile || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-1 font-medium">Category*</label>
                  <select
                    name="category"
                    className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={editFormData.category || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="SMB">SMB</option>
                    <option value="Startup">Startup</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
                
                {/* Third row */}
                <div>
                  <label className="block text-sm mb-1 font-medium">Gender*</label>
                  <select
                    name="gender"
                    className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={editFormData.gender || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm mb-1 font-medium">Company</label>
                  <input 
                    type="text" 
                    name="company"
                    className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    value={editFormData.company || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Fourth row */}
                <div>
                  <label className="block text-sm mb-1 font-medium">Industry</label>
                  <input 
                    type="text" 
                    name="industry"
                    className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    value={editFormData.industry || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1 font-medium">Status</label>
                  <select
                    name="status"
                    className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={editFormData.status || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
                
                {/* Fifth row */}
                <div>
                  <label className="block text-sm mb-1 font-medium">Assigned To</label>
                  <input 
                    type="text" 
                    name="assignedTo"
                    className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    value={editFormData.assignedTo || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1 font-medium">Address*</label>
                  <input 
                    type="text" 
                    name="address"
                    className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    value={editFormData.address || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {/* Sixth row */}
                <div>
                  <label className="block text-sm mb-1 font-medium">Billing Address*</label>
                  <input 
                    type="text" 
                    name="billingAddress"
                    className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    value={editFormData.billingAddress || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1 font-medium">Shipping Address*</label>
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      name="shippingAddress"
                      className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                      value={sameAsAddress ? editFormData.billingAddress || '' : editFormData.shippingAddress || ''}
                      onChange={handleInputChange}
                      disabled={sameAsAddress}
                      required
                    />
                    <div className="ml-2 flex items-center text-xs">
                      <input 
                        type="checkbox" 
                        id="editSameAsAddress" 
                        className="mr-1"
                        checked={sameAsAddress}
                        onChange={handleSameAddressChange}
                      />
                      <label htmlFor="editSameAsAddress">same as billing</label>
                    </div>
                  </div>
                </div>
                
                {/* Seventh row */}
                <div>
                  <label className="block text-sm mb-1 font-medium">Bank Name</label>
                  <input 
                    type="text" 
                    name="bankName"
                    className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    value={editFormData.bankName || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1 font-medium">IFSC Code</label>
                  <input 
                    type="text" 
                    name="ifscCode"
                    className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    value={editFormData.ifscCode || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Eighth row */}
                <div>
                  <label className="block text-sm mb-1 font-medium">Account No.</label>
                  <input 
                    type="text" 
                    name="AcNumber"
                    className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    value={editFormData.AcNumber || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1 font-medium">UPI ID</label>
                  <input 
                    type="text" 
                    name="upiId"
                    className="w-full border rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    value={editFormData.upiId || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              {updateError && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                  {updateError}
                </div>
              )}
              
              {updateSuccess && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
                  Client details updated successfully!
                </div>
              )}
              
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;