import React, { useState } from 'react';
import { PasswordInputProps } from '../../types/security.types';
import pdfPasswordService from '../../services/pdfPasswordService';

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter password',
  required = false,
  showStrength = false,
  disabled = false,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState<{ isValid: boolean; strength?: string; suggestions?: string[] } | null>(null);

  // Validate password when showStrength is enabled
  React.useEffect(() => {
    if (showStrength && value) {
      const result = pdfPasswordService.validatePassword(value);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, [value, showStrength]);

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getStrengthColor = (strength?: string) => {
    switch (strength) {
      case 'strong': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'weak': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getStrengthBg = (strength?: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'weak': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthWidth = (strength?: string) => {
    switch (strength) {
      case 'strong': return 'w-full';
      case 'medium': return 'w-2/3';
      case 'weak': return 'w-1/3';
      default: return 'w-0';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handlePasswordChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${validation && !validation.isValid && value ? 'border-red-300' : ''}
          `}
        />
        
        {/* Toggle Password Visibility Button */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Password Strength Indicator */}
      {showStrength && value && (
        <div className="space-y-2">
          {/* Strength Bar */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Strength:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getStrengthBg(validation?.strength)} ${getStrengthWidth(validation?.strength)}`}
              />
            </div>
            <span className={`text-xs font-medium ${getStrengthColor(validation?.strength)}`}>
              {validation?.strength ? validation.strength.charAt(0).toUpperCase() + validation.strength.slice(1) : 'Weak'}
            </span>
          </div>

          {/* Validation Messages */}
          {validation?.suggestions && validation.suggestions.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-800 mb-1">Password recommendations:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validation.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Message */}
          {validation?.isValid && (
            <div className="flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Password meets security requirements
            </div>
          )}
        </div>
      )}

      {/* Error Message for Invalid Password */}
      {validation && !validation.isValid && value && !showStrength && (
        <p className="text-sm text-red-600">Password does not meet security requirements</p>
      )}
    </div>
  );
};

export default PasswordInput;