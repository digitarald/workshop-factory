/**
 * Copilot SDK tool for saving workshops to YAML files
 */

import { z } from 'zod';
import { registerTool } from '../client.js';
import { WorkshopSchema } from '../schema.js';
import { saveWorkshop } from '../storage.js';
import { zodToSDKSchema } from './zodToSDKSchema.js';
import { validateFilePath } from './paths.js';

/**
 * Parameters for the save_workshop tool
 */
const SaveWorkshopParamsSchema = z.object({
  workshop: WorkshopSchema,
  filePath: z.string().describe('Path to save the workshop YAML file'),
});

type SaveWorkshopParams = z.infer<typeof SaveWorkshopParamsSchema>;

/**
 * Tool definition for saving a workshop to a YAML file.
 * Validates the workshop structure and persists it to disk.
 */
export const saveWorkshopTool = registerTool<SaveWorkshopParams>(
  'save_workshop',
  'Save a generated workshop to a YAML file',
  zodToSDKSchema(SaveWorkshopParamsSchema),
  async (params) => {
    const parsed = SaveWorkshopParamsSchema.safeParse(params);
    if (!parsed.success) {
      return {
        success: false,
        error: `Invalid parameters: ${parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')}`,
      };
    }
    const { workshop, filePath } = parsed.data;
    try {
      const safePath = await validateFilePath(filePath);
      // saveWorkshop already validates with Zod schema internally
      await saveWorkshop(workshop, safePath);
      return {
        success: true,
        message: `Workshop saved successfully to ${filePath}`,
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred while saving workshop',
      };
    }
  }
);
