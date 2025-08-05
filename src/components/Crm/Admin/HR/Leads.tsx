import { useState, useEffect } from 'react';
import bulb from './assets/bulb.png';
import del from './assets/trash.png';
import edit from './assets/edit.png';

interface TeamMember {
  id: string;
  imageURL: string;
  name: string;
  personalMail: string;
  mobile: string;
  jobTitle: string;
}

interface Lead {
  id: string;
  name: string;
  source: string;
  status: string;
  assignedTeammId: string;
  value: number;
  createdAt: string;
  updatedAt: string;
  assignedTo: TeamMember;
}

interface CreateLeadInput {
  name: string;
  source: string;
  status: string;
  assignedTeammId: string;
  value: number;
}

const BASE_URL = 'https://totem-consultancy-beta.vercel.app/api/crm';

const Lead = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const stages = [
    "Non Contacted",
    "Contacted",
    "Sampling",
    "Proposal",
    "Negotiation",
    "Closed",
    "Won",
    // "Prospecting"
  ];

  const [formData, setFormData] = useState({
    name: '',
    source: '',
    status: 'NEW',
    assignedTeammId: '',
    value: 0,
  });

  useEffect(() => {
    fetchLeads();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (editingLead) {
      setFormData({
        name: editingLead.name,
        source: editingLead.source,
        status: editingLead.status,
        assignedTeammId: editingLead.assignedTeammId,
        value: editingLead.value,
      });
    }
  }, [editingLead]);

  const fetchLeads = async () => {
    try {
      const response = await fetch(`${BASE_URL}/leads`);
      const data = await response.json();
      setLeads(data.leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError('Failed to fetch leads');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/teamm`);
      const data = await response.json();
      setTeamMembers(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to fetch team members');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      const options = {
        method: editingLead ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      };

      const url = editingLead 
        ? `${BASE_URL}/leads/${editingLead.id}`
        : `${BASE_URL}/leads`;

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to save lead');

      setSuccess(editingLead ? 'Lead updated successfully!' : 'Lead created successfully!');
      fetchLeads();
      setShowForm(false);
      setEditingLead(null);

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save lead');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const response = await fetch(`${BASE_URL}/leads/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete lead');
      
      fetchLeads();
      setSuccess('Lead deleted successfully!');
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting lead:', error);
      setError('Failed to delete lead');
    }
  };

  const getLeadsByStage = (stage: string) => {
    const stageMap: { [key: string]: string } = {
      "Non Contacted": "NON_CONTACTED",
      "Contacted": "CONTACTED",
      "Sampling": "SAMPLING",
      "Proposal": "PROPOSAL",
      "Negotiation": "NEGOTIATION",
      "Closed": "CLOSED",
      "Won": "WON",
      // "Prospecting": "PROSPECTING"
    };
    return leads.filter(lead => lead.status === stageMap[stage]);
  };

  return (
    <div className="bg-pink-50 min-h-screen p-6">
      <div className="mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-gray-800 rounded-xl w-[78px] h-[70px] flex items-center justify-center">
            <img src={bulb} className='h-12' alt="Leads icon" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Leads</h1>
            <p className="text-gray-600 font-semibold mt-1">Manage lead sheet</p>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button 
            onClick={() => {
              setEditingLead(null);
              setFormData({
                name: '',
                source: '',
                status: 'NEW',
                assignedTeammId: '',
                value: 0,
              });
              setShowForm(true);
            }}
            className="bg-gray-800 text-white px-4 py-4 rounded-lg flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Lead
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto pb-4 mb-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {stages.map((stage, index) => {
            const stageLeads = getLeadsByStage(stage);
            return (
              <div key={index} className="w-64 flex-shrink-0">
                <div className="bg-gray-800 text-white p-4 rounded-xl mb-3 text-center font-medium">
                  {stage}
                </div>
                <div className="space-y-3">
  {stageLeads.map((lead) => (
    <div key={lead.id} className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-blue-500 font-medium">{lead.name}</p>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        <p className="text-gray-700">${lead.value.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-blue-500 font-medium">{lead.assignedTo?.name || 'Unassigned'}</p>
        <p className="text-gray-700">{new Date(lead.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  ))}
</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200 p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4 font-medium text-gray-700 pb-2 border-b">
            <div>Lead Name</div>
            <div>Lead Source</div>
            <div>Status</div>
            <div>Assigned Sales Person</div>
            <div>Lead Value</div>
          </div>
          {leads.map((lead) => (
            <div className="grid grid-cols-5 gap-4 items-center">
            <div>{lead.name}</div>
            <div>{lead.source}</div>
            <div>{lead.status}</div>
            <div>{lead.assignedTo?.name || 'Unassigned'}</div>
            <div className="flex justify-between items-center">
              <span>${lead.value.toLocaleString()}</span>
              <div className="flex gap-2">
                <img 
                  src={del} 
                  className="cursor-pointer" 
                  onClick={() => handleDeleteLead(lead.id)}
                  alt="Delete"
                />
                <img 
                  src={edit} 
                  className="cursor-pointer" 
                  onClick={() => {
                    setEditingLead(lead);
                    setShowForm(true);
                  }}
                  alt="Edit"
                />
              </div>
            </div>
          </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingLead(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Source <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    >
                      <option value="NON_CONTACTED">Non Contacted</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="SAMPLING">Sampling</option>
                      <option value="PROPOSAL">Proposal</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="CLOSED">Closed</option>
                      <option value="WON">Won</option>
                      {/* <option value="PROSPECTING">Prospecting</option> */}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.assignedTeammId}
                      onChange={(e) => setFormData({ ...formData, assignedTeammId: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Team Member</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingLead(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                >
                  {formLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {editingLead ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    editingLead ? 'Update Lead' : 'Create Lead'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Lead;