import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import NumberInput from '../../common/NumberInput'
import * as FiIcons from 'react-icons/fi'
import { useRehabTemplate } from '../../contexts/RehabTemplateContext'
import { useToast } from '../../contexts/ToastContext'

const { FiPlus, FiEdit3, FiTrash2, FiSave, FiX } = FiIcons

const TemplateManager = ({ isOpen, onClose }) => {
  const { templates, createTemplate, updateTemplate, deleteTemplate } = useRehabTemplate()
  const { showSuccess, showError } = useToast()
  const [editingTemplate, setEditingTemplate] = useState(null)

  const handleEditTemplate = (template) => {
    setEditingTemplate({ ...template })
  }

  const handleSaveTemplate = async () => {
    try {
      if (editingTemplate.id) {
        await updateTemplate(editingTemplate.id, {
          city: editingTemplate.city,
          state: editingTemplate.state,
          line_items: editingTemplate.line_items
        })
        showSuccess('Template updated successfully!')
      } else {
        await createTemplate(editingTemplate)
        showSuccess('Template created successfully!')
      }
      setEditingTemplate(null)
    } catch (error) {
      showError('Error saving template')
    }
  }

  const handleDeleteTemplate = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(id)
        showSuccess('Template deleted successfully!')
      } catch (error) {
        showError('Error deleting template')
      }
    }
  }

  const handleAddLineItem = (template) => {
    const updatedTemplate = { ...template }
    updatedTemplate.line_items = { ...updatedTemplate.line_items, 'New Item': 0 }
    setEditingTemplate(updatedTemplate)
  }

  const handleUpdateLineItem = (oldKey, newKey, value) => {
    const updatedTemplate = { ...editingTemplate }
    const newLineItems = { ...updatedTemplate.line_items }
    
    if (oldKey !== newKey) {
      delete newLineItems[oldKey]
    }
    newLineItems[newKey] = parseFloat(value) || 0
    updatedTemplate.line_items = newLineItems
    setEditingTemplate(updatedTemplate)
  }

  const handleDeleteLineItem = (key) => {
    const updatedTemplate = { ...editingTemplate }
    delete updatedTemplate.line_items[key]
    setEditingTemplate(updatedTemplate)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Manage City Templates
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Templates List */}
          {!editingTemplate && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Your Templates</h3>
                <button
                  onClick={() => setEditingTemplate({ city: '', state: '', line_items: {} })}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                  <span>Add Template</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {template.city}, {template.state}
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                        >
                          <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {Object.keys(template.line_items).length} line items
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Total: {formatCurrency(
                        Object.values(template.line_items).reduce((sum, cost) => sum + cost, 0)
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Edit Template Form */}
          {editingTemplate && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingTemplate.id ? 'Edit Template' : 'New Template'}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingTemplate(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiSave} className="w-4 h-4" />
                    <span>Save Template</span>
                  </button>
                </div>
              </div>

              {/* Template Basic Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.city}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Indianapolis"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.state}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="IN"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Line Items</h4>
                  <button
                    onClick={() => handleAddLineItem(editingTemplate)}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                  >
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2 text-sm font-medium text-gray-700 pb-2 border-b border-gray-200">
                    <div className="col-span-3">Item Name</div>
                    <div>Cost</div>
                    <div>Actions</div>
                  </div>
                  {Object.entries(editingTemplate.line_items).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-5 gap-2 items-center">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => handleUpdateLineItem(key, e.target.value, value)}
                        className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <NumberInput
                        value={value}
                        onChange={(newValue) => handleUpdateLineItem(key, key, newValue)}
                        prefix="$"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleDeleteLineItem(key)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default TemplateManager