import { z } from 'zod';

// Bloom's taxonomy cognitive levels
export const BloomsLevelSchema = z.enum([
  'remember',
  'understand',
  'apply',
  'analyze',
  'evaluate',
  'create',
]);
export type BloomsLevel = z.infer<typeof BloomsLevelSchema>;

// Learning objective with Bloom's taxonomy tagging
export const LearningObjectiveSchema = z.object({
  text: z.string(),
  blooms_level: BloomsLevelSchema,
});
export type LearningObjective = z.infer<typeof LearningObjectiveSchema>;

// Section types — discriminated union on `type`
export const LectureSectionSchema = z.object({
  type: z.literal('lecture'),
  title: z.string(),
  duration: z.number().positive(), // minutes
  talking_points: z.array(z.string()),
});
export type LectureSection = z.infer<typeof LectureSectionSchema>;

export const ExerciseSectionSchema = z.object({
  type: z.literal('exercise'),
  title: z.string(),
  duration: z.number().positive(), // minutes
  instructions: z.string(),
  starter_code: z.string(),
  solution: z.string(),
  hints: z.array(z.string()),
});
export type ExerciseSection = z.infer<typeof ExerciseSectionSchema>;

export const DiscussionSectionSchema = z.object({
  type: z.literal('discussion'),
  title: z.string(),
  duration: z.number().positive(), // minutes
  prompts: z.array(z.string()),
});
export type DiscussionSection = z.infer<typeof DiscussionSectionSchema>;

export const CheckpointSectionSchema = z.object({
  type: z.literal('checkpoint'),
  title: z.string(),
  duration: z.number().positive(), // minutes
  questions: z.array(z.string()),
  expected_answers: z.array(z.string()),
  explanations: z.array(z.string()),
});
export type CheckpointSection = z.infer<typeof CheckpointSectionSchema>;

// Discriminated union of all section types
export const SectionSchema = z.discriminatedUnion('type', [
  LectureSectionSchema,
  ExerciseSectionSchema,
  DiscussionSectionSchema,
  CheckpointSectionSchema,
]);
export type Section = z.infer<typeof SectionSchema>;

// Module — collection of sections with learning objectives
export const ModuleSchema = z.object({
  title: z.string(),
  duration: z.number().positive(), // minutes
  learning_objectives: z.array(LearningObjectiveSchema),
  sections: z.array(SectionSchema),
});
export type Module = z.infer<typeof ModuleSchema>;

// Audience configuration
export const AudienceSchema = z.object({
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  stack: z.string().optional(),
  size: z.number().optional(),
});
export type Audience = z.infer<typeof AudienceSchema>;

// Workshop — top-level data structure
export const WorkshopSchema = z.object({
  title: z.string(),
  topic: z.string(),
  audience: AudienceSchema,
  duration: z.number().positive(), // minutes
  prerequisites: z.array(z.string()),
  context_sources: z.array(z.string()), // paths to injected docs
  modules: z.array(ModuleSchema),
});
export type Workshop = z.infer<typeof WorkshopSchema>;
