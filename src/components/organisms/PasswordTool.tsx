import React, { useState, useEffect } from 'react';
import { PasswordToolProps, PasswordProtectionOptions, PDFSecurityInfo } from '../../types/security.types';
import { PDFProcessingResult } from '../../types';
import { usePasswordProtection } from '../../hooks/usePasswordProtection';
import PasswordForm from '../molecules/PasswordForm';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';
import { downloadBlob, generateFilename } from '../../utils/fileHelpers';

const PasswordTool: React.FC<PasswordToolProps> = ({
  files,
  onComplete,
  onClose,
  className = ''
}) => {
  const [action, setAction] = useState<'protect' | 'remove'>('protect');
  const [securityAnalysis, setSecurityAnalysis] = useState<PDFSecurityInfo | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  
  const {
    protectPDF,
    removePDFPassword,
    isProcessing,
    progress,
    error,
    securityInfo,
    analyzeSecurityInfo,
    clearError,
    reset
  } = usePasswordProtection();

  const currentFile = files[0];

  // Analyze file security on mount
  useEffect(() => {
    if (currentFile) {
      setAnalysisLoading(true);
      analyzeSecurityInfo(currentFile)
        .then(() => {
          // If file is password protected, default to remove mode
          if (securityInfo?.isPasswordProtected) {
            setAction('remove');
          }
        })
        .finally(() => {
          setAnalysisLoading(false);
        });
    }
  }, [currentFile, analyzeSecurityInfo]);

  // Update local analysis when hook updates
  useEffect(() => {
    if (securityInfo) {
      setSecurityAnalysis(securityInfo);
    }
  }, [securityInfo]);

  const handleFormSubmit = async (options: PasswordProtectionOptions) => {
    if (!currentFile) return;

    clearError();
    
    try {
      let result: PDFProcessingResult;
      
      if (options.action === 'protect') {
        result = await protectPDF(currentFile, options);
      } else {
        result = await removePDFPassword(currentFile, options.oldPassword!);
      }

      if (result.success && result.data) {
        // Generate appropriate filename
        const prefix = options.action === 'protect' ? 'protected' : 'unprotected';
        const filename = generateFilename(currentFile.name, prefix);
        
        // Download the file
        downloadBlob(result.data, filename);
        
        // Call completion callback
        onComplete(result);
        
        // Show success message
        console.log(`PDF ${options.action === 'protect' ? 'protection' : 'unprotection'} completed successfully!`);
      }
    } catch (err) {
      console.error('Password operation failed:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleActionChange = (newAction: 'protect' | 'remove') => {
    setAction(newAction);
    clearError();
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">PDF Password Tool</h2>
          <p className="text-gray-600 mt-1">
            Add or remove password protection from your PDF documents
          </p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </div>

      {/* File Info */}
      {currentFile && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Document Information:</h3>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl">📄</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{currentFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(currentFile.size)}
                </p>
              </div>
              {analysisLoading && (
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Analyzing...
                </div>
              )}
            </div>

            {/* Security Status */}
            {securityAnalysis && !analysisLoading && (
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Security Status:</span>
                  <div className="flex items-center">
                    {securityAnalysis.isPasswordProtected ? (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-red-600">Password Protected</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-gray-600">Not Protected</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Privacy Analysis */}
                {securityAnalysis.metadata.hasPersonalInfo && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Privacy Notice</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          This document may contain personal information in metadata.
                        </p>
                        {securityAnalysis.metadata.potentialPrivacyRisks.length > 0 && (
                          <ul className="text-xs text-yellow-600 mt-1 ml-2">
                            {securityAnalysis.metadata.potentialPrivacyRisks.map((risk, index) => (
                              <li key={index}>• {risk}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Action:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Protect Option */}
          <button
            onClick={() => handleActionChange('protect')}
            disabled={isProcessing}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              action === 'protect'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-medium text-gray-900">Add Password Protection</span>
            </div>
            <p className="text-sm text-gray-600">
              Secure your PDF with a password to prevent unauthorized access
            </p>
          </button>

          {/* Remove Option */}
          <button
            onClick={() => handleActionChange('remove')}
            disabled={isProcessing || !securityAnalysis?.isPasswordProtected}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              action === 'remove'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-gray-900">Remove Password Protection</span>
            </div>
            <p className="text-sm text-gray-600">
              Remove existing password protection to make PDF accessible
            </p>
            {!securityAnalysis?.isPasswordProtected && (
              <p className="text-xs text-gray-500 mt-1">
                (Document is not currently password protected)
              </p>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mb-6">
          <ProgressBar
            value={progress}
            animated={true}
            className="mb-2"
          />
          <p className="text-sm text-gray-600 text-center">
            Processing your PDF... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Password Form */}
      <div className="mb-6">
        <PasswordForm
          action={action}
          onSubmit={handleFormSubmit}
          isProcessing={isProcessing}
          error={error}
        />
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-blue-800 font-medium mb-1">How PDF Password Protection Works</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Add Protection:</strong> Encrypts your PDF with a password. Only users with the password can view the document.</p>
              <p>• <strong>Remove Protection:</strong> Removes encryption from a password-protected PDF, making it accessible without a password.</p>
              <p>• <strong>Privacy:</strong> All processing happens locally in your browser - your passwords and documents never leave your device.</p>
              <p>• <strong>Security:</strong> Use strong passwords with a mix of letters, numbers, and special characters for better protection.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordTool;