"use client"

import { useEffect, useState } from "react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import { Bar, Doughnut } from "react-chartjs-2"
import { useParams } from "react-router-dom"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

// Define types for API responses
interface TeamMemberKPI {
  teamId: string
  name: string
  taskDelivery: number
  taskQuality: number
  attendanceDiscipline: number
  totalKPI: number
}

interface Task {
  id: string
  title: string
  description: string
  status: string
  createdAt?: string
  tasks2: Array<{
    id: string
    title: string
    status: string
    createdAt?: string
  }>
  dueDate: string
  createdAt: string
}

// Helper function to get the day of week
const getDayOfWeek = (date: string) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return days[new Date(date).getDay()]
}

// Helper function to group tasks by day of week
const getWeeklyTaskData = (tasksData: Task[]) => {
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const assigned: Record<string, number> = {}
  const completed: Record<string, number> = {}

  // Initialize counts for each day
  weekDays.forEach((day) => {
    assigned[day] = 0
    completed[day] = 0
  })

  // Count tasks by day
  tasksData.forEach((project) => {
    if (project.tasks2) {
      project.tasks2.forEach((task) => {
        const dayOfWeek = getDayOfWeek(task.createdAt || project.createdAt)
        assigned[dayOfWeek] = (assigned[dayOfWeek] || 0) + 1

        if (task.status === "COMPLETED") {
          completed[dayOfWeek] = (completed[dayOfWeek] || 0) + 1
        }
      })
    }
  })

  // Convert to arrays for chart.js
  const assignedData = weekDays.map((day) => assigned[day] || 0)
  const completedData = weekDays.map((day) => completed[day] || 0)

  return { weekDays, assignedData, completedData }
}

