import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useProperty } from './PropertyContext'

const MAOCalculatorContext = createContext({})

export const useMAOCalculator = () => {
  const context = useContext(MAOCalculatorContext)
  if (!context) {
    throw new Error('useMAOCalculator must be used within MAOCalculatorProvider')
  }
  return context
}

export const MAOCalculatorProvider = ({ children }) => {
  const { user } = useAuth()
  const { currentProperty } = useProperty()
  const [maoCalculations, setMaoCalculations] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch MAO calculations for current property
  const fetchMaoCalculations = async () => {
    if (!user || !currentProperty) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('mao_calculations_brrrr')
        .select('*')
        .eq('property_id', currentProperty.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMaoCalculations(data || [])
    } catch (err) {
      console.error('Error fetching MAO calculations:', err)
    } finally {
      setLoading(false)
    }
  }

  // Save MAO calculation
  const saveMaoCalculation = async (calculationData) => {
    if (!user || !currentProperty) {
      return { error: 'User or property not found' }
    }

    try {
      // Check if table exists, if not create it
      const { data: existingCalculation } = await supabase
        .from('mao_calculations_brrrr')
        .select('id')
        .eq('property_id', currentProperty.id)
        .eq('user_id', user.id)
        .limit(1)

      const dataToSave = {
        property_id: currentProperty.id,
        user_id: user.id,
        arv: calculationData.arv,
        rehab_cost: calculationData.rehab_cost,
        selected_percentage: calculationData.selected_percentage,
        mao_70: calculationData.mao_70,
        mao_75: calculationData.mao_75,
        mao_80: calculationData.mao_80,
        mao_custom: calculationData.mao_custom,
        final_mao: calculationData.final_mao,
        created_at: new Date().toISOString()
      }

      let result
      if (existingCalculation && existingCalculation.length > 0) {
        // Update existing calculation
        result = await supabase
          .from('mao_calculations_brrrr')
          .update(dataToSave)
          .eq('property_id', currentProperty.id)
          .eq('user_id', user.id)
          .select()
      } else {
        // Insert new calculation
        result = await supabase
          .from('mao_calculations_brrrr')
          .insert([dataToSave])
          .select()
      }

      const { data, error } = result
      if (error) throw error

      // Update local state
      await fetchMaoCalculations()
      return { data: data[0], error: null }
    } catch (err) {
      console.error('Error saving MAO calculation:', err)
      return { data: null, error: err.message }
    }
  }

  // Load calculations when property changes
  useEffect(() => {
    if (currentProperty) {
      fetchMaoCalculations()
    } else {
      setMaoCalculations([])
    }
  }, [currentProperty])

  const value = {
    maoCalculations,
    loading,
    saveMaoCalculation,
    fetchMaoCalculations,
  }

  return (
    <MAOCalculatorContext.Provider value={value}>
      {children}
    </MAOCalculatorContext.Provider>
  )
}