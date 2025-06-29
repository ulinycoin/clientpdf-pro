import React, { useState } from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import ToolCard from '../components/ToolCard'

type Tool = 'merge' | 'split' | 'compress' | 'images'

const HomePage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [activeTool, setActiveTool] = useState<Tool | null>(null)

  const handleFilesSelected = (files: FileList) => {
    setSelectedFiles(files)
    console.log('Files selected:', Array.from(files).map(f => f.name))
  }

  const handleToolClick = (tool: Tool) => {
    setActiveTool(tool)
    console.log('Tool selected:', tool)
    
    // TODO: Implement tool functionality
    switch (tool) {
      case 'merge':
        alert('Merge PDF functionality coming soon!')
        break
      case 'split':
        alert('Split PDF functionality coming soon!')
        break
      case 'compress':
        alert('Compress PDF functionality coming soon!')
        break
      case 'images':
        alert('Images to PDF functionality coming soon!')
        break
    }
  }

  return (
    <div className="home-page">
      <Header />
      
      <HeroSection onFilesSelected={handleFilesSelected} />
      
      <section className="tools-section">
        <div className="container">
          {selectedFiles && (
            <div className="mb-32 text-center">
              <p className="text-sm" style={{ color: '#6B7280' }}>
                {selectedFiles.length} file(s) selected
              </p>
            </div>
          )}
          
          <div className="grid grid-2">
            <ToolCard
              icon="🔗"
              title="Merge"
              description="Combine multiple PDF files"
              onClick={() => handleToolClick('merge')}
            />
            
            <ToolCard
              icon="✂️"
              title="Split"
              description="Extract pages from PDF"
              onClick={() => handleToolClick('split')}
            />
            
            <ToolCard
              icon="🗜️"
              title="Compress"
              description="Reduce PDF file size"
              onClick={() => handleToolClick('compress')}
            />
            
            <ToolCard
              icon="🖼️"
              title="Images"
              description="Convert images to PDF"
              onClick={() => handleToolClick('images')}
            />
          </div>
          
          {activeTool && (
            <div className="mt-32 text-center">
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Active tool: <strong>{activeTool}</strong>
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage