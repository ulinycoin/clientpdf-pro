  /**
   * Настройка PDF с оптимальным шрифтом - ОБНОВЛЕНО для поддержки кириллицы
   */
  public static async setupPDFFont(pdf: jsPDF, sampleTexts: string[]): Promise<FontSetupResult> {
    this.initialize();

    const result: FontSetupResult = {
      success: false,
      selectedFont: 'helvetica',
      warnings: [],
      appliedTransliterations: 0
    };

    try {
      // Анализируем весь текст
      const combinedText = sampleTexts.join(' ');
      const analysis = this.analyzeText(combinedText);

      console.log('🔍 Text analysis:', {
        languages: analysis.detectedLanguages,
        problemChars: analysis.problemChars.length,
        recommendedFont: analysis.recommendedFont,
        needsTransliteration: analysis.needsTransliteration,
        hasCyrillic: analysis.hasCyrillic
      });

      // 🆕 НОВОЕ: Проверяем нужна ли поддержка кириллицы
      const needsCyrillic = analysis.hasCyrillic && this.shouldPreserveCyrillic(combinedText);

      if (needsCyrillic) {
        console.log('🔤 Attempting to preserve Cyrillic characters...');
        
        // Попытка 1: Внешний шрифт с кириллицей
        try {
          const { ExternalFontLoader } = await import('./ExternalFontLoader');
          const fontResult = await ExternalFontLoader.setupPDFWithCyrillicFont(pdf, 'Roboto');
          
          if (fontResult.success) {
            result.success = true;
            result.selectedFont = fontResult.fontName;
            result.warnings.push('Using external Cyrillic font: ' + fontResult.fontName);
            console.log(`✅ External Cyrillic font loaded: ${fontResult.fontName}`);
            return result;
          }
        } catch (error) {
          console.warn('⚠️ External font loading failed:', error);
        }

        // Попытка 2: Встроенная поддержка кириллицы
        try {
          const { CyrillicFontService } = await import('./CyrillicFontService');
          const cyrillicResult = CyrillicFontService.setupCyrillicSupport(pdf);
          
          if (cyrillicResult.success) {
            result.success = true;
            result.selectedFont = cyrillicResult.selectedFont;
            result.warnings.push('Using built-in Cyrillic support');
            console.log(`✅ Built-in Cyrillic support enabled`);
            return result;
          }
        } catch (error) {
          console.warn('⚠️ Built-in Cyrillic support failed:', error);
        }

        // Если кириллица не поддерживается, предупреждаем пользователя
        result.warnings.push('Cyrillic characters will be transliterated due to font limitations');
      }

      // Стандартная логика выбора шрифта (как было раньше)
      const targetFont = analysis.recommendedFont;
      
      try {
        // Настройка Unicode поддержки для jsPDF
        this.enableUnicodeSupport(pdf);
        
        // Устанавливаем шрифт
        pdf.setFont(targetFont, 'normal');
        this.loadedFonts.add(targetFont);
        
        result.success = true;
        result.selectedFont = targetFont;
        
        console.log(`✅ Font set successfully: ${targetFont}`);

      } catch (fontError) {
        console.warn(`⚠️ Failed to set ${targetFont}, falling back...`);
        result.warnings.push(`Font ${targetFont} failed, using fallback`);
        
        // Fallback к helvetica
        pdf.setFont('helvetica', 'normal');
        result.selectedFont = 'helvetica';
        result.success = true;
      }

      // Добавляем предупреждения
      if (analysis.needsTransliteration && !needsCyrillic) {
        result.warnings.push(`${analysis.problemChars.length} characters will be transliterated`);
        result.appliedTransliterations = analysis.problemChars.length;
      }

      if (analysis.detectedLanguages.length > 1) {
        result.warnings.push(`Multiple languages detected: ${analysis.detectedLanguages.join(', ')}`);
      }

    } catch (error) {
      console.error('❌ Font setup failed:', error);
      result.warnings.push(`Setup failed: ${error}`);
      
      // Последний fallback
      try {
        pdf.setFont('helvetica', 'normal');
        result.selectedFont = 'helvetica';
        result.success = true;
      } catch {
        result.success = false;
        result.warnings.push('All fonts failed');
      }
    }

    return result;
  }

  /**
   * 🆕 НОВЫЙ МЕТОД: Определяет стоит ли сохранять кириллицу
   */
  private static shouldPreserveCyrillic(text: string): boolean {
    // Подсчитываем процент кириллических символов
    const cyrillicMatches = text.match(/[а-яё]/gi);
    const totalLetters = text.match(/[a-zA-Zа-яё]/gi);
    
    if (!cyrillicMatches || !totalLetters) {
      return false;
    }
    
    const cyrillicPercentage = cyrillicMatches.length / totalLetters.length;
    
    // Если больше 20% текста - кириллица, пытаемся сохранить
    return cyrillicPercentage > 0.2;
  }

  /**
   * 🆕 ОБНОВЛЕННЫЙ метод: Умная очистка с поддержкой кириллицы
   */
  public static smartCleanText(text: string, preserveCyrillic: boolean = false): string {
    if (!text) return '';

    let cleaned = String(text);
    let replacementCount = 0;

    // Если нужно сохранить кириллицу, пропускаем её транслитерацию
    const replacements = preserveCyrillic ? 
      this.getNonCyrillicReplacements() : 
      this.UNICODE_REPLACEMENTS;

    // Применяем замены
    for (const [unicode, replacement] of replacements) {
      if (cleaned.includes(unicode)) {
        cleaned = cleaned.replace(new RegExp(unicode, 'g'), replacement);
        replacementCount++;
      }
    }

    // Дополнительная очистка для лучшей читаемости
    cleaned = cleaned
      // Удаляем невидимые символы
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Убираем двойные вопросительные знаки
      .replace(/\?\?+/g, '?')
      // Убираем вопросительные знаки в начале/конце слов
      .replace(/\b\?+/g, '')
      .replace(/\?+\b/g, '')
      // Очищаем последовательности типа "?alpha?epsilon"
      .replace(/\?[a-z]+\?/g, '')
      // Нормализуем пробелы
      .replace(/\s+/g, ' ')
      .trim();

    // Если НЕ сохраняем кириллицу, заменяем её на пустую строку
    if (!preserveCyrillic) {
      cleaned = cleaned.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '');
    }

    // Финальная очистка
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  /**
   * 🆕 НОВЫЙ МЕТОД: Получает замены без кириллицы
   */
  private static getNonCyrillicReplacements(): Map<string, string> {
    const nonCyrillicReplacements = new Map<string, string>();
    
    for (const [key, value] of this.UNICODE_REPLACEMENTS) {
      // Пропускаем кириллические символы
      if (!/[а-яё]/i.test(key)) {
        nonCyrillicReplacements.set(key, value);
      }
    }
    
    return nonCyrillicReplacements;
  }