"use client"

import { useEffect, useState } from "react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import { Bar, Doughnut } from "react-chartjs-2"
import kp1 from "./assets/kpi1.png"
import kp2 from "./assets/kpi2.png"
import kp3 from "./assets/kpi3.png"
import kp4 from "./assets/kpi4.png"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

// Define types for API responses
interface KPIData {
  success: boolean
  overall: {
    taskDelivery: number
    taskQuality: number
    attendanceDiscipline: number
    totalKPI: number
  }
  data: Array<{
    teamId: string
    name: string
    taskDelivery: number
    taskQuality: number
    attendanceDiscipline: number
    totalKPI: number
  }>
}

interface TeamMember {
  id: string
  name: string
  department: string
  role: string
  // Other fields omitted for brevity
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
    // Other fields omitted for brevity
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

const KPI = () => {
  // State for API data
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [teamData, setTeamData] = useState<TeamMember[]>([])
  const [tasksData, setTasksData] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // 1. Add state variables for the KPI selection, month, and week selection after the existing useState declarations
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("Jan 2025")
  const [selectedWeek, setSelectedWeek] = useState<string>(new Date().getFullYear().toString())

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch KPI data
        const kpiResponse = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/kpi")
        const kpiResult = await kpiResponse.json()
        setKpiData(kpiResult)

        // Fetch team data
        const teamResponse = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/teamm")
        const teamResult = await teamResponse.json()
        setTeamData(teamResult)

        // Fetch tasks data
        const tasksResponse = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/projects2")
        const tasksResult = await tasksResponse.json()
        setTasksData(tasksResult)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate department counts from team data
  const getDepartmentCounts = () => {
    const departments: Record<string, number> = {}

    teamData.forEach((member) => {
      if (member.department) {
        if (!departments[member.department]) {
          departments[member.department] = 0
        }
        departments[member.department]++
      }
    })

    // Get unique departments and their counts
    const departmentLabels = Object.keys(departments)
    const departmentCounts = departmentLabels.map((dept) => departments[dept])

    return { departmentLabels, departmentCounts }
  }

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
    if (!kpiData || !tasksData) return []

    const { totalTasks, completedTasks, pendingTasks } = getTaskStats()

    return [
      {
        title: "Total Task",
        value: totalTasks.toString(),
        icon: <img src={kp1 || "/placeholder.svg"} alt="" />,
      },
      {
        title: "Completed",
        value: completedTasks.toString(),
        icon: <img src={kp2 || "/placeholder.svg"} alt="" />,
      },
      {
        title: "Task Quality",
        value: `${kpiData.overall.taskQuality}%`,
        icon: <img src={kp3 || "/placeholder.svg"} alt="" />,
      },
      {
        title: "Task Delivery",
        value: `${kpiData.overall.taskDelivery}%`,
        icon: <img src={kp4 || "/placeholder.svg"} alt="" />,
      },
      {
        title: "Pending Tasks",
        value: pendingTasks.toString(),
        icon: <img src={kp4 || "/placeholder.svg"} alt="" />,
      },
    ]
  }

  // Prepare department bar chart data
  const prepareDepartmentChartData = () => {
    const { departmentLabels, departmentCounts } = getDepartmentCounts()

    return {
      labels: departmentLabels,
      datasets: [
        {
          data: departmentCounts,
          backgroundColor: "#891D06",
          barThickness: 30,
        },
      ],
    }
  }

