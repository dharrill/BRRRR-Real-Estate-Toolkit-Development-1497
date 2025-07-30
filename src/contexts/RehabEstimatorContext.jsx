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

  // Store for rehab estimates - structured by property ID
  const [estimatesStore, setEstimatesStore] = useState({})

  // Fetch rehab estimates for the current property
  const fetchRehabEstimates = async () => {
    if (!user || !currentProperty) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Check if we have estimates in Supabase
      const { data, error } = await supabase
        .from('rehab_estimates')
        .select('*')
        .eq('property_id', currentProperty.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // If we have data from Supabase, use it
      if (data && data.length > 0) {
        // Parse JSON fields if they're stored as strings
        const parsedData = data.map(estimate => ({
          ...estimate,
          line_items: typeof estimate.line_items === 'string' 
            ? JSON.parse(estimate.line_items) 
            : estimate.line_items
        }))
        
        setRehabEstimates(parsedData)
        
        // Update the local store
        setEstimatesStore(prev => ({
          ...prev,
          [currentProperty.id]: parsedData
        }))
      } 
      // If no data in Supabase, check our local store
      else if (estimatesStore[currentProperty.id]) {
        setRehabEstimates(estimatesStore[currentProperty.id])
      }
      // If nothing anywhere, set empty array
      else {
        setRehabEstimates([])
      }
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
      // Prepare data for insertion
      const dataToSave = {
        property_id: currentProperty.id,
        user_id: user.id,
        input_mode: estimateData.input_mode,
        total_amount: estimateData.total_amount,
        selected_city: estimateData.selected_city,
        contingency_percentage: estimateData.contingency_percentage,
        line_items: estimateData.line_items,
        subtotal: estimateData.subtotal,
        total: estimateData.total,
        created_at: new Date().toISOString()
      }

      // Save to Supabase
      const { data, error } = await supabase
        .from('rehab_estimates')
        .insert([dataToSave])
        .select()

      if (error) throw error

      // Update local state
      const newEstimate = data[0]
      const updatedEstimates = [newEstimate, ...rehabEstimates]
      setRehabEstimates(updatedEstimates)

      // Update local store
      setEstimatesStore(prev => ({
        ...prev,
        [currentProperty.id]: updatedEstimates
      }))

      return { data: newEstimate, error: null }
    } catch (err) {
      console.error('Error saving rehab estimate:', err)
      return { data: null, error: err.message }
    }
  }

  // Update a rehab estimate
  const updateRehabEstimate = async (id, updates) => {
    try {
      // Update in Supabase
      const { data, error } = await supabase
        .from('rehab_estimates')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      // Update local state
      const updatedEstimates = rehabEstimates.map(estimate => 
        estimate.id === id ? data[0] : estimate
      )
      setRehabEstimates(updatedEstimates)

      // Update local store
      setEstimatesStore(prev => ({
        ...prev,
        [currentProperty.id]: updatedEstimates
      }))

      return { data: data[0], error: null }
    } catch (err) {
      console.error('Error updating rehab estimate:', err)
      return { data: null, error: err.message }
    }
  }

  // Delete a rehab estimate
  const deleteRehabEstimate = async (id) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('rehab_estimates')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Update local state
      const updatedEstimates = rehabEstimates.filter(estimate => estimate.id !== id)
      setRehabEstimates(updatedEstimates)

      // Update local store
      setEstimatesStore(prev => ({
        ...prev,
        [currentProperty.id]: updatedEstimates
      }))

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