#!/usr/bin/env node
/**
 * Fetch Module Federation types from remote producers
 *
 * In production: Downloads @mf-types.zip from CDN/Artifactory
 * In development: Copies from local workspace packages
 *
 * This script simulates the type distribution flow:
 * 1. Producer builds and packages types to @mf-types.zip
 * 2. Producer uploads zip to CDN alongside remoteEntry.js
 * 3. Consumer downloads zip from CDN
 * 4. Consumer extracts to @mf-types/ directory
 * 5. TypeScript uses extracted declarations for type safety
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Remote producers configuration
const REMOTES = {
  shared_components: {
    // In production: 'https://cdn.example.com/shared-components/latest/@mf-types.zip'
    // In development: Use local workspace package
    zipPath: path.join(__dirname, '../../../shared-components/dist/@mf-types.zip'),
    name: 'shared_components',
  },
};

const PROJECT_ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, '@mf-types');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function fetchTypes(remote) {
  console.log(`📥 Fetching types for ${remote.name}...`);

  if (!fs.existsSync(remote.zipPath)) {
    console.error(`❌ Type package not found: ${remote.zipPath}`);
    console.error(`   Make sure to build the producer first:`);
    console.error(`   cd shared-components && npm run build:prod`);
    process.exit(1);
  }

  // Extract zip to project root
  // Zip contains @mf-types/ at root, so extraction creates PROJECT_ROOT/@mf-types/
  console.log(`📦 Extracting types...`);
  try {
    execSync(`unzip -o -q "${remote.zipPath}" -d "${PROJECT_ROOT}"`, { stdio: 'inherit' });
    console.log(`✅ Extracted to: ${OUTPUT_DIR}/`);
  } catch (error) {
    console.error(`❌ Failed to extract zip:`, error.message);
    process.exit(1);
  }

  // Verify extraction
  const indexFile = path.join(OUTPUT_DIR, 'index.d.ts');

  if (!fs.existsSync(indexFile)) {
    console.error(`❌ Type declarations not found after extraction: ${indexFile}`);
    process.exit(1);
  }

  const typeContent = fs.readFileSync(indexFile, 'utf-8');
  const moduleCount = (typeContent.match(/declare module/g) || []).length;
  console.log(`📝 Found ${moduleCount} module declarations`);

  return { name: remote.name, moduleCount };
}

function main() {
  console.log('🔍 Fetching Module Federation types...\n');

  // Clean output directory
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }

  // Fetch types from all remotes
  const results = [];
  Object.values(REMOTES).forEach((remote) => {
    const result = fetchTypes(remote);
    results.push(result);
    console.log('');
  });

  // Summary
  console.log('📊 Summary:');
  results.forEach((result) => {
    console.log(`   ✅ ${result.name}: ${result.moduleCount} modules`);
  });

  console.log('\n✨ Type fetching complete!');
  console.log('\n📤 Next steps:');
  console.log('   1. TypeScript will use types from @mf-types/ directory');
  console.log('   2. Run build to verify type safety: npm run build');
  console.log('\n💡 Production deployment:');
  console.log('   - Producer: Upload dist/@mf-types.zip to CDN');
  console.log('   - Consumer: Update zipPath to CDN URL');
  console.log('   - CI/CD: Run this script before build');
}

main();
