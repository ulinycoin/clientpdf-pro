                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Orientation
                      </label>
                      <select
                        value={options.orientation}
                        onChange={(e) => setOptions(prev => ({ ...prev, orientation: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="landscape">Landscape (Recommended)</option>
                        <option value="portrait">Portrait</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Size
                      </label>
                      <select
                        value={options.pageSize}
                        onChange={(e) => setOptions(prev => ({ ...prev, pageSize: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="a4">A4</option>
                        <option value="a3">A3</option>
                        <option value="letter">Letter</option>
                        <option value="legal">Legal (Best for tables)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full p-6"
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      PDF Preview
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={generatePreview}
                        disabled={previewState.isGenerating}
                        className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {previewState.isGenerating ? (
                          <Loader className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-1" />
                        )}
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 h-[calc(100%-5rem)]">
                  {previewState.error ? (
                    <div className="flex items-center justify-center h-full bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-center max-w-md">
                        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
                        <p className="text-red-800 font-medium mb-2">{previewState.error}</p>
                        
                        {previewState.warnings.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-red-700 mb-2 font-medium">Suggestions:</p>
                            <ul className="text-sm text-red-600 space-y-1">
                              {previewState.warnings.map((warning, index) => (
                                <li key={index} className="flex items-start justify-center">
                                  <span className="text-red-400 mr-2">•</span>
                                  {warning}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <button
                            onClick={generatePreview}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Try Again
                          </button>
                          
                          {!options.useRobustGenerator && (
                            <button
                              onClick={() => {
                                setOptions(prev => ({ ...prev, useRobustGenerator: true, enableErrorRecovery: true }));
                                setTimeout(generatePreview, 100);
                              }}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Try Robust Mode
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              setOptions(prev => ({ 
                                ...prev, 
                                fontFamily: 'helvetica',
                                fontSize: Math.max(6, prev.fontSize - 1),
                                enableErrorRecovery: true
                              }));
                              setTimeout(generatePreview, 100);
                            }}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Use Safe Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : previewState.isGenerating ? (
                    <div className="flex items-center justify-center h-full bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-center">
                        <Loader className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
                        <p className="text-gray-700 font-medium mb-2">Generating Preview...</p>
                        <p className="text-gray-600 text-sm">
                          {previewState.generatorUsed ? 
                            `Using ${previewState.generatorUsed} generator` : 
                            'Processing with enhanced fonts'
                          }
                        </p>
                        
                        {/* Progress indicators */}
                        <div className="mt-4 flex items-center justify-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  ) : previewState.pdfUrl ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 h-full">
                      <iframe
                        src={previewState.pdfUrl}
                        className="w-full h-full"
                        title="PDF Preview"
                        onError={() => {
                          console.error('PDF iframe failed to load');
                          setPreviewState(prev => ({
                            ...prev,
                            error: 'PDF preview failed to load',
                            warnings: ['Try refreshing the preview', 'Check browser PDF support']
                          }));
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-center">
                        <FileSpreadsheet className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No preview available</p>
                        <button
                          onClick={generatePreview}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Generate Preview
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span>
              {parseResult.reportTitle || 'Interactive CSV to PDF Editor'}
            </span>
            {unicodeDetection && (
              <span className="flex items-center">
                <Languages className="w-3 h-3 mr-1" />
                {unicodeDetection.hasCyrillic ? 'Cyrillic Detected' : 
                 unicodeDetection.hasExtendedLatin ? 'Extended Latin' : 
                 'Standard Text'}
              </span>
            )}
            {previewState.generatorUsed && (
              <span className="flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                {previewState.generatorUsed} generator
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {previewState.isGenerating && (
              <span className="flex items-center text-blue-600">
                <Loader className="w-3 h-3 mr-1 animate-spin" />
                Generating...
              </span>
            )}
            <span>
              Font: {options.fontFamily === 'auto' ? 'Auto-selected' : options.fontFamily}
            </span>
            <span>
              {options.orientation} • {options.pageSize.toUpperCase()}
            </span>
            {fontCompatibility.tested && (
              <span className={`flex items-center ${
                fontCompatibility.robust ? 'text-green-600' : 'text-yellow-600'
              }`}>
                <Shield className="w-3 h-3 mr-1" />
                {fontCompatibility.robust ? 'Robust' : 'Fallback'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreviewEditor;
