import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PlatformApp } from '../index';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Missing #root container');
}

createRoot(container).render(
  <StrictMode>
    <PlatformApp />
  </StrictMode>,
);
