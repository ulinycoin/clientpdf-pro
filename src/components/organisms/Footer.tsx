import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Privacy */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">LocalPDF</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Free, fast, and secure PDF tools that work entirely in your browser. 
              Your files never leave your device.
            </p>
            <div className="flex items-center space-x-2 text-green-400">
              <span className="text-lg">🔒</span>
              <span className="text-sm font-medium">100% Private & Secure</span>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold mb-4">PDF Tools</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  📄 Merge PDFs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  🗜️ Compress PDF
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  ✂️ Split PDF
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  🔄 Rotate Pages
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  ✍️ Add Text
                </a>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a 
                  href="https://github.com/ulinycoin/clientpdf-pro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center space-x-2"
                >
                  <span>💻</span>
                  <span>Source Code</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/ulinycoin/clientpdf-pro/blob/main/PRIVACY.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center space-x-2"
                >
                  <span>🔒</span>
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/ulinycoin/clientpdf-pro/blob/main/FAQ.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center space-x-2"
                >
                  <span>❓</span>
                  <span>Help & FAQ</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/ulinycoin/clientpdf-pro/issues" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center space-x-2"
                >
                  <span>📞</span>
                  <span>Contact & Support</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {currentYear} LocalPDF. Open Source Project.
            </div>

            {/* Tech Stack */}
            <div className="text-gray-400 text-sm">
              Built with React + TypeScript + pdf-lib
            </div>

            {/* Key Message */}
            <div className="text-green-400 text-sm font-medium">
              Your privacy is our priority
            </div>
          </div>
        </div>

        {/* Additional Trust Message */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs max-w-2xl mx-auto">
            All PDF processing happens locally in your browser. No files are uploaded to servers. 
            No data collection. No tracking. Open source and transparent.
          </p>
          <div className="mt-3 flex justify-center space-x-6 text-xs">
            <a 
              href="https://github.com/ulinycoin/clientpdf-pro/blob/main/PRIVACY.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-gray-600">•</span>
            <a 
              href="https://github.com/ulinycoin/clientpdf-pro/blob/main/FAQ.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              FAQ
            </a>
            <span className="text-gray-600">•</span>
            <a 
              href="https://localpdf.online" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              localpdf.online
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;