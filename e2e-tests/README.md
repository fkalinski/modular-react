# E2E Tests for Modular React Platform

End-to-end tests using Playwright to validate the modular architecture.

## Prerequisites

- All services must be running (shared-components, shared-data, shell, tabs)
- Node.js >= 18

## Installation

```bash
cd e2e-tests
npm install
npx playwright install chromium
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
# Module Federation tests
npm run test:module-federation

# Tab Contract tests
npm run test:tab-contract

# State Sharing tests
npm run test:state-sharing
```

### With UI
```bash
npm run test:ui
```

### Debug Mode
```bash
npm run test:debug
```

### Headed Mode (see browser)
```bash
npm run test:headed
```

## Test Coverage

### 1. Module Federation Tests (`module-federation.spec.ts`)

Validates that Module Federation 2.0 works correctly:

- ✅ **Remote Module Loading**: Verifies remoteEntry.js files are loaded from correct ports
- ✅ **Shared Component Federation**: Tests that components load from shared-components (port 3001)
- ✅ **Tab Federation**: Validates Reports, User, and Content tabs load as federated modules
- ✅ **Nested Federation**: Content platform loads Files and Hubs tabs as sub-modules
- ✅ **React Singleton**: Ensures only one React instance across all modules
- ✅ **Version Resolution**: Tests that compatible versions (^1.0.0) resolve correctly
- ✅ **Error Handling**: Verifies graceful degradation when modules fail to load
- ✅ **Dynamic Loading**: Confirms remote modules are loaded on-demand
- ✅ **HMR Support**: Checks Hot Module Replacement configuration

**Key Validations:**
- remoteEntry.js loaded from ports 3001, 3002, 3003, 3004, 3005, 3006, 3007
- Shared components render consistently across all tabs
- No React instance warnings in console
- Lazy loading with Suspense boundaries

### 2. Tab Contract Tests (`tab-contract.spec.ts`)

Validates the TabPlugin contract and extension system:

- ✅ **Plugin Loading**: Files and Hubs tabs load and render correctly
- ✅ **Context Passing**: TabProps provide correct context (filters, selection, navigation)
- ✅ **Callbacks**: onNavigate and onSelect work across module boundaries
- ✅ **Actions**: Tab-specific actions are available and respect context
- ✅ **Lifecycle Hooks**: onActivate and onDeactivate are called
- ✅ **Config Validation**: Tab metadata (id, name, icon, version) is valid
- ✅ **Version Requirements**: componentVersion compatibility is enforced
- ✅ **Independent Repos**: Tabs from different sources integrate seamlessly
- ✅ **Error Boundaries**: Tab failures are isolated
- ✅ **Debug Information**: Platform shows loaded tabs and active state

**Key Validations:**
- Files tab (content-platform monorepo) works
- Hubs tab (external repo) works
- Both tabs use shared components with consistent styling
- Filter context propagates to all tabs
- Actions are disabled based on context state

### 3. State Sharing Tests (`state-sharing.spec.ts`)

Validates Redux state sharing and synchronization:

- ✅ **Filter State Sharing**: Search filters sync across tabs
- ✅ **Selection State**: Selection is tracked and accessible
- ✅ **Navigation State**: Current path and breadcrumbs are maintained
- ✅ **Context Propagation**: Changes propagate immediately to all tabs
- ✅ **PlatformContext**: Context provider distributes state correctly
- ✅ **Event Bus**: Cross-module communication via events
- ✅ **Concurrent Updates**: Redux handles simultaneous updates
- ✅ **State Persistence**: State preserved during tab switches
- ✅ **Reducer Injection**: Dynamic reducers can be added at runtime
- ✅ **Performance**: State updates are batched for efficiency
- ✅ **Immutability**: Redux Toolkit prevents mutation bugs

**Key Validations:**
- Filter applied in Files tab visible in Hubs tab
- Redux state updates trigger re-renders in all consuming components
- No state inconsistencies or race conditions
- State changes are atomic and predictable

## Test Structure

```
e2e-tests/
├── tests/
│   ├── module-federation.spec.ts   # 10 tests
│   ├── tab-contract.spec.ts        # 15 tests
│   └── state-sharing.spec.ts       # 15 tests
├── playwright.config.ts             # Playwright configuration
├── package.json
└── README.md
```

## Running Services

Before running tests, ensure all services are running:

