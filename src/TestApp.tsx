/**
 * Simple test component to verify everything loads correctly
 */

import React from 'react'

function TestApp() {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui', 
      maxWidth: '800px', 
      margin: '0 auto' 
    }}>
      <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>
        🎉 LocalPDF Pro - Test Mode
      </h1>
      <div style={{ 
        background: '#f0f9ff', 
        padding: '1rem', 
        borderRadius: '8px',
        border: '1px solid #0ea5e9'
      }}>
        <p><strong>✅ React is working!</strong></p>
        <p><strong>✅ TypeScript is working!</strong></p>
        <p><strong>✅ Vite dev server is working!</strong></p>
        <p><strong>✅ No MIME type errors!</strong></p>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h2>Next Steps:</h2>
        <ol>
          <li>Verify this page loads without errors</li>
          <li>Check browser console (F12) for any red errors</li>
          <li>If everything is clean, we'll restore the full app</li>
        </ol>
      </div>
    </div>
  )
}

export default TestApp