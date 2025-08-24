import React from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';

interface DarkModeToggleProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  variant = 'default', 
  className = '' 
}) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { shouldAnimate } = useMotionPreferences();

  if (variant === 'icon-only') {
    return (
      <button
        onClick={toggleDarkMode}
        className={`
          relative w-14 h-7 rounded-full transition-all duration-500 
          ${isDarkMode 
            ? 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900' 
            : 'bg-gradient-to-r from-sky-200 via-sky-300 to-sky-400'
          }
          hover:scale-105 hover:shadow-xl
          shadow-lg hover:shadow-2xl
          border-2 ${isDarkMode ? 'border-slate-600' : 'border-sky-300'}
          ${shouldAnimate ? 'transform-gpu' : ''}
          ${className}
        `}
        aria-label={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
        title={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
      >
        {/* Sliding Toggle Circle */}
        <div className={`
          absolute top-0.5 w-6 h-6 rounded-full transition-all duration-500 shadow-lg
          flex items-center justify-center text-lg
          ${isDarkMode 
            ? 'translate-x-7 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800' 
            : 'translate-x-0.5 bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600'
          }
          ${shouldAnimate ? 'transform-gpu' : ''}
        `}>
          {/* Icon inside toggle */}
          <div className={`transition-all duration-300 ${isDarkMode ? 'scale-100' : 'scale-0'}`}>
            <svg className="w-3.5 h-3.5 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.4 6.35,17.41C9.37,20.43 14,20.54 17.33,17.97Z" />
            </svg>
          </div>
          <div className={`absolute transition-all duration-300 ${isDarkMode ? 'scale-0' : 'scale-100'}`}>
            <svg className="w-3.5 h-3.5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z" />
            </svg>
          </div>
        </div>

        {/* Background Stars/Clouds Effects */}
        <div className="absolute inset-1 rounded-full overflow-hidden">
          {/* Night sky stars */}
          <div className={`
            absolute inset-0 transition-opacity duration-500
            ${isDarkMode ? 'opacity-100' : 'opacity-0'}
          `}>
            <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-2 left-4 w-0.5 h-0.5 bg-white rounded-full animate-pulse animation-delay-200"></div>
            <div className="absolute bottom-1.5 left-1.5 w-0.5 h-0.5 bg-white rounded-full animate-pulse animation-delay-400"></div>
          </div>
          
          {/* Day sky clouds */}
          <div className={`
            absolute inset-0 transition-opacity duration-500
            ${isDarkMode ? 'opacity-0' : 'opacity-100'}
          `}>
            <div className="absolute top-1 right-2 w-1.5 h-1 bg-white/60 rounded-full"></div>
            <div className="absolute top-2 right-4 w-1 h-0.5 bg-white/40 rounded-full"></div>
            <div className="absolute bottom-1 right-1 w-1 h-0.5 bg-white/50 rounded-full"></div>
          </div>
        </div>

        {/* Hover glow effect */}
        <div className={`
          absolute inset-0 rounded-full transition-all duration-300 opacity-0 hover:opacity-100
          ${isDarkMode 
            ? 'bg-gradient-to-r from-blue-400/20 to-indigo-400/20' 
            : 'bg-gradient-to-r from-yellow-300/20 to-orange-300/20'
          }
        `}></div>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`
        flex items-center gap-3 px-4 py-2 
        bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
        border border-white/20 dark:border-gray-600/20 
        rounded-xl transition-all duration-300
        hover:bg-white dark:hover:bg-gray-700 
        hover:shadow-lg
        ${className}
      `}>
        <span className="text-sm font-medium text-privacy-700 dark:text-privacy-300">
          {isDarkMode ? 'Темная' : 'Светлая'}
        </span>
        
        <button
          onClick={toggleDarkMode}
          className={`
            relative w-12 h-6 rounded-full transition-all duration-300
            ${isDarkMode 
              ? 'bg-gradient-to-r from-privacy-600 to-privacy-700' 
              : 'bg-gradient-to-r from-seafoam-400 to-ocean-400'
            }
            hover:scale-105 hover:shadow-lg
          `}
          aria-label={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
        >
          {/* Toggle Circle */}
          <div className={`
            absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 shadow-md
            flex items-center justify-center text-xs
            ${isDarkMode 
              ? 'translate-x-6 bg-white text-privacy-600' 
              : 'translate-x-0.5 bg-white text-seafoam-600'
            }
            ${shouldAnimate ? 'transform-gpu' : ''}
          `}>
            {isDarkMode ? '🌙' : '☀️'}
          </div>
        </button>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`
      flex items-center gap-4 px-6 py-3
      bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg 
      border border-white/20 dark:border-gray-600/20 
      rounded-2xl shadow-lg hover:shadow-xl
      transition-all duration-300
      ${className}
    `}>
      <div className="flex items-center gap-3">
        <div className="text-2xl">
          {isDarkMode ? '🌙' : '☀️'}
        </div>
        <div>
          <p className="font-bold text-black dark:text-white">
            {isDarkMode ? 'Темная тема' : 'Светлая тема'}
          </p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDarkMode ? 'Удобно для глаз в темноте' : 'Яркий и четкий дизайн'}
          </p>
        </div>
      </div>
      
      <button
        onClick={toggleDarkMode}
        className={`
          relative w-16 h-8 rounded-full transition-all duration-300
          ${isDarkMode 
            ? 'bg-gradient-to-r from-privacy-600 to-privacy-800' 
            : 'bg-gradient-to-r from-seafoam-400 to-ocean-500'
          }
          hover:scale-105 hover:shadow-lg
          ring-2 ring-white/20 hover:ring-white/40
        `}
        aria-label={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
      >
        {/* Toggle Circle */}
        <div className={`
          absolute top-1 w-6 h-6 rounded-full transition-all duration-300 shadow-lg
          flex items-center justify-center
          ${isDarkMode 
            ? 'translate-x-8 bg-white text-privacy-600' 
            : 'translate-x-1 bg-white text-seafoam-600'
          }
          ${shouldAnimate ? 'transform-gpu' : ''}
        `}>
          {isDarkMode ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.4 6.35,17.41C9.37,20.43 14,20.54 17.33,17.97Z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z" />
            </svg>
          )}
        </div>
      </button>
    </div>
  );
};

export default DarkModeToggle;