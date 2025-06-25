  /**
   * Умная очистка и транслитерация текста
   */
  public static smartCleanText(text: string): string {
    if (!text) return '';

    let cleaned = String(text);
    let replacementCount = 0;

    // Применяем все замены из карты
    for (const [unicode, replacement] of this.UNICODE_REPLACEMENTS) {
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

    // Если остались непечатаемые символы, заменяем на пустую строку (вместо ?)
    cleaned = cleaned.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '');

    // Финальная очистка - убираем лишние пробелы после всех замен
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }