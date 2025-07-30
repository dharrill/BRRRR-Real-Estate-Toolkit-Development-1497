import React, { useState, useEffect } from 'react'

const NumberInput = ({ 
  value, 
  onChange, 
  placeholder = '', 
  className = '', 
  min,
  max,
  step,
  prefix = '',
  suffix = '',
  allowDecimals = true,
  showThousandsSeparator = true,
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Format number with thousands separator
  const formatNumber = (num) => {
    if (!num && num !== 0) return ''
    
    const number = parseFloat(num)
    if (isNaN(number)) return ''
    
    if (showThousandsSeparator) {
      return number.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: allowDecimals ? 10 : 0
      })
    }
    
    return allowDecimals ? number.toString() : Math.floor(number).toString()
  }

  // Parse display value to number
  const parseDisplayValue = (str) => {
    if (!str) return ''
    
    // Remove prefix, suffix, and thousands separators
    let cleanStr = str.toString()
    if (prefix) cleanStr = cleanStr.replace(prefix, '')
    if (suffix) cleanStr = cleanStr.replace(suffix, '')
    cleanStr = cleanStr.replace(/,/g, '')
    
    // Handle decimal places
    if (!allowDecimals) {
      cleanStr = cleanStr.replace(/\./g, '')
    }
    
    const number = parseFloat(cleanStr)
    return isNaN(number) ? '' : number
  }

  // Update display value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      if (value === '' || value === null || value === undefined) {
        setDisplayValue('')
      } else {
        const formatted = formatNumber(value)
        setDisplayValue(formatted ? `${prefix}${formatted}${suffix}` : '')
      }
    }
  }, [value, prefix, suffix, isFocused, showThousandsSeparator, allowDecimals])

  const handleChange = (e) => {
    const inputValue = e.target.value
    let cleanValue = inputValue

    // Remove prefix and suffix for processing
    if (prefix) cleanValue = cleanValue.replace(prefix, '')
    if (suffix) cleanValue = cleanValue.replace(suffix, '')

    // Allow only numbers, decimal point, and commas
    const regex = allowDecimals ? /^[0-9,]*\.?[0-9]*$/ : /^[0-9,]*$/
    
    if (cleanValue === '' || regex.test(cleanValue)) {
      setDisplayValue(inputValue)
      
      // Parse and send the actual number value
      const numericValue = parseDisplayValue(inputValue)
      
      // Apply min/max constraints
      let finalValue = numericValue
      if (typeof min === 'number' && numericValue < min) finalValue = min
      if (typeof max === 'number' && numericValue > max) finalValue = max
      
      onChange(finalValue)
    }
  }

  const handleFocus = (e) => {
    setIsFocused(true)
    
    // Show raw number without formatting when focused
    if (value || value === 0) {
      const rawValue = parseDisplayValue(displayValue)
      setDisplayValue(rawValue.toString())
    }
    
    if (props.onFocus) props.onFocus(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    
    // Reformat with thousands separator when blurred
    if (value || value === 0) {
      const formatted = formatNumber(value)
      setDisplayValue(formatted ? `${prefix}${formatted}${suffix}` : '')
    } else {
      setDisplayValue('')
    }
    
    if (props.onBlur) props.onBlur(e)
  }

  const handleKeyDown = (e) => {
    // Prevent leading zeros (except for decimal values like 0.5)
    if (e.key === '0' && displayValue === '' && !allowDecimals) {
      e.preventDefault()
      return
    }
    
    if (props.onKeyDown) props.onKeyDown(e)
  }

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder ? `${prefix}${placeholder}${suffix}` : ''}
      className={className}
      min={min}
      max={max}
      step={step}
      {...props}
    />
  )
}

export default NumberInput