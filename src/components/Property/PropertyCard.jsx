import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useProperty } from '../../contexts/PropertyContext'
import { useRehabEstimator } from '../../contexts/RehabEstimatorContext'
import { useMAOCalculator } from '../../contexts/MAOCalculatorContext'

const { FiMapPin, FiDollarSign, FiTrendingUp, FiEdit3, FiTrash2, FiShare2, FiPlay, FiArrowRight } = FiIcons

const PropertyCard = ({ property, onEdit, onDelete, onShare }) => {
  const navigate = useNavigate()
  const { currentProperty, setCurrentProperty } = useProperty()
  const { rehabEstimates } = useRehabEstimator()
  const { maoCalculations } = useMAOCalculator()

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'analyzing':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_contract':
        return 'bg-blue-100 text-blue-800'
      case 'rehab':
        return 'bg-orange-100 text-orange-800'
      case 'rented':
        return 'bg-green-100 text-green-800'
      case 'sold':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Determine workflow progress
  const getWorkflowStatus = () => {
    // Check if property is selected and get its data
    const isSelected = currentProperty?.id === property.id
    const hasRehab = isSelected && rehabEstimates.length > 0
    const hasMAO = isSelected && maoCalculations.length > 0

    if (!hasRehab) {
      return {
        nextStep: 'rehab-estimator',
        nextLabel: 'Start Analysis',
        icon: FiPlay,
        description: 'Begin with rehab estimate'
      }
    } else if (!hasMAO) {
      return {
        nextStep: 'mao-calculator',
        nextLabel: 'Calculate MAO',
        icon: FiArrowRight,
        description: 'Determine maximum offer'
      }
    } else {
      return {
        nextStep: 'property-analyzer',
        nextLabel: 'Full Analysis',
        icon: FiArrowRight,
        description: 'Complete property analysis'
      }
    }
  }

  const handleStartAnalysis = (e) => {
    e.stopPropagation()
    
    // Select the property first
    setCurrentProperty(property)
    
    // Small delay to ensure property is selected before navigating
    setTimeout(() => {
      // Get next step and navigate
      const workflowStatus = getWorkflowStatus()
      navigate(`/${workflowStatus.nextStep}`)
    }, 100)
  }

  const isSelected = currentProperty?.id === property.id
  const workflowStatus = getWorkflowStatus()

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-sm border ${
        isSelected ? 'border-primary border-2' : 'border-gray-200'
      } p-6 hover:shadow-md transition-shadow duration-200`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-DEFAULT mb-1">
            {property.address || 'Untitled Property'}
          </h3>
          <div className="flex items-center text-text-secondary text-sm mb-2">
            <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-1" />
            <span>{property.city}, {property.state}</span>
          </div>
          <span
            className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(
              property.status
            )}`}
          >
            {property.status || 'Draft'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onShare(property)
            }}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary-light/10 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiShare2} className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(property)
            }}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary-light/10 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiEdit3} className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(property)
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-text-secondary text-sm mb-1">
            <SafeIcon icon={FiDollarSign} className="w-4 h-4 mr-1" />
            <span>Purchase Price</span>
          </div>
          <p className="text-lg font-semibold text-text-DEFAULT">
            {formatCurrency(property.purchase_price)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-text-secondary text-sm mb-1">
            <SafeIcon icon={FiTrendingUp} className="w-4 h-4 mr-1" />
            <span>ARV</span>
          </div>
          <p className="text-lg font-semibold text-text-DEFAULT">
            {formatCurrency(property.arv)}
          </p>
        </div>
      </div>

      {/* Workflow Action Button */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={handleStartAnalysis}
          className="w-full bg-primary text-white py-2.5 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2 font-medium"
        >
          <SafeIcon icon={workflowStatus.icon} className="w-4 h-4" />
          <span>{workflowStatus.nextLabel}</span>
        </button>
        <p className="text-xs text-gray-500 text-center mt-1">
          {workflowStatus.description}
        </p>
      </div>

      {property.monthly_cash_flow && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Monthly Cash Flow:</span>
            <span
              className={`font-semibold ${
                property.monthly_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(property.monthly_cash_flow)}
            </span>
          </div>
        </div>
      )}

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-primary font-medium">Currently Selected</span>
        </div>
      )}
    </motion.div>
  )
}

export default PropertyCard