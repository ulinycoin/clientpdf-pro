                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
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

                <div className="p-4 h-full">
                  {previewState.error ? (
                    <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <p className="text-red-800 font-medium">Preview Error</p>
                        <p className="text-red-600 text-sm mt-1">{previewState.error}</p>
                        <button
                          onClick={generatePreview}
                          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  ) : previewState.isGenerating ? (
                    <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-center">
                        <Loader className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
                        <p className="text-gray-700 font-medium">Generating Preview...</p>
                        <p className="text-gray-600 text-sm mt-1">Processing with enhanced fonts</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 h-full">
                      <canvas
                        ref={canvasRef}
                        className="max-w-full h-auto"
                        style={{ 
                          display: 'block',
                          margin: '0 auto',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      {previewState.pageCount > 1 && (
                        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-center space-x-4">
                          <button
                            onClick={() => setPreviewState(prev => ({ 
                              ...prev, 
                              currentPage: Math.max(1, prev.currentPage - 1) 
                            }))}
                            disabled={previewState.currentPage <= 1}
                            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-600">
                            Page {previewState.currentPage} of {previewState.pageCount}
                          </span>
                          <button
                            onClick={() => setPreviewState(prev => ({ 
                              ...prev, 
                              currentPage: Math.min(prev.pageCount, prev.currentPage + 1) 
                            }))}
                            disabled={previewState.currentPage >= previewState.pageCount}
                            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Status Bar */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span>
              Last updated: {parseResult.reportTitle ? 
                `Auto-detected • ${parseResult.reportTitle}` : 
                'Interactive CSV to PDF Editor'
              }
            </span>
            {languageDetection && (
              <span className="flex items-center">
                <Languages className="w-3 h-3 mr-1" />
                {languageDetection.detectedLanguage.toUpperCase()} 
                ({Math.round(languageDetection.confidence * 100)}%)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {previewState.isGenerating && (
              <span className="flex items-center text-blue-600">
                <Loader className="w-3 h-3 mr-1 animate-spin" />
                Generating preview...
              </span>
            )}
            <span>
              Font: {options.fontFamily === 'auto' ? 'Auto-selected' : options.fontFamily}
            </span>
            <span>
              {options.orientation} • {options.pageSize.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreviewEditor;