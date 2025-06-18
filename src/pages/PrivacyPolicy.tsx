import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server, Cookie, Github, Mail, FileCheck, UserCheck } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface PrivacyPolicyProps {
  companyName?: string;
  email?: string;
  lastUpdated?: string;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  companyName = 'SIA "UL-COIN"',
  email = 'localpdfpro@gmail.com',
  lastUpdated = 'December 2024'
}) => {
  // SEO optimization for privacy policy page
  useSEO({
    title: 'Privacy Policy - LocalPDF | Data Protection & Security',
    description: 'Learn about LocalPDF\'s privacy policy and data protection measures. We process files locally in your browser with no uploads to servers for complete privacy.',
    keywords: 'privacy policy, data protection, PDF privacy, browser processing, GDPR compliance',
    canonical: 'https://localpdf.online/privacy',
    ogImage: 'https://localpdf.online/og-image.png',
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Privacy Policy - LocalPDF',
      'description': 'LocalPDF privacy policy explaining our commitment to user privacy and data protection',
      'url': 'https://localpdf.online/privacy',
      'publisher': {
        '@type': 'Organization',
        'name': 'LocalPDF',
        'url': 'https://localpdf.online'
      },
      'dateModified': '2024-12-01',
      'inLanguage': 'en-US'
    }
  });

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const features = [
    {
      icon: Shield,
      title: "Complete Privacy",
      description: "All files are processed locally in your browser"
    },
    {
      icon: Server,
      title: "No Servers",
      description: "Your documents never leave your device"
    },
    {
      icon: Lock,
      title: "Secure by Design",
      description: "HTTPS encryption and isolated execution environment"
    },
    {
      icon: Github,
      title: "Open Source",
      description: "Fully transparent code for your trust"
    }
  ];

  const rights = [
    {
      icon: UserCheck,
      title: "Your GDPR Rights",
      items: [
        "Access your data anytime",
        "Delete local data through browser",
        "Opt-out of analytics",
        "Review our source code"
      ]
    },
    {
      icon: FileCheck,
      title: "Data Protection",
      items: [
        "No file uploads to servers",
        "No data retention",
        "Anonymous usage",
        "Transparent processing"
      ]
    }
  ];

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-12"
      initial="initial"
      animate="animate"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div className="text-center mb-12" {...fadeIn}>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Privacy Policy
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Your privacy is our priority
        </p>
        <p className="text-sm text-gray-500">
          Last updated: {lastUpdated}
        </p>
      </motion.div>

      {/* Privacy Badge */}
      <motion.div 
        className="bg-green-50 border border-green-300 rounded-lg p-6 mb-12 shadow-sm"
        {...fadeIn}
      >
        <div className="flex items-center justify-center">
          <Shield className="w-12 h-12 text-green-600 mr-4" />
          <div>
            <h2 className="text-2xl font-bold text-green-800">
              100% Private & Secure
            </h2>
            <p className="text-green-700">
              Your files never leave your browser. No uploads. No tracking.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key Features Grid */}
      <motion.div 
        className="grid md:grid-cols-2 gap-6 mb-12"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg"
            variants={fadeIn}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center mb-4">
              <feature.icon className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">
                {feature.title}
              </h3>
            </div>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* GDPR Rights Section */}
      <motion.div className="mb-12" {...fadeIn}>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Your Rights & Our Commitments
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {rights.map((section, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg p-6 shadow-md border border-gray-200"
              variants={fadeIn}
            >
              <div className="flex items-center mb-4">
                <section.icon className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-800">
                  {section.title}
                </h3>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Company Information */}
      <motion.div 
        className="bg-blue-50 rounded-lg p-8 mb-12 border border-blue-200"
        {...fadeIn}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Data Controller Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Company</h3>
            <p className="text-gray-700">{companyName}</p>
            <p className="text-gray-600">Registered in Latvia</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Contact</h3>
            <a 
              href={`mailto:${email}`}
              className="text-blue-600 hover:underline flex items-center"
            >
              <Mail className="w-4 h-4 mr-2" />
              {email}
            </a>
          </div>
        </div>
      </motion.div>

      {/* SEO Content Section */}
      <motion.div className="mb-12 prose prose-gray max-w-none" {...fadeIn}>
        <h2>Our Privacy Commitment</h2>
        <p>
          LocalPDF is built with privacy by design. Unlike traditional online PDF tools that require 
          uploading your files to remote servers, LocalPDF processes everything locally in your browser. 
          This fundamental architectural choice ensures that your sensitive documents never leave your device.
        </p>
        
        <h3>How Local Processing Protects Your Privacy</h3>
        <p>
          When you use LocalPDF, your files are loaded directly into your browser's memory and processed 
          using client-side JavaScript libraries. This means:
        </p>
        <ul>
          <li>No file uploads to external servers</li>
          <li>No data transmission over the internet</li>
          <li>No risk of data breaches or unauthorized access</li>
          <li>Full compliance with GDPR and other privacy regulations</li>
        </ul>

        <h3>Data We Collect</h3>
        <p>
          LocalPDF collects minimal anonymous usage statistics to improve our service, including:
        </p>
        <ul>
          <li>Which features are used most frequently</li>
          <li>Browser type and version for compatibility</li>
          <li>General performance metrics</li>
        </ul>
        <p>
          We never collect file names, file contents, or any personally identifiable information.
        </p>

        <h3>Your Rights Under GDPR</h3>
        <p>
          As a user of LocalPDF, you have complete control over your data. Since we don't store your files 
          or personal information on our servers, you can:
        </p>
        <ul>
          <li>Use our service anonymously without creating an account</li>
          <li>Clear your browser data to remove any local storage</li>
          <li>Opt out of analytics using browser settings</li>
          <li>Review our complete source code on GitHub</li>
        </ul>
      </motion.div>

      {/* Quick Links */}
      <motion.div 
        className="flex flex-wrap justify-center gap-4"
        {...fadeIn}
      >
        <a
          href="https://github.com/ulinycoin/clientpdf-pro"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md"
        >
          <Github className="w-5 h-5 mr-2" />
          View Source Code
        </a>
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Mail className="w-5 h-5 mr-2" />
          Contact Us
        </a>
      </motion.div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;