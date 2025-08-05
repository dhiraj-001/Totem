import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, X, Loader2, Receipt, Calendar, DollarSign, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import edit from '../../HR/assets/edit.png';
import del from '../../HR/assets/trash.png';

interface CashFlowEntry {
  id: string;
  type: string;
  transactionDetail: string;
  amount: string;
  date: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CashFlowInput {
  type: string;
  transactionDetail: string;
  amount: number;
  date: string;
  status: string;
  id?: string;
}

function CashFlow() {
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [currentEntry, setCurrentEntry] = useState<CashFlowInput>({
    type: 'Expense',
    transactionDetail: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/finance-cash-flow');
      if (!response.ok) throw new Error('Failed to fetch entries');
      const data = await response.json();
      setEntries(data.entries);
    } catch (error) {
      toast.error('Failed to fetch cash flow entries');
      console.error('Error fetching entries:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      const formattedData = {
        type: currentEntry.type,
        transactionDetail: currentEntry.transactionDetail,
        amount: currentEntry.amount,
        date: new Date(currentEntry.date).toISOString(),
        status: currentEntry.status
      };

      const url = isEditing 
        ? `https://totem-consultancy-beta.vercel.app/api/crm/finance-cash-flow/${currentEntry.id}`
        : 'https://totem-consultancy-beta.vercel.app/api/crm/finance-cash-flow';
      
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
        const response = await fetch(`https://totem-consultancy-beta.vercel.app/api/crm/finance-cash-flow/${id}`, {
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

  const handleEdit = (entry: CashFlowEntry) => {
    setCurrentEntry({
      id: entry.id,
      type: entry.type,
      transactionDetail: entry.transactionDetail,
      amount: parseFloat(entry.amount),
      date: new Date(entry.date).toISOString().split('T')[0],
      status: entry.status
    });
    
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentEntry({
      type: 'Expense',
      transactionDetail: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
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
        <h3 className="text-2xl font-bold text-gray-800">Cash Flow</h3>
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
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Transaction Detail</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <tr key={entry.id} className="text-sm">
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    entry.type === 'Income' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {entry.type}
                  </span>
                </td>
                <td className="py-4">{entry.transactionDetail}</td>
                <td className="py-4">${parseFloat(entry.amount).toFixed(2)}</td>
                <td className="py-4">{format(new Date(entry.date), 'dd MMM, yyyy')}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    entry.status === 'Completed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {entry.status}
                  </span>
                </td>
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
                    Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <ArrowUpDown className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      value={currentEntry.type}
                      onChange={(e) => setCurrentEntry({...currentEntry, type: e.target.value})}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    >
                      <option value="Expense">Expense</option>
                      <option value="Income">Income</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Detail <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={currentEntry.transactionDetail}
                      onChange={(e) => setCurrentEntry({...currentEntry, transactionDetail: e.target.value})}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter transaction detail"
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
                      value={currentEntry.amount}
                      onChange={(e) => setCurrentEntry({...currentEntry, amount: parseFloat(e.target.value)})}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={currentEntry.date}
                      onChange={(e) => setCurrentEntry({...currentEntry, date: e.target.value})}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentEntry.status}
                    onChange={(e) => setCurrentEntry({...currentEntry, status: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
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

export default CashFlow;