import React from 'react'
import {useNavigate} from 'react-router-dom'
import {motion} from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const {FiArrowLeft, FiArrowRight, FiCheck} = FiIcons

const WorkflowNavigation = ({
  backTo,
  backLabel,
  nextTo,
  nextLabel,
  canProceed = true,
  onBack,
  onNext,
  isLast = false
}) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backTo) {
      navigate(`/${backTo}`)
    }
  }

  const handleNext = () => {
    if (onNext) {
      onNext()
    } else if (nextTo && canProceed) {
      navigate(`/${nextTo}`)
    }
  }

  return (
    <motion.div 
      className="mt-8 pt-6 border-t border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex justify-between items-center">
        {backTo || onBack ? (
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
            <span>{backLabel || 'Back'}</span>
          </button>
        ) : (
          <div></div>
        )}

        {(nextTo || onNext) && (
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              canProceed
                ? isLast
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>{nextLabel || (isLast ? 'Finish & View Summary' : 'Proceed')}</span>
            <SafeIcon icon={isLast ? FiCheck : FiArrowRight} className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default WorkflowNavigation