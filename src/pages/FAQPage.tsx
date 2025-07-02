import React from 'react';
import Header from '../components/organisms/Header';
import Footer from '../components/organisms/Footer';

const FAQPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-8">
            Everything you need to know about LocalPDF - your privacy-first PDF toolkit.
          </p>

          <div className="space-y-8">
            
            {/* General Questions */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                📋 General Questions
              </h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">❓ What is LocalPDF?</h3>
                  <p className="text-blue-700">
                    LocalPDF is a free, privacy-first web application that provides 9 powerful PDF tools for merging, splitting, compressing, editing, and converting PDF files. All processing happens entirely in your browser - no uploads, no registration, no tracking.
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">❓ Is LocalPDF really free?</h3>
                  <p className="text-green-700">
                    Yes! LocalPDF is completely free to use with no limitations, ads, or hidden fees. We believe essential PDF tools should be accessible to everyone.
                  </p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">❓ Do I need to create an account?</h3>
                  <p className="text-purple-700">
                    No account required! Simply visit LocalPDF and start using any tool immediately.
                  </p>
                </div>
              </div>
            </section>

            {/* Privacy & Security */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                🔒 Privacy & Security
              </h2>
              
              <div className="space-y-6">
                <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-400">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">❓ Are my files uploaded to your servers?</h3>
                  <p className="text-red-700">
                    <strong>No!</strong> This is LocalPDF's core feature - all processing happens in your browser. Your files never leave your device. We cannot see, access, or store your documents.
                  </p>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">❓ What happens to my files after I use LocalPDF?</h3>
                  <p className="text-yellow-700">
                    Your files are processed in your browser's memory and automatically cleared when you close the page or navigate away. Nothing is stored permanently.
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">❓ Is LocalPDF safe for confidential documents?</h3>
                  <p className="text-green-700">
                    Yes! Since all processing is local and we don't collect any data, LocalPDF is ideal for confidential, sensitive, or private documents.
                  </p>
                </div>
              </div>
            </section>

            {/* Technical Questions */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                🛠️ Technical Questions
              </h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">❓ What browsers support LocalPDF?</h3>
                  <div className="text-blue-700">
                    LocalPDF works on all modern browsers:
                    <ul className="mt-2 ml-4 space-y-1">
                      <li>• <strong>Chrome</strong> 90+</li>
                      <li>• <strong>Firefox</strong> 90+</li>
                      <li>• <strong>Safari</strong> 14+</li>
                      <li>• <strong>Edge</strong> 90+</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-800 mb-3">❓ What's the maximum file size I can process?</h3>
                  <p className="text-orange-700">
                    LocalPDF can handle files up to <strong>100MB</strong>. For very large files, processing may take longer depending on your device's performance.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">❓ Does LocalPDF work offline?</h3>
                  <p className="text-gray-700">
                    Yes! After your first visit, LocalPDF works offline. Your browser caches the application, so you can use it without an internet connection.
                  </p>
                </div>
              </div>
            </section>

            {/* PDF Tools */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                📄 PDF Tools
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">📄 Merge PDFs</h3>
                  <p className="text-blue-700 text-sm">Combine multiple PDFs into one document</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">✂️ Split PDFs</h3>
                  <p className="text-green-700 text-sm">Extract specific pages or split into separate files</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">🗜️ Compress PDFs</h3>
                  <p className="text-purple-700 text-sm">Reduce file size while maintaining quality</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">✍️ Add Text</h3>
                  <p className="text-yellow-700 text-sm">Insert custom text with full formatting control</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">🏷️ Add Watermarks</h3>
                  <p className="text-red-700 text-sm">Add text or image watermarks</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-800 mb-2">🔄 Rotate Pages</h3>
                  <p className="text-indigo-700 text-sm">Rotate pages 90°, 180°, or 270°</p>
                </div>
              </div>

              <div className="mt-6 bg-teal-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-teal-800 mb-3">❓ Can I edit existing text in PDFs?</h3>
                <p className="text-teal-700">
                  Currently, LocalPDF allows <strong>adding new text</strong> to PDFs but not editing existing text. You can add text overlays, signatures, notes, and annotations.
                </p>
              </div>
            </section>

            {/* Troubleshooting */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                🔧 Troubleshooting
              </h2>
              
              <div className="space-y-6">
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">❓ LocalPDF isn't loading properly</h3>
                  <div className="text-red-700">
                    Try these steps:
                    <ol className="mt-2 ml-4 space-y-1">
                      <li>1. Clear browser cache and refresh</li>
                      <li>2. Disable browser extensions temporarily</li>
                      <li>3. Try incognito/private mode</li>
                      <li>4. Check if JavaScript is enabled</li>
                      <li>5. Update your browser to the latest version</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">❓ My PDF file won't process</h3>
                  <div className="text-yellow-700">
                    Common issues and solutions:
                    <ul className="mt-2 ml-4 space-y-1">
                      <li>• <strong>File too large:</strong> Maximum 100MB supported</li>
                      <li>• <strong>Corrupted PDF:</strong> Try opening the file in another PDF viewer first</li>
                      <li>• <strong>Password-protected PDF:</strong> Remove password protection first</li>
                      <li>• <strong>Complex PDF structure:</strong> Some PDFs with advanced features may not be supported</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">❓ Processing is taking very long</h3>
                  <div className="text-blue-700">
                    For large files:
                    <ul className="mt-2 ml-4 space-y-1">
                      <li>• Be patient: Files over 50MB can take several minutes</li>
                      <li>• Close other browser tabs to free up memory</li>
                      <li>• Don't navigate away during processing</li>
                      <li>• Check if your browser shows progress indicators</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* User Experience */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                🎨 User Experience
              </h2>
              
              <div className="space-y-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">❓ Can I use keyboard shortcuts?</h3>
                  <div className="text-green-700">
                    Yes! LocalPDF supports common shortcuts:
                    <ul className="mt-2 ml-4 space-y-1">
                      <li>• <strong>Ctrl+S</strong> (Cmd+S): Save/download processed file</li>
                      <li>• <strong>Ctrl+Z</strong> (Cmd+Z): Undo last action (where applicable)</li>
                      <li>• <strong>Ctrl+O</strong> (Cmd+O): Open file dialog</li>
                      <li>• <strong>Tab:</strong> Navigate between interface elements</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">❓ Does LocalPDF work on mobile devices?</h3>
                  <p className="text-purple-700">
                    Yes! LocalPDF is fully responsive and works on smartphones, tablets, and touch interfaces with optimized controls.
                  </p>
                </div>
              </div>
            </section>

            {/* Need Help */}
            <section className="bg-gray-100 p-8 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">📞 Still Need Help?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">🆘 Getting Support</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• GitHub Issues: Technical problems and bug reports</li>
                    <li>• GitHub Discussions: General questions and community help</li>
                    <li>• Documentation: Complete guides and tutorials</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">📧 Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <a 
                      href="https://github.com/ulinycoin/clientpdf-pro/issues" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline"
                    >
                      Report Issues on GitHub
                    </a>
                    <a 
                      href="https://github.com/ulinycoin/clientpdf-pro/discussions" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline"
                    >
                      Join Community Discussions
                    </a>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;