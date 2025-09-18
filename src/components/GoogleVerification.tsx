import React, { useEffect } from 'react';

const GoogleVerification: React.FC = () => {
  useEffect(() => {
    // Return the exact content Google expects
    const content = 'google-site-verification: google34adca022b79f1a0.html';

    // Set the content type to plain text
    document.body.textContent = content;
    document.body.style.fontFamily = 'monospace';
    document.body.style.whiteSpace = 'pre';
  }, []);

  return null;
};

export default GoogleVerification;