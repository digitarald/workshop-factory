/**
 * Shared path validation for SDK tool handlers.
 * Prevents path traversal, symlink escapes, and null-byte injection.
 */

import { resolve, dirname } from 'node:path';
import { realpath } from 'node:fs/promises';

/**
 * Validate that a file path is safely contained within the current working directory,
 * has a .yaml/.yml extension, and does not escape via symlinks.
 *
 * @throws Error if path is outside cwd, follows a symlink outside cwd, contains null bytes,
 *   or lacks a .yaml/.yml extension
 */
export async function validateFilePath(filePath: string): Promise<string> {
  if (filePath.includes('\0')) {
    throw new Error('Path contains null bytes');
  }
  const resolved = resolve(filePath);
  const cwd = process.cwd();
  if (!resolved.startsWith(cwd + '/') && resolved !== cwd) {
    throw new Error(`Path "${filePath}" is outside the working directory`);
  }
  if (!/\.ya?ml$/i.test(resolved)) {
    throw new Error(`Path "${filePath}" must have a .yaml or .yml extension`);
  }
  // Resolve symlinks and re-check containment
  try {
    const real = await realpath(resolved);
    if (!real.startsWith(cwd + '/') && real !== cwd) {
      throw new Error(`Path "${filePath}" resolves outside the working directory`);
    }
  } catch (err) {
    // File may not exist yet (save case) — only ENOENT is acceptable
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') {
      throw new Error(`Path "${filePath}" cannot be validated`, { cause: err });
    }
    // Even if file doesn't exist, verify parent dir doesn't symlink outside cwd
    const parentDir = dirname(resolved);
    try {
      const realParent = await realpath(parentDir);
      if (!realParent.startsWith(cwd + '/') && realParent !== cwd) {
        throw new Error(`Path "${filePath}" has a parent directory that resolves outside the working directory`, { cause: err });
      }
    } catch (parentErr) {
      // Parent also doesn't exist — path is still within cwd textually, allow it
      const parentCode = (parentErr as NodeJS.ErrnoException).code;
      if (parentCode !== 'ENOENT') {
        throw new Error(`Path "${filePath}" has an invalid parent directory`, { cause: parentErr });
      }
    }
  }
  return resolved;
}
