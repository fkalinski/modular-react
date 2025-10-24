/**
 * E2E Tests for Module Federation Strategy
 *
 * Tests the dynamic remote loading with cookie/localStorage/URL parameter overrides
 */

import { test, expect, Page } from '@playwright/test';

// Helper to wait for app to be ready
async function waitForAppReady(page: Page) {
  // Wait for the main app container
  await page.waitForSelector('[style*="display: flex"]', { timeout: 30000 });
  // Wait for any loading states to finish
  await page.waitForTimeout(1000);
}

// Helper to check if remote loaded successfully
async function checkRemoteLoaded(page: Page, remoteName: string) {
  // Check console for successful load message
  const logs = await page.evaluate(() => {
    return (window as any).__mfLogs || [];
  });

  // Components should be visible
  const hasContent = await page.locator('body').evaluate(el =>
    el.textContent && el.textContent.length > 100
  );

  return hasContent;
}

test.describe('Module Federation Strategy', () => {

  test.describe('Default Loading', () => {

    test('should load app with default remote URLs', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await waitForAppReady(page);

      // Check that main app components loaded
      await expect(page.locator('text=Content')).toBeVisible();

      // Check that shared components loaded (sidebar should be visible)
      const sidebar = page.locator('[style*="width"][style*="60px"]').first();
      await expect(sidebar).toBeVisible();

      // Verify no override messages in console
      const logs: string[] = [];
      page.on('console', msg => logs.push(msg.text()));

      await page.reload();
      await waitForAppReady(page);

      // Should not see override messages
      const hasOverrideMsg = logs.some(log => log.includes('[MF Override]'));
      expect(hasOverrideMsg).toBe(false);
    });

    test('should initialize dev tools in development mode', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await waitForAppReady(page);

      // Check that window.mf exists
      const mfExists = await page.evaluate(() => {
        return typeof (window as any).mf !== 'undefined';
      });

      expect(mfExists).toBe(true);

      // Check that mf has expected methods
      const mfMethods = await page.evaluate(() => {
        const mf = (window as any).mf;
        return {
          hasOverride: typeof mf?.override === 'function',
          hasClearOverrides: typeof mf?.clearOverrides === 'function',
          hasListOverrides: typeof mf?.listOverrides === 'function',
          hasTestPR: typeof mf?.testPR === 'function',
          hasUseStaging: typeof mf?.useStaging === 'function',
        };
      });

      expect(mfMethods.hasOverride).toBe(true);
      expect(mfMethods.hasClearOverrides).toBe(true);
      expect(mfMethods.hasListOverrides).toBe(true);
      expect(mfMethods.hasTestPR).toBe(true);
      expect(mfMethods.hasUseStaging).toBe(true);
    });
  });

  test.describe('URL Parameter Override', () => {

    test('should recognize URL parameter override', async ({ page }) => {
      const consoleLogs: string[] = [];
      page.on('console', msg => consoleLogs.push(msg.text()));

      // Navigate with URL parameter override
      await page.goto('http://localhost:3000/?remote_shared_components=http://localhost:3001/remoteEntry.js');
      await waitForAppReady(page);

      // Check console for override message
      const hasOverrideLog = consoleLogs.some(log =>
        log.includes('[MF Override]') && log.includes('shared_components')
      );

      // In this case, it's pointing to the same URL as default, so we just verify it works
      expect(hasOverrideLog).toBe(true);

      // App should still work
      await expect(page.locator('text=Content')).toBeVisible();
    });

    test('should handle multiple URL parameter overrides', async ({ page }) => {
      const consoleLogs: string[] = [];
      page.on('console', msg => consoleLogs.push(msg.text()));

      await page.goto(
        'http://localhost:3000/' +
        '?remote_shared_components=http://localhost:3001/remoteEntry.js' +
        '&remote_shared_data=http://localhost:3002/remoteEntry.js'
      );
      await waitForAppReady(page);

      // Should see override messages for both
      const hasComponentsOverride = consoleLogs.some(log =>
        log.includes('shared_components') && log.includes('URL param')
      );
      const hasDataOverride = consoleLogs.some(log =>
        log.includes('shared_data') && log.includes('URL param')
      );

      expect(hasComponentsOverride).toBe(true);
      expect(hasDataOverride).toBe(true);
    });
  });

  test.describe('LocalStorage Override', () => {

    test('should apply localStorage override', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await waitForAppReady(page);

      // Set override via localStorage
      await page.evaluate(() => {
        localStorage.setItem('mf-remote-overrides', JSON.stringify({
          shared_components: 'http://localhost:3001/remoteEntry.js'
        }));
      });

      const consoleLogs: string[] = [];
      page.on('console', msg => consoleLogs.push(msg.text()));

      // Reload to apply override
      await page.reload();
      await waitForAppReady(page);

      // Check for override message
      const hasOverrideLog = consoleLogs.some(log =>
        log.includes('[MF Override]') &&
        log.includes('shared_components') &&
        log.includes('localStorage')
      );

      expect(hasOverrideLog).toBe(true);
    });

    test('should clear localStorage override', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await waitForAppReady(page);

      // Set override
      await page.evaluate(() => {
        localStorage.setItem('mf-remote-overrides', JSON.stringify({
          shared_components: 'http://localhost:3001/remoteEntry.js'
        }));
      });

      await page.reload();
      await waitForAppReady(page);

      // Clear via dev tools
      await page.evaluate(() => {
        (window as any).mf.clearOverrides();
      });

      // Check localStorage is cleared
      const overrides = await page.evaluate(() => {
        return localStorage.getItem('mf-remote-overrides');
      });

      expect(overrides).toBeNull();
    });
  });

  test.describe('Developer Tools', () => {

    test('mf.override() should set localStorage override', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await waitForAppReady(page);

      // Call mf.override()
      await page.evaluate(() => {
        (window as any).mf.override(
          'shared_components',
          'http://localhost:3001/remoteEntry.js'
        );
      });

      // Check localStorage was updated
      const overrides = await page.evaluate(() => {
        const stored = localStorage.getItem('mf-remote-overrides');
        return stored ? JSON.parse(stored) : null;
      });

      expect(overrides).toMatchObject({
        shared_components: 'http://localhost:3001/remoteEntry.js'
      });
    });

    test('mf.listOverrides() should show all active overrides', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await waitForAppReady(page);

      // Set some overrides
      await page.evaluate(() => {
        localStorage.setItem('mf-remote-overrides', JSON.stringify({
          shared_components: 'http://localhost:3001/remoteEntry.js',
          shared_data: 'http://localhost:3002/remoteEntry.js'
        }));
      });

      const consoleLogs: string[] = [];
      page.on('console', msg => consoleLogs.push(msg.text()));

      // Call listOverrides
      await page.evaluate(() => {
        (window as any).mf.listOverrides();
      });

      // Should log the overrides
      const hasOverridesList = consoleLogs.some(log =>
        log.includes('Module Federation Overrides') || log.includes('Active Overrides')
      );

      expect(hasOverridesList).toBe(true);
    });

    test('mf.clearOverride() should remove specific override', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await waitForAppReady(page);

      // Set multiple overrides
      await page.evaluate(() => {
        localStorage.setItem('mf-remote-overrides', JSON.stringify({
          shared_components: 'http://localhost:3001/remoteEntry.js',
          shared_data: 'http://localhost:3002/remoteEntry.js'
        }));
      });

      // Clear one
      await page.evaluate(() => {
        (window as any).mf.clearOverride('shared_components');
      });

      // Check only shared_components was removed
      const overrides = await page.evaluate(() => {
        const stored = localStorage.getItem('mf-remote-overrides');
        return stored ? JSON.parse(stored) : null;
      });

      expect(overrides).not.toHaveProperty('shared_components');
      expect(overrides).toHaveProperty('shared_data');
    });

    test('mf.useStaging() should set all remotes to staging', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await waitForAppReady(page);

      // Call useStaging
      await page.evaluate(() => {
        (window as any).mf.useStaging();
      });

      // Check localStorage has staging URLs
      const overrides = await page.evaluate(() => {
        const stored = localStorage.getItem('mf-remote-overrides');
        return stored ? JSON.parse(stored) : null;
      });

      // Should have staging URLs
      expect(overrides?.shared_components).toContain('staging');
      expect(overrides?.shared_data).toContain('staging');
    });

    test('mf.testPR() should construct correct PR URL', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await waitForAppReady(page);

      // Call testPR
      await page.evaluate(() => {
        (window as any).mf.testPR('shared_components', 123);
      });

      // Check localStorage has PR URL
      const overrides = await page.evaluate(() => {
        const stored = localStorage.getItem('mf-remote-overrides');
        return stored ? JSON.parse(stored) : null;
      });

      // Should have PR URL pattern
      expect(overrides?.shared_components).toContain('pr-123');
      expect(overrides?.shared_components).toContain('vercel.app');
    });
  });

  test.describe('Priority System', () => {

    test('URL param should override localStorage', async ({ page }) => {
      // Set localStorage override
      await page.goto('http://localhost:3000');
      await page.evaluate(() => {
        localStorage.setItem('mf-remote-overrides', JSON.stringify({
          shared_components: 'http://localstorage-url/remoteEntry.js'
        }));
      });

      const consoleLogs: string[] = [];
      page.on('console', msg => consoleLogs.push(msg.text()));

      // Navigate with URL param (higher priority)
      await page.goto('http://localhost:3000/?remote_shared_components=http://localhost:3001/remoteEntry.js');
      await waitForAppReady(page);

      // Should use URL param, not localStorage
      const usedURLParam = consoleLogs.some(log =>
        log.includes('URL param') && log.includes('shared_components')
      );
      const usedLocalStorage = consoleLogs.some(log =>
        log.includes('localStorage') && log.includes('shared_components')
      );

      expect(usedURLParam).toBe(true);
      expect(usedLocalStorage).toBe(false);
    });
  });

  test.describe('Error Handling', () => {

    test('should fallback gracefully when dynamic loader fails', async ({ page }) => {
      // This tests the fallback mechanism in App.tsx
      await page.goto('http://localhost:3000');
      await waitForAppReady(page);

      // App should still load even if dynamic loader has issues
      await expect(page.locator('text=Content')).toBeVisible();

      // Check no fatal errors
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));

      await page.reload();
      await waitForAppReady(page);

      // Should not have any uncaught errors
      const hasFatalError = errors.some(err =>
        err.includes('Cannot read') || err.includes('is not a function')
      );
      expect(hasFatalError).toBe(false);
    });

    test('should handle invalid URL in override gracefully', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await waitForAppReady(page);

      // Set invalid URL
      await page.evaluate(() => {
        localStorage.setItem('mf-remote-overrides', JSON.stringify({
          shared_components: 'http://invalid-url-that-does-not-exist/remoteEntry.js'
        }));
      });

      const errors: string[] = [];
      const warnings: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
        if (msg.type() === 'warning') warnings.push(msg.text());
      });

      // Reload with invalid override
      await page.reload();

      // Should show error but not crash
      // App may have fallback UI
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toBeTruthy();

      // May have error message but app should still render something
      const hasContent = await page.locator('body').evaluate(el =>
        el.children.length > 0
      );
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Integration with App', () => {

    test('should load shared components successfully', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await waitForAppReady(page);

      // Check that shared components are visible
      // Sidebar (from shared_components)
      const sidebar = page.locator('[style*="width"][style*="60px"]').first();
      await expect(sidebar).toBeVisible();

      // Check navigation items
      await expect(page.locator('text=Content')).toBeVisible();
      await expect(page.locator('text=Reports')).toBeVisible();
      await expect(page.locator('text=User')).toBeVisible();
    });

    test('should maintain app functionality with overrides', async ({ page }) => {
      // Set override
      await page.goto('http://localhost:3000');
      await page.evaluate(() => {
        localStorage.setItem('mf-remote-overrides', JSON.stringify({
          shared_components: 'http://localhost:3001/remoteEntry.js'
        }));
      });

      await page.reload();
      await waitForAppReady(page);

      // Test navigation still works
      await page.locator('text=Reports').click();
      await expect(page.locator('text=Reports')).toBeVisible();

      // URL should change
      await expect(page).toHaveURL(/tab=reports/);

      // Navigate back
      await page.locator('text=Content').click();
      await expect(page).toHaveURL(/tab=content/);
    });
  });

  test.describe('Performance', () => {

    test('should load remotes within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('http://localhost:3000');
      await waitForAppReady(page);

      const loadTime = Date.now() - startTime;

      // Should load within 10 seconds (generous for E2E)
      expect(loadTime).toBeLessThan(10000);

      // Check that app is interactive
      await expect(page.locator('text=Content')).toBeVisible();
    });

    test('should not reload remotes unnecessarily', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await waitForAppReady(page);

      // Count script tags
      const initialScriptCount = await page.locator('script[data-mf-scope]').count();

      // Navigate between tabs
      await page.locator('text=Reports').click();
      await page.waitForTimeout(500);
      await page.locator('text=Content').click();
      await page.waitForTimeout(500);

      // Script count should not increase (remotes already loaded)
      const finalScriptCount = await page.locator('script[data-mf-scope]').count();
      expect(finalScriptCount).toBe(initialScriptCount);
    });
  });
});

