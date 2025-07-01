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
              <li>• Use Ctrl+Z / Ctrl+Y for undo/redo (or toolbar buttons)</li>
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