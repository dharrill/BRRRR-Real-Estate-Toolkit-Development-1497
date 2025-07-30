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

const { FiBarChart3, FiDollarSign, FiPercent, FiTrendingUp, FiSave, FiTrendingDown } = FiIcons

const PropertyAnalyzer = () => {
  const { currentProperty } = useProperty()
  const { rehabEstimates } = useRehabEstimator()
  const { maoCalculations } = useMAOCalculator()
  const { showSuccess, showError } = useToast()

  const [formData, setFormData] = useState({
    purchasePrice: '',
    arv: '',
    downPayment: '',
    rehabTotal: '',
    holdingDays: '',
    closingCosts: '',
    insurance: '',
    utilities: '',
    taxes: '',
    maintenancePercent: '8',
    managementPercent: '10',
    vacancyPercent: '5',
    monthlyRent: '',
    loanAmount: '',
    interestRate: '',
    loanTerm: '30'
  })

  const [results, setResults] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [hasAnalysis, setHasAnalysis] = useState(false)
  const [saving, setSaving] = useState(false)

  // Validation state
  const [isValid, setIsValid] = useState(false)

  // Load data from previous steps
  useEffect(() => {
    if (currentProperty) {
      const updates = {
        arv: currentProperty.arv?.toString() || ''
      }

      // Load rehab data
      if (rehabEstimates.length > 0) {
        const latestRehab = rehabEstimates[0]
        updates.rehabTotal = latestRehab.total?.toString() || ''
        updates.holdingDays = latestRehab.holding_days?.toString() || '90'
      }

      // Load MAO data
      if (maoCalculations.length > 0) {
        const latestMAO = maoCalculations[0]
        updates.purchasePrice = latestMAO.final_mao?.toString() || ''
      }

      setFormData(prev => ({ ...prev, ...updates }))
    }
  }, [currentProperty, rehabEstimates, maoCalculations])

  // Validation logic
  useEffect(() => {
    const requiredFields = [
      'purchasePrice', 'arv', 'downPayment', 'rehabTotal', 
      'monthlyRent', 'interestRate'
    ]
    
    const allFieldsValid = requiredFields.every(field => 
      parseFloat(formData[field]) > 0
    )
    
    setIsValid(allFieldsValid)
  }, [formData])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFieldSave = async (field, value) => {
    // Auto-save functionality could be implemented here
    console.log(`Saving ${field}:`, value)
  }

  const calculateAnalysis = () => {
    const purchasePrice = parseFloat(formData.purchasePrice) || 0
    const arv = parseFloat(formData.arv) || 0
    const downPayment = parseFloat(formData.downPayment) || 0
    const rehabTotal = parseFloat(formData.rehabTotal) || 0
    const holdingDays = parseFloat(formData.holdingDays) || 90
    const closingCosts = parseFloat(formData.closingCosts) || 0
    const monthlyRent = parseFloat(formData.monthlyRent) || 0
    const loanAmount = parseFloat(formData.loanAmount) || (purchasePrice - downPayment)
    const interestRate = parseFloat(formData.interestRate) || 0
    const loanTerm = parseFloat(formData.loanTerm) || 30

    // Calculate monthly expenses
    const insurance = parseFloat(formData.insurance) || 0
    const utilities = parseFloat(formData.utilities) || 0
    const taxes = parseFloat(formData.taxes) || 0
    const maintenanceAmount = monthlyRent * (parseFloat(formData.maintenancePercent) / 100)
    const managementAmount = monthlyRent * (parseFloat(formData.managementPercent) / 100)
    const vacancyAmount = monthlyRent * (parseFloat(formData.vacancyPercent) / 100)

    // Monthly mortgage payment
    const monthlyRate = interestRate / 100 / 12
    const numPayments = loanTerm * 12
    const monthlyMortgage = loanAmount > 0 && monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      : 0

    // Total expenses and cash flow
    const totalMonthlyExpenses = monthlyMortgage + insurance + utilities + taxes + 
                                maintenanceAmount + managementAmount + vacancyAmount
    const monthlyCashFlow = monthlyRent - totalMonthlyExpenses
    const annualCashFlow = monthlyCashFlow * 12

    // Investment calculations
    const totalInvested = downPayment + rehabTotal + closingCosts + 
                         (holdingDays / 30) * (insurance + utilities + taxes)
    
    const ltv = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0
    
    // Net Operating Income (NOI)
    const noi = (monthlyRent * 12) - ((insurance + utilities + taxes + 
                 maintenanceAmount + managementAmount + vacancyAmount) * 12)
    
    const capRate = purchasePrice > 0 ? (noi / purchasePrice) * 100 : 0
    const cashOnCashReturn = totalInvested > 0 ? (annualCashFlow / totalInvested) * 100 : 0
    
    // Equity calculations
    const currentEquity = arv - loanAmount
    const equityAtRefi = arv * 0.8 // Assuming 80% LTV on refinance
    const cashOutAtRefi = Math.max(0, equityAtRefi - loanAmount)

    const analysisResults = {
      purchasePrice,
      arv,
      totalInvested,
      ltv,
      monthlyRent,
      monthlyMortgage,
      totalMonthlyExpenses,
      monthlyCashFlow,
      annualCashFlow,
      noi,
      capRate,
      cashOnCashReturn,
      currentEquity,
      equityAtRefi,
      cashOutAtRefi,
      insurance,
      utilities,
      taxes,
      maintenanceAmount,
      managementAmount,
      vacancyAmount
    }

    setResults(analysisResults)
    setHasAnalysis(true)
  }

  const saveScenario = async () => {
    if (!results) return

    setSaving(true)
    try {
      const scenario = {
        id: Date.now(),
        name: `Analysis ${scenarios.length + 1}`,
        formData: { ...formData },
        results: { ...results },
        createdAt: new Date().toISOString()
      }

      setScenarios(prev => [...prev, scenario])
      showSuccess('Analysis scenario saved successfully!')
    } catch (error) {
      showError('Error saving scenario')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatPercent = (percent) => {
    return `${(percent || 0).toFixed(2)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiBarChart3} className="w-4 h-4 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Property Analyzer</h1>
          </div>
          <p className="text-gray-600">Complete financial analysis with cash flow, cap rate, and ROI calculations</p>
        </div>
        {results && (
          <button
            onClick={saveScenario}
            disabled={saving}
            className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiSave} className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Scenario'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-6">
          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <WorkflowInput
                  label="Purchase Price"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(value) => handleInputChange('purchasePrice', value)}
                  onSave={(value) => handleFieldSave('purchasePrice', value)}
                  placeholder="160,000"
                  prefix="$"
                  required
                />
                <WorkflowInput
                  label="ARV"
                  type="number"
                  value={formData.arv}
                  onChange={(value) => handleInputChange('arv', value)}
                  onSave={(value) => handleFieldSave('arv', value)}
                  placeholder="200,000"
                  prefix="$"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <WorkflowInput
                  label="Down Payment"
                  type="number"
                  value={formData.downPayment}
                  onChange={(value) => handleInputChange('downPayment', value)}
                  onSave={(value) => handleFieldSave('downPayment', value)}
                  placeholder="32,000"
                  prefix="$"
                  required
                />
                <WorkflowInput
                  label="Rehab Total"
                  type="number"
                  value={formData.rehabTotal}
                  onChange={(value) => handleInputChange('rehabTotal', value)}
                  onSave={(value) => handleFieldSave('rehabTotal', value)}
                  placeholder="25,000"
                  prefix="$"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <WorkflowInput
                  label="Holding Days"
                  type="number"
                  value={formData.holdingDays}
                  onChange={(value) => handleInputChange('holdingDays', value)}
                  onSave={(value) => handleFieldSave('holdingDays', value)}
                  placeholder="90"
                  suffix=" days"
                />
                <WorkflowInput
                  label="Closing Costs"
                  type="number"
                  value={formData.closingCosts}
                  onChange={(value) => handleInputChange('closingCosts', value)}
                  onSave={(value) => handleFieldSave('closingCosts', value)}
                  placeholder="3,000"
                  prefix="$"
                />
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <WorkflowInput
                  label="Interest Rate"
                  type="number"
                  value={formData.interestRate}
                  onChange={(value) => handleInputChange('interestRate', value)}
                  onSave={(value) => handleFieldSave('interestRate', value)}
                  placeholder="6.5"
                  suffix="%"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Term
                  </label>
                  <select
                    value={formData.loanTerm}
                    onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="15">15 Years</option>
                    <option value="20">20 Years</option>
                    <option value="25">25 Years</option>
                    <option value="30">30 Years</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Income & Expenses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income & Expenses</h2>
            <div className="space-y-4">
              <WorkflowInput
                label="Monthly Rent"
                type="number"
                value={formData.monthlyRent}
                onChange={(value) => handleInputChange('monthlyRent', value)}
                onSave={(value) => handleFieldSave('monthlyRent', value)}
                placeholder="1,800"
                prefix="$"
                required
              />

              <div className="grid grid-cols-3 gap-4">
                <WorkflowInput
                  label="Insurance"
                  type="number"
                  value={formData.insurance}
                  onChange={(value) => handleInputChange('insurance', value)}
                  onSave={(value) => handleFieldSave('insurance', value)}
                  placeholder="100"
                  prefix="$"
                />
                <WorkflowInput
                  label="Utilities"
                  type="number"
                  value={formData.utilities}
                  onChange={(value) => handleInputChange('utilities', value)}
                  onSave={(value) => handleFieldSave('utilities', value)}
                  placeholder="50"
                  prefix="$"
                />
                <WorkflowInput
                  label="Taxes"
                  type="number"
                  value={formData.taxes}
                  onChange={(value) => handleInputChange('taxes', value)}
                  onSave={(value) => handleFieldSave('taxes', value)}
                  placeholder="200"
                  prefix="$"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <WorkflowInput
                  label="Maintenance"
                  type="number"
                  value={formData.maintenancePercent}
                  onChange={(value) => handleInputChange('maintenancePercent', value)}
                  onSave={(value) => handleFieldSave('maintenancePercent', value)}
                  placeholder="8"
                  suffix="%"
                />
                <WorkflowInput
                  label="Management"
                  type="number"
                  value={formData.managementPercent}
                  onChange={(value) => handleInputChange('managementPercent', value)}
                  onSave={(value) => handleFieldSave('managementPercent', value)}
                  placeholder="10"
                  suffix="%"
                />
                <WorkflowInput
                  label="Vacancy"
                  type="number"
                  value={formData.vacancyPercent}
                  onChange={(value) => handleInputChange('vacancyPercent', value)}
                  onSave={(value) => handleFieldSave('vacancyPercent', value)}
                  placeholder="5"
                  suffix="%"
                />
              </div>
            </div>

            <button
              onClick={calculateAnalysis}
              disabled={!isValid}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiBarChart3} className="w-5 h-5" />
              <span>Calculate Analysis</span>
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {results && (
            <>
              {/* Key Metrics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center text-green-600 mb-2">
                      <SafeIcon icon={FiDollarSign} className="w-5 h-5 mr-2" />
                      <span className="font-medium">Monthly Cash Flow</span>
                    </div>
                    <p className={`text-2xl font-bold ${
                      results.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(results.monthlyCashFlow)}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center text-blue-600 mb-2">
                      <SafeIcon icon={FiPercent} className="w-5 h-5 mr-2" />
                      <span className="font-medium">Cap Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPercent(results.capRate)}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center text-purple-600 mb-2">
                      <SafeIcon icon={FiTrendingUp} className="w-5 h-5 mr-2" />
                      <span className="font-medium">Cash-on-Cash Return</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatPercent(results.cashOnCashReturn)}
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center text-orange-600 mb-2">
                      <SafeIcon icon={FiBarChart3} className="w-5 h-5 mr-2" />
                      <span className="font-medium">Total Invested</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(results.totalInvested)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Investment Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Investment Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchase Price:</span>
                    <span className="font-medium">{formatCurrency(results.purchasePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Invested:</span>
                    <span className="font-medium">{formatCurrency(results.totalInvested)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">LTV Ratio:</span>
                    <span className="font-medium">{formatPercent(results.ltv)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Equity:</span>
                    <span className="font-medium text-green-600">{formatCurrency(results.currentEquity)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="text-gray-600">Cash Out at Refi:</span>
                    <span className="font-medium text-blue-600">{formatCurrency(results.cashOutAtRefi)}</span>
                  </div>
                </div>
              </div>

              {/* Monthly Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Monthly Rent</span>
                    <span className="font-medium text-green-600">{formatCurrency(results.monthlyRent)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Mortgage Payment</span>
                    <span className="font-medium text-red-600">-{formatCurrency(results.monthlyMortgage)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Insurance</span>
                    <span className="font-medium text-red-600">-{formatCurrency(results.insurance)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Utilities</span>
                    <span className="font-medium text-red-600">-{formatCurrency(results.utilities)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Taxes</span>
                    <span className="font-medium text-red-600">-{formatCurrency(results.taxes)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Maintenance</span>
                    <span className="font-medium text-red-600">-{formatCurrency(results.maintenanceAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Management</span>
                    <span className="font-medium text-red-600">-{formatCurrency(results.managementAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Vacancy</span>
                    <span className="font-medium text-red-600">-{formatCurrency(results.vacancyAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-t-2 border-gray-200 mt-4">
                    <span className="font-semibold text-gray-900">Net Cash Flow</span>
                    <span className={`font-bold text-lg ${
                      results.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(results.monthlyCashFlow)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Saved Scenarios */}
          {scenarios.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Scenarios</h2>
              <div className="space-y-3">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{scenario.name}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(scenario.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Cash Flow: </span>
                        <span className={`font-medium ${
                          scenario.results.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(scenario.results.monthlyCashFlow)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Cap Rate: </span>
                        <span className="font-medium">{formatPercent(scenario.results.capRate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">CoC Return: </span>
                        <span className="font-medium">{formatPercent(scenario.results.cashOnCashReturn)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <WorkflowNavigation
          backTo="mao-calculator"
          backLabel="Back to MAO Calculator"
          nextTo="compounding"
          nextLabel="Finish & View Summary"
          canProceed={hasAnalysis && isValid}
          isLast={true}
        />
      </div>
    </div>
  )
}

export default PropertyAnalyzer