/**
 * @platform/contract-tests
 *
 * Contract testing utilities for tab compliance
 *
 * Usage:
 * import { validateTabModuleContract } from '@platform/contract-tests';
 *
 * const result = validateTabModuleContract(myTabModule);
 * if (!result.valid) {
 *   console.error(formatValidationErrors(result.errors));
 * }
 */

export {
  validateTabModuleContract,
  validateTabModuleStructure,
  validateTabModuleComponent,
  validateTabModuleIcon,
  validateTabModuleId,
  formatValidationErrors,
  TabModuleSchema,
} from './validators';
