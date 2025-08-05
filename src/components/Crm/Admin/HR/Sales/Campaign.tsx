import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Loader2, Building, TrendingUp, BarChart3, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import edit from '../../HR/assets/edit.png';
import del from '../../HR/assets/trash.png';

interface Campaign {
  id?: string;
  campaignName: string;
  type: string;
  status: string;
  impression: string;
  ctr: string;
  conversion: string;
  cpa: string;
}

const initialFormState: Campaign = {
  campaignName: '',
  type: 'Social Media',
  status: 'Active',
  impression: '',
  ctr: '',
  conversion: '',
  cpa: ''
};

const Campaign = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Campaign>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('https://totem-consultancy-beta.vercel.app/api/crm/sales-campaign');
      setCampaigns(response.data);
    } catch (error) {
      toast.error('Failed to fetch campaigns');
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      if (editingId) {
        await axios.put(`https://totem-consultancy-beta.vercel.app/api/crm/sales-campaign/${editingId}`, formData);
        setSuccess('Campaign updated successfully');
      } else {
        await axios.post('https://totem-consultancy-beta.vercel.app/api/crm/sales-campaign', formData);
        setSuccess('Campaign created successfully');
      }
      
      setTimeout(() => {
        setShowForm(false);
        setFormData(initialFormState);
        setEditingId(null);
        setSuccess("");
      }, 2000);
      
      fetchCampaigns();
    } catch (error) {
      setError(editingId ? 'Failed to update campaign' : 'Failed to create campaign');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setFormData(campaign);
    setEditingId(campaign.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    
    try {
      await axios.delete(`https://totem-consultancy-beta.vercel.app/api/crm/sales-campaign/${id}`);
      toast.success('Campaign deleted successfully');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Campaign</h2>
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
            Add Campaign
          </button>
        </div>
      </div>

      {/* Dialog/Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h3 className="text-2xl font-semibold text-gray-900">
                {editingId ? 'Edit Campaign' : 'Add New Campaign'}
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
                    Campaign Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.campaignName}
                      onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter campaign name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter campaign type"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Impression <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <BarChart3 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.impression}
                        onChange={(e) => setFormData({ ...formData, impression: e.target.value })}
                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter impressions"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CTR % <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.ctr}
                        onChange={(e) => setFormData({ ...formData, ctr: e.target.value })}
                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter CTR"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conversion <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <BarChart3 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.conversion}
                        onChange={(e) => setFormData({ ...formData, conversion: e.target.value })}
                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter conversions"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPA <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.cpa}
                        onChange={(e) => setFormData({ ...formData, cpa: e.target.value })}
                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter CPA"
                        required
                      />
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
                    <>{editingId ? "Update Campaign" : "Add Campaign"}</>
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
              <th className="py-3 text-left font-medium text-gray-700">Campaign Name</th>
              <th className="py-3 text-left font-medium text-gray-700">Type</th>
              <th className="py-3 text-left font-medium text-gray-700">Status</th>
              <th className="py-3 text-left font-medium text-gray-700">Impression</th>
              <th className="py-3 text-left font-medium text-gray-700">CTR %</th>
              <th className="py-3 text-left font-medium text-gray-700">Conversion</th>
              <th className="py-3 text-left font-medium text-gray-700">CPA</th>
              <th className="py-3 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b border-gray-200">
                <td className="py-4">{campaign.campaignName}</td>
                <td className="py-4">{campaign.type}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="py-4">{campaign.impression}</td>
                <td className="py-4">{campaign.ctr}</td>
                <td className="py-4">{campaign.conversion}</td>
                <td className="py-4">{campaign.cpa}</td>
                <td className="py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(campaign)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <img src={edit} className="h-5" alt="Edit" />
                    </button>
                    <button
                      onClick={() => campaign.id && handleDelete(campaign.id)}
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

export default Campaign;