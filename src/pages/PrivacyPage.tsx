import React from 'react';
import Header from '../organisms/Header';
import Footer from '../organisms/Footer';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy for LocalPDF</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: July 2, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔒 Our Privacy Commitment</h2>
              <p className="text-gray-600 mb-4">
                LocalPDF is designed with <strong>privacy as the foundation</strong>. We believe your documents and data should remain yours and yours alone. This Privacy Policy explains how LocalPDF protects your privacy and ensures your data never leaves your device.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">📍 The Simple Answer</h2>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-green-800 font-medium">
                  <strong>LocalPDF does not collect, store, transmit, or have access to any of your data, files, or personal information.</strong>
                </p>
                <p className="text-green-700 mt-2">
                  All PDF processing happens entirely within your web browser. Your files never leave your device.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">🛡️ What We DON'T Do</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">❌ No Data Collection</h3>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• No personal information</li>
                    <li>• No usage tracking</li>
                    <li>• No analytics cookies</li>
                    <li>• No user accounts</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">❌ No File Access</h3>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• No server uploads</li>
                    <li>• No file storage</li>
                    <li>• No document copies</li>
                    <li>• No processing history</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">✅ How LocalPDF Works</h2>
              <div className="bg-blue-50 p-6 rounded-lg mb-4">
                <h3 className="font-semibold text-blue-800 mb-3">🖥️ Client-Side Processing</h3>
                <p className="text-blue-700 mb-3">All PDF operations happen directly in your web browser using:</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• <strong>JavaScript PDF libraries</strong> (pdf-lib, PDF.js, jsPDF)</li>
                  <li>• <strong>Web Workers</strong> for performance optimization</li>
                  <li>• <strong>Local memory</strong> for temporary processing</li>
                  <li>• <strong>Your device's resources</strong> exclusively</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-3">🔄 The Complete Process</h3>
                <ol className="text-green-700 space-y-2">
                  <li><strong>1.</strong> You select a PDF file from your device</li>
                  <li><strong>2.</strong> File loads into browser memory (never uploaded)</li>
                  <li><strong>3.</strong> Processing happens locally using JavaScript</li>
                  <li><strong>4.</strong> Result is generated in your browser</li>
                  <li><strong>5.</strong> You download the processed file directly</li>
                  <li><strong>6.</strong> All data is cleared from memory when you close the page</li>
                </ol>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">🌍 International Privacy Compliance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <h3 className="font-semibold text-purple-800 mb-2">🇪🇺 GDPR</h3>
                  <p className="text-purple-700 text-sm">Fully compliant - no personal data processed</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <h3 className="font-semibold text-purple-800 mb-2">🇺🇸 CCPA</h3>
                  <p className="text-purple-700 text-sm">Compliant - no data collection or sale</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <h3 className="font-semibold text-purple-800 mb-2">🌐 Global</h3>
                  <p className="text-purple-700 text-sm">Privacy-first design ensures worldwide compliance</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔒 Security Measures</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">🛡️ Technical Security</h3>
                    <ul className="text-gray-700 space-y-2">
                      <li>• HTTPS encryption for all connections</li>
                      <li>• Content Security Policy protection</li>
                      <li>• Regular security updates</li>
                      <li>• No external code injection</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">🔐 Data Protection</h3>
                    <ul className="text-gray-700 space-y-2">
                      <li>• No data persistence beyond session</li>
                      <li>• Memory cleanup after processing</li>
                      <li>• Secure file handling</li>
                      <li>• Local-only operations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">❓ Common Questions</h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Q: Can you see my PDF files?</h3>
                  <p className="text-yellow-700">A: No, we cannot see your files. They never leave your device.</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Q: Do you keep copies of processed documents?</h3>
                  <p className="text-yellow-700">A: No, all processing is temporary and files are deleted from memory when you close the page.</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Q: Do you use Google Analytics or similar?</h3>
                  <p className="text-yellow-700">A: No, we don't use any tracking or analytics services.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">📞 Contact Information</h2>
              <p className="text-gray-600 mb-4">
                If you have questions about this Privacy Policy or LocalPDF's privacy practices:
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  <li>
                    <strong>Website:</strong> 
                    <a href="https://localpdf.online" className="text-blue-600 hover:underline ml-2">
                      localpdf.online
                    </a>
                  </li>
                  <li>
                    <strong>GitHub Issues:</strong> 
                    <a 
                      href="https://github.com/ulinycoin/clientpdf-pro/issues" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-2"
                    >
                      Report issues or ask questions
                    </a>
                  </li>
                </ul>
              </div>
            </section>

            <section className="bg-green-100 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-green-800 mb-4">🎯 Summary</h2>
              <p className="text-green-700 text-lg">
                <strong>LocalPDF is designed to be completely private by default. Your files, data, and privacy are protected because we simply don't collect, store, or transmit any of your information.</strong>
              </p>
              <p className="text-green-600 mt-3">
                This isn't just a policy promise—it's built into the fundamental architecture of how LocalPDF works.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;