const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const localesDir = path.join(__dirname, '../src/locales');

// Regex to find t('key') or t("key")
// Capturing group 1 is the key
const tRegex = /[^a-zA-Z0-9]t\(['"]([^'"]+)['"]\)/g;

// Helper to get all file paths recursively
function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getFiles(filePath, fileList);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

// Helper to check if key exists in object
function keyExists(obj, keyPath) {
    const keys = keyPath.split('.');
    let current = obj;
    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return false;
        }
    }
    return true;
}

// Helper to collect all keys from code
function extractKeysFromCode() {
    const files = getFiles(srcDir);
    const keys = new Set();

    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        let match;
        while ((match = tRegex.exec(content)) !== null) {
            keys.add(match[1]);
        }
    });
    return Array.from(keys);
}

// Main execution
try {
    const codeKeys = extractKeysFromCode();
    console.log(`Found ${codeKeys.length} unique translation keys in code.`);

    // Load en.json as base
    const enPath = path.join(localesDir, 'en.json');
    const enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));

    const missingInEn = [];

    codeKeys.forEach(key => {
        // Skip dynamic keys or ones with variable interpolation attempts that regex might catch oddly
        // simpler check: if it contains ${} it's dynamic, but our regex [^'"]+ avoids that usually for simple strings
        // unless backticks are used. We are not matching backticks in regex above.

        if (!keyExists(enJson, key)) {
            missingInEn.push(key);
        }
    });

    if (missingInEn.length > 0) {
        console.log('\nKeys missing in en.json:');
        missingInEn.sort().forEach(k => console.log(`  - ${k}`));
    } else {
        console.log('\nAll keys found in code exist in en.json.');
    }

    // Also check other locales for these keys
    const localeFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json');
    localeFiles.forEach(file => {
        const localePath = path.join(localesDir, file);
        const localeJson = JSON.parse(fs.readFileSync(localePath, 'utf8'));
        const missingInLocale = [];

        codeKeys.forEach(key => {
            if (!keyExists(localeJson, key)) {
                missingInLocale.push(key);
            }
        });

        if (missingInLocale.length > 0) {
            console.log(`\nKeys missing in ${file}:`);
            // Limit output if too many
            if (missingInLocale.length > 10) {
                console.log(`  (Total ${missingInLocale.length} missing, showing first 10)`);
                missingInLocale.sort().slice(0, 10).forEach(k => console.log(`  - ${k}`));
            } else {
                missingInLocale.sort().forEach(k => console.log(`  - ${k}`));
            }
        }
    });

} catch (e) {
    console.error('Error:', e);
}
