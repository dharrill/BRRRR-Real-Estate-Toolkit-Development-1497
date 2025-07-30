import React, { useState, useRef } from 'react'
import NumberInput from './NumberInput'

const WorkflowInput = ({
  label,
  value,
  onChange,
  onSave,
  type = 'text',
  placeholder = '',
  prefix = '',
  suffix = '',
  required = false,
  className = '',
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value || '')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  const handleChange = (newValue) => {
    setLocalValue(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleBlur()
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (onSave && localValue !== value) {
      onSave(localValue)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  if (type === 'number') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <NumberInput
          ref={inputRef}
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          prefix={prefix}
          suffix={suffix}
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
          {...props}
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        ref={inputRef}
        type={type}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        {...props}
      />
    </div>
  )
}

export default WorkflowInput