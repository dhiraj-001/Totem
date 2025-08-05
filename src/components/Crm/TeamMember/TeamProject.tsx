"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import project from "../Admin/AdminClient/project.png"

const ProjectManagement = () => {
  const [projects, setProjects] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [activeTab, setActiveTab] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch projects and team members from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Get userId from localStorage
        const userId = localStorage.getItem("userId")
        if (!userId) {
          console.warn("User ID not found in localStorage")
        }

        // Fetch projects
        const projectsResponse = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/projects2")
        if (!projectsResponse.ok) {
          throw new Error("Failed to fetch projects")
        }
        const projectsData = await projectsResponse.json()

        // Fetch team members
        const teamResponse = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/teamm")
        if (!teamResponse.ok) {
          throw new Error("Failed to fetch team members")
        }
        const teamData = await teamResponse.json()
        setTeamMembers(teamData)

        // Filter projects that have tasks assigned to the current user
        const userProjects = projectsData.filter((project) => {
          if (!project.tasks2 || project.tasks2.length === 0) return false

          // Check if any task in the project is assigned to the current user
          return project.tasks2.some((task) => task.assigneeId === userId)
        })

        setProjects(userProjects)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter projects based on active tab
  const filteredProjects = projects.filter((project) => {
    if (activeTab === "All") return true
    if (activeTab === "Pending") return project.status === "PENDING"
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

  // Get team members assigned to a project
  const getProjectTeamMembers = (project) => {
    if (!project.tasks2 || !teamMembers.length) return []

    // Get unique assigneeIds from tasks
    const assigneeIds = [...new Set(project.tasks2.filter((task) => task.assigneeId).map((task) => task.assigneeId))]

    // Find team members with matching ids
    return teamMembers.filter((member) => assigneeIds.includes(member.id))
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
          <p className="text-gray-600 font-semibold">My Assigned Projects</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg animate-fadeIn">
          {error}
        </div>
      )}

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
          <h2 className="text-lg font-medium text-gray-700 mb-6">My Assigned Projects</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-gray-500">Loading projects...</p>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex justify-center py-12">
              <p className="text-gray-500">No projects assigned to you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Project cards */}
              {filteredProjects.map((project) => {
                const projectTeamMembers = getProjectTeamMembers(project)
                const taskCount = project.tasks2 ? project.tasks2.length : 0

                return (
                  <div key={project.id} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-pink-200 rounded-lg flex items-center justify-center">
                          <span className="text-pink-600 font-medium">{project.title.substring(0, 2)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{project.title}</p>
                          <div className="flex -space-x-2 mt-1">
                            {projectTeamMembers.length > 0 ? (
                              projectTeamMembers.map((member) => (
                                <div
                                  key={member.id}
                                  className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white overflow-hidden"
                                >
                                  {member.imageURL ? (
                                    <img
                                      src={member.imageURL || "/placeholder.svg"}
                                      alt={member.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white text-xs">
                                      {member.name.substring(0, 2)}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-6">{project.description}</p>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{projectTeamMembers.length}</p>
                        <p className="text-sm text-gray-500">Participants</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{taskCount}</p>
                        <p className="text-sm text-gray-500">Tasks</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatDate(project.dueDate)}</p>
                        <p className="text-sm text-gray-500">Due date</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectManagement
