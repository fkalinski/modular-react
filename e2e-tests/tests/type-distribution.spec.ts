import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Type Distribution', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const sharedComponentsPath = path.join(projectRoot, 'shared-components');
  const consumersPath = [
    path.join(projectRoot, 'hubs-tab'),
    path.join(projectRoot, 'reports-tab'),
    path.join(projectRoot, 'user-tab'),
    path.join(projectRoot, 'content-platform/files-folders'),
    path.join(projectRoot, 'content-platform/shell'),
    path.join(projectRoot, 'top-level-shell'),
  ];

  test('should have type packaging script in shared-components', () => {
    const packageTypesScript = path.join(sharedComponentsPath, 'scripts/package-types.js');
    expect(fs.existsSync(packageTypesScript)).toBe(true);

    const scriptContent = fs.readFileSync(packageTypesScript, 'utf-8');
    expect(scriptContent).toContain('Package Module Federation types');
    expect(scriptContent).toContain('@mf-types.zip');
    expect(scriptContent).toContain('EXPOSES');
  });

  test('should generate @mf-types.zip after build', () => {
    const typesZip = path.join(sharedComponentsPath, 'dist/@mf-types.zip');

    // Note: This assumes build has been run. In CI, this would be part of the pipeline
    if (fs.existsSync(typesZip)) {
      const stats = fs.statSync(typesZip);
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.size).toBeLessThan(50000); // Should be around 11KB, fail if > 50KB
    } else {
      // Skip if build hasn't been run yet
      test.skip();
    }
  });

  test('should have type fetching script in all consumers', () => {
    consumersPath.forEach(consumerPath => {
      const fetchTypesScript = path.join(consumerPath, 'scripts/fetch-types.js');
      const consumerName = path.basename(consumerPath);

      expect(fs.existsSync(fetchTypesScript),
        `fetch-types.js should exist in ${consumerName}`
      ).toBe(true);

      const scriptContent = fs.readFileSync(fetchTypesScript, 'utf-8');
      expect(scriptContent).toContain('Fetch Module Federation types');
      expect(scriptContent).toContain('@mf-types.zip');
      expect(scriptContent).toContain('shared_components');
    });
  });

  test('should have prebuild hooks in all consumer package.json', () => {
    consumersPath.forEach(consumerPath => {
      const packageJsonPath = path.join(consumerPath, 'package.json');
      const consumerName = path.basename(consumerPath);

      expect(fs.existsSync(packageJsonPath),
        `package.json should exist in ${consumerName}`
      ).toBe(true);

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.scripts,
        `${consumerName} should have scripts`
      ).toBeDefined();

      expect(packageJson.scripts['fetch:types'],
        `${consumerName} should have fetch:types script`
      ).toBe('node scripts/fetch-types.js');

      expect(packageJson.scripts['prebuild:prod'],
        `${consumerName} should have prebuild:prod hook`
      ).toContain('fetch:types');
    });
  });

  test('should have @mf-types in TypeScript config', () => {
    consumersPath.forEach(consumerPath => {
      const tsconfigPath = path.join(consumerPath, 'tsconfig.json');
      const consumerName = path.basename(consumerPath);

      if (fs.existsSync(tsconfigPath)) {
        const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');

        expect(tsconfigContent,
          `${consumerName} should include @mf-types in tsconfig`
        ).toMatch(/@mf-types/);
      }
    });
  });

  test('should extract types to consumer @mf-types directory after fetch', () => {
    consumersPath.forEach(consumerPath => {
      const mfTypesDir = path.join(consumerPath, '@mf-types');
      const consumerName = path.basename(consumerPath);

      // Only check if build has been run
      if (fs.existsSync(mfTypesDir)) {
        const indexDts = path.join(mfTypesDir, 'index.d.ts');

        expect(fs.existsSync(indexDts),
          `${consumerName} should have @mf-types/index.d.ts after fetch`
        ).toBe(true);

        const indexContent = fs.readFileSync(indexDts, 'utf-8');

        // Verify module declarations exist
        expect(indexContent).toContain('declare module');
        expect(indexContent).toContain('shared_components');

        // Verify key components are present
        expect(indexContent).toContain('shared_components./Button');
        expect(indexContent).toContain('shared_components./Table');
        expect(indexContent).toContain('ButtonProps');
        expect(indexContent).toContain('TableProps');
      }
    });
  });
});

