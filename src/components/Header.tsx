import React from 'react'
import { motion } from 'framer-motion'
import { FileText, HelpCircle } from 'lucide-react'
import Button from './atoms/Button'

const Header: React.FC = () => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="container-app py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-blue-600 rounded-xl flex items-center justify-center shadow-medium">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">
                ClientPDF Pro
              </h1>
              <p className="text-xs text-gray-500 -mt-1">
                Private & Fast
              </p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              icon={HelpCircle}
              onClick={() => {
                // TODO: Scroll to FAQ section
                console.log('FAQ clicked')
              }}
            >
              FAQ
            </Button>
            
            <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>100% Private</span>
            </div>
          </nav>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
