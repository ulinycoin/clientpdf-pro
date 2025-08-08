#!/usr/bin/env node
/**
 * Скрипт для валидации переводов
 * Проверяет, что все ключи из типов i18n присутствуют во всех языковых файлах
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const localesPath = join(projectRoot, 'src', 'locales');
const typesPath = join(projectRoot, 'src', 'types', 'i18n.ts');

// Поддерживаемые языки
const LANGUAGES = ['en', 'ru', 'de', 'fr', 'es'];

// Функция для извлечения всех ключей из типов
function extractKeysFromInterface(content) {
  const keys = [];
  const lines = content.split('\n');
  let currentPath = [];
  let braceCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Пропускаем комментарии и пустые строки
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed === '') {
      continue;
    }

    // Ищем объявления интерфейсов и свойств
    const interfaceMatch = trimmed.match(/interface\s+(\w+)/);
    if (interfaceMatch) {
      continue;
    }

    // Обрабатываем открывающие скобки
    const openBraces = (trimmed.match(/{/g) || []).length;
    const closeBraces = (trimmed.match(/}/g) || []).length;

    // Ищем ключи свойств
    const keyMatch = trimmed.match(/^(\w+):\s*{/);
    if (keyMatch) {
      currentPath.push(keyMatch[1]);
      braceCount += openBraces - closeBraces;
    } else {
      const simpleKeyMatch = trimmed.match(/^(\w+):\s*string;?/);
      if (simpleKeyMatch) {
        const fullKey = [...currentPath, simpleKeyMatch[1]].join('.');
        keys.push(fullKey);
      }
    }

    // Обрабатываем закрывающие скобки
    braceCount += openBraces - closeBraces;
    if (braceCount < currentPath.length) {
      currentPath = currentPath.slice(0, braceCount);
    }
  }

  return keys;
}

// Функция для извлечения ключей из файла переводов
function extractKeysFromTranslation(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      keys.push(...extractKeysFromTranslation(value, fullKey));
    } else if (typeof value === 'string') {
      keys.push(fullKey);
    }
  }

  return keys;
}

// Основная функция валидации
async function validateTranslations() {
  console.log('🔍 Валидация переводов...\n');

  // Читаем типы
  let typesContent;
  try {
    typesContent = readFileSync(typesPath, 'utf8');
  } catch (error) {
    console.error(`❌ Ошибка чтения файла типов: ${error.message}`);
    process.exit(1);
  }

  // Извлекаем все ключи из типов
  console.log('📋 Извлечение ключей из типов...');
  const expectedKeys = extractKeysFromInterface(typesContent);
  console.log(`Найдено ${expectedKeys.length} ключей в типах\n`);

  // Проверяем каждый язык
  const results = {};

  for (const lang of LANGUAGES) {
    console.log(`🌐 Проверка языка: ${lang}`);

    try {
      // Динамический импорт модуля перевода
      const modulePath = `file://${join(localesPath, `${lang}.js`)}`;
      const module = await import(modulePath);
      const translations = module[lang];

      if (!translations) {
        console.error(`❌ Переводы для ${lang} не найдены`);
        continue;
      }

      // Извлекаем ключи из переводов
      const actualKeys = extractKeysFromTranslation(translations);

      // Находим отсутствующие ключи
      const missingKeys = expectedKeys.filter(key => !actualKeys.includes(key));
      const extraKeys = actualKeys.filter(key => !expectedKeys.includes(key));

      results[lang] = {
        totalExpected: expectedKeys.length,
        totalActual: actualKeys.length,
        missing: missingKeys,
        extra: extraKeys
      };

      console.log(`  ✅ Найдено: ${actualKeys.length} ключей`);
      console.log(`  ❌ Отсутствует: ${missingKeys.length} ключей`);
      console.log(`  ➕ Лишних: ${extraKeys.length} ключей\n`);

    } catch (error) {
      console.error(`❌ Ошибка загрузки переводов для ${lang}: ${error.message}\n`);
      results[lang] = { error: error.message };
    }
  }

  // Выводим детальный отчет
  console.log('\n📊 ДЕТАЛЬНЫЙ ОТЧЕТ\n');

  for (const [lang, result] of Object.entries(results)) {
    if (result.error) {
      console.log(`${lang}: ОШИБКА - ${result.error}`);
      continue;
    }

    console.log(`${lang}:`);
    console.log(`  Покрытие: ${result.totalActual}/${result.totalExpected} (${Math.round(result.totalActual/result.totalExpected*100)}%)`);

    if (result.missing.length > 0) {
      console.log(`  Отсутствующие ключи:`);
      result.missing.slice(0, 10).forEach(key => console.log(`    - ${key}`));
      if (result.missing.length > 10) {
        console.log(`    ... и еще ${result.missing.length - 10} ключей`);
      }
    }

    if (result.extra.length > 0) {
      console.log(`  Лишние ключи:`);
      result.extra.slice(0, 5).forEach(key => console.log(`    + ${key}`));
      if (result.extra.length > 5) {
        console.log(`    ... и еще ${result.extra.length - 5} ключей`);
      }
    }
    console.log('');
  }

  // Проверяем критические отсутствующие секции
  console.log('🚨 КРИТИЧЕСКИЕ ПРОБЛЕМЫ:\n');

  for (const [lang, result] of Object.entries(results)) {
    if (result.error) continue;

    const criticalMissing = result.missing.filter(key =>
      key.startsWith('components.') ||
      key.includes('relatedTools') ||
      key.includes('excelToPdf')
    );

    if (criticalMissing.length > 0) {
      console.log(`${lang}: ${criticalMissing.length} критических ключей отсутствует`);
      criticalMissing.forEach(key => console.log(`  ❌ ${key}`));
      console.log('');
    }
  }
}

// Запускаем валидацию
validateTranslations().catch(console.error);
