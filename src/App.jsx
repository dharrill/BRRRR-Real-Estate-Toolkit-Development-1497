import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PropertyProvider } from './contexts/PropertyContext'
import { useAuth } from './contexts/AuthContext'
import AuthForm from './components/Auth/AuthForm'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import RehabEstimator from './pages/RehabEstimator'
import MAOCalculator from './pages/MAOCalculator'
import PropertyAnalyzer from './pages/PropertyAnalyzer'
import PowerOfCompounding from './pages/PowerOfCompounding'
import FreedomCalculator from './pages/FreedomCalculator'
import LoanComparison from './pages/LoanComparison'
import './App.css'

const AppContent = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <PropertyProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rehab-estimator" element={<RehabEstimator />} />
          <Route path="/mao-calculator" element={<MAOCalculator />} />
          <Route path="/property-analyzer" element={<PropertyAnalyzer />} />
          <Route path="/compounding" element={<PowerOfCompounding />} />
          <Route path="/freedom-calculator" element={<FreedomCalculator />} />
          <Route path="/loan-comparison" element={<LoanComparison />} />
        </Routes>
      </Layout>
    </PropertyProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App