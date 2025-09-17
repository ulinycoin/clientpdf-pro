/**
 * Post-processing utilities for OCR text improvement
 */

/**
 * Fix common OCR spacing issues for Cyrillic text
 */
export function fixCyrillicSpacing(text: string): string {
  if (!text) return text;

  let improved = text;

  // 1. Добавляем пробелы между словами, если они склеены
  // Паттерн: строчная + заглавная = граница слова
  improved = improved.replace(/([а-яё])([А-ЯЁ])/g, '$1 $2');

  // 2. Добавляем пробелы между числами и буквами
  improved = improved.replace(/(\d)([а-яёА-ЯЁ])/g, '$1 $2');
  improved = improved.replace(/([а-яёА-ЯЁ])(\d)/g, '$1 $2');

  // 3. Исправляем пробелы вокруг знаков препинания
  // Убираем пробелы ПЕРЕД знаками препинания
  improved = improved.replace(/\s+([.!?,:;])/g, '$1');
  // Добавляем пробелы ПОСЛЕ знаков препинания (если их нет)
  improved = improved.replace(/([.!?,:;])([а-яёА-ЯЁ\d])/g, '$1 $2');

  // 4. Исправляем пробелы вокруг скобок и кавычек
  improved = improved.replace(/\s*([()[\]{}«»"'])\s*/g, ' $1 ');
  // Убираем лишние пробелы в начале/конце скобок
  improved = improved.replace(/([([{«"])\s+/g, '$1');
  improved = improved.replace(/\s+([)\]}»"])/g, '$1');

  // 5. Исправляем дефисы и тире
  improved = improved.replace(/\s*[-–—]\s*/g, ' — ');

  // 6. Убираем множественные пробелы
  improved = improved.replace(/\s{2,}/g, ' ');

  // 7. Убираем пробелы в начале и конце строк, но сохраняем структуру параграфов
  improved = improved.split('\n').map(line => line.trim()).join('\n');

  // 8. Убираем лишние переносы строк
  improved = improved.replace(/\n{3,}/g, '\n\n');

  return improved;
}

/**
 * Improve Russian text by adding spaces where needed
 */
export function improveRussianText(text: string): string {
  if (!text) return text;

  return fixCyrillicSpacing(text);
}

/**
 * Fix common spacing issues for any Latin-based text
 */
export function fixLatinSpacing(text: string): string {
  if (!text) return text;

  let improved = text;

  // 1. Add spaces between lowercase and uppercase letters (word boundaries)
  improved = improved.replace(/([a-z])([A-Z])/g, '$1 $2');

  // 2. Add spaces between numbers and letters
  improved = improved.replace(/(\d)([a-zA-Z])/g, '$1 $2');
  improved = improved.replace(/([a-zA-Z])(\d)/g, '$1 $2');

  // 3. Fix spacing around punctuation
  improved = improved.replace(/\s+([.!?,:;])/g, '$1');
  improved = improved.replace(/([.!?,:;])([a-zA-Z\d])/g, '$1 $2');

  // 4. Fix spacing around brackets and quotes
  improved = improved.replace(/\s*([()[\]{}"])\s*/g, ' $1 ');
  improved = improved.replace(/([([{"])\s+/g, '$1');
  improved = improved.replace(/\s+([)\]}"'])/g, '$1');

  // 5. Clean up multiple spaces
  improved = improved.replace(/\s{2,}/g, ' ');

  // 6. Clean up line endings
  improved = improved.split('\n').map(line => line.trim()).join('\n');
  improved = improved.replace(/\n{3,}/g, '\n\n');

  return improved;
}

/**
 * Post-process OCR text based on language
 */
export function postProcessOCRText(text: string, language: string): string {
  if (!text) return text;

  switch (language) {
    case 'rus':
    case 'ukr':
      return improveRussianText(text);
    case 'eng':
    case 'deu':
    case 'fra':
    case 'spa':
    case 'ita':
    case 'por':
    case 'nld':
    case 'pol':
      return fixLatinSpacing(text);
    default:
      // For unknown languages, just clean up multiple spaces
      return text.replace(/\s+/g, ' ').trim();
  }
}
