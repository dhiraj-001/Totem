import React, { useState, useEffect } from "react";
import { Loader2, Search, Mail, Phone, MapPin, Link as LinkIcon, Users, Plus, Trash2, Edit2, X, ChevronDown, Building, Briefcase, User, CreditCard, Ban as Bank } from "lucide-react";
import icon from './Vector.png';
import edit from '../HR/assets/edit.png'
import del from '../HR/assets/trash.png'
import { useNavigate } from "react-router-dom";
import axios from 'axios';

interface Project {
  id: string;
  Link: string;
  createdAt: string;
  updatedAt: string;
  clientsId: string;
}

interface Contact {
  id: string;
  company: string;
  industry: string;
  status: "ACTIVE" | "INACTIVE";
  assignedTo: string;
  clientName: string;
  personalMail: string;
  mobile: string;
  category: string;
  gender: string;
  address: string;
  billingAddress: string;
  shippingAddress: string;
  bankName: string;
  ifscCode: string;
  AcNumber: string;
  upiId: string;
  project?: Project[];
}

interface FormData {
  company: string;
  industry: string;
  status: "ACTIVE" | "INACTIVE";
  assignedTo: string;
  clientName: string;
  personalMail: string;
  mobile: string;
  category: string;
  gender: string;
  address: string;
  billingAddress: string;
  shippingAddress: string;
  bankName: string;
  ifscCode: string;
  AcNumber: string;
  upiId: string;
  projectLinks?: string[];
}

const API_BASE_URL = 'https://totem-consultancy-beta.vercel.app/api/crm/client';

const ClientList: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [yearFilter, setYearFilter] = useState<string>("2022");
  const [dataFilter, setDataFilter] = useState<string>("All Data");
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    company: "",
    industry: "",
    status: "ACTIVE",
    assignedTo: "",
    clientName: "",
    personalMail: "",
    mobile: "",
    category: "",
    gender: "",
    address: "",
    billingAddress: "",
    shippingAddress: "",
    bankName: "",
    ifscCode: "",
    AcNumber: "",
    upiId: "",
    projectLinks: [""],
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setContacts(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch contacts");
      setLoading(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    console.log(contact)
    setFormData({
      company: contact.company,
      industry: contact.industry,
      status: contact.status,
      assignedTo: contact.assignedTo,
      clientName: contact.clientName,
      personalMail: contact.personalMail,
      mobile: contact.mobile,
      category: contact.category,
      gender: contact.gender,
      address: contact.address,
      billingAddress: contact.billingAddress,
      shippingAddress: contact.shippingAddress,
      bankName: contact.bankName,
      ifscCode: contact.ifscCode,
      AcNumber: contact.AcNumber,
      upiId: contact.upiId,
      projectLinks: contact.project?.map(p => p.Link) || [""],
    });
    setIsOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjectLinkChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      projectLinks: prev.projectLinks?.map((link, i) => i === index ? value : link) || [""],
    }));
  };

  const addProjectLink = () => {
    setFormData(prev => ({
      ...prev,
      projectLinks: [...(prev.projectLinks || []), ""],
    }));
  };

  const removeProjectLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projectLinks: prev.projectLinks?.filter((_, i) => i !== index) || [""],
    }));
  };

  const validateForm = () => {
    if (!formData.clientName.trim()) return "Client Name is required";
    if (!formData.personalMail.trim()) return "Email is required";
    if (!formData.mobile.trim()) return "Phone is required";
    if (!formData.company.trim()) return "Company is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setFormLoading(true);
    console.log("Form data being sent:", formData);

    try {
      if (editingContact) {
        await axios.put(`${API_BASE_URL}/${editingContact.id}`, formData);
        setSuccess("Client updated successfully!");
      } else {
        await axios.post(API_BASE_URL, formData);
        setSuccess("Client added successfully!");
      }

      fetchContacts();
      
      setTimeout(() => {
        setIsOpen(false);
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save client");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    setDeleteLoading(contactId);
    try {
      await axios.delete(`${API_BASE_URL}/${contactId}`);
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      setSuccess("Client deleted successfully!");

      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client");
    } finally {
      setDeleteLoading("");
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.personalMail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-pink-50 w-full">
      {/* Keep all existing JSX until the modal form */}
      <div className="w-full lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gray-800 p-3 rounded-xl">
              <img src={icon} className="w-14 h-10" alt="" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Client Management
              </h1>
              <p className="mt-1 font-semibold text-gray-500">
                Manage Client sheet
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                setEditingContact(null);
                setFormData({
                  company: "",
                  industry: "",
                  status: "ACTIVE",
                  assignedTo: "",
                  clientName: "",
                  personalMail: "",
                  mobile: "",
                  category: "",
                  gender: "",
                  address: "",
                  billingAddress: "",
                  shippingAddress: "",
                  bankName: "",
                  ifscCode: "",
                  AcNumber: "",
                  upiId: "",
                  projectLinks: [""],
                });
                setIsOpen(true);
              }}
              className="bg-gray-800 text-white px-4 py-4 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Clients
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg animate-fadeIn">
            {success}
          </div>
        )}
        {error && !isOpen && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg animate-fadeIn">
            {error}
          </div>
        )}

        {/* Clients Section */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-xl font-medium ml-5">Clients</h2>

          <div className="flex justify-end mb-6 -mt-7 gap-4">
            <div className="relative">
              <select
                value={dataFilter}
                onChange={(e) => setDataFilter(e.target.value)}
                className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All Data</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
            </div>

            <div className="relative">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>2022</option>
                <option>2023</option>
                <option>2024</option>
                <option>2025</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-gray-500">Loading clients...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Contact Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Project(s) Link
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Current Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {contact.company}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contact.clientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contact.industry}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contact.project?.[0]?.Link || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${
                            contact.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contact.assignedTo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <button
  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
  onClick={() => navigate(`/crm/admin/personal-details/${contact.id}`)}
>
  Visit Profile
</button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="text-gray-500 hover:text-gray-700"
                            disabled={deleteLoading === contact.id}
                          >
                            {deleteLoading === contact.id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <img src={del} className="h-5 w-5" alt="" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(contact)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <img src={edit} className="h-5 w-5" alt="" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Updated Modal Form with all fields */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-semibold text-gray-900">
                {editingContact ? "Edit Client" : "Add Client"}
              </h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setEditingContact(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full rounded border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter company name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full rounded border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter industry"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleInputChange}
                        className="w-full rounded border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter contact name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="personalMail"
                        value={formData.personalMail}
                        onChange={handleInputChange}
                        className="w-full rounded border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="w-full rounded border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="SMB">SMB</option>
                      <option value="Startup">Startup</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Additional Information</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleInputChange}
                        className="w-full rounded border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter team member name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter business address"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Billing Address
                    </label>
                    <textarea
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter billing address"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Address
                    </label>
                    <textarea
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter shipping address"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Banking Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Banking Information</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <div className="relative">
                      <Bank className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        className="w-full rounded border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter bank name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleInputChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter IFSC code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="AcNumber"
                        value={formData.AcNumber}
                        onChange={handleInputChange}
                        className="w-full rounded border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter account number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter UPI ID"
                    />
                  </div>
                </div>

                {/* Project Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Project Links</h3>
                  
                  {formData.projectLinks?.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => handleProjectLinkChange(index, e.target.value)}
                          className="w-full rounded border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          placeholder="https://example.com"
                        />
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeProjectLink(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                 ```
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addProjectLink}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Project Link
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                  {success}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setEditingContact(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {editingContact ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>{editingContact ? "Update Client" : "Add Client"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;