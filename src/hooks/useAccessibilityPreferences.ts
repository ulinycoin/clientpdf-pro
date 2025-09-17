import { useState, useEffect } from 'react';

export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusVisible: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
}

export interface AccessibilityContextValue {
  preferences: AccessibilityPreferences;
  updatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => void;
  resetToDefaults: () => void;
  applySystemPreferences: () => void;
}

const defaultPreferences: AccessibilityPreferences = {
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  focusVisible: true,
  screenReaderOptimized: false,
  keyboardNavigation: true
};

const STORAGE_KEY = 'localpdf_accessibility_preferences';

export const useAccessibilityPreferences = (): AccessibilityContextValue => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    // Load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultPreferences, ...JSON.parse(stored) };
      } catch (e) {
        console.warn('Failed to parse accessibility preferences from localStorage');
      }
    }
    return defaultPreferences;
  });

  // Apply system preferences
  const applySystemPreferences = () => {
    const systemReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const systemHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setPreferences(prev => ({
      ...prev,
      reducedMotion: systemReducedMotion,
      highContrast: systemHighContrast
    }));
  };

  // Listen for system preference changes
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, reducedMotion: e.matches }));
    };
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, highContrast: e.matches }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  // Apply CSS custom properties based on preferences
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size scaling
    const fontSizeMultipliers = {
      'small': 0.875,
      'medium': 1,
      'large': 1.125,
      'extra-large': 1.25
    };
    
    root.style.setProperty('--font-size-multiplier', fontSizeMultipliers[preferences.fontSize].toString());
    
    // High contrast mode
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (preferences.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Focus visible
    if (preferences.focusVisible) {
      root.classList.add('focus-visible-enhanced');
    } else {
      root.classList.remove('focus-visible-enhanced');
    }
    
    // Screen reader optimized
    if (preferences.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }
    
    // Keyboard navigation enhanced
    if (preferences.keyboardNavigation) {
      root.classList.add('keyboard-navigation-enhanced');
    } else {
      root.classList.remove('keyboard-navigation-enhanced');
    }
  }, [preferences]);

  const updatePreference = <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
  };

  return {
    preferences,
    updatePreference,
    resetToDefaults,
    applySystemPreferences
  };
};

// Hook for accessing motion preferences specifically
export const useMotionPreferences = () => {
  const { preferences } = useAccessibilityPreferences();
  
  return {
    reducedMotion: preferences.reducedMotion,
    shouldAnimate: !preferences.reducedMotion,
    getTransitionDuration: (normalDuration: string) => 
      preferences.reducedMotion ? '0ms' : normalDuration,
    getAnimationConfig: (config: { duration?: number; delay?: number }) => ({
      duration: preferences.reducedMotion ? 0 : (config.duration || 300),
      delay: preferences.reducedMotion ? 0 : (config.delay || 0)
    })
  };
};