/**
 * Standalone workshop validation — no SDK dependencies.
 *
 * Extracted from src/tools/validate.ts so that importing validation
 * does not trigger Copilot SDK tool registration side effects.
 */

import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import type { Workshop, BloomsLevel } from './schema.js';

/**
 * Single validation check result
 */
export interface ValidationCheck {
  rule: string;
  passed: boolean;
  /** 'error' for structural violations, 'suggestion' for pedagogical recommendations */
  severity: 'error' | 'suggestion';
  message: string;
  /** Actionable remediation hint shown when the check fails */
  remediation?: string;
}

/**
 * Overall validation result
 */
export interface ValidationResult {
  valid: boolean;
  checks: ValidationCheck[];
}

/**
 * Format validation results as drift-detection output with grouped findings
 * and actionable remediation hints.
 *
 * @param result - Validation result from validateWorkshop / validateWorkshopAsync
 * @param title  - Optional workshop title to include in the header
 * @returns Multi-line string ready for console output
 */
export function formatValidationOutput(result: ValidationResult, title?: string): string {
  const lines: string[] = [];

  const titleStr = title ? ` for "${title}"` : '';
  lines.push(`Checking structural constraints${titleStr}...`);
  lines.push('');

  const errors = result.checks.filter(c => !c.passed && c.severity === 'error');
  const suggestions = result.checks.filter(c => !c.passed && c.severity === 'suggestion');

  if (errors.length > 0) {
    lines.push(`Errors (${errors.length}):`);
    for (const check of errors) {
      lines.push(`  ✗ ${check.message}`);
      if (check.remediation) {
        lines.push(`    → ${check.remediation}`);
      }
    }
    lines.push('');
  }

  if (suggestions.length > 0) {
    lines.push(`Suggestions (${suggestions.length}):`);
    for (const check of suggestions) {
      lines.push(`  ⚠ ${check.message}`);
      if (check.remediation) {
        lines.push(`    → ${check.remediation}`);
      }
    }
    lines.push('');
  }

  if (errors.length === 0 && suggestions.length === 0) {
    lines.push('  ✓ All checks passed');
    lines.push('');
  }

  // Summary line
  const total = result.checks.length;
  const parts: string[] = [`${total} constraints checked`];
  if (errors.length > 0) parts.push(`${errors.length} error${errors.length === 1 ? '' : 's'}`);
  if (suggestions.length > 0) parts.push(`${suggestions.length} suggestion${suggestions.length === 1 ? '' : 's'}`);
  if (errors.length === 0 && suggestions.length === 0) parts.push('all passed');
  lines.push(parts.join(', ') + ' — human review recommended');

  return lines.join('\n');
}

/**
 * Bloom's taxonomy action verbs for each cognitive level
 */
const BLOOMS_VERBS: Record<BloomsLevel, string[]> = {
  remember: ['define', 'list', 'identify', 'recall', 'name', 'recognize', 'state', 'label'],
  understand: ['explain', 'describe', 'summarize', 'interpret', 'classify', 'compare', 'discuss', 'paraphrase'],
  apply: ['implement', 'use', 'execute', 'demonstrate', 'solve', 'apply', 'build', 'operate', 'navigate', 'craft', 'practice', 'calculate', 'modify', 'construct', 'produce', 'select', 'show'],
  analyze: ['differentiate', 'examine', 'compare', 'contrast', 'debug', 'test', 'investigate', 'categorize', 'diagnose', 'classify', 'infer', 'identify', 'outline', 'attribute', 'organize'],
  evaluate: ['assess', 'critique', 'justify', 'defend', 'judge', 'recommend', 'prioritize', 'validate', 'determine', 'decide', 'appraise', 'rank', 'measure', 'evaluate'],
  create: ['design', 'build', 'construct', 'develop', 'compose', 'formulate', 'plan', 'architect', 'synthesize', 'generate', 'hypothesize', 'engineer'],
};

/**
 * Expected Bloom's levels by audience level
 */
const LEVEL_BLOOMS_MAP: Record<'beginner' | 'intermediate' | 'advanced', BloomsLevel[]> = {
  beginner: ['remember', 'understand', 'apply'],
  intermediate: ['understand', 'apply', 'analyze'],
  advanced: ['analyze', 'evaluate', 'create'],
};

/**
 * Validate workshop structure and pedagogical rules.
 * Returns detailed validation results with all checks.
 */
