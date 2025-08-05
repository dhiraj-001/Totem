import React, { useState } from 'react';
import { UserPlus, Users, ShieldCheck } from 'lucide-react';

interface UserFormProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onSubmit: (data: any) => Promise<void>;
  showDesignation?: boolean;
}

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'admin' | 'manager' | 'member'>('admin');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const UserForm: React.FC<UserFormProps> = ({ title, description, icon: Icon, onSubmit, showDesignation }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      designation: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit(formData);
      setFormData({ name: '', email: '', password: '', designation: '' }); // Reset form
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                     focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                     bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                     focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                     bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Enter email"
            />
          </div>

          {showDesignation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                       focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                       bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Enter designation"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                     focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                     bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Enter password"
            />
          </div>

          <div className="flex justify-start">
            <button
              type="submit"
              className="bg-blue-600 text-white text-sm py-3 px-6 rounded-md 
                     hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                     dark:focus:ring-offset-gray-800 transition-colors"
            >
              Add {title}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const handleAdminSubmit = async (data: { name: string; email: string; password: string }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/auth/register-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to register admin');
      }

      setSuccessMessage('Admin registered successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error registering admin:', error);
    }
  };

  const handleManagerSubmit = async (data: { name: string; email: string; password: string; designation: string }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/auth/register-user?role=manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          designation: data.designation
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register manager');
      }

      setSuccessMessage('Manager registered successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error registering manager:', error);
    }
  };

  const handleTeamMemberSubmit = async (data: { name: string; email: string; password: string; designation: string }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://totem-consultancy-beta.vercel.app/api/auth/register-user?role=teammember', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          designation: data.designation
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register team member');
      }

      setSuccessMessage('Team member registered successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error registering team member:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your team members and their roles</p>
        </div>

        {successMessage && (
          <div className="mb-4 p-4 rounded-md bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800">
            <p className="text-green-800 dark:text-green-200 text-sm font-medium">
              {successMessage}
            </p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'admin', label: 'Admin' },
              { id: 'manager', label: 'Manager' },
              { id: 'member', label: 'Team Member' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as 'admin' | 'manager' | 'member')}
                className={`px-4 py-2 font-medium text-sm focus:outline-none transition-colors
                  ${activeTab === id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                Add {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === 'admin' && (
            <UserForm
              title="Admin"
              description="Add a new admin with full system access"
              icon={ShieldCheck}
              onSubmit={handleAdminSubmit}
            />
          )}
          {activeTab === 'manager' && (
            <UserForm
              title="Manager"
              description="Add a new manager with team management capabilities"
              icon={UserPlus}
              onSubmit={handleManagerSubmit}
              showDesignation={true}
            />
          )}
          {activeTab === 'member' && (
            <UserForm
              title="Team Member"
              description="Add a new team member to your organization"
              icon={Users}
              onSubmit={handleTeamMemberSubmit}
              showDesignation={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;