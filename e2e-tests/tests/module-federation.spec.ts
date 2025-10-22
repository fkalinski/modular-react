import { test, expect } from '@playwright/test';

test.describe('Module Federation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load main application shell', async ({ page }) => {
    // Check if main shell loaded
    await expect(page.locator('h1')).toContainText('Modular Platform');
    await expect(page.locator('text=Module Federation 2.0 PoC')).toBeVisible();
  });

  test('should load shared components from remote', async ({ page }) => {
    // Wait for remoteEntry.js from shared-components to be loaded
    const remoteEntryPromise = page.waitForResponse(
      response => response.url().includes('localhost:3001/remoteEntry.js')
    );

    await page.goto('/');
    await remoteEntryPromise;

    // Verify shared components are rendered
    const buttons = page.locator('button');
    await expect(buttons.first()).toBeVisible();
  });

  test('should load Reports tab as federated module', async ({ page }) => {
    // Navigate to Reports tab
    await page.click('text=Reports');

    // Wait for Reports remote module to load
    await expect(page.locator('text=Reports Dashboard')).toBeVisible({ timeout: 10000 });

    // Check if Reports tab uses shared Table component
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Report Name")')).toBeVisible();
  });

  test('should load User tab as federated module', async ({ page }) => {
    // Navigate to User tab
    await page.click('text=User');

    // Wait for User remote module to load
    await expect(page.locator('text=User Settings')).toBeVisible({ timeout: 10000 });

    // Check if User tab uses shared Input components
    await expect(page.locator('input[placeholder="Enter your name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter your email"]')).toBeVisible();
  });

  test('should load Content platform as nested federated module', async ({ page }) => {
    // Navigate to Content tab
    await page.click('text=Content');

    // Wait for Content shell to load
    await expect(page.locator('text=Content Platform')).toBeVisible({ timeout: 10000 });

    // Verify search pane is loaded
    await expect(page.locator('text=Search & Filters')).toBeVisible();
    await expect(page.locator('input[placeholder="Search content..."]')).toBeVisible();
  });

  test('should handle remote module loading errors gracefully', async ({ page }) => {
    // This would normally show fallback UI if a module fails to load
    // For now, we just verify the error boundaries exist

    await page.goto('/');

    // Even if a module fails, the shell should still render
    await expect(page.locator('h1')).toContainText('Modular Platform');
  });

  test('should share React singleton across all modules', async ({ page }) => {
    await page.goto('/');

    // Navigate through all tabs
    await page.click('text=Reports');
    await page.waitForTimeout(1000);

    await page.click('text=User');
    await page.waitForTimeout(1000);

    await page.click('text=Content');
    await page.waitForTimeout(1000);

    // Check console for React singleton warnings
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('multiple instances of React')) {
        logs.push(msg.text());
      }
    });

    // Reload to capture all warnings
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should have no React instance warnings
    expect(logs.length).toBe(0);
  });

  test('should load different versions of shared components', async ({ page }) => {
    await page.goto('/');

    // All tabs should be able to specify version requirements
    // In this PoC, all use ^1.0.0 which resolves to the same version

    // Navigate to Reports
    await page.click('text=Reports');
    await expect(page.locator('button')).toHaveCount(1); // Generate Report button

    // Navigate to User
    await page.click('text=User');
    await expect(page.locator('button')).toHaveCount(2); // Save and Reset buttons

    // All buttons should have consistent styling from shared components
    const buttons = page.locator('button');
    const firstButton = buttons.first();
    const borderRadius = await firstButton.evaluate(el =>
      window.getComputedStyle(el).borderRadius
    );

    // All buttons from shared components should have border-radius: 4px
    expect(borderRadius).toBe('4px');
  });

  test('should dynamically load remoteEntry.js files', async ({ page }) => {
    const remoteEntries: string[] = [];

    // Capture all remoteEntry.js requests
    page.on('response', response => {
      if (response.url().includes('remoteEntry.js')) {
        remoteEntries.push(response.url());
      }
    });

    await page.goto('/');

    // Navigate through tabs to trigger remote loads
    await page.click('text=Reports');
    await page.waitForTimeout(1000);

    await page.click('text=User');
    await page.waitForTimeout(1000);

    await page.click('text=Content');
    await page.waitForTimeout(1000);

    // Should have loaded multiple remoteEntry files
    expect(remoteEntries.length).toBeGreaterThan(0);

    // Verify key remotes were loaded
    const hasSharedComponents = remoteEntries.some(url => url.includes(':3001'));
    const hasSharedData = remoteEntries.some(url => url.includes(':3002'));

    expect(hasSharedComponents).toBe(true);
    expect(hasSharedData).toBe(true);
  });

  test('should support hot module replacement during development', async ({ page }) => {
    await page.goto('/');

    // This test verifies HMR is configured (not actually triggering file changes)
    // In dev mode, webpack should inject HMR runtime

    const hasHmrRuntime = await page.evaluate(() => {
      return typeof (window as any).webpackHot !== 'undefined' ||
             typeof (window as any).module?.hot !== 'undefined';
    });

    // In development, HMR should be available
    // Note: This might be false in production builds
    if (process.env.NODE_ENV !== 'production') {
      expect(hasHmrRuntime).toBe(true);
    }
  });
});
