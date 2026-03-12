import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) {
            return 'vendor-react';
          }
          if (id.includes('/lucide-react/')) {
            return 'vendor-icons';
          }
          if (id.includes('/konva/') || id.includes('/react-konva/') || id.includes('/use-image/')) {
            return 'vendor-konva';
          }
          if (id.includes('/pdfjs-dist/')) {
            return 'vendor-pdfjs';
          }
          if (id.includes('/pdf-lib/')) {
            return 'vendor-pdflib';
          }
          if (id.includes('/tesseract.js') || id.includes('/tesseract.js-core/')) {
            return 'vendor-ocr';
          }
          if (id.includes('/exceljs/')) {
            return 'vendor-excel';
          }
          if (id.includes('/jspdf/') || id.includes('/jspdf-autotable/')) {
            return 'vendor-jspdf';
          }
          if (id.includes('/mammoth/')) {
            return 'vendor-mammoth';
          }
          if (id.includes('/html2canvas/') || id.includes('/canvg/')) {
            return 'vendor-canvas';
          }
        },
      },
    },
  },
  worker: {
    format: 'es',
  },
});
