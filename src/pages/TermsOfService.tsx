import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Shield, Gavel, Users, Clock } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Service - LocalPDF | Free Online PDF Tools';
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Home
        </Link>
        
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center mb-4">
            <div className="bg-white/20 p-3 rounded-lg mr-4">
              <Gavel className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Terms of Service</h1>
              <p className="text-blue-100 mt-2">LocalPDF Service Agreement</p>
            </div>
          </div>
          <p className="text-blue-100 leading-relaxed">
            These terms govern your use of LocalPDF's free online PDF processing tools. 
            By using our service, you agree to these terms and our commitment to your privacy.
          </p>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-900">Privacy First</h3>
          </div>
          <p className="text-sm text-blue-700">All processing happens locally in your browser</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-green-900">Free Service</h3>
          </div>
          <p className="text-sm text-green-700">Always free with no hidden costs</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="font-semibold text-purple-900">Effective Date</h3>
          </div>
          <p className="text-sm text-purple-700">January 1, 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="prose max-w-none">
          
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using LocalPDF services, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms of Service. If you do not agree to these terms, 
              please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              Service Description
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              LocalPDF provides free online PDF processing tools including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>PDF merging and combining</li>
              <li>PDF splitting and page extraction</li>
              <li>PDF compression and optimization</li>
              <li>Image to PDF conversion</li>
            </ul>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <p className="text-green-800 text-sm">
                <strong>Privacy Guarantee:</strong> All file processing occurs locally in your browser. 
                Your files are never uploaded to our servers or shared with third parties.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
              User Responsibilities
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">By using LocalPDF, you agree to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to interfere with or disrupt the service</li>
              <li>Not use the service to process copyrighted material without permission</li>
              <li>Not attempt to reverse engineer or modify the service</li>
              <li>Respect the intellectual property rights of others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
              Privacy and Data Processing
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              LocalPDF is designed with privacy as a core principle:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Local Processing:</strong> All PDF operations are performed in your browser using JavaScript</li>
              <li><strong>No File Uploads:</strong> Your files never leave your device</li>
              <li><strong>No Data Collection:</strong> We do not collect or store your personal files</li>
              <li><strong>Analytics:</strong> We may use privacy-respecting analytics to improve the service</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              For complete details, please review our{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">5</span>
              Disclaimers and Limitations
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm font-medium">
                <strong>Service Availability:</strong> LocalPDF is provided "as is" without warranties of any kind.
              </p>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>We do not guarantee uninterrupted service availability</li>
              <li>We are not responsible for data loss (though files never leave your device)</li>
              <li>Users are responsible for maintaining backups of important files</li>
              <li>Service features may change or be discontinued with notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">6</span>
              Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              LocalPDF respects intellectual property rights:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Users retain all rights to their uploaded files and processed documents</li>
              <li>LocalPDF source code and design are protected by copyright</li>
              <li>Users must have legal rights to process any files they upload</li>
              <li>We do not claim ownership of user-generated content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">7</span>
              Limitation of Liability
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm font-medium">
                <strong>Important:</strong> LocalPDF's liability is limited to the maximum extent permitted by law.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the fullest extent permitted by applicable law, LocalPDF shall not be liable for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Any indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Damages resulting from service interruptions or technical issues</li>
              <li>Any damages exceeding the amount paid for the service (which is free)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">8</span>
              Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update these Terms of Service from time to time. When we do, we will post the 
              updated terms on this page and update the effective date. Your continued use of LocalPDF 
              after any changes indicates your acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">9</span>
              Termination
            </h2>
            <p className="text-gray-700 leading-relaxed">
              You may stop using LocalPDF at any time. We reserve the right to suspend or terminate 
              access to our services for users who violate these terms, though enforcement primarily 
              relies on good faith given our privacy-first approach.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">10</span>
              Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700">
                <strong>Email:</strong>{' '}
                <a href="mailto:localpdfpro@gmail.com" className="text-blue-600 hover:text-blue-700">
                  localpdfpro@gmail.com
                </a>
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Response Time:</strong> We typically respond within 48 hours
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">11</span>
              Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service are governed by and construed in accordance with the laws of 
              the jurisdiction in which LocalPDF operates, without regard to conflict of law principles.
            </p>
          </section>

        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="text-center">
          <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Ready to Process PDFs Securely?
          </h3>
          <p className="text-blue-700 mb-4">
            Start using our privacy-first PDF tools now - no registration required
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-gray-500 text-sm mt-6">
        <p>Last updated: January 1, 2025</p>
        <p className="mt-1">
          Review our{' '}
          <Link to="/privacy" className="text-blue-600 hover:text-blue-700 underline">
            Privacy Policy
          </Link>
          {' '}and{' '}
          <Link to="/faq" className="text-blue-600 hover:text-blue-700 underline">
            FAQ
          </Link>
        </p>
      </div>
    </div>
  );
};
