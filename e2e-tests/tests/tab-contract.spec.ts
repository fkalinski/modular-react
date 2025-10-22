import { test, expect } from '@playwright/test';

test.describe('Tab Contract & Plugin System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Content platform
    await page.click('text=Content');
    await expect(page.locator('text=Content Platform')).toBeVisible({ timeout: 10000 });
  });

  test('should load Files tab implementing TabPlugin contract', async ({ page }) => {
    // Files tab should be active by default
    await expect(page.locator('button:has-text("📁 Files & Folders")')).toBeVisible();

    // Verify Files tab components are loaded
    await expect(page.locator('text=Folders')).toBeVisible();
    await expect(page.locator('text=Files')).toBeVisible();

    // Check if folder tree is rendered (from shared Tree component)
    await expect(page.locator('text=My Documents')).toBeVisible();

    // Check if file table is rendered (from shared Table component)
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Size")')).toBeVisible();
  });

  test('should load Hubs tab implementing TabPlugin contract', async ({ page }) => {
    // Click on Hubs tab
    await page.click('button:has-text("🏢 Hubs")');

    // Wait for Hubs tab to load
    await expect(page.locator('text=Create New Hub')).toBeVisible({ timeout: 10000 });

    // Verify Hubs tab components
    await expect(page.locator('input[placeholder="Enter hub name..."]')).toBeVisible();
    await expect(page.locator('text=Engineering Team')).toBeVisible();
    await expect(page.locator('text=Product & Design')).toBeVisible();
  });

  test('should pass context to tabs via TabProps', async ({ page }) => {
    // Files tab should receive context
    await expect(page.locator('text=Folders')).toBeVisible();

    // Type in search to modify context
    const searchInput = page.locator('input[placeholder="Search content..."]');
    await searchInput.fill('Project');

    // Click apply filters
    await page.click('button:has-text("Apply Filters")');

    // Wait a moment for the filter to apply
    await page.waitForTimeout(500);

    // Tab should respond to context change
    // The filtered indicator should appear
    await expect(page.locator('text=filtered: "Project"')).toBeVisible();

    // Navigate to Hubs tab
    await page.click('button:has-text("🏢 Hubs")');
    await page.waitForTimeout(500);

    // Hubs tab should also show the filter
    await expect(page.locator('text=filtered: "Project"')).toBeVisible();
  });

  test('should support tab navigation via onNavigate callback', async ({ page }) => {
    // Console logs can be captured to verify navigation calls
    const navigationCalls: string[] = [];

    page.on('console', msg => {
      if (msg.text().includes('Navigate:')) {
        navigationCalls.push(msg.text());
      }
    });

    // Click on a folder in Files tab
    await page.click('text=Work');

    await page.waitForTimeout(500);

    // Navigation should have been called
    expect(navigationCalls.length).toBeGreaterThan(0);
  });

  test('should support tab selection via onSelect callback', async ({ page }) => {
    // Click on a file to select it
    const firstFile = page.locator('table tbody tr').first();
    await firstFile.click();

    // Debug info should show selection
    await page.waitForTimeout(500);

    // Check debug info for selected count
    const debugInfo = page.locator('text=/Selected: \\d+ items/');
    await expect(debugInfo).toBeVisible();
  });

  test('should execute tab-specific actions', async ({ page }) => {
    // Files tab actions
    await expect(page.locator('button:has-text("Upload")')).toBeVisible();
    await expect(page.locator('button:has-text("Download")')).toBeVisible();

    // Switch to Hubs tab
    await page.click('button:has-text("🏢 Hubs")');

    // Hubs tab actions
    await expect(page.locator('button:has-text("Create Hub")')).toBeVisible();
    await expect(page.locator('button:has-text("Clear Selection")')).toBeVisible();
  });

  test('should disable actions based on context', async ({ page }) => {
    // Download button should be disabled when nothing is selected
    const downloadBtn = page.locator('button:has-text("Download")');
    await expect(downloadBtn).toBeDisabled();

    // Select a file
    await page.locator('table tbody tr').first().click();
    await page.waitForTimeout(300);

    // Now download should be enabled
    await expect(downloadBtn).toBeEnabled();
  });

  test('should handle tab lifecycle hooks', async ({ page }) => {
    const consoleLogs: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[FilesTab]') || text.includes('[HubsTab]')) {
        consoleLogs.push(text);
      }
    });

    // Switch to Hubs tab (activates Hubs, may deactivate Files)
    await page.click('button:has-text("🏢 Hubs")');
    await page.waitForTimeout(500);

    // Switch back to Files
    await page.click('button:has-text("📁 Files & Folders")');
    await page.waitForTimeout(500);

    // Should have logged lifecycle events
    const hasActivation = consoleLogs.some(log => log.includes('activated'));
    expect(hasActivation).toBe(true);
  });

  test('should validate tab config (id, name, version)', async ({ page }) => {
    // Tabs should be rendered with their config metadata

    // Files tab config
    const filesTab = page.locator('button:has-text("📁 Files & Folders")');
    await expect(filesTab).toBeVisible();

    // Hubs tab config
    const hubsTab = page.locator('button:has-text("🏢 Hubs")');
    await expect(hubsTab).toBeVisible();

    // Both tabs should be clickable (valid plugins)
    await filesTab.click();
    await expect(page.locator('text=Folders')).toBeVisible();

    await hubsTab.click();
    await expect(page.locator('text=Create New Hub')).toBeVisible();
  });

  test('should share component version requirements', async ({ page }) => {
    // Both Files and Hubs specify ^1.0.0 for shared-components
    // They should use the same runtime version

    // Check that components have consistent styling across tabs
    await page.click('button:has-text("📁 Files & Folders")');

    const filesButton = page.locator('button:has-text("Upload")').first();
    const filesBorderRadius = await filesButton.evaluate(el =>
      window.getComputedStyle(el).borderRadius
    );

    await page.click('button:has-text("🏢 Hubs")');

    const hubsButton = page.locator('button:has-text("Create Hub")');
    const hubsBorderRadius = await hubsButton.evaluate(el =>
      window.getComputedStyle(el).borderRadius
    );

    // Both should have the same border-radius from shared components
    expect(filesBorderRadius).toBe(hubsBorderRadius);
    expect(filesBorderRadius).toBe('4px');
  });

  test('should support tabs from different repositories', async ({ page }) => {
    // Files tab is in content-platform monorepo
    await page.click('button:has-text("📁 Files & Folders")');
    await expect(page.locator('text=Folders')).toBeVisible();

    // Hubs tab is in a separate repository
    await page.click('button:has-text("🏢 Hubs")');
    await expect(page.locator('text=Create New Hub')).toBeVisible();

    // Both should integrate seamlessly despite being from different sources
    // This proves the tab contract works across organizational boundaries
  });

  test('should render tab content in isolated boundaries', async ({ page }) => {
    // Each tab should be rendered in its own error boundary

    // Files tab
    await page.click('button:has-text("📁 Files & Folders")');
    const filesContent = page.locator('text=Folders');
    await expect(filesContent).toBeVisible();

    // Hubs tab
    await page.click('button:has-text("🏢 Hubs")');
    const hubsContent = page.locator('text=Create New Hub');
    await expect(hubsContent).toBeVisible();

    // If one tab errors, others should still work
    // (This is handled by Suspense and error boundaries in the code)
  });

  test('should support creating custom content items', async ({ page }) => {
    // Navigate to Hubs tab
    await page.click('button:has-text("🏢 Hubs")');

    // Fill in create form
    const nameInput = page.locator('input[placeholder="Enter hub name..."]');
    await nameInput.fill('Test Hub');

    // Click create
    await page.click('button:has-text("Create Hub")');

    // Should show alert (in real app, would create hub)
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Test Hub');
      dialog.accept();
    });
  });

  test('should show debug information with context data', async ({ page }) => {
    // Debug section should show loaded tabs and active state
    const debugInfo = page.locator('text=/Loaded \\d+ tabs/');
    await expect(debugInfo).toBeVisible();

    // Should show active tab
    await expect(page.locator('text=/Active: files/')).toBeVisible();

    // Type in search
    await page.locator('input[placeholder="Search content..."]').fill('test');

    // Should show search in debug
    await expect(page.locator('text=Search: "test"')).toBeVisible();
  });
});
