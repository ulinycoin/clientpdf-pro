import React from 'react';
import * as XLSX from 'xlsx';
import Button from '../atoms/Button';

interface TestDataGeneratorProps {
  onFileGenerated?: (file: File) => void;
}

const TestDataGenerator: React.FC<TestDataGeneratorProps> = ({ onFileGenerated }) => {

  const createTestExcelFile = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Multilingual Text Test
    const multilingualData = [
      // Headers in different languages
      ['English', 'Русский', 'Español', 'Français', 'Deutsch', '中文', 'العربية', 'हिन्दी'],

      // Row 1: Greetings
      ['Hello World', 'Привет мир', 'Hola mundo', 'Bonjour monde', 'Hallo Welt', '你好世界', 'مرحبا بالعالم', 'नमस्ते दुनिया'],

      // Row 2: Numbers and currencies
      ['Numbers: 123', 'Числа: 456', 'Números: 789', 'Nombres: 012', 'Zahlen: 345', '数字: 678', 'أرقام: 901', 'संख्या: 234'],

      // Row 3: Special characters
      ['Symbols: @#$%^&*', 'Символы: !?()[]{}', 'Símbolos: <>+=|\\', 'Symboles: ~`\'"', 'Symbole: ±×÷≠', '符号: ～￥¥€', 'رموز: ؟！×÷±', 'प्रतीक: ₹€$£¥'],

      // Row 4: Long text wrapping test
      ['This is a very long text that should test text wrapping capabilities in PDF generation and see how it handles overflow',
       'Это очень длинный текст для проверки возможностей переноса строк при генерации PDF и проверки обработки переполнения',
       'Este es un texto muy largo para probar las capacidades de ajuste de texto en la generación de PDF',
       'Ceci est un texte très long pour tester les capacités d\'ajustement du texte dans la génération PDF',
       'Dies ist ein sehr langer Text zum Testen der Textumbruch-Funktionen bei der PDF-Generierung',
       '这是一个很长的文本，用于测试PDF生成中的文本换行功能以及如何处理溢出情况',
       'هذا نص طويل جداً لاختبار قدرات التفاف النص في توليد PDF ومعرفة كيفية التعامل مع الفيض',
       'यह बहुत लंबा पाठ है जो PDF निर्माण में पाठ लपेटने की क्षमताओं का परीक्षण करता है'],

      // Row 5: Dates and mixed content
      ['Date: 2024-01-15', 'Дата: 15.01.2024', 'Fecha: 15/01/2024', 'Date: 15-01-2024', 'Datum: 15.01.2024', '日期: 2024年1月15日', 'التاريخ: ١٥/٠١/٢٠٢٤', 'दिनांक: १५/०१/२०२४'],

      // Row 6: Prices and currency
      ['Price: $99.99', 'Цена: 1999₽', 'Precio: €89.50', 'Prix: 75.25€', 'Preis: 85,00€', '价格: ¥688', 'السعر: 299 ر.س', 'मूल्य: ₹2,999']
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(multilingualData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Multilingual Test');

    // Sheet 2: Data Types and Numbers
    const dataTypesData = [
      ['Data Type', 'Example', 'Numeric Value', 'Formatted', 'Notes'],
      ['Text', 'Sample Text', '', 'N/A', 'Plain text content'],
      ['Small Integer', '42', 42, '42', 'Whole number'],
      ['Large Integer', '1234567890', 1234567890, '1,234,567,890', 'Big number'],
      ['Decimal', '3.14159', 3.14159, '3.14', 'Pi approximation'],
      ['Currency', '$1,234.56', 1234.56, '$1,234.56', 'US Dollar'],
      ['Percentage', '75%', 0.75, '75.0%', 'Three quarters'],
      ['Scientific', '1.23E+10', 12300000000, '1.23×10¹⁰', 'Scientific notation'],
      ['Negative', '-456.789', -456.789, '(456.79)', 'Negative number'],
      ['Zero', '0', 0, '0.00', 'Zero value'],
      ['Fraction', '3/4', 0.75, '¾', 'Fraction representation'],
      ['Boolean True', 'TRUE', 1, '✓', 'Boolean true'],
      ['Boolean False', 'FALSE', 0, '✗', 'Boolean false'],
      ['Empty Cell', '', '', '', 'Blank content'],
      ['Unicode Emoji', '🌍🚀💎✨🎉📊💰', '', 'N/A', 'Unicode symbols and emoji']
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(dataTypesData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Data Types');

    // Sheet 3: Wide Table (many columns)
    const wideTableHeaders = [
      'ID', 'First Name', 'Last Name', 'Email Address', 'Phone Number',
      'Street Address', 'City', 'State/Region', 'Country', 'Postal Code',
      'Department', 'Job Title', 'Manager', 'Hire Date', 'Salary',
      'Performance Rating', 'Languages', 'Skills', 'Notes', 'Status'
    ];

    const wideTableData = [
      wideTableHeaders,
      [1, 'John', 'Doe', 'john.doe@company.com', '+1-555-0123', '123 Main Street', 'New York', 'NY', 'USA', '10001', 'Engineering', 'Senior Software Developer', 'Jane Smith', '2022-03-15', 95000, 'Excellent', 'English, Spanish', 'React, TypeScript, Node.js', 'Top performer, ready for promotion', 'Active'],
      [2, 'Анна', 'Иванова', 'anna.ivanova@company.ru', '+7-495-123-4567', 'ул. Пушкина, д. 10, кв. 5', 'Москва', 'Московская обл.', 'Россия', '101000', 'Маркетинг', 'Менеджер по маркетингу', 'Петр Петров', '2021-06-01', 75000, 'Отлично', 'Русский, Английский', 'SEO, PPC, Аналитика', 'Креативный подход к решению задач', 'Активный'],
      [3, 'María', 'García López', 'maria.garcia@company.es', '+34-91-123-4567', 'Calle Mayor, 25, 3º B', 'Madrid', 'Comunidad de Madrid', 'España', '28001', 'Ventas', 'Representante de Ventas', 'Carlos López', '2023-01-10', 55000, 'Bueno', 'Español, Inglés, Francés', 'CRM, Negociación', 'Excelente trato con clientes', 'Activo'],
      [4, 'Jean-Pierre', 'Dupont', 'jp.dupont@company.fr', '+33-1-23-45-67-89', '15 Rue de la Paix, Apt 12', 'Paris', 'Île-de-France', 'France', '75001', 'Finance', 'Comptable Senior', 'Sophie Martin', '2020-09-22', 65000, 'Très bien', 'Français, Anglais', 'SAP, Excel, Audit', 'Très rigoureux et précis', 'Actif'],
      [5, '山田', '太郎', 'yamada.taro@company.jp', '+81-3-1234-5678', '東京都渋谷区神南1-2-3', '東京', '東京都', '日本', '150-0001', '開発部', 'シニアプログラマー', '田中花子', '2022-11-30', 8000000, '優秀', '日本語, 英語', 'Java, Python, AWS', '技術力が高く、チームのリーダー的存在', 'アクティブ']
    ];

    const ws3 = XLSX.utils.aoa_to_sheet(wideTableData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Wide Table');

    // Sheet 4: Special Characters and Symbols
    const specialCharData = [
      ['Category', 'Characters', 'Description', 'Use Case'],
      ['Mathematical', '∑ ∆ π ∞ ≤ ≥ ≠ ± √ ∫ ∂ ∇', 'Math symbols', 'Scientific documents'],
      ['Arrows', '← → ↑ ↓ ↔ ↕ ⟵ ⟶ ⇒ ⇔ ↗ ↘', 'Directional arrows', 'Flow charts, directions'],
      ['Bullets & Lists', '• ◦ ▪ ▫ ○ ● ◆ ◇ ■ □ ▲ ▼', 'List markers', 'Bullet points, lists'],
      ['Currency Symbols', '$ € £ ¥ ₹ ₽ ₩ ₪ ₫ ₦ ₡ ₵', 'World currencies', 'Financial documents'],
      ['Fractions', '½ ⅓ ¼ ⅕ ⅙ ⅛ ⅔ ¾ ⅖ ⅗ ⅘ ⅚', 'Common fractions', 'Measurements, recipes'],
      ['Superscript', 'x² y³ z⁴ E=mc² a⁰ b¹ c²', 'Raised numbers/letters', 'Mathematical formulas'],
      ['Subscript', 'H₂O CO₂ CH₄ H₂SO₄ C₆H₁₂O₆', 'Lowered numbers/letters', 'Chemical formulas'],
      ['Diacritics Latin', 'café naïve résumé piñata façade', 'Accented characters', 'International names'],
      ['Quotation Marks', '"Double" \'Single\' „German" «French» „Polish"', 'Various quote styles', 'Text formatting'],
      ['Dashes & Spaces', 'Hyphen- En–dash Em—dash Non-breaking space', 'Different dash types', 'Typography'],
      ['Mixed Scripts', 'Hello مرحبا 你好 Здравствуй Γεια', 'Multiple writing systems', 'International content'],
      ['Emoji & Symbols', '🌍 🚀 💎 ✨ 🎉 📊 💰 ⭐ ❤️ 🔥', 'Modern unicode symbols', 'Social media, modern docs'],
      ['Technical', '© ® ™ § ¶ † ‡ • ‰ ‱', 'Legal and technical', 'Legal documents'],
      ['Weather & Time', '☀ ☁ ☂ ❄ ⚡ 🌙 ⏰ 📅 🕐 🕑', 'Time and weather', 'Reports, schedules']
    ];

    const ws4 = XLSX.utils.aoa_to_sheet(specialCharData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Special Characters');

    // Sheet 5: Layout Challenges
    const layoutData = [
      ['Short', 'Medium Length Text', 'This is a significantly longer text that will test column width calculations', '', 'Empty'],
      ['A', 'Longer header that might cause issues', 'Content', 'More content here', 'End'],
      ['', '', '', '', ''],
      ['Data', '', 'Some data', '', 'Final'],
      ['Test', 'Multiple\nLines\nIn\nOne\nCell', 'Normal text', 'URL: https://example.com/very/long/path/to/resource', ''],
      ['Numbers', '123,456.789', '-999.99', '0.001', '1,000,000,000'],
      ['Final Row', 'Last cell with some content', '', 'Almost done', 'The End!']
    ];

    const ws5 = XLSX.utils.aoa_to_sheet(layoutData);
    XLSX.utils.book_append_sheet(wb, ws5, 'Layout Test');

    return wb;
  };

  const generateAndDownload = () => {
    try {
      const wb = createTestExcelFile();
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      // Create blob and file
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const file = new File([blob], 'excel-to-pdf-test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Download file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'excel-to-pdf-test.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Notify parent component
      if (onFileGenerated) {
        onFileGenerated(file);
      }

      console.log('✅ Test Excel file generated successfully!');
      console.log('The file contains:');
      console.log('• Multilingual Test - 8 languages including RTL');
      console.log('• Data Types - Various data formats and numbers');
      console.log('• Wide Table - 20 columns with international data');
      console.log('• Special Characters - Unicode, symbols, emoji');
      console.log('• Layout Test - Edge cases and formatting challenges');

    } catch (error) {
      console.error('Error generating test file:', error);
      alert('Error generating test file. Check console for details.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">📊 Test Data Generator</h3>
      <p className="text-gray-600 mb-4">
        Generate a comprehensive test Excel file with multilingual content, special characters,
        various data types, and layout challenges to test all PDF conversion features.
      </p>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Test file includes:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Multilingual Test:</strong> 8 languages (English, Russian, Spanish, French, German, Chinese, Arabic, Hindi)</li>
          <li>• <strong>Data Types:</strong> Numbers, dates, currencies, percentages, booleans, emoji</li>
          <li>• <strong>Wide Table:</strong> 20 columns with international employee data</li>
          <li>• <strong>Special Characters:</strong> Math symbols, arrows, fractions, diacritics</li>
          <li>• <strong>Layout Test:</strong> Long text, empty cells, mixed content</li>
        </ul>
      </div>

      <Button
        onClick={generateAndDownload}
        className="w-full sm:w-auto"
      >
        📁 Generate Test Excel File
      </Button>

      <p className="text-xs text-gray-500 mt-2">
        File will be saved as "excel-to-pdf-test.xlsx" and contains realistic test data
        for comprehensive PDF conversion testing.
      </p>
    </div>
  );
};

export default TestDataGenerator;
