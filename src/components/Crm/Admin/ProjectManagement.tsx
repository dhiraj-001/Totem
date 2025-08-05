"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2, X } from "lucide-react"
import project from "./AdminClient/project1.png"

const ProjectManagement = () => {
  const [projects, setProjects] = useState([])
  const [activeTab, setActiveTab] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "PENDING",
  })
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [participantCounts, setParticipantCounts] = useState({})
  const [projectParticipants, setProjectParticipants] = useState({})
  const [teamMembers, setTeamMembers] = useState([])

  // Fetch projects from API
  useEffect(() => {
    fetchProjects()
    fetchTeamMembers()
  }, [])

  useEffect(() => {
    if (projects.length > 0) {
      fetchParticipantCounts()
    }
  }, [projects, teamMembers])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/projects2")
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
      setError("Failed to fetch projects")
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/teamm")
      if (!response.ok) {
        throw new Error("Failed to fetch team members")
      }
      const data = await response.json()
      setTeamMembers(data)
    } catch (error) {
      console.error("Error fetching team members:", error)
    }
  }

  const fetchParticipantCounts = async () => {
    try {
      const counts = {}
      const projectParticipants = {}

      // Process each project
      for (const project of projects) {
        // Fetch tasks for this project
        const tasksResponse = await fetch(
          `https://totem-consultancy-beta.vercel.app/api/crm/projects/${project.id}/tasks2`,
        )
        if (!tasksResponse.ok) continue

        const tasks = await tasksResponse.json()

        // Set to collect unique assigneeIds
        const uniqueAssignees = new Set()

        // Add task assignees
        tasks.forEach((task) => {
          if (task.assigneeId) {
            uniqueAssignees.add(task.assigneeId)
          }
        })

        // Wait for all subtask fetches to complete
        await Promise.all(
          tasks.map(async (task) => {
            try {
              const subtasksResponse = await fetch(
                `https://totem-consultancy-beta.vercel.app/api/crm/tasks/${task.id}/subtasks`,
              )
              if (!subtasksResponse.ok) return

              const subtasks = await subtasksResponse.json()
              subtasks.forEach((subtask) => {
                if (subtask.assigneeId) {
                  uniqueAssignees.add(subtask.assigneeId)
                }
              })
            } catch (err) {
              console.error("Error fetching subtasks:", err)
            }
          }),
        )

        // Store the count and participant IDs for this project
        counts[project.id] = uniqueAssignees.size
        projectParticipants[project.id] = Array.from(uniqueAssignees)
      }

      setParticipantCounts(counts)
      setProjectParticipants(projectParticipants)
    } catch (error) {
      console.error("Error fetching participant counts:", error)
    }
  }

  // Create new project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccess("");
  
    try {
      // Create a copy of the project data to format for API
      const projectData = {...newProject};
      
      // Format the date to ISO string if it exists
      if (projectData.dueDate) {
        // Make sure we have a full ISO string for the API
        const date = new Date(projectData.dueDate);
        projectData.dueDate = date.toISOString();
      }
  
      const url = isEditing
        ? `https://totem-consultancy-beta.vercel.app/api/crm/projects2/${currentProjectId}`
        : "https://totem-consultancy-beta.vercel.app/api/crm/projects2";
  
      const method = isEditing ? "PUT" : "POST";
  
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });
  
      if (!response.ok) {
        throw new Error(isEditing ? "Failed to update project" : "Failed to create project");
      }
  
      // Set success message
      setSuccess(isEditing ? "Project updated successfully!" : "Project created successfully!");
  
      // Reset form and close modal after a delay
      setTimeout(() => {
        setNewProject({
          title: "",
          description: "",
          dueDate: "",
          status: "PENDING",
        });
        setShowModal(false);
        setIsEditing(false);
        setCurrentProjectId(null);
        setSuccess("");
      }, 2000);
  
      // Refresh projects list
      fetchProjects();
    } catch (error) {
      console.error(isEditing ? "Error updating project:" : "Error creating project:", error);
      setError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle edit project
  const handleEditProject = (project) => {
    setIsEditing(true);
    setCurrentProjectId(project.id);
  
    // Fix: Properly handle the date format from API
    let dueDate = "";
    if (project.dueDate) {
      // Convert any date format to YYYY-MM-DD for the input field
      const date = new Date(project.dueDate);
      if (!isNaN(date)) {
        dueDate = date.toISOString().split('T')[0];
      }
    }
  
    setNewProject({
      title: project.title || "",
      description: project.description || "",
      dueDate: dueDate,
      status: project.status || "PENDING",
    });
  
    setShowModal(true);
  };

  // Handle delete project
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return

    setDeleteLoading(projectId)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`https://totem-consultancy-beta.vercel.app/api/crm/projects2/${projectId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      setSuccess("Project deleted successfully!")

      // Remove the deleted project from state
      setProjects(projects.filter((project) => project.id !== projectId))

      // Clear success message after delay
      setTimeout(() => {
        setSuccess("")
      }, 2000)
    } catch (error) {
      console.error("Error deleting project:", error)
      setError(error.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  // Filter projects based on active tab
  const filteredProjects = projects.filter((project) => {
    if (activeTab === "All") return true
    if (activeTab === "Pending") return project.status === "PENDING" // Changed from "TODO" to "PENDING"
    if (activeTab === "In Progress") return project.status === "IN_PROGRESS"
    if (activeTab === "Completed") return project.status === "COMPLETED"
    return true
  })

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    })
  }

  return (
    <div className="bg-[#f8f5f0] p-6 w-full min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-white flex flex-col items-center">
            <img src={project || "/placeholder.svg"} alt="" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Project Management</h1>
          <p className="text-gray-600 font-semibold">Manage Project sheet</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg animate-fadeIn">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg animate-fadeIn">
          {error}
        </div>
      )}
      <div className="pb-4">
        <button
          onClick={() => {
            setIsEditing(false)
            setCurrentProjectId(null)
            setNewProject({
              title: "",
              description: "",
              dueDate: "",
              status: "PENDING", // Changed from "TODO" to "PENDING"
            })
            setShowModal(true)
          }}
          className="px-6 py-3 bg-gray-800 text-white rounded-lg flex items-center gap-2 ml-auto hover:bg-gray-700 transition-colors"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* Main container */}
      <div className="bg-white rounded-lg p-8 shadow-sm">
        {/* Tabs */}
        <div className="flex justify-end mb-6">
          <div className="flex gap-2">
            <button
              className={`px-6 py-2 ${activeTab === "All" ? "bg-gray-800 text-white" : "border border-gray-300 text-gray-700"} rounded`}
              onClick={() => setActiveTab("All")}
            >
              All
            </button>
            <button
              className={`px-6 py-2 ${activeTab === "Pending" ? "bg-gray-800 text-white" : "border border-gray-300 text-gray-700"} rounded`}
              onClick={() => setActiveTab("Pending")}
            >
              Pending
            </button>
            <button
              className={`px-6 py-2 ${activeTab === "In Progress" ? "bg-gray-800 text-white" : "border border-gray-300 text-gray-700"} rounded`}
              onClick={() => setActiveTab("In Progress")}
            >
              In Progress
            </button>
            <button
              className={`px-6 py-2 ${activeTab === "Completed" ? "bg-gray-800 text-white" : "border border-gray-300 text-gray-700"} rounded`}
              onClick={() => setActiveTab("Completed")}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Projects section */}
        <div className="bg-[#EEF0F7] p-6 rounded-lg mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-6">Some of Our Awesome projects</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-gray-500">Loading projects...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Project cards */}
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-pink-200 rounded-lg flex items-center justify-center">
                        <span className="text-pink-600 font-medium">{project.title.substring(0, 2)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <div className="flex -space-x-2 mt-1">
                          {projectParticipants[project.id] && projectParticipants[project.id].length > 0 ? (
                            projectParticipants[project.id].slice(0, 3).map((participantId) => {
                              const member = teamMembers.find((m) => m.id === participantId)
                              return (
                                <div
                                  key={participantId}
                                  className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white overflow-hidden"
                                >
                                  {member && member.imageURL ? (
                                    <img
                                      src={member.imageURL || "/placeholder.svg"}
                                      alt={member.name || "Team member"}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-300" />
                                  )}
                                </div>
                              )
                            })
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white" />
                          )}
                          {projectParticipants[project.id] && projectParticipants[project.id].length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-white flex items-center justify-center">
                              <span className="text-white text-xs">+{projectParticipants[project.id].length - 3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={deleteLoading === project.id}
                      >
                        {deleteLoading === project.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                      <button onClick={() => handleEditProject(project)} className="text-gray-500 hover:text-gray-700">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-6">{project.description}</p>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{participantCounts[project.id] || 0}</p>
                      <p className="text-sm text-gray-500">Participants</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatDate(project.dueDate)}</p>
                      <p className="text-sm text-gray-500">Due date</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* New project card */}
              <div
                className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-center min-h-[200px] cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setIsEditing(false)
                  setCurrentProjectId(null)
                  setNewProject({
                    title: "",
                    description: "",
                    dueDate: "",
                    status: "PENDING",
                  })
                  setShowModal(true)
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-lg">New project</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{isEditing ? "Edit Project" : "Add New Project"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newProject.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={newProject.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={newProject.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                  <select
                    name="status"
                    value={newProject.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{isEditing ? "Update Project" : "Create Project"}</>
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

export default ProjectManagement