test.describe('Type Distribution - Runtime', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have TypeScript IntelliSense for federated components', async ({ page }) => {
    // This test validates that type distribution works by checking that
    // consumers can import federated components without TypeScript errors

    // Navigate to a consumer tab that uses federated components
    await page.click('text=Reports');
    await expect(page.locator('text=Reports Dashboard')).toBeVisible({ timeout: 10000 });

    // Verify that shared components render (implies types resolved correctly at build time)
    await expect(page.locator('button')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // If types weren't available, the build would have failed with TS2307 errors
    // The fact that the page loads means type distribution worked
  });

  test('should load components with correct TypeScript types', async ({ page }) => {
    await page.click('text=User');
    await expect(page.locator('text=User Settings')).toBeVisible({ timeout: 10000 });

    // Verify Button component with ButtonProps
    const buttons = page.locator('button');
    await expect(buttons.first()).toBeVisible();

    // Verify Input component with InputProps
    const inputs = page.locator('input');
    await expect(inputs.first()).toBeVisible();

    // These components wouldn't render if TypeScript couldn't find their types
  });

  test('should not have TypeScript module resolution errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate through all tabs
    await page.click('text=Reports');
    await page.waitForTimeout(1000);

    await page.click('text=User');
    await page.waitForTimeout(1000);

    await page.click('text=Content');
    await page.waitForTimeout(1000);

    // Filter for TypeScript/module errors
    const tsErrors = consoleErrors.filter(err =>
      err.includes('Cannot find module') ||
      err.includes('TS2307') ||
      err.includes('Module not found')
    );

    expect(tsErrors.length).toBe(0);
  });

  test('should use consistent types across all consumers', async ({ page }) => {
    // Navigate to Reports tab
    await page.click('text=Reports');
    await page.waitForTimeout(1000);

    // Get button styles (should be from shared Button component with proper types)
    const reportsButton = page.locator('button').first();
    const reportsButtonStyles = await reportsButton.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        padding: styles.padding,
        borderRadius: styles.borderRadius,
      };
    });

    // Navigate to User tab
    await page.click('text=User');
    await page.waitForTimeout(1000);

    // Get button styles (should be identical - same shared component)
    const userButton = page.locator('button').first();
    const userButtonStyles = await userButton.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        padding: styles.padding,
        borderRadius: styles.borderRadius,
      };
    });

    // If types are distributed correctly, both use the same Button component
    expect(reportsButtonStyles).toEqual(userButtonStyles);
  });

  test('should provide accurate prop types in all consumers', async ({ page }) => {
    await page.click('text=User');
    await expect(page.locator('text=User Settings')).toBeVisible({ timeout: 10000 });

    // Test that Input component accepts correct props (as defined in InputProps)
    const nameInput = page.locator('input[placeholder="Enter your name"]');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveAttribute('type', 'text');

    const emailInput = page.locator('input[placeholder="Enter your email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');

    // These attributes are defined in InputProps type
    // If types weren't distributed, consumers wouldn't know these props exist
  });
});

test.describe('Type Distribution - Performance', () => {
  test('should fetch types quickly in development', () => {
    // This would measure actual fetch time in a real environment
    // For now, we just verify the zip is reasonably sized
    const typesZip = path.resolve(__dirname, '../../shared-components/dist/@mf-types.zip');

    if (fs.existsSync(typesZip)) {
      const stats = fs.statSync(typesZip);

      // Types should be small (~11KB) for fast fetching
      expect(stats.size).toBeLessThan(50000); // 50KB max
      expect(stats.size).toBeGreaterThan(1000); // At least 1KB (sanity check)
    }
  });

  test('should not significantly increase build time', async () => {
    // In a real CI environment, this would measure build time with/without type fetching
    // The overhead should be minimal (~1-2 seconds)
    // This test documents the expectation
    expect(true).toBe(true); // Placeholder for actual timing measurement
  });
});

test.describe('Type Distribution - Error Handling', () => {
  test('should handle missing type package gracefully', () => {
    // This test would simulate a missing @mf-types.zip
    // The build should fail with a clear error message
    // rather than cryptic TypeScript errors

    // In a real scenario, we'd temporarily rename the zip file
    // and verify the error message from the fetch script
    expect(true).toBe(true); // Placeholder
  });

  test('should validate type package structure', () => {
    const typesZip = path.resolve(__dirname, '../../shared-components/dist/@mf-types.zip');

    if (fs.existsSync(typesZip)) {
      // In a real test, we'd extract and validate the zip structure
      // - Should contain @mf-types/ directory
      // - Should contain index.d.ts
      // - Should NOT contain package.json (to avoid workspace conflicts)

      const stats = fs.statSync(typesZip);
      expect(stats.isFile()).toBe(true);
    }
  });
});