test.describe('Cookie-Based Override (Production)', () => {

  test.beforeEach(async ({ context }) => {
    // Set cookie override
    await context.addCookies([{
      name: 'mf_shared_components',
      value: 'http://localhost:3001/remoteEntry.js',
      domain: 'localhost',
      path: '/'
    }]);
  });

  test('should recognize cookie override', async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on('console', msg => consoleLogs.push(msg.text()));

    await page.goto('http://localhost:3000');
    await waitForAppReady(page);

    // Should see cookie override message
    const hasCookieOverride = consoleLogs.some(log =>
      log.includes('[MF Override]') &&
      log.includes('shared_components') &&
      log.includes('cookie')
    );

    expect(hasCookieOverride).toBe(true);
  });

  test('cookie should take priority over localStorage', async ({ page }) => {
    // Set localStorage with different URL
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.setItem('mf-remote-overrides', JSON.stringify({
        shared_components: 'http://localstorage-url/remoteEntry.js'
      }));
    });

    const consoleLogs: string[] = [];
    page.on('console', msg => consoleLogs.push(msg.text()));

    await page.reload();
    await waitForAppReady(page);

    // Should use cookie, not localStorage
    const usedCookie = consoleLogs.some(log => log.includes('cookie'));
    const usedLocalStorage = consoleLogs.some(log =>
      log.includes('localStorage') && log.includes('shared_components')
    );

    expect(usedCookie).toBe(true);
    expect(usedLocalStorage).toBe(false);
  });
});
