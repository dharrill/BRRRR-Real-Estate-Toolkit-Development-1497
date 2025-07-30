import React, { createContext, useContext, useState } from 'react'
import Toast from '../components/Common/Toast'

const ToastContext = createContext({})

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now()
    const newToast = { id, message, type, duration }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showSuccess = (message, duration) => showToast(message, 'success', duration)
  const showError = (message, duration) => showToast(message, 'error', duration)
  const showInfo = (message, duration) => showToast(message, 'info', duration)

  const value = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    removeToast
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
            style={{ 
              transform: `translateY(${index * 80}px)`,
              transition: 'transform 0.3s ease'
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              isVisible={true}
              onClose={() => removeToast(toast.id)}
              duration={0} // We handle duration in showToast
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}