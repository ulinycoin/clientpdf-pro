import React from 'react';

export type PreviewFrameState = 'empty' | 'loading' | 'partial' | 'ready' | 'error';
export type PreviewFrameSize = 'card' | 'standard' | 'hero' | 'modal' | 'fluid';

interface PreviewFrameProps {
  children?: React.ReactNode;
  state?: PreviewFrameState;
  size?: PreviewFrameSize;
  aspectRatio?: number;
  style?: React.CSSProperties;
  className?: string;
  contentClassName?: string;
  emptyLabel?: string;
  loadingLabel?: string;
  errorLabel?: string;
  errorDetail?: string;
  overlayTopLeft?: React.ReactNode;
  overlayTopRight?: React.ReactNode;
  overlayBottomLeft?: React.ReactNode;
  overlayBottomRight?: React.ReactNode;
  overlayCenter?: React.ReactNode;
  footer?: React.ReactNode;
}

const sizeClasses: Record<PreviewFrameSize, string> = {
  card: 'w-full max-w-[140px] sm:max-w-[150px]',
  standard: 'w-full max-w-[200px] sm:max-w-[220px]',
  hero: 'w-full max-w-[520px] sm:max-w-[600px]',
  modal: 'w-full max-w-[680px]',
  fluid: 'w-full',
};

const paddingClasses: Record<PreviewFrameSize, string> = {
  card: 'p-2',
  standard: 'p-3 sm:p-4',
  hero: 'p-4 sm:p-6',
  modal: 'p-4 sm:p-6',
  fluid: 'p-2 sm:p-3',
};

const minHeightClasses: Record<PreviewFrameSize, string> = {
  card: '',
  standard: '',
  hero: 'min-h-[360px] sm:min-h-[480px]',
  modal: 'min-h-[420px] sm:min-h-[560px]',
  fluid: '',
};

export const PreviewFrame: React.FC<PreviewFrameProps> = ({
  children,
  state = 'ready',
  size = 'standard',
  aspectRatio,
  style,
  className = '',
  contentClassName = '',
  emptyLabel = 'No preview',
  loadingLabel = 'Loading preview...',
  errorLabel = 'Failed to load preview',
  errorDetail,
  overlayTopLeft,
  overlayTopRight,
  overlayBottomLeft,
  overlayBottomRight,
  overlayCenter,
  footer,
}) => {
  const resolvedAspectRatio = aspectRatio && aspectRatio > 0 ? aspectRatio : 3 / 4;

  return (
    <div
      className={[
        'relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border',
        'bg-privacy-50 dark:bg-privacy-900/40',
        'border-privacy-200/50 dark:border-privacy-700/60',
        sizeClasses[size],
        minHeightClasses[size],
        size === 'hero' || size === 'modal' ? 'shadow-large' : 'shadow-sm',
        className,
      ].join(' ')}
      style={{ aspectRatio: resolvedAspectRatio, ...style }}
    >
      <div className={['relative w-full h-full flex items-center justify-center', paddingClasses[size], contentClassName].join(' ')}>
        {state === 'empty' && (
          <div className="text-center text-gray-400 dark:text-privacy-400">
            <div className="text-sm font-medium">{emptyLabel}</div>
          </div>
        )}

        {state === 'loading' && (
          <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-privacy-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-ocean-500 border-t-transparent" />
            <div className="text-sm font-medium">{loadingLabel}</div>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center gap-2 text-center text-error-600 dark:text-error-400">
            <div className="text-sm font-semibold">{errorLabel}</div>
            {errorDetail && <div className="text-xs opacity-80">{errorDetail}</div>}
          </div>
        )}

        {(state === 'ready' || state === 'partial') && (
          <div className="relative w-full h-full flex items-center justify-center">
            {children}
          </div>
        )}

        {state === 'partial' && (
          <div className="absolute left-4 bottom-4 glass-premium dark:glass-premium-dark px-3 py-1 rounded-full text-[10px] font-semibold text-gray-600 dark:text-gray-300">
            Rendering pages...
          </div>
        )}
      </div>

      {overlayTopLeft && (
        <div className="absolute top-3 left-3 z-20">{overlayTopLeft}</div>
      )}
      {overlayTopRight && (
        <div className="absolute top-3 right-3 z-20">{overlayTopRight}</div>
      )}
      {overlayBottomLeft && (
        <div className="absolute bottom-3 left-3 z-20">{overlayBottomLeft}</div>
      )}
      {overlayBottomRight && (
        <div className="absolute bottom-3 right-3 z-20">{overlayBottomRight}</div>
      )}
      {overlayCenter && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">{overlayCenter}</div>
        </div>
      )}

      {footer && (
        <div className="absolute bottom-0 inset-x-0 z-10">{footer}</div>
      )}
    </div>
  );
};
