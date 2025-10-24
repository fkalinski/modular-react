/**
 * Example Contract Test
 *
 * This is an example of how tabs should test their compliance with the platform contract.
 * Each tab should copy this test pattern to their own codebase.
 *
 * Location in tab: src/__tests__/contract.test.ts
 */

import type { TabModule } from '@content-platform/tab-contract';
import {
  validateTabModuleContract,
  formatValidationErrors,
  validateTabModuleStructure,
  validateTabModuleComponent,
  validateTabModuleIcon,
  validateTabModuleId,
} from '../validators';

/**
 * EXAMPLE: Mock tab module for testing
 *
 * In actual tab implementations, import the real tab module:
 * import tabModule from '../plugin';
 */
const mockTabModule: TabModule = {
  id: 'example-tab',
  title: 'Example Tab',
  Component: () => null, // Mock React component
  icon: () => null, // Mock icon component (optional)
};

describe('TabModule Contract Compliance', () => {
  describe('Full Contract Validation', () => {
    it('should pass full contract compliance check', () => {
      const result = validateTabModuleContract(mockTabModule);

      if (!result.valid) {
        console.error('Validation errors:', formatValidationErrors(result.errors));
      }

      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });
  });

  describe('Structure Validation', () => {
    it('should have all required fields', () => {
      const result = validateTabModuleStructure(mockTabModule);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject module missing id', () => {
      const invalidModule = { ...mockTabModule };
      delete (invalidModule as any).id;

      const result = validateTabModuleStructure(invalidModule);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject module missing title', () => {
      const invalidModule = { ...mockTabModule };
      delete (invalidModule as any).title;

      const result = validateTabModuleStructure(invalidModule);

      expect(result.valid).toBe(false);
    });

    it('should reject module with extra properties', () => {
      const invalidModule = {
        ...mockTabModule,
        extraProperty: 'not allowed',
      };

      const result = validateTabModuleStructure(invalidModule);

      expect(result.valid).toBe(false);
    });
  });

  describe('Component Validation', () => {
    it('should have a Component property that is a function', () => {
      const result = validateTabModuleComponent(mockTabModule);

      expect(result.valid).toBe(true);
      expect(typeof mockTabModule.Component).toBe('function');
    });

    it('should reject module with non-function Component', () => {
      const invalidModule = {
        ...mockTabModule,
        Component: 'not a function' as any,
      };

      const result = validateTabModuleComponent(invalidModule);

      expect(result.valid).toBe(false);
    });
  });

  describe('Icon Validation', () => {
    it('should accept module without icon', () => {
      const moduleWithoutIcon = { ...mockTabModule };
      delete moduleWithoutIcon.icon;

      const result = validateTabModuleIcon(moduleWithoutIcon);

      expect(result.valid).toBe(true);
    });

    it('should accept module with icon function', () => {
      const result = validateTabModuleIcon(mockTabModule);

      expect(result.valid).toBe(true);
    });

    it('should reject module with non-function icon', () => {
      const invalidModule = {
        ...mockTabModule,
        icon: 'not a function' as any,
      };

      const result = validateTabModuleIcon(invalidModule);

      expect(result.valid).toBe(false);
    });
  });

  describe('ID Validation', () => {
    it('should accept lowercase hyphenated id', () => {
      const result = validateTabModuleId(mockTabModule);

      expect(result.valid).toBe(true);
    });

    it('should reject id with uppercase letters', () => {
      const invalidModule = {
        ...mockTabModule,
        id: 'ExampleTab',
      };

      const result = validateTabModuleId(invalidModule);

      expect(result.valid).toBe(false);
    });

    it('should reject id with special characters', () => {
      const invalidModule = {
        ...mockTabModule,
        id: 'example_tab',
      };

      const result = validateTabModuleId(invalidModule);

      expect(result.valid).toBe(false);
    });

    it('should reject id starting with number', () => {
      const invalidModule = {
        ...mockTabModule,
        id: '1example',
      };

      const result = validateTabModuleId(invalidModule);

      expect(result.valid).toBe(false);
    });

    it('should accept id with numbers after first character', () => {
      const validModule = {
        ...mockTabModule,
        id: 'example2-tab',
      };

      const result = validateTabModuleId(validModule);

      expect(result.valid).toBe(true);
    });
  });

  describe('Business Logic Validation', () => {
    it('should have a meaningful title', () => {
      expect(mockTabModule.title.length).toBeGreaterThan(0);
      expect(mockTabModule.title.trim()).toBe(mockTabModule.title);
    });

    it('should have id matching the module purpose', () => {
      // Business rule: ID should be descriptive
      expect(mockTabModule.id.length).toBeGreaterThan(2);
    });
  });
});

/**
 * HOW TO USE IN YOUR TAB:
 *
 * 1. Install dependencies:
 *    npm install --save-dev @platform/contract-tests
 *
 * 2. Copy this file to your tab's __tests__ directory:
 *    src/__tests__/contract.test.ts
 *
 * 3. Replace the mock with your actual tab module:
 *    import tabModule from '../plugin';
 *
 * 4. Replace mockTabModule with tabModule in all tests
 *
 * 5. Run tests:
 *    npm test -- contract.test.ts
 *
 * 6. Add to CI:
 *    Add "test:contract": "jest contract.test.ts" to package.json
 */
