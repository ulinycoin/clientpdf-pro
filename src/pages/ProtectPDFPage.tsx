/**
 * ProtectPDFPage - PDF Protection functionality
 * Coming soon - will implement password protection for PDFs
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Lock, AlertCircle } from 'lucide-react';

export function ProtectPDFPage() {
  return (
    <>
      <Helmet>
        <title>Protect PDF - LocalPDF</title>
        <meta name="description" content="Add password protection to your PDF files. Coming soon to LocalPDF." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Protect PDF Files
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Add password protection and security features to your PDF documents.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Coming Soon
              </h3>
              <p className="text-yellow-700">
                PDF protection features are currently under development. This will include:
              </p>
              <ul className="mt-3 space-y-1 text-yellow-700">
                <li>• Password protection for opening PDFs</li>
                <li>• User and owner password settings</li>
                <li>• Permission controls (printing, copying, editing)</li>
                <li>• Encryption strength options</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Password Protection
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Secure your PDF documents with strong password encryption.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• User password for opening</li>
              <li>• Owner password for permissions</li>
              <li>• AES encryption support</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Permission Controls
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Control what users can do with your protected PDFs.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Disable printing</li>
              <li>• Prevent copying</li>
              <li>• Block editing</li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500">
            This feature will be available in a future update. Stay tuned!
          </p>
        </div>
      </div>
    </>
  );
}