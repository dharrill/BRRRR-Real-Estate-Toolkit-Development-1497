import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import WorkflowInput from '../common/WorkflowInput'
import WorkflowNavigation from '../components/Common/WorkflowNavigation'
import * as FiIcons from 'react-icons/fi'
import { useProperty } from '../contexts/PropertyContext'
import { useRehabEstimator } from '../contexts/RehabEstimatorContext'
import { useMAOCalculator } from '../contexts/MAOCalculatorContext'
import { useToast } from '../contexts/ToastContext'

const { FiDollarSign, FiTarget, FiTrendingUp, FiRefreshCw, FiSave } = FiIcons

const MAOCalculator = () => {
  const { currentProperty } = useProperty()
  const { rehabEstimates } = useRehabEstimator()
  const { saveMaoCalculation, maoCalculations } = useMAOCalculator()
  const { showSuccess, showError } = useToast()

  const [arv, setArv] = useState('')
  const [rehabCost, setRehabCost] = useState('')
  const [selectedPercentage, setSelectedPercentage] = useState(null)
  const [customPercentage, setCustomPercentage] = useState(70)
  const [savedRehabAmount, setSavedRehabAmount] = useState(0)
  const [saving, setSaving] = useState(false)
  

  // Validation state
  const [isValid, setIsValid] = useState(false)

  // Load saved rehab estimate
  useEffect(() => {
    if (currentProperty && rehabEstimates.length > 0) {
      const latestEstimate = rehabEstimates[0]
      setSavedRehabAmount(latestEstimate.total || 0)
    } else {
      setSavedRehabAmount(0)
    }
  }, [currentProperty, rehabEstimates])

  // Load ARV from current property
  useEffect(() => {
    if (currentProperty?.arv) {
      setArv(currentProperty.arv.toString())
    }
  }, [currentProperty])

  // Load existing MAO calculation
  useEffect(() => {
    if (currentProperty && maoCalculations.length > 0) {
      const latestMAO = maoCalculations[0]
      if (latestMAO) {
        setArv(latestMAO.arv?.toString() || '')
        setRehabCost(latestMAO.rehab_cost?.toString() || '')
        if (latestMAO.selected_percentage === parseInt(latestMAO.selected_percentage)) {
          setSelectedPercentage(latestMAO.selected_percentage)
        } else {
          setSelectedPercentage('custom')
          setCustomPercentage(latestMAO.selected_percentage)
        }
      }
    }
  }, [currentProperty, maoCalculations])

  // Validation logic
  useEffect(() => {
    const hasValidInputs = parseFloat(arv) > 0 && parseFloat(rehabCost) > 0
    const hasSelectedPercentage = selectedPercentage !== null
    setIsValid(hasValidInputs && hasSelectedPercentage)
  }, [arv, rehabCost, selectedPercentage])

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

  const useRehabEstimate = () => {
    if (savedRehabAmount > 0) {
      setRehabCost(savedRehabAmount.toString())
      showSuccess('Rehab estimate loaded successfully!')
    } else {
      showError('No saved rehab estimate found. Please complete the Rehab Estimator first.')
    }
  }

  const handlePercentageSelect = (percentage) => {
    setSelectedPercentage(percentage)
  }

  const handleSaveMAO = async () => {
    if (!currentProperty || !arv || !rehabCost || selectedPercentage === null) {
      showError('Please fill in all required fields and select an ARV percentage')
      return
    }

    setSaving(true)
    try {
      const finalPercentage = selectedPercentage === 'custom' ? customPercentage : selectedPercentage
      const maoData = {
        arv: parseFloat(arv),
        rehab_cost: parseFloat(rehabCost),
        selected_percentage: finalPercentage,
        mao_70: calculateMAO(70),
        mao_75: calculateMAO(75),
        mao_80: calculateMAO(80),
        mao_custom: selectedPercentage === 'custom' ? calculateMAO(customPercentage) : null,
        final_mao: calculateMAO(finalPercentage)
      }

      const { error } = await saveMaoCalculation(maoData)
      if (error) {
        showError(`Error saving MAO calculation: ${error}`)
      } else {
        showSuccess('Great work! Your maximum allowable offer has been calculated and saved.', 5000)
      }
    } catch (error) {
      console.error('Error saving MAO calculation:', error)
      showError('Error saving MAO calculation')
    } finally {
      setSaving(false)
    }
  }

  const maoResults = [
    { percentage: 70, label: '70% Rule', description: 'Conservative approach', color: 'blue' },
    { percentage: 75, label: '75% Rule', description: 'Moderate approach', color: 'green' },
    { percentage: 80, label: '80% Rule', description: 'Aggressive approach', color: 'orange' }
  ]

  const getColorClasses = (color, isSelected = false) => {
    const baseColors = {
      blue: 'border-blue-200',
      green: 'border-green-200',
      orange: 'border-orange-200'
    }
    
    const selectedColors = {
      blue: 'bg-blue-50 border-blue-500 ring-2 ring-blue-200',
      green: 'bg-green-50 border-green-500 ring-2 ring-green-200',
      orange: 'bg-orange-50 border-orange-500 ring-2 ring-orange-200'
    }

    return isSelected ? selectedColors[color] : `bg-white hover:bg-gray-50 ${baseColors[color]}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiTarget} className="w-4 h-4 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Maximum Allowable Offer</h1>
        </div>
        <p className="text-gray-600">
          Calculate the maximum price to offer based on ARV, rehab cost, and your investment strategy.
        </p>
        {currentProperty && (
          <p className="text-sm text-blue-600 mt-1">
            Analyzing: {currentProperty.address}
          </p>
        )}
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Property Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <WorkflowInput
            label="After Repair Value (ARV)"
            type="number"
            value={arv}
            onChange={setArv}
            placeholder="250,000"
            prefix="$"
            required
          />

          <div>
            <WorkflowInput
              const rehabDisplay = formatCurrency(savedRehabAmount).replace(/^\$/, '')
              label="Rehab Cost Estimate"
              type="number"
              value={rehabCost}
              onChange={setRehabCost}
              placeholder={rehabDisplay}
              prefix="$"
              required
            />
            {savedRehabAmount > 0 && (
              <div className="mt-2">
                <button
                  onClick={useRehabEstimate}
                  className="text-sm bg-green-50 text-green-700 px-3 py-2 rounded-md border border-green-200 hover:bg-green-100 transition-colors flex items-center space-x-2"
                >
                  <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
                  <span>Use Rehab Estimate: {formatCurrency(savedRehabAmount)}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ARV Percentage Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select ARV Percentage Strategy</h3>
          
          {/* Standard Percentages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {maoResults.map((result) => (
              <motion.div
                key={result.percentage}
                className={`border rounded-xl p-4 cursor-pointer transition-all ${getColorClasses(
                  result.color,
                  selectedPercentage === result.percentage
                )}`}
                onClick={() => handlePercentageSelect(result.percentage)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-lg font-bold">{result.percentage}%</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1 italic">{result.label}</h4>
                  <p className="text-sm text-gray-600 mb-3">{result.description}</p>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-sm font-medium text-gray-600">MAO</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(calculateMAO(result.percentage))}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Custom Percentage */}
          <div
            className={`border rounded-xl p-4 cursor-pointer transition-all ${getColorClasses(
              'blue',
              selectedPercentage === 'custom'
            )}`}
            onClick={() => handlePercentageSelect('custom')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 mb-1 italic">Custom Rule</h4>
                <p className="text-sm text-gray-600">Set your own ARV percentage</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="50"
                    max="90"
                    value={customPercentage}
                    onChange={(e) => setCustomPercentage(parseInt(e.target.value))}
                    className="w-24"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-lg font-bold text-gray-900 w-12">
                    {customPercentage}%
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center min-w-[120px]">
                  <p className="text-sm font-medium text-gray-600">MAO</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(calculateMAO(customPercentage))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected MAO Display */}
        {selectedPercentage && (
          <motion.div
            className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white text-center mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center mb-2">
              <SafeIcon icon={FiTarget} className="w-6 h-6 mr-2" />
              <h3 className="text-xl font-medium">Your Maximum Allowable Offer</h3>
            </div>
            <p className="text-4xl font-bold mb-2">
              {formatCurrency(calculateMAO(selectedPercentage === 'custom' ? customPercentage : selectedPercentage))}
            </p>
            <p className="text-green-100">
              {selectedPercentage === 'custom' ? customPercentage : selectedPercentage}% × {formatCurrency(arv || 0)} - {formatCurrency(rehabCost || 0)}
            </p>
          </motion.div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSaveMAO}
          disabled={saving || !isValid}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          <SafeIcon icon={FiSave} className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save MAO Calculation'}</span>
        </button>

        {/* Workflow Navigation */}
        <WorkflowNavigation
          backTo="rehab-estimator"
          backLabel="Back to Rehab Estimator"
          nextTo="property-analyzer"
          nextLabel="Proceed to Property Analyzer"
          canProceed={isValid}
        />
      </div>

      {/* MAO Explanation */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Understanding Your Maximum Allowable Offer</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2 italic">70% Rule</h4>
            <p className="text-blue-700">
              A conservative cap that factors in rehab, holding, and closing costs, with plenty of buffer for overruns. 
              Preferred by most lenders and ideal for cautious investors or uncertain markets.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2 italic">75% Rule</h4>
            <p className="text-blue-700">
              A balanced strategy that leaves room for profit while allowing competitive bids. Great for markets where 
              you've validated your ARV—just be sure your projected rent covers PITI (principal, interest, taxes & insurance).
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2 italic">80% Rule</h4>
            <p className="text-blue-700">
              The upper LTV limit many lenders will allow. Requires solid credit, lender approval, and confidence in your 
              rehab/ARV estimates. Important: confirm your rent fully covers mortgage payments (aim for DSCR ≥ 1.1).
            </p>
          </div>
        </div>

        <div className="p-4 bg-blue-100 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 Pro Tips</h4>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• <strong>Check lender LTV:</strong> Always verify your lender's max allowable LTV before choosing a rule.</li>
            <li>• <strong>Run a debt-service check:</strong> DSCR = (Net Rent) ÷ (PITI). Target ≥ 1.1 for healthy cash flow.</li>
            <li>• <strong>Build in contingencies:</strong> Add 10–20% to your rehab estimate for unexpected costs.</li>
            <li>• <strong>Account for all fees:</strong> Include holding costs, financing fees, and closing costs in your MAO.</li>
            <li>• <strong>Use Custom Rule:</strong> Match your exact lender cap or unique deal parameters with the Custom option.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MAOCalculator
