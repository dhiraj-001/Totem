import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Loader2, Building2, User, BarChart3, Calendar, DollarSign, Percent, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import edit from '../../HR/assets/edit.png';
import del from '../../HR/assets/trash.png';

interface SalesPipeline {
  id?: string;
  dealName: string;
  leadName: string;
  stage: string;
  dealValue: string;
  probability: string;
  expectedCloseDate: string;
  closeWon: string;
}

const initialFormState: SalesPipeline = {
  dealName: '',
  leadName: '',
  stage: 'Negotiation',
  dealValue: '',
  probability: '',
  expectedCloseDate: new Date().toISOString().split('T')[0],
  closeWon: 'No'
};

const SalesPipeline = () => {
  const [pipelines, setPipelines] = useState<SalesPipeline[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<SalesPipeline>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const fetchPipelines = async () => {
    try {
      const response = await axios.get('https://totem-consultancy-beta.vercel.app/api/crm/sales-pipeline');
      setPipelines(response.data);
    } catch (error) {
      toast.error('Failed to fetch sales pipelines');
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      if (editingId) {
        await axios.put(`https://totem-consultancy-beta.vercel.app/api/crm/sales-pipeline/${editingId}`, formData);
        setSuccess('Sales pipeline updated successfully');
      } else {
        await axios.post('https://totem-consultancy-beta.vercel.app/api/crm/sales-pipeline', formData);
        setSuccess('Sales pipeline created successfully');
      }
      
      setTimeout(() => {
        setShowForm(false);
        setFormData(initialFormState);
        setEditingId(null);
        setSuccess("");
      }, 2000);
      
      fetchPipelines();
    } catch (error) {
      setError(editingId ? 'Failed to update sales pipeline' : 'Failed to create sales pipeline');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (pipeline: SalesPipeline) => {
    const formattedDate = new Date(pipeline.expectedCloseDate).toISOString().split('T')[0];
    setFormData({ ...pipeline, expectedCloseDate: formattedDate });
    setEditingId(pipeline.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sales pipeline?")) return;
    
    try {
      await axios.delete(`https://totem-consultancy-beta.vercel.app/api/crm/sales-pipeline/${id}`);
      toast.success('Sales pipeline deleted successfully');
      fetchPipelines();
    } catch (error) {
      toast.error('Failed to delete sales pipeline');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Sales Pipeline</h2>
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
            Add Pipeline
          </button>
        </div>
      </div>

      {/* Dialog/Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h3 className="text-2xl font-semibold text-gray-900">
                {editingId ? 'Edit Sales Pipeline' : 'Add New Sales Pipeline'}
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
                    Deal Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.dealName}
                      onChange={(e) => setFormData({ ...formData, dealName: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter deal name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.leadName}
                      onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter lead name"
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
                      <option value="Prospecting">Prospecting</option>
                      <option value="Qualification">Qualification</option>
                      <option value="Needs Analysis">Needs Analysis</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed Won">Closed Won</option>
                      <option value="Closed Lost">Closed Lost</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deal Value <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.dealValue}
                        onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter deal value"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Probability <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.probability}
                        onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter probability"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Close Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.expectedCloseDate}
                        onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Close/Won
                    </label>
                    <div className="relative">
                      <CheckCircle className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <select
                        value={formData.closeWon}
                        onChange={(e) => setFormData({ ...formData, closeWon: e.target.value })}
                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
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
                    <>{editingId ? "Update Pipeline" : "Add Pipeline"}</>
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
              <th className="py-3 text-left font-medium text-gray-700">Deal Name</th>
              <th className="py-3 text-left font-medium text-gray-700">Lead Name</th>
              <th className="py-3 text-left font-medium text-gray-700">Stage</th>
              <th className="py-3 text-left font-medium text-gray-700">Deal Value</th>
              <th className="py-3 text-left font-medium text-gray-700">Probability</th>
              <th className="py-3 text-left font-medium text-gray-700">Expected Close Date</th>
              <th className="py-3 text-left font-medium text-gray-700">Close/Won</th>
              <th className="py-3 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pipelines.map((pipeline) => (
              <tr key={pipeline.id} className="border-b border-gray-200">
                <td className="py-4">{pipeline.dealName}</td>
                <td className="py-4">{pipeline.leadName}</td>
                <td className="py-4">{pipeline.stage}</td>
                <td className="py-4">${pipeline.dealValue}</td>
                <td className="py-4">{pipeline.probability}</td>
                <td className="py-4">{new Date(pipeline.expectedCloseDate).toLocaleDateString()}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    pipeline.closeWon === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {pipeline.closeWon}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(pipeline)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <img src={edit} className="h-5" alt="Edit" />
                    </button>
                    <button
                      onClick={() => pipeline.id && handleDelete(pipeline.id)}
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

export default SalesPipeline;