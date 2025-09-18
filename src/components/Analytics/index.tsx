import React from 'react';
import GoogleAnalytics from './GoogleAnalytics';
import YandexMetrica from './YandexMetrica';

interface AnalyticsProvidersProps {
  children?: React.ReactNode;
}

const AnalyticsProviders: React.FC<AnalyticsProvidersProps> = ({ children }) => {
  const yandexMetricaId = import.meta.env.VITE_YANDEX_METRICA_ID;

  // Only load analytics in production
  const isProduction = import.meta.env.PROD;

  if (!isProduction) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Google Analytics is now loaded via index.html for better SEO detection */}
      {yandexMetricaId && <YandexMetrica counterId={yandexMetricaId} />}
      {children}
    </>
  );
};

export default AnalyticsProviders;
export { GoogleAnalytics, YandexMetrica };