/**
 * Wraps a Zod schema to satisfy the Copilot SDK's ZodSchema interface,
 * which requires a `toJSONSchema()` method and `_output` type brand.
 */

import type { ZodType } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodSchema } from '@github/copilot-sdk';

export function zodToSDKSchema<T>(zodSchema: ZodType<T>): ZodSchema<T> {
  return {
    _output: undefined as unknown as T,
    toJSONSchema() {
      return zodToJsonSchema(zodSchema) as Record<string, unknown>;
    },
  };
}
