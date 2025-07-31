import Head from 'next/head';
import { GetStaticProps } from 'next';
import { toolsSEOData } from '../src/data/seoData';
import Header from '../src/components/organisms/Header';
import Footer from '../src/components/organisms/Footer';
import CompressionTool from '../src/components/organisms/CompressionTool';
import { RelatedTools } from '../src/components/common/RelatedTools';
import { Breadcrumbs } from '../src/components/common/Breadcrumbs';

interface CompressPDFPageProps {
  seoData: typeof toolsSEOData.compress;
}

export default function CompressPDFPage({ seoData }: CompressPDFPageProps) {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Compress PDF', href: '/compress-pdf' }
  ];

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
        <meta property="og:image" content="https://localpdf.online/og-compress-pdf.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seoData.structuredData)
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbs} />

          {/* Hero Section */}
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Compress PDF Files Free Online
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Compress PDF files to reduce size without losing quality. Free PDF compression tool that works
              in your browser. <strong>No file uploads required.</strong>
            </p>
          </section>

          {/* Tool Component */}
          <section className="mb-16">
            <CompressionTool />
          </section>

          {/* SEO Content */}
          <section className="max-w-4xl mx-auto mb-16">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold mb-6">How to Compress PDF Files</h2>

              <div className="prose max-w-none">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Simple PDF Compression</h3>
                    <ol className="list-decimal list-inside space-y-3 text-gray-600">
                      <li>Select your PDF file by clicking "Choose File" or drag and drop</li>
                      <li>Choose compression level: Light, Medium, or Maximum</li>
                      <li>Click "Compress PDF" to start the optimization process</li>
                      <li>Preview the size reduction and quality</li>
                      <li>Download your compressed PDF file</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Compression Benefits</h3>
                    <ul className="list-disc list-inside space-y-3 text-gray-600">
                      <li><strong>Email Friendly:</strong> Meet attachment size limits</li>
                      <li><strong>Faster Uploads:</strong> Reduced file transfer times</li>
                      <li><strong>Storage Savings:</strong> Free up valuable disk space</li>
                      <li><strong>Web Optimization:</strong> Faster loading on websites</li>
                      <li><strong>Bandwidth Efficient:</strong> Lower data usage</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold mb-4">Compression Levels Explained</h3>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold mb-2 text-green-800">Light Compression</h4>
                    <p className="text-sm text-gray-600 mb-2">10-30% size reduction</p>
                    <p className="text-sm text-gray-600">Minimal quality loss, perfect for documents with text and simple graphics.</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold mb-2 text-yellow-800">Medium Compression</h4>
                    <p className="text-sm text-gray-600 mb-2">30-60% size reduction</p>
                    <p className="text-sm text-gray-600">Balanced approach, good for mixed content with images and text.</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold mb-2 text-red-800">Maximum Compression</h4>
                    <p className="text-sm text-gray-600 mb-2">60-80% size reduction</p>
                    <p className="text-sm text-gray-600">Aggressive compression for web use or when file size is critical.</p>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold mb-4">Why Choose LocalPDF Compressor?</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold">Advanced Algorithms</h4>
                      <p className="text-gray-600 text-sm">Uses state-of-the-art compression techniques to maximize size reduction while preserving quality.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold">Privacy Protected</h4>
                      <p className="text-gray-600 text-sm">Your PDF files are processed locally in your browser - no uploads to external servers.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold">No File Size Limits</h4>
                      <p className="text-gray-600 text-sm">Compress PDFs of any size without restrictions or premium account requirements.</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold mb-4">Common Use Cases</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                  <li><strong>Email Attachments:</strong> Reduce file size to meet email provider limits (usually 25MB)</li>
                  <li><strong>Web Publishing:</strong> Optimize PDFs for faster website loading and better user experience</li>
                  <li><strong>Cloud Storage:</strong> Save space on Google Drive, Dropbox, or other cloud services</li>
                  <li><strong>Mobile Sharing:</strong> Reduce data usage when sharing files via mobile networks</li>
                  <li><strong>Archive Management:</strong> Compress document archives to save storage space</li>
                </ul>

                <div className="bg-orange-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">💡 Pro Tip</h4>
                  <p className="text-orange-800">
                    For documents with many images, try Medium compression first. If you need smaller files for email,
                    use Maximum compression. You can always use our <a href="/split-pdf" className="underline">Split PDF tool</a>
                    to divide large documents into smaller, more manageable files.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Related Tools */}
          <RelatedTools currentTool="compress" />
        </main>

        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      seoData: toolsSEOData.compress
    }
  };
};
