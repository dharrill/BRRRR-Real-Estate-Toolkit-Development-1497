import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiArrowRight, FiHome } = FiIcons

const NavigationButton = ({ 
  nextStep, 
  nextLabel, 
  description, 
  icon = FiArrowRight, 
  variant = 'primary',
  onClick = null
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(`/${nextStep}`)
    }
  }

  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white'
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white'
      default:
        return 'bg-primary hover:bg-primary-dark text-white'
    }
  }

  return (
    <motion.div
      className="mt-8 pt-6 border-t border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Step</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      
      <button
        onClick={handleClick}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md ${getButtonStyles()}`}
      >
        <span>{nextLabel}</span>
        <SafeIcon icon={icon} className="w-5 h-5" />
      </button>
    </motion.div>
  )
}

export default NavigationButton