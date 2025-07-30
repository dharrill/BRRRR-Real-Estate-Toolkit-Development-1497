import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiTool, FiDollarSign, FiSave, FiPlus, FiMinus, FiCopy } = FiIcons

const RehabEstimator = () => {
  const [inputMode, setInputMode] = useState('line-item') // 'total' or 'line-item'
  const [totalAmount, setTotalAmount] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [customCity, setCustomCity] = useState('')
  
  const defaultLineItems = [
    { category: 'Kitchen', defaultCost: 15000, actualCost: '', description: 'Cabinets, countertops, appliances' },
    { category: 'Bathrooms', defaultCost: 8000, actualCost: '', description: 'Per bathroom renovation' },
    { category: 'Flooring', defaultCost: 5000, actualCost: '', description: 'Hardwood, tile, carpet' },
    { category: 'Paint (Interior)', defaultCost: 3000, actualCost: '', description: 'All interior walls and trim' },
    { category: 'Paint (Exterior)', defaultCost: 4000, actualCost: '', description: 'Siding, trim, doors' },
    { category: 'Roof', defaultCost: 12000, actualCost: '', description: 'Full roof replacement' },
    { category: 'HVAC', defaultCost: 6000, actualCost: '', description: 'Heating and cooling system' },
    { category: 'Electrical', defaultCost: 4000, actualCost: '', description: 'Wiring, outlets, fixtures' },
    { category: 'Plumbing', defaultCost: 3500, actualCost: '', description: 'Pipes, fixtures, water heater' },
    { category: 'Windows', defaultCost: 8000, actualCost: '', description: 'Window replacement' },
    { category: 'Landscaping', defaultCost: 2500, actualCost: '', description: 'Yard cleanup and basic landscaping' },
    { category: 'Permits', defaultCost: 1500, actualCost: '', description: 'Building permits and inspections' },
  ]

  const [lineItems, setLineItems] = useState(defaultLineItems)
  const [customLineItems, setCustomLineItems] = useState([])

  const cities = [
    'Atlanta, GA',
    'Austin, TX',
    'Charlotte, NC',
    'Denver, CO',
    'Indianapolis, IN',
    'Memphis, TN',
    'Phoenix, AZ',
    'Tampa, FL',
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const updateLineItem = (index, field, value) => {
    const updatedItems = [...lineItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setLineItems(updatedItems)
  }

  const addCustomLineItem = () => {
    const newItem = {
      category: '',
      defaultCost: 0,
      actualCost: '',
      description: '',
      isCustom: true
    }
    setCustomLineItems([...customLineItems, newItem])
  }

  const updateCustomLineItem = (index, field, value) => {
    const updatedItems = [...customLineItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setCustomLineItems(updatedItems)
  }

  const removeCustomLineItem = (index) => {
    setCustomLineItems(customLineItems.filter((_, i) => i !== index))
  }

  const getTotalEstimate = () => {
    if (inputMode === 'total') {
      return parseFloat(totalAmount) || 0
    }
    
    const lineItemTotal = lineItems.reduce((sum, item) => {
      const cost = parseFloat(item.actualCost) || item.defaultCost
      return sum + cost
    }, 0)
    
    const customTotal = customLineItems.reduce((sum, item) => {
      const cost = parseFloat(item.actualCost) || parseFloat(item.defaultCost) || 0
      return sum + cost
    }, 0)
    
    return lineItemTotal + customTotal
  }

  const saveTemplate = () => {
    const cityName = selectedCity || customCity
    if (!cityName) {
      alert('Please select or enter a city name to save template')
      return
    }
    
    const template = {
      city: cityName,
      lineItems: lineItems,
      customLineItems: customLineItems,
      savedAt: new Date().toISOString()
    }
    
    // Save to localStorage for demo purposes
    const savedTemplates = JSON.parse(localStorage.getItem('rehabTemplates') || '[]')
    savedTemplates.push(template)
    localStorage.setItem('rehabTemplates', JSON.stringify(savedTemplates))
    
    alert(`Template saved for ${cityName}!`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rehab Estimator</h1>
          <p className="text-gray-600 mt-1">Estimate renovation costs for your investment property</p>
        </div>
        
        <button
          onClick={saveTemplate}
          className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiSave} className="w-4 h-4" />
          <span>Save Template</span>
        </button>
      </div>

      {/* Input Mode Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Input Method</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            onClick={() => setInputMode('total')}
            className={`p-4 rounded-lg border-2 transition-all ${
              inputMode === 'total'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiDollarSign} className="w-6 h-6" />
              <div className="text-left">
                <h3 className="font-medium">Total Amount</h3>
                <p className="text-sm text-gray-600">Enter a single total rehab cost</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => setInputMode('line-item')}
            className={`p-4 rounded-lg border-2 transition-all ${
              inputMode === 'line-item'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiTool} className="w-6 h-6" />
              <div className="text-left">
                <h3 className="font-medium">Line Item Breakdown</h3>
                <p className="text-sm text-gray-600">Detailed category-by-category costs</p>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* City Selection for Templates */}
      {inputMode === 'line-item' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">City Template</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a city...</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Enter Custom City
              </label>
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="Enter city name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Total Amount Input */}
      {inputMode === 'total' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Total Rehab Cost</h2>
          
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter total rehab amount
            </label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="50000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>
      )}

      {/* Line Item Breakdown */}
      {inputMode === 'line-item' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Line Item Breakdown</h2>
            <button
              onClick={addCustomLineItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              <span>Add Custom Item</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Default Line Items */}
            {lineItems.map((item, index) => (
              <motion.div
                key={item.category}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div>
                  <h3 className="font-medium text-gray-900">{item.category}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Default Cost</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(item.defaultCost)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Actual Cost</label>
                  <input
                    type="number"
                    value={item.actualCost}
                    onChange={(e) => updateLineItem(index, 'actualCost', e.target.value)}
                    placeholder={item.defaultCost.toString()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => updateLineItem(index, 'actualCost', item.defaultCost.toString())}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                  >
                    <SafeIcon icon={FiCopy} className="w-4 h-4" />
                    <span>Use Default</span>
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Custom Line Items */}
            {customLineItems.map((item, index) => (
              <motion.div
                key={`custom-${index}`}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Category</label>
                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) => updateCustomLineItem(index, 'category', e.target.value)}
                    placeholder="Custom category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateCustomLineItem(index, 'description', e.target.value)}
                    placeholder="Description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Default Cost</label>
                  <input
                    type="number"
                    value={item.defaultCost}
                    onChange={(e) => updateCustomLineItem(index, 'defaultCost', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Actual Cost</label>
                  <input
                    type="number"
                    value={item.actualCost}
                    onChange={(e) => updateCustomLineItem(index, 'actualCost', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => removeCustomLineItem(index)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <SafeIcon icon={FiMinus} className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Total Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm p-6 text-white">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">Total Rehab Estimate</h2>
          <p className="text-4xl font-bold">{formatCurrency(getTotalEstimate())}</p>
          {inputMode === 'line-item' && (
            <p className="text-blue-100 mt-2">
              Based on {lineItems.length + customLineItems.length} line items
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default RehabEstimator