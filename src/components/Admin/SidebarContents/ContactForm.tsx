import React, { useState, useEffect } from 'react';
import { Trash2, Loader, AlertCircle, RefreshCw, Mail, Briefcase, MessageSquare } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  service: string;
  message: string;
}

const ContactsManager: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [refreshRotate, setRefreshRotate] = useState<boolean>(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setRefreshRotate(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/contact');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load contacts. Please try again later.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setRefreshRotate(false), 600);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this contact?")) {
      return;
    }
    
    setDeleteLoading(id);
    
    try {
      const response = await fetch(`http://localhost:5000/api/contact/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete contact: ${response.status} ${response.statusText}`);
      }
      
      setContacts(contacts.filter(contact => contact.id !== id));
    } catch (err) {
      console.error("Error deleting contact:", err);
      alert("Failed to delete contact. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-gradient-to-b from-blue-950/5 to-black/5 min-h-screen">
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-800 p-6 sm:p-8 mb-16 rounded-2xl shadow-xl border border-blue-600/20">
        <div className="absolute -bottom-3 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Contact Requests</h1>
            <p className="text-sm sm:text-base text-blue-200/80 mt-2">View and manage customer inquiries</p>
            <div className="hidden sm:block absolute -bottom-4 left-0 w-16 h-1 bg-blue-400"></div>
          </div>
          <button
            onClick={fetchContacts}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 disabled:opacity-70 group"
          >
            <RefreshCw className={`w-5 h-5 ${refreshRotate ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 p-5 text-red-100 bg-gradient-to-r from-red-900/60 to-red-800/60 rounded-xl border border-red-700/30 shadow-lg">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <p>{error}</p>
        </div>
      )}

      {isLoading && contacts.length === 0 ? (
        <div className="flex flex-col justify-center items-center p-16">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-blue-400 animate-pulse">Loading contact requests...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-24 px-6">
          <div className="w-20 h-20 rounded-full bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-blue-400/70" />
          </div>
          <h3 className="text-xl font-medium text-blue-500 mb-2">No contact requests</h3>
          <p className="text-gray-400 max-w-md mx-auto">You don't have any contact requests at the moment. New inquiries will appear here when received.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {contacts.map(contact => (
            <div key={contact.id} className="relative bg-gradient-to-b from-black to-blue-900 p-7 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-blue-800/30 overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              
              <div className="flex flex-col lg:flex-row justify-between">
                <div className="mb-5 lg:mb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                      <span className="text-blue-300 font-semibold text-lg">{contact.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-blue-300">{contact.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-3 h-3 text-blue-400/70" />
                        <a href={`mailto:${contact.email}`} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 bg-blue-900/30 rounded-full py-1.5 px-3 w-fit">
                    <Briefcase className="w-3.5 h-3.5 text-blue-400/80" />
                    <p className="text-sm text-blue-300">{contact.service}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <button
                    onClick={() => handleDelete(contact.id)}
                    disabled={deleteLoading === contact.id}
                    className="p-2.5 bg-blue-900/50 text-blue-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-300 disabled:opacity-50"
                    title="Delete contact"
                  >
                    {deleteLoading === contact.id ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mt-5 p-5 bg-gradient-to-r from-black/60 to-blue-950/40 rounded-xl border border-blue-900/30">
                <div className="flex gap-2 mb-2 items-center">
                  <MessageSquare className="w-4 h-4 text-blue-400/80" />
                  <h4 className="text-blue-300 font-medium">Message</h4>
                </div>
                <p className="text-gray-300 leading-relaxed pl-6">{contact.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactsManager;

