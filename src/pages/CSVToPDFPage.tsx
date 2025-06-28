import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Legacy CSV to PDF Page - DEPRECATED
 * 
 * This component is now deprecated in favor of EnhancedCSVToPDFPage.
 * All users are automatically redirected to the enhanced version.
 * 
 * @deprecated Use EnhancedCSVToPDFPage instead
 */
export const CSVToPDFPage: React.FC = () => {
  useEffect(() => {
    console.log('🔄 Redirecting from legacy CSV converter to Enhanced version');
  }, []);

  // Automatically redirect to enhanced version
  return <Navigate to="/enhanced-csv-to-pdf" replace />;
};

export default CSVToPDFPage;
