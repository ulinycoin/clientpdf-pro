import { WatermarkFontManager } from '../services/watermarkFontManager';

/**
 * Test utility to validate font selection logic for mixed Cyrillic/Latin text
 */
export class FontValidationTest {
  private fontManager: WatermarkFontManager;

  constructor() {
    this.fontManager = WatermarkFontManager.getInstance();
  }

  /**
   * Test mixed content detection with various text samples
   */
  testMixedContentDetection(): void {
    console.log('🧪 Testing mixed content detection logic...');

    const testCases = [
      // Pure Cyrillic
      { text: 'Это русский текст', expected: 'Embedded-Cyrillic', scenario: 'Pure Cyrillic' },
      { text: 'Москва, документ №12345', expected: 'Embedded-Cyrillic', scenario: 'Cyrillic with numbers' },
      
      // Pure Latin
      { text: 'This is English text', expected: 'Helvetica', scenario: 'Pure English' },
      { text: 'Document #12345 PDF', expected: 'Helvetica', scenario: 'English with numbers' },
      
      // Mixed content - these should use DejaVu-Sans
      { text: 'Москва Moscow', expected: 'DejaVu-Sans', scenario: 'Russian + English cities' },
      { text: 'PDF документ', expected: 'DejaVu-Sans', scenario: 'English + Russian words' },
      { text: 'User ID: пользователь', expected: 'DejaVu-Sans', scenario: 'English label + Russian value' },
      { text: 'Email: ivan@mail.ru Имя: Иван', expected: 'DejaVu-Sans', scenario: 'Mixed form data' },
      { text: 'Contract/Договор №123', expected: 'DejaVu-Sans', scenario: 'Bilingual contract' },
      { text: 'iPhone настройки', expected: 'DejaVu-Sans', scenario: 'Brand + Russian word' },
      
      // Edge cases
      { text: '', expected: 'Helvetica', scenario: 'Empty text' },
      { text: '123456789', expected: 'Helvetica', scenario: 'Numbers only' },
      { text: '!@#$%^&*()', expected: 'Helvetica', scenario: 'Special characters only' },
      { text: 'А', expected: 'Embedded-Cyrillic', scenario: 'Single Cyrillic letter' },
      { text: 'A', expected: 'Helvetica', scenario: 'Single Latin letter' },
      { text: 'Aа', expected: 'DejaVu-Sans', scenario: 'One Latin + one Cyrillic' },
      
      // Real-world scenarios
      { text: 'ООО "Company Name Ltd"', expected: 'DejaVu-Sans', scenario: 'Russian entity with English name' },
      { text: 'www.сайт.ru', expected: 'DejaVu-Sans', scenario: 'Mixed domain name' },
      { text: 'WhatsApp сообщение', expected: 'DejaVu-Sans', scenario: 'App name + Russian word' }
    ];

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
      const result = this.fontManager.getBestFont(testCase.text);
      const success = result === testCase.expected;
      
      if (success) {
        passed++;
        console.log(`✅ PASS: "${testCase.scenario}" → ${result}`);
      } else {
        failed++;
        console.log(`❌ FAIL: "${testCase.scenario}" → Expected: ${testCase.expected}, Got: ${result}`);
        console.log(`   Text: "${testCase.text}"`);
        
        // Additional debug info
        const hasCyrillic = this.fontManager.containsCyrillic(testCase.text);
        const hasLatin = /[A-Za-z]/.test(testCase.text);
        const isPredominantlyCyrillic = this.fontManager.isPredominantlyCyrillic(testCase.text);
        console.log(`   Debug: Cyrillic=${hasCyrillic}, Latin=${hasLatin}, Predominantly Cyrillic=${isPredominantlyCyrillic}`);
      }
    }

    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed (${((passed / (passed + failed)) * 100).toFixed(1)}% success rate)`);
    
    if (failed > 0) {
      console.log('\n⚠️ Font selection logic needs improvement for failed cases');
    } else {
      console.log('\n🎉 All font selection tests passed!');
    }
  }

  /**
   * Test font support validation
   */
  testFontSupport(): void {
    console.log('\n🧪 Testing font support validation...');

    const supportTests = [
      { font: 'Helvetica', text: 'English text', shouldSupport: true },
      { font: 'Helvetica', text: 'Русский текст', shouldSupport: false },
      { font: 'DejaVu-Sans', text: 'English text', shouldSupport: true },
      { font: 'DejaVu-Sans', text: 'Русский текст', shouldSupport: true },
      { font: 'DejaVu-Sans', text: 'Mixed Смешанный', shouldSupport: true },
      { font: 'Embedded-Cyrillic', text: 'Русский текст', shouldSupport: true },
      { font: 'Embedded-Cyrillic', text: 'English text', shouldSupport: true }, // Should be true as it's Unicode
    ];

    let passed = 0;
    let failed = 0;

    for (const test of supportTests) {
      const result = this.fontManager.fontSupportsText(test.font, test.text);
      const success = result === test.shouldSupport;
      
      if (success) {
        passed++;
        console.log(`✅ PASS: ${test.font} supports "${test.text}" → ${result}`);
      } else {
        failed++;
        console.log(`❌ FAIL: ${test.font} supports "${test.text}" → Expected: ${test.shouldSupport}, Got: ${result}`);
      }
    }

    console.log(`\n📊 Font Support Tests: ${passed} passed, ${failed} failed`);
  }

  /**
   * Test text analysis functions
   */
  testTextAnalysis(): void {
    console.log('\n🧪 Testing text analysis functions...');

    const analysisTests = [
      // containsCyrillic tests
      { text: 'English only', func: 'containsCyrillic', expected: false },
      { text: 'Русский', func: 'containsCyrillic', expected: true },
      { text: 'Mixed Русский', func: 'containsCyrillic', expected: true },
      { text: '123456', func: 'containsCyrillic', expected: false },
      
      // isPredominantlyCyrillic tests  
      { text: 'Русский текст документ', func: 'isPredominantlyCyrillic', expected: true },
      { text: 'English text document', func: 'isPredominantlyCyrillic', expected: false },
      { text: 'PDF документ', func: 'isPredominantlyCyrillic', expected: false }, // 50/50 split
      { text: 'English Русский текст', func: 'isPredominantlyCyrillic', expected: false }, // 33% Cyrillic
      { text: 'A Русский текст документ', func: 'isPredominantlyCyrillic', expected: true }, // 80% Cyrillic
    ];

    let passed = 0;
    let failed = 0;

    for (const test of analysisTests) {
      let result: boolean;
      if (test.func === 'containsCyrillic') {
        result = this.fontManager.containsCyrillic(test.text);
      } else {
        result = this.fontManager.isPredominantlyCyrillic(test.text);
      }
      
      const success = result === test.expected;
      
      if (success) {
        passed++;
        console.log(`✅ PASS: ${test.func}("${test.text}") → ${result}`);
      } else {
        failed++;
        console.log(`❌ FAIL: ${test.func}("${test.text}") → Expected: ${test.expected}, Got: ${result}`);
      }
    }

    console.log(`\n📊 Text Analysis Tests: ${passed} passed, ${failed} failed`);
  }

  /**
   * Run comprehensive font validation tests
   */
  runAllTests(): void {
    console.log('🚀 Starting comprehensive font validation tests...\n');
    
    this.testMixedContentDetection();
    this.testFontSupport();
    this.testTextAnalysis();
    
    console.log('\n✨ Font validation testing completed!');
  }

  /**
   * Test specific problematic text samples that might cause issues
   */
  testProblematicSamples(): void {
    console.log('\n🧪 Testing potentially problematic text samples...');

    const problematicSamples = [
      // URL-like texts
      'https://www.сайт.ru/path',
      'email@почта.com',
      
      // Technical texts with mixed content
      'git commit -m "Добавлен новый feature"',
      'const имя = "value";',
      'SELECT * FROM пользователи WHERE name = "Ivan"',
      
      // Business documents
      'Invoice #12345 Счет-фактура',
      'ООО "TechCorp Solutions"',
      'Contract № 456 между Company Ltd и ООО "Рога и копыта"',
      
      // OCR common errors (should still work)
      'Docuтent with OCR еrrors',
      'Мixed wιth unicode еrrors',
    ];

    for (const sample of problematicSamples) {
      const font = this.fontManager.getBestFont(sample);
      const supportsCyrillic = this.fontManager.containsCyrillic(sample);
      const hasLatin = /[A-Za-z]/.test(sample);
      
      console.log(`📝 "${sample.substring(0, 40)}${sample.length > 40 ? '...' : ''}"`);
      console.log(`   → Font: ${font}, Cyrillic: ${supportsCyrillic}, Latin: ${hasLatin}`);
      
      // Warn about potential issues
      if (supportsCyrillic && hasLatin && font !== 'DejaVu-Sans') {
        console.log(`   ⚠️  WARNING: Mixed content should use DejaVu-Sans, but got ${font}`);
      }
    }
  }
}

// Export a function to run tests from console or other modules
export function validateFontSystem(): void {
  const tester = new FontValidationTest();
  tester.runAllTests();
  tester.testProblematicSamples();
}

// For direct execution in browser console
if (typeof window !== 'undefined') {
  (window as any).validateFontSystem = validateFontSystem;
}