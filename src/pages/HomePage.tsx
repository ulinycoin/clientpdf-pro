import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Link, 
  Scissors, 
  Archive, 
  ImageIcon,
  ArrowLeft,
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react'

import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import ToolCard from '../components/organisms/ToolCard'
import MergePDF from '../components/MergePDF'
import Button from '../components/atoms/Button'
import Card from '../components/atoms/Card'

type Tool = 'merge' | 'split' | 'compress' | 'images'
type AppState = 'home' | 'tool'

const HomePage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [activeTool, setActiveTool] = useState<Tool | null>(null)
  const [appState, setAppState] = useState<AppState>('home')

  const handleFilesSelected = (files: FileList) => {
    setSelectedFiles(files)
    console.log('Files selected:', Array.from(files).map(f => f.name))
  }

  const handleToolClick = (tool: Tool) => {
    setActiveTool(tool)
    
    if (tool === 'merge') {
      if (selectedFiles && selectedFiles.length > 0) {
        setAppState('tool')
      } else {
        // TODO: Show toast notification instead of alert
        alert('Please select PDF files first using the file upload area above.')
      }
    } else {
      // TODO: Implement other tools
      alert(`${tool} functionality coming soon!`)
    }
  }

  const handleBackToHome = () => {
    setAppState('home')
    setActiveTool(null)
    // Keep selected files for potential reuse
  }

  const hasFiles = selectedFiles && selectedFiles.length > 0
  const pdfFileCount = hasFiles ? 
    Array.from(selectedFiles).filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    ).length : 0

  const imageFileCount = hasFiles ?
    Array.from(selectedFiles).filter(file => 
      file.type.startsWith('image/') || 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
    ).length : 0

  // Tool interface view
  if (appState === 'tool' && activeTool === 'merge' && selectedFiles) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-app py-8">
          <MergePDF 
            files={selectedFiles}
            onClose={handleBackToHome}
          />
        </div>
      </div>
    )
  }

  // Home page view
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection onFilesSelected={handleFilesSelected} />
      
      {/* Tools Section */}
      <section className="py-16 lg:py-24">
        <div className="container-app">
          {/* File Status */}
          <AnimatePresence>
            {hasFiles && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mb-12"
              >
                <Card className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Files Ready for Processing
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-6 text-sm">
                    {pdfFileCount > 0 && (
                      <div className="flex items-center space-x-2 text-green-700">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">
                          {pdfFileCount} PDF file{pdfFileCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {imageFileCount > 0 && (
                      <div className="flex items-center space-x-2 text-blue-700">
                        <ImageIcon className="w-4 h-4" />
                        <span className="font-medium">
                          {imageFileCount} image{imageFileCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-gray-600">
                      <span>
                        Total: {selectedFiles!.length} file{selectedFiles!.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {pdfFileCount === 0 && imageFileCount === 0 && (
                    <div className="flex items-center justify-center mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                      <span className="text-amber-800 text-sm">
                        No PDF or image files detected. Please select compatible files.
                      </span>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tools Grid */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Tool
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional PDF tools powered by your browser. 
              Select a tool below to get started.
            </p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <ToolCard
              icon={Link}
              title="Merge PDFs"
              description="Combine multiple PDF files into one document"
              onClick={() => handleToolClick('merge')}
              disabled={pdfFileCount < 2}
              badge={pdfFileCount >= 2 ? 'Ready' : undefined}
            />
            
            <ToolCard
              icon={Scissors}
              title="Split PDF"
              description="Extract specific pages from PDF files"
              onClick={() => handleToolClick('split')}
              disabled={true}
              comingSoon={true}
            />
            
            <ToolCard
              icon={Archive}
              title="Compress"
              description="Reduce PDF file size while maintaining quality"
              onClick={() => handleToolClick('compress')}
              disabled={true}
              comingSoon={true}
            />
            
            <ToolCard
              icon={ImageIcon}
              title="Images to PDF"
              description="Convert images into a single PDF document"
              onClick={() => handleToolClick('images')}
              disabled={imageFileCount === 0}
              badge={imageFileCount > 0 ? 'Ready' : undefined}
              comingSoon={imageFileCount === 0}
            />
          </motion.div>
          
          {/* No Files State */}
          {!hasFiles && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center mt-16 p-8"
            >
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No Files Selected
                </h3>
                <p className="text-gray-600 mb-6">
                  Upload PDF or image files above to unlock all tools and start processing.
                </p>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  ↑ Go to File Upload
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage
