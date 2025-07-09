import React, { useState } from 'react';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import FileUploadZone from '../../components/molecules/FileUploadZone';
import PasswordTool from '../../components/organisms/PasswordTool';
import Button from '../../components/atoms/Button';
import { downloadFile } from '../../utils/fileHelpers';
import { generateFilename } from '../../utils/fileHelpers';

const PasswordPDFPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showTool, setShowTool] = useState(false);

  // SEO data for password protection tool
  const seoData = {
    title: 'PDF Password Protection Tool - Add or Remove Password | LocalPDF',
    description: 'Protect your PDF documents with passwords or remove existing password protection. Free, secure PDF encryption tool that works in your browser without uploading files.',
    keywords: [
      'PDF password protection',
      'PDF encryption',
      'PDF security',
      'remove PDF password',
      'protect PDF with password',
      'PDF password tool',
      'secure PDF documents',
      'PDF privacy protection',
      'encrypted PDF',
      'password protected PDF'
    ],
    canonical: '/password-pdf',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'PDF Password Protection Tool',
      description: 'Free online tool to add or remove password protection from PDF documents',
      url: 'https://localpdf.online/password-pdf',
      applicationCategory: 'PDF Security Tool',
      operatingSystem: 'Any',
      permissions: 'browser',
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
    setShowTool(true);
  };

  const handleComplete = (result: any) => {
    if (result.success && result.data) {
      // The PasswordTool component handles its own downloading
      // This is just a fallback in case needed
      console.log('Password operation completed successfully');
    }
  };

  const handleClose = () => {
    setShowTool(false);
    setUploadedFiles([]);
  };

  const handleReset = () => {
    setShowTool(false);
    setUploadedFiles([]);
  };

  return (
    <>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical={seoData.canonical}
        structuredData={seoData.structuredData}
      />
      
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PDF Password Protection Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Add password protection to secure your PDF documents or remove existing passwords. 
            All processing happens locally in your browser for maximum privacy and security.
          </p>
        </header>

        {!showTool ? (
          <section className="mb-12">
            <div className="max-w-2xl mx-auto">
              <FileUploadZone
                onFilesSelected={handleFilesSelected}
                acceptedTypes={['.pdf']}
                maxFiles={1}
                title="Upload PDF for Password Protection"
                subtitle="Select a PDF file to add or remove password protection"
              />
              
              <div className="mt-8 grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">🔒 Security Features:</h3>
                  <ul className="space-y-1">
                    <li>• Add strong password protection</li>
                    <li>• Remove existing password protection</li>
                    <li>• Advanced permission controls</li>
                    <li>• Password strength validation</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">🛡️ Privacy & Security:</h3>
                  <ul className="space-y-1">
                    <li>• 100% client-side processing</li>
                    <li>• No passwords sent to servers</li>
                    <li>• Your documents never leave your device</li>
                    <li>• Zero-knowledge security model</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="mb-12">
            <div className="mb-4 flex justify-center">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center"
              >
                ← Upload Different PDF
              </Button>
            </div>
            
            <PasswordTool
              files={uploadedFiles}
              onComplete={handleComplete}
              onClose={handleClose}
            />
          </section>
        )}

        <RelatedTools currentTool="password" className="mb-8" />

        {/* Benefits Section */}
        <section className="mt-16 bg-gradient-to-r from-red-50 to-blue-50 rounded-xl p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Why Protect Your PDFs with Passwords?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Document Security</h3>
                <p className="text-gray-600">
                  Protect sensitive documents from unauthorized access with strong encryption
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl">🛡️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy Protection</h3>
                <p className="text-gray-600">
                  Ensure your confidential information stays private when sharing documents
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Processing</h3>
                <p className="text-gray-600">
                  Add or remove password protection in seconds with browser-based processing
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mt-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              How PDF Password Protection Works
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload PDF</h3>
                <p className="text-sm text-gray-600">Drop your PDF file or click to browse</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Choose Action</h3>
                <p className="text-sm text-gray-600">Add password protection or remove existing protection</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Set Password</h3>
                <p className="text-sm text-gray-600">Enter a strong password with validation feedback</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
                <p className="text-sm text-gray-600">Get your protected PDF with secure encryption</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Information */}
        <section className="mt-16 bg-gray-50 rounded-xl p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Security & Encryption Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Protection Features:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Strong Encryption:</strong> Industry-standard PDF encryption</li>
                  <li>• <strong>Password Validation:</strong> Real-time strength checking</li>
                  <li>• <strong>Permission Controls:</strong> Set document access permissions</li>
                  <li>• <strong>Metadata Analysis:</strong> Privacy risk assessment</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Guarantees:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>No Upload:</strong> Files processed locally in your browser</li>
                  <li>• <strong>Zero Knowledge:</strong> We never see your passwords or documents</li>
                  <li>• <strong>Instant Deletion:</strong> Data cleared from memory after processing</li>
                  <li>• <strong>Open Source:</strong> Transparent security implementation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mt-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Password Security Best Practices
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">✅ Strong Password Tips:</h3>
                  <ul className="space-y-1 text-blue-800 text-sm">
                    <li>• Use at least 12 characters</li>
                    <li>• Mix uppercase, lowercase, numbers, symbols</li>
                    <li>• Avoid dictionary words and common patterns</li>
                    <li>• Use unique passwords for each document</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">⚠️ Security Reminders:</h3>
                  <ul className="space-y-1 text-blue-800 text-sm">
                    <li>• Share passwords through secure channels</li>
                    <li>• Store passwords in a password manager</li>
                    <li>• Consider password expiration for sensitive docs</li>
                    <li>• Remember: we cannot recover lost passwords</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <details className="bg-white border border-gray-200 rounded-lg p-6">
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  Is my PDF and password information secure?
                </summary>
                <p className="mt-3 text-gray-600">
                  Absolutely. All processing happens locally in your browser. Your PDFs and passwords never leave your device, 
                  and we have no way to access them. This is a zero-knowledge security model.
                </p>
              </details>
              
              <details className="bg-white border border-gray-200 rounded-lg p-6">
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  Can you help me recover a forgotten password?
                </summary>
                <p className="mt-3 text-gray-600">
                  No, we cannot recover lost passwords since we never have access to them. This is by design for your security. 
                  Make sure to store your passwords in a secure password manager.
                </p>
              </details>
              
              <details className="bg-white border border-gray-200 rounded-lg p-6">
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  What encryption standard is used?
                </summary>
                <p className="mt-3 text-gray-600">
                  We use industry-standard PDF encryption methods. The exact encryption strength depends on your browser's 
                  capabilities, but we always use the strongest available encryption for maximum security.
                </p>
              </details>
              
              <details className="bg-white border border-gray-200 rounded-lg p-6">
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  Are there any file size limits?
                </summary>
                <p className="mt-3 text-gray-600">
                  For optimal performance, we recommend files under 50MB. Larger files may work but could be slower to process 
                  depending on your device's capabilities.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default PasswordPDFPage;