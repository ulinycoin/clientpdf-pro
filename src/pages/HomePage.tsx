import React, { useState } from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import ToolCard from '../components/ToolCard'
import MergePDF from '../components/MergePDF'

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
      // Check if we have files to merge
      if (selectedFiles && selectedFiles.length > 0) {
        setAppState('tool')
      } else {
        alert('Please select PDF files first using the "Choose Files" button above.')
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

  // Show tool interface
  if (appState === 'tool' && activeTool === 'merge' && selectedFiles) {
    return (
      <div className="app">
        <Header />
        <div className="container">
          <MergePDF 
            files={selectedFiles}
            onClose={handleBackToHome}
          />
        </div>
      </div>
    )
  }

  // Show home page
  return (
    <div className="home-page">
      <Header />
      
      <HeroSection onFilesSelected={handleFilesSelected} />
      
      <section className="tools-section">
        <div className="container">
          {hasFiles && (
            <div className="mb-32 text-center">
              <p className="text-base mb-8">
                📁 {selectedFiles!.length} file(s) selected
              </p>
              {pdfFileCount > 0 && (
                <p className="text-sm" style={{ color: '#059669' }}>
                  ✓ {pdfFileCount} PDF file{pdfFileCount > 1 ? 's' : ''} ready for processing
                </p>
              )}
              {pdfFileCount === 0 && (
                <p className="text-sm" style={{ color: '#DC2626' }}>
                  ⚠️ No PDF files found. Please select PDF files for processing.
                </p>
              )}
            </div>
          )}
          
          <div className="grid grid-2">
            <ToolCard
              icon="🔗"
              title="Merge"
              description="Combine multiple PDF files"
              onClick={() => handleToolClick('merge')}
              disabled={pdfFileCount < 1}
            />
            
            <ToolCard
              icon="✂️"
              title="Split"
              description="Extract pages from PDF"
              onClick={() => handleToolClick('split')}
              disabled={true}
            />
            
            <ToolCard
              icon="🗜️"
              title="Compress"
              description="Reduce PDF file size"
              onClick={() => handleToolClick('compress')}
              disabled={true}
            />
            
            <ToolCard
              icon="🖼️"
              title="Images"
              description="Convert images to PDF"
              onClick={() => handleToolClick('images')}
              disabled={true}
            />
          </div>
          
          {!hasFiles && (
            <div className="mt-32 text-center">
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Select files above to start processing
              </p>
            </div>
          )}
          
          {activeTool && appState === 'home' && (
            <div className="mt-32 text-center">
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Selected tool: <strong>{activeTool}</strong>
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage