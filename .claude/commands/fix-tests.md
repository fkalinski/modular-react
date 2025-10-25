---
description: Debug and fix failing E2E tests, update test selectors, and ensure the 40-test suite passes.
---

# Fix E2E Tests

The E2E test suite (40 Playwright tests) needs attention.

## Context
This platform has a comprehensive test suite in `/Users/fkalinski/dev/fkalinski/modular-react/e2e-tests/` with:
- Module Federation tests (10 tests)
- Tab Contract tests (15 tests)
- State Sharing tests (15 tests)

Tests may be failing due to:
- UI changes (selectors need updating)
- Component behavior changes
- Module Federation URL changes
- Timing issues (race conditions)

## Task
Please delegate this to the **e2e-test-maintainer** subagent to:

1. **Diagnose failures:**
   - Run the test suite: `cd e2e-tests && npm test`
   - Identify which tests are failing
   - Analyze error messages and screenshots

2. **Fix issues:**
   - Update selectors if UI changed
   - Fix timing issues with proper waitFor
   - Update assertions if behavior changed
   - Add new tests if features were added

3. **Validate fixes:**
   - Ensure all 40 tests pass
   - No flaky tests (run multiple times)
   - Tests are meaningful and maintainable

## Available Tools
The e2e-test-maintainer has access to:
- Playwright MCP for interactive debugging
- All E2E test files
- Development environment (services must be running)

## Prerequisites
All services must be running:
```bash
./scripts/dev-all.sh
```

## Success Criteria
- All 40 tests pass consistently
- Test code is clean and maintainable
- No console errors during test execution
- Screenshots/traces available for any issues

Use the **dev-workflow** skill to ensure services are running before starting tests.
