# @platform/contract-tests

Contract testing utilities for validating tab module compliance with platform expectations.

## Overview

Contract tests ensure that federated tab modules conform to the platform's `TabModule` interface without requiring end-to-end integration tests. This package provides:

- ✅ JSON Schema-based validation
- ✅ TypeScript type checking
- ✅ Business rule validation
- ✅ Detailed error reporting
- ✅ Fast, independent tests

## Installation

```bash
npm install --save-dev @platform/contract-tests
```

## Quick Start

### 1. Create Contract Test in Your Tab

```typescript
// src/__tests__/contract.test.ts
import { validateTabModuleContract, formatValidationErrors } from '@platform/contract-tests';
import tabModule from '../plugin'; // Your tab's plugin export

describe('Tab Contract Compliance', () => {
  it('should comply with platform contract', () => {
    const result = validateTabModuleContract(tabModule);

    if (!result.valid) {
      console.error(formatValidationErrors(result.errors));
    }

    expect(result.valid).toBe(true);
  });
});
```

### 2. Run Contract Tests

```bash
npm test -- contract.test.ts
```

### 3. Add to CI

```json
// package.json
{
  "scripts": {
    "test:contract": "jest --testMatch='**/*.contract.test.ts'"
  }
}
```

## Contract Testing Principles

### 1. Consumer-Driven Contracts

The **shell** (consumer) defines the contract. Tabs (providers) validate against it.

```
┌────────────────────────┐
│  Shell (Consumer)      │
│  - Defines contract    │
│  - Expects TabModule   │
└────────────────────────┘
           │
           │ contract
           ↓
┌────────────────────────┐
│  Tab (Provider)        │
│  - Implements TabModule│
│  - Validates compliance│
└────────────────────────┘
```

### 2. Type-Derived Schema

The contract is derived from TypeScript interfaces in `@content-platform/tab-contract`. No manual schema maintenance.

### 3. Independent Verification

Tab tests run in complete isolation. No running shell required. Fast and reliable.

### 4. Automated in CI/CD

Contract tests run on every PR. Breaking changes are caught automatically.

## API Reference

### `validateTabModuleContract(tabModule)`

Full contract compliance check. Runs all validators.

```typescript
import { validateTabModuleContract } from '@platform/contract-tests';

const result = validateTabModuleContract(myTabModule);
// Returns: { valid: boolean, errors: Record<string, string[]> }
```

**Example:**

```typescript
const result = validateTabModuleContract({
  id: 'my-tab',
  title: 'My Tab',
  Component: MyTabComponent,
});

if (!result.valid) {
  // result.errors = {
  //   structure: ['...'],
  //   component: ['...'],
  //   id: ['...']
  // }
}
```

### `validateTabModuleStructure(tabModule)`

Validates basic structure using JSON Schema.

```typescript
const result = validateTabModuleStructure(tabModule);
// Returns: { valid: boolean, errors: string[] }
```

**Checks:**
- Required fields present (id, title, Component)
- No extra properties
- Types match schema

### `validateTabModuleComponent(tabModule)`

Validates the Component property.

```typescript
const result = validateTabModuleComponent(tabModule);
```

**Checks:**
- Component exists
- Component is a function (React component)

### `validateTabModuleIcon(tabModule)`

Validates the optional icon property.

```typescript
const result = validateTabModuleIcon(tabModule);
```

**Checks:**
- If icon present, it must be a function (React component)

### `validateTabModuleId(tabModule)`

Validates the ID format.

```typescript
const result = validateTabModuleId(tabModule);
```

**Checks:**
- Lowercase only
- Starts with a letter
- Contains only letters, numbers, and hyphens
- Matches pattern: `^[a-z][a-z0-9-]*$`

### `formatValidationErrors(errors)`

Formats validation errors for display.

```typescript
const formatted = formatValidationErrors(result.errors);
console.error(formatted);
// Output:
// structure:
//   - /id must match pattern "^[a-z][a-z0-9-]*$"
//
// component:
//   - Component must be a function (React component)
```

