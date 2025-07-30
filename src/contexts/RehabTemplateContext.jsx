import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const RehabTemplateContext = createContext({})

export const useRehabTemplate = () => {
  const context = useContext(RehabTemplateContext)
  if (!context) {
    throw new Error('useRehabTemplate must be used within RehabTemplateProvider')
  }
  return context
}

export const RehabTemplateProvider = ({ children }) => {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Default template for Indianapolis
  const defaultIndianapolisTemplate = {
    city: 'Indianapolis',
    state: 'IN',
    line_items: {
      'Kitchen - Full Replacement': 8000,
      'Kitchen - Paint Cabinets': 1500,
      'Kitchen - Appliance Package': 1500,
      'Kitchen - Countertops (Laminate)': 600,
      'Kitchen - Countertops (Granite)': 1500,
      'Kitchen - Countertops (Sprayed)': 500,
      'Bathroom - Full Replacement': 3500,
      'Bathroom - Vanity, Toilet, Mirror & Light': 1000,
      'Bathroom - Spray Tub': 500,
      'Flooring - Vinyl Plank (per sqft)': 3,
      'Flooring - Carpet (per sqft)': 2,
      'Interior Paint - Full House (per sqft)': 1.25,
      'Windows - Replacement (each)': 150,
      'Roof - Replacement': 7500,
      'HVAC - New System': 4500,
      'Plumbing - Rough-in + Finish': 8000,
      'Electrical - Rough-in + Finish': 8000,
      'Doors - Interior (each)': 150,
      'Doors - Exterior (each)': 350,
      'Driveway - Full Replacement': 3500,
      'Garage - New Door': 1500,
      'Foundation - Repair': 5000,
      'Exterior Paint': 3500,
      'Miscellaneous': 2000
    }
  }

  // Initialize with default template
  useEffect(() => {
    if (user && templates.length === 0) {
      setTemplates([{ ...defaultIndianapolisTemplate, id: 'default-indy' }])
    }
  }, [user])

  // Create a new template
  const createTemplate = async (templateData) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      const newTemplate = {
        ...templateData,
        id: `template-${Date.now()}`,
        user_id: user.id
      }

      setTemplates(prev => [...prev, newTemplate])
      return { data: newTemplate, error: null }
    } catch (err) {
      console.error('Error creating template:', err)
      return { data: null, error: err.message }
    }
  }

  // Update a template
  const updateTemplate = async (id, updates) => {
    try {
      setTemplates(prev => 
        prev.map(template => 
          template.id === id ? { ...template, ...updates } : template
        )
      )
      return { data: updates, error: null }
    } catch (err) {
      console.error('Error updating template:', err)
      return { data: null, error: err.message }
    }
  }

  // Delete a template
  const deleteTemplate = async (id) => {
    try {
      setTemplates(prev => prev.filter(template => template.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Error deleting template:', err)
      return { error: err.message }
    }
  }

  // Get template by city
  const getTemplateByCity = (cityName) => {
    return templates.find(template => 
      template.city.toLowerCase() === cityName.toLowerCase()
    )
  }

  const fetchTemplates = async () => {
    // Mock function for compatibility
    setLoading(false)
  }

  const value = {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateByCity,
    fetchTemplates,
    defaultIndianapolisTemplate
  }

  return (
    <RehabTemplateContext.Provider value={value}>
      {children}
    </RehabTemplateContext.Provider>
  )
}