```bash
# Option 1: Use helper script
cd ..
./scripts/dev-all.sh

# Option 2: Start individually
cd shared-components && npm run dev &
cd shared-data && npm run dev &
cd top-level-shell && npm run dev &
cd content-platform/shell && npm run dev &
cd content-platform/files-folders && npm run dev &
cd hubs-tab && npm run dev &
cd reports-tab && npm run dev &
cd user-tab && npm run dev &
```

Wait for all services to be ready (check logs or visit http://localhost:3000).

## Test Reports

After running tests:

```bash
# View HTML report
npm run test:report

# Results are in:
# - test-results/        # Screenshots, traces
# - playwright-report/   # HTML report
```

## CI/CD Integration

For continuous integration:

```yaml
# .github/workflows/e2e-tests.yml
steps:
  - name: Install dependencies
    run: |
      npm install
      cd e2e-tests && npm install
      npx playwright install --with-deps chromium

  - name: Build all modules
    run: |
      cd shared-components && npm run build
      cd shared-data && npm run build
      # ... etc

  - name: Start services
    run: ./scripts/dev-all.sh &

  - name: Wait for services
    run: npx wait-on http://localhost:3000

  - name: Run E2E tests
    run: cd e2e-tests && npm test

  - name: Upload test results
    if: always()
    uses: actions/upload-artifact@v3
    with:
      name: playwright-report
      path: e2e-tests/playwright-report/
```

## Debugging Failed Tests

### View Screenshots
```bash
# Screenshots saved to test-results/ on failure
ls test-results/
```

### View Traces
```bash
# Open trace viewer
npx playwright show-trace test-results/trace.zip
```

### Run Single Test
```bash
npm test -- --grep "should load main application shell"
```

### Increase Timeout
```bash
npm test -- --timeout=60000
```

## Writing New Tests

### Test Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Setup
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.click('text=Button');

    // Act
    await page.locator('input').fill('value');

    // Assert
    await expect(page.locator('text=Result')).toBeVisible();
  });
});
```

### Best Practices

1. **Use data-testid for stable selectors**
   ```typescript
   await page.locator('[data-testid="submit-button"]').click();
   ```

2. **Wait for network idle**
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

3. **Handle async operations**
   ```typescript
   await expect(page.locator('text=Loaded')).toBeVisible({ timeout: 10000 });
   ```

4. **Capture console logs**
   ```typescript
   page.on('console', msg => console.log(msg.text()));
   ```

5. **Test responsive behavior**
   ```typescript
   await page.setViewportSize({ width: 375, height: 667 });
   ```

## Test Metrics

- **Total Tests**: 40
- **Test Suites**: 3
- **Coverage Areas**:
  - Module Federation: 10 tests
  - Tab Contract: 15 tests
  - State Sharing: 15 tests
- **Expected Duration**: ~2-3 minutes (all tests)
- **Browser**: Chromium (can add Firefox, WebKit)

## Known Issues

1. **Timing Sensitivity**: Some tests use `waitForTimeout` which can be flaky
   - **Fix**: Replace with deterministic waits like `waitForResponse` or `waitForSelector`

2. **Service Dependencies**: Tests assume all services are running
   - **Fix**: Use `webServer` in playwright.config.ts to auto-start

3. **State Cleanup**: State might persist between tests
   - **Fix**: Add proper cleanup in `afterEach` hooks

## Future Enhancements

1. **Visual Regression Tests**: Compare screenshots across builds
2. **Performance Tests**: Measure load times, bundle sizes
3. **Accessibility Tests**: Validate ARIA, keyboard navigation
4. **Mobile Tests**: Test on mobile viewports
5. **Cross-Browser**: Add Firefox and WebKit
6. **API Mocking**: Mock GraphQL responses for consistency
7. **Test Data**: Generate test data programmatically
8. **Parallel Execution**: Run tests in parallel for speed

## Troubleshooting

### Tests Timeout
```bash
# Increase global timeout
npm test -- --timeout=60000
```

### Services Not Ready
```bash
# Check if all services are running
curl http://localhost:3000  # Shell
curl http://localhost:3001  # Shared components
curl http://localhost:3002  # Shared data
# ... etc
```

### Port Conflicts
```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9
```

### Playwright Not Installed
```bash
npx playwright install chromium
```

## Success Criteria

All 40 tests should pass, validating:

✅ **Module Federation works end-to-end**
- Remote modules load correctly
- Shared dependencies are singleton
- Version resolution works

✅ **Tab Contract is followed**
- Tabs implement plugin interface
- Context flows to all tabs
- Actions and lifecycle work

✅ **State is shared correctly**
- Redux state synchronizes
- Context propagates changes
- No race conditions

This proves the architecture is production-ready.
