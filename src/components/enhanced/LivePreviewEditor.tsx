          <div className="flex space-x-2">
            {['portrait', 'landscape'].map(orientation => (
              <button
                key={orientation}
                onClick={() => updatePdfOptions({ orientation: orientation as any })}
                className={`
                  flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all
                  ${editorState.pdfOptions.orientation === orientation
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Цветовая схема */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-3">Color Scheme</label>
        <div className="flex space-x-3">
          {[
            { name: 'Blue', primary: '#3B82F6', secondary: '#EBF8FF' },
            { name: 'Green', primary: '#10B981', secondary: '#F0FDF4' },
            { name: 'Purple', primary: '#8B5CF6', secondary: '#FAF5FF' },
            { name: 'Gray', primary: '#6B7280', secondary: '#F9FAFB' },
          ].map(scheme => (
            <button
              key={scheme.name}
              onClick={() => updatePdfOptions({
                colorScheme: {
                  ...editorState.pdfOptions.colorScheme,
                  primary: scheme.primary,
                  headerBg: scheme.secondary
                }
              })}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50"
            >
              <div 
                className="w-8 h-8 rounded-full mb-1"
                style={{ backgroundColor: scheme.primary }}
              />
              <span className="text-xs text-gray-600">{scheme.name}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );

  // 🎯 Основной рендер контента
  const renderMainContent = () => {
    switch (editorState.currentView) {
      case 'edit':
        return (
          <div className="space-y-6">
            {renderStatsPanel()}
            {renderLanguageInfo()}
            
            {/* Таблица данных будет здесь */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Data Table (Preview)</h3>
              <div className="text-gray-600 text-center py-12">
                📝 Interactive data table editor will be implemented here
                <br />
                <span className="text-sm">Features: inline editing, drag & drop columns, sorting, filtering</span>
              </div>
            </Card>
          </div>
        );

      case 'style':
        return (
          <div className="space-y-6">
            {renderLanguageInfo()}
            {renderQuickStylePanel()}
            
            {/* Расширенные настройки стиля */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Advanced Styling</h3>
              <div className="text-gray-600 text-center py-12">
                🎨 Advanced styling controls will be implemented here
                <br />
                <span className="text-sm">Features: custom themes, branding, advanced typography</span>
              </div>
            </Card>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            {/* Предпросмотр PDF */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">PDF Preview</h3>
                <div className="flex items-center space-x-2">
                  {editorState.previewState.isGenerating && (
                    <Spinner size="sm" className="text-blue-600" />
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => generatePreview(true)}
                    disabled={editorState.previewState.isGenerating}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {editorState.previewState.error ? (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <span className="text-red-700">{editorState.previewState.error}</span>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <div className="text-gray-600 py-12">
                    👁️ Live PDF preview will be rendered here
                    <br />
                    <span className="text-sm">Using PDF.js for in-browser rendering</span>
                  </div>
                </div>
              )}

              {editorState.previewState.warnings.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {editorState.previewState.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // 🎯 Главный рендер
  return (
    <div className={`${layoutClasses} ${className}`}>
      {/* Заголовок с навигацией */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {csvFile.name}
              </h1>
              <p className="text-sm text-gray-500">
                Interactive CSV to PDF Editor
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {editorState.previewState.lastGenerated && (
              <div className="text-sm text-gray-500">
                Last updated: {editorState.previewState.lastGenerated.toLocaleTimeString()}
              </div>
            )}
            
            <Button
              variant="secondary"
              size="sm"
              className="hidden md:flex"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
            
            <Button
              onClick={() => {
                // Логика экспорта будет здесь
                console.log('Exporting PDF...');
              }}
              disabled={editorState.previewState.isGenerating || !editorState.previewState.lastGenerated}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 p-6">
        {editorState.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Analyzing CSV and detecting language...</span>
          </div>
        ) : (
          <>
            {renderTabNavigation()}
            
            <AnimatePresence mode="wait">
              <motion.div
                key={editorState.currentView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderMainContent()}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default LivePreviewEditor;
