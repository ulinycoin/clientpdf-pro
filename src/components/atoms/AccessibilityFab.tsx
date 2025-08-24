import React, { useState } from 'react';
import { useAccessibilityPreferences } from '../../hooks/useAccessibilityPreferences';
import AccessibilityPanel from '../molecules/AccessibilityPanel';

export interface AccessibilityFabProps {
  className?: string;
}

const AccessibilityFab: React.FC<AccessibilityFabProps> = ({
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { preferences } = useAccessibilityPreferences();

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 z-40
          w-14 h-14 bg-privacy-accent hover:bg-hover-primary text-white rounded-full
          flex items-center justify-center
          shadow-lg hover:shadow-xl
          transition-all duration-300 hover:scale-110
          focus:outline-none focus:ring-4 focus:ring-privacy-300 dark:focus:ring-privacy-700
          ${className}
        `}
        aria-label="Открыть настройки доступности"
        title="Настройки доступности"
      >
        <svg 
          className="w-6 h-6" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2M21,9V7L15,7V9A5,5 0 0,0 10,14V22H12V16A2,2 0 0,1 14,14H18A2,2 0 0,1 20,16V22H22V14A5,5 0 0,0 17,9H21Z" />
        </svg>

        {/* Active Indicator */}
        {(preferences.reducedMotion || preferences.highContrast || preferences.focusVisible) && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-success-action rounded-full border-2 border-white">
            <div className="w-full h-full rounded-full bg-success-action animate-ping opacity-75" />
          </div>
        )}
      </button>

      {/* Accessibility Panel Modal */}
      <AccessibilityPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default AccessibilityFab;