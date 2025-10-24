# E2E Test Execution Guide

## Overview

This guide explains how to run the E2E tests for the Modular React Platform. The test suite includes 58 tests across 4 suites validating Module Federation, Tab Contracts, State Sharing, and Type Distribution.

## Environment Limitations

### Network Restrictions in Some Environments

The Playwright browser download may fail with 403 errors in environments with network restrictions:

```
Error: Download failed: server returned code 403
URL: https://playwright.download.prss.microsoft.com/...
```

**Workarounds:**

1. **Pre-installed Browsers (CI/CD):**
   ```yaml
   # GitHub Actions
   - name: Install Playwright
     run: npx playwright install --with-deps chromium
   ```

2. **Docker with Pre-downloaded Browsers:**
   ```dockerfile
   FROM mcr.microsoft.com/playwright:v1.40.0-focal
   WORKDIR /app
   COPY . .
   RUN npm install
   CMD ["npm", "test"]
   ```

3. **Local Development:**
   ```bash
   # Download browsers in unrestricted network
   npx playwright install chromium

   # Or use system browser
   npx playwright test --browser=chromium --channel=chrome
   ```

## Running Tests Locally

### Prerequisites

1. **Install Dependencies:**
   ```bash
   cd e2e-tests
   npm install
   ```

2. **Install Playwright Browsers:**
   ```bash
   npx playwright install chromium
   ```

   If you encounter 403 errors:
   ```bash
   # Try with full dependencies
   npx playwright install --with-deps chromium

   # Or use Docker
   docker run --rm --network host -v $(pwd):/work/ -w /work/ -it mcr.microsoft.com/playwright:v1.40.0-focal /bin/bash
   npm test
   ```

3. **Build All Projects:**
   ```bash
   cd ..
   npm run build:prod
   ```

4. **Start All Services:**
   ```bash
   # Option 1: Use script (if available)
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

5. **Wait for Services:**
   ```bash
   # Wait for main shell to be ready
   curl --retry 10 --retry-delay 2 http://localhost:3000
   ```

### Running Tests

**All Tests:**
```bash
cd e2e-tests
npm test
```

**Specific Suite:**
```bash
npm run test:module-federation
npm run test:tab-contract
npm run test:state-sharing
npm run test:type-distribution
```

**With UI Mode (Interactive):**
```bash
npm run test:ui
```

**Debug Mode:**
```bash
npm run test:debug
```

**Headed Mode (See Browser):**
```bash
npm run test:headed
```

**Generate HTML Report:**
```bash
npm run test:report
```

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install root dependencies
        run: npm install

      - name: Install E2E test dependencies
        run: cd e2e-tests && npm install

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Build all modules
        run: npm run build:prod

      - name: Start services
        run: |
          npm run dev &
          # Wait for services to be ready
          npx wait-on http://localhost:3000 http://localhost:3001 --timeout 60000

      - name: Run E2E tests
        run: cd e2e-tests && npm test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: e2e-tests/playwright-report/
          retention-days: 30

      - name: Upload test screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: e2e-tests/test-results/
          retention-days: 7
```

### Using Docker

**Dockerfile for E2E Tests:**

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY e2e-tests/package*.json ./e2e-tests/

# Install dependencies
RUN npm install
RUN cd e2e-tests && npm install

# Copy source code
COPY . .

# Build all modules
RUN npm run build:prod

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Run tests
CMD ["sh", "-c", "npm run dev & npx wait-on http://localhost:3000 --timeout 60000 && cd e2e-tests && npm test"]
```

**Run with Docker Compose:**

```yaml
version: '3.8'

services:
  e2e-tests:
    build: .
    ports:
      - "3000:3000"
      - "3001-3007:3001-3007"
    volumes:
      - ./e2e-tests/playwright-report:/app/e2e-tests/playwright-report
      - ./e2e-tests/test-results:/app/e2e-tests/test-results
    environment:
      - CI=true
