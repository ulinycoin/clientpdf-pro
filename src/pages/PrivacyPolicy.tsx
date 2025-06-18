import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server, Cookie, Github, Mail, FileCheck, UserCheck } from 'lucide-react';

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