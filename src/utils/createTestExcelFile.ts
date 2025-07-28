import * as XLSX from 'xlsx';

// Create a comprehensive test Excel file for PDF conversion testing
function createTestExcelFile() {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Multilingual Text Test
  const multilingualData = [
    // Headers in different languages
    ['English', 'Русский', 'Español', 'Français', 'Deutsch', '中文', 'العربية', 'हिन्दी'],

    // Row 1: Greetings
    ['Hello World', 'Привет мир', 'Hola mundo', 'Bonjour monde', 'Hallo Welt', '你好世界', 'مرحبا بالعالم', 'नमस्ते दुनिया'],

    // Row 2: Numbers
    ['Numbers: 123', 'Числа: 456', 'Números: 789', 'Nombres: 012', 'Zahlen: 345', '数字: 678', 'أرقام: 901', 'संख्या: 234'],

    // Row 3: Special characters
    ['Symbols: @#$%', 'Символы: !?&*', 'Símbolos: <>[]', 'Symboles: {}()', 'Symbole: +=|\\', '符号: ～￥', 'رموز: ؟！×÷', 'प्रतीक: ₹€$'],

    // Row 4: Long text to test wrapping
    ['This is a very long text that should test text wrapping capabilities in PDF generation',
     'Это очень длинный текст для проверки возможностей переноса строк при генерации PDF',
     'Este es un texto muy largo para probar las capacidades de ajuste de texto',
     'Ceci est un texte très long pour tester les capacités d\'ajustement du texte',
     'Dies ist ein sehr langer Text zum Testen der Textumbruch-Funktionen',
     '这是一个很长的文本，用于测试PDF生成中的文本换行功能',
     'هذا نص طويل جداً لاختبار قدرات التفاف النص في توليد PDF',
     'यह बहुत लंबा पाठ है जो PDF निर्माण में पाठ लपेटने की क्षमताओं का परीक्षण करता है'],

    // Row 5: Mixed content
    ['Date: 2024-01-15', 'Дата: 15.01.2024', 'Fecha: 15/01/2024', 'Date: 15-01-2024', 'Datum: 15.01.2024', '日期: 2024年1月15日', 'التاريخ: ١٥/٠١/٢٠٢٤', 'दिनांक: १५/०१/२०२४'],

    // Row 6: Currency and numbers
    ['Price: $99.99', 'Цена: 1999₽', 'Precio: €89.50', 'Prix: 75.25€', 'Preis: 85,00€', '价格: ¥688', 'السعر: 299 ر.س', 'मूल्य: ₹2,999']
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(multilingualData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Multilingual Test');

  // Sheet 2: Data Types Test
  const dataTypesData = [
    ['Data Type', 'Example', 'Format', 'Notes'],
    ['Text', 'Sample Text', 'String', 'Plain text content'],
    ['Integer', 42, 'Number', 'Whole number'],
    ['Decimal', 3.14159, 'Number', 'Floating point'],
    ['Currency', 1234.56, 'Currency', '$1,234.56'],
    ['Percentage', 0.75, 'Percentage', '75%'],
    ['Date', new Date('2024-01-15'), 'Date', 'ISO format'],
    ['Boolean', true, 'Boolean', 'TRUE/FALSE'],
    ['Formula', '=A2+B2', 'Formula', 'Calculated value'],
    ['Empty', '', 'Empty', 'Blank cell'],
    ['NULL', null, 'NULL', 'Null value'],
    ['Unicode', '🌍🚀💎✨🎉', 'Emoji', 'Unicode symbols']
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(dataTypesData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Data Types');

  // Sheet 3: Layout Test (Wide table)
  const layoutHeaders = [
    'ID', 'Name', 'Email', 'Phone', 'Address', 'City', 'Country', 'ZIP', 'Department', 'Position', 'Salary', 'Start Date', 'Manager', 'Notes', 'Status'
  ];

  const layoutData = [
    layoutHeaders,
    [1, 'John Doe', 'john.doe@email.com', '+1-555-0123', '123 Main St', 'New York', 'USA', '10001', 'Engineering', 'Senior Developer', 95000, '2022-03-15', 'Jane Smith', 'Excellent performance', 'Active'],
    [2, 'Анна Иванова', 'anna.ivanova@email.ru', '+7-495-123-4567', 'ул. Пушкина, д. 10', 'Москва', 'Россия', '101000', 'Маркетинг', 'Менеджер', 75000, '2021-06-01', 'Петр Петров', 'Отличная работа', 'Активный'],
    [3, 'María García', 'maria.garcia@email.es', '+34-91-123-4567', 'Calle Mayor, 25', 'Madrid', 'España', '28001', 'Ventas', 'Representante', 55000, '2023-01-10', 'Carlos López', 'Buen rendimiento', 'Activo'],
    [4, 'Jean Dupont', 'jean.dupont@email.fr', '+33-1-23-45-67-89', '15 Rue de la Paix', 'Paris', 'France', '75001', 'Finance', 'Comptable', 65000, '2020-09-22', 'Sophie Martin', 'Très professionnel', 'Actif'],
    [5, '山田太郎', 'yamada.taro@email.jp', '+81-3-1234-5678', '東京都渋谷区1-2-3', '東京', '日本', '150-0001', '開発', 'プログラマー', 8000000, '2022-11-30', '田中花子', '優秀な技術者', 'アクティブ']
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(layoutData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Wide Table Test');

  // Sheet 4: Special Characters and Edge Cases
  const specialData = [
    ['Type', 'Content', 'Description'],
    ['Quotes', '"Double quotes" and \'single quotes\'', 'Various quotation marks'],
    ['Math', '∑, ∆, π, ∞, ≤, ≥, ≠, ±, √, ∫', 'Mathematical symbols'],
    ['Arrows', '← → ↑ ↓ ↔ ↕ ⟵ ⟶ ⇒ ⇔', 'Arrow symbols'],
    ['Bullets', '• ◦ ▪ ▫ ○ ● ◆ ◇ ■ □', 'Bullet points'],
    ['Currency', '$ € £ ¥ ₹ ₽ ₩ ₪ ₫ ₦', 'World currencies'],
    ['Fractions', '½ ⅓ ¼ ⅕ ⅙ ⅛ ⅔ ¾ ⅖ ⅗', 'Fraction symbols'],
    ['Superscript', 'x² + y² = z²', 'Mathematical notation'],
    ['Subscript', 'H₂O, CO₂, CH₄', 'Chemical formulas'],
    ['Diacritics', 'café, naïve, résumé, piñata', 'Accented characters'],
    ['Cyrillic Mix', 'Москва Moscow Москва', 'Mixed scripts'],
    ['Chinese/English', '北京 Beijing 上海 Shanghai', 'Mixed languages'],
    ['RTL Test', 'Hello مرحبا World', 'Right-to-left mix'],
    ['Line Breaks', 'Line 1\nLine 2\nLine 3', 'Multi-line content'],
    ['Tabs & Spaces', 'Tab\there\tand   spaces', 'Whitespace characters'],
    ['HTML-like', '<tag>content</tag> & entities', 'Markup-like content'],
    ['URLs', 'https://example.com/path?param=value', 'Web addresses'],
    ['Emails', 'test.email+tag@domain.co.uk', 'Email addresses'],
    ['File Paths', 'C:\\Windows\\System32\\file.txt', 'System paths'],
    ['Very Long', 'This is an extremely long text that should definitely exceed normal column width limits and test the text wrapping functionality thoroughly to ensure proper PDF generation with multiple lines per cell', 'Text wrapping test']
  ];

  const ws4 = XLSX.utils.aoa_to_sheet(specialData);
  XLSX.utils.book_append_sheet(wb, ws4, 'Special Characters');

  // Sheet 5: Empty and Sparse Data
  const sparseData = [
    ['Col A', '', 'Col C', '', 'Col E'],
    ['Data 1', '', '', 'Data 4', ''],
    ['', 'Data 2', '', '', 'Data 5'],
    ['Data 3', '', 'Data 6', '', ''],
    ['', '', '', '', ''],
    ['Final', '', 'Row', '', 'Data']
  ];

  const ws5 = XLSX.utils.aoa_to_sheet(sparseData);
  XLSX.utils.book_append_sheet(wb, ws5, 'Sparse Data');

  // Sheet 6: Numbers and Calculations
  const numbersData = [
    ['Description', 'Value', 'Formula', 'Result'],
    ['Small Integer', 5, '=B2*2', 10],
    ['Large Integer', 1234567890, '=B3/1000', 1234567.89],
    ['Small Decimal', 0.001, '=B4*1000', 1],
    ['Large Decimal', 999999.999, '=B5+0.001', 1000000],
    ['Scientific', 1.23e-10, '=B6*1e12', 123],
    ['Negative', -456.789, '=ABS(B7)', 456.789],
    ['Zero', 0, '=B8+1', 1],
    ['Percentage', 0.25, '=B9*100', 25],
    ['Currency USD', 1299.99, '=B10*1.2', 1559.988],
    ['Currency EUR', 999.50, '=B11*0.85', 849.575]
  ];

  const ws6 = XLSX.utils.aoa_to_sheet(numbersData);
  XLSX.utils.book_append_sheet(wb, ws6, 'Numbers Test');

  return wb;
}

// Generate the test file
const testWorkbook = createTestExcelFile();

// Convert to binary for download
const wbout = XLSX.write(testWorkbook, { bookType: 'xlsx', type: 'array' });

// Create download link
function downloadTestFile() {
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'excel-to-pdf-test.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export for use
export { createTestExcelFile, downloadTestFile };

// Console output for verification
console.log('Test Excel file created with the following sheets:');
console.log('1. Multilingual Test - Various languages and scripts');
console.log('2. Data Types - Different data formats');
console.log('3. Wide Table Test - Layout with many columns');
console.log('4. Special Characters - Edge cases and symbols');
console.log('5. Sparse Data - Empty cells and gaps');
console.log('6. Numbers Test - Numerical data and formulas');