```

Run:
```bash
docker-compose up --abort-on-container-exit
```

## Test Suites

### 1. Module Federation Tests (10 tests)

**What it validates:**
- Remote module loading
- Shared component federation
- React singleton across modules
- Nested federation (Content platform)
- Error handling

**Expected output:**
```
✓ should load main application shell
✓ should load shared components from remote
✓ should load Reports tab as federated module
✓ should load User tab as federated module
✓ should load Content platform as nested federated module
✓ should handle remote module loading errors gracefully
✓ should share React singleton across all modules
```

### 2. Tab Contract Tests (15 tests)

**What it validates:**
- TabPlugin interface implementation
- Context propagation (filters, selection, navigation)
- Lifecycle hooks (onActivate, onDeactivate)
- Version compatibility
- Actions and callbacks

**Expected output:**
```
✓ should load Files tab plugin
✓ should load Hubs tab plugin from external repo
✓ should pass correct context to tabs
✓ should handle tab activation/deactivation
✓ should validate tab configuration
```

### 3. State Sharing Tests (15 tests)

**What it validates:**
- Redux state synchronization
- Filter state across tabs
- Selection state management
- Dynamic reducer injection
- Concurrent updates

**Expected output:**
```
✓ should share filter state across tabs
✓ should sync selection state
✓ should inject dynamic reducers
✓ should handle concurrent updates
✓ should preserve state during tab switches
```

### 4. Type Distribution Tests (18 tests)

**What it validates:**
- Type packaging (@mf-types.zip creation)
- Type fetching (fetch-types.js execution)
- Prebuild hooks
- TypeScript configuration
- Type extraction and validation
- Build-time type safety
- Type consistency across repos

**Expected output:**
```
✓ should have type packaging script in shared-components
✓ should generate @mf-types.zip after build
✓ should have type fetching script in all consumers
✓ should have prebuild hooks in all consumer package.json
✓ should have @mf-types in TypeScript config
✓ should extract types to consumer @mf-types directory after fetch
✓ should have TypeScript IntelliSense for federated components
✓ should not have TypeScript module resolution errors
✓ should use consistent types across all consumers
```

## Troubleshooting

### Browser Download Fails (403 Error)

**Problem:**
```
Error: Download failed: server returned code 403
```

**Solutions:**

1. **Use Docker:**
   ```bash
   docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.40.0-focal npm test
   ```

2. **Use System Browser:**
   ```bash
   npm test -- --browser=chromium --channel=chrome
   ```

3. **Pre-download in Different Network:**
   ```bash
   # On machine with unrestricted network
   npx playwright install chromium

   # Copy browser binaries
   # From: ~/.cache/ms-playwright/
   # To: Target machine same location
   ```

### Tests Timeout

**Problem:**
```
Test timeout of 30000ms exceeded
```

**Solutions:**

1. **Increase Timeout:**
   ```bash
   npm test -- --timeout=60000
   ```

2. **Check Services:**
   ```bash
   # Verify all services are running
   curl http://localhost:3000  # Shell
   curl http://localhost:3001  # Shared components
   curl http://localhost:3002  # Shared data
   # ... etc
   ```

3. **Check Logs:**
   ```bash
   # Review service logs for errors
   tail -f node_modules/.cache/playwright/chromium-*/chrome-linux/debug.log
   ```

### Port Conflicts

**Problem:**
```
Error: listen EADDRINUSE :::3000
```

**Solution:**
```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
# ... for all ports 3000-3007

# Or kill all node processes
killall node
```

### Types Not Found During Tests

**Problem:**
```
Some type distribution tests fail
```

**Solution:**
```bash
# Ensure build has been run to generate types
npm run build:prod

# Check type package exists
ls shared-components/dist/@mf-types.zip

# Manually fetch types
cd hubs-tab && npm run fetch:types
```

## Test Reports

### HTML Report

After running tests:
```bash
npm run test:report
```

Opens browser with:
- Test results summary
- Individual test details
- Screenshots of failures
- Traces for debugging

### JSON Report

Located at: `e2e-tests/test-results/results.json`

```json
{
  "suites": [...],
  "tests": [...],
  "stats": {
    "passed": 58,
    "failed": 0,
    "skipped": 0,
    "duration": 125000
  }
}
```

### Screenshots

Failure screenshots saved to: `e2e-tests/test-results/`

```
test-results/
├── module-federation-should-load-Reports-tab/
│   └── test-failed-1.png
└── state-sharing-should-sync-filters/
    └── test-failed-1.png
```

### Traces

Playwright traces for debugging: `e2e-tests/test-results/*.zip`

View with:
```bash
npx playwright show-trace test-results/trace.zip
```

## Success Criteria

All 58 tests should pass:

- ✅ Module Federation (10/10)
- ✅ Tab Contract (15/15)
- ✅ State Sharing (15/15)
- ✅ Type Distribution (18/18)

This validates:
- Remote modules load correctly
- Tabs follow plugin contract
- State synchronizes across modules
- Types are distributed and work correctly
- No module resolution errors
- Full type safety across repositories

## Performance Benchmarks

Expected test duration:
- Module Federation: ~30 seconds
- Tab Contract: ~45 seconds
- State Sharing: ~45 seconds
- Type Distribution: ~20 seconds
- **Total**: ~2-3 minutes

If tests take significantly longer:
- Check network latency
- Verify services are running locally (not remote)
- Check system resources (CPU, memory)
- Review test logs for bottlenecks

## Next Steps

After tests pass:

1. **Add to CI/CD Pipeline:** Integrate with GitHub Actions
2. **Add More Browsers:** Test on Firefox, WebKit
3. **Add Visual Regression:** Screenshot comparison tests
4. **Add Performance Tests:** Measure load times, bundle sizes
5. **Add Accessibility Tests:** ARIA, keyboard navigation
6. **Add Mobile Tests:** Test on mobile viewports

---

**Documentation Updated:** 2025-10-23
**Test Suite Version:** 1.0.0
**Playwright Version:** 1.40.0
