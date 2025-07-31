import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useProperty } from './PropertyContext'

const MAOContext = createContext({})

export const useMAOCalculator = () => {
  const ctx = useContext(MAOContext)
  if (!ctx) throw new Error('useMAOCalculator must be inside MAOProvider')
  return ctx
}

export const MAOProvider = ({ children }) => {
  const { user } = useAuth()
  const { currentProperty } = useProperty()
  const [maoCalculations, setMaoCalculations] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch saved MAO entries for this property
  const fetchMAOs = async (propertyId) => {
    if (!user || !propertyId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('mao_calculations_burr')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setMaoCalculations(data || [])
    } catch (err) {
      console.error('Error fetching MAOs:', err)
    } finally {
      setLoading(false)
    }
  }

  // Save a new MAO calculation
  const saveMAO = async ({ rehabCost, arv, selectedPercent, customPercent, finalMAO }) => {
    if (!user || !currentProperty) return { error: 'Missing context' }
    setLoading(true)
    try {
      const payload = {
        user_id: user.id,
        property_id: currentProperty.id,
        rehab_cost: rehabCost,
        arv: arv,
        selected_percent: selectedPercent === 'custom' ? null : selectedPercent,
        custom_percent: selectedPercent === 'custom' ? customPercent : null,
        final_mao: finalMAO,
      }
      const { data, error } = await supabase
        .from('mao_calculations_burr')
        .insert([payload])
        .single()
      if (error) throw error
      // prepend new entry
      setMaoCalculations((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      console.error('Error saving MAO:', err)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch when currentProperty changes
  useEffect(() => {
    if (currentProperty?.id) {
      fetchMAOs(currentProperty.id)
    } else {
      setMaoCalculations([])
    }
  }, [currentProperty])

  return (
    <MAOContext.Provider
      value={{ maoCalculations, loading, fetchMAOs, saveMAO }}
    >
      {children}
    </MAOContext.Provider>
  )
}
