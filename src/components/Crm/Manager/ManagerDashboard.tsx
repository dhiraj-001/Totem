"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
  Tooltip,
} from "recharts"
import icon from "../../../components/Admin/assets/assets/boxicon.png"
import icon2 from "../../../components/Admin/assets/assets/2.png"
import icon3 from "../../../components/Admin/assets/assets/3.png"
import icon4 from "../../../components/Admin/assets/assets/4.png"
import green from "../../Crm/Admin/AdminClient/greenarrow.png"
import red from "../../Crm/Admin/AdminClient/red.png"

const DashboardMetricsCards = () => {
  const [activeView, setActiveView] = useState("month")
  const [clientData, setClientData] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [salesPipelineData, setSalesPipelineData] = useState([])
  const [projectsData, setProjectsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [leadsData, setLeadsData] = useState([])

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch clients data
        const clientsResponse = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/client")
        const clientsData = await clientsResponse.json()

        // Fetch revenue data
        const revenueResponse = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/sales-revenue")
        const revenueData = await revenueResponse.json()

        // Fetch sales pipeline data
        const salesResponse = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/sales-pipeline")
        const salesData = await salesResponse.json()

        // Fetch projects and tasks data
        const projectsResponse = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/projects2")
        const projectsData = await projectsResponse.json()

        // Fetch leads data
        const leadsResponse = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/leads")
        const leadsData = await leadsResponse.json()
        setLeadsData(leadsData.leads || [])

        setClientData(clientsData)
        setRevenueData(revenueData)
        setSalesPipelineData(salesData)
        setProjectsData(projectsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate metrics
  const totalClients = clientData.length

  // Calculate total revenue from revenue data
  const totalRevenue = revenueData.reduce((total, item) => {
    return total + (Number.parseInt(item.totalRevenue) || 0)
  }, 0)

  // Format revenue with commas
  const formattedTotalRevenue = totalRevenue.toLocaleString("en-US")

  // Count won sales
  const wonSales = salesPipelineData.filter((sale) => sale.closeWon === "Yes").length

  // Calculate project and task metrics
  const calculateProjectMetrics = () => {
    // Count projects by status
    const projectsByStatus = {
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
    }

    let totalTasks = 0
    const taskStatus = {
      TODO: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      REVIEW: 0,
      OTHER: 0,
    }

    projectsData.forEach((project) => {
      // Count projects by status
      if (project.status in projectsByStatus) {
        projectsByStatus[project.status]++
      } else {
        projectsByStatus["OTHER"] = (projectsByStatus["OTHER"] || 0) + 1
      }

      // Count tasks and their statuses
      if (project.tasks2 && Array.isArray(project.tasks2)) {
        totalTasks += project.tasks2.length

        project.tasks2.forEach((task) => {
          if (task.status in taskStatus) {
            taskStatus[task.status]++
          } else {
            taskStatus["OTHER"] = (taskStatus["OTHER"] || 0) + 1
          }
        })
      }
    })

    // Format for task pie chart
    const taskData = [
      { name: "Complete", value: taskStatus["COMPLETED"] || 0, color: "#22C55E" },
      { name: "In Progress", value: taskStatus["IN_PROGRESS"] || 0, color: "#2563EB" },
      { name: "Todo", value: taskStatus["TODO"] || 0, color: "#EF4444" },
    ]

    // If there are no tasks, provide some default data to avoid empty charts
    if (totalTasks === 0) {
      return {
        taskData: [
          { name: "Complete", value: 45, color: "#22C55E" },
          { name: "Created", value: 45, color: "#2563EB" },
          { name: "Uncomplete", value: 10, color: "#EF4444" },
        ],
        taskStatusData: [
          { name: "Completed", value: 25, color: "#3B82F6" },
          { name: "In Progress", value: 28, color: "#22C55E" },
          { name: "Pending", value: 10, color: "#EF4444" },
          { name: "Todo", value: 21, color: "#F97316" },
          { name: "Other Task", value: 16, color: "#FBBF24" },
        ],
      }
    }

    // Format for task donut chart - calculate percentages
    const calculatePercentage = (value) => Math.round((value / totalTasks) * 100) || 0

    const taskStatusData = [
      { name: "Completed", value: calculatePercentage(taskStatus["COMPLETED"] || 0), color: "#3B82F6" },
      { name: "In Progress", value: calculatePercentage(taskStatus["IN_PROGRESS"] || 0), color: "#22C55E" },
      { name: "Todo", value: calculatePercentage(taskStatus["TODO"] || 0), color: "#EF4444" },
    ]

    return { taskData, taskStatusData }
  }

  const { taskData, taskStatusData } = calculateProjectMetrics()

  // Sample data for the growth chart (could be replaced with real data)
  const chartData = [
    { name: "Jan", month: 3, quarter: 10 },
    { name: "Feb", month: 15, quarter: 20 },
    { name: "Mar", month: 40, quarter: 45 },
    { name: "April", month: 60, quarter: 50 },
    { name: "Jun", month: 50, quarter: 40 },
    { name: "July", month: 40, quarter: 35 },
    { name: "Aug", month: 35, quarter: 30 },
    { name: "Sep", month: 38, quarter: 27 },
    { name: "Oct", month: 33, quarter: 25 },
    { name: "Nov", month: 15, quarter: 15 },
    { name: "Dec", month: 5, quarter: 10 },
  ]

  // Generate monthly revenue chart data based on actual revenue
  const generateMonthlyRevenueData = () => {
    const baseRevenue = totalRevenue / 12 // Distribute total evenly as base

    return [
      { name: "1", value: baseRevenue * 0.8 },
      { name: "2", value: baseRevenue * 0.5 },
      { name: "3", value: baseRevenue * 0.4 },
      { name: "4", value: baseRevenue * 0.7 },
      { name: "5", value: baseRevenue * 0.6 },
      { name: "6", value: baseRevenue * 0.8 },
      { name: "7", value: baseRevenue * 1.1 },
      { name: "8", value: baseRevenue * 1.2 },
      { name: "9", value: baseRevenue * 1.4 },
      { name: "10", value: baseRevenue * 1.3 },
      { name: "11", value: baseRevenue * 1.1 },
      { name: "12", value: baseRevenue * 0.9 },
    ]
  }

  // Data for payment pie chart
  const paymentData = [
    { name: "Received", value: 45, color: "#22C55E" },
    { name: "Pending", value: 45, color: "#2563EB" },
    { name: "Payment Due", value: 10, color: "#EF4444" },
  ]

  // Process lead data for funnel chart
  const processFunnelData = () => {
    // Count leads by status
    const statusCounts = {}
    leadsData.forEach((lead) => {
      const status = lead.status || "UNKNOWN"
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    // Convert to array and sort by count
    const statusArray = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
    statusArray.sort((a, b) => b.value - a.value)

    // Take top 5 statuses
    const top5Statuses = statusArray.slice(0, 5)

    // Use fixed values for the funnel shape, but store real data for tooltip
    return [
      {
        name: "Awareness",
        value: 100,
        fill: "#EF4444",
        realName: top5Statuses[0]?.name,
        realValue: top5Statuses[0]?.value,
      },
      {
        name: "Interest",
        value: 80,
        fill: "#F97316",
        realName: top5Statuses[1]?.name,
        realValue: top5Statuses[1]?.value,
      },
      {
        name: "Consideration",
        value: 60,
        fill: "#FBBF24",
        realName: top5Statuses[2]?.name,
        realValue: top5Statuses[2]?.value,
      },
      {
        name: "Intent",
        value: 40,
        fill: "#38BDF8",
        realName: top5Statuses[3]?.name,
        realValue: top5Statuses[3]?.value,
      },
      {
        name: "Evaluation",
        value: 20,
        fill: "#0C4A6E",
        realName: top5Statuses[4]?.name,
        realValue: top5Statuses[4]?.value,
      },
    ]
  }

  // Custom tooltip for funnel chart
  const FunnelTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      if (!item.realName || !item.realValue) {
        return null
      }
      return (
        <div className="bg-white p-2 shadow rounded border border-gray-200">
          <p className="font-medium">{item.realName}</p>
          <p className="text-sm text-gray-600">{`Count: ${item.realValue}`}</p>
          <p className="text-sm text-gray-600">{`Percentage: ${Math.round((item.realValue / leadsData.length) * 100)}%`}</p>
        </div>
      )
    }
    return null
  }

  // Labels for pie chart slices
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180)
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180)

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="medium">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Loading indicator
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="text-xl text-gray-600">Loading dashboard data...</div>
      </div>
    )
  }

  const funnelData = processFunnelData()

  return (
    <div className="w-full">
      {/* Scroll container with hidden scrollbar */}
      <div
        className="flex gap-4 pb-4 overflow-x-auto overflow-y-visible snap-x 
                    scrollbar-hide"
      >
        {/* Total Clients Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Clients</p>
              <h2 className="text-4xl font-bold mt-2">{totalClients}</h2>
              <div className="flex items-center mt-4">
                <img src={green || "/placeholder.svg"} className="mr-2" alt="Trend indicator" />
                <span className="text-sm font-medium">
                  <span className="text-green-500">8.5%</span> Up from yesterday
                </span>
              </div>
            </div>
            <img src={icon || "/placeholder.svg"} alt="Clients icon" className="w-11 h-11 object-cover" />
          </div>
        </div>

        {/* Net Gross Profit Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Net Gross Profit</p>
              <h2 className="text-4xl font-bold mt-2">${formattedTotalRevenue}</h2>
              <div className="flex items-center mt-4">
                <img src={green || "/placeholder.svg"} className="mr-2" alt="Trend indicator" />
                <span className="text-sm font-medium">
                  <span className="text-green-500">8.5%</span> Up from yesterday
                </span>
              </div>
            </div>
            <img src={icon2 || "/placeholder.svg"} alt="Profit icon" className="w-11 h-11 object-cover" />
          </div>
        </div>

        {/* Opportunities Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Opportunities</p>
              <h2 className="text-4xl font-bold mt-2">{salesPipelineData.length}</h2>
              <div className="flex items-center mt-4">
                <img src={green || "/placeholder.svg"} className="mr-2" alt="Trend indicator" />
                <span className="text-sm font-medium">
                  <span className="text-green-500">8.5%</span> Up from yesterday
                </span>
              </div>
            </div>
            <img src={icon3 || "/placeholder.svg"} alt="Opportunities icon" className="w-11 h-11 object-cover" />
          </div>
        </div>

        {/* Total Sales Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Sale</p>
              <h2 className="text-4xl font-bold mt-2">{wonSales}</h2>
              <div className="flex items-center mt-4">
                <img src={wonSales > 90 ? green : red} className="mr-2" alt="Trend indicator" />
                <span className="text-sm font-medium">
                  <span className={wonSales > 90 ? "text-green-500" : "text-red-500"}>
                    {wonSales > 90 ? "8.5%" : "2.3%"}
                  </span>
                  {wonSales > 90 ? "Up from" : "Down from"} yesterday
                </span>
              </div>
            </div>
            <img src={icon4 || "/placeholder.svg"} alt="Sales icon" className="w-11 h-11 object-cover" />
          </div>
        </div>
      </div>

      {/* Growth Metrics Chart */}
      <div className="bg-white rounded-2xl shadow p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold">Growth Metrics</h3>
            <p className="text-gray-600">Sales</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className={`flex items-center ${activeView === "quarter" ? "text-gray-900" : "text-gray-400"}`}
              onClick={() => setActiveView("quarter")}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${activeView === "quarter" ? "bg-gray-900" : "bg-gray-400"}`}
              ></span>
              Quarter
            </button>
            <button
              className={`flex items-center ${activeView === "month" ? "text-blue-500" : "text-gray-400"}`}
              onClick={() => setActiveView("month")}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${activeView === "month" ? "bg-blue-500" : "bg-gray-400"}`}
              ></span>
              Month
            </button>
          </div>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280" }} domain={[0, "dataMax + 10"]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="quarter"
                stroke="#000000"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="month"
                stroke="#38BDF8"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Three Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Payments Chart */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xl font-bold">Payments</h3>
            <button className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </p>

          <div className="flex flex-col items-center">
            <div className="h-48 w-48">
              <PieChart width={200} height={200}>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  paddingAngle={0}
                  labelLine={false}
                  dataKey="value"
                  label={renderPieLabel}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Payment Due</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Received</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart - Using actual revenue data */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xl font-bold">Revenue</h3>
            <button className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-1">${formattedTotalRevenue}</h2>
            <p className="text-gray-500 text-sm mb-6">Won from {wonSales} Deals</p>

            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateMonthlyRevenueData()} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#EDE9FE" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <Tooltip />
                  <Area
                    type="natural"
                    dataKey="value"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    isAnimationActive={false}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Task Status Chart - Updated with actual task data */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xl font-bold">Task Status</h3>
            <button className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </p>

          <div className="flex flex-col items-center">
            <div className="h-48 w-48">
              <PieChart width={200} height={200}>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Todo</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Row with Funnel Chart and Donut Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Funnel Chart for Leads */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-bold mb-6 text-center">Leads</h3>

          <div className="flex justify-center items-center h-80 mt-16">
            <ResponsiveContainer width="100%" height="120%">
              <FunnelChart width={400} height={300}>
                <Tooltip content={<FunnelTooltip />} />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive={false}
                  trapezoidHeight={60}
                  paddingAngle={0}
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Donut Chart - Updated with actual task data */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xl font-bold">Projects & Tasks</h3>
            <div className="text-sm text-gray-600">Total Projects: {projectsData.length}</div>
            <button className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-64 w-64 relative">
              <PieChart width={250} height={250}>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={98}
                  paddingAngle={0}
                  dataKey="value"
                  label={renderPieLabel}
                  labelLine={false}
                  stroke="none"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
              {taskStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-500 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span>{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add this style block for the scrollbar hiding */}
      <style jsx>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  )
}

export default DashboardMetricsCards
