import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import NavigationButton from '../components/Common/NavigationButton'

const { FiCreditCard, FiDollarSign, FiPercent, FiTrendingDown, FiPlus, FiMinus, FiHome } = FiIcons

const LoanComparison = () => {
  const [loans, setLoans] = useState([
    {
      id: 1,
      name: 'Loan Option 1',
      loanAmount: '160000',
      interestRate: '6.5',
      termYears: '30',
      ltvRatio: '80',
      points: '0',
      fees: '2000',
      downPayment: '40000',
      rateBuyDown: '0',
      buyDownCost: '0'
    }
  ])

  const [hasComparison, setHasComparison] = useState(false)

  const addLoan = () => {
    const newLoan = {
      id: Date.now(),
      name: `Loan Option ${loans.length + 1}`,
      loanAmount: '',
      interestRate: '',
      termYears: '30',
      ltvRatio: '',
      points: '0',
      fees: '',
      downPayment: '',
      rateBuyDown: '0',
      buyDownCost: '0'
    }
    setLoans([...loans, newLoan])
    setHasComparison(true)
  }

  const removeLoan = (id) => {
    if (loans.length > 1) {
      setLoans(loans.filter(loan => loan.id !== id))
    }
  }

  const updateLoan = (id, field, value) => {
    setLoans(loans.map(loan => 
      loan.id === id ? { ...loan, [field]: value } : loan
    ))
    setHasComparison(true)
  }

  const calculateLoanMetrics = (loan) => {
    const principal = parseFloat(loan.loanAmount) || 0
    const annualRate = parseFloat(loan.interestRate) || 0
    const years = parseFloat(loan.termYears) || 30
    const points = parseFloat(loan.points) || 0
    const fees = parseFloat(loan.fees) || 0
    const downPayment = parseFloat(loan.downPayment) || 0
    const rateBuyDown = parseFloat(loan.rateBuyDown) || 0
    const buyDownCost = parseFloat(loan.buyDownCost) || 0

    // Adjusted rate after buy-down
    const adjustedRate = Math.max(0, annualRate - rateBuyDown)
    const monthlyRate = adjustedRate / 100 / 12
    const numPayments = years * 12

    // Monthly payment calculation
    const monthlyPayment = principal > 0 && monthlyRate > 0 ? 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1) : 0

    // Total costs
    const totalPayments = monthlyPayment * numPayments
    const totalInterest = totalPayments - principal
    const pointsCost = principal * (points / 100)
    const totalUpfrontCosts = downPayment + pointsCost + fees + buyDownCost
    const totalLoanCost = totalPayments + pointsCost + fees + buyDownCost

    // Break-even analysis for rate buy-down
    const originalMonthlyPayment = principal > 0 && annualRate > 0 ? 
      (principal * (annualRate / 100 / 12) * Math.pow(1 + (annualRate / 100 / 12), numPayments)) / 
      (Math.pow(1 + (annualRate / 100 / 12), numPayments) - 1) : 0
    const monthlySavings = originalMonthlyPayment - monthlyPayment
    const breakEvenMonths = monthlySavings > 0 ? buyDownCost / monthlySavings : Infinity

    return {
      monthlyPayment,
      totalPayments,
      totalInterest,
      pointsCost,
      totalUpfrontCosts,
      totalLoanCost,
      breakEvenMonths,
      monthlySavings,
      adjustedRate
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
          <h1 className="text-2xl font-bold text-gray-900">Loan Comparison Tool</h1>
          <p className="text-gray-600 mt-1">Compare different loan options and analyze costs</p>
        </div>
        <button
          onClick={addLoan}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Loan Option</span>
        </button>
      </div>

      {/* Loan Input Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loans.map((loan, index) => {
          const metrics = calculateLoanMetrics(loan)
          return (
            <motion.div
              key={loan.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{loan.name}</h2>
                {loans.length > 1 && (
                  <button
                    onClick={() => removeLoan(loan.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <SafeIcon icon={FiMinus} className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Basic Loan Details */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Amount
                    </label>
                    <input
                      type="number"
                      value={loan.loanAmount}
                      onChange={(e) => updateLoan(loan.id, 'loanAmount', e.target.value)}
                      placeholder="160000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.125"
                      value={loan.interestRate}
                      onChange={(e) => updateLoan(loan.id, 'interestRate', e.target.value)}
                      placeholder="6.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Term (Years)
                    </label>
                    <select
                      value={loan.termYears}
                      onChange={(e) => updateLoan(loan.id, 'termYears', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="15">15 Years</option>
                      <option value="20">20 Years</option>
                      <option value="25">25 Years</option>
                      <option value="30">30 Years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LTV Ratio (%)
                    </label>
                    <input
                      type="number"
                      value={loan.ltvRatio}
                      onChange={(e) => updateLoan(loan.id, 'ltvRatio', e.target.value)}
                      placeholder="80"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points (%)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={loan.points}
                      onChange={(e) => updateLoan(loan.id, 'points', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closing Fees
                    </label>
                    <input
                      type="number"
                      value={loan.fees}
                      onChange={(e) => updateLoan(loan.id, 'fees', e.target.value)}
                      placeholder="2000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Down Payment
                  </label>
                  <input
                    type="number"
                    value={loan.downPayment}
                    onChange={(e) => updateLoan(loan.id, 'downPayment', e.target.value)}
                    placeholder="40000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Rate Buy-Down Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Rate Buy-Down (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Reduction (%)
                      </label>
                      <input
                        type="number"
                        step="0.125"
                        value={loan.rateBuyDown}
                        onChange={(e) => updateLoan(loan.id, 'rateBuyDown', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buy-Down Cost
                      </label>
                      <input
                        type="number"
                        value={loan.buyDownCost}
                        onChange={(e) => updateLoan(loan.id, 'buyDownCost', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Metrics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Loan Analysis</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Monthly Payment:</span>
                    <p className="font-semibold text-lg text-blue-600">
                      {formatCurrency(metrics.monthlyPayment)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Interest:</span>
                    <p className="font-semibold text-red-600">
                      {formatCurrency(metrics.totalInterest)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Upfront Costs:</span>
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(metrics.totalUpfrontCosts)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Loan Cost:</span>
                    <p className="font-semibold text-purple-600">
                      {formatCurrency(metrics.totalLoanCost)}
                    </p>
                  </div>
                </div>

                {parseFloat(loan.rateBuyDown) > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Buy-Down Analysis</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Monthly Savings:</span>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(metrics.monthlySavings)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Break-Even:</span>
                        <p className="font-semibold text-blue-600">
                          {metrics.breakEvenMonths === Infinity ? 'N/A' : `${Math.round(metrics.breakEvenMonths)} months`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Comparison Table */}
      {loans.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Loan Option</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Monthly Payment</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Total Interest</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Upfront Costs</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Total Cost</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Effective Rate</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan, index) => {
                  const metrics = calculateLoanMetrics(loan)
                  const isLowest = {
                    payment: metrics.monthlyPayment === Math.min(...loans.map(l => calculateLoanMetrics(l).monthlyPayment)),
                    interest: metrics.totalInterest === Math.min(...loans.map(l => calculateLoanMetrics(l).totalInterest)),
                    upfront: metrics.totalUpfrontCosts === Math.min(...loans.map(l => calculateLoanMetrics(l).totalUpfrontCosts)),
                    total: metrics.totalLoanCost === Math.min(...loans.map(l => calculateLoanMetrics(l).totalLoanCost))
                  }

                  return (
                    <tr key={loan.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{loan.name}</td>
                      <td className={`text-right py-3 px-4 font-semibold ${isLowest.payment ? 'text-green-600 bg-green-50' : ''}`}>
                        {formatCurrency(metrics.monthlyPayment)}
                      </td>
                      <td className={`text-right py-3 px-4 font-semibold ${isLowest.interest ? 'text-green-600 bg-green-50' : ''}`}>
                        {formatCurrency(metrics.totalInterest)}
                      </td>
                      <td className={`text-right py-3 px-4 font-semibold ${isLowest.upfront ? 'text-green-600 bg-green-50' : ''}`}>
                        {formatCurrency(metrics.totalUpfrontCosts)}
                      </td>
                      <td className={`text-right py-3 px-4 font-semibold ${isLowest.total ? 'text-green-600 bg-green-50' : ''}`}>
                        {formatCurrency(metrics.totalLoanCost)}
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatPercent(metrics.adjustedRate)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            * Green highlighting indicates the best option for each metric
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Loan Comparison Tips</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Consider All Costs</h4>
            <ul className="text-blue-700 space-y-1">
              <li>• Don't just compare monthly payments</li>
              <li>• Factor in points, fees, and closing costs</li>
              <li>• Consider your holding period</li>
              <li>• Evaluate break-even points for buy-downs</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Rate Buy-Down Strategy</h4>
            <ul className="text-blue-700 space-y-1">
              <li>• Only worthwhile if you hold long-term</li>
              <li>• Calculate break-even period carefully</li>
              <li>• Consider opportunity cost of upfront cash</li>
              <li>• Compare to investing the buy-down cost</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Button */}
      {hasComparison && (
        <NavigationButton
          nextStep="dashboard"
          nextLabel="Back to Dashboard"
          description="Return to your property dashboard to start analyzing another property"
          icon={FiHome}
          variant="secondary"
        />
      )}
    </div>
  )
}

export default LoanComparison