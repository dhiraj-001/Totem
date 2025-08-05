import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, Trash2, Edit, ChevronLeft, ChevronRight, CreditCard, Plus, X, Loader2, Calendar, Building, DollarSign, User, CreditCard as Bank } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  imageURL: string | null;
}

interface Expense {
  id: string;
  item: string;
  purchaseFrom: string;
  purchaseDate: string;
  purchasedById: string;
  amount: number;
  paidBy: string;
  status: 'Approved' | 'Pending';
  purchasedBy: User;
}

const initialFormState = {
  item: '',
  purchaseFrom: '',
  purchaseDate: '',
  purchasedById: '',
  amount: 0,
  paidBy: 'Cash',
  status: 'Pending' as const
};

const ExpenseTracker: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("All Data");
  const [selectedYear, setSelectedYear] = useState("2024");

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('https://totem-consultancy-beta.vercel.app/api/crm/expense');
      const expensesWithUsers = await Promise.all(
        response.data.map(async (expense: Expense) => {
          try {
            const userResponse = await axios.get(`https://totem-consultancy-beta.vercel.app/api/crm/teamm/${expense.purchasedById}`);
            return {
              ...expense,
              purchasedBy: userResponse.data
            };
          } catch (error) {
            return {
              ...expense,
              purchasedBy: {
                id: expense.purchasedById,
                name: 'Unknown User',
                imageURL: null
              }
            };
          }
        })
      );
      setExpenses(expensesWithUsers);
    } catch (error) {
      toast.error('Failed to fetch expenses');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://totem-consultancy-beta.vercel.app/api/crm/teamm');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      if (editingId) {
        await axios.put(`https://totem-consultancy-beta.vercel.app/api/crm/expense/${editingId}`, formData);
        setSuccess('Expense updated successfully');
      } else {
        await axios.post('https://totem-consultancy-beta.vercel.app/api/crm/expense', formData);
        setSuccess('Expense created successfully');
      }
      
      setTimeout(() => {
        setShowForm(false);
        setFormData(initialFormState);
        setEditingId(null);
        setSuccess("");
      }, 2000);
      
      fetchExpenses();
    } catch (error) {
      setError(editingId ? 'Failed to update expense' : 'Failed to create expense');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      item: expense.item,
      purchaseFrom: expense.purchaseFrom,
      purchaseDate: expense.purchaseDate.split('T')[0],
      purchasedById: expense.purchasedById,
      amount: expense.amount,
      paidBy: expense.paidBy,
      status: expense.status
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      await axios.delete(`https://totem-consultancy-beta.vercel.app/api/crm/expense/${id}`);
      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  return (
    <div className="bg-pink-50 min-h-screen p-6">
      <div className="mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-gray-800 rounded-xl w-[78px] h-[70px] flex items-center justify-center">
            <CreditCard className='text-white h-11 w-16'/>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Expenses</h1>
            <p className="text-gray-600 font-semibold mt-1">Manage expense tracking</p>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button 
            onClick={() => {
              setShowForm(true);
              setFormData(initialFormState);
              setEditingId(null);
            }}
            className="bg-gray-800 text-white px-4 py-4 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h3 className="text-2xl font-semibold text-gray-900">
                {editingId ? 'Edit Expense' : 'Add New Expense'}
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
                    Item <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.item}
                      onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase From <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.purchaseFrom}
                      onChange={(e) => setFormData({ ...formData, purchaseFrom: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter vendor name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchased By <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.purchasedById}
                      onChange={(e) => setFormData({ ...formData, purchasedById: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
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
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paid By
                  </label>
                  <div className="relative">
                    <Bank className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.paidBy}
                      onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Approved' | 'Pending' })}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
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
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {editingId ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>{editingId ? "Update Expense" : "Add Expense"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-medium text-gray-800">Expenses</h1>
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="pb-3 font-medium">Item</th>
                <th className="pb-3 font-medium">Purchase From</th>
                <th className="pb-3 font-medium">Purchase Date</th>
                <th className="pb-3 font-medium">Purchased By</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Paid By</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b hover:bg-gray-50">
                  <td className="py-4">{expense.item}</td>
                  <td className="py-4">{expense.purchaseFrom}</td>
                  <td className="py-4">{new Date(expense.purchaseDate).toLocaleDateString()}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-xs overflow-hidden">
                        {expense.purchasedBy?.imageURL ? (
                          <img 
                            src={expense.purchasedBy.imageURL} 
                            alt={expense.purchasedBy.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          expense.purchasedBy?.name?.charAt(0) || '?'
                        )}
                      </div>
                      <span>{expense.purchasedBy?.name || 'Unknown User'}</span>
                    </div>
                  </td>
                  <td className="py-4">${expense.amount}</td>
                  <td className="py-4">{expense.paidBy}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      expense.status === 'Approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(expense)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
          <div>Showing 1 to {expenses.length} of {expenses.length} entries</div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 border border-gray-300 rounded bg-gray-100 text-gray-700">
              <ChevronLeft size={16} />
            </button>
            <button className="flex items-center justify-center w-8 h-8 bg-gray-800 text-white rounded-md">
              1
            </button>
            <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;