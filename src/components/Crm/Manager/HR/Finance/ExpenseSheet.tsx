import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, X, Loader2, FileText, Calendar, DollarSign, User } from 'lucide-react';
import toast from 'react-hot-toast';
import edit from '../../HR/assets/edit.png';
import del from '../../HR/assets/trash.png';

interface Expense {
  id: string;
  expenseType: string;
  description: string;
  beneficiaryName: string;
  amount: number;
  date: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseInput {
  expenseType: string;
  description: string;
  beneficiaryName: string;
  amount: number;
  date: string;
  paymentStatus: string;
}

function ExpenseSheet() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [currentExpense, setCurrentExpense] = useState<ExpenseInput>({
    expenseType: '',
    description: '',
    beneficiaryName: '',
    amount: 0,
    date: '',
    paymentStatus: 'Pending'
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/expsheet');
      const data = await response.json();
      if (data.success) {
        setExpenses(data.expenses);
      }
    } catch (error) {
      toast.error('Failed to fetch expenses');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      const formattedData = {
        ...currentExpense,
        date: new Date(currentExpense.date).toISOString(),
        amount: Number(currentExpense.amount)
      };

      const url = isEditing 
        ? `https://totem-consultancy-beta.vercel.app/api/crm/expsheet/${currentExpense.id}`
        : 'https://totem-consultancy-beta.vercel.app/api/crm/expsheet';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        setSuccess(isEditing ? 'Expense updated successfully' : 'Expense created successfully');
        toast.success(isEditing ? 'Expense updated successfully' : 'Expense created successfully');
        setTimeout(() => {
          setIsModalOpen(false);
          resetForm();
          setSuccess("");
        }, 2000);
        fetchExpenses();
      } else {
        throw new Error('Failed to save expense');
      }
    } catch (error) {
      setError(isEditing ? 'Failed to update expense' : 'Failed to create expense');
      toast.error(isEditing ? 'Failed to update expense' : 'Failed to create expense');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const response = await fetch(`https://totem-consultancy-beta.vercel.app/api/crm/expsheet/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Expense deleted successfully');
          fetchExpenses();
        }
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const handleEdit = (expense: Expense) => {
    setCurrentExpense({
      ...expense,
      amount: Number(expense.amount),
      date: new Date(expense.date).toISOString().split('T')[0],
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentExpense({
      expenseType: '',
      description: '',
      beneficiaryName: '',
      amount: 0,
      date: '',
      paymentStatus: 'Pending'
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Expense Sheet</h3>
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
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="pb-3 font-medium">Expense Type</th>
              <th className="pb-3 font-medium">Description</th>
              <th className="pb-3 font-medium">Beneficiary Name</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Payment Status</th>
              <th className="pb-3 font-medium">Download Receipt</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {expenses.map((expense) => (
              <tr key={expense.id} className="text-sm">
                <td className="py-4">{expense.expenseType}</td>
                <td className="py-4">{expense.description}</td>
                <td className="py-4">{expense.beneficiaryName}</td>
                <td className="py-4">${Number(expense.amount).toFixed(2)}</td>
                <td className="py-4">{format(new Date(expense.date), 'dd MMM, yyyy')}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    expense.paymentStatus === 'Paid' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {expense.paymentStatus}
                  </span>
                </td>
                <td className="py-4">
                  <button className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
                    Download
                  </button>
                </td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDelete(expense.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <img src={del} className="h-5" alt="Delete" />
                    </button>
                    <button 
                      onClick={() => handleEdit(expense)}
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
                {isEditing ? 'Edit Expense' : 'Add New Expense'}
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
                    Expense Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={currentExpense.expenseType}
                      onChange={(e) => setCurrentExpense({...currentExpense, expenseType: e.target.value})}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter expense type"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={currentExpense.description}
                    onChange={(e) => setCurrentExpense({...currentExpense, description: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter description"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beneficiary Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={currentExpense.beneficiaryName}
                      onChange={(e) => setCurrentExpense({...currentExpense, beneficiaryName: e.target.value})}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter beneficiary name"
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
                      value={currentExpense.amount}
                      onChange={(e) => setCurrentExpense({...currentExpense, amount: parseFloat(e.target.value)})}
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
                      value={currentExpense.date}
                      onChange={(e) => setCurrentExpense({...currentExpense, date: e.target.value})}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={currentExpense.paymentStatus}
                    onChange={(e) => setCurrentExpense({...currentExpense, paymentStatus: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
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
                    <>{isEditing ? "Update Expense" : "Add Expense"}</>
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

export default ExpenseSheet;