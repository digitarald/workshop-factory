/**
 * Section-level regeneration for Workshop Factory CLI
 * 
 * Handles targeted regeneration of specific sections with optional context injection.
 */

import { Workshop, WorkshopSchema } from './schema.js';
import { loadWorkshop, saveWorkshop, loadContextFiles } from './storage.js';
import { buildRegenPrompt, getSystemPrompt } from './prompts.js';
import { getGlobalClient, createSession, sendAndWait } from './client.js';
import { extractJson } from './extract-json.js';
import { saveWorkshopTool, loadWorkshopTool, validateStructureTool } from './tools/index.js';
import { dump } from 'js-yaml';

/**
 * Options for regenerating a workshop
 */
export interface RegenOptions {
  workshopPath: string;
  sectionIndices?: number[];  // 1-based indices, if omitted regen all
  contextFiles?: string[];    // new context files to inject
}

/**
 * Map section numbers (1-based, sequential across all modules) to module/section positions
 * 
 * Example: For a workshop with Module 1 (3 sections) and Module 2 (2 sections):
 * - Section 1 → Module 0, Section 0
 * - Section 2 → Module 0, Section 1
 * - Section 3 → Module 0, Section 2
 * - Section 4 → Module 1, Section 0
 * - Section 5 → Module 1, Section 1
 * 
 * @param workshop - The workshop to analyze
 * @returns Map from flat section number to { moduleIndex, sectionIndex }
 */
export function mapSectionIndices(workshop: Workshop): Map<number, { moduleIndex: number; sectionIndex: number }> {
  const mapping = new Map<number, { moduleIndex: number; sectionIndex: number }>();
  let flatIndex = 1; // 1-based counting

  for (let moduleIdx = 0; moduleIdx < workshop.modules.length; moduleIdx++) {
    const module = workshop.modules[moduleIdx]!;
    for (let sectionIdx = 0; sectionIdx < module.sections.length; sectionIdx++) {
      mapping.set(flatIndex, { moduleIndex: moduleIdx, sectionIndex: sectionIdx });
      flatIndex++;
    }
  }

  return mapping;
}

/**
 * Regenerate specific sections of a workshop, optionally with new context.
 * 
 * @param options - Regeneration options
 * @returns Updated workshop with regenerated sections
 * @throws Error if workshop can't be loaded, sections are invalid, or validation fails
 */
export async function regenerateWorkshop(options: RegenOptions): Promise<Workshop> {
  const { workshopPath, sectionIndices, contextFiles } = options;

  // Step 1: Load existing workshop
  console.log(`Loading workshop from ${workshopPath}...`);
  const workshop = await loadWorkshop(workshopPath);

  // Step 2: Build section index mapping
  const sectionMap = mapSectionIndices(workshop);
  const totalSections = sectionMap.size;

  console.log(`Workshop has ${totalSections} total sections across ${workshop.modules.length} modules`);

  // Step 3: Determine which sections to regenerate
  let sectionsToRegen: number[];
  if (sectionIndices && sectionIndices.length > 0) {
    sectionsToRegen = sectionIndices;
    
    // Validate that all requested sections exist
    for (const idx of sectionsToRegen) {
      if (!sectionMap.has(idx)) {
        throw new Error(`Invalid section index ${idx}. Workshop has ${totalSections} sections (1-${totalSections}).`);
      }
    }
    
    const sectionTitles = sectionsToRegen.map(idx => {
      const pos = sectionMap.get(idx)!;
      const section = workshop.modules[pos.moduleIndex]!.sections[pos.sectionIndex];
      return `  ${idx}. ${section!.title}`;
    });
    console.log(`Regenerating ${sectionsToRegen.length} section(s):\n${sectionTitles.join('\n')}`);
  } else {
    // Regenerate all sections
    sectionsToRegen = Array.from(sectionMap.keys());
    const sectionTitles = sectionsToRegen.map(idx => {
      const pos = sectionMap.get(idx)!;
      const section = workshop.modules[pos.moduleIndex]!.sections[pos.sectionIndex];
      return `  ${idx}. ${section!.title}`;
    });
    console.log(`Regenerating all ${sectionsToRegen.length} sections:\n${sectionTitles.join('\n')}`);
  }

  // Step 4: Load and prepare new context if provided
  let newContextContent: string[] | undefined;
  if (contextFiles && contextFiles.length > 0) {
    console.log(`Loading ${contextFiles.length} new context file(s)...`);
    try {
      newContextContent = await loadContextFiles(contextFiles);
      
      // Update context_sources in workshop metadata
      // Merge with existing, removing duplicates
      const existingSources = new Set(workshop.context_sources);
      for (const file of contextFiles) {
        existingSources.add(file);
      }
      workshop.context_sources = Array.from(existingSources);
      
      console.log(`✓ Context files loaded successfully: ${contextFiles.join(', ')}`);
      console.log(`Updated context sources: ${workshop.context_sources.join(', ')}`);
    } catch (error) {
      throw new Error(`Failed to load context files: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
  }

  // Step 5: Map flat section indices to [moduleIndex, sectionIndex] pairs
  const moduleSecIndexPairs: Array<[number, number]> = sectionsToRegen.map(flatIdx => {
    const pos = sectionMap.get(flatIdx)!;
    return [pos.moduleIndex, pos.sectionIndex];
  });

  // Step 6: Build the regeneration prompt
  console.log('Building regeneration prompt...');
  const workshopYaml = dump(workshop, {
    indent: 2,
    lineWidth: 80,
    noRefs: true,
    sortKeys: false,
  });

  const regenPrompt = buildRegenPrompt(
    workshopYaml,
    moduleSecIndexPairs,
    newContextContent,
    contextFiles
  );

  // Step 7: Send regen prompt to Copilot SDK
  console.log('Sending regeneration request to Copilot...');
  const systemPrompt = await getSystemPrompt();
  const client = getGlobalClient();
  const session = await createSession(client, systemPrompt, {
    tools: [saveWorkshopTool, loadWorkshopTool, validateStructureTool],
  });
  const response = await sendAndWait(session, regenPrompt);

  if (!response) {
    throw new Error('No response from Copilot SDK during regeneration');
  }

  // Parse the response JSON
  const responseText = response.data.content;
  const jsonStr = extractJson(responseText);
  const updatedWorkshop = WorkshopSchema.parse(JSON.parse(jsonStr));

  // Splice regenerated sections back into the original workshop
  let updatedCount = 0;
  for (const sectionNum of sectionsToRegen) {
    const pos = sectionMap.get(sectionNum);
    if (!pos) continue;
    const updatedModule = updatedWorkshop.modules[pos.moduleIndex];
    const updatedSection = updatedModule?.sections[pos.sectionIndex];
    if (updatedSection) {
      workshop.modules[pos.moduleIndex]!.sections[pos.sectionIndex] = updatedSection;
      updatedCount++;
    }
  }
  if (updatedCount !== sectionsToRegen.length) {
    console.warn(`⚠ Only ${updatedCount} of ${sectionsToRegen.length} sections were updated — LLM response may have a different structure`);
  }

  // Step 8: Save the updated workshop
  console.log(`\nSaving workshop to ${workshopPath}...`);
  await saveWorkshop(workshop, workshopPath);
  console.log('✓ Workshop saved');

  return workshop;
}
