import React, { useEffect, useState } from 'react';

interface PreviewImageProps {
  src?: string | null;
  alt?: string;
  fit?: 'contain' | 'cover';
  className?: string;
  onStateChange?: (state: 'loading' | 'ready' | 'error') => void;
}

export const PreviewImage: React.FC<PreviewImageProps> = ({
  src,
  alt = 'Preview',
  fit = 'contain',
  className = '',
  onStateChange,
}) => {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(src ? 'loading' : 'error');

  useEffect(() => {
    if (!src) {
      setState('error');
      onStateChange?.('error');
    } else {
      setState('loading');
      onStateChange?.('loading');
    }
  }, [src, onStateChange]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {state === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-privacy-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ocean-500 border-t-transparent" />
          <div className="text-xs font-medium">Loading preview...</div>
        </div>
      )}

      {state === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center text-error-600 dark:text-error-400">
          <div className="text-xs font-semibold">Failed to load preview</div>
        </div>
      )}

      {src && (
        <img
          src={src}
          alt={alt}
          className={[
            'max-w-full max-h-full transition-opacity duration-300',
            fit === 'cover' ? 'object-cover' : 'object-contain',
            state === 'ready' ? 'opacity-100' : 'opacity-0',
            className,
          ].join(' ')}
          onLoad={() => {
            setState('ready');
            onStateChange?.('ready');
          }}
          onError={() => {
            setState('error');
            onStateChange?.('error');
          }}
        />
      )}
    </div>
  );
};
