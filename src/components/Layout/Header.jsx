import React from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'

const { FiHome, FiUser, FiLogOut, FiMenu } = FiIcons

const Header = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <motion.header 
      className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <SafeIcon icon={FiMenu} className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiHome} className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">The Brrrrothas</h1>
              <p className="text-xs text-gray-500 -mt-1">Toolkit</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="hidden sm:flex items-center space-x-2">
                <SafeIcon icon={FiUser} className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}

export default Header