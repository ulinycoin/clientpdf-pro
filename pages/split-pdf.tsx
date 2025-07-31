import Head from 'next/head';
import { GetStaticProps } from 'next';
import { toolsSEOData } from '../src/data/seoData';
import Header from '../src/components/organisms/Header';
import Footer from '../src/components/organisms/Footer';
import SplitTool from '../src/components/organisms/SplitTool';
import { RelatedTools } from '../src/components/common/RelatedTools';
import { Breadcrumbs } from '../src/components/common/Breadcrumbs';

interface SplitPDFPageProps {
  seoData: typeof toolsSEOData.split;
}

export default function SplitPDFPage({ seoData }: SplitPDFPageProps) {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Split PDF', href: '/split-pdf' }
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
        <meta property="og:image" content="https://localpdf.online/og-split-pdf.png" />

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

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbs} />

          {/* Hero Section */}
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Split PDF Files Free Online
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Split PDF files by pages or ranges for free. Extract specific pages from PDF documents.
              <strong> Private and secure PDF splitting in your browser.</strong>
            </p>
          </section>

          {/* Tool Component */}
          <section className="mb-16">
            <SplitTool />
          </section>

          {/* SEO Content */}
          <section className="max-w-4xl mx-auto mb-16">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold mb-6">How to Split PDF Files Online</h2>

              <div className="prose max-w-none">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Easy PDF Splitting</h3>
                    <ol className="list-decimal list-inside space-y-3 text-gray-600">
                      <li>Upload your PDF file by clicking "Select PDF" or drag and drop</li>
                      <li>Choose splitting method: by pages, ranges, or extract specific pages</li>
                      <li>Select the pages you want to extract or specify page ranges</li>
                      <li>Click "Split PDF" to process your document</li>
                      <li>Download individual PDF files or a ZIP archive</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Advanced Splitting Options</h3>
                    <ul className="list-disc list-inside space-y-3 text-gray-600">
                      <li><strong>Page Ranges:</strong> Split by specific page ranges (e.g., 1-5, 10-15)</li>
                      <li><strong>Individual Pages:</strong> Extract single pages as separate PDFs</li>
                      <li><strong>Batch Processing:</strong> Split multiple documents at once</li>
                      <li><strong>Preview Mode:</strong> See pages before splitting</li>
                      <li><strong>Custom Names:</strong> Rename output files automatically</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold mb-4">When to Use PDF Splitting</h3>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Document Management</h4>
                    <p className="text-sm text-gray-600">Separate chapters, sections, or departments from large PDF documents for easier organization.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Email Sharing</h4>
                    <p className="text-sm text-gray-600">Split large PDFs to meet email attachment size limits or share specific sections only.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Content Extraction</h4>
                    <p className="text-sm text-gray-600">Extract specific pages like invoices, certificates, or forms from multi-page documents.</p>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold mb-4">Privacy-First PDF Splitting</h3>
                <p className="text-gray-600 mb-4">
                  Our PDF splitter works entirely in your browser using advanced Web APIs. Your documents never
                  leave your device, making it perfect for confidential files, legal documents, medical records,
                  and financial statements. No server uploads mean zero privacy risks.
                </p>

                <h3 className="text-2xl font-semibold mb-4">Splitting Methods Explained</h3>
                <div className="space-y-4 mb-6">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold mb-2">Split by Page Range</h4>
                    <p className="text-gray-600">Define specific page ranges to create multiple PDF files. Perfect for separating chapters or sections.</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold mb-2">Extract Individual Pages</h4>
                    <p className="text-gray-600">Create separate PDF files for each page. Ideal for distributing single-page documents.</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold mb-2">Custom Page Selection</h4>
                    <p className="text-gray-600">Choose specific pages (e.g., pages 2, 5, 7-10) to create a custom PDF with only the content you need.</p>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">💡 Pro Tip</h4>
                  <p className="text-green-800">
                    Use page ranges like "1-3, 7-9, 15" to extract multiple sections at once. You can also
                    combine splitting with our <a href="/merge-pdf" className="underline">PDF Merge tool</a> to
                    reorganize document sections.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Related Tools */}
          <RelatedTools currentTool="split" />
        </main>

        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      seoData: toolsSEOData.split
    }
  };
};
