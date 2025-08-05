"use client"

import React, { useState, useEffect, useRef } from "react"
import { Trash2, Edit, Plus, ChevronDown, Calendar, Loader2, X, ChevronRight, ChevronUp, Bell } from "lucide-react"
import axios from "axios"
import icon from "../Admin/AdminClient/Vector.png"
import { sendTaskAssignmentEmail, sendSubtaskAssignmentEmail } from "../../../utils/emailService"

// Define interfaces for our data types
interface Subtask {
  id: string
  title: string
  description: string
  dueDate: string
  status: string
  taskId: string
  assigneeId: string
  createdAt?: string
  updatedAt?: string
}

interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  status: string
  projectId: string
  assigneeId: string | null
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
  projects: "https://totem-consultancy-beta.vercel.app/api/crm/projects2",
  teamMembers: "https://totem-consultancy-beta.vercel.app/api/crm/teamm",
  tasks: "https://totem-consultancy-beta.vercel.app/api/crm/tasks2",
  subtasks: (taskId: string) => `https://totem-consultancy-beta.vercel.app/api/crm/tasks/${taskId}/subtasks`,
  updateSubtask: (subtaskId: string) => `https://totem-consultancy-beta.vercel.app/api/crm/subtasks/${subtaskId}`,
}

const TeamTask: React.FC = () => {
  // Get userId from localStorage
  const [currentUserId, setCurrentUserId] = useState<string>("")

  // State variables
  const [tasks, setTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
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
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({})
  const [subtaskModalOpen, setSubtaskModalOpen] = useState<boolean>(false)
  const [parentTaskId, setParentTaskId] = useState<string>("")
  const [updatingSubtask, setUpdatingSubtask] = useState<string>("")
  const [nextEmployeeModalOpen, setNextEmployeeModalOpen] = useState<boolean>(false)
  const [completedTask, setCompletedTask] = useState<Task | null>(null)
  const [nextEmployeeFormData, setNextEmployeeFormData] = useState({
    assigneeId: "",
    dueDate: "",
    notes: ""
  })

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

  const [notifications, setNotifications] = useState<{ id: string, title: string, project: string, assignedAt: string }[]>(() => {
    // Load notifications from localStorage if available
    const saved = localStorage.getItem("teamTaskNotifications");
    return saved ? JSON.parse(saved) : [];
  });
  const prevTaskIdsRef = useRef<Set<string>>(new Set());
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(() => notifications.length)

  // Get userId from localStorage on component mount
  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (userId) {
      setCurrentUserId(userId)
      console.log("Current User ID:", userId)
    } else {
      setError("User ID not found. Please login again.")
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("teamTaskNotifications", JSON.stringify(notifications));
  }, [notifications]);

  // Mark notifications as read when opened
  useEffect(() => {
    if (showNotifications) setUnreadCount(0)
  }, [showNotifications])

  // Fetch data on component mount
  useEffect(() => {
    if (currentUserId) {
      fetchInitialData()
    }
  }, [currentUserId])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      console.log("Fetching initial data for user:", currentUserId)

      // Fetch projects with tasks
      const projectsResponse = await axios.get(API_ENDPOINTS.projects)
      setProjects(projectsResponse.data)
      console.log("Projects data:", projectsResponse.data)

      // Extract all tasks from all projects where assigneeId matches currentUserId
      let allProjectTasks: Task[] = []
      projectsResponse.data.forEach((project: Project) => {
        if (project.tasks2 && Array.isArray(project.tasks2)) {
          // Filter tasks by assigneeId matching currentUserId
          const userTasks = project.tasks2.filter((task: Task) => task.assigneeId === currentUserId)
          if (userTasks.length > 0) {
            console.log(`Found ${userTasks.length} tasks for user in project ${project.title}`)
            allProjectTasks = [...allProjectTasks, ...userTasks]
          }
        }
      })

      console.log("All user tasks:", allProjectTasks)

      // Fetch team members
      const teamResponse = await axios.get(API_ENDPOINTS.teamMembers)
      setTeamMembers(teamResponse.data)

      // Set default selected project if available
      if (projectsResponse.data.length > 0) {
        // Try to find a project that has tasks assigned to the current user
        const projectWithUserTasks = projectsResponse.data.find((project: Project) =>
          project.tasks2.some((task: Task) => task.assigneeId === currentUserId),
        )

        const defaultProject =
          projectWithUserTasks ||
          projectsResponse.data.find((p: Project) => p.id === "f8ca4aa4-fb80-44fb-ac31-05e336f62da2") ||
          projectsResponse.data[0]

        setSelectedProject(defaultProject.id)
        console.log("Selected project:", defaultProject.title)

        // Filter tasks for the selected project
        const projectTasks = allProjectTasks.filter((task: Task) => task.projectId === defaultProject.id)
        console.log("Tasks for selected project:", projectTasks)

        setAllTasks(allProjectTasks)
        setTasks(projectTasks.length > 0 ? projectTasks : allProjectTasks)
      } else {
        setAllTasks(allProjectTasks)
        setTasks(allProjectTasks)
      }

      // Notification logic: detect new tasks assigned to current user
      const newTaskIds = new Set(allProjectTasks.map(t => t.id));
      const prevTaskIds = prevTaskIdsRef.current;
      const newTasks = allProjectTasks.filter(t => !prevTaskIds.has(t.id) && t.assigneeId === currentUserId);
      if (newTasks.length > 0) {
        setNotifications(prev => [
          ...newTasks.map(task => ({
            id: task.id,
            title: task.title,
            project: projectsResponse.data.find((p: Project) => p.id === task.projectId)?.title || 'Unknown Project',
            assignedAt: task.createdAt || new Date().toISOString(),
          })),
          ...prev,
        ]);
      }
      prevTaskIdsRef.current = newTaskIds;

      setLoading(false)
    } catch (err) {
      console.error("Error fetching initial data:", err)
      setError("Failed to load data. Please refresh the page.")
      setLoading(false)
    }
  }

  // Filter tasks when selected project changes
  useEffect(() => {
    if (selectedProject && currentUserId && allTasks.length > 0) {
      filterTasksByProject(selectedProject)
    }
  }, [selectedProject, currentUserId, allTasks])

  // Apply filter when status filter changes
  useEffect(() => {
    if (statusFilter === "All") {
      setTasks(allTasks.filter((task) => task.projectId === selectedProject || selectedProject === ""))
    } else {
      setTasks(
        allTasks.filter(
          (task) => (task.projectId === selectedProject || selectedProject === "") && task.status === statusFilter,
        ),
      )
    }
  }, [statusFilter, allTasks, selectedProject])

  // Filter tasks by project
  const filterTasksByProject = (projectId: string) => {
    console.log("Filtering tasks for project:", projectId)
    setLoading(true)
    try {
      // Filter tasks for the selected project
      const projectTasks = allTasks.filter((task: Task) => task.projectId === projectId)
      console.log("Filtered tasks:", projectTasks)

      // Apply current filter
      if (statusFilter === "All") {
        setTasks(projectTasks)
      } else {
        setTasks(projectTasks.filter((task: Task) => task.status === statusFilter))
      }
    } catch (err) {
      console.error("Error filtering tasks:", err)
      setError("Failed to filter tasks for this project")
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  

  const fetchSubtasksForTask = async (taskId: string) => {
  try {
    console.log("Fetching subtasks for task:", taskId)
    const response = await axios.get(API_ENDPOINTS.subtasks(taskId))
    console.log("Subtasks API response:", response.data)

    // Filter subtasks by assigneeId matching currentUserId
    const userSubtasks = response.data.filter((subtask: Subtask) => subtask.assigneeId === currentUserId)
    console.log(`Found ${userSubtasks.length} subtasks for user ID ${currentUserId}:`, userSubtasks)

    // Check if the filtered subtasks array is empty
    if (userSubtasks.length === 0) {
      console.log("No subtasks found for current user in this task")
    }

    // Update the tasks array with filtered subtasks
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          console.log(`Updating task ${task.id} with ${userSubtasks.length} subtasks`)
          return { ...task, subtasks: userSubtasks }
        }
        return task
      })
    )

    // Also update allTasks to keep state consistent
    setAllTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, subtasks: userSubtasks }
        }
        return task
      })
    )

    return userSubtasks
  } catch (err) {
    console.error("Error fetching subtasks:", err)
    return []
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
      assigneeId: currentUserId, // Set current user as assignee by default
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
      assigneeId: task.assigneeId || currentUserId,
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

    // Always use current user ID as assignee
    const submissionData = {
      ...formData,
      assigneeId: currentUserId,
    }

    setFormLoading(true)

    try {
      // Format the date to include time as required by the API
      const formattedData = {
        ...submissionData,
        dueDate: `${submissionData.dueDate}T00:00:00Z`,
      }

      console.log("Submitting task data:", formattedData)

      if (editingTask) {
        // Update existing task
        await axios.put(`${API_ENDPOINTS.tasks}/${editingTask.id}`, formattedData)
        setSuccess("Task updated successfully!")
      } else {
        // Create new task
        const response = await axios.post(API_ENDPOINTS.tasks, formattedData)
        console.log("Task created:", response.data)
        setSuccess("Task added successfully!")

        // Send email notification for new task assignment
        if (formData.assigneeId) {
          try {
            const assignee = teamMembers.find(member => member.id === formData.assigneeId)
            if (assignee) {
              const project = projects.find(project => project.id === formData.projectId)
              const taskData = {
                title: formData.title,
                description: formData.description,
                dueDate: formData.dueDate,
                status: formData.status,
                projectName: project?.title
              }

              const emailResult = await sendTaskAssignmentEmail(assignee, taskData)
              if (emailResult.success) {
                console.log('Task assignment email sent successfully')
              } else {
                console.warn('Failed to send task assignment email:', emailResult.error)
              }
            }
          } catch (emailError) {
            console.error('Error sending task assignment email:', emailError)
            // Don't fail the task creation if email fails
          }
        }
      }

      // Refresh tasks
      await fetchInitialData()

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
      setSuccess("Task deleted successfully!")

      // Refresh tasks
      await fetchInitialData()
    } catch (err) {
      console.error("Error deleting task:", err)
      setError("Failed to delete task")
    } finally {
      setDeleteLoading("")
    }
  }

  const toggleTaskExpansion = async (taskId: string) => {
    console.log("Toggling expansion for task:", taskId)

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
      assigneeId: currentUserId, // Set current user as assignee by default
    })
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

    // Always use current user ID as assignee
    const submissionData = {
      ...subtaskFormData,
      assigneeId: currentUserId,
    }

    setFormLoading(true)

    try {
      // Format the date to include time as required by the API
      const formattedData = {
        ...submissionData,
        dueDate: `${submissionData.dueDate}T00:00:00Z`,
      }

      console.log("Submitting subtask data:", formattedData)

      // Create new subtask
      const response = await axios.post("https://totem-consultancy-beta.vercel.app/api/crm/subtasks", formattedData)
      console.log("Subtask created:", response.data)
      setSuccess("Subtask added successfully!")

      // Send email notification for new subtask assignment
      if (subtaskFormData.assigneeId) {
        try {
          const assignee = teamMembers.find(member => member.id === subtaskFormData.assigneeId)
          if (assignee) {
            const parentTask = tasks.find(task => task.id === parentTaskId)
            const subtaskData = {
              title: subtaskFormData.title,
              description: subtaskFormData.description,
              dueDate: subtaskFormData.dueDate,
              status: subtaskFormData.status,
              parentTaskTitle: parentTask?.title || 'Unknown Task'
            }

            const emailResult = await sendSubtaskAssignmentEmail(assignee, subtaskData)
            if (emailResult.success) {
              console.log('Subtask assignment email sent successfully')
            } else {
              console.warn('Failed to send subtask assignment email:', emailResult.error)
            }
          }
        } catch (emailError) {
          console.error('Error sending subtask assignment email:', emailError)
          // Don't fail the subtask creation if email fails
        }
      }

      // Refresh subtasks for the parent task
      await fetchSubtasksForTask(parentTaskId)

      // Ensure the parent task is expanded to show the new subtask
      setExpandedTasks((prev) => ({
        ...prev,
        [parentTaskId]: true,
      }))

      // Close modal after a delay
      setTimeout(() => {
        setSubtaskModalOpen(false)
      }, 1500)
    } catch (err: any) {
      console.error("Error saving subtask:", err)
      setError(err.response?.data?.message || "Failed to save subtask. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  // Update task status
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      console.log("Updating task status:", taskId, newStatus)
      const response = await axios.patch(`${API_ENDPOINTS.tasks}/${taskId}`, {
        status: newStatus,
      })

      console.log("Task updated:", response.data)

      // Update the task in the local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task,
        ),
      )

      setAllTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task,
        ),
      )

      // If task is completed, show next employee assignment modal
      if (newStatus === "COMPLETED") {
        const task = tasks.find(t => t.id === taskId)
        if (task) {
          setCompletedTask(task)
          setNextEmployeeFormData({
            assigneeId: "",
            dueDate: new Date().toISOString().split("T")[0],
            notes: ""
          })
          setNextEmployeeModalOpen(true)
        }
      }

      setSuccess("Task status updated successfully!")
    } catch (err) {
      console.error("Error updating task status:", err)
      setError("Failed to update task status")
    }
  }

  // Update subtask status
  const updateSubtaskStatus = async (subtaskId: string, newStatus: string) => {
    setUpdatingSubtask(subtaskId)
    try {
      console.log("Updating subtask status:", subtaskId, newStatus)
      const response = await axios.patch(API_ENDPOINTS.updateSubtask(subtaskId), {
        status: newStatus,
      })

      console.log("Subtask updated:", response.data)

      // Update the subtask in the local state
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.subtasks) {
            return {
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, status: newStatus } : subtask,
              ),
            }
          }
          return task
        }),
      )

      setAllTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.subtasks) {
            return {
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, status: newStatus } : subtask,
              ),
            }
          }
          return task
        }),
      )

      setSuccess("Subtask status updated successfully!")
    } catch (err) {
      console.error("Error updating subtask status:", err)
      setError("Failed to update subtask status")
    } finally {
      setUpdatingSubtask("")
    }
  }

  // Handle next employee assignment
  const handleNextEmployeeAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!nextEmployeeFormData.assigneeId) {
      setError("Please select the next employee")
      return
    }

    if (!nextEmployeeFormData.dueDate) {
      setError("Please set a due date")
      return
    }

    setFormLoading(true)

    try {
      // Create a new task for the next employee
      const newTaskData = {
        title: completedTask?.title || "Next Phase Task",
        description: completedTask?.description || "",
        dueDate: `${nextEmployeeFormData.dueDate}T00:00:00Z`,
        status: "TODO",
        projectId: completedTask?.projectId || "",
        assigneeId: nextEmployeeFormData.assigneeId,
      }

      console.log("Creating next phase task:", newTaskData)

      const response = await axios.post(API_ENDPOINTS.tasks, newTaskData)
      console.log("Next phase task created:", response.data)

      // Send email notification to the next employee
      if (nextEmployeeFormData.assigneeId) {
        try {
          const assignee = teamMembers.find(member => member.id === nextEmployeeFormData.assigneeId)
          if (assignee) {
            const project = projects.find(project => project.id === completedTask?.projectId)
            const taskData = {
              title: newTaskData.title,
              description: newTaskData.description + (nextEmployeeFormData.notes ? `\n\nNotes: ${nextEmployeeFormData.notes}` : ""),
              dueDate: nextEmployeeFormData.dueDate,
              status: newTaskData.status,
              projectName: project?.title
            }

            const emailResult = await sendTaskAssignmentEmail(assignee, taskData)
            if (emailResult.success) {
              console.log('Next phase task assignment email sent successfully')
            } else {
              console.warn('Failed to send next phase task assignment email:', emailResult.error)
            }
          }
        } catch (emailError) {
          console.error('Error sending next phase task assignment email:', emailError)
        }
      }

      setSuccess("Next phase task assigned successfully!")
      setNextEmployeeModalOpen(false)
      setCompletedTask(null)

      // Refresh tasks
      await fetchInitialData()

    } catch (err: any) {
      console.error("Error assigning next phase task:", err)
      setError(err.response?.data?.message || "Failed to assign next phase task. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  // Handle next employee form input changes
  const handleNextEmployeeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNextEmployeeFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Get team member name by ID
  const getTeamMemberName = (id: string | null) => {
    if (!id) return "Unassigned"
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
    <div className="space-y-6 min-h-screen bg-pink-50 p-6">
      {/* Notification Section removed as per new design. All notifications are now in the main header. */}
      <div className="max-w-6xl mx-auto">
        {/* Header with title and icon */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gray-800 p-3 rounded-xl">
              <img src={icon || "/placeholder.svg"} className="w-14 h-10" alt="Task Management Icon" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Team Tasks</h1>
              <p className="text-gray-600 font-semibold mt-1">Manage Your Team Tasks</p>
            </div>
          </div>

          {/* Button positioned below */}
          {/* <div className="flex justify-end mt-4">
            <button
              className="bg-gray-800 text-white px-4 py-4 rounded-xl flex items-center gap-2"
              onClick={handleAddTask}
            >
              <Plus size={20} />
              Add Task
            </button>
          </div> */}
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
            <h2 className="text-xl font-bold text-gray-800">My Tasks</h2>
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
                  <th className="py-4 text-left font-medium text-gray-600">Description</th>
                  {/* <th className="py-4 text-left font-medium text-gray-600">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mr-2" />
                        <span>Loading tasks...</span>
                      </div>
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      No tasks found for you in this project
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
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-sm border-0 cursor-pointer ${
                              task.status === "TODO"
                                ? "bg-yellow-100 text-yellow-800"
                                : task.status === "IN_PROGRESS"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            <option value="TODO">TODO</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>
                        </td>
                        <td className="py-4 text-gray-800">{getProjectName(task.projectId)}</td>
                        <td className="py-4 text-gray-600">
                          {task.description ? (
                            <div className="max-w-xs">
                              <button
                                onClick={() => setExpandedDescriptions(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                                className="text-left w-full hover:text-gray-800 focus:outline-none"
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`${expandedDescriptions[task.id] ? '' : 'truncate'}`}>
                                    {expandedDescriptions[task.id] ? task.description : (task.description.length > 10 ? task.description.substring(0, 10) + '...' : task.description)}
                                  </span>
                                  <ChevronDown 
                                    size={16} 
                                    className={`ml-2 transition-transform ${expandedDescriptions[task.id] ? 'rotate-180' : ''}`}
                                  />
                                </div>
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400">No description</span>
                          )}
                        </td>
                        <td className="py-4 flex gap-2">
                          {/* <button
                            className="p-1 text-gray-600 hover:text-gray-800"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={deleteLoading === task.id}
                          >
                            {deleteLoading === task.id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 size={20} />
                            )}
                          </button> */}
                          {/* <button
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
                          </button> */}
                        </td>
                      </tr>

                      {/* Subtasks */}
                      {expandedTasks[task.id] && task.subtasks && task.subtasks.length > 0 ? (
                        task.subtasks.map((subtask: Subtask) => (
                          <tr key={subtask.id} className="bg-gray-50 border-b">
                            <td className="py-3 pl-8 text-gray-500 text-sm">{subtask.id.substring(0, 8)}</td>
                            <td className="py-3 pl-8 text-gray-700 text-sm flex items-center">
                              <span className="ml-6">↳ {subtask.title}</span>
                            </td>
                            <td className="py-3 text-gray-500 text-sm">{getTeamMemberName(subtask.assigneeId)}</td>
                            <td className="py-3 text-blue-500 text-sm">{formatDate(subtask.dueDate)}</td>
                            <td className="py-3">
                              <select
                                className={`px-2 py-1 rounded-full text-xs border-0 ${
                                  subtask.status === "TODO"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : subtask.status === "IN_PROGRESS"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                                value={subtask.status}
                                onChange={(e) => updateSubtaskStatus(subtask.id, e.target.value)}
                                disabled={updatingSubtask === subtask.id}
                              >
                                <option value="TODO">TODO</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="COMPLETED">COMPLETED</option>
                              </select>
                              {updatingSubtask === subtask.id && (
                                <Loader2 className="h-3 w-3 animate-spin ml-2 inline" />
                              )}
                            </td>
                            <td className="py-3 text-gray-500 text-sm">-</td>
                            <td className="py-3 pl-8 text-gray-500 text-sm">
                              {subtask.description ? (
                                <div className="max-w-xs">
                                  <button
                                    onClick={() => setExpandedDescriptions(prev => ({ ...prev, [subtask.id]: !prev[subtask.id] }))}
                                    className="text-left w-full hover:text-gray-600 focus:outline-none"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className={`${expandedDescriptions[subtask.id] ? '' : 'truncate'}`}>
                                        {expandedDescriptions[subtask.id] ? subtask.description : (subtask.description.length > 8 ? subtask.description.substring(0, 8) + '...' : subtask.description)}
                                      </span>
                                      <ChevronDown 
                                        size={14} 
                                        className={`ml-2 transition-transform ${expandedDescriptions[subtask.id] ? 'rotate-180' : ''}`}
                                      />
                                    </div>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-400">No description</span>
                              )}
                            </td>
                            <td className="py-3">
                              <button
                                className="p-1 text-gray-600 hover:text-gray-800"
                                onClick={() => updateSubtaskStatus(subtask.id, subtask.status)}
                                title="Update Status"
                              >
                                <Edit size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : expandedTasks[task.id] ? (
                        <tr>
                          <td colSpan={8} className="py-3 pl-12 text-gray-500 text-sm">
                            No subtasks found for you in this task
                          </td>
                        </tr>
                      ) : null}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                    <input
                      type="text"
                      value={getTeamMemberName(currentUserId)}
                      className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Tasks are automatically assigned to you</p>
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
              <h2 className="text-2xl font-semibold text-gray-900">Add Subtask</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={getTeamMemberName(currentUserId)}
                    className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Subtasks are automatically assigned to you</p>
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
                      Adding...
                    </>
                  ) : (
                    <>Add Subtask</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Next Employee Assignment Modal */}
      {nextEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-semibold text-gray-900">Assign Next Employee</h2>
              <button 
                onClick={() => {
                  setNextEmployeeModalOpen(false)
                  setCompletedTask(null)
                }} 
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleNextEmployeeAssignment} className="p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Completed Task</h3>
                  <p className="text-blue-800"><strong>Title:</strong> {completedTask?.title}</p>
                  <p className="text-blue-800"><strong>Project:</strong> {getProjectName(completedTask?.projectId || "")}</p>
                  <p className="text-blue-800"><strong>Completed by:</strong> {completedTask?.assigneeId ? getTeamMemberName(completedTask.assigneeId) : "Unknown"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assigneeId"
                    value={nextEmployeeFormData.assigneeId}
                    onChange={handleNextEmployeeInputChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Next Employee</option>
                    {teamMembers
                      .filter(member => member.id !== currentUserId) // Exclude current user
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} - {member.jobTitle}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="dueDate"
                      value={nextEmployeeFormData.dueDate}
                      onChange={handleNextEmployeeInputChange}
                      className="w-full rounded border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    name="notes"
                    value={nextEmployeeFormData.notes}
                    onChange={handleNextEmployeeInputChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Add any additional notes or instructions for the next employee..."
                    rows={3}
                  />
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
                    setNextEmployeeModalOpen(false)
                    setCompletedTask(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 flex items-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>Assign Next Employee</>
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

export default TeamTask
