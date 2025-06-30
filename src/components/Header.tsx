import React from 'react'
// import { motion } from 'framer-motion'
// import { FileText, HelpCircle } from 'lucide-react'
import Button from './atoms/Button'

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container-app py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-blue-600 rounded-xl flex items-center justify-center shadow-medium">
              <span className="text-white text-xl">📄</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">
                ClientPDF Pro
              </h1>
              <p className="text-xs text-gray-500 -mt-1">
                Private & Fast
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('FAQ clicked')
              }}
            >
              ❓ FAQ
            </Button>
            
            <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>100% Private</span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
