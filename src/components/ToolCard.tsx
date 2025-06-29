import React from 'react'

interface ToolCardProps {
  icon: string
  title: string
  description: string
  onClick: () => void
  disabled?: boolean
}

const ToolCard: React.FC<ToolCardProps> = ({ 
  icon, 
  title, 
  description, 
  onClick, 
  disabled = false 
}) => {
  return (
    <div 
      className={`tool-card ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <span className="tool-icon">{icon}</span>
      <h3 className="tool-title text-lg">{title}</h3>
      <p className="tool-description text-sm">{description}</p>
    </div>
  )
}

export default ToolCard