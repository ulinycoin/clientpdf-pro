/**
 * Тестирование исправлений для смешанного кириллическо-латинского текста
 */

import { TextScriptDetector } from './textScriptDetector';
import { WatermarkFontManager } from '../services/watermarkFontManager';

export class MixedScriptTest {
  
  static runTests() {
    console.log('🧪 Testing Mixed Script Detection and Font Selection...\n');
    
    const testCases = [
      {
        name: 'Pure Cyrillic',
        text: 'Это чисто русский текст без латинских символов.',
        expectedScript: 'cyrillic',
        expectedFont: 'Embedded-Cyrillic'
      },
      {
        name: 'Pure Latin',
        text: 'This is pure English text without Cyrillic characters.',
        expectedScript: 'latin',
        expectedFont: 'Helvetica'
      },
      {
        name: 'Mixed Content (Company Names)',
        text: 'Компания Microsoft разрабатывает Windows и Office для пользователей.',
        expectedScript: 'mixed',
        expectedFont: 'DejaVu-Sans'
      },
      {
        name: 'Mixed Content (Technical Text)',
        text: 'Для запуска приложения выполните команду npm install и затем npm start.',
        expectedScript: 'mixed',
        expectedFont: 'DejaVu-Sans'
      },
      {
        name: 'Mixed Content (URLs)',
        text: 'Посетите сайт https://example.com для получения дополнительной информации.',
        expectedScript: 'mixed',
        expectedFont: 'DejaVu-Sans'
      },
      {
        name: 'Cyrillic with minimal Latin',
        text: 'Это текст с небольшим количеством latin символов: 1-2 слова.',
        expectedScript: 'cyrillic',
        expectedFont: 'DejaVu-Sans'
      },
      {
        name: 'Latin with minimal Cyrillic',
        text: 'This is English text with minimal Cyrillic: один word.',
        expectedScript: 'mixed',
        expectedFont: 'DejaVu-Sans'
      }
    ];

    const fontManager = WatermarkFontManager.getInstance();
    
    testCases.forEach((testCase, index) => {
      console.log(`Test ${index + 1}: ${testCase.name}`);
      console.log(`Text: "${testCase.text}"`);
      
      // Test script detection
      const analysis = TextScriptDetector.analyzeText(testCase.text);
      console.log(`Script detected: ${analysis.script} (confidence: ${(analysis.confidence * 100).toFixed(1)}%)`);
      console.log(`Stats:`, analysis.stats);
      
      // Test font selection
      const selectedFont = fontManager.getBestFont(testCase.text);
      console.log(`Font selected: ${selectedFont}`);
      
      // Test OCR config
      const { config } = TextScriptDetector.getTesseractConfig(testCase.text);
      console.log(`OCR Config:`, {
        language: config.language,
        hasWhitelist: !!config.tessedit_char_whitelist,
        whitelistPreview: config.tesseract_char_whitelist ? 
          config.tesseract_char_whitelist.substring(0, 30) + '...' : 'none'
      });
      
      // Check results
      const scriptMatch = analysis.script === testCase.expectedScript;
      const fontMatch = selectedFont === testCase.expectedFont;
      
      console.log(`✅ Script detection: ${scriptMatch ? 'PASS' : 'FAIL'} (expected: ${testCase.expectedScript})`);
      console.log(`✅ Font selection: ${fontMatch ? 'PASS' : 'FAIL'} (expected: ${testCase.expectedFont})`);
      console.log('---\n');
    });
    
    console.log('🧪 Mixed Script Test completed!');
  }

  // Test specific scenarios that were problematic before
  static testProblematicCases() {
    console.log('🔥 Testing Previously Problematic Cases...\n');
    
    const problematicCases = [
      'Document содержит Microsoft Office файлы',
      'Система Windows поддерживает русский язык',
      'API endpoint: https://api.example.com/users',
      'GitHub репозиторий: https://github.com/user/repo',
      'Email: user@domain.com для связи'
    ];
    
    const fontManager = WatermarkFontManager.getInstance();
    
    problematicCases.forEach((text, index) => {
      console.log(`Problematic Case ${index + 1}:`);
      console.log(`Text: "${text}"`);
      
      const analysis = TextScriptDetector.analyzeText(text);
      const font = fontManager.getBestFont(text);
      const { config } = TextScriptDetector.getTesseractConfig(text);
      
      console.log(`Analysis: ${analysis.script} script, ${font} font`);
      console.log(`OCR will ${config.tessedit_char_whitelist ? 'use whitelist' : 'allow all characters'}`);
      
      // This should NOT use whitelist for mixed content
      if (analysis.script === 'mixed' && config.tessedit_char_whitelist) {
        console.log('❌ ERROR: Mixed content should not use character whitelist!');
      } else {
        console.log('✅ Correct OCR configuration');
      }
      console.log('---\n');
    });
  }

  // Test character whitelists
  static testWhitelists() {
    console.log('🔤 Testing Character Whitelists...\n');
    
    const testText = 'Microsoft Windows поддерживает русский язык';
    console.log(`Test text: "${testText}"`);
    
    const { config, analysis } = TextScriptDetector.getTesseractConfig(testText);
    
    console.log('Analysis result:', analysis);
    console.log('OCR config:', {
      language: config.language,
      hasWhitelist: !!config.tessedit_char_whitelist
    });
    
    if (config.tessedit_char_whitelist) {
      console.log('Character whitelist:', config.tessedit_char_whitelist);
      
      // Check if the whitelist contains both scripts
      const hasLatin = /[A-Za-z]/.test(config.tessedit_char_whitelist);
      const hasCyrillic = /[\u0400-\u04FF]/.test(config.tessedit_char_whitelist);
      
      console.log(`Whitelist contains Latin: ${hasLatin}`);
      console.log(`Whitelist contains Cyrillic: ${hasCyrillic}`);
      
      if (analysis.script === 'mixed' && (!hasLatin || !hasCyrillic)) {
        console.log('❌ ERROR: Mixed content whitelist missing required characters!');
      } else {
        console.log('✅ Whitelist correctly configured');
      }
    } else {
      console.log('✅ No whitelist restriction (allows all characters)');
    }
  }
}

// Export for use in testing
export default MixedScriptTest;