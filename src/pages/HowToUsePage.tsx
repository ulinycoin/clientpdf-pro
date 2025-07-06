import React from 'react';
import Header from '../components/organisms/Header';
import Footer from '../components/organisms/Footer';
import { Helmet } from 'react-helmet-async';

const HowToUsePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>How to Use LocalPDF - Complete Guide to Free PDF Tools</title>
        <meta name="description" content="Complete guide on how to use LocalPDF's 9 free PDF tools. Step-by-step instructions for merging, splitting, compressing, editing and converting PDFs in your browser." />
        <meta name="keywords" content="how to use LocalPDF, PDF tools guide, PDF tutorial, merge PDF tutorial, split PDF guide, compress PDF instructions" />
        <link rel="canonical" href="https://localpdf.online/how-to-use" />
        
        {/* Open Graph */}
        <meta property="og:title" content="How to Use LocalPDF - Complete Guide to Free PDF Tools" />
        <meta property="og:description" content="Step-by-step guide on using LocalPDF's privacy-first PDF tools. Learn to merge, split, compress and edit PDFs in your browser." />
        <meta property="og:url" content="https://localpdf.online/how-to-use" />
        <meta property="og:type" content="article" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to Use LocalPDF - Complete Guide to Free PDF Tools" />
        <meta name="twitter:description" content="Step-by-step guide on using LocalPDF's privacy-first PDF tools." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Use LocalPDF PDF Tools",
            "description": "Complete guide on using LocalPDF's free PDF tools for merging, splitting, compressing and editing PDFs",
            "image": "https://localpdf.online/favicon.svg",
            "totalTime": "PT5M",
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "PDF files to process"
              },
              {
                "@type": "HowToSupply", 
                "name": "Modern web browser"
              }
            ],
            "tool": [
              {
                "@type": "HowToTool",
                "name": "LocalPDF"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "name": "Upload PDF files",
                "text": "Select or drag-and-drop your PDF files into LocalPDF",
                "image": "https://localpdf.online/favicon.svg"
              },
              {
                "@type": "HowToStep", 
                "name": "Choose PDF tool",
                "text": "Select the appropriate tool for your needs (merge, split, compress, etc.)",
                "image": "https://localpdf.online/favicon.svg"
              },
              {
                "@type": "HowToStep",
                "name": "Configure settings",
                "text": "Adjust tool-specific settings and options",
                "image": "https://localpdf.online/favicon.svg"
              },
              {
                "@type": "HowToStep",
                "name": "Process and download",
                "text": "Process your PDF and download the result",
                "image": "https://localpdf.online/favicon.svg"
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <main className="flex-grow max-w-5xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">How to Use LocalPDF</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Complete guide to using LocalPDF's 9 powerful PDF tools. Learn how to merge, split, compress, edit, and convert PDFs with complete privacy and security.
              </p>
            </header>

            {/* Quick Start Guide */}
            <section className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-800 mb-8 border-b border-gray-200 pb-3">
                🚀 Quick Start Guide
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 text-2xl">📁</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. Upload Files</h3>
                  <p className="text-sm text-gray-600">Drag & drop or click to select your PDF files</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 text-2xl">🛠️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. Choose Tool</h3>
                  <p className="text-sm text-gray-600">Select from 9 powerful PDF processing tools</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 text-2xl">⚙️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. Configure</h3>
                  <p className="text-sm text-gray-600">Adjust settings and options as needed</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-orange-600 text-2xl">💾</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">4. Download</h3>
                  <p className="text-sm text-gray-600">Process and download your result instantly</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="text-blue-500 text-2xl mr-4">💡</div>
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Key Benefits</h3>
                    <p className="text-blue-700">
                      All processing happens in your browser - no uploads, no registration, no tracking. 
                      Your files never leave your device, ensuring complete privacy and security.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* PDF Tools Detailed Guide */}
            <section className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-800 mb-8 border-b border-gray-200 pb-3">
                📄 PDF Tools Guide
              </h2>

              <div className="space-y-8">
                
                {/* Merge PDFs */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="text-blue-600 text-3xl mr-4">📄</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-blue-800 mb-3">Merge PDF Files</h3>
                      <p className="text-blue-700 mb-4">Combine multiple PDF files into one document.</p>
                      <div className="space-y-2 text-sm text-blue-700">
                        <p><strong>Step 1:</strong> Upload multiple PDF files (drag & drop or click to select)</p>
                        <p><strong>Step 2:</strong> Reorder files by dragging them in the list</p>
                        <p><strong>Step 3:</strong> Click "Merge PDFs" to combine them</p>
                        <p><strong>Step 4:</strong> Download your merged PDF file</p>
                      </div>
                      <div className="mt-4 p-3 bg-blue-100 rounded">
                        <p className="text-xs text-blue-600"><strong>Tip:</strong> You can merge up to 20 PDF files at once. The final order will match your arrangement in the file list.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Split PDFs */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="text-green-600 text-3xl mr-4">✂️</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-green-800 mb-3">Split PDF Files</h3>
                      <p className="text-green-700 mb-4">Extract specific pages or split PDFs into separate files.</p>
                      <div className="space-y-2 text-sm text-green-700">
                        <p><strong>Step 1:</strong> Upload a single PDF file</p>
                        <p><strong>Step 2:</strong> Choose split method (by page range, every X pages, or custom ranges)</p>
                        <p><strong>Step 3:</strong> Specify page numbers or ranges (e.g., "1-5, 8, 10-12")</p>
                        <p><strong>Step 4:</strong> Click "Split PDF" and download individual files</p>
                      </div>
                      <div className="mt-4 p-3 bg-green-100 rounded">
                        <p className="text-xs text-green-600"><strong>Tip:</strong> Use preview mode to see page thumbnails before splitting. Supports complex ranges like "1-3, 7, 15-20".</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compress PDFs */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="text-purple-600 text-3xl mr-4">🗜️</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-purple-800 mb-3">Compress PDF Files</h3>
                      <p className="text-purple-700 mb-4">Reduce PDF file size while maintaining quality.</p>
                      <div className="space-y-2 text-sm text-purple-700">
                        <p><strong>Step 1:</strong> Upload a PDF file</p>
                        <p><strong>Step 2:</strong> Adjust quality level (10%-100%)</p>
                        <p><strong>Step 3:</strong> Enable image compression, metadata removal, or web optimization</p>
                        <p><strong>Step 4:</strong> Click "Compress PDF" and download the smaller file</p>
                      </div>
                      <div className="mt-4 p-3 bg-purple-100 rounded">
                        <p className="text-xs text-purple-600"><strong>Tip:</strong> 80% quality usually provides the best balance between file size and visual quality. Enable image compression for maximum savings.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Text */}
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="text-yellow-600 text-3xl mr-4">✍️</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-yellow-800 mb-3">Add Text to PDFs</h3>
                      <p className="text-yellow-700 mb-4">Insert custom text, signatures, and annotations.</p>
                      <div className="space-y-2 text-sm text-yellow-700">
                        <p><strong>Step 1:</strong> Upload a PDF file</p>
                        <p><strong>Step 2:</strong> Click on the PDF preview where you want to add text</p>
                        <p><strong>Step 3:</strong> Type your text and adjust font, size, and color</p>
                        <p><strong>Step 4:</strong> Position and resize text boxes as needed</p>
                        <p><strong>Step 5:</strong> Save your modified PDF</p>
                      </div>
                      <div className="mt-4 p-3 bg-yellow-100 rounded">
                        <p className="text-xs text-yellow-600"><strong>Tip:</strong> Use different colors and fonts for signatures, stamps, or annotations. Text boxes can be moved and resized after creation.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional PDF Tools */}
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="text-red-600 text-3xl mr-4">🏷️</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-red-800 mb-3">Add Watermarks & More</h3>
                      <p className="text-red-700 mb-4">LocalPDF includes 5 additional powerful tools for comprehensive PDF editing.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-700">
                        <div>
                          <p><strong>🏷️ Watermarks:</strong> Add text or image watermarks</p>
                          <p><strong>🔄 Rotate Pages:</strong> Fix page orientation</p>
                          <p><strong>📑 Extract Pages:</strong> Create new PDFs from selected pages</p>
                        </div>
                        <div>
                          <p><strong>📝 Extract Text:</strong> Get text content from PDFs</p>
                          <p><strong>🖼️ PDF to Images:</strong> Convert pages to PNG/JPEG</p>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-red-100 rounded">
                        <p className="text-xs text-red-600"><strong>All tools work the same way:</strong> Upload → Configure → Process → Download. Each tool has specific options tailored to its function.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Advanced Tips */}
            <section className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-800 mb-8 border-b border-gray-200 pb-3">
                💡 Advanced Tips & Tricks
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">🚀 Performance Tips</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Close other browser tabs for large files ({'>'}50MB)</li>
                    <li>• Use Chrome or Firefox for best performance</li>
                    <li>• Enable hardware acceleration in browser settings</li>
                    <li>• Process very large files in smaller batches</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">⌨️ Keyboard Shortcuts</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <strong>Ctrl+O</strong> - Open file dialog</li>
                    <li>• <strong>Ctrl+S</strong> - Save/download result</li>
                    <li>• <strong>Ctrl+Z</strong> - Undo last action</li>
                    <li>• <strong>Tab</strong> - Navigate interface elements</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">📱 Mobile Usage</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• All tools work on smartphones and tablets</li>
                    <li>• Use landscape orientation for better UI</li>
                    <li>• Touch and pinch gestures supported</li>
                    <li>• Files can be opened from cloud storage apps</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">🔧 Troubleshooting</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Refresh page if tool becomes unresponsive</li>
                    <li>• Clear browser cache for persistent issues</li>
                    <li>• Ensure JavaScript is enabled</li>
                    <li>• Update browser to latest version</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* File Format Support */}
            <section className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-800 mb-8 border-b border-gray-200 pb-3">
                📋 File Format Support
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3">✅ Supported Input</h3>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• PDF files (any version)</li>
                    <li>• Multi-page documents</li>
                    <li>• Text and image PDFs</li>
                    <li>• Forms and annotations</li>
                    <li>• Files up to 100MB</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-3">📤 Output Formats</h3>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• PDF (processed documents)</li>
                    <li>• PNG (high quality images)</li>
                    <li>• JPEG (compressed images)</li>
                    <li>• WEBP (modern format)</li>
                    <li>• TXT (extracted text)</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-3">⚠️ Limitations</h3>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>• Maximum file size: 100MB</li>
                    <li>• Password-protected files not supported</li>
                    <li>• Some complex PDF structures may fail</li>
                    <li>• Scanned PDFs: limited text extraction</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Privacy & Security Guide */}
            <section className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-800 mb-8 border-b border-gray-200 pb-3">
                🔒 Privacy & Security Guide
              </h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-green-800 mb-4">✅ What LocalPDF Does</h3>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li>• Processes files entirely in your browser</li>
                      <li>• Uses client-side JavaScript for all operations</li>
                      <li>• Automatically clears files from memory</li>
                      <li>• Works completely offline after first load</li>
                      <li>• Open source and transparent</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-green-800 mb-4">❌ What LocalPDF Never Does</h3>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li>• Upload files to servers</li>
                      <li>• Store or cache your documents</li>
                      <li>• Track user behavior or collect analytics</li>
                      <li>• Require accounts or registration</li>
                      <li>• Use cookies for tracking</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-100 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Perfect for confidential documents:</strong> Since all processing is local, LocalPDF is ideal for 
                    sensitive documents, legal files, financial records, or any confidential PDFs.
                  </p>
                </div>
              </div>
            </section>

            {/* Need Help Section */}
            <section className="bg-gray-100 p-8 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">🆘 Need Additional Help?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg text-center">
                  <div className="text-blue-500 text-3xl mb-4">📖</div>
                  <h3 className="font-semibold text-gray-800 mb-3">Documentation</h3>
                  <p className="text-gray-600 text-sm mb-4">Comprehensive guides and tutorials for all PDF tools</p>
                  <a 
                    href="/faq" 
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    View FAQ
                  </a>
                </div>
                
                <div className="bg-white p-6 rounded-lg text-center">
                  <div className="text-green-500 text-3xl mb-4">💬</div>
                  <h3 className="font-semibold text-gray-800 mb-3">Community Support</h3>
                  <p className="text-gray-600 text-sm mb-4">Get help from the LocalPDF community</p>
                  <a 
                    href="https://github.com/ulinycoin/clientpdf-pro/discussions" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Join Discussions
                  </a>
                </div>
                
                <div className="bg-white p-6 rounded-lg text-center">
                  <div className="text-red-500 text-3xl mb-4">🐛</div>
                  <h3 className="font-semibold text-gray-800 mb-3">Report Issues</h3>
                  <p className="text-gray-600 text-sm mb-4">Found a bug or have a suggestion?</p>
                  <a 
                    href="https://github.com/ulinycoin/clientpdf-pro/issues" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Report Issue
                  </a>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  LocalPDF is open source software maintained by the community. 
                  Your feedback helps us improve the tools for everyone.
                </p>
              </div>
            </section>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HowToUsePage;