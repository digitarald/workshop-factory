/**
 * Copilot SDK tool for validating workshop structure.
 *
 * Pure validation logic lives in ../validation.ts to avoid SDK side effects
 * when importing standalone validation.
 */

import { z } from 'zod';
import { registerTool } from '../client.js';
import { WorkshopSchema } from '../schema.js';
import { zodToSDKSchema } from './zodToSDKSchema.js';
import { validateWorkshopAsync } from '../validation.js';

/**
 * Parameters for the validate_structure tool
 */
const ValidateStructureParamsSchema = z.object({
  workshop: WorkshopSchema,
});

type ValidateStructureParams = z.infer<typeof ValidateStructureParamsSchema>;

/**
 * Tool definition for validating workshop structure and pedagogical rules.
 * Runs all validation checks and returns detailed results.
 */
export const validateStructureTool = registerTool<ValidateStructureParams>(
  'validate_structure',
  'Check for structural drift and enforce pedagogical constraints',
  zodToSDKSchema(ValidateStructureParamsSchema),
  async (params) => {
    const parsed = ValidateStructureParamsSchema.safeParse(params);
    if (!parsed.success) {
      return {
        success: false,
        error: `Invalid parameters: ${parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')}`,
      };
    }
    const { workshop } = parsed.data;
    try {
      const result = await validateWorkshopAsync(workshop);
      const errors = result.checks.filter(c => !c.passed && c.severity === 'error').length;
      const suggestions = result.checks.filter(c => !c.passed && c.severity === 'suggestion').length;
      const total = result.checks.length;
      const parts: string[] = [`${total} constraints checked`];
      if (errors > 0) parts.push(`${errors} error${errors === 1 ? '' : 's'}`);
      if (suggestions > 0) parts.push(`${suggestions} suggestion${suggestions === 1 ? '' : 's'}`);
      if (errors === 0 && suggestions === 0) parts.push('all passed');
      return {
        success: true,
        valid: result.valid,
        checks: result.checks,
        summary: parts.join(', ') + ' — human review recommended',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred during validation',
      };
    }
  }
);
