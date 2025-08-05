"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2, Search, Plus, X, ChevronDown, Edit2, Trash2, Calendar, Users, CalendarCheck } from "lucide-react"
import { format, parseISO } from "date-fns"

// Types
interface Team {
  id: string
  name: string
  role: string
  imageURL: string
}

interface Attendance {
  id: string
  date: string
  status: "PRESENT" | "ABSENT" | "MEDICAL" 
  teamId: string
  createdAt: string
  updatedAt: string
  team: Team
}

interface FormData {
  date: string
  status: "PRESENT" | "ABSENT" | "MEDICAL"
  teamId: string
}

export default function AttendanceRegister() {
  // State
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null)
  const [formLoading, setFormLoading] = useState<boolean>(false)
  const [deleteLoading, setDeleteLoading] = useState<string>("")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("All")

  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0] + "T09:30:00.000Z",
    status: "PRESENT",
    teamId: "",
  })

  // API URLs
  const ATTENDANCE_API_URL = "https://totem-consultancy-beta.vercel.app/api/crm/attendance"
  const TEAMS_API_URL = "https://totem-consultancy-beta.vercel.app/api/crm/teamm"

  // Fetch attendance and teams data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceResponse, teamsResponse] = await Promise.all([fetch(ATTENDANCE_API_URL), fetch(TEAMS_API_URL)])

        if (!attendanceResponse.ok || !teamsResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const attendanceData = await attendanceResponse.json()
        const teamsData = await teamsResponse.json()

        setAttendanceRecords(attendanceData.data || attendanceData)
        setTeams(teamsData)
      } catch (err) {
        setError("Failed to fetch data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Form validation
  const validateForm = () => {
    if (!formData.date) return "Date is required"
    if (!formData.status) return "Status is required"
    if (!formData.teamId) return "Team member is required"
    return null
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setFormLoading(true)

    try {
      let response

      if (editingRecord) {
        // Update existing record
        response = await fetch(`${ATTENDANCE_API_URL}/${editingRecord.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      } else {
        // Create new record
        response = await fetch(ATTENDANCE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      }

      if (!response.ok) {
        throw new Error("Failed to save attendance record")
      }

      // Refresh attendance data
      const refreshResponse = await fetch(ATTENDANCE_API_URL)
      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh data")
      }

      const refreshedData = await refreshResponse.json()
      setAttendanceRecords(refreshedData.data || refreshedData)

      setSuccess(editingRecord ? "Attendance record updated successfully!" : "Attendance record added successfully!")

      // Close modal after success
      setTimeout(() => {
        setIsOpen(false)
        setSuccess("")
        setEditingRecord(null)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save attendance record")
    } finally {
      setFormLoading(false)
    }
  }

  // Handle edit
  const handleEdit = (record: Attendance) => {
    setEditingRecord(record)
    setFormData({
      date: record.date,
      status: record.status,
      teamId: record.teamId,
    })
    setIsOpen(true)
  }

  // Handle delete
  const handleDelete = async (recordId: string) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) return

    setDeleteLoading(recordId)
    try {
      const response = await fetch(`${ATTENDANCE_API_URL}/${recordId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete attendance record")
      }

      setAttendanceRecords((prev) => prev.filter((record) => record.id !== recordId))
      setSuccess("Attendance record deleted successfully!")

      setTimeout(() => {
        setSuccess("")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete attendance record")
    } finally {
      setDeleteLoading("")
    }
  }

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter((record) => {
    // Search filter
    const teamNameMatch = record.team?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false

    // Date filter
    const dateMatch = !dateFilter || record.date.includes(dateFilter)

    // Status filter
    const statusMatch = statusFilter === "All" || record.status === statusFilter

    return teamNameMatch && dateMatch && statusMatch
  })

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy - hh:mm a")
    } catch (error) {
      return dateString
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800"
      case "ABSENT":
        return "bg-red-100 text-red-800"
      case "LATE":
        return "bg-yellow-100 text-yellow-800"
      case "MEDICAL":
        return "bg-blue-100 text-blue-800"
      case "LEAVE":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 w-full">
      <div className="w-full lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gray-800 p-3 rounded-xl">
              <CalendarCheck className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Attendance Register</h1>
              <p className="mt-1 font-semibold text-gray-500">Manage team attendance records</p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                setEditingRecord(null)
                setFormData({
                  date: new Date().toISOString().split("T")[0] + "T09:30:00.000Z",
                  status: "PRESENT",
                  teamId: "",
                })
                setIsOpen(true)
              }}
              className="bg-gray-800 text-white px-4 py-4 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Attendance
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg animate-fadeIn">
            {success}
          </div>
        )}
        {error && !isOpen && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg animate-fadeIn">
            {error}
          </div>
        )}

        {/* Attendance Section */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-xl font-medium ml-5">Attendance Records</h2>

          {/* Filters */}
          <div className="flex flex-wrap justify-end items-center mb-6 mt-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <div className="relative">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="All">All Status</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="MEDICAL">Medical</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                <p className="text-gray-500">Loading attendance records...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        No attendance records found
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {record.team?.imageURL ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={record.team.imageURL || "/placeholder.svg"}
                                  alt={record.team.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{record.team?.name || "Unknown"}</div>
                              <div className="text-sm text-gray-500">{record.team?.personalMail || "No email"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(record.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${getStatusBadgeColor(record.status)}`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.team?.role || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(record)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Edit"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="text-red-500 hover:text-red-700"
                              disabled={deleteLoading === record.id}
                              title="Delete"
                            >
                              {deleteLoading === record.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">
                {editingRecord ? "Edit Attendance Record" : "Add Attendance Record"}
              </h2>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setEditingRecord(null)
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Member <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="teamId"
                    value={formData.teamId}
                    onChange={handleInputChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Team Member</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date.substring(0, 16)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="MEDICAL">Medical</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
              )}

              {success && (
                <div className="mt-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                  {success}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setEditingRecord(null)
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
                      {editingRecord ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>{editingRecord ? "Update Record" : "Add Record"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
