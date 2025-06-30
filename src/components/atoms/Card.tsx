import React from 'react'
import { motion } from 'framer-motion'

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

  const MotionComponent = onClick || interactive ? motion.div : motion.div

  return (
    <MotionComponent
      className={classes}
      onClick={disabled ? undefined : onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={
        hover && !disabled
          ? { y: -2, transition: { duration: 0.2 } }
          : {}
      }
    >
      {children}
    </MotionComponent>
  )
}

export default Card
