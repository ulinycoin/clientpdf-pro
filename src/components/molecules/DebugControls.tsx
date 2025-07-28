import React, { useState } from 'react';
import Button from '../atoms/Button';

interface DebugControlsProps {
  onToggleLogging?: (enabled: boolean) => void;
}

const DebugControls: React.FC<DebugControlsProps> = ({ onToggleLogging }) => {
  const [loggingEnabled, setLoggingEnabled] = useState(false);

  const toggleLogging = () => {
    const newState = !loggingEnabled;
    setLoggingEnabled(newState);

    if (newState) {
      console.log('🔍 DEBUG LOGGING ENABLED - Detailed logs will be shown');
    } else {
      console.log('🔇 DEBUG LOGGING DISABLED');
    }

    onToggleLogging?.(newState);
  };

  const clearConsole = () => {
    console.clear();
    console.log('🧹 Console cleared');
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h4 className="font-medium mb-3">🐛 Debug Controls</h4>
      <p className="text-sm text-gray-600 mb-3">
        Enable detailed logging to diagnose issues with landscape orientation and empty pages.
      </p>

      <div className="flex gap-2">
        <Button
          onClick={toggleLogging}
          size="sm"
          variant={loggingEnabled ? "primary" : "secondary"}
        >
          {loggingEnabled ? '🔍 Logging ON' : '🔇 Logging OFF'}
        </Button>

        <Button
          onClick={clearConsole}
          size="sm"
          variant="secondary"
        >
          🧹 Clear Console
        </Button>
      </div>

      {loggingEnabled && (
        <div className="mt-3 p-2 bg-gray-900 text-green-400 rounded text-xs">
          <div>✅ Debug logging is active</div>
          <div>📋 Open Developer Tools (F12) → Console to see detailed logs</div>
          <div>🔍 Generate PDF to see step-by-step processing</div>
        </div>
      )}
    </div>
  );
};

export default DebugControls;
