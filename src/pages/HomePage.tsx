import Header from '../components/organisms/Header'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Free PDF Tools
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Convert, merge, split and compress PDFs - all locally in your browser
            </p>
            <p className="text-sm text-gray-500">
              🔒 Your files never leave your device • 🚀 Fast processing • 💯 Completely free
            </p>
          </div>
        </div>

        {/* Tools section placeholder */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                PDF Tools Coming Soon
              </h2>
              <p className="text-gray-600">
                Merge • Split • Compress • Convert
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage
