import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiDollarSign, FiTarget, FiTrendingUp } = FiIcons

const MAOCalculator = () => {
  const [arv, setArv] = useState('')
  const [rehabCost, setRehabCost] = useState('')
  const [customPercentage, setCustomPercentage] = useState(70)
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const calculateMAO = (percentage) => {
    const arvValue = parseFloat(arv) || 0
    const rehabValue = parseFloat(rehabCost) || 0
    return (arvValue * (percentage / 100)) - rehabValue
  }

  const maoResults = [
    { percentage: 70, label: '70% Rule', description: 'Conservative approach' },
    { percentage: 75, label: '75% Rule', description: 'Moderate approach' },
    { percentage: 80, label: '80% Rule', description: 'Aggressive approach' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">MAO Calculator</h1>
        <p className="text-gray-600 mt-1">Calculate Maximum Allowable Offer using the BRRRR method</p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              After Repair Value (ARV)
            </label>
            <div className="relative">
              <SafeIcon icon={FiDollarSign} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={arv}
                onChange={(e) => setArv(e.target.value)}
                placeholder="250000"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">The estimated value after renovations</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rehab Cost Estimate
            </label>
            <div className="relative">
              <SafeIcon icon={FiDollarSign} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={rehabCost}
                onChange={(e) => setRehabCost(e.target.value)}
                placeholder="30000"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Total renovation costs from Rehab Estimator</p>
          </div>
        </div>
      </div>

      {/* Standard MAO Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {maoResults.map((result, index) => (
          <motion.div
            key={result.percentage}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiTarget} className="w-6 h-6 text-blue-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{result.label}</h3>
              <p className="text-sm text-gray-600 mb-4">{result.description}</p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Maximum Allowable Offer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(calculateMAO(result.percentage))}
                </p>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>{result.percentage}% × {formatCurrency(arv)} - {formatCurrency(rehabCost)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custom Percentage Calculator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Percentage Calculator</h2>
        
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom ARV Percentage: {customPercentage}%
            </label>
            <input
              type="range"
              min="50"
              max="90"
              value={customPercentage}
              onChange={(e) => setCustomPercentage(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>50%</span>
              <span>90%</span>
            </div>
          </div>

          <motion.div
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white text-center"
            key={customPercentage}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center mb-2">
              <SafeIcon icon={FiTrendingUp} className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-medium">Custom MAO</h3>
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(calculateMAO(customPercentage))}
            </p>
            <p className="text-purple-100 mt-2">
              {customPercentage}% × {formatCurrency(arv)} - {formatCurrency(rehabCost)}
            </p>
          </motion.div>
        </div>
      </div>

      {/* MAO Explanation */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Understanding MAO</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">70% Rule</h4>
            <p className="text-blue-700">
              Conservative approach that accounts for holding costs, closing costs, and provides a safety margin.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">75% Rule</h4>
            <p className="text-blue-700">
              Moderate approach for experienced investors in competitive markets with accurate ARV estimates.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">80% Rule</h4>
            <p className="text-blue-700">
              Aggressive approach for hot markets or when you have very accurate rehab and ARV estimates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MAOCalculator