export function validateWorkshop(workshop: Workshop): ValidationResult {
  const checks: ValidationCheck[] = [];

  // 1. Duration sum: section durations in each module sum to module duration (±2min tolerance)
  for (const [moduleIdx, module] of workshop.modules.entries()) {
    const sectionSum = module.sections.reduce((sum, section) => sum + section.duration, 0);
    const diff = Math.abs(sectionSum - module.duration);
    const passed = diff <= 2;
    checks.push({
      rule: 'duration_sum',
      passed,
      severity: 'error',
      message: passed
        ? `Module ${moduleIdx + 1} sections sum to ${sectionSum}min (module: ${module.duration}min)`
        : `Module ${moduleIdx + 1} sections sum to ${sectionSum}min but module duration is ${module.duration}min (diff: ${diff}min, tolerance: ±2min)`,
      remediation: passed ? undefined : `Adjust section durations to total ${module.duration}min, or update module ${moduleIdx + 1} duration to ${sectionSum}min`,
    });
  }

  // 2. Total duration: module durations sum to workshop duration (±5min tolerance)
  const moduleSum = workshop.modules.reduce((sum, module) => sum + module.duration, 0);
  const totalDiff = Math.abs(moduleSum - workshop.duration);
  const totalPassed = totalDiff <= 5;
  checks.push({
    rule: 'total_duration',
    passed: totalPassed,
    severity: 'error',
    message: totalPassed
      ? `Module durations sum to ${moduleSum}min (workshop: ${workshop.duration}min)`
      : `Module durations sum to ${moduleSum}min but workshop duration is ${workshop.duration}min (diff: ${totalDiff}min, tolerance: ±5min)`,
    remediation: totalPassed ? undefined : `Adjust module durations to total ${workshop.duration}min, or update workshop duration to ${moduleSum}min`,
  });

  // 3. Exercise completeness: every exercise section has starter_code AND solution (non-empty)
  let exerciseCount = 0;
  let incompleteExercises = 0;
  for (const [moduleIdx, module] of workshop.modules.entries()) {
    for (const [sectionIdx, section] of module.sections.entries()) {
      if (section.type === 'exercise') {
        exerciseCount++;
        const hasStarter = section.starter_code.trim().length > 0;
        const hasSolution = section.solution.trim().length > 0;
        if (!hasStarter || !hasSolution) {
          incompleteExercises++;
          checks.push({
            rule: 'exercise_completeness',
            passed: false,
            severity: 'error',
            message: `Module ${moduleIdx + 1}, Section ${sectionIdx + 1} (${section.title}): missing ${!hasStarter ? 'starter_code' : 'solution'}`,
            remediation: !hasStarter
              ? `Add a starter_code template for participants to begin from in "${section.title}"`
              : `Add a complete working solution to "${section.title}"`,
          });
        }
      }
    }
  }
  if (exerciseCount > 0 && incompleteExercises === 0) {
    checks.push({
      rule: 'exercise_completeness',
      passed: true,
      severity: 'error',
      message: `All ${exerciseCount} exercises have starter_code and solution`,
    });
  } else if (exerciseCount === 0) {
    checks.push({
      rule: 'exercise_completeness',
      passed: false,
      severity: 'error',
      message: 'No exercises found in workshop',
      remediation: 'Add at least one exercise section to enable active learning',
    });
  }

  // 4. Checkpoint spacing: no more than 25 minutes of content without a checkpoint
  for (const [moduleIdx, module] of workshop.modules.entries()) {
    let timeSinceCheckpoint = 0;
    let maxGap = 0;
    for (const section of module.sections) {
      if (section.type === 'checkpoint') {
        timeSinceCheckpoint = 0;
      } else {
        timeSinceCheckpoint += section.duration;
        maxGap = Math.max(maxGap, timeSinceCheckpoint);
      }
    }
    const passed = maxGap <= 25;
    checks.push({
      rule: 'checkpoint_spacing',
      passed,
      severity: 'suggestion',
      message: passed
        ? `Module ${moduleIdx + 1} has checkpoints every ≤25min (max gap: ${maxGap}min)`
        : `Module ${moduleIdx + 1} has a ${maxGap}min gap without checkpoints (max allowed: 25min)`,
      remediation: passed ? undefined : `Add a checkpoint section in module ${moduleIdx + 1} to assess understanding every ≤25min`,
    });
  }

  // 5. Practice ratio: exercises + discussions ≥ 60% of total duration
  let practiceTime = 0;
  for (const module of workshop.modules) {
    for (const section of module.sections) {
      if (section.type === 'exercise' || section.type === 'discussion') {
        practiceTime += section.duration;
      }
    }
  }
  const practiceRatio = (practiceTime / workshop.duration) * 100;
  const practicePass = practiceRatio >= 60;
  checks.push({
    rule: 'practice_ratio',
    passed: practicePass,
    severity: 'suggestion',
    message: practicePass
      ? `Practice time is ${practiceRatio.toFixed(1)}% of total (${practiceTime}/${workshop.duration}min)`
      : `Practice time is ${practiceRatio.toFixed(1)}% of total (${practiceTime}/${workshop.duration}min), needs ≥60%`,
    remediation: practicePass ? undefined : `Convert ${Math.ceil(0.6 * workshop.duration - practiceTime)}min of lecture content into exercises or discussions`,
  });

  // 6. Lecture ratio: lectures ≤ 25% of total duration
  let lectureTime = 0;
  for (const module of workshop.modules) {
    for (const section of module.sections) {
      if (section.type === 'lecture') {
        lectureTime += section.duration;
      }
    }
  }
  const lectureRatio = (lectureTime / workshop.duration) * 100;
  const lecturePass = lectureRatio <= 25;
  checks.push({
    rule: 'lecture_ratio',
    passed: lecturePass,
    severity: 'suggestion',
    message: lecturePass
      ? `Lecture time is ${lectureRatio.toFixed(1)}% of total (${lectureTime}/${workshop.duration}min)`
      : `Lecture time is ${lectureRatio.toFixed(1)}% of total (${lectureTime}/${workshop.duration}min), should be ≤25%`,
    remediation: lecturePass ? undefined : `Reduce lecture content by ${Math.ceil(lectureTime - 0.25 * workshop.duration)}min — convert to exercises or discussions`,
  });

  // 7. Checkpoint ratio: checkpoints ≥ 15% of total duration
  let checkpointTime = 0;
  for (const module of workshop.modules) {
    for (const section of module.sections) {
      if (section.type === 'checkpoint') {
        checkpointTime += section.duration;
      }
    }
  }
  const checkpointRatio = (checkpointTime / workshop.duration) * 100;
  const checkpointPass = checkpointRatio >= 15;
  checks.push({
    rule: 'checkpoint_ratio',
    passed: checkpointPass,
    severity: 'suggestion',
    message: checkpointPass
      ? `Checkpoint time is ${checkpointRatio.toFixed(1)}% of total (${checkpointTime}/${workshop.duration}min)`
      : `Checkpoint time is ${checkpointRatio.toFixed(1)}% of total (${checkpointTime}/${workshop.duration}min), needs ≥15%`,
    remediation: checkpointPass ? undefined : `Add ${Math.ceil(0.15 * workshop.duration - checkpointTime)}min of checkpoint activities across modules`,
  });

  // 8. Max lecture section duration: no single lecture section should exceed 15 minutes
  for (const [moduleIdx, module] of workshop.modules.entries()) {
    for (const [sectionIdx, section] of module.sections.entries()) {
      if (section.type === 'lecture' && section.duration > 15) {
        checks.push({
          rule: 'max_lecture_duration',
          passed: false,
          severity: 'suggestion',
          message: `Module ${moduleIdx + 1}, Section ${sectionIdx + 1} "${section.title}": lecture is ${section.duration}min, should be ≤15min`,
          remediation: `Break "${section.title}" into segments ≤15min each, interleaved with exercises or discussions`,
        });
      }
    }
  }
  if (!checks.some(c => c.rule === 'max_lecture_duration')) {
    checks.push({
      rule: 'max_lecture_duration',
      passed: true,
      severity: 'suggestion',
      message: 'All lecture sections are ≤15 minutes',
    });
  }

  // 9. Min section duration: every section should be at least 5 minutes
  for (const [moduleIdx, module] of workshop.modules.entries()) {
    for (const [sectionIdx, section] of module.sections.entries()) {
      if (section.duration < 5) {
        checks.push({
          rule: 'min_section_duration',
          passed: false,
          severity: 'error',
          message: `Module ${moduleIdx + 1}, Section ${sectionIdx + 1} "${section.title}": duration is ${section.duration}min, should be ≥5min`,
          remediation: `Extend "${section.title}" to at least 5min or merge it with an adjacent section`,
        });
      }
    }
  }
  if (!checks.some(c => c.rule === 'min_section_duration')) {
    checks.push({
      rule: 'min_section_duration',
      passed: true,
      severity: 'error',
      message: 'All sections are ≥5 minutes',
    });
  }

  // 10. Bloom's alignment: learning objectives use appropriate verbs for the audience level
  const expectedLevels = LEVEL_BLOOMS_MAP[workshop.audience.level];
  let bloomsIssues = 0;
  for (const [moduleIdx, module] of workshop.modules.entries()) {
    for (const [objIdx, objective] of module.learning_objectives.entries()) {
      // Check if the Bloom's level is appropriate for audience level
      if (!expectedLevels.includes(objective.blooms_level)) {
        bloomsIssues++;
        const firstExpected = expectedLevels[0];
        const exampleVerbs = firstExpected ? (BLOOMS_VERBS[firstExpected] ?? []).slice(0, 2).join('" or "') : '';
        checks.push({
          rule: 'blooms_alignment',
          passed: false,
          severity: 'suggestion',
          message: `Module ${moduleIdx + 1}, Objective ${objIdx + 1}: "${objective.text}" uses "${objective.blooms_level}" level, but ${workshop.audience.level}-level workshops should focus on: ${expectedLevels.join(', ')}`,
          remediation: `Rewrite to target ${expectedLevels.join(' or ')} cognitive level — e.g., start with "${exampleVerbs}"`,
        });
      }

      // Check if the objective text uses appropriate action verbs
      const verbsForLevel = BLOOMS_VERBS[objective.blooms_level];
      const firstWord = objective.text.trim().split(/\s+/)[0]!.toLowerCase();
      if (!verbsForLevel.some(verb => firstWord.includes(verb))) {
        bloomsIssues++;
        checks.push({
          rule: 'blooms_alignment',
          passed: false,
          severity: 'suggestion',
          message: `Module ${moduleIdx + 1}, Objective ${objIdx + 1}: "${objective.text}" doesn't start with a typical "${objective.blooms_level}" verb (expected: ${verbsForLevel.slice(0, 3).join(', ')}, ...)`,
          remediation: `Start objective with a "${objective.blooms_level}" action verb — e.g., "${verbsForLevel.slice(0, 3).join('", "')}"`,
        });
      }
    }
  }
  if (bloomsIssues === 0) {
    const totalObjectives = workshop.modules.reduce((sum, m) => sum + m.learning_objectives.length, 0);
    checks.push({
      rule: 'blooms_alignment',
      passed: true,
      severity: 'suggestion',
      message: `All ${totalObjectives} learning objectives use appropriate Bloom's levels and verbs for ${workshop.audience.level}-level audience`,
    });
  }

  // 11. Context sources: if context_sources listed, note for async checks
  if (workshop.context_sources.length > 0) {
    checks.push({
      rule: 'context_sources',
      passed: true,
      severity: 'error',
      message: `Workshop lists ${workshop.context_sources.length} context source(s): ${workshop.context_sources.join(', ')}`,
    });
  }

  // Determine overall validity
  const valid = checks.every((check) => check.passed);

  return {
    valid,
    checks,
  };
}