## Complete Test Example

```typescript
// src/__tests__/contract.test.ts
import type { TabModule } from '@content-platform/tab-contract';
import {
  validateTabModuleContract,
  validateTabModuleStructure,
  validateTabModuleComponent,
  validateTabModuleId,
  formatValidationErrors,
} from '@platform/contract-tests';
import tabModule from '../plugin';

describe('FilesTab Contract Compliance', () => {
  // Full compliance test
  describe('Full Contract', () => {
    it('should pass all contract validation checks', () => {
      const result = validateTabModuleContract(tabModule);

      if (!result.valid) {
        console.error('Contract validation failed:');
        console.error(formatValidationErrors(result.errors));
      }

      expect(result.valid).toBe(true);
    });
  });

  // Detailed tests
  describe('Structure', () => {
    it('should have all required fields', () => {
      const result = validateTabModuleStructure(tabModule);
      expect(result.valid).toBe(true);
    });

    it('should not have extra properties', () => {
      const keys = Object.keys(tabModule);
      const allowedKeys = ['id', 'title', 'Component', 'icon'];
      const extraKeys = keys.filter(k => !allowedKeys.includes(k));
      expect(extraKeys).toEqual([]);
    });
  });

  describe('Component', () => {
    it('should have a Component that is a React function', () => {
      const result = validateTabModuleComponent(tabModule);
      expect(result.valid).toBe(true);
      expect(typeof tabModule.Component).toBe('function');
    });

    it('should render without errors', () => {
      // Optional: Test that component can render
      expect(() => tabModule.Component({})).not.toThrow();
    });
  });

  describe('ID', () => {
    it('should have a valid lowercase hyphenated id', () => {
      const result = validateTabModuleId(tabModule);
      expect(result.valid).toBe(true);
    });

    it('should have a descriptive id', () => {
      expect(tabModule.id.length).toBeGreaterThan(2);
      expect(tabModule.id).toMatch(/^[a-z][a-z0-9-]*$/);
    });
  });

  describe('Title', () => {
    it('should have a non-empty title', () => {
      expect(tabModule.title.length).toBeGreaterThan(0);
    });

    it('should have a trimmed title', () => {
      expect(tabModule.title.trim()).toBe(tabModule.title);
    });
  });

  // Custom business rules
  describe('Business Rules', () => {
    it('should follow naming conventions', () => {
      // Example: ID should match title in some way
      const normalizedTitle = tabModule.title.toLowerCase().replace(/\s+/g, '-');
      expect(tabModule.id).toContain(normalizedTitle.split('-')[0]);
    });
  });
});
```

## Breaking Change Detection

Contract tests automatically detect breaking changes in tabs:

### Scenario: Tab Renames a Required Field

**Before:**
```typescript
export default {
  id: 'files',
  title: 'Files',  // ✅ Valid
  Component: FilesTab
};
```

**After (Breaking Change):**
```typescript
export default {
  id: 'files',
  label: 'Files',  // ❌ Breaking: renamed title → label
  Component: FilesTab
};
```

**Test Result:**
```
FAIL src/__tests__/contract.test.ts
  ✕ should pass all contract validation checks

  Contract validation failed:
  structure:
    - / must have required property 'title'
    - / must NOT have additional properties (label)
```

**CI blocks the PR automatically.**

### Scenario: Tab Adds Extra Property

**Before:**
```typescript
export default {
  id: 'files',
  title: 'Files',
  Component: FilesTab
};
```

**After (Breaking Change):**
```typescript
export default {
  id: 'files',
  title: 'Files',
  Component: FilesTab,
  customProp: 'value'  // ❌ Breaking: extra property
};
```

**Test Result:**
```
FAIL src/__tests__/contract.test.ts
  ✕ should pass all contract validation checks

  Contract validation failed:
  structure:
    - / must NOT have additional properties (customProp)
```

## CI/CD Integration

