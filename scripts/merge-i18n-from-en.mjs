/**
 * Deep-merge English into target locale: add any missing keys from en.json
 * so Arabic/Amharic files stay valid and i18n resolves without gaps.
 * Existing strings in the target are never overwritten.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = join(__dirname, '..', 'src', 'i18n', 'locales');

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function mergeMissing(target, source) {
  if (!isPlainObject(target)) return structuredClone(source);
  if (!isPlainObject(source)) return target;
  const out = { ...target };
  for (const [key, srcVal] of Object.entries(source)) {
    if (!(key in out)) {
      out[key] = isPlainObject(srcVal) ? mergeMissing({}, srcVal) : srcVal;
      continue;
    }
    const tgtVal = out[key];
    if (isPlainObject(tgtVal) && isPlainObject(srcVal)) {
      out[key] = mergeMissing(tgtVal, srcVal);
    }
  }
  return out;
}

const en = JSON.parse(readFileSync(join(localesDir, 'en.json'), 'utf8'));
for (const name of ['ar', 'am']) {
  const path = join(localesDir, `${name}.json`);
  const cur = JSON.parse(readFileSync(path, 'utf8'));
  const merged = mergeMissing(cur, en);
  writeFileSync(path, JSON.stringify(merged, null, 2) + '\n', 'utf8');
  console.log(`Updated ${name}.json`);
}
