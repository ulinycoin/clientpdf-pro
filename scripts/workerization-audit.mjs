import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const STRICT = process.argv.includes('--strict');
const JSON_OUTPUT = process.argv.includes('--json');

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts']);
const UI_CORE_ALLOWLIST = [/core\/public(?:\/[a-z0-9._-]+)?$/i];
const SOURCE_EXTENSIONS_LIST = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function normalizeSlashes(value) {
  return value.split(path.sep).join('/');
}

function toRelative(filePath) {
  return normalizeSlashes(path.relative(ROOT, filePath));
}

function getLineNumber(content, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (content[i] === '\n') {
      line += 1;
    }
  }
  return line;
}

function classifyZone(filePath) {
  if (/\.test\.[a-z]+$/i.test(filePath)) {
    return 'test-only';
  }
  if (filePath.startsWith('src/app/')) {
    return 'main-thread-forbidden';
  }
  if (filePath.startsWith('src/v6/')) {
    return 'main-thread-forbidden';
  }
  if (/^src\/plugins\/[^/]+\/ui\//.test(filePath)) {
    return 'main-thread-forbidden';
  }
  if (/^src\/plugins\/[^/]+\/logic\//.test(filePath)) {
    return 'worker-only';
  }
  if (filePath.startsWith('src/services/')) {
    return 'service-internal';
  }
  return 'other';
}

function isUiZone(filePath) {
  if (/\.test\.[a-z]+$/i.test(filePath)) {
    return false;
  }
  if (filePath.startsWith('src/app/react/')) {
    return true;
  }
  if (filePath.startsWith('src/v6/')) {
    return true;
  }
  return /^src\/plugins\/[^/]+\/ui\//.test(filePath);
}

function extractServiceModule(specifier) {
  const marker = 'src/services/';
  if (!specifier.includes(marker)) {
    return specifier;
  }
  return specifier.slice(specifier.indexOf(marker) + marker.length);
}

function resolveImportTarget(filePath, specifier) {
  if (!specifier.startsWith('.')) {
    return null;
  }
  const basePath = path.resolve(path.dirname(filePath), specifier);
  const candidates = [basePath];
  for (const extension of SOURCE_EXTENSIONS_LIST) {
    candidates.push(`${basePath}${extension}`);
  }
  for (const extension of SOURCE_EXTENSIONS_LIST) {
    candidates.push(path.join(basePath, `index${extension}`));
  }
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return basePath;
}

function resolveServiceImport(filePath, specifier) {
  if (specifier.startsWith('.')) {
    const resolved = resolveImportTarget(filePath, specifier);
    if (!resolved) {
      return null;
    }
    const relative = toRelative(resolved);
    if (!relative.startsWith('src/services/')) {
      return null;
    }
    return relative;
  }
  if (specifier.startsWith('src/services/')) {
    return specifier;
  }
  return null;
}

function collectImports(content) {
  const imports = [];
  const regex = /(?:import\s+(?:type\s+)?(?:[\s\S]*?\sfrom\s*)?['\"]([^'\"]+)['\"]|import\(\s*['\"]([^'\"]+)['\"]\s*\))/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    const specifier = match[1] ?? match[2];
    if (!specifier) {
      continue;
    }
    imports.push({
      specifier,
      index: match.index,
    });
  }

  return imports;
}

function isCoreImport(specifier) {
  return specifier.includes('core/');
}

function isAllowedUiCoreImport(specifier) {
  return UI_CORE_ALLOWLIST.some((pattern) => pattern.test(specifier));
}

async function main() {
  const files = await walk(SRC_DIR);
  const findings = [];
  const uiCoreBoundaryViolations = [];
  const coreServiceBoundaryViolations = [];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    const imports = collectImports(content);
    if (imports.length === 0) {
      continue;
    }

    const relative = toRelative(file);
    for (const item of imports) {
      const line = getLineNumber(content, item.index);
      const resolvedServiceImport = resolveServiceImport(file, item.specifier);
      if (resolvedServiceImport) {
        findings.push({
          file: relative,
          line,
          specifier: item.specifier,
          serviceModule: extractServiceModule(resolvedServiceImport),
          zone: classifyZone(relative),
        });
        if (
          relative.startsWith('src/core/')
          && !relative.startsWith('src/core/workers/')
          && !/\.test\.[a-z]+$/i.test(relative)
        ) {
          coreServiceBoundaryViolations.push({
            file: relative,
            line,
            specifier: item.specifier,
          });
        }
      }
      if (isUiZone(relative) && isCoreImport(item.specifier) && !isAllowedUiCoreImport(item.specifier)) {
        uiCoreBoundaryViolations.push({
          file: relative,
          line,
          specifier: item.specifier,
        });
      }
    }
  }

  findings.sort((a, b) => `${a.file}:${a.line}`.localeCompare(`${b.file}:${b.line}`));
  uiCoreBoundaryViolations.sort((a, b) => `${a.file}:${a.line}`.localeCompare(`${b.file}:${b.line}`));
  coreServiceBoundaryViolations.sort((a, b) => `${a.file}:${a.line}`.localeCompare(`${b.file}:${b.line}`));

  const summary = {
    total: findings.length,
    forbidden: findings.filter((item) => item.zone === 'main-thread-forbidden').length,
    workerOnly: findings.filter((item) => item.zone === 'worker-only').length,
    testOnly: findings.filter((item) => item.zone === 'test-only').length,
    serviceInternal: findings.filter((item) => item.zone === 'service-internal').length,
    other: findings.filter((item) => item.zone === 'other').length,
    uiCoreBoundaryViolations: uiCoreBoundaryViolations.length,
    coreServiceBoundaryViolations: coreServiceBoundaryViolations.length,
  };

  if (JSON_OUTPUT) {
    console.log(JSON.stringify({ summary, findings, uiCoreBoundaryViolations, coreServiceBoundaryViolations }, null, 2));
  } else {
    console.log('Workerization audit for imports that reference services/*');
    console.log(`Total: ${summary.total}`);
    console.log(`- main-thread-forbidden: ${summary.forbidden}`);
    console.log(`- worker-only: ${summary.workerOnly}`);
    console.log(`- test-only: ${summary.testOnly}`);
    console.log(`- service-internal: ${summary.serviceInternal}`);
    console.log(`- other: ${summary.other}`);
    console.log(`- ui-core-boundary-violations: ${summary.uiCoreBoundaryViolations}`);
    console.log(`- core-service-boundary-violations: ${summary.coreServiceBoundaryViolations}`);

    if (findings.length > 0) {
      console.log('');
      for (const finding of findings) {
        console.log(`[${finding.zone}] ${finding.file}:${finding.line} -> ${finding.specifier}`);
      }
    }

    if (uiCoreBoundaryViolations.length > 0) {
      console.log('');
      console.log('UI->core boundary violations (non-allowlisted):');
      for (const finding of uiCoreBoundaryViolations) {
        console.log(`[ui-core] ${finding.file}:${finding.line} -> ${finding.specifier}`);
      }
    }

    if (coreServiceBoundaryViolations.length > 0) {
      console.log('');
      console.log('Core->services boundary violations (allowed only in src/core/workers/**):');
      for (const finding of coreServiceBoundaryViolations) {
        console.log(`[core-services] ${finding.file}:${finding.line} -> ${finding.specifier}`);
      }
    }
  }

  if (STRICT && (summary.forbidden > 0 || summary.uiCoreBoundaryViolations > 0 || summary.coreServiceBoundaryViolations > 0)) {
    console.error('');
    console.error('Strict mode failed: forbidden imports are present.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
