                {pdfState.isGenerating ? (
                  <Loader className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-1" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-4">
          {pdfState.error ? (
            <div className="h-full flex items-center justify-center bg-red-50 border-2 border-dashed border-red-200 rounded-lg">
              <div className="text-center max-w-md">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h5 className="text-red-800 font-medium mb-2">PDF Generation Failed</h5>
                <p className="text-red-600 text-sm mb-4">{pdfState.error}</p>
                
                {pdfState.warnings.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-red-700 mb-2 font-medium">Suggestions:</p>
                    <ul className="text-sm text-red-600 space-y-1">
                      {pdfState.warnings.map((warning, index) => (
                        <li key={index} className="flex items-center justify-center">
                          <span className="text-red-400 mr-2">•</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <button
                  onClick={generatePDF}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : pdfState.isGenerating ? (
            <div className="h-full flex items-center justify-center bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                </motion.div>
                <h5 className="text-blue-800 font-medium mb-2">
                  Generating Interactive PDF...
                </h5>
                <p className="text-blue-600 text-sm mb-2">
                  Optimizing for {languageAnalysis.language?.displayName || 'your data'}
                </p>
                <p className="text-blue-500 text-xs">
                  Using {languageAnalysis.fontSolution?.primary || 'Arial'} (system font)
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          ) : pdfState.pdfUrl ? (
            <div className="h-full border border-slate-200 rounded-lg overflow-hidden bg-white shadow-inner">
              <iframe
                src={pdfState.pdfUrl}
                className="w-full h-full"
                title="Interactive PDF Preview"
                style={{ transform: `scale(${pdfState.zoom / 100})`, transformOrigin: 'top left' }}
                onError={() => {
                  setPdfState(prev => ({
                    ...prev,
                    error: 'PDF preview failed to load',
                    warnings: ['Try refreshing the preview', 'Check browser PDF support']
                  }));
                }}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
              <div className="text-center">
                <Eye className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h5 className="text-slate-700 font-medium mb-2">
                  Ready to Generate Preview
                </h5>
                <p className="text-slate-600 text-sm mb-6">
                  Click Generate to create your interactive PDF preview
                  {languageAnalysis.language && ` optimized for ${languageAnalysis.language.displayName}`}
                </p>
                <button
                  onClick={generatePDF}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm mx-auto"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Generate Preview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 📤 Панель экспорта
  function renderExportPanel() {
    return (
      <div className="h-full p-4 space-y-6 overflow-auto">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h4 className="font-medium text-slate-900 mb-4 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Your Interactive PDF
          </h4>
          
          {pdfState.pdfUrl ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800 mb-2">
                  <Zap className="w-4 h-4 mr-2" />
                  <span className="font-medium">PDF Ready for Export!</span>
                </div>
                <p className="text-green-700 text-sm">
                  Your PDF has been generated with optimized settings for {languageAnalysis.language?.displayName || 'your data'}.
                  Last generated: {pdfState.lastGenerated?.toLocaleTimeString()}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF
                </button>
                
                <button
                  onClick={() => {
                    if (pdfState.pdfUrl) {
                      window.open(pdfState.pdfUrl, '_blank');
                    }
                  }}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Open in New Tab
                </button>
              </div>
              
              {/* Детали файла */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h5 className="font-medium text-slate-900 mb-3">File Details</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Format:</span>
                    <span className="ml-2 font-medium">PDF</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Language:</span>
                    <span className="ml-2 font-medium">
                      {languageAnalysis.config?.emoji} {languageAnalysis.language?.displayName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Font:</span>
                    <span className="ml-2 font-medium">
                      {languageAnalysis.fontSolution?.primary} (system)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Theme:</span>
                    <span className="ml-2 font-medium">
                      {THEMES[styleOptions.theme].emoji} {THEMES[styleOptions.theme].name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Orientation:</span>
                    <span className="ml-2 font-medium capitalize">{styleOptions.orientation}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Page Size:</span>
                    <span className="ml-2 font-medium uppercase">{styleOptions.pageSize}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileSpreadsheet className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h5 className="text-slate-700 font-medium mb-2">
                No PDF Generated Yet
              </h5>
              <p className="text-slate-600 text-sm mb-6">
                Generate a PDF preview first to enable export options
              </p>
              <button
                onClick={generatePDF}
                disabled={pdfState.isGenerating}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-sm mx-auto"
              >
                {pdfState.isGenerating ? (
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-5 h-5 mr-2" />
                )}
                Generate PDF
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}>
      {/* 🎯 Умная шапка с языковой информацией */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center">
                {csvData.metadata.title || 'Interactive CSV Editor'}
                {languageAnalysis.language && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-3 flex items-center text-xs bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 px-3 py-1 rounded-full"
                  >
                    <Globe className="w-3 h-3 mr-1" />
                    {languageAnalysis.config?.emoji} {languageAnalysis.language.displayName}
                    <span className="ml-1 text-green-600 font-medium">
                      {Math.round(languageAnalysis.language.confidence * 100)}%
                    </span>
                  </motion.span>
                )}
              </h3>
              <p className="text-sm text-slate-600 flex items-center">
                {csvData.metadata.rowCount} rows × {csvData.metadata.columnCount} columns
                {languageAnalysis.fontSolution && (
                  <span className="ml-3 flex items-center text-xs text-green-600">
                    <Shield className="w-3 h-3 mr-1" />
                    {languageAnalysis.fontSolution.primary} ({languageAnalysis.fontSolution.strategy})
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Переключение режимов */}
            <button
              onClick={() => setEditorMode(prev => ({ ...prev, splitView: !prev.splitView }))}
              className={`p-2 rounded-lg transition-all ${
                editorMode.splitView 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Toggle split view"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setPdfState(prev => ({ ...prev, zoom: Math.max(50, prev.zoom - 25) }))}
              disabled={pdfState.zoom <= 50}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-50"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-xs text-slate-600 px-2">
              {pdfState.zoom}%
            </span>
            
            <button
              onClick={() => setPdfState(prev => ({ ...prev, zoom: Math.min(200, prev.zoom + 25) }))}
              disabled={pdfState.zoom >= 200}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-50"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            {!pdfState.pdfUrl ? (
              <button
                onClick={generatePDF}
                disabled={pdfState.isGenerating}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-sm"
              >
                {pdfState.isGenerating ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {pdfState.isGenerating ? 'Generating...' : 'Preview'}
              </button>
            ) : (
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 📑 Навигационные табы */}
      <div className="flex border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        {[
          { id: 'data', label: 'Edit Data', icon: Edit3 },
          { id: 'style', label: 'Style & Themes', icon: Palette },
          { id: 'preview', label: 'Live Preview', icon: Eye },
          { id: 'export', label: 'Export & Share', icon: Download }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setEditorMode(prev => ({ ...prev, activeTab: tab.id as any }))}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              editorMode.activeTab === tab.id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🎬 Основной контент */}
      <div className="flex-1 overflow-hidden">
        {editorMode.splitView ? (
          // Split view: данные + превью
          <div className="flex h-full">
            <div className="flex-1 border-r border-slate-200">
              {renderTabContent()}
            </div>
            <div className="w-1/2">
              {renderPDFPreview()}
            </div>
          </div>
        ) : (
          // Полноэкранный режим
          <div className="h-full">
            {editorMode.activeTab === 'preview' ? renderPDFPreview() : renderTabContent()}
          </div>
        )}
      </div>

      {/* 📊 Статус бар */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-slate-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Globe className="w-3 h-3 mr-1" />
              {languageAnalysis.language?.displayName || 'Auto-detecting...'}
            </span>
            <span className="flex items-center">
              <Type className="w-3 h-3 mr-1" />
              {languageAnalysis.fontSolution?.primary || 'Arial'}
            </span>
            <span className="flex items-center">
              <Shield className="w-3 h-3 mr-1 text-green-600" />
              System Font (reliable)
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>{styleOptions.orientation} • {styleOptions.pageSize.toUpperCase()} • {styleOptions.fontSize}pt</span>
            <span className="flex items-center">
              <Palette className="w-3 h-3 mr-1" />
              {THEMES[styleOptions.theme].name}
            </span>
            {pdfState.lastGenerated && (
              <span className="flex items-center text-green-600">
                <Zap className="w-3 h-3 mr-1" />
                Last: {pdfState.lastGenerated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveCSVToPDFEditor;