"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Trash2, Edit, ChevronDown } from "lucide-react"
import project from "./assets/folder-open.png"
import ptask from "./assets/profile-2user.png"
import ctask from "./assets/clipboard-text.png"
import status from "./assets/people.png"

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [userTasks, setUserTasks] = useState([])
  const [userProjects, setUserProjects] = useState([])
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedDataFilter, setSelectedDataFilter] = useState("All Data")
  const [selectedTaskYear, setSelectedTaskYear] = useState("2025")
  const [userId, setUserId] = useState(null)
  const [monthlyData, setMonthlyData] = useState([])

  // Fetch user ID from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId")
      setUserId(storedUserId)
    }
  }, [])

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/projects2")
        if (!response.ok) {
          throw new Error("Failed to fetch projects")
        }
        const data = await response.json()
        setProjects(data)

        if (userId) {
          // Filter tasks for the current user
          const userTasksData = extractUserTasks(data, userId)
          setUserTasks(userTasksData)

          // Filter projects for the current user
          const userProjectsData = extractUserProjects(data, userId)
          setUserProjects(userProjectsData)

          // Process data for charts based on user's projects and tasks
          processUserData(userProjectsData, userTasksData)
        }

        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }

    if (userId) {
      fetchProjects()
    } else if (typeof window !== "undefined") {
      setLoading(false)
    }
  }, [userId])

  // Extract tasks assigned to the current user
  const extractUserTasks = (projects, userId) => {
    const tasks = []

    projects.forEach((project) => {
      if (project.tasks2 && project.tasks2.length > 0) {
        project.tasks2.forEach((task) => {
          if (task.assigneeId === userId) {
            tasks.push({
              ...task,
              projectTitle: project.title,
              department: getDepartmentFromProject(project),
            })
          }
        })
      }
    })

    return tasks
  }

  // Extract projects that have tasks assigned to the current user
  const extractUserProjects = (projects, userId) => {
    return projects.filter((project) => {
      if (!project.tasks2 || project.tasks2.length === 0) return false
      return project.tasks2.some((task) => task.assigneeId === userId)
    })
  }

  // Process user-specific data for charts
  const processUserData = (userProjects, userTasks) => {
    // Create monthly data for charts
    const processedMonthlyData = [
      { name: "Jan", totalComplete: 0, taskPending: 0, projectsCreated: 0, projectsCompleted: 0 },
      { name: "Feb", totalComplete: 0, taskPending: 0, projectsCreated: 0, projectsCompleted: 0 },
      { name: "Mar", totalComplete: 0, taskPending: 0, projectsCreated: 0, projectsCompleted: 0 },
      { name: "Apr", totalComplete: 0, taskPending: 0, projectsCreated: 0, projectsCompleted: 0 },
      { name: "May", totalComplete: 0, taskPending: 0, projectsCreated: 0, projectsCompleted: 0 },
      { name: "Jun", totalComplete: 0, taskPending: 0, projectsCreated: 0, projectsCompleted: 0 },
      { name: "Jul", totalComplete: 0, taskPending: 0, projectsCreated: 0, projectsCompleted: 0 },
      { name: "Aug", totalComplete: 0, taskPending: 0, projectsCreated: 0, projectsCompleted: 0 },
      { name: "Sep", totalComplete: 0, taskPending: 0, projectsCreated: 0, projectsCompleted: 0 },
      { name: "Oct", totalComplete: 0, taskPending: 0, projectsCreated: 0, projectsCompleted: 0 },
      { name: "Nov", totalComplete: 0, taskPending: 0, projectsCreated: 0, projectsCompleted: 0 },
      { name: "Dec", totalComplete: 0, taskPending: 0, projectsCreated: 0, projectsCompleted: 0 },
    ]

    // Process user's projects
    userProjects.forEach((project) => {
      // Process project creation date
      const projectDate = new Date(project.createdAt)
      if (projectDate.getFullYear() === Number.parseInt(selectedYear)) {
        const month = projectDate.getMonth()
        processedMonthlyData[month].projectsCreated++
      }

      // Process project completion status
      if (project.status === "COMPLETED") {
        const completedDate = new Date(project.updatedAt)
        if (completedDate.getFullYear() === Number.parseInt(selectedYear)) {
          const month = completedDate.getMonth()
          processedMonthlyData[month].projectsCompleted++
        }
      }
    })

    // Process user's tasks
    userTasks.forEach((task) => {
      const taskDate = new Date(task.createdAt)
      if (taskDate.getFullYear() === Number.parseInt(selectedYear)) {
        const month = taskDate.getMonth()
        if (task.status === "TODO") {
          processedMonthlyData[month].taskPending++
        } else if (task.status === "DONE") {
          processedMonthlyData[month].totalComplete++
        }
      }
    })

    setMonthlyData(processedMonthlyData)
  }

  // Helper function to extract department from project description
  const getDepartmentFromProject = (project) => {
    // Simple logic to extract department - in a real app, this would be more sophisticated
    const description = project.description?.toLowerCase() || ""
    if (description.includes("marketing")) return "Marketing"
    if (description.includes("development")) return "Development"
    if (description.includes("design")) return "Design"
    if (description.includes("rocket")) return "Engineering"
    return "General"
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
  }

  // Count user's pending tasks
  const countPendingTasks = () => {
    return userTasks.filter((task) => task.status === "TODO").length
  }

  // Count user's completed tasks
  const countCompletedTasks = () => {
    return userTasks.filter((task) => task.status === "DONE").length
  }

  // Get filtered tasks based on selected filters
  const getFilteredTasks = () => {
    if (!userTasks) return []

    let filtered = [...userTasks]

    // Filter by year
    if (selectedTaskYear !== "All") {
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.dueDate)
        return taskDate.getFullYear().toString() === selectedTaskYear
      })
    }

    // Filter by status
    if (selectedDataFilter === "Current") {
      filtered = filtered.filter((task) => task.status === "TODO" || task.status === "IN_PROGRESS")
    } else if (selectedDataFilter === "Completed") {
      filtered = filtered.filter((task) => task.status === "DONE")
    }

    return filtered
  }

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return ""
    return status === "TODO" ? "Active" : status === "DONE" ? "Completed" : "In Progress"
  }

  // Update chart data when year changes
  useEffect(() => {
    if (userProjects.length > 0 && userTasks.length > 0) {
      processUserData(userProjects, userTasks)
    }
  }, [selectedYear])

  if (!userId) {
    return (
      <div className="bg-gray-50 p-6 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4">User Not Found</h2>
          <p className="text-gray-600 mb-4">
            Please log in to view your dashboard. User ID not found in local storage.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard iconSrc={project} alt="Projects" title="Projects" value={userProjects.length.toString()} />
        <StatCard iconSrc={ptask} alt="Pending Task" title="Pending Task" value={countPendingTasks().toString()} />
        <StatCard
          iconSrc={ctask}
          alt="Completed Tasks"
          title="Completed Tasks"
          value={countCompletedTasks().toString()}
        />
        <StatCard iconSrc={status} alt="My Tasks" title="My Tasks" value={userTasks.length.toString()} />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Project Activity"
          year={selectedYear}
          onYearChange={setSelectedYear}
          data={monthlyData}
          lines={[
            { dataKey: "projectsCreated", color: "#FFB800", name: "Projects Created" },
            { dataKey: "projectsCompleted", color: "#B91C1C", name: "Projects Completed" },
          ]}
        />

        <ChartCard
          title="Task Performance"
          year={selectedYear}
          onYearChange={setSelectedYear}
          data={monthlyData}
          lines={[
            { dataKey: "totalComplete", color: "#FFB800", name: "Total Complete" },
            { dataKey: "taskPending", color: "#B91C1C", name: "Task Pending" },
          ]}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <div className="flex space-x-2">
            <DropdownButton
              label={selectedDataFilter}
              onChange={setSelectedDataFilter}
              options={["All Data", "Current", "Completed"]}
            />
            <DropdownButton
              label={selectedTaskYear}
              onChange={setSelectedTaskYear}
              options={["2025", "2024", "2023"]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredTasks().length > 0 ? (
                getFilteredTasks().map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(task.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(task.dueDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === "TODO" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        <span
                          className={`mr-1.5 h-2 w-2 rounded-full ${
                            task.status === "TODO" ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></span>
                        {formatStatus(task.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Trash2 size={18} />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    {loading ? "Loading tasks..." : "No tasks found matching your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ iconSrc, alt, title, value, valueColor = "text-black" }) => (
  <div className="bg-white rounded-lg shadow p-4 flex items-center">
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
      <img src={iconSrc || "/placeholder.svg"} alt={alt} className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  </div>
)

// Chart Card Component
const ChartCard = ({ title, year, onYearChange, data, lines }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="font-semibold">{title}</h2>
      <div className="relative">
        <select
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          className="appearance-none border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none"
        >
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>

    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} domain={[0, "auto"]} />
          <Tooltip />
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 4, fill: line.color, stroke: line.color }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>

    <div className="flex justify-center space-x-6 mt-4">
      {lines.map((line, index) => (
        <div key={index} className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: line.color }}></span>
          <span className="text-sm text-gray-600">{line.name}</span>
        </div>
      ))}
    </div>
  </div>
)

// Dropdown Button Component
const DropdownButton = ({ label, onChange, options }) => (
  <div className="relative">
    <select
      value={label}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
      <ChevronDown size={16} />
    </div>
  </div>
)

export default Dashboard
