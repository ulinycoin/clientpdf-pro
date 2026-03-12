import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PlatformApp } from './app';
import './styles.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

createRoot(root).render(
  <StrictMode>
    <PlatformApp />
  </StrictMode>,
);
