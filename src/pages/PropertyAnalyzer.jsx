import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiBarChart3, FiDollarSign, FiPercent, FiTrendingUp, FiSave } = FiIcons

const PropertyAnalyzer = () => {
  const [formData, setFormData] = useState({
    monthlyRent: '',
    purchasePrice: '',
    downPayment: '',
    loanAmount: '',
    interestRate: '',
    loanTerm: '30',
    propertyTaxes: '',
    insurance: '',
    maintenance: '8',
    management: '10',
    vacancy: '5',
    otherExpenses: '',
  })

  const [results, setResults] = useState(null)
  const [scenarios, setScenarios] = useState([])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateAnalysis = () => {
    const rent = parseFloat(formData.monthlyRent) || 0
    const purchase = parseFloat(formData.purchasePrice) || 0
    const down = parseFloat(formData.downPayment) || 0
    const loan = parseFloat(formData.loanAmount) || (purchase - down)
    const rate = parseFloat(formData.interestRate) || 0
    const term = parseFloat(formData.loanTerm) || 30
    const taxes = parseFloat(formData.propertyTaxes) || 0
    const insurance = parseFloat(formData.insurance) || 0
    const maintenance = parseFloat(formData.maintenance) || 0
    const management = parseFloat(formData.management) || 0
    const vacancy = parseFloat(formData.vacancy) || 0
    const other = parseFloat(formData.otherExpenses) || 0

    // Monthly mortgage payment
    const monthlyRate = rate / 100 / 12
    const numPayments = term * 12
    const monthlyMortgage = loan > 0 ? 
      (loan * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1) : 0

    // Monthly expenses
    const monthlyTaxes = taxes / 12
    const monthlyInsurance = insurance / 12
    const maintenanceAmount = rent * (maintenance / 100)
    const managementAmount = rent * (management / 100)
    const vacancyAmount = rent * (vacancy / 100)

    const totalExpenses = monthlyMortgage + monthlyTaxes + monthlyInsurance + 
                         maintenanceAmount + managementAmount + vacancyAmount + other

    // Net operating income and cash flow
    const noi = (rent * 12) - ((monthlyTaxes + monthlyInsurance + maintenanceAmount + 
                 managementAmount + vacancyAmount + other) * 12)
    const monthlyCashFlow = rent - totalExpenses
    const annualCashFlow = monthlyCashFlow * 12

    // Returns
    const capRate = purchase > 0 ? (noi / purchase) * 100 : 0
    const cashOnCashReturn = down > 0 ? (annualCashFlow / down) * 100 : 0
    const totalReturn = purchase > 0 ? (annualCashFlow / purchase) * 100 : 0

    const analysisResults = {
      monthlyRent: rent,
      monthlyMortgage,
      monthlyTaxes,
      monthlyInsurance,
      maintenanceAmount,
      managementAmount,
      vacancyAmount,
      otherExpenses: other,
      totalExpenses,
      monthlyCashFlow,
      annualCashFlow,
      noi,
      capRate,
      cashOnCashReturn,
      totalReturn,
      purchasePrice: purchase,
      downPayment: down,
    }

    setResults(analysisResults)
  }

  const saveScenario = () => {
    if (!results) return

    const scenario = {
      id: Date.now(),
      name: `Scenario ${scenarios.length + 1}`,
      formData: { ...formData },
      results: { ...results },
      createdAt: new Date().toISOString()
    }

    setScenarios(prev => [...prev, scenario])
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
          <h1 className="text-2xl font-bold text-gray-900">Property Analyzer</h1>
          <p className="text-gray-600 mt-1">Analyze cash flow, cap rate, and return on investment</p>
        </div>
        
        {results && (
          <button
            onClick={saveScenario}
            className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiSave} className="w-4 h-4" />
            <span>Save Scenario</span>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rent
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
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                    placeholder="200000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Down Payment
                  </label>
                  <input
                    type="number"
                    value={formData.downPayment}
                    onChange={(e) => handleInputChange('downPayment', e.target.value)}
                    placeholder="40000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                    placeholder="6.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Expenses</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Taxes (Annual)
                  </label>
                  <input
                    type="number"
                    value={formData.propertyTaxes}
                    onChange={(e) => handleInputChange('propertyTaxes', e.target.value)}
                    placeholder="3000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance (Annual)
                  </label>
                  <input
                    type="number"
                    value={formData.insurance}
                    onChange={(e) => handleInputChange('insurance', e.target.value)}
                    placeholder="1200"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance (%)
                  </label>
                  <input
                    type="number"
                    value={formData.maintenance}
                    onChange={(e) => handleInputChange('maintenance', e.target.value)}
                    placeholder="8"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Management (%)
                  </label>
                  <input
                    type="number"
                    value={formData.management}
                    onChange={(e) => handleInputChange('management', e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vacancy (%)
                  </label>
                  <input
                    type="number"
                    value={formData.vacancy}
                    onChange={(e) => handleInputChange('vacancy', e.target.value)}
                    placeholder="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Monthly Expenses
                </label>
                <input
                  type="number"
                  value={formData.otherExpenses}
                  onChange={(e) => handleInputChange('otherExpenses', e.target.value)}
                  placeholder="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={calculateAnalysis}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
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
                    <p className={`text-2xl font-bold ${results.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                      <span className="font-medium">Total Return</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatPercent(results.totalReturn)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Monthly Rent</span>
                    <span className="font-medium text-green-600">{formatCurrency(results.monthlyRent)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Mortgage Payment</span>
                    <span className="font-medium text-red-600">-{formatCurrency(results.monthlyMortgage)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Property Taxes</span>
                    <span className="font-medium text-red-600">-{formatCurrency(results.monthlyTaxes)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Insurance</span>
                    <span className="font-medium text-red-600">-{formatCurrency(results.monthlyInsurance)}</span>
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
                  
                  {results.otherExpenses > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Other Expenses</span>
                      <span className="font-medium text-red-600">-{formatCurrency(results.otherExpenses)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-3 border-t-2 border-gray-200 mt-4">
                    <span className="font-semibold text-gray-900">Net Cash Flow</span>
                    <span className={`font-bold text-lg ${results.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                        <span className={`font-medium ${scenario.results.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
    </div>
  )
}

export default PropertyAnalyzer