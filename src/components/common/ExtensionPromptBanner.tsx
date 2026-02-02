import { useCallback, useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';

const EXTENSION_URL = 'https://chromewebstore.google.com/detail/localpdf-private-pdf-comp/mjidkeobnlijdjmioniboflmoelmckfl';

const STORAGE_KEYS = {
  lastShown: 'extension_prompt_last_shown',
  showCount: 'extension_prompt_show_count',
  installed: 'extension_prompt_installed',
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_SHOWS = 3;

const getNumber = (value: string | null) => {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const ExtensionPromptBanner = () => {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(false);

  const canShow = useCallback(() => {
    const installed = localStorage.getItem(STORAGE_KEYS.installed) === 'true';
    if (installed) return false;

    const showCount = getNumber(localStorage.getItem(STORAGE_KEYS.showCount));
    if (showCount >= MAX_SHOWS) return false;

    const lastShown = getNumber(localStorage.getItem(STORAGE_KEYS.lastShown));
    if (lastShown && Date.now() - lastShown < ONE_DAY_MS) return false;

    return true;
  }, []);

  const markShown = useCallback(() => {
    const showCount = getNumber(localStorage.getItem(STORAGE_KEYS.showCount));
    localStorage.setItem(STORAGE_KEYS.showCount, String(showCount + 1));
    localStorage.setItem(STORAGE_KEYS.lastShown, String(Date.now()));
  }, []);

  useEffect(() => {
    const onDownload = () => {
      if (isVisible) return;
      if (!canShow()) return;
      markShown();
      setIsVisible(true);
    };

    window.addEventListener('localpdf:download', onDownload);
    return () => window.removeEventListener('localpdf:download', onDownload);
  }, [canShow, isVisible, markShown]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleInstall = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.installed, 'true');
    setIsVisible(false);
    window.open(EXTENSION_URL, '_blank', 'noopener,noreferrer');
  }, []);

  const bannerText = useMemo(() => ({
    title: t('common.extensionPromptTitle'),
    body: t('common.extensionPromptBody'),
    cta: t('common.extensionPromptCta'),
    dismiss: t('common.extensionPromptDismiss'),
  }), [t]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 z-[60] w-[min(92vw,420px)] sm:w-[420px] rounded-2xl border border-white/20 dark:border-white/10 bg-white/95 dark:bg-privacy-900/95 shadow-2xl backdrop-blur-lg p-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {bannerText.title}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {bannerText.body}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleInstall}
            className="bg-ocean-600 hover:bg-ocean-700 text-white"
          >
            {bannerText.cta}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {bannerText.dismiss}
          </Button>
        </div>
      </div>
    </div>
  );
};
