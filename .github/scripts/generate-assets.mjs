#!/usr/bin/env node

/**
 * Script to generate assets.ts file from public folder structure
 * Usage: node scripts/generate-assets.mjs
 */

import { readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..', '..');
const publicDir = join(rootDir, 'public');
const outputFile = join(rootDir, 'src/globals/types/assets.ts');

// Files to ignore
const IGNORE_FILES = new Set([
  '.DS_Store',
  'Thumbs.db',
  '.gitkeep',
  'desktop.ini',
]);

/**
 * Convert filename to camelCase property name
 * When includeExt is true, keeps the full filename with extension as-is (always quoted)
 */
function toCamelCase(str, includeExt = false) {
  // If we need to include extension (for duplicates), return the full filename quoted
  if (includeExt) {
    return `'${str}'`;
  }

  // Otherwise, convert to camelCase without extension
  const withoutExt = str.replace(/\.[^.]+$/, '');
  return withoutExt
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, char => char.toLowerCase());
}

/**
 * Recursively scan directory
 */
async function scanDirectory(dir, baseDir = dir) {
  const entries = await readdir(dir);
  const result = [];

  for (const entry of entries.sort()) {
    if (IGNORE_FILES.has(entry)) continue;

    const fullPath = join(dir, entry);
    const stats = await stat(fullPath);
    const relativePath = relative(baseDir, fullPath);

    if (stats.isDirectory()) {
      const children = await scanDirectory(fullPath, baseDir);
      if (children.length > 0) {
        result.push({
          name: entry,
          type: 'directory',
          path: relativePath,
          children,
        });
      }
    } else if (stats.isFile()) {
      result.push({
        name: entry,
        type: 'file',
        path: '/' + relativePath.split(sep).join('/'),
      });
    }
  }

  return result;
}

/**
 * Check for duplicate base names in the same directory
 */
function hasDuplicateBaseName(items, name) {
  const baseName = name.replace(/\.[^.]+$/, '');
  return (
    items.filter(
      item =>
        item.type === 'file' &&
        item.name.replace(/\.[^.]+$/, '') === baseName,
    ).length > 1
  );
}

/**
 * Generate TypeScript object structure
 */
function generateObject(items, indent = 2) {
  const indentStr = ' '.repeat(indent);
  let result = '';

  for (const item of items) {
    if (item.type === 'file') {
      const hasDuplicate = hasDuplicateBaseName(items, item.name);
      const propName = toCamelCase(item.name, hasDuplicate);
      result += `${indentStr}${propName}: '${item.path}',\n`;
    } else if (item.type === 'directory') {
      const propName = toCamelCase(item.name);
      result += `\n${indentStr}/** ${item.name} */\n`;
      result += `${indentStr}${propName}: {\n`;
      result += generateObject(item.children, indent + 2);
      result += `${indentStr}},\n`;
    }
  }

  return result;
}

/**
 * Count total number of assets
 */
function countAssets(items) {
  let count = 0;

  for (const item of items) {
    if (item.type === 'file') {
      count++;
    } else if (item.type === 'directory') {
      count += countAssets(item.children);
    }
  }

  return count;
}

/**
 * Generate TypeScript union type for all asset paths
 */
function generateAssetPathType(items, parentPath = 'ASSETS') {
  const paths = [];

  for (const item of items) {
    if (item.type === 'file') {
      const hasDuplicate = hasDuplicateBaseName(items, item.name);
      const propName = toCamelCase(item.name, hasDuplicate);

      // Use bracket notation for quoted properties
      if (propName.startsWith("'")) {
        paths.push(`(typeof ${parentPath})[${propName}]`);
      } else {
        paths.push(`typeof ${parentPath}.${propName}`);
      }
    } else if (item.type === 'directory') {
      const propName = toCamelCase(item.name);
      paths.push(
        ...generateAssetPathType(
          item.children,
          `${parentPath}.${propName}`,
        ),
      );
    }
  }

  return paths;
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Scanning public folder...');
  const structure = await scanDirectory(publicDir);

  console.log('📝 Generating TypeScript file...');

  const objectContent = generateObject(structure);
  const assetCount = countAssets(structure);
  const assetPaths = generateAssetPathType(structure);

  const fileContent = `/**
 * @file Auto-generated file containing all asset paths from the public folder
 * @see .github/prompts/codegen-assets.prompt.md for regeneration instructions
 * @generated ${new Date().toISOString()}
 */

/**
 * All asset paths available in the public folder
 * These paths are relative to the root URL of the application
 */
export const ASSETS = {
${objectContent.trimEnd()}
} as const;

/**
 * Type representing all available asset paths
 */
export type AssetPath =
${assetPaths.map((path, index) => `  ${index === 0 ? '' : '| '}${path}`).join('\n')};
`;

  await writeFile(outputFile, fileContent, 'utf-8');

  console.log('✅ Generated:', outputFile);
  console.log(`📊 Found ${assetCount} assets`);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
