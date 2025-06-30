import React from 'react'
// import { motion } from 'framer-motion'
// import { LucideIcon } from 'lucide-react'
import Card from '../atoms/Card'

interface ToolCardProps {
  icon: string | React.ReactNode
  title: string
  description: string
  onClick: () => void
  disabled?: boolean
  badge?: string
  comingSoon?: boolean
  className?: string
}

const ToolCard: React.FC<ToolCardProps> = ({
  icon,
  title,
  description,
  onClick,
  disabled = false,
  badge,
  comingSoon = false,
  className = '',
}) => {
  return (
    <Card
      onClick={disabled ? undefined : onClick}
      interactive={!disabled}
      disabled={disabled}
      className={`
        tool-card relative group
        ${disabled ? 'tool-card-disabled' : 'tool-card-enabled'}
        ${className}
      `}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      
      {/* Badge */}
      {(badge || comingSoon) && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className={`
            px-3 py-1 text-xs font-medium rounded-full
            ${comingSoon 
              ? 'bg-orange-100 text-orange-700 border border-orange-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
            }
          `}>
            {comingSoon ? 'Soon' : badge}
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          {typeof icon === 'string' ? (
            <span className={`
              text-5xl 
              ${disabled ? 'grayscale opacity-50' : 'group-hover:scale-110 transition-transform duration-200'}
            `}>
              {icon}
            </span>
          ) : (
            <div className={`
              w-12 h-12 
              ${disabled 
                ? 'text-gray-400' 
                : 'text-primary-600 group-hover:text-primary-700'
              }
              transition-colors duration-200
            `}>
              {icon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h3 className={`
            text-lg font-semibold
            ${disabled ? 'text-gray-400' : 'text-gray-900 group-hover:text-primary-900'}
            transition-colors duration-200
          `}>
            {title}
          </h3>
          
          <p className={`
            text-sm leading-relaxed
            ${disabled ? 'text-gray-400' : 'text-gray-600'}
            transition-colors duration-200
          `}>
            {description}
          </p>
        </div>

        {/* Hover Effect Arrow */}
        {!disabled && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Disabled Overlay */}
        {disabled && (
          <div className="absolute inset-0 bg-gray-100/50 rounded-xl flex items-center justify-center">
            <div className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-500 shadow-soft">
              {comingSoon ? 'Coming Soon' : 'Disabled'}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default ToolCard
