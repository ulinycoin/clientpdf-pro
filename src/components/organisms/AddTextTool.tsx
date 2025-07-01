                    Font Style
                  </label>
                  <div className="flex space-x-2">
                    <Button
                      variant={selectedElement.isBold ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleFormatChange({ isBold: !selectedElement.isBold })}
                    >
                      <strong>B</strong>
                    </Button>
                    <Button
                      variant={selectedElement.isItalic ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleFormatChange({ isItalic: !selectedElement.isItalic })}
                    >
                      <em>I</em>
                    </Button>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handleFormatChange({ color: preset.value })}
                        className={`w-full h-8 border-2 rounded-lg transition-transform hover:scale-105 ${
                          selectedElement.color.r === preset.value.r && 
                          selectedElement.color.g === preset.value.g && 
                          selectedElement.color.b === preset.value.b
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: `rgb(${preset.value.r}, ${preset.value.g}, ${preset.value.b})` }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opacity: {selectedElement.opacity}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={selectedElement.opacity}
                    onChange={(e) => handleFormatChange({ opacity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotation: {selectedElement.rotation}°
                  </label>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="15"
                    value={selectedElement.rotation}
                    onChange={(e) => handleFormatChange({ rotation: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>-90°</span>
                    <span>0°</span>
                    <span>90°</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="mt-6">
          <ProgressBar
            value={progress}
            className="mb-2"
            animated={true}
          />
          <p className="text-sm text-gray-600 text-center">
            Adding text to PDF... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Errors */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="text-red-400 mr-2 mt-0.5">⚠️</div>
            <div>
              <h4 className="text-red-800 font-medium">Error</h4>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="text-blue-400 mr-2 mt-0.5">ℹ️</div>
          <div>
            <h4 className="text-blue-800 font-medium">Privacy & Security</h4>
            <p className="text-blue-700 text-sm mt-1">
              Text is added locally in your browser. Your PDF never leaves your device, 
              ensuring complete privacy and security.
            </p>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start">
          <div className="text-green-400 mr-2 mt-0.5">💡</div>
          <div>
            <h4 className="text-green-800 font-medium">Quick Tips</h4>
            <ul className="text-green-700 text-sm mt-1 space-y-1">
              <li>• Use "Add Text" mode to place new text elements</li>
              <li>• Switch to "Select" mode to move and edit existing text</li>
              <li>• Double-click any text to edit it inline</li>
              <li>• Use mouse wheel or zoom controls to scale the view</li>
              <li>• Drag text elements to reposition them precisely</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>

          {textElements.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all text elements?')) {
                  resetState();
                }
              }}
              disabled={isProcessing}
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Element Count */}
          {textElements.length > 0 && (
            <span className="text-sm text-gray-600">
              {textElements.length} text element{textElements.length !== 1 ? 's' : ''} added
            </span>
          )}

          {/* Process Button */}
          <Button
            variant="primary"
            onClick={handleProcess}
            disabled={isProcessing || textElements.length === 0}
            loading={isProcessing}
          >
            {isProcessing 
              ? 'Adding Text...' 
              : textElements.length === 0 
                ? 'Add Text First' 
                : `Apply Text (${textElements.length})`
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddTextTool;