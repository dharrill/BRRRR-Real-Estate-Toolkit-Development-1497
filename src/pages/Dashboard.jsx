import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useProperty } from '../contexts/PropertyContext'
import PropertyCard from '../components/Property/PropertyCard'
import PropertyForm from '../components/Property/PropertyForm'

const { FiPlus, FiBarChart3, FiTrendingUp, FiDollarSign, FiHome } = FiIcons

const Dashboard = () => {
  const { properties, createProperty, updateProperty, deleteProperty } = useProperty()
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)

  const handleCreateProperty = async (propertyData) => {
    await createProperty(propertyData)
    setShowPropertyForm(false)
  }

  const handleUpdateProperty = async (propertyData) => {
    await updateProperty(editingProperty.id, propertyData)
    setEditingProperty(null)
  }

  const handleEditProperty = (property) => {
    setEditingProperty(property)
  }

  const handleDeleteProperty = async (property) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await deleteProperty(property.id)
    }
  }

  const handleShareProperty = (property) => {
    // Generate shareable link
    const shareUrl = `${window.location.origin}/property/${property.id}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Property link copied to clipboard!')
    })
  }

  const totalProperties = properties.length
  const totalValue = properties.reduce((sum, prop) => sum + (prop.arv || 0), 0)
  const avgCashFlow = properties.length > 0 
    ? properties.reduce((sum, prop) => sum + (prop.monthly_cash_flow || 0), 0) / properties.length 
    : 0

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your real estate investment portfolio</p>
        </div>
        
        <button
          onClick={() => setShowPropertyForm(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{totalProperties}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiHome} className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Monthly Cash Flow</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgCashFlow)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiDollarSign} className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Portfolio ROI</p>
              <p className="text-2xl font-bold text-gray-900">12.5%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiBarChart3} className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Properties Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Properties</h2>
        
        {properties.length === 0 ? (
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiHome} className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first investment property</p>
            <button
              onClick={() => setShowPropertyForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Property
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PropertyCard
                  property={property}
                  onEdit={handleEditProperty}
                  onDelete={handleDeleteProperty}
                  onShare={handleShareProperty}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Property Form Modal */}
      {showPropertyForm && (
        <PropertyForm
          onSave={handleCreateProperty}
          onCancel={() => setShowPropertyForm(false)}
        />
      )}

      {editingProperty && (
        <PropertyForm
          property={editingProperty}
          onSave={handleUpdateProperty}
          onCancel={() => setEditingProperty(null)}
        />
      )}
    </div>
  )
}

export default Dashboard