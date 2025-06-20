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

import React, { useState } from 'react';
import { Shield, Lock, Unlock, Eye, EyeOff, Settings, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '../atoms/Button';
import { clsx } from 'clsx';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

interface PDFPasswordProcessorProps {
  file: File;
  onRemove: () => void;
  mode: 'protect' | 'unlock';
}

interface ProtectionSettings {
  userPassword: string;
  ownerPassword: string;
  permissions: {
    printing: boolean;
    modifying: boolean;
    copying: boolean;
    annotating: boolean;
  };
}

export const PDFPasswordProcessor: React.FC<PDFPasswordProcessorProps> = ({ file, onRemove, mode }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  
  const [protectionSettings, setProtectionSettings] = useState<ProtectionSettings>({
    userPassword: '',
    ownerPassword: '',
    permissions: {
      printing: true,
      modifying: false,
      copying: false,
      annotating: true,
    }
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const updateStatus = (progress: number, message: string, status: 'info' | 'success' | 'error') => {
    setProgress(progress);
    setMessage(message);
    if (status === 'error') {
      setStatus('error');
    } else if (status === 'success') {
      setStatus('success');
    } else {
      setStatus('processing');
    }
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };

  const protectPDF = async () => {
    try {
      if (!protectionSettings.userPassword) {
        updateStatus(0, 'Please enter a password', 'error');
        return;
      }

      updateStatus(10, 'Loading PDF document...', 'info');
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      updateStatus(30, 'Configuring security settings...', 'info');

      // Set owner password (if not provided, use user password)
      const ownerPassword = protectionSettings.ownerPassword || protectionSettings.userPassword;

      // Configure permissions
      const permissions = {
        printing: protectionSettings.permissions.printing ? 'highResolution' : false,
        modifying: protectionSettings.permissions.modifying,
        copying: protectionSettings.permissions.copying,
        annotating: protectionSettings.permissions.annotating,
      };

      updateStatus(60, 'Encrypting PDF document...', 'info');

      // Save with encryption
      const encryptedPdfBytes = await pdfDoc.save({
        userPassword: protectionSettings.userPassword,
        ownerPassword: ownerPassword,
        permissions: permissions as any,
      });

      updateStatus(90, 'Preparing secure PDF...', 'info');

      const blob = new Blob([encryptedPdfBytes], { type: 'application/pdf' });
      const secureFileName = `${file.name.replace('.pdf', '')}-protected.pdf`;
      saveAs(blob, secureFileName);

      updateStatus(100, 'PDF successfully protected! Password required to open.', 'success');
    } catch (error: any) {
      console.error('Error protecting PDF:', error);
      updateStatus(0, `Error protecting PDF: ${error.message}`, 'error');
    }
  };

  const unlockPDF = async () => {
    try {
      if (!unlockPassword) {
        updateStatus(0, 'Please enter the password', 'error');
        return;
      }

      updateStatus(10, 'Loading encrypted PDF...', 'info');
      const arrayBuffer = await readFileAsArrayBuffer(file);

      updateStatus(30, 'Attempting to unlock with provided password...', 'info');

      // Try to load with password
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        password: unlockPassword,
      });

      updateStatus(60, 'Removing password protection...', 'info');

      // Save without encryption
      const unlockedPdfBytes = await pdfDoc.save();

      updateStatus(90, 'Preparing unlocked PDF...', 'info');

      const blob = new Blob([unlockedPdfBytes], { type: 'application/pdf' });
      const unlockedFileName = `${file.name.replace('.pdf', '')}-unlocked.pdf`;
      saveAs(blob, unlockedFileName);

      updateStatus(100, 'PDF successfully unlocked! Password removed.', 'success');
    } catch (error: any) {
      console.error('Error unlocking PDF:', error);
      if (error.message.includes('password')) {
        updateStatus(0, 'Incorrect password. Please try again.', 'error');
      } else {
        updateStatus(0, `Error unlocking PDF: ${error.message}`, 'error');
      }
    }
  };

  const handleProcess = () => {
    setStatus('processing');
    if (mode === 'protect') {
      protectPDF();
    } else {
      unlockPDF();
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Shield className="w-5 h-5 animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-1">{file.name}</h3>
          <p className="text-sm text-gray-500">Size: {formatFileSize(file.size)}</p>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-500 transition-colors"
          aria-label="Remove file"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {mode === 'protect' ? (
        // Protection Mode UI
        <div className="space-y-4">
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Password (Required to open)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={protectionSettings.userPassword}
                onChange={(e) => setProtectionSettings({
                  ...protectionSettings,
                  userPassword: e.target.value
                })}
                placeholder="Enter password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Settings className="w-4 h-4 mr-1" />
              Advanced Settings
            </button>
            
            {showSettings && (
              <div className="mt-3 p-4 bg-gray-50 rounded-md space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Password (Optional - for permission control)
                  </label>
                  <input
                    type="password"
                    value={protectionSettings.ownerPassword}
                    onChange={(e) => setProtectionSettings({
                      ...protectionSettings,
                      ownerPassword: e.target.value
                    })}
                    placeholder="Leave empty to use user password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {Object.entries(protectionSettings.permissions).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setProtectionSettings({
                            ...protectionSettings,
                            permissions: {
                              ...protectionSettings.permissions,
                              [key]: e.target.checked
                            }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          Allow {key}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Unlock Mode UI
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              placeholder="Enter PDF password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      {status !== 'idle' && (
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <div className={clsx('mr-2', getStatusColor())}>
              {getStatusIcon()}
            </div>
            <p className={clsx('text-sm', getStatusColor())}>{message}</p>
          </div>
          
          {status === 'processing' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      <Button
        onClick={handleProcess}
        disabled={status === 'processing' || status === 'success'}
        variant="primary"
        size="md"
        className="w-full mt-4"
      >
        {status === 'idle' && (mode === 'protect' ? 'Protect PDF' : 'Unlock PDF')}
        {status === 'processing' && 'Processing...'}
        {status === 'success' && 'Completed!'}
        {status === 'error' && 'Retry'}
      </Button>
    </div>
  );
};
