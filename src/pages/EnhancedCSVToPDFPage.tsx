                        variant="secondary"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Try Interactive Mode
                      </Button>
                      <Button 
                        onClick={handleConvert}
                        disabled={isConverting}
                        className="btn-primary-modern flex items-center"
                      >
                        {isConverting ? (
                          <>
                            <Spinner size="sm" className="mr-2" />
                            Converting...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Generate PDF
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🆕 Enhanced Features
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience the next generation of CSV to PDF conversion with intelligent features and professional results
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="p-6 text-center glass-card hover-lift">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
                <p className="text-gray-600 text-sm">
                  See your PDF update in real-time as you make changes to data and styling
                </p>
              </Card>

              <Card className="p-6 text-center glass-card hover-lift">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Parsing</h3>
                <p className="text-gray-600 text-sm">
                  Advanced CSV analysis with automatic delimiter and encoding detection
                </p>
              </Card>

              <Card className="p-6 text-center glass-card hover-lift">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">15+ Languages</h3>
                <p className="text-gray-600 text-sm">
                  Automatic language detection and smart font recommendations for global content
                </p>
              </Card>

              <Card className="p-6 text-center glass-card hover-lift">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
                <p className="text-gray-600 text-sm">
                  All processing happens locally in your browser. Your data never leaves your device
                </p>
              </Card>
            </div>

            {/* Interactive Mode Showcase */}
            <div className="mt-12 max-w-4xl mx-auto">
              <Card className="p-8 glass-card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">Interactive Mode Highlights</h3>
                  </div>
                  <p className="text-gray-700">
                    Transform your CSV workflow with our cutting-edge interactive editor
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Real-time Editing</h4>
                        <p className="text-sm text-gray-600">Edit data directly in the interface with instant PDF updates</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Smart Language Detection</h4>
                        <p className="text-sm text-gray-600">Automatic detection of Russian, Latvian, Lithuanian, and 12 more languages</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Professional Themes</h4>
                        <p className="text-sm text-gray-600">Choose from business, academic, and creative templates</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">4</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Drag & Drop Columns</h4>
                        <p className="text-sm text-gray-600">Reorder columns visually with smooth animations</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">5</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Font Intelligence</h4>
                        <p className="text-sm text-gray-600">Optimal font selection based on content analysis</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">6</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Performance Optimized</h4>
                        <p className="text-sm text-gray-600">Handle large datasets up to 50MB with smooth performance</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-purple-200">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="text-purple-900 font-medium">
                      Ready to experience the future of CSV to PDF conversion?
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* SEO Content Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <Card className="p-8 glass-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Next-Generation CSV to PDF Conversion
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 mb-4">
                  Our enhanced CSV to PDF converter combines the reliability of our proven conversion engine with cutting-edge 
                  interactive features. Whether you're working with multilingual data, complex datasets, or need pixel-perfect 
                  formatting, our tools deliver professional results every time.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enhanced Features:</h3>
                <ul className="text-gray-600 space-y-1 mb-4">
                  <li>• **Interactive Live Preview** - See your PDF update in real-time as you make changes</li>
                  <li>• **15+ Language Support** - Automatic detection and optimization for global content</li>
                  <li>• **Smart Font Intelligence** - Optimal font selection based on content analysis</li>
                  <li>• **Professional Templates** - Business, academic, and creative styling options</li>
                  <li>• **Real-time Data Editing** - Modify your data directly in the browser interface</li>
                  <li>• **Drag & Drop Columns** - Visual column reordering with smooth animations</li>
                  <li>• **Advanced Unicode Support** - Perfect rendering of special characters and symbols</li>
                  <li>• **Performance Optimized** - Handle datasets up to 50MB with smooth performance</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Language Support:</h3>
                <p className="text-gray-600 mb-4">
                  Our intelligent language detection system automatically identifies and optimizes for Russian (Русский), 
                  Latvian (Latviešu), Lithuanian (Lietuvių), Estonian (Eesti), Polish (Polski), German (Deutsch), 
                  French (Français), Spanish (Español), Italian (Italiano), Chinese (中文), Japanese (日本語), 
                  Korean (한국어), Arabic (العربية), Hindi (हिन्दी), and English content.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfect for:</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• **International Businesses** - Multi-language reports and documentation</li>
                  <li>• **Data Analysts** - Large dataset visualization and reporting</li>
                  <li>• **Academic Researchers** - Citation tables and research data presentation</li>
                  <li>• **Financial Professionals** - Complex financial statements and analytics</li>
                  <li>• **Government Agencies** - Multilingual official documentation</li>
                  <li>• **Content Creators** - Professional presentation of data-driven content</li>
                </ul>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default EnhancedCSVToPDFPage;
