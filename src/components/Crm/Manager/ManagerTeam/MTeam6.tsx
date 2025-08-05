import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronLeft } from 'lucide-react'
import axios from "axios"

const BankDetailsForm = () => {
  const [formData, setFormData] = useState({
    pfAcNo: "",
    bankName: "",
    bankBranch: "",
    acNo: "",
    ifscCode: "",
    upiId: ""
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)
  
  const location = useLocation()
  
  // Extract ID from URL
  const getEmployeeIdFromUrl = () => {
    const pathParts = location.pathname.split('/')
    return pathParts[pathParts.length - 1]
  }
  
  const employeeId = getEmployeeIdFromUrl()
  
  // Fetch employee data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`https://totem-consultancy-beta.vercel.app/api/crm/teamm/${employeeId}`)
        const data = response.data
        
        setFormData({
          pfAcNo: data.pfAcNo || '',
          bankName: data.bankName || '',
          bankBranch: data.bankBranch || '',
          acNo: data.acNo || '',
          ifscCode: data.ifscCode || '',
          upiId: data.upiId || ''
        })
        
        setLoading(false)
      } catch (err) {
        console.error('Error fetching employee data:', err)
        setError('Failed to load employee data. Please try again.')
        setLoading(false)
      }
    }
    
    fetchEmployeeData()
  }, [employeeId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitStatus('submitting')
      
      // Get existing data first to keep other fields intact
      const getCurrentData = await axios.get(`https://totem-consultancy-beta.vercel.app/api/crm/teamm/${employeeId}`)
      const existingData = getCurrentData.data
      
      // Prepare data for update
      const updateData = {
        ...existingData,
        pfAcNo: formData.pfAcNo,
        bankName: formData.bankName,
        bankBranch: formData.bankBranch,
        acNo: formData.acNo,
        ifscCode: formData.ifscCode,
        upiId: formData.upiId
      }
      
      // Send update request
      await axios.put(`https://totem-consultancy-beta.vercel.app/api/crm/teamm/${employeeId}`, updateData)
      
      setSubmitStatus('success')
      setTimeout(() => setSubmitStatus(null), 3000)
    } catch (err) {
      console.error('Error updating employee data:', err)
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus(null), 3000)
    }
  }

  return (
    <div className="bg-stone-100 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="bg-gray-800 p-3 rounded-lg mr-3">
            {/* You can replace this with your actual logo */}
            <svg 
              className="w-14 h-10 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
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
          <svg 
            className="w-5 h-5 mr-4" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
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
          <span className="font-medium">Bank Details</span>
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
                  {/* PF A/C No. */}
                  <div>
                    <label className="block text-sm mb-1">PF A/C No.</label>
                    <input
                      type="text"
                      name="pfAcNo"
                      value={formData.pfAcNo}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-sm mb-1">Bank Name</label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Bank Branch */}
                  <div>
                    <label className="block text-sm mb-1">Bank Branch</label>
                    <input
                      type="text"
                      name="bankBranch"
                      value={formData.bankBranch}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-sm mb-1">Account Number</label>
                    <input
                      type="text"
                      name="acNo"
                      value={formData.acNo}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <label className="block text-sm mb-1">IFSC Code</label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>

                  {/* UPI ID */}
                  <div>
                    <label className="block text-sm mb-1">UPI ID</label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
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
                    <p className="text-green-600 text-center mt-2">Bank details saved successfully!</p>
                  )}
                  
                  {submitStatus === 'error' && (
                    <p className="text-red-600 text-center mt-2">Failed to save bank details. Please try again.</p>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default BankDetailsForm