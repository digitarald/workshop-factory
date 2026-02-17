/**
 * Copilot SDK tool for loading workshops from YAML files
 */

import { z } from 'zod';
import { registerTool } from '../client.js';
import { loadWorkshop } from '../storage.js';
import { zodToSDKSchema } from './zodToSDKSchema.js';
import { validateFilePath } from './paths.js';

/**
 * Parameters for the load_workshop tool
 */
const LoadWorkshopParamsSchema = z.object({
  filePath: z.string().describe('Path to the workshop YAML file to load'),
});

type LoadWorkshopParams = z.infer<typeof LoadWorkshopParamsSchema>;

/**
 * Tool definition for loading an existing workshop from a YAML file.
 * Validates the file structure and returns the workshop data.
 */
export const loadWorkshopTool = registerTool<LoadWorkshopParams>(
  'load_workshop',
  'Load an existing workshop from a YAML file',
  zodToSDKSchema(LoadWorkshopParamsSchema),
  async (params) => {
    const parsed = LoadWorkshopParamsSchema.safeParse(params);
    if (!parsed.success) {
      return {
        success: false,
        error: `Invalid parameters: ${parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')}`,
      };
    }
    const { filePath } = parsed.data;
    try {
      const safePath = await validateFilePath(filePath);
      const workshop = await loadWorkshop(safePath);
      return {
        success: true,
        workshop,
        message: `Workshop loaded successfully from ${filePath}`,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred while loading workshop',
      };
    }
  }
);
