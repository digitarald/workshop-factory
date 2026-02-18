import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import type { Dirent } from 'node:fs';
import { loadWorkshop } from './storage.js';

const WORKSHOP_CONFIG_BASENAME = 'workshop.yaml';
const WORKSHOP_CONFIG_ALT_BASENAME = 'workshop.yml';

export interface ExistingWorkshop {
  path: string;
  title: string;
  topic: string;
  duration: number;
  moduleCount: number;
}

export function slugifyTopic(topic: string): string {
  return topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'workshop';
}

export function getNewWorkshopConfigPath(topic: string): string {
  const slug = slugifyTopic(topic);
  return `${slug}/${WORKSHOP_CONFIG_BASENAME}`;
}

export function getExportPath(workshopPath: string): string {
  if (/\.ya?ml$/i.test(workshopPath)) {
    return workshopPath.replace(/\.ya?ml$/i, '.md');
  }

  return `${workshopPath}.md`;
}

function isYamlFile(name: string): boolean {
  return /\.ya?ml$/i.test(name);
}

function normalizeRelativePath(cwd: string, absolutePath: string): string {
  return relative(cwd, absolutePath).replaceAll('\\', '/');
}

export async function discoverExistingWorkshops(cwd: string = process.cwd()): Promise<ExistingWorkshop[]> {
  const entries = await readdir(cwd, { withFileTypes: true });
  const candidates = new Set<string>();

  for (const entry of entries) {
    if (entry.isFile() && isYamlFile(entry.name)) {
      candidates.add(join(cwd, entry.name));
      continue;
    }

    if (!entry.isDirectory()) {
      continue;
    }

    const directoryPath = join(cwd, entry.name);
    let directoryEntries: Dirent[];
    try {
      directoryEntries = await readdir(directoryPath, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const directoryEntry of directoryEntries) {
      if (!directoryEntry.isFile()) {
        continue;
      }

      const lowerName = directoryEntry.name.toLowerCase();
      if (lowerName === WORKSHOP_CONFIG_BASENAME || lowerName === WORKSHOP_CONFIG_ALT_BASENAME) {
        candidates.add(join(directoryPath, directoryEntry.name));
      }
    }
  }

  const workshops: ExistingWorkshop[] = [];
  for (const absolutePath of candidates) {
    const workshopPath = normalizeRelativePath(cwd, absolutePath);
    try {
      const workshop = await loadWorkshop(absolutePath);
      workshops.push({
        path: workshopPath,
        title: workshop.title,
        topic: workshop.topic,
        duration: workshop.duration,
        moduleCount: workshop.modules.length,
      });
    } catch {
      // Ignore YAML files that are not valid workshop configs.
    }
  }

  return workshops.sort((a, b) => a.path.localeCompare(b.path));
}
