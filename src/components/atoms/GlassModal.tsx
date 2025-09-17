import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  variant?: 'default' | 'privacy' | 'success' | 'processing';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  preventBodyScroll?: boolean;
  className?: string;
}

const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  variant = 'default',
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  preventBodyScroll = true,
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal after a brief delay
      const timer = setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Return focus to previously focused element
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Body scroll prevention
  useEffect(() => {
    if (isOpen && preventBodyScroll) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, preventBodyScroll]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-7xl mx-4';
      default:
        return 'max-w-md';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'privacy':
        return `
          bg-white/80 dark:bg-privacy-900/80
          border-privacy-200/50 dark:border-privacy-600/50
          shadow-privacy-subtle
        `;
      case 'success':
        return `
          bg-white/85 dark:bg-seafoam-900/85
          border-seafoam-200/50 dark:border-seafoam-600/50
          shadow-seafoam-subtle
        `;
      case 'processing':
        return `
          bg-white/90 dark:bg-ocean-900/90
          border-ocean-200/50 dark:border-ocean-600/50
          shadow-ocean-subtle
        `;
      default:
        return `
          bg-white/85 dark:bg-slate-900/85
          border-white/20 dark:border-slate-700/50
          shadow-2xl
        `;
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Glassmorphism 2.0 Backdrop */}
      <div className="absolute inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-md" />
      
      {/* Modal Container */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full ${getSizeClasses()} 
          transform transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          ${className}
        `}
      >
        {/* Glassmorphism 2.0 Modal */}
        <div className={`
          relative rounded-2xl border backdrop-blur-xl
          ${getVariantClasses()}
          overflow-hidden
        `}>
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none" />
          
          {/* Header */}
          {title && (
            <div className="relative px-6 py-4 border-b border-white/10 dark:border-slate-700/30">
              <div className="flex items-center justify-between">
                <h2 id="modal-title" className="text-xl font-semibold text-privacy-800 dark:text-privacy-100">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="
                    p-2 rounded-lg transition-all duration-200
                    hover:bg-white/20 dark:hover:bg-slate-700/30
                    focus:outline-none focus:ring-2 focus:ring-privacy-accent focus:ring-offset-2
                    text-privacy-700 hover:text-privacy-900 dark:text-privacy-400 dark:hover:text-privacy-200
                  "
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="relative px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default GlassModal;