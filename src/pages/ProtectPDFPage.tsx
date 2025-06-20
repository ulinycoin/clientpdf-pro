/**
 * Copyright (c) 2024 LocalPDF Team
 * 
 * This file is part of LocalPDF.
 * 
 * LocalPDF is proprietary software: you may not copy, modify, distribute,
 * or use this software except as expressly permitted under the LocalPDF
 * Source Available License v1.0.
 * 
 * See the LICENSE file in the project root for license terms.
 * For commercial licensing, contact: license@localpdf.online
 */

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Shield, Lock, Unlock, FileText, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { Button } from '../components/atoms/Button';
import { PageLoadingSpinner } from '../components/atoms/PageLoadingSpinner';

// Lazy load the PDF processor component
const PDFPasswordProcessor = lazy(() => 
  import('../components/organisms/PDFPasswordProcessor').then(module => ({
    default: module.PDFPasswordProcessor
  }))
);

export const ProtectPDFPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<'protect' | 'unlock'>('protect');

  useEffect(() => {
    document.title = 'Password Protect PDF - Secure Your PDFs Online | LocalPDF';
  }, []);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const features = [
    {
      icon: Lock,
      title: 'Password Protection',
      description: 'Add password security to prevent unauthorized access'
    },
    {
      icon: Shield,
      title: 'Permission Control',
      description: 'Set permissions for printing, copying, and editing'
    },
    {
      icon: FileText,
      title: 'Batch Processing',
      description: 'Protect multiple PDFs at once with the same settings'
    }
  ];

  const securityLevels = [
    {
      level: 'Basic',
      description: 'Password required to open',
      features: ['View protection', 'Basic encryption']
    },
    {
      level: 'Standard',
      description: 'Password + restricted permissions',
      features: ['View protection', 'Print restrictions', 'Copy restrictions']
    },
    {
      level: 'Advanced',
      description: 'Maximum security settings',
      features: ['View protection', 'Edit restrictions', 'Print restrictions', 'Copy restrictions']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex p-3 bg-blue-100 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Password Protect PDF
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Add password protection and control permissions for your PDF files. 
            Everything happens in your browser - your files never leave your device.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMode('protect')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                mode === 'protect' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Protect PDF
            </button>
            <button
              onClick={() => setMode('unlock')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                mode === 'unlock' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Unlock className="w-4 h-4 inline mr-2" />
              Unlock PDF
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <feature.icon className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Upload Area */}
        {files.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center mb-8">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {mode === 'protect' ? "Drop PDFs to protect" : "Drop PDF to unlock"}
            </h3>
            <p className="text-gray-600 mb-4">
              {mode === 'protect' 
                ? "or click to browse. You can protect up to 10 PDFs at once."
                : "or click to browse. Upload the password-protected PDF."
              }
            </p>
            <input
              type="file"
              accept=".pdf"
              multiple={mode === 'protect'}
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Choose Files
            </label>
          </div>
        ) : (
          <Suspense fallback={<PageLoadingSpinner message="Loading security tools..." />}>
            <div className="space-y-4">
              {files.map((file, index) => (
                <PDFPasswordProcessor
                  key={`${file.name}-${index}`}
                  file={file}
                  onRemove={() => handleRemoveFile(index)}
                  mode={mode}
                />
              ))}
              <div className="text-center mt-6">
                <Button
                  onClick={() => setFiles([])}
                  variant="secondary"
                  size="md"
                >
                  {mode === 'protect' ? 'Protect More PDFs' : 'Unlock Another PDF'}
                </Button>
              </div>
            </div>
          </Suspense>
        )}

        {/* Security Levels */}
        {mode === 'protect' && files.length === 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Security Levels Available
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {securityLevels.map((level, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {level.level}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {level.description}
                  </p>
                  <ul className="space-y-2">
                    {level.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-blue-50 rounded-2xl p-8">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Important Security Information
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Strong passwords should be at least 8 characters with mixed case, numbers, and symbols</li>
                <li>• Keep your passwords secure - we cannot recover lost passwords</li>
                <li>• Password protection prevents casual access but isn't unbreakable</li>
                <li>• All encryption happens locally in your browser for maximum privacy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
