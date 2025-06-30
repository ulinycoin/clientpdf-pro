import React from 'react'
// import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  interactive?: boolean
  disabled?: boolean
  hover?: boolean
}

const Card: React.FC<CardProps> = ({
  children,
  onClick,
  className = '',
  interactive = false,
  disabled = false,
  hover = true,
}) => {
  const baseClasses = 'card'
  
  const interactiveClasses = interactive && !disabled ? 'card-interactive' : ''
  const disabledClasses = disabled ? 'card-disabled' : ''
  
  const classes = [
    baseClasses,
    interactiveClasses,
    disabledClasses,
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  )
}

export default Card
