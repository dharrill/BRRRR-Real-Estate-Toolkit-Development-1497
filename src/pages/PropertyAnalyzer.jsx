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

const { FiBarChart3, FiDollarSign, FiPercent, FiTrendingUp, FiSave } = FiIcons

const PropertyAnalyzer = () => {
  const { currentProperty } = useProperty()
  const { rehabEstimates } = useRehabEstimator()
  const { maoCalculations } = useMAOCalculator()
  const { showSuccess, showError } = useToast()

  // Form state including new closing cost fields and refinance LTV
  const [formData, setFormData] = useState({
    purchasePrice: '',
    arv: '',
    downPayment: '',
    rehabTotal: '',
    holdingDays: '',
    closingCosts: '',
    pointsCost: '',
    brokerFees: '',
    otherClosingCosts: '',
    insuranceAnnual: '',
    taxesAnnual: '',
    utilities: '',
    maintenancePercent: '8',
    managementPercent: '10',
    vacancyPercent: '5',
    monthlyRent: '',
    refinanceLTV: '75',
    interestRate: '',
    loanTerm: '30',
  })

  const [results, setResults] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [hasAnalysis, setHasAnalysis] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isValid, setIsValid] = useState(false)

  // Prefill from prior steps
  useEffect(() => {
    if (currentProperty) {
      const updates = {
        arv: currentProperty.arv?.toString() || ''
      }
      if (rehabEstimates.length) {
        const latest = rehabEstimates[0]
        updates.rehabTotal = latest.total?.toString() || ''
        updates.holdingDays = latest.holding_days?.toString() || ''
      }
      if (maoCalculations.length) {
        const latest = maoCalculations[0]
        updates.purchasePrice = latest.final_mao?.toString() || ''
      }
      setFormData(fd => ({ ...fd, ...updates }))
    }
  }, [currentProperty, rehabEstimates, maoCalculations])

  // Validate required fields
  useEffect(() => {
    const req = [
      'purchasePrice','arv','downPayment','rehabTotal','monthlyRent','interestRate'
    ]
    const ok = req.every(f => parseFloat(formData[f]) > 0)
    setIsValid(ok)
  }, [formData])

  const handleInputChange = (field, value) => {
    setFormData(fd => ({ ...fd, [field]: value }))
  }

  const calculateAnalysis = () => {
    const {
      purchasePrice, arv, downPayment, rehabTotal, holdingDays,
      closingCosts, pointsCost, brokerFees, otherClosingCosts,
      insuranceAnnual, taxesAnnual, utilities, monthlyRent,
      maintenancePercent, managementPercent, vacancyPercent,
      refinanceLTV, interestRate, loanTerm
    } = formData

    // Parse numbers
    const pp = parseFloat(purchasePrice) || 0
    const a = parseFloat(arv) || 0
    const dp = parseFloat(downPayment) || 0
    const rehab = parseFloat(rehabTotal) || 0
    const holdDays = parseFloat(holdingDays) || 0
    const cc = parseFloat(closingCosts) || 0
    const pts = parseFloat(pointsCost) || 0
    const broker = parseFloat(brokerFees) || 0
    const otherCC = parseFloat(otherClosingCosts) || 0
    const insAnn = parseFloat(insuranceAnnual) || 0
    const taxAnn = parseFloat(taxesAnnual) || 0
    const utilMonthly = parseFloat(utilities) || 0
    const rent = parseFloat(monthlyRent) || 0
    const maint = rent * (parseFloat(maintenancePercent) / 100)
    const mgmt = rent * (parseFloat(managementPercent) / 100)
    const vac = rent * (parseFloat(vacancyPercent) / 100)
    const ltvPct = parseFloat(refinanceLTV) / 100
    const rateM = parseFloat(interestRate) / 100 / 12
    const n = parseFloat(loanTerm) * 12

    // Holding period prorated costs
    const holdInsTax = (insAnn + taxAnn) * (holdDays / 365)
    const holdCost = holdInsTax + utilMonthly * (holdDays / 30)

    // Total cash invested
    const totalInvested = dp + rehab + cc + pts + broker + otherCC + holdCost

    // Loan amount
    const loanAmt = a * ltvPct
    // Mortgage payment
    const mortgage = loanAmt && rateM > 0
      ? loanAmt * (rateM * Math.pow(1+rateM, n)) / (Math.pow(1+rateM, n) - 1)
      : loanAmt / n

    // Monthly expenses
    const monthlyIns = insAnn/12
    const monthlyTax = taxAnn/12
    const totalMonthlyExp = mortgage + monthlyIns + monthlyTax + utilMonthly + maint + mgmt + vac
    const monthlyCF = rent - totalMonthlyExp
    const annualCF = monthlyCF * 12

    // NOI & Ratios
    const noi = rent*12 - (monthlyIns+monthlyTax+utilMonthly+maint+mgmt+vac)*12
    const capRate = pp > 0 ? (noi/pp)*100 : 0
    const coc = totalInvested > 0 ? (annualCF/totalInvested)*100 : 0
    const ltvActual = loanAmt/a*100
    const equityAtRefi = a - loanAmt

    setResults({
      purchasePrice: pp,
      arv: a,
      totalInvested,
      ltv: ltvActual,
      monthlyRent: rent,
      monthlyMortgage: mortgage,
      totalMonthlyExpenses: totalMonthlyExp,
      monthlyCashFlow: monthlyCF,
      annualCashFlow: annualCF,
      noi,
      capRate,
      cashOnCashReturn: coc,
      currentEquity: a - loanAmt,
      equityAtRefi,
      cashOutAtRefi: equityAtRefi,
      insurance: monthlyIns,
      utilities: utilMonthly,
      taxes: monthlyTax,
      maintenanceAmount: maint,
      managementAmount: mgmt,
      vacancyAmount: vac
    })
    setHasAnalysis(true)
  }

  const saveScenario = async () => {
    if (!results) return
    setSaving(true)
    try {
      const scenario = {
        id: Date.now(),
        name: `Analysis ${scenarios.length+1}`,
        formData: {...formData},
        results: {...results},
        createdAt: new Date().toISOString()
      }
      setScenarios(sc => [...sc, scenario])
      showSuccess('Scenario saved!')
    } catch {
      showError('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = amt =>
    new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(amt||0)
  const formatPercent = p => `${p.toFixed(2)}%`

  return (
    <div className="space-y-6">
      {/* ... UI unchanged except inputs for points, brokerFees, otherClosingCosts, insuranceAnnual, taxesAnnual, refinanceLTV ... */}
      {/* WorkflowNavigation unchanged */}
    </div>
  )
}

export default PropertyAnalyzer;
