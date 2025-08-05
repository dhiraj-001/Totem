import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Loader2,
  Search,
  FileText,
  Building2,
  Briefcase,
  Edit2,
  FileDown,
  Trash2,
  Send,
  Calendar,
  HandHelping
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  isClient: boolean;
}

interface Project {
  id: string;
  name: string;
  desc: string;
  status: string;
  contactId: string;
}

interface Proposal {
  id: string;
  title: string;
  desc: string;
  contactId: string;
  projectId: string;
  status: string;
  createdAt: string;
  contact: Contact;
  project: Project;
}

interface ProposalFormData {
  title: string;
  desc: string;
  contactId: string;
  projectId: string;
  status: string;
}

const ProposalForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string>('');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const [formData, setFormData] = useState<ProposalFormData>({
    title: '',
    desc: '',
    contactId: '',
    projectId: '',
    status: 'sent'
  });

  useEffect(() => {
    fetchContacts();
    fetchProjects();
    fetchProposals();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/contacts');
      const data = await response.json();
      setContacts(data.contacts);
    } catch (err) {
      setError('Failed to fetch contacts');
      console.error('Error fetching contacts:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/projects');
      const data = await response.json();
      setProjects(data.projectts);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Error fetching projects:', err);
    }
  };

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/proposal');
      const data = await response.json();
      setProposals(data.proposals);
    } catch (err) {
      setError('Failed to fetch proposals');
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (proposalId: string) => {
    if (!window.confirm('Are you sure you want to delete this proposal?')) return;

    setDeleteLoading(proposalId);
    try {
      const response = await fetch(
        `https://totem-consultancy-beta.vercel.app/api/crm/proposal/${proposalId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete proposal');
      }

      setSuccess('Proposal deleted successfully!');
      fetchProposals();

      setTimeout(() => {
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete proposal');
    } finally {
      setDeleteLoading('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = editingProposal 
        ? `https://totem-consultancy-beta.vercel.app/api/crm/proposal/${editingProposal.id}`
        : 'https://totem-consultancy-beta.vercel.app/api/crm/proposal';

      const response = await fetch(url, {
        method: editingProposal ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save proposal');
      }

      setSuccess(editingProposal ? 'Proposal updated successfully!' : 'Proposal created successfully!');
      setFormData({
        title: '',
        desc: '',
        contactId: '',
        projectId: '',
        status: 'sent'
      });
      await fetchProposals();
      setEditingProposal(null);

      setTimeout(() => {
        setIsOpen(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save proposal');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setFormData({
      title: proposal.title,
      desc: proposal.desc,
      contactId: proposal.contactId,
      projectId: proposal.projectId,
      status: proposal.status
    });
    setIsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const filteredProposals = proposals.filter(
    (proposal) =>
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const downloadCSV = () => {
    if (proposals.length === 0) return;

    const headers = ['Title', 'Description', 'Client', 'Project', 'Status', 'Created At'];
    const csvData = proposals.map(proposal => [
      proposal.title,
      proposal.desc,
      proposal.contact.name,
      proposal.project.name,
      proposal.status,
      new Date(proposal.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'proposals.csv';
    link.click();
  };

  const downloadPDF = () => {
    if (proposals.length === 0) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Proposals Report', 14, 22);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

    const tableData = proposals.map(proposal => [
      proposal.title,
      proposal.desc,
      proposal.contact.name,
      proposal.project.name,
      proposal.status,
      new Date(proposal.createdAt).toLocaleDateString()
    ]);

    (doc as any).autoTable({
      head: [['Title', 'Description', 'Client', 'Project', 'Status', 'Created At']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    doc.save('proposals.pdf');
  };

  const handleDownloadClick = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      downloadCSV();
    } else {
      downloadPDF();
    }
    setShowDownloadMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 dark:bg-blue-500 p-3 rounded-xl">
              <HandHelping className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Proposals
              </h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Manage your proposals
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-end self-end">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingProposal(null);
                  setFormData({
                    title: '',
                    desc: '',
                    contactId: '',
                    projectId: '',
                    status: 'sent'
                  });
                  setIsOpen(true);
                }}
                className="inline-flex items-center sm:px-4 sm:py-2 px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Proposal
              </button>
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
              placeholder="Search proposals..."
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

        {/* Proposals List */}
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
                        Proposal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProposals.map((proposal) => (
                      <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {proposal.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {proposal.desc}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {proposal.contact.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {proposal.contact.company}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {proposal.project.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {proposal.project.status}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            {proposal.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-4">
                            <button
                              onClick={() => handleEdit(proposal)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(proposal.id)}
                              disabled={deleteLoading === proposal.id}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors disabled:text-red-300 dark:disabled:text-red-700"
                            >
                              {deleteLoading === proposal.id ? (
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
              {filteredProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {proposal.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {proposal.desc}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(proposal)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(proposal.id)}
                          disabled={deleteLoading === proposal.id}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors disabled:text-red-300 dark:disabled:text-red-700"
                        >
                          {deleteLoading === proposal.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Building2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <span className="text-gray-900 dark:text-white">
                            {proposal.contact.name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {' '}
                            - {proposal.contact.company}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Briefcase className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <span className="text-gray-900 dark:text-white">
                            {proposal.project.name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {' '}
                            - {proposal.project.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-500 dark:text-gray-400">
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        {proposal.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal Form */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md relative my-4 sm:my-0">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {editingProposal ? 'Edit Proposal' : 'Create New Proposal'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setEditingProposal(null);
                      setFormData({
                        title: '',
                        desc: '',
                        contactId: '',
                        projectId: '',
                        status: 'sent'
                      });
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter proposal title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="desc"
                    value={formData.desc}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter proposal description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact
                  </label>
                  <select
                    name="contactId"
                    value={formData.contactId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a contact</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} - {contact.company}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project
                  </label>
                  <select
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setEditingProposal(null);
                      setFormData({
                        title: '',
                        desc: '',
                        contactId: '',
                        projectId: '',
                        status: 'sent'
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors disabled:bg-blue-400 dark:disabled:bg-blue-400"
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {editingProposal ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        {editingProposal ? 'Update Proposal' : 'Create Proposal'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalForm;