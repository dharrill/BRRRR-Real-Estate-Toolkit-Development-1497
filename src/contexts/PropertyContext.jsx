import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const PropertyContext = createContext({})

export const useProperty = () => {
  const context = useContext(PropertyContext)
  if (!context) {
    throw new Error('useProperty must be used within PropertyProvider')
  }
  return context
}

export const PropertyProvider = ({ children }) => {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [currentProperty, setCurrentProperty] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchProperties = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('properties_brrrr')  // Updated table name
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProperty = async (propertyData) => {
    if (!user) return { error: 'User not authenticated' }
    
    try {
      const { data, error } = await supabase
        .from('properties_brrrr')  // Updated table name
        .insert([{ ...propertyData, user_id: user.id }])
        .select()
        .single()
      
      if (error) throw error
      setProperties(prev => [data, ...prev])
      return { data, error: null }
    } catch (error) {
      console.error('Error creating property:', error)
      return { data: null, error }
    }
  }

  const updateProperty = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('properties_brrrr')  // Updated table name
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      setProperties(prev => prev.map(prop => prop.id === id ? data : prop))
      
      if (currentProperty?.id === id) {
        setCurrentProperty(data)
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error updating property:', error)
      return { data: null, error }
    }
  }

  const deleteProperty = async (id) => {
    try {
      const { error } = await supabase
        .from('properties_brrrr')  // Updated table name
        .delete()
        .eq('id', id)
      
      if (error) throw error
      setProperties(prev => prev.filter(prop => prop.id !== id))
      
      if (currentProperty?.id === id) {
        setCurrentProperty(null)
      }
      
      return { error: null }
    } catch (error) {
      console.error('Error deleting property:', error)
      return { error }
    }
  }

  useEffect(() => {
    if (user) {
      fetchProperties()
    } else {
      setProperties([])
      setCurrentProperty(null)
    }
  }, [user])

  const value = {
    properties,
    currentProperty,
    setCurrentProperty,
    loading,
    createProperty,
    updateProperty,
    deleteProperty,
    fetchProperties,
  }

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  )
}