### Provider (Tab) CI Workflow

Contract tests run as part of the normal test suite:

```yaml
# .github/workflows/tab-ci.yml
name: Files Tab CI

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test  # Includes contract tests
```

### Add Contract Test to Package Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:contract": "jest --testMatch='**/*.contract.test.ts'",
    "test:watch": "jest --watch",
    "test:ci": "npm run test:contract && npm test"
  }
}
```

## Contract Evolution

When the platform contract changes, tabs must update to comply.

### Adding Optional Field (Non-Breaking)

**Platform adds optional field to TabModule:**
```typescript
interface TabModule {
  id: string;
  title: string;
  Component: React.ComponentType;
  icon?: React.ComponentType;
  badge?: string;  // New optional field
}
```

**Tab behavior:**
- ✅ Existing tabs continue to pass (field is optional)
- ✅ New tabs can adopt the new field

### Adding Required Field (Breaking)

**Platform adds required field:**
```typescript
interface TabModule {
  id: string;
  title: string;
  Component: React.ComponentType;
  icon?: React.ComponentType;
  category: string;  // New REQUIRED field
}
```

**Tab behavior:**
- ❌ Existing tabs fail contract tests
- ⚠️ Tabs must add the field to comply

**Migration process:**
1. Platform team announces breaking change
2. Tab teams add the required field
3. Contract tests pass
4. Deploy new versions

### Renaming Field (Breaking)

**Platform renames field:**
```typescript
interface TabModule {
  id: string;
  label: string;    // Renamed from 'title'
  Component: React.ComponentType;
}
```

**Tab behavior:**
- ❌ All tabs fail contract tests
- ⚠️ Tabs must rename field

**Migration strategy:**
1. Coordinate migration across all teams
2. Or maintain backwards compatibility during transition period

## Testing Tips

### 1. Test Against Real Tab Module

```typescript
import tabModule from '../plugin';  // Real module

describe('Contract', () => {
  it('validates', () => {
    expect(validateTabModuleContract(tabModule).valid).toBe(true);
  });
});
```

### 2. Add Custom Business Rules

```typescript
it('should follow team conventions', () => {
  // Custom rule: ID must include team name
  expect(tabModule.id).toContain('content');
});
```

### 3. Test Component Rendering

```typescript
import { render } from '@testing-library/react';

it('component renders without errors', () => {
  expect(() => render(<tabModule.Component />)).not.toThrow();
});
```

### 4. Snapshot Test Contract

```typescript
it('matches contract snapshot', () => {
  const { Component, ...serializableModule } = tabModule;
  expect(serializableModule).toMatchSnapshot();
});
```

## Architecture

```
@platform/contract-tests
├── src/
│   ├── validators.ts                  # Validation functions
│   ├── index.ts                       # Public API
│   └── __tests__/
│       └── example.contract.test.ts   # Example test
├── schemas/
│   └── TabModule.schema.json          # Generated JSON Schema
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Related Packages

- `@content-platform/tab-contract` - TypeScript interface definition
- `@platform/context` - Platform context for tabs
- `@platform/shared-state` - Redux state management
- `@content-platform/data` - GraphQL data access

## FAQs

### Q: Do I need to write contract tests for every tab?

**A:** Yes. Contract tests are mandatory for all federated tabs. They prevent breaking changes from reaching production.

### Q: What if my tab needs custom properties?

**A:** Contract only validates the required structure. You can extend your module with custom properties, but they should not be part of the core TabModule interface. Consider using a separate configuration object.

### Q: Can I skip contract tests during local development?

**A:** You can, but they will fail in CI. Better to run them locally to catch issues early.

### Q: How do I test components that require context?

**A:** Contract tests focus on structure. For component functionality, use separate integration tests with proper context providers.

### Q: What's the difference between contract tests and E2E tests?

**A:** Contract tests validate the interface (structure, types). E2E tests validate behavior (clicking, rendering, user flows). Both are valuable but serve different purposes.

## License

MIT
