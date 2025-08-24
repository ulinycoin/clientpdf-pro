import { useEffect, useState } from 'react';

interface ServiceWorkerStatus {
  isSupported: boolean;
  isInstalled: boolean;
  isWaitingForUpdate: boolean;
  updateAvailable: boolean;
}

interface ServiceWorkerActions {
  registerSW: () => Promise<void>;
  updateSW: () => Promise<void>;
  skipWaiting: () => void;
}

type UseServiceWorkerReturn = ServiceWorkerStatus & ServiceWorkerActions;

export const useServiceWorker = (): UseServiceWorkerReturn => {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: 'serviceWorker' in navigator,
    isInstalled: false,
    isWaitingForUpdate: false,
    updateAvailable: false
  });

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Register service worker
  const registerSW = async (): Promise<void> => {
    if (!status.isSupported) {
      console.warn('[SW] Service workers not supported in this browser');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('[SW] Service worker registered successfully');
      setRegistration(reg);
      setStatus(prev => ({ ...prev, isInstalled: true }));

      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          console.log('[SW] New service worker found');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] New content available, update pending');
              setStatus(prev => ({ 
                ...prev, 
                isWaitingForUpdate: true,
                updateAvailable: true 
              }));
            }
          });
        }
      });

      // Check for waiting service worker on load
      if (reg.waiting) {
        setStatus(prev => ({ 
          ...prev, 
          isWaitingForUpdate: true,
          updateAvailable: true 
        }));
      }

    } catch (error) {
      console.error('[SW] Service worker registration failed:', error);
    }
  };

  // Update service worker
  const updateSW = async (): Promise<void> => {
    if (!registration) {
      console.warn('[SW] No registration found for update');
      return;
    }

    try {
      await registration.update();
      console.log('[SW] Service worker updated');
      
      if (registration.waiting) {
        skipWaiting();
      }
    } catch (error) {
      console.error('[SW] Service worker update failed:', error);
    }
  };

  // Skip waiting and activate new service worker
  const skipWaiting = (): void => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      registration.waiting.addEventListener('statechange', (e) => {
        const worker = e.target as ServiceWorker;
        if (worker.state === 'activated') {
          window.location.reload();
        }
      });
    }
  };

  // Listen for service worker messages
  useEffect(() => {
    if (!status.isSupported) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_UPDATE_AVAILABLE') {
        setStatus(prev => ({ 
          ...prev, 
          updateAvailable: true,
          isWaitingForUpdate: true 
        }));
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Listen for controller changes (new service worker activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Controller changed, reloading page');
      window.location.reload();
    });

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [status.isSupported]);

  // Auto-register service worker on mount
  useEffect(() => {
    if (status.isSupported && !status.isInstalled) {
      // Delay registration to not interfere with initial page load
      const timer = setTimeout(() => {
        registerSW();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [status.isSupported, status.isInstalled]);

  // Periodic update checks
  useEffect(() => {
    if (!registration) return;

    const checkForUpdates = () => {
      registration.update().catch(console.error);
    };

    // Check for updates every 30 minutes
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [registration]);

  return {
    ...status,
    registerSW,
    updateSW,
    skipWaiting
  };
};