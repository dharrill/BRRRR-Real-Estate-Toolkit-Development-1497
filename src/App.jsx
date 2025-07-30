import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PropertyProvider } from './contexts/PropertyContext'
import { RehabTemplateProvider } from './contexts/RehabTemplateContext'
import { RehabEstimatorProvider } from './contexts/RehabEstimatorContext'
import { MAOCalculatorProvider } from './contexts/MAOCalculatorContext'
import { ToastProvider } from './contexts/ToastContext'
import { useAuth } from './contexts/AuthContext'
import { useProperty } from './contexts/PropertyContext'
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

// Protected route component that checks if a property is selected
const PropertyProtectedRoute = ({ children }) => {
  const { currentProperty } = useProperty()
  
  if (!currentProperty) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

const AppContent = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background-DEFAULT flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <PropertyProvider>
      <RehabTemplateProvider>
        <RehabEstimatorProvider>
          <MAOCalculatorProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Property-specific tools protected by PropertyProtectedRoute */}
                <Route
                  path="/rehab-estimator"
                  element={
                    <PropertyProtectedRoute>
                      <RehabEstimator />
                    </PropertyProtectedRoute>
                  }
                />
                <Route
                  path="/mao-calculator"
                  element={
                    <PropertyProtectedRoute>
                      <MAOCalculator />
                    </PropertyProtectedRoute>
                  }
                />
                <Route
                  path="/property-analyzer"
                  element={
                    <PropertyProtectedRoute>
                      <PropertyAnalyzer />
                    </PropertyProtectedRoute>
                  }
                />
                <Route
                  path="/compounding"
                  element={
                    <PropertyProtectedRoute>
                      <PowerOfCompounding />
                    </PropertyProtectedRoute>
                  }
                />
                <Route
                  path="/freedom-calculator"
                  element={
                    <PropertyProtectedRoute>
                      <FreedomCalculator />
                    </PropertyProtectedRoute>
                  }
                />
                <Route
                  path="/loan-comparison"
                  element={
                    <PropertyProtectedRoute>
                      <LoanComparison />
                    </PropertyProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          </MAOCalculatorProvider>
        </RehabEstimatorProvider>
      </RehabTemplateProvider>
    </PropertyProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App