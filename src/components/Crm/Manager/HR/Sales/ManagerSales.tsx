"use client"

import { useState, useEffect } from "react"
import { ResponsiveContainer, FunnelChart, Funnel, Cell, Tooltip } from "recharts"
import icon from "../../../../Admin/assets/assets/boxicon.png"
import icon2 from "../../../../Admin/assets/assets/2.png"
import icon3 from "../../../../Admin/assets/assets/3.png"
import icon4 from "../../../../Admin/assets/assets/4.png"
import green from "../../AdminClient/greenarrow.png"
import red from "../../AdminClient/red.png"
import arrow from "./../assets/uparrow.png"
import Campaign from "./Campaign"
import SalesPipelineComponent from "./SalesPipeline"
import RevenueOverview from "./RevenueOverview"
import CashFlow from "./Cashflow"

interface SalesCampaign {
  id: string
  campaignName: string
  type: string
  status: string
  impression: string
  ctr: string
  conversion: string
  cpa: string
}

interface SalesPipeline {
  id: string
  dealName: string
  leadName: string
  stage: string
  dealValue: string
  probability: string
  expectedCloseDate: string
  closeWon: string
}

interface SalesRevenue {
  id: string
  source: string
  lead: string
  campaign: string
  deal: string
  totalRevenue: string
  targetRevenue: string
  revenueGap: string
}

interface Cashflow {
  id: string
  salesPerson: string
  revenueTarget: string
  revenueGeneration: string
  month: string
  gap: string
  stage: string
}

