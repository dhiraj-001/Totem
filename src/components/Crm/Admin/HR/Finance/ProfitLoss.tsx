import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, X, Loader2, Receipt, Calculator, DollarSign, Percent } from 'lucide-react';
import { toast } from 'react-hot-toast';
import edit from '../../HR/assets/edit.png';
import del from '../../HR/assets/trash.png';

interface ProfitLoss {
  id: string;
  profitLossName: string;
  monthQuarter: string;
  totalRevenue: string;
  totalExpense: string;
  netProfit: string;
  profitMargin: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfitLossInput {
  profitLossName: string;
  monthQuarter: string;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  id?: string;
}

function ProfitLossSheet() {
  const [entries, setEntries] = useState<ProfitLoss[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [currentEntry, setCurrentEntry] = useState<ProfitLossInput>({
    profitLossName: '',
    monthQuarter: '',
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
    profitMargin: 0
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/profit-loss');
      if (!response.ok) throw new Error('Failed to fetch entries');
      const data = await response.json();
      setEntries(data.entries);
    } catch (error) {
      toast.error('Failed to fetch profit/loss entries');
      console.error('Error fetching entries:', error);
    }
  };

  const calculateProfitMetrics = (revenue: number, expense: number) => {
    const netProfit = revenue - expense;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    return { netProfit, profitMargin };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      const { netProfit, profitMargin } = calculateProfitMetrics(
        currentEntry.totalRevenue,
        currentEntry.totalExpense
      );

      const formattedData = {
        profitLossName: currentEntry.profitLossName,
        monthQuarter: currentEntry.monthQuarter,
        totalRevenue: currentEntry.totalRevenue,
        totalExpense: currentEntry.totalExpense,
        netProfit,
        profitMargin: Number(profitMargin.toFixed(2))
      };

      const url = isEditing 
        ? `https://totem-consultancy-beta.vercel.app/api/crm/profit-loss/${currentEntry.id}`
        : 'https://totem-consultancy-beta.vercel.app/api/crm/profit-loss';
      
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
        throw new Error(errorData.message || 'Failed to save entry');
      }

      setSuccess(isEditing ? 'Entry updated successfully' : 'Entry created successfully');
      toast.success(isEditing ? 'Entry updated successfully' : 'Entry created successfully');
      await fetchEntries();
      
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
        setSuccess("");
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save entry';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await fetch(`https://totem-consultancy-beta.vercel.app/api/crm/profit-loss/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete entry');
        }

        toast.success('Entry deleted successfully');
        await fetchEntries();
      } catch (error) {
        toast.error('Failed to delete entry');
        console.error('Error deleting entry:', error);
      }
    }
  };

  const handleEdit = (entry: ProfitLoss) => {
    setCurrentEntry({
      id: entry.id,
      profitLossName: entry.profitLossName,
      monthQuarter: entry.monthQuarter,
      totalRevenue: parseFloat(entry.totalRevenue),
      totalExpense: parseFloat(entry.totalExpense),
      netProfit: parseFloat(entry.netProfit),
      profitMargin: parseFloat(entry.profitMargin)
    });
    
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentEntry({
      profitLossName: '',
      monthQuarter: '',
      totalRevenue: 0,
      totalExpense: 0,
      netProfit: 0,
      profitMargin: 0
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
        <h3 className="text-2xl font-bold text-gray-800">Profit/Loss Sheet</h3>
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
            Add Sheet
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="pb-3 font-medium">Profit/Loss</th>
              <th className="pb-3 font-medium">Month/Quarter</th>
              <th className="pb-3 font-medium">Total Revenue</th>
              <th className="pb-3 font-medium">Total Expense</th>
              <th className="pb-3 font-medium">Net Profit</th>
              <th className="pb-3 font-medium">Profit Margin</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <tr key={entry.id} className="text-sm">
                <td className="py-4">{entry.profitLossName}</td>
                <td className="py-4">{entry.monthQuarter}</td>
                <td className="py-4">${parseFloat(entry.totalRevenue).toFixed(2)}</td>
                <td className="py-4">${parseFloat(entry.totalExpense).toFixed(2)}</td>
                <td className="py-4">${parseFloat(entry.netProfit).toFixed(2)}</td>
                <td className="py-4">{parseFloat(entry.profitMargin).toFixed(2)}%</td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <img src={del} className="h-5" alt="Delete" />
                    </button>
                    <button 
                      onClick={() => handleEdit(entry)}
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
                {isEditing ? 'Edit Entry' : 'Add New Entry'}
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
                    Profit/Loss Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={currentEntry.profitLossName}
                      onChange={(e) => setCurrentEntry({...currentEntry, profitLossName: e.target.value})}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month/Quarter <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calculator className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={currentEntry.monthQuarter}
                      onChange={(e) => setCurrentEntry({...currentEntry, monthQuarter: e.target.value})}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="e.g., Q1-2024"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Revenue <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={currentEntry.totalRevenue}
                      onChange={(e) => setCurrentEntry({...currentEntry, totalRevenue: parseFloat(e.target.value)})}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter total revenue"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Expense <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={currentEntry.totalExpense}
                      onChange={(e) => setCurrentEntry({...currentEntry, totalExpense: parseFloat(e.target.value)})}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter total expense"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Net Profit
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={currentEntry.totalRevenue - currentEntry.totalExpense}
                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 bg-gray-50"
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profit Margin
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={currentEntry.totalRevenue > 0 
                          ? ((currentEntry.totalRevenue - currentEntry.totalExpense) / currentEntry.totalRevenue * 100).toFixed(2)
                          : 0
                        }
                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 bg-gray-50"
                        disabled
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
                    <>{isEditing ? "Update Sheet" : "Add Sheet"}</>
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

export default ProfitLossSheet;