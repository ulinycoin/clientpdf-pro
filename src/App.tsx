import React from 'react';
import { HomePage, PrivacyPage, FAQPage } from './pages';

function App() {
  // Simple client-side routing based on pathname
  const getPage = () => {
    const path = window.location.pathname;
    
    switch (path) {
      case '/privacy':
        return <PrivacyPage />;
      case '/faq':
        return <FAQPage />;
      default:
        return <HomePage />;
    }
  };

  // Listen for navigation changes
  React.useEffect(() => {
    const handleNavigation = () => {
      // Force re-render when navigation occurs
      window.location.reload();
    };

    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  return getPage();
}

export default App;