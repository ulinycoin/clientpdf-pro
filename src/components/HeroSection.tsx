import React from 'react'
// import { motion } from 'framer-motion'
// import { Shield, Zap, Heart } from 'lucide-react'
import FileUploadZone from './molecules/FileUploadZone'

interface HeroSectionProps {
  onFilesSelected: (files: FileList) => void
}

const HeroSection: React.FC<HeroSectionProps> = ({ onFilesSelected }) => {
  const features = [
    { icon: '🛡️', text: 'Private', subtitle: '100% Client-side' },
    { icon: '⚡', text: 'Fast', subtitle: 'Instant Processing' },
    { icon: '❤️', text: 'Simple', subtitle: 'No Signup Required' },
  ]

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container-app">
        {/* Hero Text */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Free <span className="text-gradient">PDF Tools</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Professional PDF processing that respects your privacy. 
            No uploads, no tracking, just powerful tools that work entirely in your browser.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {features.map((feature) => (
              <div
                key={feature.text}
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft border border-gray-200 hover:shadow-medium transition-shadow duration-200"
              >
                <span className="text-lg">{feature.icon}</span>
                <span className="font-medium text-gray-900">{feature.text}</span>
                <span className="text-sm text-gray-500">• {feature.subtitle}</span>
              </div>
            ))}
          </div>
        </div>

        {/* File Upload Zone */}
        <div className="max-w-2xl mx-auto">
          <FileUploadZone 
            onFilesSelected={onFilesSelected}
            accept={{ 
              'application/pdf': ['.pdf'],
              'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            }}
            maxFiles={20}
            maxSize={100 * 1024 * 1024} // 100MB
            multiple={true}
          />
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>No data leaves your device</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Open source & transparent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>No account required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
