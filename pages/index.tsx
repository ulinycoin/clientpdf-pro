import Head from 'next/head';
import { GetStaticProps } from 'next';
import { homepageSEOData } from '../src/data/seoData';
import ToolsGrid from '../src/components/organisms/ToolsGrid';
import Header from '../src/components/organisms/Header';
import Footer from '../src/components/organisms/Footer';

interface HomePageProps {
  seoData: typeof homepageSEOData;
}

export default function HomePage({ seoData }: HomePageProps) {
  return (
    <>
      <Head>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <link rel="canonical" href={seoData.canonical} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content={seoData.canonical} />
        <meta property="og:site_name" content="LocalPDF" />
        <meta property="og:image" content="https://localpdf.online/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content="https://localpdf.online/og-image.png" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seoData.structuredData)
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Privacy-First <span className="text-blue-600">PDF Tools</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              13 powerful PDF tools that work entirely in your browser.
              <strong className="text-gray-800"> No uploads, no tracking, completely free.</strong>
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">100% Private</h3>
                <p className="text-gray-600 text-sm">Your files never leave your browser. Complete privacy guaranteed.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600 text-sm">Process files instantly with browser-based technology.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Always Free</h3>
                <p className="text-gray-600 text-sm">No subscriptions, no limits. All tools free forever.</p>
              </div>
            </div>
          </section>

          {/* Tools Grid */}
          <section>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Choose Your PDF Tool
            </h2>
            <ToolsGrid />
          </section>

          {/* SEO Content Section */}
          <section className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Why Choose LocalPDF for Your PDF Needs?</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-4">
                  LocalPDF revolutionizes how you work with PDF files by putting privacy first. Unlike traditional online PDF tools that upload your sensitive documents to remote servers, our platform processes everything locally in your browser using cutting-edge WebAssembly technology.
                </p>
                <h3 className="text-xl font-semibold mb-3">Complete PDF Toolkit</h3>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                  <li><strong>Merge PDF files</strong> - Combine multiple documents into one</li>
                  <li><strong>Split PDF documents</strong> - Extract specific pages or ranges</li>
                  <li><strong>Compress PDFs</strong> - Reduce file size without quality loss</li>
                  <li><strong>Add text to PDFs</strong> - Insert custom text and signatures</li>
                  <li><strong>Watermark protection</strong> - Brand and protect your documents</li>
                  <li><strong>Convert files</strong> - Transform images, Word docs, and Excel files to PDF</li>
                  <li><strong>OCR text recognition</strong> - Extract text from scanned documents</li>
                </ul>
                <h3 className="text-xl font-semibold mb-3">Privacy-First Technology</h3>
                <p className="text-gray-600 mb-4">
                  Our browser-based processing means your confidential documents never leave your device. No account creation, no file uploads to servers, and no tracking. Perfect for legal documents, financial reports, medical records, and any sensitive information.
                </p>
                <h3 className="text-xl font-semibold mb-3">Professional Results</h3>
                <p className="text-gray-600">
                  Whether you're a business professional, student, or casual user, LocalPDF delivers enterprise-grade PDF processing with consumer-friendly simplicity. All tools are optimized for mobile and desktop use with drag-and-drop interfaces and instant results.
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      seoData: homepageSEOData
    }
  };
};
