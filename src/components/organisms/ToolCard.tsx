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
  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '32px',
    textAlign: 'center' as const,
    position: 'relative' as const,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  }

  const hoverStyle = !disabled ? {
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      borderColor: '#3b82f6',
    }
  } : {}

  return (
    <div
      style={cardStyle}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          e.currentTarget.style.borderColor = '#3b82f6'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          e.currentTarget.style.borderColor = '#e5e7eb'
        }
      }}
      className={className}
    >
      {/* Badge */}
      {(badge || comingSoon) && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          zIndex: 10
        }}>
          <div style={{
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 500,
            borderRadius: '9999px',
            background: comingSoon ? '#fed7aa' : '#bbf7d0',
            color: comingSoon ? '#c2410c' : '#166534',
            border: `1px solid ${comingSoon ? '#fdba74' : '#86efac'}`
          }}>
            {comingSoon ? 'Soon' : badge}
          </div>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 5 }}>
        {/* Icon */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          {typeof icon === 'string' ? (
            <span style={{
              fontSize: '48px',
              filter: disabled ? 'grayscale(1)' : 'none',
              transition: 'transform 0.2s'
            }}>
              {icon}
            </span>
          ) : (
            <div style={{
              width: '48px',
              height: '48px',
              color: disabled ? '#9ca3af' : '#3b82f6',
              transition: 'color 0.2s'
            }}>
              {icon}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: disabled ? '#9ca3af' : '#111827',
            margin: 0,
            transition: 'color 0.2s'
          }}>
            {title}
          </h3>
          
          <p style={{
            fontSize: '14px',
            lineHeight: 1.5,
            color: disabled ? '#9ca3af' : '#6b7280',
            margin: 0,
            transition: 'color 0.2s'
          }}>
            {description}
          </p>
        </div>

        {/* Hover Effect Arrow */}
        {!disabled && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            opacity: 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none'
          }}
          className="hover-arrow">
            <div style={{
              width: '24px',
              height: '24px',
              background: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '12px', height: '12px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Disabled Overlay */}
        {disabled && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(243, 244, 246, 0.5)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              background: 'white',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#6b7280',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              {comingSoon ? 'Coming Soon' : 'Disabled'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ToolCard
