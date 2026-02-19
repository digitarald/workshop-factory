# Workshop Generation Pedagogy Rules

> **Purpose**: This document defines the pedagogical constraints and best practices you MUST follow when generating workshop content. These rules ensure high-quality, practice-focused learning experiences.

---

## 1. Bloom's Taxonomy: Action Verb Alignment

**Rule**: All learning objectives MUST use action verbs that match or exceed the audience level's cognitive requirements.

### Action Verbs by Cognitive Level

- **Remember**: define, list, identify, recall, name, recognize, state, label
- **Understand**: explain, describe, summarize, interpret, classify, compare, discuss, paraphrase
- **Apply**: implement, use, execute, demonstrate, solve, apply, build, operate, navigate, craft, practice, calculate, modify, construct, produce, select, show
- **Analyze**: differentiate, examine, compare, contrast, debug, test, investigate, categorize, diagnose, classify, infer, identify, outline, attribute, organize
- **Evaluate**: assess, critique, justify, defend, judge, recommend, prioritize, validate, determine, decide, appraise, rank, measure, evaluate
- **Create**: design, build, construct, develop, compose, formulate, plan, architect, synthesize, generate, hypothesize, engineer

### Audience Level Requirements

| Audience Level | Minimum Cognitive Levels | Example Objective |
|-----------|-------------------------|-------------------|
| **Beginner** | Remember, Understand, Apply | "Implement a basic Docker container", "Explain container lifecycle" |
| **Intermediate** | Understand, Apply, Analyze | "Apply container best practices", "Debug multi-container networking issues" |
| **Advanced** | Analyze, Evaluate, Create | "Design a production-ready deployment pipeline", "Evaluate security trade-offs" |

**Validation**: Every learning objective MUST start with an action verb from the appropriate cognitive level tier.

### Section Content Cognitive Level

**Rule**: Not only learning objectives, but ALL section content must use cognitive level verbs appropriate for the audience level.

This validation applies to:
- **Exercise instructions**: What learners are asked to do
- **Lecture talking points**: Concepts being taught
- **Discussion prompts**: Questions posed to learners
- **Checkpoint questions**: Assessment items

**Examples of Misalignment**:

❌ **Beginner workshop using advanced verbs**:
- Exercise: "Design and architect a microservices system" (uses Create-level verbs)
- Discussion: "Evaluate the trade-offs between different architectures" (uses Evaluate-level verb)
- Checkpoint: "Critique this implementation approach" (uses Evaluate-level verb)

❌ **Advanced workshop using basic verbs**:
- Exercise: "List all the configuration options" (uses Remember-level verb)
- Lecture: "Define what a container is" (uses Remember-level verb)
- Checkpoint: "Recall the basic commands" (uses Remember-level verb)

✅ **Beginner workshop using appropriate verbs**:
- Exercise: "Implement a basic REST API endpoint" (uses Apply-level verb)
- Lecture: "Explain how HTTP requests work" (uses Understand-level verb)
- Checkpoint: "Identify the correct HTTP status code" (uses Remember-level verb)

✅ **Advanced workshop using appropriate verbs**:
- Exercise: "Analyze the performance bottlenecks in this system" (uses Analyze-level verb)
- Discussion: "Evaluate different caching strategies for this use case" (uses Evaluate-level verb)
- Checkpoint: "Design a monitoring solution for this microservice" (uses Create-level verb)

**Validation**: The validator scans all section content for Bloom's action verbs and flags any that are inappropriate for the declared audience level.

---

## 2. Practice-First Ratio

**Rule**: Workshop duration MUST be distributed according to these minimum thresholds.

### Required Time Allocation

- **≥60%** of total duration: Exercises + Discussions (hands-on practice)
- **≤25%** of total duration: Lectures (conceptual content delivery)
- **≥15%** of total duration: Checkpoints (knowledge checks, quizzes, assessments)

### Calculation Example

For a **120-minute workshop**:
- Minimum 72 minutes: exercises + discussions
- Maximum 30 minutes: lectures
- Minimum 18 minutes: checkpoints

**Validation**: Total workshop duration must sum correctly. Practice ratio failure is a HARD ERROR.

---

## 3. Exercise Timing Allocation

**Rule**: Allocate **2-3× the time** an expert practitioner would need to complete the exercise.

### Reasoning

- Learners need time to:
  - Read and understand instructions
  - Encounter and recover from errors
  - Explore and experiment
  - Ask questions or look up documentation

### Guidelines

| Expert Time | Allocate |
|------------|----------|
| 5 minutes | 10-15 minutes |
| 10 minutes | 20-30 minutes |
| 20 minutes | 40-60 minutes |

**Example**: If writing a Dockerfile takes an expert 8 minutes, allocate **16-24 minutes** for the exercise.

---

## 4. Checkpoint Spacing

**Rule**: Insert a checkpoint (knowledge check) every **20-25 minutes** of cumulative content.

### Purpose

- Catch misconceptions early
- Reinforce learning through retrieval practice
- Provide progress milestones

### Implementation

- Track cumulative time across sections
- When cumulative time reaches 20-25 minutes, insert a checkpoint section
- Checkpoints should take **5-7 minutes** (MINIMUM 5 minutes — sections shorter than 5 minutes are invalid)
- For a 60-minute workshop, ≥15% = at least 9 minutes of checkpoints, so plan at least 2 checkpoint sections

