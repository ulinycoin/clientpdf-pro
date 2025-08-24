import { useCallback, useRef, useState } from 'react';
import { useMotionPreferences } from './useAccessibilityPreferences';

interface MicroInteractionOptions {
  duration?: number;
  intensity?: 'subtle' | 'moderate' | 'strong';
  haptic?: boolean;
  sound?: boolean;
}

interface InteractionState {
  isHovered: boolean;
  isPressed: boolean;
  isActive: boolean;
  isFocused: boolean;
}

interface UseMicroInteractionsReturn {
  // State
  state: InteractionState;
  
  // Event handlers
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  
  // Utility functions
  triggerHaptic: (pattern?: number | number[]) => void;
  triggerRipple: (event: React.MouseEvent | React.TouchEvent) => void;
  animateSuccess: () => void;
  animateError: () => void;
  
  // CSS classes for animations
  getHoverClasses: () => string;
  getPressedClasses: () => string;
  getActiveClasses: () => string;
  getFocusClasses: () => string;
}

export const useMicroInteractions = (
  options: MicroInteractionOptions = {}
): UseMicroInteractionsReturn => {
  const { shouldAnimate } = useMotionPreferences();
  const [state, setState] = useState<InteractionState>({
    isHovered: false,
    isPressed: false,
    isActive: false,
    isFocused: false
  });
  
  const {
    duration = 200,
    intensity = 'moderate',
    haptic = true,
    sound = false
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateState = useCallback((updates: Partial<InteractionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const triggerHaptic = useCallback((pattern: number | number[] = 50) => {
    if (!haptic || !navigator.vibrate) return;
    
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.debug('[MicroInteractions] Haptic feedback not available:', error);
    }
  }, [haptic]);

  const triggerSound = useCallback((type: 'click' | 'hover' | 'success' | 'error' = 'click') => {
    if (!sound || !window.AudioContext) return;
    
    // Simple procedural audio feedback
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      
      const frequencies = {
        click: 800,
        hover: 600,
        success: 880,
        error: 200
      };
      
      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      oscillator.type = 'sine';
      
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.debug('[MicroInteractions] Audio feedback not available:', error);
    }
  }, [sound]);

  // Mouse event handlers
  const onMouseEnter = useCallback(() => {
    updateState({ isHovered: true });
    if (shouldAnimate && haptic) {
      triggerHaptic(20); // Subtle vibration
    }
    if (sound) {
      triggerSound('hover');
    }
  }, [shouldAnimate, haptic, sound, triggerHaptic, triggerSound, updateState]);

  const onMouseLeave = useCallback(() => {
    updateState({ isHovered: false, isPressed: false });
  }, [updateState]);

  const onMouseDown = useCallback(() => {
    updateState({ isPressed: true });
    if (shouldAnimate && haptic) {
      const patterns = {
        subtle: 30,
        moderate: 50,
        strong: [100, 30, 100]
      };
      triggerHaptic(patterns[intensity]);
    }
    if (sound) {
      triggerSound('click');
    }
  }, [shouldAnimate, haptic, intensity, sound, triggerHaptic, triggerSound, updateState]);

  const onMouseUp = useCallback(() => {
    updateState({ isPressed: false });
  }, [updateState]);

  // Focus event handlers
  const onFocus = useCallback(() => {
    updateState({ isFocused: true });
  }, [updateState]);

  const onBlur = useCallback(() => {
    updateState({ isFocused: false });
  }, [updateState]);

  // Touch event handlers
  const onTouchStart = useCallback(() => {
    updateState({ isPressed: true, isHovered: true });
    if (shouldAnimate && haptic) {
      triggerHaptic(50);
    }
  }, [shouldAnimate, haptic, triggerHaptic, updateState]);

  const onTouchEnd = useCallback(() => {
    updateState({ isPressed: false, isHovered: false });
  }, [updateState]);

  // Ripple effect
  const triggerRipple = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!shouldAnimate) return;

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    let clientX: number, clientY: number;
    
    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      return;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple-animation 0.6s linear;
      left: ${x - 10}px;
      top: ${y - 10}px;
      width: 20px;
      height: 20px;
      pointer-events: none;
      z-index: 1000;
    `;

    target.style.position = 'relative';
    target.style.overflow = 'hidden';
    target.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }, [shouldAnimate]);

  // Animation utilities
  const animateSuccess = useCallback(() => {
    updateState({ isActive: true });
    triggerHaptic([100, 50, 100]);
    triggerSound('success');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      updateState({ isActive: false });
    }, duration * 3);
  }, [duration, triggerHaptic, triggerSound, updateState]);

  const animateError = useCallback(() => {
    updateState({ isActive: true });
    triggerHaptic([200, 100, 200]);
    triggerSound('error');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      updateState({ isActive: false });
    }, duration * 2);
  }, [duration, triggerHaptic, triggerSound, updateState]);

  // CSS class generators
  const getHoverClasses = useCallback((): string => {
    if (!shouldAnimate || !state.isHovered) return '';
    
    const intensityClasses = {
      subtle: 'transform scale-[1.02] translate-y-[-1px]',
      moderate: 'transform scale-[1.05] translate-y-[-2px] shadow-lg',
      strong: 'transform scale-[1.08] translate-y-[-4px] shadow-xl'
    };
    
    return `transition-all duration-200 ease-out ${intensityClasses[intensity]}`;
  }, [shouldAnimate, state.isHovered, intensity]);

  const getPressedClasses = useCallback((): string => {
    if (!shouldAnimate || !state.isPressed) return '';
    
    const intensityClasses = {
      subtle: 'transform scale-[0.98]',
      moderate: 'transform scale-[0.95] translate-y-[1px]',
      strong: 'transform scale-[0.92] translate-y-[2px]'
    };
    
    return `transition-all duration-100 ease-in ${intensityClasses[intensity]}`;
  }, [shouldAnimate, state.isPressed, intensity]);

  const getActiveClasses = useCallback((): string => {
    if (!shouldAnimate || !state.isActive) return '';
    
    return 'animate-pulse ring-2 ring-seafoam-400 ring-opacity-75';
  }, [shouldAnimate, state.isActive]);

  const getFocusClasses = useCallback((): string => {
    if (!state.isFocused) return '';
    
    return 'ring-2 ring-ocean-400 ring-opacity-50 ring-offset-2 ring-offset-white dark:ring-offset-gray-800';
  }, [state.isFocused]);

  return {
    state,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
    onFocus,
    onBlur,
    onTouchStart,
    onTouchEnd,
    triggerHaptic,
    triggerRipple,
    animateSuccess,
    animateError,
    getHoverClasses,
    getPressedClasses,
    getActiveClasses,
    getFocusClasses
  };
};

// Inject ripple animation styles
if (typeof document !== 'undefined' && !document.getElementById('micro-interaction-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'micro-interaction-styles';
  styleSheet.textContent = `
    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}