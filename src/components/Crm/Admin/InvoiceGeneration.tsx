import React, { useState, useEffect } from "react";
import {
  FileDown,
  FileText,
  Plus,
  X,
  Loader2,
  Search,
  Receipt,
  Building2,
  ChevronDown,
  Briefcase,
  Edit2,
  Trash2,
  Send,
  Calendar,
  DollarSign,
  Clock,
  ShieldCheck,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

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

interface InvoiceDetail {
  item: string;
  quantity: number;
  price: number;
}

interface Invoice {
  id: string;
  contactId: string;
  projectId: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  paymentStatus: string;
  description: string;
  notes: string;
  termsAndConditions: string;
  details: InvoiceDetail[];
  createdAt: string;
  contact: Contact;
  project: Project;
}

interface InvoiceFormData {
  contactId: string;
  projectId: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  paymentStatus: string;
  description: string;
  notes: string;
  termsAndConditions: string;
  details: InvoiceDetail[];
}

const defaultInvoiceDetail: InvoiceDetail = {
  item: "",
  quantity: 1,
  price: 0,
};

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string>("");
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const [formData, setFormData] = useState<InvoiceFormData>({
    contactId: "",
    projectId: "",
    amount: 0,
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    paymentStatus: "unpaid",
    description: "",
    notes: "",
    termsAndConditions: "",
    details: [{ ...defaultInvoiceDetail }],
  });

  useEffect(() => {
    fetchContacts();
    fetchProjects();
    fetchInvoices();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(
        "https://totem-consultancy-beta.vercel.app/api/crm/contacts"
      );
      const data = await response.json();
      setContacts(data.contacts);
    } catch (err) {
      setError("Failed to fetch contacts");
      console.error("Error fetching contacts:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        "https://totem-consultancy-beta.vercel.app/api/crm/projects"
      );
      const data = await response.json();
      setProjects(data.projectts);
    } catch (err) {
      setError("Failed to fetch projects");
      console.error("Error fetching projects:", err);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://totem-consultancy-beta.vercel.app/api/crm/invoice"
      );
      const data = await response.json();
      setInvoices(data.invoices);
    } catch (err) {
      setError("Failed to fetch invoices");
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (invoices.length === 0) return;

    const headers = [
      "Invoice Date",
      "Due Date",
      "Client",
      "Project",
      "Description",
      "Amount",
      "Status",
    ];
    const csvData = invoices.map((invoice) => [
      new Date(invoice.invoiceDate).toLocaleDateString(),
      new Date(invoice.dueDate).toLocaleDateString(),
      invoice.contact.name,
      invoice.project.name,
      invoice.description,
      formatCurrency(invoice.amount),
      invoice.paymentStatus,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "invoices.csv";
    link.click();
  };

  const downloadPDF = () => {
    if (invoices.length === 0) return;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text("Invoices Report", 14, 22);

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

    const tableData = invoices.map((invoice) => [
      new Date(invoice.invoiceDate).toLocaleDateString(),
      new Date(invoice.dueDate).toLocaleDateString(),
      invoice.contact.name,
      invoice.project.name,
      invoice.description,
      formatCurrency(invoice.amount),
      invoice.paymentStatus,
    ]);

    (doc as any).autoTable({
      head: [
        [
          "Invoice Date",
          "Due Date",
          "Client",
          "Project",
          "Description",
          "Amount",
          "Status",
        ],
      ],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    doc.save("invoices.pdf");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = editingInvoice
        ? `https://totem-consultancy-beta.vercel.app/api/crm/invoice/${editingInvoice.id}`
        : "https://totem-consultancy-beta.vercel.app/api/crm/invoice";

      const response = await fetch(url, {
        method: editingInvoice ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: calculateTotalAmount(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save invoice");
      }

      setSuccess(
        editingInvoice
          ? "Invoice updated successfully!"
          : "Invoice created successfully!"
      );
      resetForm();
      await fetchInvoices();

      setTimeout(() => {
        setIsOpen(false);
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save invoice");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;

    setDeleteLoading(invoiceId);
    try {
      const response = await fetch(
        `https://totem-consultancy-beta.vercel.app/api/crm/invoice/${invoiceId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete invoice");
      }

      setSuccess("Invoice deleted successfully!");
      fetchInvoices();

      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete invoice");
    } finally {
      setDeleteLoading("");
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      contactId: invoice.contactId,
      projectId: invoice.projectId,
      amount: invoice.amount,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      paymentStatus: invoice.paymentStatus,
      description: invoice.description,
      notes: invoice.notes,
      termsAndConditions: invoice.termsAndConditions,
      details: invoice.details,
    });
    setIsOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDetailChange = (
    index: number,
    field: keyof InvoiceDetail,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail
      ),
    }));
  };

  const addDetail = () => {
    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, { ...defaultInvoiceDetail }],
    }));
  };

  const removeDetail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  const calculateTotalAmount = () => {
    return formData.details.reduce(
      (total, detail) => total + detail.quantity * detail.price,
      0
    );
  };

  const resetForm = () => {
    setFormData({
      contactId: "",
      projectId: "",
      amount: 0,
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      paymentStatus: "unpaid",
      description: "",
      notes: "",
      termsAndConditions: "",
      details: [{ ...defaultInvoiceDetail }],
    });
    setEditingInvoice(null);
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleDownloadClick = (type: "csv" | "pdf") => {
    if (type === "csv") {
      downloadCSV();
    } else {
      downloadPDF();
    }
    setShowDownloadMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".download-dropdown")) {
        setShowDownloadMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 dark:bg-blue-500 p-3 rounded-xl">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Invoices
              </h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Manage your invoices
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-end self-end">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetForm();
                  setIsOpen(true);
                }}
                className="inline-flex items-center sm:px-4 sm:py-2 px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Invoice
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
                        onClick={() => handleDownloadClick("csv")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <FileDown className="h-4 w-4 mr-2" />
                        Download CSV
                      </button>
                      <button
                        onClick={() => handleDownloadClick("pdf")}
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
              placeholder="Search invoices..."
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

        {/* Invoices List */}
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
                        Invoice Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Client & Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {invoice.description}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {invoice.details.length} items
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {invoice.contact.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {invoice.project.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(invoice.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              invoice.paymentStatus === "paid"
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                            }`}
                          >
                            {invoice.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <div>
                              Invoice:{" "}
                              {new Date(
                                invoice.invoiceDate
                              ).toLocaleDateString()}
                            </div>
                            <div>
                              Due:{" "}
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-4">
                            <button
                              onClick={() => handleEdit(invoice)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(invoice.id)}
                              disabled={deleteLoading === invoice.id}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors disabled:text-red-300 dark:disabled:text-red-700"
                            >
                              {deleteLoading === invoice.id ? (
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
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {invoice.description}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {invoice.details.length} items
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          disabled={deleteLoading === invoice.id}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors disabled:text-red-300 dark:disabled:text-red-700"
                        >
                          {deleteLoading === invoice.id ? (
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
                            {invoice.contact.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Briefcase className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <span className="text-gray-900 dark:text-white">
                            {invoice.project.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <div className="text-gray-500 dark:text-gray-400">
                          <div>
                            Invoice:{" "}
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </div>
                          <div>
                            Due:{" "}
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.paymentStatus === "paid"
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                        }`}
                      >
                        {invoice.paymentStatus}
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
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl relative my-8">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      {contacts.map((contact) => (
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
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      name="invoiceDate"
                      value={formData.invoiceDate}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter invoice description"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes"
                    />
                  </div>

                  {editingInvoice && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Status
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              paymentStatus: "unpaid",
                            }))
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            formData.paymentStatus === "unpaid"
                              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-2 border-yellow-500"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          Unpaid
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              paymentStatus: "paid",
                            }))
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            formData.paymentStatus === "paid"
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-2 border-green-500"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          Paid
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Terms and Conditions
                    </label>
                    <textarea
                      name="termsAndConditions"
                      value={formData.termsAndConditions}
                      onChange={handleChange}
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter terms and conditions"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Invoice Items
                      </label>
                      <button
                        type="button"
                        onClick={addDetail}
                        className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.details.map((detail, index) => (
                        <div key={index} className="flex gap-4 items-start">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={detail.item}
                              onChange={(e) =>
                                handleDetailChange(
                                  index,
                                  "item",
                                  e.target.value
                                )
                              }
                              placeholder="Item description"
                              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="w-24">
                            <input
                              type="number"
                              value={detail.quantity}
                              onChange={(e) =>
                                handleDetailChange(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value)
                                )
                              }
                              min="1"
                              placeholder="Qty"
                              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="w-32">
                            <input
                              type="number"
                              value={detail.price}
                              onChange={(e) =>
                                handleDetailChange(
                                  index,
                                  "price",
                                  parseFloat(e.target.value)
                                )
                              }
                              min="0"
                              step="0.01"
                              placeholder="Price"
                              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="w-32 text-right pt-2">
                            {formatCurrency(detail.quantity * detail.price)}
                          </div>
                          {formData.details.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDetail(index)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-right">
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        Total: {formatCurrency(calculateTotalAmount())}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      resetForm();
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
                        {editingInvoice ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        {editingInvoice ? "Update" : "Create"}
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
}

export default App;