const TeamMemberKPI = () => {
  // State for API data
  const [kpiData, setKpiData] = useState<TeamMemberKPI | null>(null)
  const [tasksData, setTasksData] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get team member ID from URL
  const params = useParams()
  const teamId = params.id

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      if (!teamId) {
        setError("No team member ID provided in URL")
        setLoading(false)
        return
      }

      try {
        // Fetch KPI data for specific team member
        const kpiResponse = await fetch(`https://totem-consultancy-beta.vercel.app/api/crm/kpi/${teamId}`)

        if (!kpiResponse.ok) {
          throw new Error(`Failed to fetch KPI data: ${kpiResponse.status}`)
        }

        const kpiResult = await kpiResponse.json()
        setKpiData(kpiResult)

        // Fetch tasks data (assuming we need all tasks for now)
        const tasksResponse = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/projects2")

        if (!tasksResponse.ok) {
          throw new Error(`Failed to fetch tasks data: ${tasksResponse.status}`)
        }

        const tasksResult = await tasksResponse.json()
        setTasksData(tasksResult)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch data")
        setLoading(false)
      }
    }

    fetchData()
  }, [teamId])

  // Calculate task statistics
  const getTaskStats = () => {
    let totalTasks = 0
    let completedTasks = 0
    let pendingTasks = 0
    let todoTasks = 0

    tasksData.forEach((project) => {
      if (project.tasks2) {
        project.tasks2.forEach((task) => {
          totalTasks++
          if (task.status === "COMPLETED") completedTasks++
          else if (task.status === "PENDING") pendingTasks++
          else if (task.status === "TODO") todoTasks++
        })
      }
    })

    return { totalTasks, completedTasks, pendingTasks, todoTasks }
  }

  // Prepare stats data based on API response
  const prepareStatsData = () => {
    if (!kpiData) return []

    const { totalTasks, completedTasks, pendingTasks } = getTaskStats()

    return [
      {
        title: "Total Task",
        value: totalTasks.toString(),
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
          </svg>
        ),
      },
      {
        title: "Completed",
        value: completedTasks.toString(),
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
        ),
      },
      {
        title: "Task Quality",
        value: `${kpiData.taskQuality}%`,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z" />
          </svg>
        ),
      },
      {
        title: "Task Delivery",
        value: `${kpiData.taskDelivery}%`,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
        ),
      },
      {
        title: "Pending Tasks",
        value: getTaskStats().pendingTasks.toString(),
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
        ),
      },
    ]
  }

  // Prepare KPI doughnut chart data
  const prepareKPIDoughnutData = () => {
    if (!kpiData) return null

    const { taskDelivery, taskQuality, attendanceDiscipline } = kpiData

    return {
      labels: ["Task Delivery (max 45)", "Task Quality (max 40)", "Attendance & Discipline (max 15)"],
      datasets: [
        {
          data: [taskDelivery, taskQuality, attendanceDiscipline],
          backgroundColor: [
            "#4285F4", // Blue
            "#34A853", // Green
            "#EA4335", // Red
          ],
          borderWidth: 0,
          cutout: "65%",
        },
      ],
    }
  }

  // Prepare KPI legend items
  const prepareKPILegendItems = () => {
    if (!kpiData) return []

    const { taskDelivery, taskQuality, attendanceDiscipline } = kpiData

    return [
      { color: "#4285F4", label: "Task Delivery", value: `${taskDelivery}%` },
      { color: "#34A853", label: "Task Quality", value: `${taskQuality}%` },
      { color: "#EA4335", label: "Attendance & Discipline", value: `${attendanceDiscipline}%` },
    ]
  }

  // Prepare weekly report data
  const prepareWeeklyReportData = () => {
    const { weekDays, assignedData, completedData } = getWeeklyTaskData(tasksData)

    // Find the maximum value to set an appropriate scale
    const maxValue = Math.max(...assignedData, ...completedData)
    const chartMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 10

    return {
      data: {
        labels: weekDays,
        datasets: [
          {
            label: "Tasks Assigned",
            data: assignedData,
            backgroundColor: "#F26E21",
            barThickness: 25,
            borderRadius: 0,
            borderSkipped: false,
          },
          {
            label: "Tasks Completed",
            data: completedData,
            backgroundColor: "#891D06",
            barThickness: 25,
            borderRadius: 0,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom" as const,
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              boxHeight: 8,
              padding: 20,
              font: {
                size: 14,
              },
            },
          },
          title: {
            display: false,
          },
          datalabels: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: chartMax,
            ticks: {
              stepSize: Math.ceil(chartMax / 5),
              font: {
                size: 12,
              },
            },
            grid: {
              color: "#f0f0f0",
            },
            border: {
              display: false,
            },
          },
          x: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
          },
        },
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
          },
        },
      },
    }
  }

  // Task statistics doughnut chart data
  const prepareTaskStatisticData = () => {
    const { completedTasks, pendingTasks, todoTasks } = getTaskStats()

    return {
      labels: ["Complete Task", "Todo Task", "Pending Task"],
      datasets: [
        {
          data: [completedTasks, todoTasks, pendingTasks],
          backgroundColor: [
            "#F26E21", // Orange
            "#EF4444", // Red
            "#891D06", // Dark red
          ],
          borderWidth: 3,
          borderRadius: 6,
          circumference: 360,
          rotation: 225,
          cutout: "75%",
        },
      ],
    }
  }

  // Task statistics doughnut chart options
  const taskStatisticOptions = {
    responsive: true,
    cutout: "75%",
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    maintainAspectRatio: true,
  }

  // Prepare task statistics items
  const prepareTaskStats = () => {
    const { completedTasks, todoTasks, pendingTasks } = getTaskStats()

    return [
      { label: "Complete Task", value: completedTasks.toString(), color: "#F26E21" },
      { label: "Todo Task", value: todoTasks.toString(), color: "#EF4444" },
      { label: "Pending Task", value: pendingTasks.toString(), color: "#891D06" },
    ]
  }

  // Doughnut chart options
  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw
            const label = context.label || ""
            const maxValue = label.includes("Task Delivery")
              ? 45
              : label.includes("Task Quality")
                ? 40
                : label.includes("Attendance")
                  ? 15
                  : 0
            return `${label}: ${value}% of ${maxValue} points`
          },
        },
      },
      datalabels: {
        color: "white",
        font: {
          weight: "bold",
          size: 12,
        },
        formatter: (value: any) => `${value}%`,
      },
    },
  }

  // If loading, show a loading message
  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4">Loading KPI data...</p>
      </div>
    )
  }

  // If error, show an error message
  if (error) {
    return (
      <div className="w-full p-8 text-center bg-red-50 text-red-600 rounded-lg">
        <p className="font-semibold">Error: {error}</p>
        <p className="mt-2">Please check the team member ID and try again.</p>
      </div>
    )
  }

  // If no data, show an error message
  if (!kpiData || !tasksData) {
    return <div className="w-full p-8 text-center">Failed to load KPI data. Please try again later.</div>
  }

  const statsData = prepareStatsData()
  const kpiDoughnutData = prepareKPIDoughnutData()
  const kpiLegendItems = prepareKPILegendItems()
  const taskStatisticData = prepareTaskStatisticData()
  const taskStats = prepareTaskStats()
  const { totalTasks } = getTaskStats()

  // Component for displaying KPI max points
  const KPIMaxPointsLegend = () => {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">KPI Maximum Points</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#4285F4" }}></div>
              <span className="text-gray-700">Task Delivery</span>
            </div>
            <span className="font-semibold">45 points</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#34A853" }}></div>
              <span className="text-gray-700">Task Quality</span>
            </div>
            <span className="font-semibold">40 points</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#EA4335" }}></div>
              <span className="text-gray-700">Attendance & Discipline</span>
            </div>
            <span className="font-semibold">15 points</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center">
              <span className="text-gray-700 font-medium">Total Possible KPI</span>
            </div>
            <span className="font-bold">100 points</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-gray-50 p-4 flex flex-col gap-4">
      {/* Team Member Info */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{kpiData.name}'s Performance</h2>
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Team ID: {kpiData.teamId}
          </div>
          <div className="ml-4 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">
              Total KPI: <span className="font-bold">{kpiData.totalKPI}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Scrolling Cards */}
      <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
        {statsData.map((stat, index) => (
          <div key={index} className="flex-shrink-0 bg-white rounded-lg p-6 shadow-sm min-w-64 flex items-start gap-4">
            <div className="rounded-full bg-white border-2 border-gray-200 p-3 flex items-center justify-center text-gray-700">
              {stat.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 text-md font-semibold">{stat.title}</span>
              <span className="text-3xl font-medium">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* KPI Doughnut Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">KPI Breakdown</h3>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-64 w-64 mb-4">
              {kpiDoughnutData && <Doughnut data={kpiDoughnutData} options={doughnutChartOptions} />}
            </div>
            <div className="grid grid-cols-1 gap-3 w-full">
              {kpiLegendItems.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex items-center mr-2">
                    <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex items-center ml-auto">
                    <svg
                      className="w-4 h-4 text-gray-500 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="text-gray-700">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                {kpiData.name}'s Total KPI: <span className="font-bold">{kpiData.totalKPI}%</span>
              </p>
            </div>
          </div>
          <KPIMaxPointsLegend />
        </div>

        {/* Task Statistics */}
        <div className="bg-white rounded-lg p-6 shadow-sm flex-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Task Statistics</h3>
          </div>

          {/* Task Count Cards */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 border border-gray-100 rounded-lg p-4">
              <div className="text-gray-500 text-sm">Total Tasks</div>
              <div className="text-3xl font-bold mt-2">{totalTasks}</div>
            </div>
            <div className="flex-1 border border-gray-100 rounded-lg p-4">
              <div className="text-gray-500 text-sm">Overdue Tasks</div>
              <div className="text-3xl font-bold mt-2">
                {
                  tasksData.filter(
                    (project) => new Date(project.dueDate) < new Date() && project.status !== "COMPLETED",
                  ).length
                }
              </div>
            </div>
          </div>

          {/* Task Statistics Doughnut Chart */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative h-48 w-48">
              <Doughnut data={taskStatisticData} options={taskStatisticOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-sm text-gray-500">Complete Task</div>
                <div className="text-2xl font-bold">{taskStats[0].value} Task</div>
              </div>
            </div>
          </div>

          {/* Task Statistics List */}
          <div className="w-full space-y-6">
            {taskStats.map((task, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: task.color }}></div>
                  <span className="text-gray-700">{task.label}</span>
                </div>
                <span className="font-semibold">{task.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Report Bar Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Weekly Task Report</h3>
        </div>
        <div className="h-[400px]">
          {tasksData.length > 0 ? (
            <Bar data={prepareWeeklyReportData().data} options={prepareWeeklyReportData().options} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No weekly data available</p>
            </div>
          )}
        </div>
      </div>

      {/* CSS for hiding scrollbar */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default TeamMemberKPI
