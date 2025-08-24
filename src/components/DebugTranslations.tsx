import React from 'react';
import { useTranslation, useI18n } from '../hooks/useI18n';

const DebugTranslations: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage, translations } = useI18n();

  const testKeys = [
    'home.hero.title',
    'home.hero.subtitle', 
    'home.hero.getStarted',
    'home.hero.learnMore',
    'home.tools.whyChooseTitle',
    'home.tools.whyChooseSubtitle',
    'home.tools.stats.tools',
    'home.tools.stats.toolsDescription'
  ];

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      fontSize: '12px',
      borderRadius: '4px',
      maxWidth: '400px',
      maxHeight: '90vh',
      overflow: 'auto',
      zIndex: 9999
    }}>
      <h4>🐛 Debug Translations</h4>
      <p><strong>Current Language:</strong> {currentLanguage}</p>
      <p><strong>Translations loaded:</strong> {translations ? 'Yes' : 'No'}</p>
      <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'SSR'}</p>
      
      <h5>Translation Test:</h5>
      {testKeys.map(key => (
        <div key={key} style={{ marginBottom: '4px' }}>
          <strong>{key}:</strong> 
          <span style={{ color: t(key) === key ? '#ff6b6b' : '#51cf66' }}>
            {t(key)}
          </span>
        </div>
      ))}

      <h5>Raw Translations Object (home):</h5>
      <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '200px' }}>
        {JSON.stringify(translations?.home, null, 2)}
      </pre>
      
      <h5>Direct Access Test:</h5>
      <div style={{ fontSize: '10px' }}>
        <div>translations.home.tools.whyChooseTitle: {JSON.stringify(translations?.home?.tools?.whyChooseTitle)}</div>
        <div>translations.home.tools.stats: {JSON.stringify(translations?.home?.tools?.stats)}</div>
      </div>

      <h5>Language Links (Test Navigation):</h5>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        <a href="/" style={{ color: '#4ECDC4', fontSize: '10px' }}>EN</a>
        <a href="/de" style={{ color: '#4ECDC4', fontSize: '10px' }}>DE</a>
        <a href="/fr" style={{ color: '#4ECDC4', fontSize: '10px' }}>FR</a>
        <a href="/es" style={{ color: '#4ECDC4', fontSize: '10px' }}>ES</a>
        <a href="/ru" style={{ color: '#4ECDC4', fontSize: '10px' }}>RU</a>
      </div>
      
      <div style={{ marginTop: '8px' }}>
        <a href="/de/merge-pdf" style={{ color: '#4ECDC4', fontSize: '10px' }}>DE Merge Tool</a> |&nbsp;
        <a href="/fr/compress-pdf" style={{ color: '#4ECDC4', fontSize: '10px' }}>FR Compress Tool</a>
      </div>
    </div>
  );
};

export default DebugTranslations;