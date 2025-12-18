const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');

function findEmptyKeys(obj, prefix = '') {
    let emptyKeys = [];
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            emptyKeys = emptyKeys.concat(findEmptyKeys(obj[key], prefix + key + '.'));
        } else if (typeof obj[key] === 'string' && obj[key].trim() === '') {
            emptyKeys.push(prefix + key);
        }
    }
    return emptyKeys;
}

fs.readdir(localesDir, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    let hasEmptyKeys = false;

    files.forEach(file => {
        if (path.extname(file) === '.json') {
            const filePath = path.join(localesDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const json = JSON.parse(content);
                const emptyKeys = findEmptyKeys(json);

                if (emptyKeys.length > 0) {
                    hasEmptyKeys = true;
                    console.log(`\nEmpty keys in ${file}:`);
                    emptyKeys.forEach(key => console.log(`  - ${key}`));
                } else {
                    // console.log(`No empty keys in ${file}`);
                }
            } catch (e) {
                console.error(`Error parsing ${file}:`, e);
            }
        }
    });

    if (!hasEmptyKeys) {
        console.log('No empty translation keys found in any locale file.');
    }
});
