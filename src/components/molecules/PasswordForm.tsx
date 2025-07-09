import React, { useState } from 'react';
import { PasswordFormProps, PasswordProtectionOptions } from '../../types/security.types';
import PasswordInput from '../atoms/PasswordInput';
import Button from '../atoms/Button';

const PasswordForm: React.FC<PasswordFormProps> = ({
  action,
  onSubmit,
  isProcessing,
  error,
  className = ''
}) => {
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form validation
  const isValid = () => {
    if (action === 'protect') {
      if (!password || password.length < 8) return false;
      if (confirmPassword !== password) return false;
    } else if (action === 'remove') {
      if (!oldPassword) return false;
    }
    return true;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!isValid()) return;

    const options: PasswordProtectionOptions = {
      action,
      password: action === 'protect' ? password : undefined,
      oldPassword: action === 'remove' ? oldPassword : undefined,
      permissions: showAdvanced ? {
        printing: true,
        modifying: false,
        copying: false,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: false
      } : undefined
    };

    onSubmit(options);
  };

  const resetForm = () => {
    setPassword('');
    setOldPassword('');
    setConfirmPassword('');
    setShowAdvanced(false);
  };

  // Clear form when action changes
  React.useEffect(() => {
    resetForm();
  }, [action]);

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Form Header */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">
          {action === 'protect' ? 'Protect PDF with Password' : 'Remove PDF Password'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {action === 'protect' 
            ? 'Add password protection to secure your PDF document' 
            : 'Remove password protection from your PDF document'
          }
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {action === 'protect' ? (
          <>
            {/* New Password */}
            <PasswordInput
              label="New Password"
              value={password}
              onChange={setPassword}
              placeholder="Enter a strong password"
              required
              showStrength
              disabled={isProcessing}
            />

            {/* Confirm Password */}
            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter the password"
              required
              disabled={isProcessing}
            />

            {/* Password Match Validation */}
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Passwords do not match
              </p>
            )}

            {/* Advanced Options Toggle */}
            <div className="border-t pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                disabled={isProcessing}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 mr-2 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Advanced Permissions
              </button>

              {showAdvanced && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <p className="text-sm text-gray-700 font-medium">Document Permissions:</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" disabled={isProcessing} />
                      Allow Printing
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" disabled={isProcessing} />
                      Allow Modifications
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" disabled={isProcessing} />
                      Allow Copying
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" disabled={isProcessing} />
                      Allow Annotations
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Note: Permission enforcement depends on PDF viewer support
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Current Password */}
            <PasswordInput
              label="Current Password"
              value={oldPassword}
              onChange={setOldPassword}
              placeholder="Enter the current password"
              required
              disabled={isProcessing}
            />

            {/* Warning Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium">Warning</p>
                  <p className="text-yellow-700 mt-1">
                    Removing password protection will make your PDF document accessible to anyone. 
                    Make sure this is what you want to do.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          disabled={isProcessing}
        >
          Reset
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isProcessing}
          disabled={!isValid()}
        >
          {isProcessing ? (
            action === 'protect' ? 'Adding Protection...' : 'Removing Protection...'
          ) : (
            action === 'protect' ? 'Protect PDF' : 'Remove Protection'
          )}
        </Button>
      </div>

      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="text-sm">
            <p className="text-blue-800 font-medium">Privacy & Security</p>
            <p className="text-blue-700 mt-1">
              All processing happens in your browser. Your passwords and documents never leave your device.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PasswordForm;