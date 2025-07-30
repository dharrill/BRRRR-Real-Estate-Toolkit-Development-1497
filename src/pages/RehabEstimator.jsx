import React, { useState, useEffect } from 'react'
import { useProperty } from '../contexts/PropertyContext'
import { FiSave, FiTrash } from 'react-icons/fi'

const RehabEstimator = () => {
  const { currentProperty } = useProperty()
  const [inputMode, setInputMode] = useState('line-item')
  const [totalAmount, setTotalAmount] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [contingencyPercentage, setContingencyPercentage] = useState(10)
  const [lineItems, setLineItems] = useState([])

  const cityTemplates = {
    'Indianapolis': {
      'HVAC': 4500,
      'Electrical': 8000,
      'Plumbing': 8000,
      'Windows': 150,
      'Flooring': 25,
      'Interior Paint': 3000,
      'Exterior Paint': 3500,
      'Roof': 9500,
      'Kitchen': 14000,
      'Bathroom': 7000,
      'Driveway': 3000,
      'Miscellaneous': 2000,
    }
    // Add additional cities if needed
  }

  useEffect(() => {
    if (selectedCity && cityTemplates[selectedCity]) {
      const template = cityTemplates[selectedCity]
      const items = Object.entries(template).map(([name, typicalCost]) => ({
        name,
        typicalCost,
        userCost: typicalCost,
        quantity: 1
      }))
      setLineItems(items)
    }
  }, [selectedCity])

  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems]
    updated[index][field] = field === 'name' ? value : parseFloat(value) || 0
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
  const total = subtotal + contingency

  const formatCurrency = (value) => {
    return isNaN(value)
      ? '$0.00'
      : value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  const handleSave = () => {
    const data = {
      propertyId: currentProperty?.id || '',
      inputMode,
      totalAmount,
      selectedCity,
      contingencyPercentage,
      lineItems,
      subtotal,
      total
    }
    console.log('Saving Rehab Data:', data)
    alert('Rehab estimate saved successfully!')
    // TODO: Replace with call to Supabase or backend
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-black">Rehab Estimator</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Input Mode</label>
        <select
          value={inputMode}
          onChange={(e) => setInputMode(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="line-item">Line Item Breakdown</option>
          <option value="total">Total Amount</option>
        </select>
      </div>

      {inputMode === 'total' ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Rehab Amount</label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="$30,000.00"
            className="border rounded p-2 w-full"
          />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">City Template</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="">-- Select a City --</option>
              {Object.keys(cityTemplates).map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-5 gap-2 font-semibold text-sm text-gray-600 border-b pb-2">
            <div>Line Item</div>
            <div>Typical Cost</div>
            <div>Your Cost</div>
            <div>Qty</div>
            <div>Remove</div>
          </div>

          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 py-2 items-center">
              <input
                value={item.name}
                onChange={(e) => handleLineItemChange(index, 'name', e.target.value)}
                className="border p-1 rounded"
              />
              <input
                value={item.typicalCost}
                onChange={(e) => handleLineItemChange(index, 'typicalCost', e.target.value)}
                className="border p-1 rounded"
              />
              <input
                value={item.userCost}
                onChange={(e) => handleLineItemChange(index, 'userCost', e.target.value)}
                className="border p-1 rounded"
              />
              <input
                value={item.quantity}
                onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                className="border p-1 rounded"
              />
              <button
                onClick={() => handleRemoveLineItem(index)}
                className="text-red-500 hover:text-red-700"
              >
                <FiTrash />
              </button>
            </div>
          ))}

          <button
            onClick={handleAddLineItem}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            + Add Line Item
          </button>

          <div className="mt-6">
            <label className="block font-medium text-gray-700 mb-1">Contingency Percentage (%)</label>
            <input
              type="number"
              value={contingencyPercentage}
              onChange={(e) => setContingencyPercentage(e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>

          <div className="mt-6 text-lg font-semibold text-black">
            Subtotal: {formatCurrency(subtotal)} <br />
            Contingency: {formatCurrency(contingency)} <br />
            <span className="text-xl">Total Estimate: {formatCurrency(total)}</span>
          </div>
        </>
      )}

      <button
        onClick={handleSave}
        className="mt-8 bg-black text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-gray-900"
      >
        <FiSave /> Save Rehab Estimate
      </button>
    </div>
  )
}

export default RehabEstimator
