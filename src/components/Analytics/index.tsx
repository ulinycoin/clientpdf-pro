import React from 'react';
import GoogleAnalytics from './GoogleAnalytics';
import YandexMetrica from './YandexMetrica';

interface AnalyticsProvidersProps {
  children?: React.ReactNode;
}

const AnalyticsProviders: React.FC<AnalyticsProvidersProps> = ({ children }) => {
  const gaTrackingId = import.meta.env.VITE_GA_TRACKING_ID;
  const yandexMetricaId = import.meta.env.VITE_YANDEX_METRICA_ID;

  // Only load analytics in production
  const isProduction = import.meta.env.PROD;

  if (!isProduction) {
    return <>{children}</>;
  }

  return (
    <>
      {gaTrackingId && <GoogleAnalytics trackingId={gaTrackingId} />}
      {yandexMetricaId && <YandexMetrica counterId={yandexMetricaId} />}
      {children}
    </>
  );
};

export default AnalyticsProviders;
export { GoogleAnalytics, YandexMetrica };