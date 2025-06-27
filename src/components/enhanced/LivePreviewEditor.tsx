              </div>
            )}
          </div>
        )}
      </div>
    </div>
  ), [previewState, generatePreview, renderPDFPreview]);

  // Main render
  return (
    <div className={`w-full h-full ${className}`}>
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex space-x-1">
            {[
              { id: 'edit', label: 'Edit Data', icon: Edit3 },
              { id: 'style', label: 'Style', icon: Palette },
              { id: 'preview', label: 'Preview', icon: Eye }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all
                  ${activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {languageDetection && (
              <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                <Globe className="w-3 h-3 mr-1" />
                {SUPPORTED_LANGUAGES[languageDetection.detectedLanguage as keyof typeof SUPPORTED_LANGUAGES]}
              </div>
            )}
            <button
              onClick={handleExport}
              disabled={!previewState.pdfBlob}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'edit' && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-6 h-full">
                <div className="space-y-4">
                  {DataTableEditor}
                  
                  {/* Data Stats */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Data Statistics</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{parseResult.rowCount}</div>
                        <div className="text-xs text-gray-500">Rows</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{parseResult.columnCount}</div>
                        <div className="text-xs text-gray-500">Columns</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">{parseResult.delimiter}</div>
                        <div className="text-xs text-gray-500">Delimiter</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="hidden xl:block">
                  {PDFPreviewPanel}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'style' && (
            <motion.div
              key="style"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-6 h-full">
                <div className="max-h-full overflow-y-auto">
                  {StyleControlPanel}
                </div>
                
                <div className="hidden xl:block">
                  {PDFPreviewPanel}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <div className="p-6 h-full">
                <div className="max-w-4xl mx-auto h-full">
                  {PDFPreviewPanel}
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