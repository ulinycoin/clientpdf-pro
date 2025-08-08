#!/usr/bin/env node

/**
 * Translation validation script
 * Checks for missing translation keys across all language files
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const TYPES_FILE = path.join(__dirname, '../src/types/i18n.ts');

// Extract all translation keys from a nested object
function extractKeys(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

// Load and parse a TypeScript translation file
function loadTranslationFile(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf-8');

    // Basic extraction of the export object
    // This is a simplified parser - for full TypeScript parsing we'd need a proper AST parser
    const exportMatch = content.match(/export const \w+: Translations = ({[\s\S]*});/);
    if (!exportMatch) {
      throw new Error(`Could not find translation export in ${filepath}`);
    }

    // Use eval to parse the object (unsafe but works for our controlled case)
    // In production, use a proper TypeScript parser
    const objString = exportMatch[1];

    // Remove TypeScript-style comments
    const cleanObjString = objString.replace(/\/\/.*$/gm, '');

    // This is a hack - we'd need proper parsing for production
    const obj = eval('(' + cleanObjString + ')');

    return obj;
  } catch (error) {
    console.error(`Error loading ${filepath}:`, error.message);
    return null;
  }
}

// Get all language files
function getLanguageFiles() {
  const files = fs.readdirSync(LOCALES_DIR)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts' && file !== 'README.md')
    .map(file => ({
      lang: file.replace('.ts', ''),
      path: path.join(LOCALES_DIR, file)
    }));

  return files;
}

// Validate translations
function validateTranslations() {
  console.log('🔍 Validating translations...\n');

  const languageFiles = getLanguageFiles();
  const allLanguageKeys = {};
  const errors = [];

  // Load all translation files
  for (const { lang, path: filepath } of languageFiles) {
    console.log(`📖 Loading ${lang} translations...`);
    const translations = loadTranslationFile(filepath);

    if (translations) {
      allLanguageKeys[lang] = extractKeys(translations);
      console.log(`✅ Found ${allLanguageKeys[lang].length} keys in ${lang}`);
    } else {
      errors.push(`❌ Failed to load ${lang} translations`);
    }
  }

  if (errors.length > 0) {
    console.log('\n🚨 Loading errors:');
    errors.forEach(error => console.log(error));
    return;
  }

  // Find the reference language (usually 'en')
  const referenceLang = 'en';
  if (!allLanguageKeys[referenceLang]) {
    console.error(`❌ Reference language '${referenceLang}' not found`);
    return;
  }

  const referenceKeys = new Set(allLanguageKeys[referenceLang]);
  console.log(`\n📋 Using ${referenceLang} as reference (${referenceKeys.size} keys)`);

  // Check each language against the reference
  let hasIssues = false;

  for (const [lang, keys] of Object.entries(allLanguageKeys)) {
    if (lang === referenceLang) continue;

    const langKeys = new Set(keys);
    const missingKeys = [...referenceKeys].filter(key => !langKeys.has(key));
    const extraKeys = [...langKeys].filter(key => !referenceKeys.has(key));

    if (missingKeys.length > 0 || extraKeys.length > 0) {
      hasIssues = true;
      console.log(`\n⚠️  Issues in ${lang}:`);

      if (missingKeys.length > 0) {
        console.log(`  Missing ${missingKeys.length} keys:`);
        missingKeys.forEach(key => console.log(`    - ${key}`));
      }

      if (extraKeys.length > 0) {
        console.log(`  Extra ${extraKeys.length} keys:`);
        extraKeys.forEach(key => console.log(`    + ${key}`));
      }
    } else {
      console.log(`✅ ${lang}: All keys match reference`);
    }
  }

  if (!hasIssues) {
    console.log('\n🎉 All translations are in sync!');
  } else {
    console.log('\n🔧 Please fix the translation issues above.');
  }

  return !hasIssues;
}

// Run validation
if (require.main === module) {
  const isValid = validateTranslations();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateTranslations };
