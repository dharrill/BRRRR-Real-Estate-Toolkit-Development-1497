import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import NavigationButton from '../components/Common/NavigationButton'

const { FiTrendingUp, FiDollarSign, FiCalendar, FiTarget } = FiIcons

const PowerOfCompounding = () => {
  const [formData, setFormData] = useState({
    initialValue: '200000',
    monthlyRent: '2000',
    appreciationRate: '3',
    rentIncreaseRate: '2',
    term: '30'
  })

  const [chartData, setChartData] = useState([])
  const [summary, setSummary] = useState(null)
  const [hasCalculation, setHasCalculation] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateCompounding = () => {
    const initialValue = parseFloat(formData.initialValue) || 0
    const monthlyRent = parseFloat(formData.monthlyRent) || 0
    const appreciationRate = parseFloat(formData.appreciationRate) || 0
    const rentIncreaseRate = parseFloat(formData.rentIncreaseRate) || 0
    const term = parseInt(formData.term) || 30

    const data = []
    let currentValue = initialValue
    let currentRent = monthlyRent
    let totalRentCollected = 0

    for (let year = 0; year <= term; year++) {
      if (year > 0) {
        currentValue = currentValue * (1 + appreciationRate / 100)
        currentRent = currentRent * (1 + rentIncreaseRate / 100)
        totalRentCollected += currentRent * 12
      }

      data.push({
        year,
        propertyValue: Math.round(currentValue),
        monthlyRent: Math.round(currentRent),
        annualRent: Math.round(currentRent * 12),
        totalRentCollected: Math.round(totalRentCollected),
        totalReturn: Math.round(currentValue + totalRentCollected)
      })
    }

    setChartData(data)

    const finalData = data[data.length - 1]
    setSummary({
      initialValue,
      finalValue: finalData.propertyValue,
      totalAppreciation: finalData.propertyValue - initialValue,
      appreciationPercent: ((finalData.propertyValue - initialValue) / initialValue) * 100,
      totalRentCollected: finalData.totalRentCollected,
      finalMonthlyRent: finalData.monthlyRent,
      rentIncrease: ((finalData.monthlyRent - monthlyRent) / monthlyRent) * 100,
      totalReturn: finalData.totalReturn,
      totalReturnPercent: ((finalData.totalReturn - initialValue) / initialValue) * 100
    })

    setHasCalculation(true)
  }

  useEffect(() => {
    calculateCompounding()
  }, [formData])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatPercent = (percent) => {
    return `${(percent || 0).toFixed(1)}%`
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{`Year ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Power of Compounding</h1>
        <p className="text-gray-600 mt-1">Visualize long-term wealth building through appreciation and rent growth</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Property Value
                </label>
                <input
                  type="number"
                  value={formData.initialValue}
                  onChange={(e) => handleInputChange('initialValue', e.target.value)}
                  placeholder="200000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Monthly Rent
                </label>
                <input
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                  placeholder="2000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Appreciation Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.appreciationRate}
                  onChange={(e) => handleInputChange('appreciationRate', e.target.value)}
                  placeholder="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Rent Increase (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.rentIncreaseRate}
                  onChange={(e) => handleInputChange('rentIncreaseRate', e.target.value)}
                  placeholder="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Term (Years)
                </label>
                <select
                  value={formData.term}
                  onChange={(e) => handleInputChange('term', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="10">10 Years</option>
                  <option value="15">15 Years</option>
                  <option value="20">20 Years</option>
                  <option value="25">25 Years</option>
                  <option value="30">30 Years</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="mt-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">
                {formData.term}-Year Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Initial Investment:</span>
                  <span className="font-semibold">{formatCurrency(summary.initialValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Final Property Value:</span>
                  <span className="font-semibold">{formatCurrency(summary.finalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Rent Collected:</span>
                  <span className="font-semibold">{formatCurrency(summary.totalRentCollected)}</span>
                </div>
                <div className="border-t border-white/20 pt-3 mt-3">
                  <div className="flex justify-between text-lg">
                    <span>Total Return:</span>
                    <span className="font-bold">{formatCurrency(summary.totalReturn)}</span>
                  </div>
                  <div className="flex justify-between text-sm opacity-90">
                    <span>ROI:</span>
                    <span>{formatPercent(summary.totalReturnPercent)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Growth Projection</h2>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="year" 
                    label={{ value: 'Years', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="propertyValue"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Property Value"
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalRentCollected"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="Total Rent Collected"
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalReturn"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    name="Total Return"
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Metrics */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Property Appreciation</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPercent(summary.appreciationPercent)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(summary.totalAppreciation)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-blue-600" />
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
                    <p className="text-sm text-gray-600">Rent Growth</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercent(summary.rentIncrease)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(summary.finalMonthlyRent)}/month
                    </p>
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
                    <p className="text-sm text-gray-600">Investment Period</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formData.term} Years
                    </p>
                    <p className="text-sm text-gray-500">
                      Long-term wealth building
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <SafeIcon icon={FiCalendar} className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Insights */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Appreciation Power</h4>
                <p className="text-blue-700">
                  Even modest appreciation rates compound significantly over time. A 3% annual rate can more than double your property value in 30 years.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Rent Growth Impact</h4>
                <p className="text-blue-700">
                  Regular rent increases protect against inflation and significantly boost total returns over the investment period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Button */}
      {hasCalculation && (
        <NavigationButton
          nextStep="freedom-calculator"
          nextLabel="Go to Freedom Calculator"
          description="Calculate how many properties you need for financial freedom"
          icon={FiTarget}
        />
      )}
    </div>
  )
}

export default PowerOfCompounding