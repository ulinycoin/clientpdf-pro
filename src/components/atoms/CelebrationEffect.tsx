import React, { useEffect, useRef, useState } from 'react';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';

interface CelebrationEffectProps {
  id: string;
  type: 'confetti' | 'success-pulse' | 'checkmark' | 'sparkles' | 'bounce';
  duration?: number;
  intensity?: 'light' | 'medium' | 'strong';
  position?: { x: number; y: number };
  color?: string;
  onComplete?: (id: string) => void;
}

const CelebrationEffect: React.FC<CelebrationEffectProps> = ({
  id,
  type,
  duration = 2000,
  intensity = 'medium',
  position,
  color = '#4ECDC4',
  onComplete
}) => {
  const { shouldAnimate } = useMotionPreferences();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldAnimate) {
      onComplete?.(id);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      if (progress >= 1) {
        setIsVisible(false);
        onComplete?.(id);
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [id, duration, shouldAnimate, onComplete]);

  if (!shouldAnimate || !isVisible) {
    return null;
  }

  const getIntensityMultiplier = () => {
    switch (intensity) {
      case 'light': return 0.5;
      case 'medium': return 1;
      case 'strong': return 1.5;
      default: return 1;
    }
  };

  const renderConfetti = () => {
    const particles = Array.from({ length: Math.floor(20 * getIntensityMultiplier()) }, (_, i) => (
      <div
        key={i}
        className="confetti-particle absolute w-2 h-2 opacity-90"
        style={{
          backgroundColor: i % 3 === 0 ? color : i % 3 === 1 ? '#45B7D1' : '#F4E4BC',
          left: `${50 + (Math.random() - 0.5) * 100}%`,
          animationDelay: `${Math.random() * 0.5}s`,
          animationDuration: `${1 + Math.random()}s`
        }}
      />
    ));

    return (
      <div className="confetti-container fixed inset-0 pointer-events-none overflow-hidden z-50">
        {particles}
      </div>
    );
  };

  const renderSuccessPulse = () => (
    <div 
      className="success-pulse fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      style={{ left: position?.x, top: position?.y }}
    >
      <div 
        className="success-ring rounded-full border-4 animate-ping"
        style={{ 
          borderColor: color,
          width: `${60 * getIntensityMultiplier()}px`,
          height: `${60 * getIntensityMultiplier()}px`
        }}
      />
    </div>
  );

  const renderCheckmark = () => (
    <div 
      className="checkmark-container fixed pointer-events-none z-50 flex items-center justify-center"
      style={{ 
        left: position?.x || '50%', 
        top: position?.y || '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div 
        className="checkmark-circle rounded-full flex items-center justify-center animate-bounce"
        style={{ 
          backgroundColor: color,
          width: `${80 * getIntensityMultiplier()}px`,
          height: `${80 * getIntensityMultiplier()}px`,
          boxShadow: `0 0 30px ${color}40`
        }}
      >
        <svg 
          className="w-8 h-8 text-white animate-draw-check" 
          viewBox="0 0 24 24" 
          fill="none"
          style={{ animationDelay: '0.3s' }}
        >
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="checkmark-path"
          />
        </svg>
      </div>
    </div>
  );

  const renderSparkles = () => {
    const sparkles = Array.from({ length: Math.floor(15 * getIntensityMultiplier()) }, (_, i) => (
      <div
        key={i}
        className="sparkle absolute animate-sparkle"
        style={{
          left: `${20 + Math.random() * 60}%`,
          top: `${20 + Math.random() * 60}%`,
          animationDelay: `${Math.random() * 1}s`,
          animationDuration: `${1.5 + Math.random()}s`
        }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill={color}>
          <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
        </svg>
      </div>
    ));

    return (
      <div className="sparkles-container fixed inset-0 pointer-events-none overflow-hidden z-50">
        {sparkles}
      </div>
    );
  };

  const renderBounce = () => (
    <div 
      className="bounce-container fixed pointer-events-none z-50"
      style={{ 
        left: position?.x || '50%', 
        top: position?.y || '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div 
        className="bounce-element rounded-full animate-bounce"
        style={{ 
          backgroundColor: color,
          width: `${40 * getIntensityMultiplier()}px`,
          height: `${40 * getIntensityMultiplier()}px`,
          boxShadow: `0 0 20px ${color}60`
        }}
      />
    </div>
  );

  const renderEffect = () => {
    switch (type) {
      case 'confetti':
        return renderConfetti();
      case 'success-pulse':
        return renderSuccessPulse();
      case 'checkmark':
        return renderCheckmark();
      case 'sparkles':
        return renderSparkles();
      case 'bounce':
        return renderBounce();
      default:
        return null;
    }
  };

  return <>{renderEffect()}</>;
};

// CSS animations injected into document head
const celebrationStyles = `
  @keyframes confetti-fall {
    0% {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }

  @keyframes draw-check {
    0% {
      stroke-dasharray: 0 50;
    }
    100% {
      stroke-dasharray: 50 0;
    }
  }

  @keyframes sparkle {
    0%, 100% {
      opacity: 0;
      transform: scale(0) rotate(0deg);
    }
    50% {
      opacity: 1;
      transform: scale(1) rotate(180deg);
    }
  }

  .confetti-particle {
    animation: confetti-fall linear infinite;
  }

  .checkmark-path {
    stroke-dasharray: 50;
    stroke-dashoffset: 50;
  }

  .animate-draw-check .checkmark-path {
    animation: draw-check 0.5s ease-out forwards;
  }

  .animate-sparkle {
    animation: sparkle ease-in-out infinite;
  }

  .bounce-element {
    animation: bounce 0.6s ease-in-out 3;
  }

  .success-ring {
    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) 2;
  }
`;

// Inject styles only once
if (typeof document !== 'undefined' && !document.getElementById('celebration-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'celebration-styles';
  styleSheet.textContent = celebrationStyles;
  document.head.appendChild(styleSheet);
}

export default CelebrationEffect;