import Head from 'next/head';
import { GetStaticProps } from 'next';
import { toolsSEOData } from '../src/data/seoData';
import Header from '../src/components/organisms/Header';
import Footer from '../src/components/organisms/Footer';
import MergeTool from '../src/components/organisms/MergeTool';
import { RelatedTools } from '../src/components/common/RelatedTools';
import { Breadcrumbs } from '../src/components/common/Breadcrumbs';
import { TwitterCardImage } from '../src/components/TwitterCardImage';

interface MergePDFPageProps {
  seoData: typeof toolsSEOData.merge;
}

export default function MergePDFPage({ seoData }: MergePDFPageProps) {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Merge PDF', href: '/merge-pdf' }
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
        <meta property="og:image" content="https://localpdf.online/og-merge-pdf.png" />

        {/* Twitter Card */}
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <TwitterCardImage toolId="merge-pdf" />

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
          <Breadcrumbs items={breadcrumbs} />

          {/* Hero Section */}
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Merge PDF Files Free Online
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Combine multiple PDF files into one document for free. Fast, secure, and private PDF merging
              in your browser. <strong>No uploads, no registration required.</strong>
            </p>
          </section>

          {/* Tool Component */}
          <section className="mb-16">
            <MergeTool />
          </section>

          {/* SEO Content */}
          <section className="max-w-4xl mx-auto mb-16">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold mb-6">How to Merge PDF Files Online</h2>

              <div className="prose max-w-none">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Step-by-Step Guide</h3>
                    <ol className="list-decimal list-inside space-y-3 text-gray-600">
                      <li>Click "Select PDF Files" or drag and drop your PDF files</li>
                      <li>Upload multiple PDF documents you want to combine</li>
                      <li>Reorder files by dragging them to your preferred sequence</li>
                      <li>Click "Merge PDFs" to combine all files into one document</li>
                      <li>Download your merged PDF file instantly</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Why Choose LocalPDF Merger?</h3>
                    <ul className="list-disc list-inside space-y-3 text-gray-600">
                      <li><strong>100% Private:</strong> Files processed locally in your browser</li>
                      <li><strong>No File Size Limits:</strong> Merge PDFs of any size</li>
                      <li><strong>Unlimited Usage:</strong> Combine as many files as needed</li>
                      <li><strong>Preserve Quality:</strong> Original document quality maintained</li>
                      <li><strong>Fast Processing:</strong> Instant merging with drag-and-drop interface</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold mb-4">Common Use Cases for PDF Merging</h3>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Business Documents</h4>
                    <p className="text-sm text-gray-600">Combine contracts, reports, and presentations into comprehensive business packages.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Academic Research</h4>
                    <p className="text-sm text-gray-600">Merge research papers, thesis chapters, and academic references into single documents.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Legal Documents</h4>
                    <p className="text-sm text-gray-600">Combine legal briefs, evidence files, and case documents with complete privacy.</p>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold mb-4">Privacy and Security</h3>
                <p className="text-gray-600 mb-4">
                  Unlike other online PDF merge tools, LocalPDF processes your documents entirely within your browser.
                  Your sensitive files never leave your device, ensuring complete privacy and security. This makes our
                  tool perfect for confidential business documents, legal papers, financial reports, and personal files.
                </p>

                <h3 className="text-2xl font-semibold mb-4">Technical Features</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                  <li>Support for all PDF versions and formats</li>
                  <li>Maintains bookmarks and hyperlinks</li>
                  <li>Preserves form fields and annotations</li>
                  <li>Handles password-protected PDFs</li>
                  <li>Works on all devices and browsers</li>
                  <li>No software installation required</li>
                </ul>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
                  <p className="text-blue-800">
                    For best results, ensure your PDF files are not corrupted and have similar page orientations.
                    You can use our <a href="/rotate-pdf" className="underline">PDF Rotate tool</a> to fix orientations before merging.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Related Tools */}
          <RelatedTools currentTool="merge" />
        </main>

        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      seoData: toolsSEOData.merge
    }
  };
};
