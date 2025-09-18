import React, { useEffect } from 'react';

interface YandexMetricaProps {
  counterId: string;
}

declare global {
  interface Window {
    ym?: (counterId: number, method: string, ...args: any[]) => void;
  }
}

const YandexMetrica: React.FC<YandexMetricaProps> = ({ counterId }) => {
  useEffect(() => {
    if (!counterId || typeof window === 'undefined') return;

    const id = parseInt(counterId, 10);
    if (isNaN(id)) return;

    // Create the Yandex Metrica script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${id}', 'ym');

      ym(${id}, 'init', {ssr:true, webvisor:true, clickmap:true, accurateTrackBounce:true, trackLinks:true});
    `;

    document.head.appendChild(script);

    // Create noscript fallback
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${id}" style="position:absolute; left:-9999px;" alt="" /></div>`;
    document.head.appendChild(noscript);

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('script[src*="mc.yandex.ru"]');
      scripts.forEach(script => script.remove());

      const noscripts = document.querySelectorAll('noscript');
      noscripts.forEach(ns => {
        if (ns.innerHTML.includes('mc.yandex.ru')) {
          ns.remove();
        }
      });
    };
  }, [counterId]);

  return null;
};

export default YandexMetrica;