**Example Timeline**:
```
0:00 - Lecture (10min)
0:10 - Exercise (15min)
0:25 - Checkpoint (5min) ← First checkpoint at ~25min
0:30 - Lecture (8min)
0:38 - Exercise (12min)
0:50 - Checkpoint (5min) ← Second checkpoint at ~25min later
```

---

## 5. Scaffolding Progression

**Rule**: Within each module, structure sections in a progression from high to low support.

### Three-Stage Progression

1. **Worked Example** (Lecture)
   - Show complete solution with explanation
   - Demonstrate the entire process
   - Narrate decision-making

2. **Guided Practice** (Exercise)
   - Provide starter code or partial solution
   - Include hints and intermediate checks
   - Offer scaffolding to prevent getting stuck

3. **Independent Problem** (Exercise)
   - Minimal scaffolding
   - Open-ended challenge
   - Apply concepts without step-by-step guidance

### Example Module Structure

```
Module: Container Networking
├─ Lecture: Port Mapping Walkthrough (worked example)
├─ Exercise: Configure Port Mapping (guided, with starter Dockerfile)
├─ Exercise: Debug Multi-Container Networking (independent)
└─ Checkpoint: Networking Concepts Quiz
```

**Validation**: Each module should follow this pattern. Avoid jumping to independent problems without prior guidance.

---

## 6. Stack Adaptation

**Rule**: ALL code examples, exercises, and solutions MUST use the audience's declared technology stack.

### Implementation

- If audience stack is **Python/FastAPI**: Use Python examples, pip, pytest, uvicorn
- If audience stack is **Node.js/Express**: Use JavaScript/TypeScript, npm, Jest, Express
- If audience stack is **Ruby/Rails**: Use Ruby, bundler, RSpec, Rails conventions

### Anti-Patterns to Avoid

❌ **Generic/placeholder code**:
```dockerfile
# Generic example
COPY app.jar /app/
CMD ["java", "-jar", "app.jar"]
```

✅ **Stack-adapted code**:
```dockerfile
# Python/FastAPI example
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY ./app /app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

**Validation**: Every code block MUST reflect the audience's stack. No generic examples when stack is specified.

---

## 7. Context Grounding

**Rule**: When context documents are provided (via `--context` flag), exercises and examples MUST reference real features, APIs, and patterns from those documents.

### Requirements

- **Exercises**: Reference actual APIs, features, or workflows from context docs
- **Examples**: Use real code patterns, not invented placeholders
- **Terminology**: Match the vocabulary used in context docs

### Example

**Given context**: Feature brief for "GitHub Actions Cache API v2"

❌ **Generic exercise**:
> "Create a caching workflow for your build artifacts."

✅ **Context-grounded exercise**:
> "Implement the Cache API v2's `restore-keys` fallback pattern to speed up your Python dependency installation. Use the new `@actions/cache/restore` and `@actions/cache/save` split actions introduced in v2."

**Validation**: If context documents are provided, every exercise should contain at least one direct reference to context content.

---

## 8. Duration Constraints

**Rule**: Durations must be internally consistent and meet minimum thresholds.

### Section-Level Rules

- **Minimum section duration**: 5 minutes
- **Maximum lecture duration**: 15 minutes (before requiring a practice break)
- Section durations within a module MUST sum to module duration (**±2 minute tolerance**)

### Module-Level Rules

- Module durations MUST sum to workshop duration (**±5 minute tolerance**)

### Validation Formula

```
Total Workshop Duration = Σ(Module Durations)
Module Duration = Σ(Section Durations within module)

Tolerance: ±5 minutes at workshop level, ±2 minutes at module level
```

**Example**:
```yaml
workshop:
  duration: 120  # minutes

modules:
  - title: "Getting Started"
    duration: 30
    sections:
      - type: lecture
        duration: 10
      - type: exercise
        duration: 15
      - type: checkpoint
        duration: 5
    # Sum: 10 + 15 + 5 = 30 ✓

  - title: "Advanced Topics"
    duration: 90
    sections:
      # ... sections sum to 90
```

---

## Validation Checklist

Before returning generated content, verify:

- [ ] All learning objectives use Bloom's action verbs at appropriate level
- [ ] All section content (exercise instructions, lecture points, discussion prompts, checkpoint questions) uses cognitive level verbs appropriate for the audience level
- [ ] Practice ratio ≥60%, lectures ≤25%, checkpoints ≥15%
- [ ] Exercises allocate 2-3× expert completion time
- [ ] Checkpoints appear every 20-25 minutes
- [ ] Each module follows scaffolding progression (worked → guided → independent)
- [ ] All code uses audience's declared stack
- [ ] Exercises reference provided context documents (if applicable)
- [ ] Section durations sum to module duration (±2min)
- [ ] Module durations sum to workshop duration (±5min)
- [ ] No lecture section exceeds 15 minutes
- [ ] No section is shorter than 5 minutes
- [ ] Every exercise has `starter_code` and `solution` fields
- [ ] Every checkpoint has `questions`, `expected_answers`, and `explanations` arrays

---

## Generation Priority

When trade-offs are necessary, prioritize in this order:

1. **Practice ratio** — hitting the 60% minimum is non-negotiable
2. **Stack adaptation** — code must be runnable by the target audience
3. **Checkpoint spacing** — knowledge checks prevent compounding confusion
4. **Scaffolding** — progression from guided to independent prevents frustration
5. **Bloom's alignment** — ensures objectives match audience level

**Never compromise on**: Practice ratio, stack adaptation, or duration consistency.
