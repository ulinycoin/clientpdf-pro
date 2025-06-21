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

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Unlock, FileText, AlertCircle, CheckCircle, Upload, Eye, EyeOff, Download, X, Settings } from 'lucide-react';
import { Button } from '../components/atoms/Button';
import { usePDFWorker } from '../hooks/usePDFWorker';

interface PermissionSettings {
  allowPrinting: boolean;
  allowModifying: boolean;
  allowCopying: boolean;
  allowAnnotating: boolean;
  allowFillingForms: boolean;
  allowDocumentAssembly: boolean;
}

export const ProtectPDFPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<'protect' | 'unlock'>('protect');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [permissions, setPermissions] = useState<PermissionSettings>({
    allowPrinting: true,
    allowModifying: false,
    allowCopying: false,
    allowAnnotating: true,
    allowFillingForms: true,
    allowDocumentAssembly: false
  });

  const { processFiles, isProcessing, progress, error, result, resetState } = usePDFWorker();

  useEffect(() => {
    document.title = 'Password Protect PDF - Secure Your PDFs Online | LocalPDF';
  }, []);

  useEffect(() => {
    // Reset state when mode changes
    resetState();
    setFiles([]);
    setPassword('');
    setConfirmPassword('');
  }, [mode, resetState]);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
    resetState();
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    resetState();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    resetState();
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    resetState();
  };

  const handlePermissionChange = (permission: keyof PermissionSettings, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: value
    }));
  };

  const validateInputs = (): string | null => {
    if (files.length === 0) {
      return 'Please select a PDF file';
    }

    if (!password.trim()) {
      return 'Password is required';
    }

    if (mode === 'protect') {
      if (password.length < 4) {
        return 'Password must be at least 4 characters long';
      }

      if (password !== confirmPassword) {
        return 'Passwords do not match';
      }
    }

    return null;
  };

  const handleProcess = async () => {
    const validationError = validateInputs();
    if (validationError) {
      alert(validationError);
      return;
    }

    const settings = {
      mode,
      password: password.trim(),
      permissions: mode === 'protect' ? permissions : undefined
    };

    try {
      await processFiles(files, 'protect', settings);
    } catch (err) {
      console.error('Processing error:', err);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const fileName = files[0]?.name || 'document.pdf';
    const baseName = fileName.replace(/\.pdf$/i, '');
    const newFileName = mode === 'protect' 
      ? `${baseName}_protected.pdf`
      : `${baseName}_unlocked.pdf`;

    const url = URL.createObjectURL(result);
    const a = document.createElement('a');
    a.href = url;
    a.download = newFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFiles([]);
    setPassword('');
    setConfirmPassword('');
    resetState();
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
      title: 'Client-Side Processing',
      description: 'All encryption happens locally for maximum security'
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

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          
          {/* Upload Area - Only show if no files selected */}
          {files.length === 0 && (
            <>
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
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center mb-8">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {mode === 'protect' ? "Drop PDF to protect" : "Drop PDF to unlock"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {mode === 'protect' 
                    ? "or click to browse. Choose a PDF file to add password protection."
                    : "or click to browse. Upload the password-protected PDF to unlock."
                  }
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Choose PDF File
                </label>
              </div>
            </>
          )}

          {/* File Processing Section */}
          {files.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              
              {/* Selected File */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-md font-medium text-gray-900">{files[0].name}</h4>
                    <p className="text-sm text-gray-500">
                      Size: {(files[0].size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRemoveFile(0)}
                    variant="secondary"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {mode === 'protect' ? 'New Password' : 'Current Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder={mode === 'protect' ? 'Enter a strong password' : 'Enter the PDF password'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                      disabled={isProcessing}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password for Protection Mode */}
                {mode === 'protect' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isProcessing}
                    />
                  </div>
                )}
              </div>

              {/* Advanced Settings for Protection Mode */}
              {mode === 'protect' && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced Permission Settings
                    {showAdvancedSettings ? ' (Hide)' : ' (Show)'}
                  </button>

                  {showAdvancedSettings && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <p className="text-sm text-gray-600 mb-3">
                        Control what users can do with the protected PDF:
                      </p>
                      
                      {Object.entries(permissions).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handlePermissionChange(key as keyof PermissionSettings, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={isProcessing}
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {key === 'allowPrinting' && 'Allow printing'}
                            {key === 'allowModifying' && 'Allow modifying content'}
                            {key === 'allowCopying' && 'Allow copying text and images'}
                            {key === 'allowAnnotating' && 'Allow adding annotations'}
                            {key === 'allowFillingForms' && 'Allow filling forms'}
                            {key === 'allowDocumentAssembly' && 'Allow document assembly'}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Processing Progress */}
              {isProcessing && progress && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{progress.message}</span>
                    <span>{progress.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {mode === 'protect' ? 'Protection Failed' : 'Unlock Failed'}
                      </h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success with Download */}
              {result && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-green-800">
                        {mode === 'protect' ? 'PDF Protected Successfully!' : 'PDF Unlocked Successfully!'}
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        {mode === 'protect' 
                          ? 'Your PDF has been password protected with the specified permissions.'
                          : 'The password has been removed from your PDF.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {result ? (
                  <>
                    <Button
                      onClick={handleDownload}
                      className="flex-1"
                      size="lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download {mode === 'protect' ? 'Protected' : 'Unlocked'} PDF
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="secondary"
                      size="lg"
                    >
                      {mode === 'protect' ? 'Protect Another PDF' : 'Unlock Another PDF'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleProcess}
                      disabled={isProcessing || !password.trim()}
                      className="flex-1"
                      size="lg"
                    >
                      {isProcessing ? 'Processing...' : (mode === 'protect' ? 'Protect PDF' : 'Unlock PDF')}
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="secondary"
                      size="lg"
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Security Levels Info - Only show when no files selected and in protect mode */}
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
                  <li>• Password protection prevents casual access but isn't unbreakable with advanced tools</li>
                  <li>• All encryption happens locally in your browser for maximum privacy</li>
                  <li>• {mode === 'unlock' ? 'Original files are never stored or transmitted' : 'Permission settings control document functionality'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
