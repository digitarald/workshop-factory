/**
 * SDK tool for writing files during workshop repo generation.
 * The model calls this tool to write each file individually,
 * avoiding the fragility of returning large file contents in JSON.
 */

import { z } from 'zod';
import { mkdir, writeFile, realpath } from 'node:fs/promises';
import { resolve, dirname, normalize } from 'node:path';
import { registerTool } from '../client.js';
import { zodToSDKSchema } from './zodToSDKSchema.js';
import type { Tool } from '@github/copilot-sdk';

const WriteFileParamsSchema = z.object({
  path: z.string().describe('Relative file path within the output directory (e.g., "slides/index.html", "code/src/app.ts")'),
  content: z.string().describe('Complete file contents to write'),
});

type WriteFileParams = z.infer<typeof WriteFileParamsSchema>;

export interface WriteFileCallbacks {
  onFileWritten: (path: string, bytes: number) => void;
}

/**
 * Create a write_file tool instance bound to a specific output directory.
 * Each generation run gets its own tool with a bound outputDir and progress callback.
 */
export function createWriteFileTool(
  outputDir: string,
  callbacks: WriteFileCallbacks,
): Tool<WriteFileParams> {
  const resolvedOutputDir = resolve(outputDir);

  return registerTool<WriteFileParams>(
    'write_file',
    'Write a file to the workshop output directory. Call once per file with the relative path and complete content.',
    zodToSDKSchema(WriteFileParamsSchema),
    async (params) => {
      const parsed = WriteFileParamsSchema.safeParse(params);
      if (!parsed.success) {
        return {
          success: false,
          error: `Invalid parameters: ${parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')}`,
        };
      }

      const { path: filePath, content } = parsed.data;

      // Validate: reject empty paths
      if (!filePath.trim()) {
        return { success: false, error: 'File path cannot be empty' };
      }

      // Validate: reject absolute paths
      if (filePath.startsWith('/') || /^[A-Za-z]:/.test(filePath)) {
        return { success: false, error: 'File path must be relative' };
      }

      // Validate: reject path traversal
      const normalized = normalize(filePath);
      if (normalized.startsWith('..') || normalized.includes('/..') || normalized.includes('\\..')) {
        return { success: false, error: 'Path traversal is not allowed' };
      }

      // Validate: reject null bytes
      if (filePath.includes('\0')) {
        return { success: false, error: 'Path contains null bytes' };
      }

      const fullPath = resolve(resolvedOutputDir, normalized);

      // Final containment check
      if (!fullPath.startsWith(resolvedOutputDir + '/') && fullPath !== resolvedOutputDir) {
        return { success: false, error: 'Path resolves outside the output directory' };
      }

      try {
        await mkdir(dirname(fullPath), { recursive: true });

        // Resolve symlinks on the parent dir and re-check containment
        const realParent = await realpath(dirname(fullPath));
        if (!realParent.startsWith(resolvedOutputDir + '/') && realParent !== resolvedOutputDir) {
          return { success: false, error: 'Path resolves outside the output directory via symlink' };
        }

        await writeFile(fullPath, content, 'utf-8');

        const bytes = Buffer.byteLength(content, 'utf-8');
        callbacks.onFileWritten(filePath, bytes);

        return {
          success: true,
          message: `Wrote ${filePath} (${bytes} bytes)`,
          path: filePath,
          bytes,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error writing file',
        };
      }
    },
  );
}
