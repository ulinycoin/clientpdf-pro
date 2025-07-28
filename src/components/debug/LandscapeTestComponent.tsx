import React from 'react';
import { ExcelToPDFGenerator } from '../../services/excelToPDFGenerator';
import { ExcelSheet, ConversionOptions } from '../../types/excelToPdf.types';
import Button from '../atoms/Button';

export const LandscapeTestComponent: React.FC = () => {
  const testLandscapeConversion = async () => {
    console.log('🧪 Starting landscape orientation test...');

    // Create test data
    const testSheet: ExcelSheet = {
      name: 'Landscape Test',
      data: [
        [
          { value: 'Product Name', type: 'string' as const },
          { value: 'Description', type: 'string' as const },
          { value: 'Price', type: 'string' as const },
          { value: 'Category', type: 'string' as const },
          { value: 'In Stock', type: 'string' as const }
        ],
        [
          { value: 'Laptop Pro 15', type: 'string' as const },
          { value: 'High-performance laptop with great display', type: 'string' as const },
          { value: '$1299.99', type: 'string' as const },
          { value: 'Electronics', type: 'string' as const },
          { value: 'Yes', type: 'string' as const }
        ],
        [
          { value: 'Wireless Mouse', type: 'string' as const },
          { value: 'Ergonomic wireless mouse with precision tracking', type: 'string' as const },
          { value: '$29.99', type: 'string' as const },
          { value: 'Accessories', type: 'string' as const },
          { value: 'Yes', type: 'string' as const }
        ],
        [
          { value: 'Office Chair', type: 'string' as const },
          { value: 'Comfortable office chair with lumbar support and adjustable height', type: 'string' as const },
          { value: '$199.99', type: 'string' as const },
          { value: 'Furniture', type: 'string' as const },
          { value: 'No', type: 'string' as const }
        ]
      ]
    };

    const landscapeOptions: ConversionOptions = {
      selectedSheets: ['Landscape Test'],
      orientation: 'landscape',
      pageSize: 'A4',
      fontSize: 10,
      fontFamily: 'helvetica',
      includeSheetNames: true,
      handleWideTablesWith: 'scale',
      outputFormat: 'single-pdf',
      margins: { top: 20, right: 20, bottom: 20, left: 20 }
    };

    const portraitOptions: ConversionOptions = {
      ...landscapeOptions,
      orientation: 'portrait'
    };

    try {
      const generator = new ExcelToPDFGenerator();

      // Test portrait first
      console.log('📄 Testing portrait orientation...');
      const portraitResult = await generator.generatePDF([testSheet], portraitOptions, (progress, message) => {
        console.log(`Portrait: ${progress}% - ${message}`);
      });

      if (portraitResult.success && portraitResult.pdfFiles?.[0]) {
        const portraitBlob = new Blob([portraitResult.pdfFiles[0].data], { type: 'application/pdf' });
        const portraitUrl = URL.createObjectURL(portraitBlob);
        const portraitLink = document.createElement('a');
        portraitLink.href = portraitUrl;
        portraitLink.download = 'test-portrait.pdf';
        portraitLink.click();
        URL.revokeObjectURL(portraitUrl);
        console.log('✅ Portrait PDF downloaded successfully');
      }

      // Test landscape
      console.log('📄 Testing landscape orientation...');
      const landscapeResult = await generator.generatePDF([testSheet], landscapeOptions, (progress, message) => {
        console.log(`Landscape: ${progress}% - ${message}`);
      });

      if (landscapeResult.success && landscapeResult.pdfFiles?.[0]) {
        const landscapeBlob = new Blob([landscapeResult.pdfFiles[0].data], { type: 'application/pdf' });
        const landscapeUrl = URL.createObjectURL(landscapeBlob);
        const landscapeLink = document.createElement('a');
        landscapeLink.href = landscapeUrl;
        landscapeLink.download = 'test-landscape.pdf';
        landscapeLink.click();
        URL.revokeObjectURL(landscapeUrl);
        console.log('✅ Landscape PDF downloaded successfully');
        alert('✅ Both PDFs generated! Check your downloads folder and compare the files.');
      } else {
        console.error('❌ Landscape conversion failed:', landscapeResult.error);
        alert('❌ Landscape conversion failed. Check console for details.');
      }

    } catch (error) {
      console.error('❌ Test failed:', error);
      alert('❌ Test failed. Check console for details.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">🧪 Landscape Orientation Test</h3>
      <p className="text-gray-600 mb-4">
        Click the button below to test both portrait and landscape PDF generation.
        This will download two PDF files for comparison.
      </p>
      <Button onClick={testLandscapeConversion} variant="secondary">
        Run Landscape Test
      </Button>
      <div className="mt-4 text-sm text-gray-500">
        <p><strong>What this test does:</strong></p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Creates test data with 5 columns and multiple rows</li>
          <li>Generates both portrait and landscape PDFs</li>
          <li>Downloads both files for visual comparison</li>
          <li>Logs detailed information to browser console</li>
        </ul>
      </div>
    </div>
  );
};

export default LandscapeTestComponent;
