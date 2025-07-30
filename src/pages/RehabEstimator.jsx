import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import NumberInput from '../common/NumberInput'
import WorkflowInput from '../common/WorkflowInput'
import WorkflowNavigation from '../components/Common/WorkflowNavigation'
import * as FiIcons from 'react-icons/fi'
import { useProperty } from '../contexts/PropertyContext'
import { useRehabTemplate } from '../contexts/RehabTemplateContext'
import { useRehabEstimator } from '../contexts/RehabEstimatorContext'
import { useToast } from '../contexts/ToastContext'
import TemplateManager from '../components/Rehab/TemplateManager'

const { FiSave, FiTrash, FiSettings, FiPlus, FiRefreshCw, FiTool } = FiIcons

const RehabEstimator = () => {
  const { currentProperty } = useProperty()
  const { templates, getTemplateByCity } = useRehabTemplate()
  const { saveRehabEstimate, rehabEstimates, fetchRehabEstimates } = useRehabEstimator()
  const { showSuccess, showError } = useToast()

  const [inputMode, setInputMode] = useState('line-item')
  const [totalAmount, setTotalAmount] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [contingencyPercentage, setContingencyPercentage] = useState(10)
  const [lineItems, setLineItems] = useState([])
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [saving, setSaving] = useState(false)
  const [estimateId, setEstimateId] = useState(null)
  const [holdingDays, setHoldingDays] = useState('90')

  // Validation state
  const [isValid, setIsValid] = useState(false)

  // Load existing estimate if available
  useEffect(() => {
    if (currentProperty && rehabEstimates.length > 0) {
      const existingEstimate = rehabEstimates[0]
      if (existingEstimate) {
        setEstimateId(existingEstimate.id)
        setInputMode(existingEstimate.input_mode || 'line-item')
        setTotalAmount(existingEstimate.total_amount || '')
        setSelectedCity(existingEstimate.selected_city || '')
        setContingencyPercentage(existingEstimate.contingency_percentage || 10)
        setHoldingDays(existingEstimate.holding_days || '90')

        if (existingEstimate.line_items && Array.isArray(existingEstimate.line_items)) {
          setLineItems(existingEstimate.line_items.map(item => ({
            name: item.name || '',
            typicalCost: item.typicalCost || 0,
            userCost: item.userCost || 0,
            quantity: item.quantity || 1
          })))
        } else {
          setLineItems([])
        }
      }
    }
  }, [currentProperty, rehabEstimates])

  // Validation logic
  useEffect(() => {
    if (inputMode === 'total') {
      setIsValid(parseFloat(totalAmount) > 0)
    } else {
      const hasValidItems = lineItems.length > 0 && lineItems.some(item => 
        item.name.trim() !== '' && item.userCost > 0
      )
      setIsValid(hasValidItems)
    }
  }, [inputMode, totalAmount, lineItems])

  // Load template when city is selected and no existing line items
  useEffect(() => {
    if (selectedCity && templates.length > 0 && lineItems.length === 0) {
      const template = getTemplateByCity(selectedCity)
      if (template && template.line_items) {
        const items = Object.entries(template.line_items).map(([name, typicalCost]) => ({
          name,
          typicalCost,
          userCost: typicalCost,
          quantity: 1
        }))
        setLineItems(items)
      }
    }
  }, [selectedCity, templates, getTemplateByCity, lineItems.length])

  const handleCityChange = (newCity) => {
    setSelectedCity(newCity)
    if (newCity && templates.length > 0) {
      const template = getTemplateByCity(newCity)
      if (template && template.line_items) {
        const existingItemsMap = {}
        lineItems.forEach(item => {
          existingItemsMap[item.name] = item
        })

        const newItems = Object.entries(template.line_items).map(([name, typicalCost]) => {
          if (existingItemsMap[name]) {
            return {
              name,
              typicalCost,
              userCost: existingItemsMap[name].userCost,
              quantity: existingItemsMap[name].quantity || 1
            }
          } else {
            return {
              name,
              typicalCost,
              userCost: typicalCost,
              quantity: 1
            }
          }
        })
        setLineItems(newItems)
      }
    }
  }

  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems]
    if (field === 'name') {
      updated[index][field] = value
    } else {
      updated[index][field] = parseFloat(value) || 0
    }
    setLineItems(updated)
  }

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { name: '', typicalCost: 0, userCost: 0, quantity: 1 }])
  }

  const handleRemoveLineItem = (index) => {
    const updated = [...lineItems]
    updated.splice(index, 1)
    setLineItems(updated)
  }

  const subtotal = lineItems.reduce((acc, item) => acc + (item.userCost * item.quantity), 0)
  const contingency = (contingencyPercentage / 100) * subtotal
  const total = inputMode === 'total' ? parseFloat(totalAmount) || 0 : subtotal + contingency

  const formatCurrency = (value) => {
    return isNaN(value) ? '$0' : value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    })
  }

  const handleRefresh = async () => {
    if (currentProperty) {
      await fetchRehabEstimates()
    }
  }

  const handleSaveField = async (field, value) => {
    // Auto-save individual fields as they're updated
    if (!currentProperty) return

    try {
      const estimateData = {
        input_mode: inputMode,
        total_amount: inputMode === 'total' ? parseFloat(totalAmount) || 0 : null,
        selected_city: selectedCity,
        contingency_percentage: contingencyPercentage,
        holding_days: parseInt(holdingDays) || 90,
        line_items: lineItems,
        subtotal: inputMode === 'line-item' ? subtotal : 0,
        total: total,
        [field]: value
      }

      await saveRehabEstimate(estimateData)
    } catch (error) {
      console.error('Error auto-saving field:', error)
    }
  }

  const handleSave = async () => {
    if (!currentProperty) {
      showError('Please select a property first')
      return
    }

    setSaving(true)
    try {
      const estimateData = {
        input_mode: inputMode,
        total_amount: inputMode === 'total' ? parseFloat(totalAmount) || 0 : null,
        selected_city: selectedCity,
        contingency_percentage: contingencyPercentage,
        holding_days: parseInt(holdingDays) || 90,
        line_items: lineItems,
        subtotal: inputMode === 'line-item' ? subtotal : 0,
        total: total
      }

      const { error } = await saveRehabEstimate(estimateData)
      if (error) {
        showError(`Error saving estimate: ${error}`)
      } else {
        showSuccess("Nice job! Your Looker's rehab budget has been locked in.", 5000)
        await fetchRehabEstimates()
      }
    } catch (error) {
      console.error('Error saving rehab estimate:', error)
      showError('Error saving rehab estimate')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiTool} className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Rehab Estimator</h1>
          </div>
          <p className="text-gray-600">
            Estimate renovation costs for {currentProperty?.address || 'your property'}
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowTemplateManager(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiSettings} className="w-4 h-4" />
            <span>Manage Templates</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Input Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Mode
          </label>
          <select
            value={inputMode}
            onChange={(e) => setInputMode(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="line-item">Line Item Breakdown</option>
            <option value="total">Total Amount</option>
          </select>
        </div>

        {inputMode === 'total' ? (
          <div className="mb-6">
            <WorkflowInput
              label="Total Rehab Amount"
              type="number"
              value={totalAmount}
              onChange={setTotalAmount}
              onSave={(value) => handleSaveField('total_amount', parseFloat(value) || 0)}
              placeholder="30,000"
              prefix="$"
              required
            />
          </div>
        ) : (
          <>
            {/* City Template Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City Template
              </label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select a City Template --</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.city}>
                    {template.city}, {template.state}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Select a city template to auto-fill typical costs, or create custom line items below
              </p>
            </div>

            {/* Line Items */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Line Items</h3>
                <button
                  onClick={handleAddLineItem}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                  <span>Add Line Item</span>
                </button>
              </div>

              {lineItems.length > 0 ? (
                <>
                  <div className="grid grid-cols-6 gap-2 text-sm font-medium text-gray-700 pb-2 border-b border-gray-200 mb-4">
                    <div className="col-span-2">Line Item</div>
                    <div>Typical Cost</div>
                    <div>Your Cost</div>
                    <div>Qty</div>
                    <div>Actions</div>
                  </div>
                  <div className="space-y-2">
                    {lineItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-6 gap-2 items-center">
                        <input
                          value={item.name}
                          onChange={(e) => handleLineItemChange(index, 'name', e.target.value)}
                          onBlur={() => handleSaveField('line_items', lineItems)}
                          placeholder="Item name"
                          className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                          {formatCurrency(item.typicalCost)}
                        </div>
                        <NumberInput
                          value={item.userCost}
                          onChange={(value) => handleLineItemChange(index, 'userCost', value)}
                          onBlur={() => handleSaveField('line_items', lineItems)}
                          placeholder="0"
                          prefix="$"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <NumberInput
                          value={item.quantity}
                          onChange={(value) => handleLineItemChange(index, 'quantity', value)}
                          onBlur={() => handleSaveField('line_items', lineItems)}
                          placeholder="1"
                          min={1}
                          allowDecimals={false}
                          showThousandsSeparator={false}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleRemoveLineItem(index)}
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <SafeIcon icon={FiTrash} className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No line items yet. Add items manually or select a city template above.</p>
                </div>
              )}
            </div>

            {/* Contingency */}
            <div className="mb-6">
              <WorkflowInput
                label="Contingency Percentage (%)"
                type="number"
                value={contingencyPercentage}
                onChange={setContingencyPercentage}
                onSave={(value) => handleSaveField('contingency_percentage', parseFloat(value) || 10)}
                placeholder="10"
                min={0}
                max={50}
                suffix="%"
              />
              <p className="text-sm text-gray-500 mt-1">
                Recommended: 10-20% to account for unexpected costs
              </p>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Cost Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Contingency ({contingencyPercentage}%):
                  </span>
                  <span className="font-medium">{formatCurrency(contingency)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Estimate:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Holding Days */}
        <div className="mb-6">
          <WorkflowInput
            label="Holding Days"
            type="number"
            value={holdingDays}
            onChange={setHoldingDays}
            onSave={(value) => handleSaveField('holding_days', parseInt(value) || 90)}
            placeholder="90"
            min={1}
            suffix=" days"
          />
          <p className="text-sm text-gray-500 mt-1">
            Expected days from purchase to refinance
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || !isValid}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          <SafeIcon icon={FiSave} className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Rehab Estimate'}</span>
        </button>

        {/* Workflow Navigation */}
        <WorkflowNavigation
          backTo="dashboard"
          backLabel="Back to Dashboard"
          nextTo="mao-calculator"
          nextLabel="Proceed to MAO Calculator"
          canProceed={isValid && total > 0}
        />
      </div>

      {/* Template Manager Modal */}
      <TemplateManager
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
      />
    </div>
  )
}

export default RehabEstimator