/**
 * Async validation that includes file system checks for context sources
 */
export async function validateWorkshopAsync(workshop: Workshop): Promise<ValidationResult> {
  const result = validateWorkshop(workshop);

  // Add async check for context source file existence
  if (workshop.context_sources.length > 0) {
    const contextChecks = await Promise.all(
      workshop.context_sources.map(async (path) => {
        try {
          await access(path, constants.R_OK);
          return { path, exists: true };
        } catch {
          return { path, exists: false };
        }
      })
    );

    const missingFiles = contextChecks.filter((c) => !c.exists);

    // Update the context_sources check or add a new one
    const contextCheckIdx = result.checks.findIndex((c) => c.rule === 'context_sources');
    if (contextCheckIdx >= 0) {
      if (missingFiles.length > 0) {
        result.checks[contextCheckIdx] = {
          rule: 'context_sources',
          passed: false,
          severity: 'error',
          message: `Warning: ${missingFiles.length} context source(s) not found on disk: ${missingFiles.map((f) => f.path).join(', ')}`,
          remediation: 'Check that paths are correct relative to your working directory',
        };
        result.valid = false;
      } else {
        result.checks[contextCheckIdx] = {
          rule: 'context_sources',
          passed: true,
          severity: 'error',
          message: `All ${workshop.context_sources.length} context source files exist on disk`,
        };
      }
    }
  }

  return result;
}
