import Ajv from 'ajv';
import type { TabModule } from '@content-platform/tab-contract';

/**
 * Contract Validators
 *
 * These validators check if a tab module implementation complies with the platform contract.
 */

const ajv = new Ajv({ allErrors: true, verbose: true });

/**
 * Tab Module Schema
 *
 * This schema defines the expected structure of a TabModule.
 * It's a JSON Schema representation of the TypeScript TabModule interface.
 */
export const TabModuleSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['id', 'title', 'Component'],
  properties: {
    id: {
      type: 'string',
      pattern: '^[a-z][a-z0-9-]*$',
      description: 'Unique identifier (lowercase, hyphens allowed)',
    },
    title: {
      type: 'string',
      minLength: 1,
      description: 'Display title for the tab',
    },
    icon: {
      description: 'Optional icon component (validated separately)',
    },
    // Note: Component is a function, can't be validated by JSON Schema
    // We validate it separately in the compliance tests
  },
  additionalProperties: false,
};

/**
 * Validate tab module structure
 *
 * @param tabModule - The tab module to validate
 * @returns Validation result with errors if any
 */
export const validateTabModuleStructure = (
  tabModule: unknown
): { valid: boolean; errors: string[] } => {
  const validate = ajv.compile(TabModuleSchema);
  const valid = validate(tabModule);

  if (!valid && validate.errors) {
    return {
      valid: false,
      errors: validate.errors.map(err => `${err.instancePath} ${err.message}`),
    };
  }

  return { valid: true, errors: [] };
};

/**
 * Validate tab module component
 *
 * Component must be a React component (function or class)
 */
export const validateTabModuleComponent = (
  tabModule: TabModule
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Component must exist
  if (!tabModule.Component) {
    errors.push('Component is required');
  }

  // Component must be a function (React component)
  if (typeof tabModule.Component !== 'function') {
    errors.push('Component must be a function (React component)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate tab module icon (if present)
 *
 * Icon must be a React component if provided
 */
export const validateTabModuleIcon = (
  tabModule: TabModule
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (tabModule.icon) {
    if (typeof tabModule.icon !== 'function') {
      errors.push('Icon must be a function (React component) if provided');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate tab module ID format
 *
 * ID must be lowercase with hyphens only
 */
export const validateTabModuleId = (
  tabModule: TabModule
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const idPattern = /^[a-z][a-z0-9-]*$/;

  if (!idPattern.test(tabModule.id)) {
    errors.push(
      'ID must be lowercase, start with a letter, and contain only letters, numbers, and hyphens'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Full tab module contract compliance check
 *
 * Runs all validation checks and returns aggregated results
 */
export const validateTabModuleContract = (
  tabModule: unknown
): { valid: boolean; errors: Record<string, string[]> } => {
  const allErrors: Record<string, string[]> = {};

  // Structure validation
  const structureResult = validateTabModuleStructure(tabModule);
  if (!structureResult.valid) {
    allErrors.structure = structureResult.errors;
  }

  // If structure is invalid, can't proceed with other checks
  if (!structureResult.valid) {
    return { valid: false, errors: allErrors };
  }

  const module = tabModule as TabModule;

  // Component validation
  const componentResult = validateTabModuleComponent(module);
  if (!componentResult.valid) {
    allErrors.component = componentResult.errors;
  }

  // Icon validation
  const iconResult = validateTabModuleIcon(module);
  if (!iconResult.valid) {
    allErrors.icon = iconResult.errors;
  }

  // ID validation
  const idResult = validateTabModuleId(module);
  if (!idResult.valid) {
    allErrors.id = idResult.errors;
  }

  return {
    valid: Object.keys(allErrors).length === 0,
    errors: allErrors,
  };
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: Record<string, string[]>): string => {
  return Object.entries(errors)
    .map(([category, msgs]) => {
      return `${category}:\n  - ${msgs.join('\n  - ')}`;
    })
    .join('\n\n');
};
