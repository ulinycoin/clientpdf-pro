import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    va?: (...args: unknown[]) => void;
    vaq?: unknown[];
    posthog?: {
      init: (key: string, options: Record<string, unknown>) => void;
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
    __localPdfGaLoaded?: boolean;
    __localPdfPosthogLoaded?: boolean;
    __localPdfVercelAnalyticsLoaded?: boolean;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim()
  || import.meta.env.PUBLIC_GA_MEASUREMENT_ID?.trim();
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY?.trim()
  || import.meta.env.PUBLIC_POSTHOG_KEY?.trim();
const POSTHOG_UI_HOST = import.meta.env.VITE_POSTHOG_UI_HOST?.trim()
  || import.meta.env.PUBLIC_POSTHOG_UI_HOST?.trim()
  || 'https://eu.posthog.com';
const ENABLE_VERCEL_ANALYTICS = import.meta.env.VITE_ENABLE_VERCEL_ANALYTICS === 'true'
  || import.meta.env.PUBLIC_ENABLE_VERCEL_ANALYTICS === 'true';

function appendScript(src: string, attributes: Record<string, string | boolean> = {}): void {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    return;
  }

  const script = document.createElement('script');
  script.src = src;
  Object.entries(attributes).forEach(([key, value]) => {
    if (typeof value === 'boolean') {
      if (value) {
        script.setAttribute(key, '');
      }
      return;
    }
    script.setAttribute(key, value);
  });
  document.head.appendChild(script);
}

function ensureGoogleAnalytics(measurementId: string): void {
  if (window.__localPdfGaLoaded) {
    return;
  }

  window.__localPdfGaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    send_page_view: false,
  });

  appendScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`, {
    async: true,
  });
}

function ensureVercelAnalytics(): void {
  if (window.__localPdfVercelAnalyticsLoaded) {
    return;
  }

  window.__localPdfVercelAnalyticsLoaded = true;
  window.va = window.va || function va(...args: unknown[]) {
    (window.vaq = window.vaq || []).push(args);
  };
  appendScript('/_vercel/insights/script.js', { async: true });
}

function ensurePosthog(key: string, uiHost: string): void {
  if (window.__localPdfPosthogLoaded) {
    return;
  }

  window.__localPdfPosthogLoaded = true;
  const bootstrap = document.createElement('script');
  bootstrap.text = `
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getGroups get_group_property set_group_property get_distinct_id getGroups get_session_id".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    const host = window.location.origin + '/ingest';
    window.posthog.init(${JSON.stringify(key)}, {
      api_host: host,
      ui_host: ${JSON.stringify(uiHost)},
      autocapture: false,
      capture_pageview: false,
      debug: false,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '.ph-no-capture',
        blockSelector: '.ph-no-capture, canvas'
      }
    });
  `;
  document.head.appendChild(bootstrap);
}

export function AppAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      ensureGoogleAnalytics(GA_MEASUREMENT_ID);
    }
    if (ENABLE_VERCEL_ANALYTICS) {
      ensureVercelAnalytics();
    }
    if (POSTHOG_KEY) {
      ensurePosthog(POSTHOG_KEY, POSTHOG_UI_HOST);
    }
  }, []);

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    const pageLocation = window.location.href;

    if (GA_MEASUREMENT_ID && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pagePath,
        page_location: pageLocation,
      });
    }

    if (POSTHOG_KEY && window.posthog?.capture) {
      window.posthog.capture('$pageview', {
        $current_url: pageLocation,
        path: pagePath,
      });
    }

    if (ENABLE_VERCEL_ANALYTICS && window.va) {
      window.va('pageview');
    }
  }, [location.hash, location.pathname, location.search]);

  return null;
}
