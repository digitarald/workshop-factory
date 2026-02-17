import { readFile, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dump, load } from 'js-yaml';
import { Workshop, WorkshopSchema } from './schema.js';

/**
 * Save a workshop to a YAML file.
 * @param workshop - The workshop object to serialize
 * @param filePath - Destination file path
 * @throws Error if validation fails or file cannot be written
 */
export async function saveWorkshop(
  workshop: Workshop,
  filePath: string
): Promise<void> {
  // Validate the workshop against the schema before saving
  try {
    WorkshopSchema.parse(workshop);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      // Zod validation error - format nicely
      const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
      const fieldErrors = zodError.issues
        .map(issue => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      throw new Error(`Cannot save workshop - validation failed:\n${fieldErrors}`, { cause: error });
    }
    throw new Error(`Cannot save workshop - validation failed: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }

  // Serialize to YAML with readable formatting
  const yamlContent = dump(workshop, {
    indent: 2,
    lineWidth: 80,
    noRefs: true,
    sortKeys: false,
  });

  try {
    await writeFile(filePath, yamlContent, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write file: ${filePath}. ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}

/**
 * Load a workshop from a YAML file and validate it.
 * @param filePath - Path to the YAML file
 * @returns Validated Workshop object
 * @throws Error with descriptive message if file not found, invalid YAML, or validation fails
 */
export async function loadWorkshop(filePath: string): Promise<Workshop> {
  // Check if file exists before attempting to read
  try {
    await access(filePath, constants.R_OK);
  } catch (error) {
    throw new Error(`File not found: ${filePath}. Check the path and try again.`, { cause: error });
  }

  // Read file content
  let fileContent: string;
  try {
    fileContent = await readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file: ${filePath}. ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }

  // Parse YAML
  let rawData: unknown;
  try {
    rawData = load(fileContent);
  } catch (error) {
    throw new Error(`Invalid YAML in file: ${filePath}. ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }

  // Validate that we got an object
  if (!rawData || typeof rawData !== 'object') {
    throw new Error(`Invalid workshop file: ${filePath}. The file may be corrupted or not a valid workshop.`);
  }

  // Validate and parse with Zod schema
  try {
    const workshop = WorkshopSchema.parse(rawData);
    return workshop;
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      // Zod validation error - format nicely
      const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
      const fieldErrors = zodError.issues
        .map(issue => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      throw new Error(`Workshop validation failed:\n${fieldErrors}`, { cause: error });
    }
    throw new Error(`Workshop validation failed: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}

/**
 * Load context files and return their contents as strings.
 * @param paths - Array of file paths to load
 * @returns Array of file contents in the same order as paths
 * @throws Error with descriptive message if any file cannot be read
 */
export async function loadContextFiles(paths: string[]): Promise<string[]> {
  const contents = await Promise.all(
    paths.map(async (path) => {
      try {
        await access(path, constants.R_OK);
      } catch {
        throw new Error(`Context file not found: ${path}. Check the path and try again.`);
      }

      try {
        return await readFile(path, 'utf-8');
      } catch (error) {
        throw new Error(
          `Failed to read context file "${path}": ${
            error instanceof Error ? error.message : String(error)
          }`,
          { cause: error }
        );
      }
    })
  );

  return contents;
}
