import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useProperty } from '../../contexts/PropertyContext'

const { FiHome, FiTool, FiDollarSign, FiBarChart3, FiTrendingUp, FiTarget, FiCreditCard, FiX } = FiIcons

const Sidebar = ({ isOpen, onClose }) => {
  const { currentProperty } = useProperty()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome, always: true },
  ]

  // Only add these links if a property is selected
  const propertyTools = [
    { name: 'Rehab Estimator', href: '/rehab-estimator', icon: FiTool },
    { name: 'MAO Calculator', href: '/mao-calculator', icon: FiDollarSign },
    { name: 'Property Analyzer', href: '/property-analyzer', icon: FiBarChart3 },
    { name: 'Power of Compounding', href: '/compounding', icon: FiTrendingUp },
    { name: 'Freedom Calculator', href: '/freedom-calculator', icon: FiTarget },
    { name: 'Loan Comparison', href: '/loan-comparison', icon: FiCreditCard },
  ]

  if (currentProperty) {
    navigation.push(...propertyTools)
  }

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 lg:relative lg:translate-x-0"
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <div className="flex items-center space-x-3">
              <img
                src="/fulllogo_transparent.png"
                alt="The Brrrrothas Logo"
                className="h-8"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <span className="font-semibold text-text-DEFAULT">The Brrrrothas</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <SafeIcon icon={FiX} className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-light/10 text-primary border-r-2 border-primary'
                      : 'text-text-secondary hover:bg-gray-50 hover:text-text-DEFAULT'
                  }`
                }
              >
                <SafeIcon icon={item.icon} className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}

            {!currentProperty && propertyTools.length > 0 && (
              <div className="mt-4 p-4 bg-background-DEFAULT rounded-lg">
                <p className="text-sm text-text-secondary">
                  Select a property from the dashboard to access property tools
                </p>
              </div>
            )}
          </nav>

          {/* Current Property Display */}
          {currentProperty && (
            <div className="px-4 py-3 border-t border-b border-gray-200">
              <div className="text-xs text-text-secondary mb-1">Current Property:</div>
              <div className="font-medium text-sm text-primary truncate">
                {currentProperty.address || 'Unnamed Property'}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {currentProperty.city}, {currentProperty.state}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-text-secondary text-center">
              <p>© 2024 The Brrrrothas Toolkit</p>
              <p className="mt-1">Real Estate Investment Tools</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Sidebar