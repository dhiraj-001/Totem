import { useEffect, useState } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js"
import { Doughnut, Bar } from "react-chartjs-2"
import { useParams } from "react-router-dom"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

// Define types for API responses
interface AttendanceRecord {
  id: string
  date: string
  status: "PRESENT" | "ABSENT" | "MEDICAL"
  teamId: string
  createdAt: string
  updatedAt: string
  team: TeamMember
}

interface TeamMember {
  id: string
  password: string
  role: string
  imageURL: string
  name: string
  personalMail: string
  mobile: string
  dob: string
  gender: string
  maritalStatus: string
  bloodGroup: string
  guardianName: string
  emergencyContactName: string
  emergencyContactNumber: string
  emergencyContactAddress: string
  emergencyContactRelationship: string
  branch: string
  department: string
  employeeType: string
  jobTitle: string
  dateofJoining: string
  employeeId: string
  officialMail: string
  pfAcNo: string
  bankName: string
  bankBranch: string
  acNo: string
  ifscCode: string
  upiId: string
}

interface AttendanceStats {
  present: number
  absent: number
  medical: number
  total: number
  presentPercentage: number
  absentPercentage: number
  medicalPercentage: number
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

// Helper function to get month name
const getMonthName = (date: Date) => {
  return date.toLocaleDateString("en-US", { month: "short" })
}

// Helper function to get year
const getYear = (date: Date) => {
  return date.getFullYear()
}

const AttendanceDetails = () => {
  // State for API data
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [filteredAttendanceData, setFilteredAttendanceData] = useState<AttendanceRecord[]>([])
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    present: 0,
    absent: 0,
    medical: 0,
    total: 0,
    presentPercentage: 0,
    absentPercentage: 0,
    medicalPercentage: 0,
  })

  // State for filters
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [noRecords, setNoRecords] = useState(false)

  // Get team member ID from URL
  const params = useParams()
  const teamId = params.id

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!teamId) {
        setError("No team member ID provided in URL")
        setLoading(false)
        return
      }

      try {
        // First, fetch team member data to get their info even if no attendance records
        const teamResponse = await fetch(`https://totem-consultancy-beta.vercel.app/api/crm/teamm/${teamId}`)
        
        if (!teamResponse.ok) {
          throw new Error(`Failed to fetch team member data: ${teamResponse.status}`)
        }
        
        const teamData = await teamResponse.json()
        setTeamMember(teamData)
        
        // Now fetch attendance data
        const response = await fetch("https://totem-consultancy-beta.vercel.app/api/crm/attendance")

        if (!response.ok) {
          throw new Error(`Failed to fetch attendance data: ${response.status}`)
        }

        const result = await response.json()
        
        if (!result.success) {
          throw new Error("API returned unsuccessful response")
        }

        // Filter attendance records for the specific team member
        const teamAttendance = result.data.filter((record: AttendanceRecord) => record.teamId === teamId)
        
        if (teamAttendance.length === 0) {
          setNoRecords(true)
          // Set empty data but don't show error
          setAttendanceData([])
          setFilteredAttendanceData([])
          setAvailableMonths([])
          setAvailableYears([])
          // Set all stats to 0
          setAttendanceStats({
            present: 0,
            absent: 0,
            medical: 0,
            total: 0,
            presentPercentage: 0,
            absentPercentage: 0,
            medicalPercentage: 0,
          })
        } else {
          setAttendanceData(teamAttendance)
          setFilteredAttendanceData(teamAttendance)
          
          // Extract available months and years for filtering
          const months = new Set<string>()
          const years = new Set<string>()
          
          teamAttendance.forEach(record => {
            const date = new Date(record.date)
            months.add(getMonthName(date))
            years.add(getYear(date).toString())
          })
          
          setAvailableMonths(Array.from(months))
          setAvailableYears(Array.from(years).sort())

          // Calculate attendance statistics
          calculateAttendanceStats(teamAttendance)
        }
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch attendance data")
        setLoading(false)
      }
    }

    fetchData()
  }, [teamId])

  // Apply filters when month or year changes
  useEffect(() => {
    if (attendanceData.length === 0) return
    
    let filtered = [...attendanceData]
    
    if (selectedMonth !== "all") {
      filtered = filtered.filter(record => {
        const date = new Date(record.date)
        return getMonthName(date) === selectedMonth
      })
    }
    
    if (selectedYear !== "all") {
      filtered = filtered.filter(record => {
        const date = new Date(record.date)
        return getYear(date).toString() === selectedYear
      })
    }
    
    setFilteredAttendanceData(filtered)
    calculateAttendanceStats(filtered)
  }, [selectedMonth, selectedYear, attendanceData])

  // Calculate attendance statistics
  const calculateAttendanceStats = (data: AttendanceRecord[]) => {
    const present = data.filter(record => record.status === "PRESENT").length
    const absent = data.filter(record => record.status === "ABSENT").length
    const medical = data.filter(record => record.status === "MEDICAL").length
    const total = data.length

    setAttendanceStats({
      present,
      absent,
      medical,
      total,
      presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0,
      absentPercentage: total > 0 ? Math.round((absent / total) * 100) : 0,
      medicalPercentage: total > 0 ? Math.round((medical / total) * 100) : 0,
    })
  }

  // Handle filter changes
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value)
  }
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value)
  }

  // Prepare doughnut chart data
  const prepareDoughnutData = () => {
    const { present, absent, medical } = attendanceStats

    return {
      labels: ["Present", "Absent", "Medical Leave"],
      datasets: [
        {
          data: present === 0 && absent === 0 && medical === 0 ? [1, 1, 1] : [present, absent, medical],
          backgroundColor: [
            "#34A853", // Green for present
            "#EA4335", // Red for absent
            "#4285F4", // Blue for medical
          ],
          borderWidth: 0,
          cutout: "65%",
        },
      ],
    }
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
            if (noRecords) return "No data available"
            
            const value = context.raw
            const label = context.label || ""
            const percentage = attendanceStats.total > 0 
              ? Math.round((value / attendanceStats.total) * 100)
              : 0
            return `${label}: ${value} days (${percentage}%)`
          },
        },
      },
    },
  }

  // Prepare monthly attendance data
  const prepareMonthlyData = () => {
    // If no records, return empty chart data
    if (noRecords || filteredAttendanceData.length === 0) {
      return {
        data: {
          labels: ["No Data"],
          datasets: [
            {
              label: "Present",
              data: [0],
              backgroundColor: "#34A853",
              barThickness: 25,
              borderRadius: 4,
            },
            {
              label: "Absent",
              data: [0],
              backgroundColor: "#EA4335",
              barThickness: 25,
              borderRadius: 4,
            },
            {
              label: "Medical Leave",
              data: [0],
              backgroundColor: "#4285F4",
              barThickness: 25,
              borderRadius: 4,
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
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 10,
              ticks: {
                stepSize: 2,
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
    
    // Group attendance by month
    const monthlyData: Record<string, { present: number; absent: number; medical: number }> = {}
    
    filteredAttendanceData.forEach(record => {
      const date = new Date(record.date)
      const month = getMonthName(date)
      
      if (!monthlyData[month]) {
        monthlyData[month] = { present: 0, absent: 0, medical: 0 }
      }
      
      if (record.status === "PRESENT") monthlyData[month].present++
      else if (record.status === "ABSENT") monthlyData[month].absent++
      else if (record.status === "MEDICAL") monthlyData[month].medical++
    })
    
    // Convert to arrays for chart.js
    const months = Object.keys(monthlyData)
    const presentData = months.map(month => monthlyData[month].present)
    const absentData = months.map(month => monthlyData[month].absent)
    const medicalData = months.map(month => monthlyData[month].medical)
    
    // Find the maximum value to set an appropriate scale
    const maxValue = Math.max(...presentData, ...absentData, ...medicalData)
    const chartMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 10
    
    return {
      data: {
        labels: months,
        datasets: [
          {
            label: "Present",
            data: presentData,
            backgroundColor: "#34A853", // Green
            barThickness: 25,
            borderRadius: 4,
          },
          {
            label: "Absent",
            data: absentData,
            backgroundColor: "#EA4335", // Red
            barThickness: 25,
            borderRadius: 4,
          },
          {
            label: "Medical Leave",
            data: medicalData,
            backgroundColor: "#4285F4", // Blue
            barThickness: 25,
            borderRadius: 4,
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

  // Prepare attendance legend items
  const prepareAttendanceLegendItems = () => {
    const { present, absent, medical, presentPercentage, absentPercentage, medicalPercentage } = attendanceStats
    
    return [
      { color: "#34A853", label: "Present", value: present, percentage: presentPercentage },
      { color: "#EA4335", label: "Absent", value: absent, percentage: absentPercentage },
      { color: "#4285F4", label: "Medical Leave", value: medical, percentage: medicalPercentage },
    ]
  }

  // Prepare recent attendance records
  const prepareRecentAttendance = () => {
    // Sort by date (most recent first)
    return [...filteredAttendanceData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800"
      case "ABSENT":
        return "bg-red-100 text-red-800"
      case "MEDICAL":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // If loading, show a loading message
  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4">Loading attendance data...</p>
      </div>
    )
  }

  // If error, show an error message
  if (error) {
    return (
      <div className="w-full p-8 text-center bg-red-50 text-red-600 rounded-lg">
        <p className="font-semibold">Error: {error}</p>
        <p className="mt-2">Please try again later.</p>
      </div>
    )
  }

  // If no team member data found
  if (!teamMember) {
    return (
      <div className="w-full p-8 text-center bg-yellow-50 text-yellow-600 rounded-lg">
        <p className="font-semibold">Team member not found</p>
        <p className="mt-2">Please check the team member ID and try again.</p>
      </div>
    )
  }

  const attendanceLegendItems = prepareAttendanceLegendItems()
  const recentAttendance = prepareRecentAttendance()

  return (
    <div className="w-full bg-gray-50 p-4 flex flex-col gap-4">
      {/* Team Member Info */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{teamMember.name}'s Attendance</h2>
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Team ID: {teamMember.id}
          </div>
          <div className="ml-4 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">
              Present Rate: <span className="font-bold">{attendanceStats.presentPercentage}%</span>
            </span>
          </div>
        </div>
        {noRecords && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md">
            <p>No attendance records found for this team member. Statistics will show as zero.</p>
          </div>
        )}
      </div>

      {/* Filters - Only show if there are records */}
      {!noRecords && attendanceData.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Month
              </label>
              <select
                id="month-filter"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Months</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Year
              </label>
              <select
                id="year-filter"
                value={selectedYear}
                onChange={handleYearChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 flex items-end">
              <button
                onClick={() => {
                  setSelectedMonth("all")
                  setSelectedYear("all")
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 mt-6"
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            {filteredAttendanceData.length === 0 ? (
              <p>No attendance records found for the selected filters.</p>
            ) : (
              <p>
                Showing {filteredAttendanceData.length} attendance records
                {selectedMonth !== "all" && ` for ${selectedMonth}`}
                {selectedYear !== "all" && ` ${selectedYear}`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Attendance Summary Cards */}
      <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
        <div className="flex-shrink-0 bg-white rounded-lg p-6 shadow-sm min-w-64 flex items-start gap-4">
          <div className="rounded-full bg-green-100 p-3 flex items-center justify-center text-green-700">
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
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 text-md font-semibold">Present Days</span>
            <span className="text-3xl font-medium">{attendanceStats.present}</span>
          </div>
        </div>
        
        <div className="flex-shrink-0 bg-white rounded-lg p-6 shadow-sm min-w-64 flex items-start gap-4">
          <div className="rounded-full bg-red-100 p-3 flex items-center justify-center text-red-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 text-md font-semibold">Absent Days</span>
            <span className="text-3xl font-medium">{attendanceStats.absent}</span>
          </div>
        </div>
        
        <div className="flex-shrink-0 bg-white rounded-lg p-6 shadow-sm min-w-64 flex items-start gap-4">
          <div className="rounded-full bg-blue-100 p-3 flex items-center justify-center text-blue-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15.58 12a3.001 3.001 0 01-5.16 0M12 7a1 1 0 110-2 1 1 0 010 2zm-1 2a1 1 0 102 0 1 1 0 00-2 0z" />
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 text-md font-semibold">Medical Leave</span>
            <span className="text-3xl font-medium">{attendanceStats.medical}</span>
          </div>
        </div>
        
        <div className="flex-shrink-0 bg-white rounded-lg p-6 shadow-sm min-w-64 flex items-start gap-4">
          <div className="rounded-full bg-purple-100 p-3 flex items-center justify-center text-purple-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 text-md font-semibold">Total Records</span>
            <span className="text-3xl font-medium">{attendanceStats.total}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Attendance Doughnut Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Attendance Breakdown</h3>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-64 w-64 mb-4">
              <Doughnut data={prepareDoughnutData()} options={doughnutChartOptions} />
              {noRecords && (
                <div className="text-center mt-4 text-gray-500">
                  <p>No attendance data available</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 w-full">
              {attendanceLegendItems.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex items-center mr-2">
                    <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex items-center ml-auto">
                    <span className="text-gray-700">{item.value} days ({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Total Attendance Records: <span className="font-bold">{attendanceStats.total} days</span>
              </p>
            </div>
          </div>
        </div>

        {/* Recent Attendance Records */}
        <div className="bg-white rounded-lg p-6 shadow-sm flex-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Recent Attendance</h3>
          </div>
          
          {noRecords || filteredAttendanceData.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No attendance records available</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentAttendance.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-3">Attendance Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Present Rate:</span>
                    <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${attendanceStats.presentPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{attendanceStats.presentPercentage}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Absent Rate:</span>
                    <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-red-600 h-2.5 rounded-full" 
                        style={{ width: `${attendanceStats.absentPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{attendanceStats.absentPercentage}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Medical Leave:</span>
                    <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${attendanceStats.medicalPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{attendanceStats.medicalPercentage}%</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Monthly Attendance Bar Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Monthly Attendance</h3>
        </div>
        <div className="h-[400px]">
          {filteredAttendanceData.length > 0 ? (
            <Bar data={prepareMonthlyData().data} options={prepareMonthlyData().options} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                {noRecords 
                  ? "No attendance records available for this team member" 
                  : "No data available for the selected filters"}
              </p>
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

export default AttendanceDetails