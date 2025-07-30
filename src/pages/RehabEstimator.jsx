import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useProperty } from '../contexts/PropertyContext'

const { FiTool, FiDollarSign, FiSave, FiPlus, FiMinus, FiCopy, FiPercent } = FiIcons

const RehabEstimator = () => {
  const { currentProperty } = useProperty()
  const [inputMode, setInputMode] = useState('line-item') // 'total' or 'line-item'
  const [totalAmount, setTotalAmount] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [customCity, setCustomCity] = useState('')
  const [contingencyPercentage, setContingencyPercentage] = useState(10)

  // City-specific cost templates
  const cityTemplates = {
    'Atlanta, GA': {
      'Kitchen': 14000,
      'Bathrooms': 7500,
      'Flooring': 5500,
      'Interior Paint': 3200,
      'Exterior Paint': 4500,
      'Roof': 11000,
      'HVAC': 6500,
      'Electrical': 4200,
      'Plumbing': 3800,
      'Windows': 450, // per window
      'Doors': 280, // per door
      'Landscaping': 3000,
      'Garage': 2500,
      'Driveway': 4000,
      'Foundation': 8000,
      'Permits': 1800,
    },
    'Austin, TX': {
      'Kitchen': 16000,
      'Bathrooms': 8500,
      'Flooring': 6000,
      'Interior Paint': 3500,
      'Exterior Paint': 4800,
      'Roof': 13000,
      'HVAC': 7000,
      'Electrical': 4500,
      'Plumbing': 4000,
      'Windows': 500, // per window
      'Doors': 320, // per door
      'Landscaping': 3500,
      'Garage': 3000,
      'Driveway': 4500,
      'Foundation': 9000,
      'Permits': 2200,
    },
    'Charlotte, NC': {
      'Kitchen': 13500,
      'Bathrooms': 7000,
      'Flooring': 5200,
      'Interior Paint': 3000,
      'Exterior Paint': 4200,
      'Roof': 10500,
      'HVAC': 6000,
      'Electrical': 4000,
      'Plumbing': 3600,
      'Windows': 425, // per window
      'Doors': 260, // per door
      'Landscaping': 2800,
      'Garage': 2300,
      'Driveway': 3800,
      'Foundation': 7500,
      'Permits': 1600,
    },
    'Denver, CO': {
      'Kitchen': 15500,
      'Bathrooms': 8000,
      'Flooring': 5800,
      'Interior Paint': 3300,
      'Exterior Paint': 4600,
      'Roof': 12500,
      'HVAC': 6800,
      'Electrical': 4300,
      'Plumbing': 3900,
      'Windows': 475, // per window
      'Doors': 300, // per door
      'Landscaping': 3200,
      'Garage': 2800,
      'Driveway': 4200,
      'Foundation': 8500,
      'Permits': 2000,
    },
    'Indianapolis, IN': {
      'Kitchen': 12500,
      'Bathrooms': 6500,
      'Flooring': 4800,
      'Interior Paint': 2800,
      'Exterior Paint': 4000,
      'Roof': 9500,
      'HVAC': 5500,
      'Electrical': 3800,
      'Plumbing': 3400,
      'Windows': 400, // per window
      'Doors': 250, // per door
      'Landscaping': 2500,
      'Garage': 2000,
      'Driveway': 3500,
      'Foundation': 7000,
      'Permits': 1400,
    },
    'Memphis, TN': {
      'Kitchen': 12000,
      'Bathrooms': 6000,
      'Flooring': 4500,
      'Interior Paint': 2600,
      'Exterior Paint': 3800,
      'Roof': 9000,
      'HVAC': 5200,
      'Electrical': 3600,
      'Plumbing': 3200,
      'Windows': 380, // per window
      'Doors': 240, // per door
      'Landscaping': 2300,
      'Garage': 1800,
      'Driveway': 3300,
      'Foundation': 6500,
      'Permits': 1200,
    },
    'Phoenix, AZ': {
      'Kitchen': 14500,
      'Bathrooms': 7800,
      'Flooring': 5600,
      'Interior Paint': 3100,
      'Exterior Paint': 4300,
      'Roof': 11500,
      'HVAC': 6300,
      'Electrical': 4100,
      'Plumbing': 3700,
      'Windows': 460, // per window
      'Doors': 290, // per door
      'Landscaping': 3500, // desert landscaping
      'Garage': 2600,
      'Driveway': 4100,
      'Foundation': 8200,
      'Permits': 1900,
    },
    'Tampa, FL': {
      'Kitchen': 13800,
      'Bathrooms': 7300,
      'Flooring': 5400,
      'Interior Paint': 3000,
      'Exterior Paint': 4100,
      'Roof': 12000, // hurricane resistant
      'HVAC': 6200,
      'Electrical': 4000,
      'Plumbing': 3600,
      'Windows': 520, // impact windows
      'Doors': 310, // impact doors
      'Landscaping': 3100,
      'Garage': 2400,
      'Driveway': 3900,
      'Foundation': 7800,
      'Permits': 1700,
    }
  }

  const defaultCategories = [
    { category: 'Kitchen', description: 'Cabinets, countertops, appliances', quantity: 1, unit: 'each' },
    { category: 'Bathrooms', description: 'Per bathroom renovation', quantity: 1, unit: 'each' },
    { category: 'Flooring', description: 'Hardwood, tile, carpet', quantity: 1, unit: 'sq ft' },
    { category: 'Interior Paint', description: 'All interior walls and trim', quantity: 1, unit: 'sq ft' },
    { category: 'Exterior Paint', description: 'Siding, trim, doors', quantity: 1, unit: 'sq ft' },
    { category: 'Roof', description: 'Full roof replacement', quantity: 1, unit: 'sq ft' },
    { category: 'HVAC', description: 'Heating and cooling system', quantity: 1, unit: 'each' },
    { category: 'Electrical', description: 'Wiring, outlets, fixtures', quantity: 1, unit: 'each' },
    { category: 'Plumbing', description: 'Pipes, fixtures, water heater', quantity: 1, unit: 'each' },
    { category: 'Windows', description: 'Window replacement', quantity: 1, unit: 'each' },
    { category: 'Doors', description: 'Interior & exterior doors', quantity: 1, unit: 'each' },
    { category: 'Landscaping', description: 'Yard cleanup and basic landscaping', quantity: 1, unit: 'sq ft' },
    { category: 'Garage', description: 'Garage repairs or renovation', quantity: 1, unit: 'each' },
    { category: 'Driveway', description: 'Driveway repair or replacement', quantity: 1, unit: 'sq ft' },
    { category: 'Foundation', description: 'Foundation repairs', quantity: 1, unit: 'each' },
    { category: 'Permits', description: 'Building permits and inspections', quantity: 1, unit: 'each' },
  ]

  const [lineItems, setLineItems] = useState(defaultCategories.map(cat => ({
    ...cat,
    typicalCost: 0,
    userCost: '',
  })))
  
  const [customLineItems, setCustomLineItems] = useState([])

  const cities = Object.keys(cityTemplates)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  // Update typical costs when city changes
  useEffect(() => {
    if (selectedCity && cityTemplates[selectedCity]) {
      const cityTemplate = cityTemplates[selectedCity]
      const updatedItems = lineItems.map(item => ({
        ...item,
        typicalCost: cityTemplate[item.category] || 0,
      }))
      setLineItems(updatedItems)
    }
  }, [selectedCity])

  const updateLineItem = (index, field, value) => {
    const updatedItems = [...lineItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setLineItems(updatedItems)
  }

  const addCustomLineItem = () => {
    const newItem = {
      category: '',
      typicalCost: 0,
      userCost: '',
      description: '',
      quantity: 1,
      unit: 'each',
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

  const getSubtotal = () => {
    if (inputMode === 'total') {
      return parseFloat(totalAmount) || 0
    }
    
    const lineItemTotal = lineItems.reduce((sum, item) => {
      const cost = parseFloat(item.userCost) || item.typicalCost || 0
      const quantity = parseFloat(item.quantity) || 1
      return sum + (cost * quantity)
    }, 0)
    
    const customTotal = customLineItems.reduce((sum, item) => {
      const cost = parseFloat(item.userCost) || parseFloat(item.typicalCost) || 0
      const quantity = parseFloat(item.quantity) || 1
      return sum + (cost * quantity)
    }, 0)
    
    return lineItemTotal + customTotal
  }

  const getContingencyAmount = () => {
    const subtotal = getSubtotal()
    return subtotal * (parseFloat(contingencyPercentage) / 100)
  }

  const getTotalEstimate = () => {
    const subtotal = getSubtotal()
    const contingency = getContingencyAmount()
    return subtotal + contingency
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
      contingencyPercentage: contingencyPercentage,
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
      {/* Header with Property Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Rehab Estimator</h1>
          <p className="text-text-secondary mt-1">
            Estimate renovation costs for{' '}
            {currentProperty ? (
              <span className="font-medium text-primary">
                {currentProperty.address || 'your investment property'}
              </span>
            ) : (
              'your investment property'
            )}
          </p>
        </div>
        <button
          onClick={saveTemplate}
          className="mt-4 sm:mt-0 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiSave} className="w-4 h-4" />
          <span>Save Template</span>
        </button>
      </div>

      {/* Input Mode Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Choose Input Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            onClick={() => setInputMode('total')}
            className={`p-4 rounded-lg border-2 transition-all ${
              inputMode === 'total'
                ? 'border-primary bg-primary-light/10 text-primary'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiDollarSign} className="w-6 h-6" />
              <div className="text-left">
                <h3 className="font-medium">Total Amount</h3>
                <p className="text-sm text-text-secondary">Enter a single total rehab cost</p>
              </div>
            </div>
          </motion.button>
          <motion.button
            onClick={() => setInputMode('line-item')}
            className={`p-4 rounded-lg border-2 transition-all ${
              inputMode === 'line-item'
                ? 'border-primary bg-primary-light/10 text-primary'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiTool} className="w-6 h-6" />
              <div className="text-left">
                <h3 className="font-medium">Line Item Breakdown</h3>
                <p className="text-sm text-text-secondary">Detailed category-by-category costs</p>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* City Selection for Templates */}
      {inputMode === 'line-item' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">City Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-DEFAULT mb-2">
                Select City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Choose a city...</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-DEFAULT mb-2">
                Or Enter Custom City
              </label>
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="Enter city name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Total Amount Input */}
      {inputMode === 'total' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Total Rehab Cost</h2>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-text-DEFAULT mb-2">
              Enter total rehab amount
            </label>
            <div className="relative">
              <SafeIcon
                icon={FiDollarSign}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              />
              <input
                type="text"
                value={totalAmount}
                onChange={(e) => {
                  // Remove non-numeric characters except decimal point
                  const value = e.target.value.replace(/[^\d.]/g, '')
                  setTotalAmount(value)
                }}
                placeholder="50,000"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
              />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-text-DEFAULT mb-2">
                Contingency Percentage (%)
              </label>
              <div className="relative">
                <SafeIcon
                  icon={FiPercent}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={contingencyPercentage}
                  onChange={(e) => setContingencyPercentage(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <p className="text-sm text-text-secondary mt-1">
                Additional budget for unexpected expenses
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Line Item Breakdown */}
      {inputMode === 'line-item' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-primary">Line Item Breakdown</h2>
            <button
              onClick={addCustomLineItem}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              <span>Add Custom Item</span>
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-100 rounded-lg mb-4 font-medium text-text-DEFAULT text-sm">
            <div className="col-span-3">Line Item</div>
            <div className="col-span-2">Typical Cost</div>
            <div className="col-span-2">Your Cost</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-1">Actions</div>
          </div>

          <div className="space-y-4">
            {/* Default Line Items */}
            {lineItems.map((item, index) => {
              const itemCost = parseFloat(item.userCost) || item.typicalCost || 0
              const quantity = parseFloat(item.quantity) || 1
              const totalItemCost = itemCost * quantity
              
              return (
                <motion.div
                  key={item.category}
                  className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="col-span-3">
                    <h3 className="font-medium text-text-DEFAULT">{item.category}</h3>
                    <p className="text-sm text-text-secondary">{item.description}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="font-semibold text-text-DEFAULT">
                      {formatCurrency(item.typicalCost)}
                    </p>
                    <p className="text-xs text-text-secondary">{selectedCity ? 'Local rate' : 'Select city'}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="relative">
                      <SafeIcon
                        icon={FiDollarSign}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                      />
                      <input
                        type="text"
                        value={item.userCost}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d.]/g, '')
                          updateLineItem(index, 'userCost', value)
                        }}
                        placeholder={item.typicalCost ? formatCurrency(item.typicalCost).replace('$', '') : '0'}
                        className="w-full pl-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                        className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <span className="ml-2 text-text-secondary text-sm">{item.unit}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="font-semibold text-text-DEFAULT">
                      {formatCurrency(totalItemCost)}
                    </p>
                  </div>
                  
                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      onClick={() => updateLineItem(index, 'userCost', item.typicalCost.toString())}
                      className="text-primary hover:text-primary-dark text-sm flex items-center space-x-1"
                      title="Use typical cost"
                    >
                      <SafeIcon icon={FiCopy} className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}

            {/* Custom Line Items */}
            {customLineItems.map((item, index) => {
              const itemCost = parseFloat(item.userCost) || parseFloat(item.typicalCost) || 0
              const quantity = parseFloat(item.quantity) || 1
              const totalItemCost = itemCost * quantity
              
              return (
                <motion.div
                  key={`custom-${index}`}
                  className="grid grid-cols-12 gap-4 p-4 bg-accent-light/10 rounded-lg border border-accent-light/30 items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => updateCustomLineItem(index, 'category', e.target.value)}
                      placeholder="Custom category"
                      className="w-full mb-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateCustomLineItem(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <div className="relative">
                      <SafeIcon
                        icon={FiDollarSign}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                      />
                      <input
                        type="text"
                        value={item.typicalCost}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d.]/g, '')
                          updateCustomLineItem(index, 'typicalCost', value)
                        }}
                        placeholder="0"
                        className="w-full pl-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="relative">
                      <SafeIcon
                        icon={FiDollarSign}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                      />
                      <input
                        type="text"
                        value={item.userCost}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d.]/g, '')
                          updateCustomLineItem(index, 'userCost', value)
                        }}
                        placeholder="0"
                        className="w-full pl-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateCustomLineItem(index, 'quantity', e.target.value)}
                        className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => updateCustomLineItem(index, 'unit', e.target.value)}
                        className="ml-2 py-2 px-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="each">each</option>
                        <option value="sq ft">sq ft</option>
                        <option value="linear ft">linear ft</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="font-semibold text-text-DEFAULT">
                      {formatCurrency(totalItemCost)}
                    </p>
                  </div>
                  
                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      onClick={() => removeCustomLineItem(index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <SafeIcon icon={FiMinus} className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Contingency Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Contingency Budget</h3>
              <div className="ml-auto flex items-center space-x-2">
                <SafeIcon icon={FiPercent} className="w-4 h-4 text-text-secondary" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={contingencyPercentage}
                  onChange={(e) => setContingencyPercentage(e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="text-text-secondary">%</span>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Add a contingency budget for unexpected expenses during the renovation process
            </p>
          </div>
        </div>
      )}

      {/* Total Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Rehab Cost Summary</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-text-DEFAULT">Subtotal</span>
            <span className="font-medium text-text-DEFAULT">{formatCurrency(getSubtotal())}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-text-DEFAULT">Contingency ({contingencyPercentage}%)</span>
            <span className="font-medium text-text-DEFAULT">{formatCurrency(getContingencyAmount())}</span>
          </div>
          
          <div className="flex justify-between items-center py-3">
            <span className="text-lg font-semibold text-primary">Total Rehab Estimate</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(getTotalEstimate())}</span>
          </div>
        </div>
      </div>

      {/* Rehab Tips Section */}
      <div className="bg-primary-light/10 rounded-xl border border-primary-light/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-3">Rehab Cost Saving Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-primary-dark mb-2">Material Selection</h4>
            <ul className="space-y-1 text-text-DEFAULT">
              <li>• Choose mid-grade materials for best ROI</li>
              <li>• Buy materials in bulk for discounts</li>
              <li>• Consider closeout sales and remnants</li>
              <li>• Use alternatives (LVP vs hardwood)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-primary-dark mb-2">Labor Costs</h4>
            <ul className="space-y-1 text-text-DEFAULT">
              <li>• Get at least 3 contractor bids</li>
              <li>• Prioritize high-impact renovations</li>
              <li>• Bundle projects with same contractor</li>
              <li>• Consider DIY for simple tasks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RehabEstimator