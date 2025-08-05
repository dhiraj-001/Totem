import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Loader2,
  Save,
  AlertCircle,
  FileText,
  Search,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Users,
  Building2,
  IndianRupee,
  ReceiptText,
} from 'lucide-react';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
}

interface Contract {
  id?: string;
  title: string;
  desc: string;
  startDate: string;
  endDate: string;
  contactId: string;
  contractType: 'executory' | 'unilateral' | 'bilateral';
  contractValue: number;
}

function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const initialFormState: Contract = {
    title: '',
    desc: '',
    startDate: '',
    endDate: '',
    contactId: '',
    contractType: 'executory',
    contractValue: 0,
  };

  const [formData, setFormData] = useState<Contract>(initialFormState);

  useEffect(() => {
    fetchContacts();
    fetchContracts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/contacts');
      const data = await response.json();
      setContacts(data.contacts);
    } catch (err) {
      setError('Failed to fetch contacts');
    }
  };

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/contract');
      const data = await response.json();
      setContracts(data.contracts || []);
    } catch (err) {
      setError('Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = modalMode === 'edit' 
        ? `https://totem-consultancy-beta.vercel.app/api/crm/contract/${currentContract?.id}`
        : 'https://totem-consultancy-beta.vercel.app/api/crm/contract';
      
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save contract');
      
      setSuccess(`Contract ${modalMode === 'edit' ? 'updated' : 'created'} successfully!`);
      await fetchContracts();
      
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData(initialFormState);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError('Failed to save contract');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) return;
    
    setDeleteLoading(id);
    try {
      const response = await fetch(`https://totem-consultancy-beta.vercel.app/api/crm/contract/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete contract');
      
      setSuccess('Contract deleted successfully!');
      await fetchContracts();
      
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError('Failed to delete contract');
    } finally {
      setDeleteLoading("");
    }
  };

  const openModal = (mode: 'create' | 'edit' | 'view', contract?: Contract) => {
    setModalMode(mode);
    setCurrentContract(contract || null);
    setFormData(contract || initialFormState);
    setIsModalOpen(true);
  };

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contacts.find(c => c.id === contract.contactId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadCSV = () => {
    if (contracts.length === 0) return;
  
    const headers = ['Title', 'Description', 'Contact', 'Company', 'Start Date', 'End Date', 'Contract Type', 'Contract Value'];
    const csvData = contracts.map(contract => {
      const contact = contacts.find(c => c.id === contract.contactId);
      return [
        contract.title,
        contract.desc,
        contact?.name || 'Unknown',
        contact?.company || 'N/A',
        new Date(contract.startDate).toLocaleDateString(),
        new Date(contract.endDate).toLocaleDateString(),
        contract.contractType,
        contract.contractValue.toLocaleString('en-IN')
      ];
    });
  
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'contracts.csv';
    link.click();
  };
  
  const downloadPDF = () => {
    if (contracts.length === 0) return;
  
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Contracts Report', 14, 22);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
  
    const tableData = contracts.map(contract => {
      const contact = contacts.find(c => c.id === contract.contactId);
      return [
        contract.title,
        contract.desc,
        contact?.name || 'Unknown',
        contact?.company || 'N/A',
        new Date(contract.startDate).toLocaleDateString(),
        new Date(contract.endDate).toLocaleDateString(),
        contract.contractType,
        `₹${contract.contractValue.toLocaleString('en-IN')}`
      ];
    });
  
    (doc as any).autoTable({
      head: [['Title', 'Description', 'Contact', 'Company', 'Start Date', 'End Date', 'Contract Type', 'Contract Value']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });
  
    doc.save('contracts.pdf');
  };
  
  const handleDownloadClick = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      downloadCSV();
    } else {
      downloadPDF();
    }
    setShowDownloadMenu(false);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.download-dropdown')) {
        setShowDownloadMenu(false);
      }
    };
  
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 dark:bg-blue-500 p-3 rounded-xl">
              <ReceiptText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Contracts
              </h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Manage your contracts
              </p>
            </div>
          </div>
          <div className="flex justify-end items-center gap-2">
            <button
              onClick={() => openModal('create')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Contract
            </button>
            <div className="flex items-center gap-2">
  <div className="relative download-dropdown">
    <button
      onClick={() => setShowDownloadMenu(!showDownloadMenu)}
      className="inline-flex items-center p-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
      aria-label="Download options"
    >
      <FileDown className="h-5 w-5" />
    </button>
    {showDownloadMenu && (
      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
        <div className="py-1">
          <button
            onClick={() => handleDownloadClick('csv')}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download CSV
          </button>
          <button
            onClick={() => handleDownloadClick('pdf')}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>
    )}
  </div>
</div>
          </div>
          
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Contracts List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-500" />
          </div>
        ) : (
          <>
            {/* Desktop View - Table */}
            <div className="hidden lg:block">
              <div className="shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contract Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredContracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {contract.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {contract.desc}
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 mt-1 capitalize">
                              {contract.contractType}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {contacts.find(c => c.id === contract.contactId)?.name || 'Unknown'}
                            </span>
                          </div>
                          {contacts.find(c => c.id === contract.contactId)?.company && (
                            <div className="flex items-center gap-2 mt-1">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {contacts.find(c => c.id === contract.contactId)?.company}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div className="text-sm text-gray-900 dark:text-white">
                              {new Date(contract.startDate).toLocaleDateString()} - 
                              {new Date(contract.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {contract.contractValue.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => openModal('view', contract)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => openModal('edit', contract)}
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(contract.id!)}
                              disabled={deleteLoading === contract.id}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:text-red-300 dark:disabled:text-red-700"
                            >
                              {deleteLoading === contract.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View - Cards */}
            <div className="lg:hidden space-y-4">
              {filteredContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {contract.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {contract.desc}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 mt-2 capitalize">
                          {contract.contractType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => openModal('view', contract)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openModal('edit', contract)}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(contract.id!)}
                          disabled={deleteLoading === contract.id}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:text-red-300 dark:disabled:text-red-700"
                        >
                          {deleteLoading === contract.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {contacts.find(c => c.id === contract.contactId)?.name || 'Unknown'}
                        </span>
                      </div>
                      {contacts.find(c => c.id === contract.contactId)?.company && (
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {contacts.find(c => c.id === contract.contactId)?.company}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(contract.startDate).toLocaleDateString()} - 
                          {new Date(contract.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <IndianRupee className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {contract.contractValue.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl relative my-4 sm:my-0">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {modalMode === 'create' ? 'New Contract' : 
                     modalMode === 'edit' ? 'Edit Contract' : 'View Contract'}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      disabled={modalMode === 'view'}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.desc}
                      onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                      disabled={modalMode === 'view'}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        disabled={modalMode === 'view'}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        disabled={modalMode === 'view'}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact
                    </label>
                    <select
                      value={formData.contactId}
                      onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                      disabled={modalMode === 'view'}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="">Select a contact</option>
                      {contacts.map((contact) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.name} - {contact.company}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contract Type
                    </label>
                    <select
                      value={formData.contractType}
                      onChange={(e) => setFormData({ ...formData, contractType: e.target.value as Contract['contractType'] })}
                      disabled={modalMode === 'view'}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="executory">Executory</option>
                      <option value="unilateral">Unilateral</option>
                      <option value="bilateral">Bilateral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contract Value (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={formData.contractValue}
                        onChange={(e) => setFormData({ ...formData, contractValue: Number(e.target.value) })}
                        disabled={modalMode === 'view'}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                {modalMode !== 'view' && (
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors disabled:bg-blue-400 dark:disabled:bg-blue-400"
                    >
                      {formLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Contract
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;