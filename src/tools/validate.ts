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
  'Validate workshop structure and pedagogical rules',
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
      return {
        success: true,
        valid: result.valid,
        checks: result.checks,
        summary: result.valid
          ? 'Workshop passed all validation checks'
          : `Workshop failed ${result.checks.filter((c) => !c.passed).length} validation check(s)`,
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