const Sales = () => {
  const [activeView, setActiveView] = useState("month")
  const [campaignData, setCampaignData] = useState<SalesCampaign[]>([])
  const [pipelineData, setPipelineData] = useState<SalesPipeline[]>([])
  const [revenueData, setRevenueData] = useState<SalesRevenue[]>([])
  const [cashflowData, setCashflowData] = useState<Cashflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calculate metrics from API data
  const totalLeads = pipelineData.length
  const convertedLeads = pipelineData.filter((item) => item.closeWon === "Yes").length
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

  // Calculate revenue metrics
  const totalRevenue =
    revenueData.length > 0 ? revenueData.reduce((sum, item) => sum + Number.parseInt(item.totalRevenue || "0"), 0) : 0

  const targetRevenue =
    revenueData.length > 0 ? revenueData.reduce((sum, item) => sum + Number.parseInt(item.targetRevenue || "0"), 0) : 0

  const revenueGap = targetRevenue - totalRevenue
  const achievement = targetRevenue > 0 ? Math.round((totalRevenue / targetRevenue) * 100) : 0

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch all data in parallel
        const [campaignRes, pipelineRes, revenueRes, cashflowRes] = await Promise.all([
          fetch("https://totem-consultancy-beta.vercel.app/api/crm/sales-campaign"),
          fetch("https://totem-consultancy-beta.vercel.app/api/crm/sales-pipeline"),
          fetch("https://totem-consultancy-beta.vercel.app/api/crm/sales-revenue"),
          fetch("https://totem-consultancy-beta.vercel.app/api/crm/cashflow"),
        ])

        // Parse all responses
        const campaignData = await campaignRes.json()
        const pipelineData = await pipelineRes.json()
        const revenueData = await revenueRes.json()
        const cashflowData = await cashflowRes.json()

        // Update state with fetched data
        setCampaignData(campaignData)
        setPipelineData(pipelineData)
        setRevenueData(revenueData)
        setCashflowData(cashflowData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Generate sales by rep data from cashflow API
  const salesByRep =
    cashflowData.length > 0
      ? [
          {
            name: "Total",
            value: cashflowData.reduce((sum, item) => sum + Number.parseInt(item.revenueTarget || "0"), 0),
            converted: cashflowData.reduce((sum, item) => sum + Number.parseInt(item.revenueGeneration || "0"), 0),
          },
          ...cashflowData.map((item) => ({
            name: item.salesPerson,
            value: Number.parseInt(item.revenueTarget || "0"),
            converted: Number.parseInt(item.revenueGeneration || "0"),
          })),
        ]
      : [
          { name: "Total", value: 60000, converted: 30000 },
          { name: "Ashok", value: 50000, converted: 85000 },
          { name: "Parveen", value: 60000, converted: 30000 },
          { name: "Manan", value: 55000, converted: 75000 },
          { name: "Priya", value: 65000, converted: 25000 },
          { name: "Chanchal", value: 85000, converted: 35000 },
        ]

  // Generate sales by source data from revenue API
  const salesBySource =
    revenueData.length > 0
      ? [
          {
            name: "Total",
            value: revenueData.reduce((sum, item) => sum + Number.parseInt(item.targetRevenue || "0"), 0),
            converted: revenueData.reduce((sum, item) => sum + Number.parseInt(item.totalRevenue || "0"), 0),
          },
          ...Array.from(new Set(revenueData.map((item) => item.source))).map((source) => {
            const sourceItems = revenueData.filter((item) => item.source === source)
            return {
              name: source,
              value: sourceItems.reduce((sum, item) => sum + Number.parseInt(item.targetRevenue || "0"), 0),
              converted: sourceItems.reduce((sum, item) => sum + Number.parseInt(item.totalRevenue || "0"), 0),
            }
          }),
        ]
      : [
          { name: "Total", value: 30000, converted: 95000 },
          { name: "Offline", value: 50000, converted: 85000 },
          { name: "Events", value: 70000, converted: 40000 },
          { name: "Deals", value: 65000, converted: 80000 },
          { name: "Campaign", value: 75000, converted: 35000 },
          { name: "Lead", value: 95000, converted: 45000 },
        ]

  // Funnel chart data - keeping the original values as requested but updating names to match the sales funnel stages
  const funnelData = [
    {
      name: "Total Impressions",
      value: 100,
      fill: "#E74C3C",
      apiValue: campaignData.length > 0 ? Number.parseInt(campaignData[0].impression) : 0,
    },
    {
      name: "Clicks",
      value: 80,
      fill: "#F39C12",
      apiValue:
        campaignData.length > 0
          ? Math.round(
              (Number.parseFloat(campaignData[0].ctr.replace("%", "")) * Number.parseInt(campaignData[0].impression)) /
                100,
            )
          : 0,
    },
    {
      name: "Leads",
      value: 60,
      fill: "#F1C40F",
      apiValue: totalLeads,
    },
    {
      name: "Opportunities",
      value: 40,
      fill: "#3498DB",
      apiValue: campaignData.length > 0 ? Number.parseInt(campaignData[0].conversion) : 0,
    },
    {
      name: "Conversions",
      value: 20,
      fill: "#1A5276",
      apiValue: convertedLeads,
    },
  ]

  // Custom tooltip for funnel chart - now showing API values
  const FunnelTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow rounded border border-gray-200">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">{`Value: ${payload[0].value}%`}</p>
          <p className="text-sm text-gray-600">{`Actual: ${payload[0].payload.apiValue}`}</p>
        </div>
      )
    }
    return null
  }

  // Function to calculate the width based on data
  const getBarWidth = (value) => {
    const maxValue = 150000 // Maximum value in the chart
    return `${(value / maxValue) * 100}%`
  }

  // X-axis tick values
  const xAxisTicks = [10, 25, 50, 75, 100, 125, 150]

  return (
    <div className="w-full">
      {/* Metrics Cards Section */}
      <div className="flex gap-4 pb-4 overflow-x-auto overflow-y-visible snap-x scrollbar-hide">
        {/* Total Leads Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Leads</p>
              <h2 className="text-4xl font-bold mt-2">{totalLeads}</h2>
              <div className="flex items-center mt-4 text-green-500">
                <img src={green || "/placeholder.svg"} className="mr-2" alt="Up indicator" />
                <span className="text-sm font-medium">8.5% Up from yesterday</span>
              </div>
            </div>
            <img src={icon || "/placeholder.svg"} alt="Leads icon" className="w-11 h-11 object-cover" />
          </div>
        </div>

        {/* Converted Leads Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Converted Leads</p>
              <h2 className="text-4xl font-bold mt-2">{convertedLeads}</h2>
              <div className="flex items-center mt-4 text-green-500">
                <img src={green || "/placeholder.svg"} className="mr-2" alt="Up indicator" />
                <span className="text-sm font-medium">8.5% Up from yesterday</span>
              </div>
            </div>
            <img src={icon2 || "/placeholder.svg"} alt="Converted icon" className="w-11 h-11 object-cover" />
          </div>
        </div>

        {/* Conversion % Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Conversion %</p>
              <h2 className="text-4xl font-bold mt-2">{conversionRate}</h2>
              <div className="flex items-center mt-4 text-green-500">
                <img src={green || "/placeholder.svg"} className="mr-2" alt="Up indicator" />
                <span className="text-sm font-medium">8.5% Up from yesterday</span>
              </div>
            </div>
            <img src={icon3 || "/placeholder.svg"} alt="Conversion icon" className="w-11 h-11 object-cover" />
          </div>
        </div>

        {/* Revenue Target Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Revenue Target</p>
              <h2 className="text-4xl font-bold mt-2">${(targetRevenue / 1000).toFixed(0)}k</h2>
              <div className="flex items-center mt-4">
                <img src={red || "/placeholder.svg"} className="mr-2" alt="Down indicator" />
                <span className="text-sm font-medium">
                  <span className="text-red-500">8.5%</span> Down from yesterday
                </span>
              </div>
            </div>
            <img src={icon4 || "/placeholder.svg"} alt="Revenue icon" className="w-11 h-11 object-cover" />
          </div>
        </div>

        {/* Achievement Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Achievement</p>
              <h2 className="text-4xl font-bold mt-2">{achievement}%</h2>
              <div className="flex items-center mt-4 text-green-500">
                <img src={green || "/placeholder.svg"} className="mr-2" alt="Up indicator" />
                <span className="text-sm font-medium">8.5% Up from yesterday</span>
              </div>
            </div>
            <img src={icon4 || "/placeholder.svg"} alt="Achievement icon" className="w-11 h-11 object-cover" />
          </div>
        </div>

        {/* Gap Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Gap</p>
              <h2 className="text-4xl font-bold mt-2">${(revenueGap / 1000).toFixed(0)}k</h2>
              <div className="flex items-center mt-4 text-green-500">
                <img src={green || "/placeholder.svg"} className="mr-2" alt="Up indicator" />
                <span className="text-sm font-medium">8.5% Up from yesterday</span>
              </div>
            </div>
            <img src={icon4 || "/placeholder.svg"} alt="Gap icon" className="w-11 h-11 object-cover" />
          </div>
        </div>
      </div>

      {/* Lead Conversion Funnel */}
      <div className="bg-white rounded-2xl shadow p-6 mt-6 mb-6">
        <div className="flex flex-col items-center">
          {/* Labels positioned on opposite sides */}
          <div className="w-full max-w-3xl flex justify-between mb-2">
            <div className="text-gray-700 font-medium">Total Number</div>
            <div className="text-gray-700 font-medium">% Conversion</div>
          </div>

          {/* Funnel Chart Container */}
          <div className="w-full max-w-3xl relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip content={<FunnelTooltip active={undefined} payload={undefined} />} />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive={true}
                  trapezoidHeight={30}
                  paddingAngle={0}
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          <h3 className="text-xl font-bold mt-4">Lead Conversion Funnel</h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Representative */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-800 font-medium flex items-center">
              Sales by Representative
              <img src={arrow || "/placeholder.svg"} className="ml-1" alt="Arrow" />
            </h3>
            <div className="flex gap-2">
              <div className="relative">
                <select className="p-2 border rounded appearance-none pr-8">
                  <option>Month</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <select className="p-2 border rounded appearance-none pr-8">
                  <option>Year</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <select className="p-2 border rounded appearance-none pr-8">
                  <option>Source</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart - Updated to match the design image */}
          <div className="space-y-4 mb-6 pr-16">
            {salesByRep.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center">
                <div className="w-24 text-sm font-medium text-right pr-4">{item.name}</div>
                <div className="flex-grow relative h-6">
                  <div className="absolute h-6 bg-blue-900 rounded-sm" style={{ width: getBarWidth(item.value) }}></div>
                  <div
                    className="absolute h-6 bg-red-500 rounded-sm"
                    style={{
                      width: getBarWidth(item.converted),
                      left: getBarWidth(item.value),
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* X-axis with tick marks */}
          <div className="relative h-6 ml-24 border-t border-gray-200">
            {xAxisTicks.map((tick) => (
              <div
                key={tick}
                className="absolute text-xs text-gray-500"
                style={{
                  left: `${(tick / 150) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="h-2 border-l border-gray-300 mx-auto"></div>
                <div className="mt-1">{tick}k</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Source */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-800 font-medium flex items-center">
              Sales by Source
              <img src={arrow || "/placeholder.svg"} className="ml-1" alt="Arrow" />
            </h3>
            <div className="flex gap-2">
              <div className="relative">
                <select className="p-2 border rounded appearance-none pr-8">
                  <option>Month</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <select className="p-2 border rounded appearance-none pr-8">
                  <option>Year</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <select className="p-2 border rounded appearance-none pr-8">
                  <option>Source</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart - Updated to match the design image */}
          <div className="space-y-4 mb-6 pr-18 max-w-[480px]">
            {salesBySource.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center">
                <div className="w-24 text-sm font-medium text-right pr-4">{item.name}</div>
                <div className="flex-grow relative h-6">
                  <div className="absolute h-6 bg-blue-900 rounded-sm" style={{ width: getBarWidth(item.value) }}></div>
                  <div
                    className="absolute h-6 bg-red-500 rounded-sm"
                    style={{
                      width: getBarWidth(item.converted),
                      left: getBarWidth(item.value),
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* X-axis with tick marks */}
          <div className="relative h-6 ml-24 border-t border-gray-200">
            {xAxisTicks.map((tick) => (
              <div
                key={tick}
                className="absolute text-xs text-gray-500"
                style={{
                  left: `${(tick / 150) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="h-2 border-l border-gray-300 mx-auto"></div>
                <div className="mt-1">{tick}k</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Table */}
      <div className="mt-8">
        <Campaign campaignData={campaignData} />
      </div>

      {/* Sales Pipeline Table */}
      <div className="mt-8">
        <SalesPipelineComponent pipelineData={pipelineData} />
      </div>

      {/* Revenue Overview Table */}
      <div className="mt-8">
        <RevenueOverview revenueData={revenueData} />
      </div>

      {/* CashFlow Table */}
      <div className="mt-8">
        <CashFlow cashflowData={cashflowData} />
      </div>

      {/* Add this style block to your component or in a global CSS file */}
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

export default Sales
