import React from 'react'

const CurrencyInput = ({
  value,
  onChange,
  placeholder = '0',
  className = '',
  prefix = '$',
  ...props
}) => {
  // Format the value as currency for display
  const formatAsCurrency = (val) => {
    if (!val) return ''
    
    // Remove non-numeric characters
    const numericValue = val.toString().replace(/[^\d.]/g, '')
    
    // Format with commas
    const parts = numericValue.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    
    return parts.join('.')
  }

  // Handle changes to input
  const handleChange = (e) => {
    let inputValue = e.target.value
    
    // Remove currency symbol and commas
    inputValue = inputValue.replace(new RegExp(`\\${prefix}|,`, 'g'), '')
    
    // Allow only numbers and decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(inputValue) || inputValue === '') {
      onChange(inputValue)
    }
  }

  // Format for display
  const displayValue = value ? `${prefix}${formatAsCurrency(value)}` : ''

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder ? `${prefix}${placeholder}` : ''}
      className={className}
      {...props}
    />
  )
}

export default CurrencyInput