  // 2. Modify the prepareKPIDoughnutData function to handle team member selection
  const prepareKPIDoughnutData = () => {
    if (!kpiData) return null

    // If "all" is selected, show overall KPI, otherwise show the selected team member's KPI
    const kpiToShow =
      selectedTeamMember === "all"
        ? kpiData.overall
        : kpiData.data.find((member) => member.teamId === selectedTeamMember)

    if (!kpiToShow) return null

    const { taskDelivery, taskQuality, attendanceDiscipline } = kpiToShow

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

  // 3. Modify the prepareKPILegendItems function to handle team member selection
  const prepareKPILegendItems = () => {
    if (!kpiData) return []

    // If "all" is selected, show overall KPI, otherwise show the selected team member's KPI
    const kpiToShow =
      selectedTeamMember === "all"
        ? kpiData.overall
        : kpiData.data.find((member) => member.teamId === selectedTeamMember)

    if (!kpiToShow) return []

    const { taskDelivery, taskQuality, attendanceDiscipline } = kpiToShow

    return [
      { color: "#4285F4", label: "Task Delivery", value: `${taskDelivery}%` },
      { color: "#34A853", label: "Task Quality", value: `${taskQuality}%` },
      { color: "#EA4335", label: "Attendance & Discipline", value: `${attendanceDiscipline}%` },
    ]
  }

  // Prepare weekly report data from API
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
    const { totalTasks, completedTasks, pendingTasks, todoTasks } = getTaskStats()

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

  // 4. Add a function to filter department data by month
  const filterDepartmentDataByMonth = (month: string) => {
    // In a real implementation, you would make an API call with the selected month
    console.log("Fetching department data for:", month)
    return prepareDepartmentChartData()
  }

  // 5. Add a function to filter weekly data by selected week
  const filterWeeklyDataByWeek = (year: string) => {
    // In a real implementation, you would make an API call with the selected week
    console.log("Fetching weekly data for year:", year)
    return prepareWeeklyReportData()
  }

  // Bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
        max: 50,
        ticks: {
          stepSize: 10,
        },
        grid: {
          color: "#f0f0f0",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
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
    return <div className="w-full p-8 text-center">Loading KPI data...</div>
  }

  // If no data, show an error message
  if (!kpiData || !teamData || !tasksData) {
    return <div className="w-full p-8 text-center">Failed to load KPI data. Please try again later.</div>
  }

  const statsData = prepareStatsData()
  const departmentChartData = prepareDepartmentChartData()
  const kpiDoughnutData = prepareKPIDoughnutData()
  const kpiLegendItems = prepareKPILegendItems()
  const taskStatisticData = prepareTaskStatisticData()
  const taskStats = prepareTaskStats()
  const { totalTasks } = getTaskStats()

  // Add a component for displaying KPI max points
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
    <div className="w-full bg-pink-50 p-4 flex flex-col gap-4">
      {/* Scrolling Cards */}
      <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-2">
        {statsData.map((stat, index) => (
          <div key={index} className="flex-shrink-0 bg-white rounded-lg p-6 shadow-sm min-w-64 flex items-start gap-4">
            <div className="rounded-full bg-white border-2 border-gray-900 p-3 flex items-center justify-center">
              {stat.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 text-md font-semibold">{stat.title}</span>
              <span className="text-3xl font-medium ">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm flex-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Departmental Bar Chart</h3>
            <div className="relative">
              {/* <select
                className="bg-gray-50 text-gray-700 px-4 py-2 rounded-md"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value)
                  filterDepartmentDataByMonth(e.target.value)
                }}
              >
                <option value="Jan 2025">Jan 2025</option>
                <option value="Feb 2025">Feb 2025</option>
                <option value="Mar 2025">Mar 2025</option>
                <option value="Apr 2025">Apr 2025</option>
                <option value="May 2025">May 2025</option>
                <option value="Jun 2025">Jun 2025</option>
              </select> */}
            </div>
          </div>
          <div className="h-[380px]">
            <Bar data={filterDepartmentDataByMonth(selectedMonth)} options={barChartOptions} />
            <div className="text-center mt-2 text-gray-600">Departments</div>
          </div>
        </div>

        {/* KPI Doughnut Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">KPI Breakdown</h3>
            <select
              className="bg-gray-50 text-gray-700 px-4 py-2 rounded-md"
              value={selectedTeamMember}
              onChange={(e) => setSelectedTeamMember(e.target.value)}
            >
              <option value="all">All KPI</option>
              {kpiData.data.map((member) => (
                <option key={member.teamId} value={member.teamId}>
                  {member.name}
                </option>
              ))}
            </select>
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
                {selectedTeamMember === "all" ? (
                  <>
                    Overall KPI: <span className="font-bold">{kpiData.overall.totalKPI}%</span>
                  </>
                ) : (
                  <>
                    {kpiData.data.find((m) => m.teamId === selectedTeamMember)?.name}'s KPI:
                    <span className="font-bold">
                      {" "}
                      {kpiData.data.find((m) => m.teamId === selectedTeamMember)?.totalKPI}%
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <KPIMaxPointsLegend />
        </div>
      </div>

      {/* New Charts Section from Design Image */}
      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Weekly Report Bar Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm flex-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-800">Weekly Report</h3>
            <div className="relative">
              {/* <select
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md"
                value={selectedWeek}
                onChange={(e) => {
                  setSelectedWeek(e.target.value)
                  filterWeeklyDataByWeek(e.target.value)
                }}
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select> */}
            </div>
          </div>
          <div className="h-[470px]">
            {tasksData.length > 0 ? (
              <Bar
                data={filterWeeklyDataByWeek(selectedWeek).data}
                options={filterWeeklyDataByWeek(selectedWeek).options}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No weekly data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Task Statistics - Updated with real data */}
        <div className="bg-white rounded-lg p-6 shadow-sm flex-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-800">Task Statistic</h3>
          </div>

          {/* Task Count Cards - Updated with real data */}
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

          {/* Task Statistics Doughnut Chart - Updated with real data */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative h-48 w-48">
              <Doughnut data={taskStatisticData} options={taskStatisticOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-sm text-gray-500">Complete Task</div>
                <div className="text-2xl font-bold">{taskStats[0].value} Task</div>
              </div>
            </div>
          </div>

          {/* Task Statistics List - Updated with real data */}
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
    </div>
  )
}

export default KPI
