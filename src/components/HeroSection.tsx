import React, { useRef } from 'react'

interface HeroSectionProps {
  onFilesSelected: (files: FileList) => void
}

const HeroSection: React.FC<HeroSectionProps> = ({ onFilesSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      onFilesSelected(files)
    }
  }

  return (
    <section className="hero">
      <div className="container">
        <h1 className="hero-title text-xl">Free PDF Tools</h1>
        <p className="hero-subtitle text-base">
          Private • Fast • Simple
        </p>
        
        <div className="file-input">
          <button 
            onClick={handleFileSelect}
            className="btn btn-primary"
          >
            Choose Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            multiple
            onChange={handleFileChange}
          />
        </div>
      </div>
    </section>
  )
}

export default HeroSection