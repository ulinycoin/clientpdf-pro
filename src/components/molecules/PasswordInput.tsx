import React, { useState } from 'react';
import { Eye, EyeOff, Key, RefreshCw } from 'lucide-react';
import type { PasswordStrength } from '../../types/protect.types';

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onGenerate?: () => void;
  strength?: PasswordStrength | null;
  placeholder?: string;
  showStrength?: boolean;
  showGenerator?: boolean;
  required?: boolean;
  className?: string;
}

const getStrengthColor = (score: number) => {
  switch (score) {
    case 0:
    case 1:
      return 'text-red-500';
    case 2:
      return 'text-orange-500';
    case 3:
      return 'text-yellow-500';
    case 4:
      return 'text-green-500';
    default:
      return 'text-gray-400';
  }
};

const getStrengthText = (score: number) => {
  switch (score) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Strong';
    case 4:
      return 'Very Strong';
    default:
      return '';
  }
};

const getStrengthBarWidth = (score: number) => {
  return `${(score / 4) * 100}%`;
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChange,
  onGenerate,
  strength,
  placeholder = 'Enter password',
  showStrength = false,
  showGenerator = false,
  required = false,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-semibold text-gray-900 dark:text-white">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Key className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-seafoam-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />

        {/* Right Side Controls */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
          {/* Generate Password Button */}
          {showGenerator && onGenerate && (
            <button
              type="button"
              onClick={handleGenerate}
              className="p-1 text-gray-400 hover:text-seafoam-500 transition-colors duration-200"
              title="Generate secure password"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}

          {/* Toggle Visibility Button */}
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="p-1 text-gray-400 hover:text-seafoam-500 transition-colors duration-200"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Password Strength Indicator */}
      {showStrength && strength && value && (
        <div className="space-y-2">
          {/* Strength Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                strength.score <= 1
                  ? 'bg-red-500'
                  : strength.score === 2
                  ? 'bg-orange-500'
                  : strength.score === 3
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: getStrengthBarWidth(strength.score) }}
            />
          </div>

          {/* Strength Text */}
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${getStrengthColor(strength.score)}`}>
              {getStrengthText(strength.score)}
            </span>
            {!strength.isValid && (
              <span className="text-xs text-red-500">
                Minimum 6 characters required
              </span>
            )}
          </div>

          {/* Feedback */}
          {strength.feedback.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Suggestions to improve password strength:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                {strength.feedback.map((feedback, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 flex-shrink-0" />
                    {feedback}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Password Requirements Info */}
      {showStrength && !value && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Password should contain:</p>
          <ul className="space-y-0.5 ml-2">
            <li>• At least 8 characters</li>
            <li>• Upper and lowercase letters</li>
            <li>• Numbers</li>
            <li>• Special characters (!@#$%^&*)</li>
          </ul>
        </div>
      )}
    </div>
  );
};