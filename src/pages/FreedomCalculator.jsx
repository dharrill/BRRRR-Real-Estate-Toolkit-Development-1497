import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import NavigationButton from '../components/Common/NavigationButton'

const { FiTarget, FiDollarSign, FiHome, FiCalendar, FiTrendingUp, FiCreditCard } = FiIcons

const FreedomCalculator = () => {
  const [formData, setFormData] = useState({
    desiredIncome: '10000',
    avgCashFlow: '500',
    propertiesPerYear: '2',
    currentProperties: '0'
  })

  const [results, setResults] = useState(null)
  const [timelineData, setTimelineData] = useState([])
  const [hasCalculation, setHasCalculation] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    calculateFreedom({ ...formData, [field]: value })
  }

  const calculateFreedom = (data = formData) => {
    const desiredIncome = parseFloat(data.desiredIncome) || 0
    const avgCashFlow = parseFloat(data.avgCashFlow) || 0
    const propertiesPerYear = parseFloat(data.propertiesPerYear) || 0
    const currentProperties = parseFloat(data.currentProperties) || 0

    if (avgCashFlow <= 0) {
      setResults(null)
      setTimelineData([])
      return
    }

    const propertiesNeeded = Math.ceil(desiredIncome / avgCashFlow)
    const additionalProperties = Math.max(0, propertiesNeeded - currentProperties)
    const yearsToFreedom = propertiesPerYear > 0 ? Math.ceil(additionalProperties / propertiesPerYear) : Infinity

    // Current income
    const currentIncome = currentProperties * avgCashFlow

    // Timeline data
    const timeline = []
    let properties = currentProperties
    let year = 0

    while (properties < propertiesNeeded && year <= 20) {
      const income = properties * avgCashFlow
      timeline.push({
        year,
        properties: Math.round(properties),
        monthlyIncome: Math.round(income),
        progress: Math.min((income / desiredIncome) * 100, 100)
      })

      if (year > 0) {
        properties += propertiesPerYear
      }
      year++
    }

    // Add final year
    if (properties >= propertiesNeeded) {
      timeline.push({
        year: timeline.length,
        properties: propertiesNeeded,
        monthlyIncome: desiredIncome,
        progress: 100
      })
    }

    setResults({
      propertiesNeeded,
      additionalProperties,
      yearsToFreedom,
      currentIncome,
      incomeGap: desiredIncome - currentIncome,
      progressPercent: currentIncome > 0 ? (currentIncome / desiredIncome) * 100 : 0
    })

    setTimelineData(timeline)
    setHasCalculation(true)
  }

  React.useEffect(() => {
    calculateFreedom()
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{`Year ${label}`}</p>
          <p className="text-sm text-blue-600">{`Properties: ${data.properties}`}</p>
          <p className="text-sm text-green-600">{`Monthly Income: ${formatCurrency(data.monthlyIncome)}`}</p>
          <p className="text-sm text-purple-600">{`Progress: ${data.progress.toFixed(1)}%`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Freedom Calculator</h1>
        <p className="text-gray-600 mt-1">Calculate how many properties you need for financial freedom</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Freedom Goals</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desired Monthly Passive Income
                </label>
                <div className="relative">
                  <SafeIcon 
                    icon={FiDollarSign} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" 
                  />
                  <input
                    type="number"
                    value={formData.desiredIncome}
                    onChange={(e) => handleInputChange('desiredIncome', e.target.value)}
                    placeholder="10000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Your target monthly passive income</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Cash Flow Per Property
                </label>
                <div className="relative">
                  <SafeIcon 
                    icon={FiDollarSign} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" 
                  />
                  <input
                    type="number"
                    value={formData.avgCashFlow}
                    onChange={(e) => handleInputChange('avgCashFlow', e.target.value)}
                    placeholder="500"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Expected monthly cash flow per property</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Properties Owned
                </label>
                <div className="relative">
                  <SafeIcon 
                    icon={FiHome} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" 
                  />
                  <input
                    type="number"
                    value={formData.currentProperties}
                    onChange={(e) => handleInputChange('currentProperties', e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Properties you currently own</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Properties Acquired Per Year
                </label>
                <div className="relative">
                  <SafeIcon 
                    icon={FiCalendar} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" 
                  />
                  <input
                    type="number"
                    value={formData.propertiesPerYear}
                    onChange={(e) => handleInputChange('propertiesPerYear', e.target.value)}
                    placeholder="2"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">How many properties you plan to buy yearly</p>
              </div>
            </div>
          </div>

          {/* Quick Results */}
          {results && (
            <div className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Freedom Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Properties Needed:</span>
                  <span className="font-bold text-xl">{results.propertiesNeeded}</span>
                </div>
                <div className="flex justify-between">
                  <span>Additional Properties:</span>
                  <span className="font-semibold">{results.additionalProperties}</span>
                </div>
                <div className="flex justify-between">
                  <span>Years to Freedom:</span>
                  <span className="font-semibold">
                    {results.yearsToFreedom === Infinity ? 'N/A' : `${results.yearsToFreedom} years`}
                  </span>
                </div>
                <div className="border-t border-white/20 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span>Current Progress:</span>
                    <span className="font-bold">{results.progressPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts and Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          {results && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Properties Needed</p>
                    <p className="text-3xl font-bold text-blue-600">{results.propertiesNeeded}</p>
                    <p className="text-sm text-gray-500">Total portfolio size</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <SafeIcon icon={FiHome} className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current Income</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(results.currentIncome)}
                    </p>
                    <p className="text-sm text-gray-500">Monthly passive income</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <SafeIcon icon={FiDollarSign} className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Time to Freedom</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {results.yearsToFreedom === Infinity ? '∞' : results.yearsToFreedom}
                    </p>
                    <p className="text-sm text-gray-500">
                      {results.yearsToFreedom === Infinity ? 'Set acquisition rate' : 'Years'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <SafeIcon icon={FiTarget} className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Timeline Chart */}
          {timelineData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Path to Freedom Timeline</h2>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      label={{ value: 'Years', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis 
                      yAxisId="left" 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      domain={[0, 'dataMax']} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      yAxisId="right" 
                      dataKey="properties" 
                      fill="#3B82F6" 
                      opacity={0.3} 
                      name="Properties" 
                    />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="monthlyIncome" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      name="Monthly Income" 
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Progress Breakdown */}
          {results && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Breakdown</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Current Progress</span>
                    <span>{results.progressPercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(results.progressPercent, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Current Status</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Properties Owned:</span>
                        <span className="font-medium">{formData.currentProperties}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Income:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(results.currentIncome)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Freedom Target</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Income:</span>
                        <span className="font-medium">{formatCurrency(formData.desiredIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Income Gap:</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(results.incomeGap)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Strategy Tips */}
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Strategy Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-green-800 mb-2">Accelerate Your Timeline</h4>
                <ul className="text-green-700 space-y-1">
                  <li>• Increase cash flow per property</li>
                  <li>• Acquire more properties per year</li>
                  <li>• Use BRRRR method to recycle capital</li>
                  <li>• Partner with other investors</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-2">Optimize Cash Flow</h4>
                <ul className="text-green-700 space-y-1">
                  <li>• Focus on high-yield markets</li>
                  <li>• Improve property management</li>
                  <li>• Reduce vacancy rates</li>
                  <li>• Regular rent increases</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Button */}
      {hasCalculation && (
        <NavigationButton
          nextStep="loan-comparison"
          nextLabel="Go to Loan Comparison"
          description="Compare different loan options and analyze costs"
          icon={FiCreditCard}
        />
      )}
    </div>
  )
}

export default FreedomCalculator