import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Loader2, User, Target, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import edit from '../../HR/assets/edit.png';
import del from '../../HR/assets/trash.png';

interface CashFlow {
  id?: string;
  salesPerson: string;
  revenueTarget: string;
  revenueGeneration: string;
  month: string;
  gap: string;
  stage: string;
}

const initialFormState: CashFlow = {
  salesPerson: '',
  revenueTarget: '',
  revenueGeneration: '',
  month: '',
  gap: '',
  stage: 'Negotiation'
};

const CashFlow = () => {
  const [cashflows, setCashflows] = useState<CashFlow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CashFlow>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const fetchCashflows = async () => {
    try {
      const response = await axios.get('https://totem-consultancy-beta.vercel.app/api/crm/cashflow');
      setCashflows(response.data);
    } catch (error) {
      toast.error('Failed to fetch cash flow data');
    }
  };

  useEffect(() => {
    fetchCashflows();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      if (editingId) {
        await axios.put(`https://totem-consultancy-beta.vercel.app/api/crm/cashflow/${editingId}`, formData);
        setSuccess('Cash flow data updated successfully');
      } else {
        await axios.post('https://totem-consultancy-beta.vercel.app/api/crm/cashflow', formData);
        setSuccess('Cash flow data created successfully');
      }
      
      setTimeout(() => {
        setShowForm(false);
        setFormData(initialFormState);
        setEditingId(null);
        setSuccess("");
      }, 2000);
      
      fetchCashflows();
    } catch (error) {
      setError(editingId ? 'Failed to update cash flow data' : 'Failed to create cash flow data');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (cashflow: CashFlow) => {
    setFormData(cashflow);
    setEditingId(cashflow.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this cash flow data?")) return;
    
    try {
      await axios.delete(`https://totem-consultancy-beta.vercel.app/api/crm/cashflow/${id}`);
      toast.success('Cash flow data deleted successfully');
      fetchCashflows();
    } catch (error) {
      toast.error('Failed to delete cash flow data');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Cash Flow</h2>
        <div className="flex gap-2">
          <div className="relative">
            <select className="p-2 border rounded-md appearance-none pr-8 bg-white">
              <option>All Data</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          
          <div className="relative">
            <select className="p-2 border rounded-md appearance-none pr-8 bg-white">
              <option>Feb 2025</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setFormData(initialFormState);
              setEditingId(null);
            }}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <Plus size={16} />
            Add Cash Flow
          </button>
        </div>
      </div>

      {/* Dialog/Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h3 className="text-2xl font-semibold text-gray-900">
                {editingId ? 'Edit Cash Flow Data' : 'Add New Cash Flow Data'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData(initialFormState);
                  setEditingId(null);
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
                    Sales Person <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.salesPerson}
                      onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter sales person name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revenue Target <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Target className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.revenueTarget}
                      onChange={(e) => setFormData({ ...formData, revenueTarget: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter revenue target"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revenue Generation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.revenueGeneration}
                      onChange={(e) => setFormData({ ...formData, revenueGeneration: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter revenue generation"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter month"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.gap}
                      onChange={(e) => setFormData({ ...formData, gap: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter gap"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BarChart3 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    >
                      <option value="Negotiation">Negotiation</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
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
                    setShowForm(false);
                    setFormData(initialFormState);
                    setEditingId(null);
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
                      {editingId ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>{editingId ? "Update Cash Flow" : "Add Cash Flow"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 text-left font-medium text-gray-700">Sales Person</th>
              <th className="py-3 text-left font-medium text-gray-700">Revenue Target</th>
              <th className="py-3 text-left font-medium text-gray-700">Revenue Generation</th>
              <th className="py-3 text-left font-medium text-gray-700">Month</th>
              <th className="py-3 text-left font-medium text-gray-700">Gap</th>
              <th className="py-3 text-left font-medium text-gray-700">Stage</th>
              <th className="py-3 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cashflows.map((cashflow) => (
              <tr key={cashflow.id} className="border-b border-gray-200">
                <td className="py-4">{cashflow.salesPerson}</td>
                <td className="py-4">${cashflow.revenueTarget}</td>
                <td className="py-4">${cashflow.revenueGeneration}</td>
                <td className="py-4">{cashflow.month}</td>
                <td className="py-4">${cashflow.gap}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    cashflow.stage === 'Completed' ? 'bg-green-100 text-green-800' :
                    cashflow.stage === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    cashflow.stage === 'Negotiation' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {cashflow.stage}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(cashflow)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <img src={edit} className="h-5" alt="Edit" />
                    </button>
                    <button
                      onClick={() => cashflow.id && handleDelete(cashflow.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <img src={del} className="h-5" alt="Delete" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashFlow;