import { useState, useCallback, useRef } from 'react';
import { useMotionPreferences } from './useAccessibilityPreferences';

interface CelebrationEffect {
  id: string;
  type: 'confetti' | 'success-pulse' | 'checkmark' | 'sparkles' | 'bounce';
  duration?: number;
  intensity?: 'light' | 'medium' | 'strong';
  position?: { x: number; y: number };
  color?: string;
}

interface CelebrationState {
  activeEffects: CelebrationEffect[];
  isAnimating: boolean;
}

interface UseCelebrationReturn {
  celebrate: (type?: CelebrationEffect['type'], options?: Partial<CelebrationEffect>) => void;
  celebrateSuccess: () => void;
  celebrateUpload: () => void;
  celebrateProcessing: () => void;
  celebrateDownload: () => void;
  clearCelebrations: () => void;
  activeEffects: CelebrationEffect[];
  isAnimating: boolean;
}

export const useCelebration = (): UseCelebrationReturn => {
  const { shouldAnimate } = useMotionPreferences();
  const [state, setState] = useState<CelebrationState>({
    activeEffects: [],
    isAnimating: false
  });
  
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const animationIdRef = useRef<number | null>(null);

  const generateId = (): string => {
    return `celebration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addEffect = useCallback((effect: CelebrationEffect) => {
    if (!shouldAnimate) {
      console.log('[Celebration] Animations disabled by user preferences');
      return;
    }

    setState(prev => ({
      activeEffects: [...prev.activeEffects, effect],
      isAnimating: true
    }));

    // Auto-remove effect after duration
    const duration = effect.duration || 2000;
    const timeout = setTimeout(() => {
      removeEffect(effect.id);
    }, duration);

    timeoutRefs.current.set(effect.id, timeout);
  }, [shouldAnimate]);

  const removeEffect = useCallback((effectId: string) => {
    setState(prev => {
      const newEffects = prev.activeEffects.filter(effect => effect.id !== effectId);
      return {
        activeEffects: newEffects,
        isAnimating: newEffects.length > 0
      };
    });

    // Clear timeout
    const timeout = timeoutRefs.current.get(effectId);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(effectId);
    }
  }, []);

  const celebrate = useCallback((
    type: CelebrationEffect['type'] = 'confetti',
    options: Partial<CelebrationEffect> = {}
  ) => {
    if (!shouldAnimate) return;

    const effect: CelebrationEffect = {
      id: generateId(),
      type,
      duration: 2000,
      intensity: 'medium',
      ...options
    };

    addEffect(effect);
    
    // Trigger haptic feedback on supported devices
    if ('vibrate' in navigator && window.navigator.vibrate) {
      const pattern = type === 'confetti' ? [100, 50, 100] : [50];
      navigator.vibrate(pattern);
    }
  }, [addEffect, shouldAnimate]);

  // Predefined celebration types for common scenarios
  const celebrateSuccess = useCallback(() => {
    celebrate('checkmark', {
      intensity: 'strong',
      duration: 3000,
      color: '#22c55e'
    });
  }, [celebrate]);

  const celebrateUpload = useCallback(() => {
    celebrate('bounce', {
      intensity: 'light',
      duration: 1500,
      color: '#3b82f6'
    });
  }, [celebrate]);

  const celebrateProcessing = useCallback(() => {
    celebrate('sparkles', {
      intensity: 'medium',
      duration: 2000,
      color: '#8b5cf6'
    });
  }, [celebrate]);

  const celebrateDownload = useCallback(() => {
    celebrate('confetti', {
      intensity: 'strong',
      duration: 3000,
      color: '#10b981'
    });
  }, [celebrate]);

  const clearCelebrations = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
    
    // Cancel animation frame
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    
    setState({
      activeEffects: [],
      isAnimating: false
    });
  }, []);

  return {
    celebrate,
    celebrateSuccess,
    celebrateUpload,
    celebrateProcessing,
    celebrateDownload,
    clearCelebrations,
    activeEffects: state.activeEffects,
    isAnimating: state.isAnimating
  };
};