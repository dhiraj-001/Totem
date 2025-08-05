"use client"

import React, { useState, useEffect } from "react"
import { Trash2, Edit, Plus, ChevronDown, Calendar, Loader2, X, ChevronRight, ChevronUp } from "lucide-react"
import axios from "axios"
import icon from "./AdminClient/Vector.png"

// Define interfaces for our data types
interface Subtask {
  id: string
  title: string
  description: string
  dueDate: string
  status: string
  taskId: string
  assigneeId: string
}

interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  status: string
  projectId: string
  assigneeId: string
  subtasks?: Subtask[]
  createdAt?: string
  updatedAt?: string
}

interface Project {
  id: string
  title: string
  description: string
  dueDate: string
  status: string
  createdAt: string
  updatedAt: string
  tasks2: Task[]
}

interface TeamMember {
  id: string
  name: string
  imageURL: string
  personalMail: string
  mobile: string
  jobTitle: string
}

// API endpoints
const API_ENDPOINTS = {
  tasks: "https://totem-consultancy-beta.vercel.app/api/crm/tasks2",
  projects: "https://totem-consultancy-beta.vercel.app/api/crm/projects2",
  teamMembers: "https://totem-consultancy-beta.vercel.app/api/crm/teamm",
}

const TaskManagement: React.FC = () => {
  // State variables
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [formLoading, setFormLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [deleteLoading, setDeleteLoading] = useState<string>("")
  const [month, setMonth] = useState<string>("Apr 2025")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const [subtaskModalOpen, setSubtaskModalOpen] = useState<boolean>(false)
  const [parentTaskId, setParentTaskId] = useState<string>("")
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "TODO",
    projectId: "",
    assigneeId: "",
  })

  const [subtaskFormData, setSubtaskFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "TODO",
    taskId: "",
    assigneeId: "",
  })

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError("")

        // Fetch projects
        const projectsResponse = await axios.get(API_ENDPOINTS.projects)

        if (Array.isArray(projectsResponse.data)) {
          setProjects(projectsResponse.data)

          // Set default selected project if available
          if (projectsResponse.data.length > 0) {
            const defaultProject =
              projectsResponse.data.find((p: Project) => p.id === "f8ca4aa4-fb80-44fb-ac31-05e336f62da2") ||
              projectsResponse.data[0]

            setSelectedProject(defaultProject.id)
          }
        } else {
          console.error("Projects data is not an array:", projectsResponse.data)
          setProjects([])
          setError("Invalid projects data format received")
        }

        // Fetch team members
        const teamResponse = await axios.get(API_ENDPOINTS.teamMembers)

        if (Array.isArray(teamResponse.data)) {
          setTeamMembers(teamResponse.data)
        } else {
          console.error("Team members data is not an array:", teamResponse.data)
          setTeamMembers([])
          setError((prev) => (prev ? `${prev}, Invalid team members data format` : "Invalid team members data format"))
        }
      } catch (err) {
        console.error("Error fetching initial data:", err)
        setError("Failed to load data. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Fetch tasks when selected project changes or refresh is triggered
  useEffect(() => {
    if (selectedProject) {
      fetchTasksByProject()
    }
  }, [selectedProject, statusFilter, refreshTrigger])

  // Fetch tasks by project
  const fetchTasksByProject = async () => {
    if (!selectedProject) return

    try {
      setLoading(true)
      setError("")

      // Get all tasks for the selected project
      const projectsResponse = await axios.get(API_ENDPOINTS.projects)

      if (!Array.isArray(projectsResponse.data)) {
        throw new Error("Invalid projects data format")
      }

      // Find the selected project
      const selectedProjectData = projectsResponse.data.find((project: Project) => project.id === selectedProject)

      if (!selectedProjectData) {
        throw new Error("Selected project not found")
      }

      // Get tasks from the selected project
      let projectTasks = selectedProjectData.tasks2.map((task: Task) => ({
        ...task,
        projectId: selectedProject,
      }))

      // Apply status filter if needed
      if (statusFilter !== "All") {
        projectTasks = projectTasks.filter((task: Task) => task.status === statusFilter)
      }

      // Fetch subtasks for expanded tasks
      for (const task of projectTasks) {
        if (expandedTasks[task.id]) {
          try {
            const subtasksResponse = await axios.get(
              `https://totem-consultancy-beta.vercel.app/api/crm/tasks/${task.id}/subtasks`,
            )

            if (Array.isArray(subtasksResponse.data)) {
              task.subtasks = subtasksResponse.data
            }
          } catch (subtaskErr) {
            console.error("Error fetching subtasks:", subtaskErr)
            task.subtasks = []
          }
        }
      }

      setTasks(projectTasks)
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError("Failed to fetch tasks for this project")
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSubtasksForTask = async (taskId: string) => {
    try {
      const response = await axios.get(`https://totem-consultancy-beta.vercel.app/api/crm/tasks/${taskId}/subtasks`)

      if (Array.isArray(response.data)) {
        // Update the task with subtasks
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === taskId ? { ...task, subtasks: response.data } : task)),
        )

        return response.data
      }
      return []
    } catch (err) {
      console.error("Error fetching subtasks:", err)
      return []
    }
  }

  // Trigger a refresh of the data
  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleEditSubtask = (subtask: Subtask) => {
    try {
      // Format the date to YYYY-MM-DD for the input
      const formattedDate = new Date(subtask.dueDate).toISOString().split("T")[0]

      setSubtaskFormData({
        title: subtask.title,
        description: subtask.description,
        dueDate: formattedDate,
        status: subtask.status,
        taskId: subtask.taskId,
        assigneeId: subtask.assigneeId,
      })

      // Set parent task ID for reference
      setParentTaskId(subtask.taskId)

      // Set editing flag and open modal
      setEditingSubtask(subtask)
      setError("")
      setSuccess("")
      setSubtaskModalOpen(true)
    } catch (err) {
      console.error("Error preparing subtask for edit:", err)
      setError("Failed to prepare subtask for editing")
    }
  }

  const handleDeleteSubtask = async (subtaskId: string, taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this subtask?")) return

    setDeleteLoading(subtaskId)
    try {
      await axios.delete(`https://totem-consultancy-beta.vercel.app/api/crm/subtasks/${subtaskId}`)

      // Update the local state to remove the deleted subtask
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId && task.subtasks) {
            return {
              ...task,
              subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
            }
          }
          return task
        }),
      )

      setSuccess("Subtask deleted successfully!")

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (err) {
      console.error("Error deleting subtask:", err)
      setError("Failed to delete subtask")

      // Clear error message after 3 seconds
      setTimeout(() => {
        setError("")
      }, 3000)
    } finally {
      setDeleteLoading("")
    }
  }

  const updateSubtaskStatus = async (subtaskId: string, status: string) => {
    try {
      const response = await axios.patch(`https://totem-consultancy-beta.vercel.app/api/crm/subtasks/${subtaskId}`, {
        status,
      })

      // Update the local state with the updated subtask
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.subtasks) {
            return {
              ...task,
              subtasks: task.subtasks.map((subtask) => (subtask.id === subtaskId ? { ...subtask, status } : subtask)),
            }
          }
          return task
        }),
      )

      setSuccess("Subtask status updated successfully!")

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("")
      }, 3000)

      return response.data
    } catch (err) {
      console.error("Error updating subtask status:", err)
      setError("Failed to update subtask status")

      // Clear error message after 3 seconds
      setTimeout(() => {
        setError("")
      }, 3000)

      return null
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
  }

  // Open modal for adding a new task
  const handleAddTask = () => {
    // Reset form data and set defaults
    setFormData({
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
      status: "TODO",
      projectId: selectedProject,
      assigneeId: teamMembers.length > 0 ? teamMembers[0].id : "",
    })

    setEditingTask(null)
    setError("")
    setSuccess("")
    setIsModalOpen(true)
  }

  // Open modal for editing a task
  const handleEditTask = (task: Task) => {
    // Format the date to YYYY-MM-DD for the input
    const formattedDate = new Date(task.dueDate).toISOString().split("T")[0]

    setFormData({
      title: task.title,
      description: task.description,
      dueDate: formattedDate,
      status: task.status,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
    })

    setEditingTask(task)
    setError("")
    setSuccess("")
    setIsModalOpen(true)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form
    if (!formData.title.trim()) {
      setError("Task title is required")
      return
    }

    if (!formData.projectId) {
      setError("Please select a project")
      return
    }

    if (!formData.assigneeId) {
      setError("Please select a team member")
      return
    }

    setFormLoading(true)

    try {
      // Format the date to include time as required by the API
      const formattedData = {
        ...formData,
        dueDate: `${formData.dueDate}T00:00:00Z`,
      }

      if (editingTask) {
        // Update existing task
        const updateData = {
          ...formattedData,
          id: editingTask.id,
        }
        await axios.patch(`${API_ENDPOINTS.tasks}/${editingTask.id}`, updateData)
        setSuccess("Task updated successfully!")
      } else {
        // Create new task
        await axios.post(API_ENDPOINTS.tasks, formattedData)
        setSuccess("Task added successfully!")
      }

      // Refresh data after successful operation
      refreshData()

      // Close modal after a delay
      setTimeout(() => {
        setIsModalOpen(false)
      }, 1500)
    } catch (err: any) {
      console.error("Error saving task:", err)
      setError(err.response?.data?.message || "Failed to save task. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return

    setDeleteLoading(taskId)
    try {
      await axios.delete(`${API_ENDPOINTS.tasks}/${taskId}`)

      // Remove the task from local state
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))

      setSuccess("Task deleted successfully!")

      // Refresh data after a short delay
      setTimeout(() => {
        refreshData()
      }, 500)
    } catch (err) {
      console.error("Error deleting task:", err)
      setError("Failed to delete task")
    } finally {
      setDeleteLoading("")
    }
  }

  const toggleTaskExpansion = async (taskId: string) => {
    // If not already expanded, fetch subtasks
    if (!expandedTasks[taskId]) {
      await fetchSubtasksForTask(taskId)
    }

    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  const handleAddSubtask = (taskId: string) => {
    setParentTaskId(taskId)
    setSubtaskFormData({
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      status: "TODO",
      taskId: taskId,
      assigneeId: teamMembers.length > 0 ? teamMembers[0].id : "",
    })
    setEditingSubtask(null)
    setError("")
    setSuccess("")
    setSubtaskModalOpen(true)
  }

  const handleSubtaskInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setSubtaskFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubtaskSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form
    if (!subtaskFormData.title.trim()) {
      setError("Subtask title is required")
      return
    }

    if (!subtaskFormData.assigneeId) {
      setError("Please select a team member")
      return
    }

    setFormLoading(true)

    try {
      // Format the date to include time as required by the API
      const formattedData = {
        ...subtaskFormData,
        dueDate: `${subtaskFormData.dueDate}T00:00:00Z`,
      }

      let response
      if (editingSubtask) {
        // Update existing subtask
        response = await axios.patch(
          `https://totem-consultancy-beta.vercel.app/api/crm/subtasks/${editingSubtask.id}`,
          formattedData,
        )
        setSuccess("Subtask updated successfully!")
      } else {
        // Create new subtask
        response = await axios.post("https://totem-consultancy-beta.vercel.app/api/crm/subtasks", formattedData)
        setSuccess("Subtask added successfully!")
      }

      // Refresh subtasks for the parent task
      await fetchSubtasksForTask(parentTaskId)

      // Ensure the parent task is expanded to show the updated subtasks
      setExpandedTasks((prev) => ({
        ...prev,
        [parentTaskId]: true,
      }))

      // Close modal after a delay
      setTimeout(() => {
        setSubtaskModalOpen(false)
        setEditingSubtask(null)
      }, 1500)
    } catch (err: any) {
      console.error("Error saving subtask:", err)
      setError(err.response?.data?.message || "Failed to save subtask. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  // Get team member name by ID
  const getTeamMemberName = (id: string) => {
    const member = teamMembers.find((member) => member.id === id)
    return member ? member.name : "Unassigned"
  }

  // Get project name by ID
  const getProjectName = (id: string) => {
    const project = projects.find((project) => project.id === id)
    return project ? project.title : "Unknown Project"
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with title and icon */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gray-800 p-3 rounded-xl">
              <img src={icon || "/placeholder.svg"} className="w-14 h-10" alt="Task Management Icon" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Task Management</h1>
              <p className="text-gray-600 font-semibold mt-1">Manage Task sheet</p>
            </div>
          </div>

          {/* Button positioned below */}
          <div className="flex justify-end mt-4">
            <button
              className="bg-gray-800 text-white px-4 py-4 rounded-xl flex items-center gap-2"
              onClick={handleAddTask}
            >
              <Plus size={20} />
              Add Task
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg">{success}</div>
        )}
        {error && !isModalOpen && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">{error}</div>
        )}

        {/* Task Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Task</h2>
            <div className="flex gap-3">
              <div className="border rounded-md px-3 py-2 flex items-center justify-between min-w-36 relative">
                <span>Status</span>
                <ChevronDown size={16} />
                <select
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="All">All</option>
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
              <div className="border rounded-md px-3 py-2 flex items-center justify-between min-w-36 relative">
                <span>Project</span>
                <ChevronDown size={16} />
                <select
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="border rounded-md px-3 py-2 flex items-center justify-between min-w-36">
                <span>{month}</span>
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-4 text-left font-medium text-gray-600">Task ID</th>
                  <th className="py-4 text-left font-medium text-gray-600">Task Name</th>
                  <th className="py-4 text-left font-medium text-gray-600">Assigned to</th>
                  <th className="py-4 text-left font-medium text-gray-600">Due Date</th>
                  <th className="py-4 text-left font-medium text-gray-600">Status</th>
                  <th className="py-4 text-left font-medium text-gray-600">Project</th>
                  <th className="py-4 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mr-2" />
                        <span>Loading tasks...</span>
                      </div>
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No tasks found for this project
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <React.Fragment key={task.id}>
                      <tr className="border-b">
                        <td className="py-4 text-gray-800">{task.id.substring(0, 8)}</td>
                        <td className="py-4 text-gray-800 flex items-center">
                          <button
                            onClick={() => toggleTaskExpansion(task.id)}
                            className="mr-2 focus:outline-none"
                            aria-label={expandedTasks[task.id] ? "Collapse subtasks" : "Expand subtasks"}
                          >
                            {expandedTasks[task.id] ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                          </button>
                          {task.title}
                        </td>
                        <td className="py-4 text-gray-600">{getTeamMemberName(task.assigneeId)}</td>
                        <td className="py-4 text-blue-600">{formatDate(task.dueDate)}</td>
                        <td className="py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              task.status === "TODO"
                                ? "bg-yellow-100 text-yellow-800"
                                : task.status === "IN_PROGRESS"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="py-4 text-gray-800">{getProjectName(task.projectId)}</td>
                        <td className="py-4 flex gap-2">
                          <button
                            className="p-1 text-gray-600 hover:text-gray-800"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={deleteLoading === task.id}
                          >
                            {deleteLoading === task.id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 size={20} />
                            )}
                          </button>
                          <button
                            className="p-1 text-gray-600 hover:text-gray-800"
                            onClick={() => handleEditTask(task)}
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            className="p-1 text-gray-600 hover:text-gray-800"
                            onClick={() => handleAddSubtask(task.id)}
                            title="Add Subtask"
                          >
                            <Plus size={20} />
                          </button>
                        </td>
                      </tr>

                      {/* Subtasks */}
                      {expandedTasks[task.id] &&
                        task.subtasks &&
                        task.subtasks.map((subtask: Subtask) => (
                          <tr key={subtask.id} className="bg-gray-50 border-b">
                            <td className="py-3 pl-8 text-gray-500 text-sm">{subtask.id.substring(0, 8)}</td>
                            <td className="py-3 pl-8 text-gray-700 text-sm flex items-center">
                              <span className="ml-6">↳ {subtask.title}</span>
                            </td>
                            <td className="py-3 text-gray-500 text-sm">{getTeamMemberName(subtask.assigneeId)}</td>
                            <td className="py-3 text-blue-500 text-sm">{formatDate(subtask.dueDate)}</td>
                            <td className="py-3">
                              <div className="relative">
                                <select
                                  value={subtask.status}
                                  onChange={(e) => updateSubtaskStatus(subtask.id, e.target.value)}
                                  className={`px-2 py-1 rounded-full text-xs border-none appearance-none cursor-pointer ${
                                    subtask.status === "TODO"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : subtask.status === "IN_PROGRESS"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  <option value="TODO">TODO</option>
                                  <option value="IN_PROGRESS">IN PROGRESS</option>
                                  <option value="COMPLETED">COMPLETED</option>
                                </select>
                              </div>
                            </td>
                            <td className="py-3 text-gray-500 text-sm">-</td>
                            <td className="py-3 flex gap-2">
                              <button
                                className="p-1 text-gray-600 hover:text-gray-800"
                                onClick={() => handleDeleteSubtask(subtask.id, task.id)}
                                disabled={deleteLoading === subtask.id}
                                title="Delete Subtask"
                              >
                                {deleteLoading === subtask.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                              <button
                                className="p-1 text-gray-600 hover:text-gray-800"
                                onClick={() => handleEditSubtask(subtask)}
                                title="Edit Subtask"
                              >
                                <Edit size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-semibold text-gray-900">{editingTask ? "Edit Task" : "Add Task"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className="w-full rounded border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleInputChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="assigneeId"
                      value={formData.assigneeId}
                      onChange={handleInputChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
                  onClick={() => setIsModalOpen(false)}
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
                      {editingTask ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>{editingTask ? "Update Task" : "Add Task"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subtask Form Modal */}
      {subtaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-semibold text-gray-900">
                {editingSubtask ? "Edit Subtask" : "Add Subtask"}
              </h2>
              <button onClick={() => setSubtaskModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubtaskSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Task</label>
                  <input
                    type="text"
                    value={tasks.find((t) => t.id === parentTaskId)?.title || ""}
                    className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtask Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={subtaskFormData.title}
                    onChange={handleSubtaskInputChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter subtask title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={subtaskFormData.description}
                    onChange={handleSubtaskInputChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter subtask description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="dueDate"
                        value={subtaskFormData.dueDate}
                        onChange={handleSubtaskInputChange}
                        className="w-full rounded border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={subtaskFormData.status}
                      onChange={handleSubtaskInputChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assigneeId"
                    value={subtaskFormData.assigneeId}
                    onChange={handleSubtaskInputChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
                  onClick={() => setSubtaskModalOpen(false)}
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
                      {editingSubtask ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>{editingSubtask ? "Update Subtask" : "Add Subtask"}</>
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
export default TaskManagement
