import React from 'react';
import HomePage from './pages/HomePage';
import PrivacyPage from './pages/PrivacyPage';
import FAQPage from './pages/FAQPage';

function App() {
  // Simple client-side routing based on hash
  const getPage = () => {
    const path = window.location.hash.slice(1) || window.location.pathname;
    
    switch (path) {
      case '/privacy':
      case '#privacy':
        return <PrivacyPage />;
      case '/faq':
      case '#faq':
        return <FAQPage />;
      default:
        return <HomePage />;
    }
  };

  // Listen for hash changes
  React.useEffect(() => {
    const handleHashChange = () => {
      // Force re-render when hash changes
      window.location.reload();
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  return getPage();
}

export default App;