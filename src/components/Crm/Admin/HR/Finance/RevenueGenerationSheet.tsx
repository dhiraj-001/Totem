import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, X, Loader2, Receipt, Calendar, DollarSign, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import edit from '../../HR/assets/edit.png';
import del from '../../HR/assets/trash.png';

interface Client {
  id: string;
  clientName: string;
  company: string;
  industry: string;
  imageURL: string | null;
  status: string;
  assignedTo: string;
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
  project: Array<{
    id: string;
    Link: string;
    createdAt: string;
    updatedAt: string;
    clientsId: string;
  }>;
}

interface Revenue {
  id: string;
  invoiceId: string;
  amount: string;
  issueDate: string;
  dueDate: string;
  paymentStatus: string;
  clientId: string;
  client: {
    clientName: string;
  };
}

interface RevenueInput {
  invoiceId: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  paymentStatus: string;
  clientId: string;
  id?: string;
}

function RevenueGenerationSheet() {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [currentRevenue, setCurrentRevenue] = useState<RevenueInput>({
    invoiceId: '',
    amount: 0,
    issueDate: '',
    dueDate: '',
    paymentStatus: 'Pending',
    clientId: ''
  });

  useEffect(() => {
    fetchRevenues();
    fetchClients();
  }, []);

  const fetchRevenues = async () => {
    try {
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/revenues');
      if (!response.ok) throw new Error('Failed to fetch revenues');
      const data = await response.json();
      setRevenues(data.invoices);
    } catch (error) {
      toast.error('Failed to fetch revenues');
      console.error('Error fetching revenues:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/client');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid clients data received');
      }

      setClients(data);
      
      // Only set default clientId when adding new revenue and no client is selected
      if (!isEditing && currentRevenue.clientId === '' && data.length > 0) {
        setCurrentRevenue(prev => ({
          ...prev,
          clientId: data[0].id
        }));
      }
    } catch (error) {
      toast.error('Failed to fetch clients');
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      if (!currentRevenue.clientId) {
        throw new Error('Please select a client');
      }

      const formattedData = {
        invoiceId: currentRevenue.invoiceId,
        amount: Number(currentRevenue.amount),
        issueDate: new Date(currentRevenue.issueDate).toISOString(),
        dueDate: new Date(currentRevenue.dueDate).toISOString(),
        paymentStatus: currentRevenue.paymentStatus,
        clientId: currentRevenue.clientId
      };

      const url = isEditing 
        ? `https://totem-consultancy-beta.vercel.app/api/crm/revenues/${currentRevenue.id}`
        : 'https://totem-consultancy-beta.vercel.app/api/crm/revenues';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save revenue');
      }

      setSuccess(isEditing ? 'Revenue updated successfully' : 'Revenue created successfully');
      toast.success(isEditing ? 'Revenue updated successfully' : 'Revenue created successfully');
      await fetchRevenues(); // Refresh the revenues list
      
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
        setSuccess("");
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save revenue';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this revenue?')) {
      try {
        const response = await fetch(`https://totem-consultancy-beta.vercel.app/api/crm/revenues/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete revenue');
        }

        toast.success('Revenue deleted successfully');
        await fetchRevenues(); // Refresh the revenues list
      } catch (error) {
        toast.error('Failed to delete revenue');
        console.error('Error deleting revenue:', error);
      }
    }
  };

  const handleEdit = async (revenue: Revenue) => {
    try {
      // First, ensure we have the latest clients data
      await fetchClients();
      
      // Find the client in our current clients list
      const client = clients.find(c => c.id === revenue.clientId);
      
      if (!client) {
        throw new Error('Client not found');
      }

      setCurrentRevenue({
        id: revenue.id,
        invoiceId: revenue.invoiceId,
        amount: parseFloat(revenue.amount),
        issueDate: new Date(revenue.issueDate).toISOString().split('T')[0],
        dueDate: new Date(revenue.dueDate).toISOString().split('T')[0],
        paymentStatus: revenue.paymentStatus,
        clientId: client.id,
      });
      
      setIsEditing(true);
      setIsModalOpen(true);
    } catch (error) {
      toast.error('Failed to load client data');
      console.error('Error loading client data:', error);
    }
  };

  const resetForm = () => {
    setCurrentRevenue({
      invoiceId: '',
      amount: 0,
      issueDate: '',
      dueDate: '',
      paymentStatus: 'Pending',
      clientId: clients.length > 0 ? clients[0].id : ''
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const openAddModal = () => {
    resetForm();
    setIsEditing(false);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Revenue Generation Sheet</h3>
        <div className="flex gap-4">
          <div className="relative">
            <select className="border border-gray-300 rounded-lg px-4 py-2 pr-8 appearance-none bg-white text-gray-700 focus:outline-none">
              <option>All Data</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          <div className="relative">
            <select className="border border-gray-300 rounded-lg px-4 py-2 pr-8 appearance-none bg-white text-gray-700 focus:outline-none">
              <option>Feb 2025</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <Plus size={16} />
            Add Revenue
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="pb-3 font-medium">Client Name</th>
              <th className="pb-3 font-medium">Invoice ID</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Due Date</th>
              <th className="pb-3 font-medium">Payment Status</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {revenues.map((revenue) => (
              <tr key={revenue.id} className="text-sm">
                <td className="py-4">{revenue.client.clientName}</td>
                <td className="py-4">{revenue.invoiceId}</td>
                <td className="py-4">${parseFloat(revenue.amount).toFixed(2)}</td>
                <td className="py-4">{format(new Date(revenue.issueDate), 'dd MMM, yyyy')}</td>
                <td className="py-4">{format(new Date(revenue.dueDate), 'dd MMM, yyyy')}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    revenue.paymentStatus === 'Complete' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {revenue.paymentStatus}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDelete(revenue.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <img src={del} className="h-5" alt="Delete" />
                    </button>
                    <button 
                      onClick={() => handleEdit(revenue)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <img src={edit} className="h-5" alt="Edit" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h3 className="text-2xl font-semibold text-gray-900">
                {isEditing ? 'Edit Revenue' : 'Add New Revenue'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      value={currentRevenue.clientId}
                      onChange={(e) => setCurrentRevenue({...currentRevenue, clientId: e.target.value})}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.clientName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={currentRevenue.invoiceId}
                      onChange={(e) => setCurrentRevenue({...currentRevenue, invoiceId: e.target.value})}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter invoice ID"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={currentRevenue.amount}
                      onChange={(e) => setCurrentRevenue({...currentRevenue, amount: parseFloat(e.target.value)})}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={currentRevenue.issueDate}
                        onChange={(e) => setCurrentRevenue({...currentRevenue, issueDate: e.target.value})}
                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={currentRevenue.dueDate}
                        onChange={(e) => setCurrentRevenue({...currentRevenue, dueDate: e.target.value})}
                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={currentRevenue.paymentStatus}
                    onChange={(e) => setCurrentRevenue({...currentRevenue, paymentStatus: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                  {success}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
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
                      {isEditing ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>{isEditing ? "Update Revenue" : "Add Revenue"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RevenueGenerationSheet;