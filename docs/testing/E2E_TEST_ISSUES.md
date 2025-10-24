# E2E Test Issues - Detailed Tracker

**Date:** 2025-10-24
**Total Issues:** 6 categories
**Tests Affected:** 40 failing tests
**Priority Distribution:** 3 Critical, 2 Medium, 1 Low

---

## Quick Reference

| Issue ID | Category | Priority | Tests Affected | Estimated Effort |
|----------|----------|----------|----------------|------------------|
| [#1](#issue-1-modular-platform-vs-box-platform-branding) | UI Text Mismatch | 🔴 Critical | 3 | 15 min |
| [#2](#issue-2-content-platform-text-not-found) | UI Text Mismatch | 🔴 Critical | 30 | 30 min |
| [#3](#issue-3-module-federation-20-poc-text-missing) | UI Text Mismatch | 🔴 Critical | 1 | 5 min |
| [#4](#issue-4-button-selector-too-broad) | Selector Issue | 🟡 Medium | 1 | 15 min |
| [#5](#issue-5-hmr-runtime-not-detected) | Feature Detection | 🟡 Medium | 1 | 30 min |
| [#6](#issue-6-type-distribution-script-paths) | Configuration | 🟢 Low | 4 | 1 hour |

**Total Estimated Effort:** 2-3 hours

---

## Critical Issues (Priority 1)

### Issue #1: "Modular Platform" vs "Box Platform" Branding

**Priority:** 🔴 Critical
**Tests Affected:** 3
**Category:** UI Text Mismatch
**Estimated Effort:** 15 minutes

#### Description
Tests expect to find an `<h1>` tag containing "Modular Platform", but the actual application uses "Box Platform" branding.

#### Affected Tests
1. `tests/module-federation.spec.ts:8-12` - "should load main application shell"
2. `tests/module-federation.spec.ts:64-72` - "should handle remote module loading errors gracefully"
3. Multiple assertions checking for "Modular Platform" text

#### Current Behavior
```typescript
// Line 10 - tests/module-federation.spec.ts
await expect(page.locator('h1')).toContainText('Modular Platform');
// ❌ FAILS: No h1 with "Modular Platform" found
```

#### Expected Behavior (Actual UI)
- Application displays "Box Platform" in the header/sidebar
- No `<h1>` tag with "Modular Platform" exists

#### Screenshot Evidence
See: `test-results/module-federation-Module-F-811cb-load-main-application-shell-chromium/test-failed-1.png`
Shows "Box Platform" logo/text in sidebar.

#### Proposed Fix

**Option A: Update Tests to Match UI** (Recommended)
```typescript
// tests/module-federation.spec.ts:10
// OLD:
await expect(page.locator('h1')).toContainText('Modular Platform');

// NEW:
await expect(page.locator('text=Box Platform')).toBeVisible();
// OR if there's an h1:
await expect(page.locator('h1')).toContainText('Box Platform');
```

**Option B: Update Application Branding**
If "Modular Platform" is the correct branding, update the application to use it instead.

#### Files to Modify
```
e2e-tests/tests/module-federation.spec.ts
  - Line 10: Update h1 text expectation
  - Line 71: Update h1 text expectation
```

#### Verification Steps
1. Update the text expectations in test file
2. Run: `cd e2e-tests && npm test -- tests/module-federation.spec.ts`
3. Verify tests 1, 6 now pass

---

### Issue #2: "Content Platform" Text Not Found

**Priority:** 🔴 Critical
**Tests Affected:** 30 (15 state-sharing + 15 tab-contract tests)
**Category:** UI Text Mismatch
**Estimated Effort:** 30 minutes

#### Description
All state-sharing and tab-contract tests fail in the `beforeEach` hook because they expect "Content Platform" text to be visible after clicking "Content" tab, but this text doesn't exist in the actual UI.

#### Affected Tests

**State Sharing Tests (15):**
1. should share filter state across tabs
2. should share selection state across tabs
3. should synchronize Redux state via shared-data module
4. should maintain navigation state across tabs
5. should propagate context changes to all tabs immediately
6. should use PlatformContext for state distribution
7. should support event bus for cross-module communication
8. should handle concurrent state updates from multiple tabs
9. should preserve state during tab switches
10. should support dynamic reducer injection
11. should use Redux DevTools in development
12. should batch state updates for performance
13. should clear all state when filter is cleared
14. should support state hydration from URL parameters
15. should prevent state mutation bugs via Redux Toolkit

**Tab Contract Tests (15):**
1. should load Files tab implementing TabPlugin contract
2. should load Hubs tab implementing TabPlugin contract
3. should pass context to tabs via TabProps
4. should support tab navigation via onNavigate callback
5. should support tab selection via onSelect callback
6. should execute tab-specific actions
7. should disable actions based on context
8. should handle tab lifecycle hooks
9. should validate tab config (id, name, version)
10. should share component version requirements
11. should support tabs from different repositories
12. should render tab content in isolated boundaries
13. should support creating custom content items
14. should show debug information with context data
15. (Additional test affected by same root cause)

#### Current Behavior
```typescript
// tests/state-sharing.spec.ts:5-8
beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.click('text=Content');
  await expect(page.locator('text=Content Platform')).toBeVisible({ timeout: 10000 });
  // ❌ FAILS HERE: "Content Platform" text never appears
});
```

#### Expected Behavior (Actual UI)
After clicking "Content" tab:
- Content area loads with "Files & Folders" tab
- No explicit "Content Platform" heading/text visible
- Content shows folder tree and file listings directly

#### Screenshot Evidence
See: `test-results/state-sharing-State-Sharin-7e571-re-filter-state-across-tabs-chromium/test-failed-1.png`

#### Proposed Fix

**Option A: Wait for Content Area Elements** (Recommended)
```typescript
// tests/state-sharing.spec.ts:5-8
beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.click('text=Content');

  // NEW: Wait for actual content indicators instead
  await expect(page.locator('text=Files & Folders')).toBeVisible({ timeout: 10000 });
  // OR: await expect(page.locator('[data-testid="content-area"]')).toBeVisible();
});
```

**Option B: Add data-testid to Content Area**
Add `data-testid="content-loaded"` to the content area component and test for that:
```typescript
await expect(page.locator('[data-testid="content-loaded"]')).toBeVisible();
```

**Option C: Multiple Indicator Checks**
```typescript
// Wait for either Files & Folders tab OR folder tree to be visible
await Promise.race([
  expect(page.locator('text=Files & Folders')).toBeVisible(),
  expect(page.locator('[role="tree"]')).toBeVisible(),
  expect(page.locator('text=My Documents')).toBeVisible(),
]);
```

#### Files to Modify
```
e2e-tests/tests/state-sharing.spec.ts
  - Line 7: Replace "Content Platform" check

e2e-tests/tests/tab-contract.spec.ts
  - Multiple locations with same pattern
  - Search for: 'text=Content Platform'
  - Replace with appropriate content indicator
```

#### Verification Steps
1. Update the beforeEach hooks in both test files
2. Run: `cd e2e-tests && npm test -- tests/state-sharing.spec.ts`
3. Run: `cd e2e-tests && npm test -- tests/tab-contract.spec.ts`
4. Verify all 30 tests now execute (they may have other failures, but should pass setup)

---

### Issue #3: "Module Federation 2.0 PoC" Text Missing

**Priority:** 🔴 Critical
**Tests Affected:** 1
**Category:** UI Text Mismatch
**Estimated Effort:** 5 minutes

#### Description
Test expects subtitle text "Module Federation 2.0 PoC" to be visible, but this text doesn't exist in the actual UI.

#### Affected Tests
1. `tests/module-federation.spec.ts:8-12` - "should load main application shell"

#### Current Behavior
```typescript
// Line 11 - tests/module-federation.spec.ts
await expect(page.locator('text=Module Federation 2.0 PoC')).toBeVisible();
// ❌ FAILS: Text not found anywhere on page
```

#### Expected Behavior (Actual UI)
- No subtitle or descriptive text about "Module Federation 2.0 PoC"
- Application shows clean UI without technical implementation details

#### Proposed Fix

**Option A: Remove Assertion** (Recommended)
```typescript
// tests/module-federation.spec.ts:10-11
await expect(page.locator('text=Box Platform')).toBeVisible();
// REMOVE: await expect(page.locator('text=Module Federation 2.0 PoC')).toBeVisible();
```

**Option B: Add Different Validation**
```typescript
// Validate app loaded by checking for key elements
await expect(page.locator('[role="navigation"]')).toBeVisible();
await expect(page.locator('text=Content')).toBeVisible();
await expect(page.locator('text=Reports')).toBeVisible();
```

#### Files to Modify
```
e2e-tests/tests/module-federation.spec.ts
  - Line 11: Remove or replace assertion
```

#### Verification Steps
1. Remove or update the assertion
2. Run: `cd e2e-tests && npm test -- tests/module-federation.spec.ts:8`
3. Verify test "should load main application shell" passes

---

## Medium Priority Issues (Priority 2)

### Issue #4: Button Selector Too Broad

**Priority:** 🟡 Medium
**Tests Affected:** 1
**Category:** Selector Issue
**Estimated Effort:** 15 minutes

#### Description
Test uses a broad `button` selector that matches 10 buttons instead of the specific "Generate Report" button it's looking for.

#### Affected Tests
1. `tests/module-federation.spec.ts:103-115` - "should load different versions of shared components"

#### Current Behavior
```typescript
// Line 111 - tests/module-federation.spec.ts
await page.click('text=Reports');
await expect(page.locator('button')).toHaveCount(1); // Generate Report button
// ❌ FAILS: Expected 1, found 10 buttons
```

#### Expected Behavior
- Should only count/check for the specific "Generate Report" button
- Other buttons (sidebar nav, action buttons, etc.) should be ignored

#### Screenshot Evidence
See: `test-results/module-federation-Module-F-0112b-rsions-of-shared-components-chromium/test-failed-1.png`
Shows multiple buttons in UI (Upload, Grid/List toggle, etc.)

#### Proposed Fix

**Option A: Specific Button Text Selector** (Recommended)
```typescript
// tests/module-federation.spec.ts:111
// OLD:
await expect(page.locator('button')).toHaveCount(1);

// NEW:
await expect(page.locator('button:has-text("Generate Report")')).toBeVisible();
// OR if testing count is important:
await expect(page.locator('button:has-text("Generate Report")')).toHaveCount(1);
```

**Option B: Scoped Selector**
```typescript
// Scope to specific area
await expect(
  page.locator('[data-testid="reports-content"] button')
).toHaveCount(1);
```

**Option C: Test ID Approach**
Add `data-testid="generate-report-btn"` to the button:
```typescript
await expect(page.locator('[data-testid="generate-report-btn"]')).toBeVisible();
```

#### Files to Modify
```
e2e-tests/tests/module-federation.spec.ts
  - Line 111: Make button selector more specific
```

#### Verification Steps
1. Update button selector
2. Run: `cd e2e-tests && npm test -- tests/module-federation.spec.ts:103`
3. Verify test passes

---

### Issue #5: HMR Runtime Not Detected

**Priority:** 🟡 Medium
**Tests Affected:** 1
**Category:** Feature Detection
**Estimated Effort:** 30 minutes

#### Description
Test checks for Hot Module Replacement (HMR) runtime but detection fails even though HMR may be working.

#### Affected Tests
1. `tests/module-federation.spec.ts:161-177` - "should support hot module replacement during development"

#### Current Behavior
```typescript
// Line 162-175 - tests/module-federation.spec.ts
const hasHmrRuntime = await page.evaluate(() => {
  return typeof (window as any).module?.hot !== 'undefined' ||
         typeof (window as any).webpackHotUpdate !== 'undefined';
});

if (process.env.NODE_ENV !== 'production') {
  expect(hasHmrRuntime).toBe(true);
  // ❌ FAILS: hasHmrRuntime is false
}
```

#### Root Cause Analysis
Possible reasons:
1. HMR is working but uses different global variables in webpack 5 + Module Federation 2.0
2. Detection logic needs updating for new webpack version
3. HMR is disabled in the current development mode
4. Test runs against production build instead of dev build

#### Proposed Fix

**Option A: Update Detection Logic** (Recommended)
```typescript
// tests/module-federation.spec.ts:162-175
const hasHmrRuntime = await page.evaluate(() => {
  // Check multiple possible HMR indicators
  return (
    typeof (window as any).module?.hot !== 'undefined' ||
    typeof (window as any).webpackHotUpdate !== 'undefined' ||
    typeof (window as any).__webpack_require__?.hmrM !== 'undefined' ||
    typeof (window as any).__webpack_module_cache__ !== 'undefined'
  );
});

// Only check in actual dev mode
const isDevMode = await page.evaluate(() => {
  return location.hostname === 'localhost' && location.port !== '';
});

if (isDevMode && process.env.NODE_ENV !== 'production') {
  expect(hasHmrRuntime).toBe(true);
}
```

**Option B: Skip in Certain Conditions**
```typescript
// Skip test if not in dev mode with HMR enabled
test.skip(
  process.env.NODE_ENV === 'production',
  'HMR only available in development mode'
);
```

**Option C: Console Log Check**
```typescript
// Check for HMR-related console messages
const hmrLogs = [];
page.on('console', msg => {
  if (msg.text().includes('[HMR]') || msg.text().includes('hot update')) {
    hmrLogs.push(msg.text());
  }
});

// Trigger a change and check for HMR activity
// ...
expect(hmrLogs.length).toBeGreaterThan(0);
```

#### Files to Modify
```
e2e-tests/tests/module-federation.spec.ts
  - Lines 162-177: Update HMR detection logic or skip conditions
```

#### Verification Steps
1. Check if services are running in dev mode with HMR enabled
2. Update detection logic
3. Run: `cd e2e-tests && npm test -- tests/module-federation.spec.ts:161`
4. Verify test passes or is properly skipped

---

## Low Priority Issues (Priority 3)

### Issue #6: Type Distribution Script Paths

**Priority:** 🟢 Low
**Tests Affected:** 4
**Category:** Configuration
**Estimated Effort:** 1 hour

#### Description
Type distribution tests fail for content-platform/shell due to missing or incorrectly configured type fetching scripts and directory structures.

#### Affected Tests
1. `tests/type-distribution.spec.ts:41` - "should have type fetching script in all consumers"
2. `tests/type-distribution.spec.ts:97` - "should extract types to consumer @mf-types directory after fetch"
3. `tests/type-distribution.spec.ts:131` - "should have TypeScript IntelliSense for federated components"
4. `tests/type-distribution.spec.ts:243` - "should fetch types quickly in development"

#### Current Behavior
Tests check for `scripts/fetch-types.js` in all consumer packages but content-platform/shell may be missing it or have different configuration.

#### Root Cause
- content-platform/shell might not need type fetching (if it doesn't consume federated types)
- Script path might be different
- Directory structure might not match expectations

#### Proposed Fix

**Option A: Add Missing Script to content-platform/shell**
```bash
# Copy fetch-types.js from another consumer
cp reports-tab/scripts/fetch-types.js content-platform/shell/scripts/
```

Update `content-platform/shell/package.json`:
```json
{
  "scripts": {
    "fetch:types": "node scripts/fetch-types.js",
    "prebuild:prod": "npm run fetch:types"
  }
}
```

**Option B: Exclude content-platform/shell from Type Tests**
```typescript
// tests/type-distribution.spec.ts:41
const consumers = [
  'reports-tab',
  'user-tab',
  'hubs-tab',
  'content-platform/files-folders',
  // Exclude: 'content-platform/shell', // Doesn't consume federated types
];
```

**Option C: Add Conditional Logic**
```typescript
// tests/type-distribution.spec.ts:41
for (const consumer of consumers) {
  const packageJson = JSON.parse(
    fs.readFileSync(`${consumer}/package.json`, 'utf-8')
  );

  // Check if consumer actually needs type fetching
  const needsTypes = packageJson.dependencies?.['@modular-platform/shared-components'];

  if (needsTypes) {
    const scriptPath = path.join(consumer, 'scripts', 'fetch-types.js');
    expect(fs.existsSync(scriptPath)).toBe(true);
  }
}
```

#### Files to Modify
```
content-platform/shell/package.json
  - Add fetch:types script
  - Add prebuild:prod hook

content-platform/shell/scripts/fetch-types.js
  - Create script (copy from reports-tab)

OR

e2e-tests/tests/type-distribution.spec.ts
  - Lines 41, 97, 131, 243: Add conditional logic or exclusions
```

#### Verification Steps
1. Implement chosen fix
2. Run: `cd e2e-tests && npm test -- tests/type-distribution.spec.ts`
3. Verify all 14 type distribution tests pass

---

## Bulk Fix Script

To speed up fixing all text-based issues, here's a suggested bash script:

```bash
#!/bin/bash
# fix-e2e-tests.sh

set -e

echo "Fixing E2E test text expectations..."

# Issue #1: Modular Platform → Box Platform
sed -i '' "s/toContainText('Modular Platform')/toContainText('Box Platform')/g" \
  e2e-tests/tests/module-federation.spec.ts

# Issue #2: Content Platform → Files & Folders
sed -i '' "s/text=Content Platform/text=Files \& Folders/g" \
  e2e-tests/tests/state-sharing.spec.ts \
  e2e-tests/tests/tab-contract.spec.ts

# Issue #3: Remove Module Federation 2.0 PoC line
sed -i '' "/text=Module Federation 2.0 PoC/d" \
  e2e-tests/tests/module-federation.spec.ts

# Issue #4: Fix button selector
sed -i '' "s/page.locator('button')).toHaveCount(1)/page.locator('button:has-text(\"Generate Report\")')).toBeVisible()/g" \
  e2e-tests/tests/module-federation.spec.ts

echo "✅ Bulk fixes applied!"
echo "Next: Review changes and run tests"
```

---

## Testing Strategy After Fixes

### Phase 1: Individual Test Suite Validation
```bash
# Test each suite independently
cd e2e-tests

# Module Federation (expect 9-10/10 passing after fixes)
npm test -- tests/module-federation.spec.ts

# State Sharing (expect 15/15 passing after fixes)
npm test -- tests/state-sharing.spec.ts

# Tab Contract (expect 15/15 passing after fixes)
npm test -- tests/tab-contract.spec.ts

# Type Distribution (expect 13-14/14 passing after fixes)
npm test -- tests/type-distribution.spec.ts
```

### Phase 2: Full Test Suite
```bash
# Run all tests
npm test

# Expected result: 52-54/54 passing (96-100%)
```

### Phase 3: CI/CD Integration
Once tests are fixed:
1. Add to GitHub Actions workflow
2. Run on every PR
3. Block merges if tests fail
4. Generate and publish test reports

---

## Prevention Strategy

To prevent similar issues in the future:

### 1. Keep Tests in Sync with UI Changes
```typescript
// Add constants for frequently used text
// e2e-tests/constants.ts
export const APP_CONSTANTS = {
  APP_NAME: 'Box Platform',
  TABS: {
    CONTENT: 'Content',
    REPORTS: 'Reports',
    USER: 'User',
  },
  CONTENT_INDICATORS: {
    FILES_FOLDERS: 'Files & Folders',
    HUBS: 'Hubs',
  },
};
```

### 2. Use data-testid Attributes
```tsx
// In React components
<div data-testid="content-area">
  <h2 data-testid="content-title">Files & Folders</h2>
</div>

// In tests
await expect(page.locator('[data-testid="content-area"]')).toBeVisible();
```

### 3. Add Visual Regression Testing
```typescript
// Take screenshots and compare
await expect(page).toHaveScreenshot('main-page.png');
```

### 4. Run Tests in CI/CD
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build:prod
      - run: npm run dev &
      - run: cd e2e-tests && npm test
```

---

## Summary

### Quick Wins (Can Fix in < 1 Hour)
- ✅ Issue #1: Platform name (15 min)
- ✅ Issue #2: Content Platform text (30 min)
- ✅ Issue #3: Remove PoC text (5 min)
- ✅ Issue #4: Button selector (15 min)

**Total: 65 minutes to fix 35 tests** ⚡

### Requires Investigation (1-2 Hours)
- Issue #5: HMR detection (30 min)
- Issue #6: Type distribution (1 hour)

**Total: 1.5 hours to fix 5 tests**

### Overall
- **Total Effort: 2-3 hours**
- **Tests Fixed: 40/40**
- **Expected Pass Rate After Fixes: 96-100%**

---

**Document Version:** 1.0
**Last Updated:** 2025-10-24
**Next Review:** After fixes are applied
