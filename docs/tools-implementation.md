# Workshop Factory Copilot SDK Tools

## Overview

Custom tools for the GitHub Copilot SDK that enable workshop generation, loading, and validation.

## Implemented Tools

### 1. save_workshop (`src/tools/save.ts`)
- **Purpose**: Save a generated workshop to a YAML file
- **Parameters**:
  - `workshop`: Complete Workshop object matching the Zod schema
  - `filePath`: Destination path for the YAML file
- **Validation**: Validates against WorkshopSchema before saving
- **Returns**: Success/error message with file path

### 2. load_workshop (`src/tools/load.ts`)
- **Purpose**: Load an existing workshop from a YAML file
- **Parameters**:
  - `filePath`: Path to the YAML file to load
- **Validation**: Validates loaded data against WorkshopSchema
- **Returns**: Workshop object or error message

### 3. validate_structure (`src/tools/validate.ts`)
- **Purpose**: Validate workshop structure and pedagogical rules
- **Parameters**:
  - `workshop`: Workshop object to validate
- **Validation Checks** (9 rules):
  1. **Duration sum**: Section durations sum to module duration (±2min tolerance)
  2. **Total duration**: Module durations sum to workshop duration (±5min tolerance)
  3. **Exercise completeness**: Every exercise has non-empty starter_code AND solution
  4. **Checkpoint spacing**: No more than 25 minutes of content without a checkpoint
  5. **Practice ratio**: Exercises + discussions ≥ 60% of total duration
  6. **Lecture ratio**: Lectures ≤ 25% of total duration
  7. **Checkpoint ratio**: Checkpoints ≥ 15% of total duration
  8. **Bloom's alignment**: Learning objectives use appropriate verbs for workshop difficulty
  9. **Context sources**: Warns if listed context files don't exist on disk
- **Returns**: ValidationResult with detailed check results

## Standalone Functions

### validateWorkshop(workshop: Workshop): ValidationResult
- Can be used independently of the Copilot SDK
- Synchronous validation (file checks are async in tool handler)
- Returns structured validation results with pass/fail for each rule

## Types Exported

```typescript
interface ValidationCheck {
  rule: string;
  passed: boolean;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  checks: ValidationCheck[];
}
```

## Usage Example

```typescript
import {
  saveWorkshopTool,
  loadWorkshopTool,
  validateStructureTool,
  validateWorkshop
} from './tools/index.js';

// Register tools with Copilot SDK session
const session = await client.createSession({
  tools: [
    saveWorkshopTool,
    loadWorkshopTool,
    validateStructureTool
  ]
});

// Or use standalone validation
const result = validateWorkshop(workshop);
if (!result.valid) {
  console.error('Validation failed:', 
    result.checks.filter(c => !c.passed)
  );
}
```

## Pedagogical Rules

### Bloom's Taxonomy Alignment
- **Beginner**: remember, understand, apply
- **Intermediate**: understand, apply, analyze
- **Advanced**: apply, analyze, evaluate, create

### Action Verbs by Level
- **Remember**: define, list, recall, recognize, identify
- **Understand**: explain, summarize, interpret, classify, compare
- **Apply**: apply, execute, implement, solve, use
- **Analyze**: analyze, differentiate, organize, distinguish
- **Evaluate**: evaluate, critique, judge, justify, assess
- **Create**: create, design, develop, formulate, construct

### Duration Ratios
- Practice (exercises + discussions): ≥60%
- Lectures: ≤25%
- Checkpoints: ≥15%

### Checkpoint Spacing
- Maximum 25 minutes of content between checkpoints
- Ensures regular knowledge checks and feedback loops

## Build Status

✅ All files compile successfully with TypeScript
✅ Type definitions generated for IDE support
✅ Validation logic tested and working correctly
