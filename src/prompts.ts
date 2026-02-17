/**
 * Prompt generation chain for Workshop Factory CLI
 *
 * This module provides the system prompt and multi-step generation chain:
 * 1. Analyze — topic analysis, scope, prerequisites
 * 2. Outline — structured module/section plan
 * 3. Generate — section-by-section content generation (per module)
 * 4. Regen — targeted section regeneration
 */

import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Get the system prompt that instructs the model on workshop generation.
 * Reads SKILL.md from the project root and includes:
 * - Pedagogy rules (Bloom's taxonomy, practice ratios, scaffolding)
 * - Available tools (save_workshop, validate_structure)
 * - Output format instructions (structured JSON matching Workshop schema)
 *
 * @returns System prompt string
 */
export async function getSystemPrompt(): Promise<string> {
  let skillContent: string;
  
  try {
    // Read SKILL.md relative to this module (works when installed as CLI too)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const skillPath = join(__dirname, '..', 'docs', 'SKILL.md');
    skillContent = await readFile(skillPath, 'utf-8');
  } catch {
    // Fallback if SKILL.md doesn't exist yet
    skillContent = `# Workshop Pedagogy Rules

## Core Principles

You are a workshop design expert specializing in evidence-based pedagogy.

### Bloom's Taxonomy
- Tag all learning objectives with cognitive levels: remember, understand, apply, analyze, evaluate, create
- Match cognitive level to audience difficulty:
  - Beginner: focus on remember, understand, apply
  - Intermediate: focus on apply, analyze
  - Advanced: focus on analyze, evaluate, create

### Practice-First Ratio
Allocate durations to achieve:
- **≥60%** exercises + discussion (active learning)
- **≤25%** lecture (passive content delivery)
- **≥15%** checkpoints (formative assessment)

### Exercise Timing
- Allocate 2-3x the "just do it" time to account for reading, debugging, questions
- Include scaffolding: worked examples → guided practice → independent problems

### Checkpoint Spacing
- Insert checkpoints every ~20-25 minutes of content
- Include expected answers with explanations (testing effect requires feedback)

### Stack Adaptation
- When audience specifies a stack (e.g., "Python/FastAPI"), use that stack consistently in code examples
- Adapt complexity to audience level

### Context Grounding
- When context files are provided, reference them in exercises and examples
- Ground content in real-world scenarios from the context`;
  }

  return `${skillContent}

## Your Task

Generate pedagogically sound workshops following the principles above. You have access to these tools:

- **save_workshop**: Persist generated workshop as YAML
- **validate_structure**: Check pedagogical compliance (practice ratio, checkpoint spacing, Bloom's alignment, timing)

## Output Format

Always respond with valid JSON matching the Workshop schema:

\`\`\`typescript
interface Workshop {
  title: string;
  topic: string;
  audience: {
    level: 'beginner' | 'intermediate' | 'advanced';
    stack?: string;
    size?: number;
  };
  duration: number; // total minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  context_sources: string[]; // paths to provided context files
  modules: Module[];
}

interface Module {
  title: string;
  duration: number;
  learning_objectives: Array<{
    text: string;
    blooms_level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  }>;
  sections: Section[];
}

type Section = 
  | { type: 'lecture'; title: string; duration: number; talking_points: string[] }
  | { type: 'exercise'; title: string; duration: number; instructions: string; starter_code: string; solution: string; hints: string[] }
  | { type: 'discussion'; title: string; duration: number; prompts: string[] }
  | { type: 'checkpoint'; title: string; duration: number; questions: string[]; expected_answers: string[]; explanations: string[] };
\`\`\`

Ensure all durations sum correctly and pedagogical ratios are met.`;
}

/**
 * Parameters for workshop generation
 */
export interface WorkshopParams {
  topic: string;
  audience: {
    level: 'beginner' | 'intermediate' | 'advanced';
    stack?: string;
    size?: number;
  };
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  context?: string[]; // file paths to context documents
}

/**
 * Build the analyze prompt — first step in generation chain.
 * Asks the model to analyze the topic, identify subtopics, assess prerequisites,
 * and recommend scope adjustments.
 *
 * @param params - Workshop generation parameters
 * @param contextContent - Optional array of context file contents
 * @returns Prompt string for analysis step
 */
export function buildAnalyzePrompt(
  params: WorkshopParams,
  contextContent?: string[]
): string {
  const { topic, audience, duration, difficulty, context } = params;

  let prompt = `Analyze this topic for a workshop:

**Topic**: ${topic}
**Audience**: ${audience.level} level${audience.stack ? ` (${audience.stack} stack)` : ''}${audience.size ? `, group size: ${audience.size}` : ''}
**Duration**: ${duration} minutes
**Difficulty**: ${difficulty}
`;

  if (context && context.length > 0 && contextContent && contextContent.length > 0) {
    prompt += `\n**Context Documents Provided**: ${context.length} file(s)\n\n`;
    
    context.forEach((path, index) => {
      if (contextContent[index]) {
        prompt += `### Context ${index + 1}: ${path}\n\n\`\`\`\n${contextContent[index]}\n\`\`\`\n\n`;
      }
    });
  }

  prompt += `
Please analyze this workshop request and provide:

1. **Subtopics breakdown** — key areas to cover within the ${duration}-minute timeframe
2. **Prerequisites assessment** — what knowledge/skills should participants have beforehand
3. **Scope recommendations** — any adjustments needed to fit the duration and difficulty level
4. **Notes** — any important considerations for this audience/context

**Output as JSON**:
\`\`\`json
{
  "subtopics": ["subtopic 1", "subtopic 2", ...],
  "prerequisites": ["prerequisite 1", "prerequisite 2", ...],
  "scope": "scope recommendation text",
  "notes": "additional notes"
}
\`\`\``;

  return prompt;
}

/**
 * Build the outline prompt — second step in generation chain.
 * Takes the analysis output and asks for a structured module/section plan
 * with timing, types, and learning objectives (but without full content).
 *
 * @param analysis - JSON string from analyze step
 * @param params - Original workshop parameters
 * @returns Prompt string for outline step
 */
export function buildOutlinePrompt(
  analysis: string,
  params: WorkshopParams
): string {
  const { topic, audience, duration, difficulty } = params;

  return `Based on the analysis below, create a structured outline for the workshop.

**Analysis**:
\`\`\`json
${analysis}
\`\`\`

**Workshop Parameters**:
- Topic: ${topic}
- Audience: ${audience.level} level${audience.stack ? ` (${audience.stack})` : ''}
- Duration: ${duration} minutes
- Difficulty: ${difficulty}

Create a module and section plan that:
- Breaks the topic into logical modules
- Assigns durations to each module and section
- Meets the practice-first ratio (≥60% exercises/discussion, ≤25% lecture, ≥15% checkpoints)
- Spaces checkpoints every ~20-25 minutes
- Tags learning objectives with Bloom's levels appropriate for ${difficulty} difficulty
- Total duration sums to ${duration} minutes (±5min tolerance)

For each module, provide:
- Title
- Duration (minutes)
- Learning objectives with Bloom's level tags

For each section, provide:
- Type: 'lecture' | 'exercise' | 'discussion' | 'checkpoint'
- Title
- Duration (minutes)

**Do not include full section content yet** — just the structure and metadata.

**Output as JSON** matching this structure:
\`\`\`json
{
  "title": "Workshop Title",
  "topic": "${topic}",
  "audience": ${JSON.stringify(params.audience)},
  "duration": ${duration},
  "difficulty": "${difficulty}",
  "prerequisites": [],
  "context_sources": ${JSON.stringify(params.context || [])},
  "modules": [
    {
      "title": "Module 1 Title",
      "duration": 45,
      "learning_objectives": [
        { "text": "Objective text", "blooms_level": "apply" }
      ],
      "sections": [
        { "type": "lecture", "title": "Section Title", "duration": 10 },
        { "type": "exercise", "title": "Exercise Title", "duration": 20 }
      ]
    }
  ]
}
\`\`\``;
}

/**
 * Build the generate prompt — third step, per-module content generation.
 * Takes the outline and generates full content for a specific module.
 *
 * @param outline - JSON string of the complete outline
 * @param moduleIndex - Index of the module to generate (0-based)
 * @param params - Original workshop parameters
 * @param contextContent - Optional context file contents
 * @returns Prompt string for generate step
 */
export function buildGeneratePrompt(
  outline: string,
  moduleIndex: number,
  params: WorkshopParams,
  contextContent?: string[]
): string {
  let prompt = `Generate full content for module ${moduleIndex + 1} based on the outline below.

**Full Outline**:
\`\`\`json
${outline}
\`\`\`

**Generate content for Module ${moduleIndex + 1}** with these requirements:

### For lecture sections:
- Provide talking_points: array of key points to cover (5-10 points)

### For exercise sections:
- instructions: clear step-by-step exercise description
- starter_code: initial code template participants start with
- solution: complete working solution
- hints: array of progressive hints (3-5 hints)
${params.audience.stack ? `- Use ${params.audience.stack} stack in all code examples` : ''}

### For discussion sections:
- prompts: array of discussion questions/prompts (3-5 prompts)

### For checkpoint sections:
- questions: array of assessment questions
- expected_answers: array of answers (same length as questions)
- explanations: array of explanations for each answer (feedback for learning)
`;

  if (params.context && params.context.length > 0 && contextContent && contextContent.length > 0) {
    prompt += `\n**Context to Reference**:\n`;
    params.context.forEach((path, index) => {
      if (contextContent[index]) {
        prompt += `\n### ${path}\n\`\`\`\n${contextContent[index].slice(0, 2000)}${contextContent[index].length > 2000 ? '...' : ''}\n\`\`\`\n`;
      }
    });
    prompt += `\nGround exercises and examples in these context documents.\n`;
  }

  prompt += `
**Output as JSON** — return ONLY the complete Module object with full section content:
\`\`\`json
{
  "title": "Module Title",
  "duration": 45,
  "learning_objectives": [...],
  "sections": [
    {
      "type": "lecture",
      "title": "...",
      "duration": 10,
      "talking_points": ["point 1", "point 2", ...]
    },
    {
      "type": "exercise",
      "title": "...",
      "duration": 20,
      "instructions": "...",
      "starter_code": "...",
      "solution": "...",
      "hints": ["hint 1", "hint 2", ...]
    }
  ]
}
\`\`\``;

  return prompt;
}

/**
 * Build the regeneration prompt — for updating specific sections.
 * Provides the existing workshop and asks to regenerate specific sections,
 * optionally with new context.
 *
 * @param workshopYaml - Current workshop as YAML string
 * @param sectionIndices - Array of section indices to regenerate (format: [moduleIdx, sectionIdx])
 * @param newContext - Optional new context content
 * @param contextPaths - Optional paths to new context files
 * @returns Prompt string for regeneration
 */
export function buildRegenPrompt(
  workshopYaml: string,
  sectionIndices: Array<[number, number]>, // [moduleIndex, sectionIndex] pairs
  newContext?: string[],
  contextPaths?: string[]
): string {
  let prompt = `Regenerate specific sections of this workshop while preserving all other content unchanged.

**Current Workshop**:
\`\`\`yaml
${workshopYaml}
\`\`\`

**Sections to Regenerate**:
`;

  sectionIndices.forEach(([modIdx, secIdx]) => {
    prompt += `- Module ${modIdx + 1}, Section ${secIdx + 1}\n`;
  });

  if (newContext && newContext.length > 0) {
    prompt += `\n**New Context to Incorporate**:\n`;
    
    contextPaths?.forEach((path, index) => {
      if (newContext[index]) {
        prompt += `\n### ${path}\n\`\`\`\n${newContext[index]}\n\`\`\`\n`;
      }
    });

    prompt += `\nUpdate the specified sections to reference this new context. `;
  }

  prompt += `
**Requirements**:
1. Regenerate ONLY the specified sections with fresh content
2. Preserve all other sections, modules, and metadata exactly as-is
3. Maintain the same section types, durations, and overall structure
4. Ensure pedagogical quality matches the original workshop standards
${newContext ? '5. Ground regenerated sections in the new context provided' : ''}

**Output as JSON** — return the complete updated Workshop object:
\`\`\`json
{
  "title": "...",
  "topic": "...",
  "audience": {...},
  "duration": ...,
  "difficulty": "...",
  "prerequisites": [...],
  "context_sources": [...],
  "modules": [...]
}
\`\`\``;

  return prompt;
}
