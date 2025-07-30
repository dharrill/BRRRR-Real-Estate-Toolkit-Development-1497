import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useProperty } from './PropertyContext'

const RehabEstimatorContext = createContext({})

export const useRehabEstimator = () => {
  const context = useContext(RehabEstimatorContext)
  if (!context) {
    throw new Error('useRehabEstimator must be used within RehabEstimatorProvider')
  }
  return context
}

export const RehabEstimatorProvider = ({ children }) => {
  const { user } = useAuth()
  const { currentProperty } = useProperty()
  const [rehabEstimates, setRehabEstimates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // City templates for rehab costs
  const cityTemplates = {
    'Atlanta, GA': {
      'Kitchen': 14000,
      'Bathrooms': 7500,
      'Flooring': 5500,
      'Interior Paint': 3200,
      'Exterior Paint': 4500,
      'Roof': 11000,
      'HVAC': 6500,
      'Electrical': 4200,
      'Plumbing': 3800,
      'Windows': 450,
      'Doors': 280,
      'Landscaping': 3000,
      'Garage': 2500,
      'Driveway': 4000,
      'Foundation': 8000,
      'Permits': 1800,
    },
    // Add more city templates here
  }

  // Fetch rehab estimates for the current property
  const fetchRehabEstimates = async () => {
    if (!user || !currentProperty) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('rehab_estimates')
        .select('*')
        .eq('property_id', currentProperty.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setRehabEstimates(data || [])
    } catch (err) {
      console.error('Error fetching rehab estimates:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Save a rehab estimate
  const saveRehabEstimate = async (estimateData) => {
    if (!user || !currentProperty) {
      return { error: 'User or property not found' }
    }
    
    try {
      const { data, error } = await supabase
        .from('rehab_estimates')
        .insert([{
          property_id: currentProperty.id,
          user_id: user.id,
          ...estimateData
        }])
        .select()
      
      if (error) throw error
      
      // Update local state
      setRehabEstimates(prev => [data[0], ...prev])
      
      return { data: data[0], error: null }
    } catch (err) {
      console.error('Error saving rehab estimate:', err)
      return { data: null, error: err.message }
    }
  }

  // Update a rehab estimate
  const updateRehabEstimate = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('rehab_estimates')
        .update(updates)
        .eq('id', id)
        .select()
      
      if (error) throw error
      
      // Update local state
      setRehabEstimates(prev =>
        prev.map(estimate => estimate.id === id ? data[0] : estimate)
      )
      
      return { data: data[0], error: null }
    } catch (err) {
      console.error('Error updating rehab estimate:', err)
      return { data: null, error: err.message }
    }
  }

  // Delete a rehab estimate
  const deleteRehabEstimate = async (id) => {
    try {
      const { error } = await supabase
        .from('rehab_estimates')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      setRehabEstimates(prev => prev.filter(estimate => estimate.id !== id))
      
      return { error: null }
    } catch (err) {
      console.error('Error deleting rehab estimate:', err)
      return { error: err.message }
    }
  }

  // Load estimates when property changes
  useEffect(() => {
    if (currentProperty) {
      fetchRehabEstimates()
    } else {
      setRehabEstimates([])
    }
  }, [currentProperty])

  const value = {
    rehabEstimates,
    loading,
    error,
    cityTemplates,
    fetchRehabEstimates,
    saveRehabEstimate,
    updateRehabEstimate,
    deleteRehabEstimate,
  }

  return (
    <RehabEstimatorContext.Provider value={value}>
      {children}
    </RehabEstimatorContext.Provider>
  )
}