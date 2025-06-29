import React from 'react'

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="flex justify-between items-center">
          <div className="text-lg">ClientPDF Pro</div>
          <a 
            href="#faq" 
            className="btn btn-secondary text-sm"
            style={{ padding: '8px 16px' }}
          >
            FAQ
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header