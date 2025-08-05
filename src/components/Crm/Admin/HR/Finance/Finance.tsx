import { useState, useEffect } from 'react';
import green from '../../AdminClient/greenarrow.png';
import icon from '../../../../Admin/assets/assets/boxicon.png';
import icon2 from '../../../../Admin/assets/assets/2.png';
import icon3 from '../../../../Admin/assets/assets/3.png';
import icon4 from '../../../../Admin/assets/assets/4.png';
import finance from '../assets/finance.png';

// Import the separate components
import RevenueGenerationSheet from './RevenueGenerationSheet';
import ExpenseSheet from './ExpenseSheet';
import ProfitLossSheet from './ProfitLoss';
import CashFlow from './CashFlow';

function Finance() {
  const [financialData, setFinancialData] = useState({
    totalRevenue: '0',
    totalExpense: '0',
    netProfit: '0',
    profitMargin: '0',
    overduePayments: '0',
    overdueExpenses: '0',
    revenueData: [],
    expenseData: [],
    profitLossData: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format number to currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(amount));
  };

  // Get today's date
  const today = new Date();

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        
        // Fetch profit-loss data
        const profitLossResponse = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/profit-loss');
        const profitLossData = await profitLossResponse.json();
        
        // Fetch revenue data
        const revenueResponse = await fetch('https://totem-consultancy-beta.vercel.app/api/crm/revenues');
        const revenueData = await revenueResponse.json();
        
        // Calculate overdue payments from revenue data
        const overduePayments = revenueData.invoices
          .filter(invoice => 
            invoice.paymentStatus !== 'Paid' && 
            new Date(invoice.dueDate) < today
          )
          .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
        
        // Since we don't have an expenses API, we'll set a placeholder for overdue expenses
        // In a real implementation, this would need to be updated when the API is available
        const overdueExpenses = 0;
        
        // Get the latest profit-loss entry
        const latestProfitLoss = profitLossData.entries.length > 0 ? 
          profitLossData.entries[0] : 
          { totalRevenue: '0', totalExpense: '0', netProfit: '0', profitMargin: '0' };
        
        // Generate sample data for charts based on the actual values we have
        // For a real implementation, this would need historical data points
        const generateSampleData = (baseValue) => {
          const value = Number(baseValue);
          const variance = value * 0.1; // 10% variance for sample data
          
          return [
            value * 0.85,
            value * 0.9,
            value * 0.95,
            value,
            value * 1.05,
            value * 1.1
          ];
        };

        setFinancialData({
          totalRevenue: latestProfitLoss.totalRevenue,
          totalExpense: latestProfitLoss.totalExpense,
          netProfit: latestProfitLoss.netProfit,
          profitMargin: latestProfitLoss.profitMargin,
          overduePayments: overduePayments.toString(),
          overdueExpenses: overdueExpenses.toString(),
          // Generate sample chart data based on actual values
          revenueData: generateSampleData(latestProfitLoss.totalRevenue),
          expenseData: generateSampleData(latestProfitLoss.totalExpense),
          profitLossData: generateSampleData(latestProfitLoss.netProfit)
        });
      } catch (err) {
        console.error('Error fetching financial data:', err);
        setError('Failed to load financial data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  // Calculate percentage change (placeholder - would need actual historical data)
  const calculateChange = () => {
    return '8.5';
  };

  // Chart SVG path generator
  const generateChartPath = (data) => {
    if (!data || data.length === 0) return '';
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    // Normalize data points to fit in the 0-100 vertical range
    const normalizedData = data.map(value => 100 - ((value - min) / range * 80));
    
    // Define SVG width segments
    const segmentWidth = 400 / (normalizedData.length - 1);
    
    // Generate path
    let path = `M0,${normalizedData[0]}`;
    
    for (let i = 1; i < normalizedData.length; i++) {
      const x = i * segmentWidth;
      const y = normalizedData[i];
      path += ` C${x - segmentWidth / 2},${normalizedData[i-1]} ${x - segmentWidth / 2},${y} ${x},${y}`;
    }
    
    return path;
  };

  // Area chart SVG path generator (adds closing line to bottom)
  const generateAreaPath = (data) => {
    const linePath = generateChartPath(data);
    if (!linePath) return '';
    
    const width = 400;
    const height = 150;
    return `${linePath} L${width},${height} L0,${height} Z`;
  };

  if (loading) {
    return (
      <div className="bg-pink-50 min-h-screen p-6 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Loading financial data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-pink-50 min-h-screen p-6 flex items-center justify-center">
        <div className="text-xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-pink-50 min-h-screen p-6">
      {/* Header Section */}
      <div className="flex items-center mb-12">
        <div className="bg-gray-800 w-[75px] h-[70px] rounded-lg flex items-center justify-center mr-4">
          <img src={finance} className='h-12' alt="Finance icon" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Finance Management</h1>
          <p className="text-gray-600 font-semibold mt-1">Manage Finance sheet</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="flex gap-4 pb-4 overflow-x-auto overflow-y-visible snap-x scrollbar-hide">
        {/* Total Revenue Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <h2 className="text-4xl font-bold mt-2">{formatCurrency(financialData.totalRevenue)}</h2>
              <div className="flex items-center mt-4">
                <img src={green} className='mr-2' alt="Up indicator" />
                <span className="text-sm font-medium">
                  <span className='text-green-500'>{calculateChange()}%</span> Up from yesterday
                </span>
              </div>
            </div>
            <img src={icon} alt="Revenue icon" className="w-11 h-11 object-cover" />
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Expense</p>
              <h2 className="text-4xl font-bold mt-2">{formatCurrency(financialData.totalExpense)}</h2>
              <div className="flex items-center mt-4">
                <img src={green} className='mr-2' alt="Up indicator" />
                <span className="text-sm font-medium">
                  <span className='text-green-500'>{calculateChange()}%</span> Up from yesterday
                </span>
              </div>
            </div>
            <img src={icon2} alt="Expense icon" className="w-11 h-11 object-cover" />
          </div>
        </div>

        {/* Profit/Loss Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Profit/Loss</p>
              <h2 className="text-4xl font-bold mt-2">{formatCurrency(financialData.netProfit)}</h2>
              <div className="flex items-center mt-4">
                <img src={green} className='mr-2' alt="Up indicator" />
                <span className="text-sm font-medium">
                  <span className='text-green-500'>{calculateChange()}%</span> Up from yesterday
                </span>
              </div>
            </div>
            <img src={icon3} alt="Profit/Loss icon" className="w-11 h-11 object-cover" />
          </div>
        </div>

        {/* Overdue Payment Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Overdue Payment</p>
              <h2 className="text-4xl font-bold mt-2">{formatCurrency(financialData.overduePayments)}</h2>
              <div className="flex items-center mt-4">
                <img src={green} className='mr-2' alt="Up indicator" />
                <span className="text-sm font-medium">
                  <span className='text-green-500'>{calculateChange()}%</span> Up from yesterday
                </span>
              </div>
            </div>
            <img src={icon4} alt="Overdue Payment icon" className="w-11 h-11 object-cover" />
          </div>
        </div>

        {/* Overdue Expense Card */}
        <div className="bg-white rounded-2xl shadow p-6 min-w-80 flex-shrink-0 snap-start">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Overdue Expense</p>
              <h2 className="text-4xl font-bold mt-2">{formatCurrency(financialData.overdueExpenses)}</h2>
              <div className="flex items-center mt-4">
                <img src={green} className='mr-2' alt="Up indicator" />
                <span className="text-sm font-medium">
                  <span className='text-green-500'>{calculateChange()}%</span> Up from yesterday
                </span>
                <div className="text-xs text-gray-500 absolute bottom-1 right-2">
                  (API not available)
                </div>
              </div>
            </div>
            <img src={icon4} alt="Overdue Expense icon" className="w-11 h-11 object-cover" />
          </div>
        </div>
      </div>
      
      {/* Graph Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Revenue Graph Card */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Revenue</h3>
            <button className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
          <h2 className="text-3xl font-bold mb-1">{formatCurrency(financialData.totalRevenue)}</h2>
          <p className="text-gray-500 text-sm mb-6">Total Revenue</p>
          
          {/* Revenue Graph */}
          <div className="w-full h-40 bg-purple-50 rounded-lg overflow-hidden">
            <svg viewBox="0 0 400 150" preserveAspectRatio="none" className="w-full h-full">
              <path 
                d={generateAreaPath(financialData.revenueData)} 
                fill="rgba(147, 112, 219, 0.2)" 
              />
              <path 
                d={generateChartPath(financialData.revenueData)} 
                fill="none" 
                stroke="#9370DB" 
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
        
        {/* Expense Graph Card */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Expense</h3>
            <button className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
          <h2 className="text-3xl font-bold mb-1">{formatCurrency(financialData.totalExpense)}</h2>
          <p className="text-gray-500 text-sm mb-6">Total Expense</p>
          
          {/* Expense Graph */}
          <div className="w-full h-40 bg-purple-50 rounded-lg overflow-hidden">
            <svg viewBox="0 0 400 150" preserveAspectRatio="none" className="w-full h-full">
              <path 
                d={generateAreaPath(financialData.expenseData)} 
                fill="rgba(147, 112, 219, 0.2)" 
              />
              <path 
                d={generateChartPath(financialData.expenseData)} 
                fill="none" 
                stroke="#9370DB" 
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
        
        {/* Profit/Loss Graph Card */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Profit/Loss</h3>
            <button className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
          <h2 className="text-3xl font-bold mb-1">{formatCurrency(financialData.netProfit)}</h2>
          <p className="text-gray-500 text-sm mb-6">Total Profit/Loss</p>
          
          {/* Profit/Loss Graph */}
          <div className="w-full h-40 bg-purple-50 rounded-lg overflow-hidden">
            <svg viewBox="0 0 400 150" preserveAspectRatio="none" className="w-full h-full">
              <path 
                d={generateAreaPath(financialData.profitLossData)} 
                fill="rgba(147, 112, 219, 0.2)" 
              />
              <path 
                d={generateChartPath(financialData.profitLossData)} 
                fill="none" 
                stroke="#9370DB" 
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Include the separate component sheets */}
      <RevenueGenerationSheet />
      <ExpenseSheet />
      <ProfitLossSheet />
      <CashFlow />
    </div>
  );
}

export default Finance;