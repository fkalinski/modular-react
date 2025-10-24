#!/usr/bin/env node
/**
 * Fetch Module Federation types from multiple remote producers
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Remote producers configuration
const REMOTES = {
  shared_components: {
    zipPath: path.join(__dirname, '../../shared-components/dist/@mf-types.zip'),
    name: 'shared_components',
  },
  shared_data: {
    zipPath: path.join(__dirname, '../../shared-data/dist/@mf-types.zip'),
    name: 'shared_data',
  },
  reports_tab: {
    zipPath: path.join(__dirname, '../../reports-tab/dist/@mf-types.zip'),
    name: 'reports_tab',
  },
  user_tab: {
    zipPath: path.join(__dirname, '../../user-tab/dist/@mf-types.zip'),
    name: 'user_tab',
  },
};

const PROJECT_ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, '@mf-types');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  console.log('🔍 Fetching Module Federation types for top-level-shell...\n');

  // Clean output directory
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  ensureDir(OUTPUT_DIR);

  const allTypes = [];
  const results = [];

  Object.values(REMOTES).forEach((remote) => {
    if (!fs.existsSync(remote.zipPath)) {
      console.log(`⚠️  Skipping ${remote.name} - types not built yet\n`);
      results.push({ name: remote.name, moduleCount: 0, success: false });
      return;
    }

    const tempDir = path.join(PROJECT_ROOT, `.temp-${remote.name}`);
    ensureDir(tempDir);

    try {
      execSync(`unzip -o -q "${remote.zipPath}" -d "${tempDir}"`, { stdio: 'pipe' });
      const typeFile = path.join(tempDir, '@mf-types', 'index.d.ts');

      if (fs.existsSync(typeFile)) {
        const content = fs.readFileSync(typeFile, 'utf-8');
        allTypes.push(content);
        const moduleCount = (content.match(/declare module/g) || []).length;
        console.log(`✅ ${remote.name}: ${moduleCount} modules`);
        results.push({ name: remote.name, moduleCount, success: true });
      }

      fs.rmSync(tempDir, { recursive: true });
    } catch (error) {
      console.error(`❌ ${remote.name}: Failed to extract`);
      results.push({ name: remote.name, moduleCount: 0, success: false });
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true });
      }
    }

    console.log('');
  });

  if (allTypes.length > 0) {
    const mergedContent = allTypes.join('\n');
    const outputFile = path.join(OUTPUT_DIR, 'index.d.ts');
    ensureDir(OUTPUT_DIR);
    fs.writeFileSync(outputFile, mergedContent, 'utf-8');

    const srcOutputFile = path.join(PROJECT_ROOT, 'src', 'shared-components-types.d.ts');
    fs.writeFileSync(srcOutputFile, mergedContent, 'utf-8');

    console.log(`📝 Merged types written to:`);
    console.log(`   ${outputFile}`);
    console.log(`   ${srcOutputFile}\n`);
  }

  console.log('📊 Summary:');
  results.forEach((result) => {
    if (result.success) {
      console.log(`   ✅ ${result.name}: ${result.moduleCount} modules`);
    } else {
      console.log(`   ⚠️  ${result.name}: not available`);
    }
  });

  const successCount = results.filter(r => r.success).length;
  console.log(`\n✨ Type fetching complete! (${successCount}/${results.length} remotes)`);
}

main();
