import React, { useState, useEffect } from 'react';
import { ChevronDown, Trash2, Edit, ChevronLeft, ChevronRight, Box, X, Plus, Loader2 } from 'lucide-react';

interface Asset {
  id: string;
  assetUser: string;
  assetName: string;
  assetId: string;
  purchaseDate: string;
  warranty: string;
  amount: number;
  status: string;
}

interface ApiResponse {
  success: boolean;
  assets: Asset[];
}

const AssetsManagement: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("All Data");
  const [selectedYear, setSelectedYear] = useState("2022");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    assetUser: '',
    assetName: '',
    assetId: '',
    purchaseDate: '',
    warranty: '',
    amount: 0,
    status: 'Assigned'
  });

  const fetchAssets = async () => {
    try {
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/assets');
      const data: ApiResponse = await response.json();
      if (data.success) {
        setAssets(data.assets);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddAsset = async () => {
    try {
      setFormLoading(true);
      setError("");
      
      // Format the date to match the API's expected format
      const formattedData = {
        ...formData,
        purchaseDate: new Date(formData.purchaseDate).toISOString()
      };

      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      if (response.ok) {
        setSuccess("Asset added successfully!");
        fetchAssets();
        setIsModalOpen(false);
        setFormData({
          assetUser: '',
          assetName: '',
          assetId: '',
          purchaseDate: '',
          warranty: '',
          amount: 0,
          status: 'Assigned'
        });
      } else {
        throw new Error('Failed to add asset');
      }
    } catch (error) {
      setError("Failed to add asset. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateAsset = async (id: string) => {
    try {
      setFormLoading(true);
      setError("");

      // Format the date to match the API's expected format
      const formattedData = {
        ...formData,
        purchaseDate: new Date(formData.purchaseDate).toISOString()
      };

      const response = await fetch(`https://totem-consultancy-beta.vercel.app/api/crm/assets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      if (response.ok) {
        setSuccess("Asset updated successfully!");
        fetchAssets();
        setIsModalOpen(false);
        setEditingAsset(null);
      } else {
        throw new Error('Failed to update asset');
      }
    } catch (error) {
      setError("Failed to update asset. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        const response = await fetch(`https://totem-consultancy-beta.vercel.app/api/crm/assets/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setSuccess("Asset deleted successfully!");
          fetchAssets();
        } else {
          throw new Error('Failed to delete asset');
        }
      } catch (error) {
        setError("Failed to delete asset. Please try again.");
      }
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      assetUser: asset.assetUser,
      assetName: asset.assetName,
      assetId: asset.assetId,
      purchaseDate: asset.purchaseDate.split('T')[0],
      warranty: asset.warranty,
      amount: asset.amount,
      status: asset.status
    });
    setIsModalOpen(true);
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'returned':
        return 'bg-red-100 text-red-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-pink-50 min-h-screen p-6">
      <div className="mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-gray-800 rounded-xl w-[78px] h-[70px] flex items-center justify-center">
            <Box className='text-white h-11 w-16'/>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Assets</h1>
            <p className="text-gray-600 font-semibold mt-1">Manage company assets</p>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button 
            onClick={() => {
              setEditingAsset(null);
              setFormData({
                assetUser: '',
                assetName: '',
                assetId: '',
                purchaseDate: '',
                warranty: '',
                amount: 0,
                status: 'Assigned'
              });
              setIsModalOpen(true);
            }}
            className="bg-gray-800 text-white px-4 py-4 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Asset
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-medium text-gray-800">Assets</h1>
          <div className="flex gap-2">
            <div className="relative">
              <button className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                {selectedFilter}
                <ChevronDown size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="relative">
              <button className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                {selectedYear}
                <ChevronDown size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-500">Loading assets...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="pb-3 font-medium">Asset User</th>
                  <th className="pb-3 font-medium">Asset Name</th>
                  <th className="pb-3 font-medium">Asset ID</th>
                  <th className="pb-3 font-medium">Purchase Date</th>
                  <th className="pb-3 font-medium">Warranty</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} className="border-b hover:bg-gray-50">
                    <td className="py-4">{asset.assetUser}</td>
                    <td className="py-4">{asset.assetName}</td>
                    <td className="py-4">{asset.assetId}</td>
                    <td className="py-4">{new Date(asset.purchaseDate).toLocaleDateString()}</td>
                    <td className="py-4">{asset.warranty}</td>
                    <td className="py-4">${asset.amount}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusClass(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(asset)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
          <div>Showing 1 to 10 of {assets.length} entries</div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 border border-gray-300 rounded bg-gray-100 text-gray-700">
              <ChevronLeft size={16} />
            </button>
            <button className="flex items-center justify-center w-8 h-8 bg-gray-800 text-white rounded-md">
              1
            </button>
            <button className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-md">
              2
            </button>
            <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Asset */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">
                {editingAsset ? "Edit Asset" : "Add New Asset"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingAsset(null);
                  setError("");
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              editingAsset ? handleUpdateAsset(editingAsset.id) : handleAddAsset();
            }} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset User <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.assetUser}
                    onChange={(e) => setFormData({...formData, assetUser: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.assetName}
                    onChange={(e) => setFormData({...formData, assetName: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.assetId}
                    onChange={(e) => setFormData({...formData, assetId: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warranty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.warranty}
                    onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingAsset(null);
                    setError("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {editingAsset ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    editingAsset ? "Update Asset" : "Add Asset"
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

export default AssetsManagement;