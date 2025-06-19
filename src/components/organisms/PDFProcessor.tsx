// Fix the truncated error handling code
import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Trash2, Settings } from 'lucide-react';
import { Button } from '../atoms/Button';
import { clsx } from 'clsx';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

// ... (existing interfaces and component code remains the same until the error handling)

  // Compress PDF
  const compressPDF = async (file: File) => {
    try {
      updateStatus(5, 'Loading PDF for compression...', 'info');
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const pdf = await PDFDocument.load(arrayBuffer);
      
      updateStatus(20, 'Analyzing PDF structure...', 'info');

      // Get original size
      const originalSize = file.size;

      // Apply compression settings based on quality level
      const compressionOptions = {
        useObjectStreams: compressionSettings.quality !== 'high',
        addDefaultPage: false,
        objectsPerTick: compressionSettings.quality === 'low' ? 50 : 
                       compressionSettings.quality === 'medium' ? 30 : 20,
      };

      updateStatus(40, 'Applying compression...', 'info');

      if (compressionSettings.removeMetadata) {
        updateStatus(50, 'Removing metadata...', 'info');
        pdf.setTitle('');
        pdf.setAuthor('');
        pdf.setSubject('');
        pdf.setKeywords([]);
        pdf.setProducer('LocalPDF');
        pdf.setCreator('LocalPDF');
        pdf.setCreationDate(new Date());
        pdf.setModificationDate(new Date());
      }

      updateStatus(70, 'Optimizing PDF structure...', 'info');
      const compressedPdfBytes = await pdf.save(compressionOptions);

      // Calculate compression ratio
      const compressedSize = compressedPdfBytes.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100);

      updateStatus(90, 'Preparing compressed file...', 'info');
      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      saveAs(blob, `${file.name.replace('.pdf', '')}-compressed.pdf`);

      const message = `PDF compressed successfully!\nOriginal: ${formatFileSize(originalSize)}\nCompressed: ${formatFileSize(compressedSize)}\nSpace saved: ${compressionRatio.toFixed(1)}%`;
      updateStatus(100, message, 'success');
    } catch (error) {
      console.error('Error compressing PDF:', error);
      updateStatus(0, `Error compressing PDF: ${error.message}`, 'error');
      
      // Enhanced error reporting
      if (error.message.includes('out of memory')) {
        updateStatus(0, 'File too large. Try a smaller file or compress in parts.', 'warning');
      } else if (error.message.includes('corrupt')) {
        updateStatus(0, 'PDF file appears corrupted. Please try another file.', 'error');
      }
    }
  };

  // ... rest of the component code remains the same
};

export { PDFProcessor };