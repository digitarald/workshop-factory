---
name: explainer-sites
description: 'Create stunning single-page explainer sites for proposals, RFCs, product specs, technical docs, strategy documents, roadmaps, and business cases. Acts as a design thinking partner: discovers narratives from vague ideas through interview-style questioning, challenges assumptions, stress-tests claims, then synthesizes into dual outputs — a structured markdown source of truth plus a visually compelling dark-themed HTML presentation.'
---

# Single-Page Explainer Sites

Create beautiful, information-dense single-page HTML documents that persuade stakeholders and communicate complex ideas with visual impact.

## When to Use

- Product proposals and RFCs
- Technical architecture documents
- Strategy and roadmap presentations
- Data schema and API documentation
- Business cases and impact analyses
- Migration or transformation plans
- Customer-facing feature explainers

## Design Philosophy

Explainer sites are **persuasive narratives**, not information dumps:

1. **Tell a story**: Problem → Transformation → Solution → Impact
2. **Progressive disclosure**: Lead with headlines, let readers drill deeper
3. **Show, don't tell**: Visualize data flows, timelines, before/after states
4. **Emotional resonance**: Pain points feel painful, solutions feel elegant
5. **Respect cognitive load**: Break complexity into digestible visual chunks
6. **Stress-test the thinking**: Challenge assumptions before stakeholders do

## Critical Rule: No Fabrication

**NEVER invent facts, statistics, timelines, team names, or technical details.** Every piece of content must come from:
- Information explicitly provided by the user
- Documents or files the user shares
- Answers to discovery questions

If information is missing, ask for it. Use placeholder text like `[INSERT METRIC]` or `[TEAM NAME]` rather than making things up. A beautiful but inaccurate explainer is worse than no explainer.

## Dual Output: Source of Truth + Presentation

Always generate **two files** together:

| File | Purpose |
|------|--------|
| `[name].md` | **Source of truth** — All facts, assumptions, and discussion points in structured bullet format. Easy to update as the idea evolves. |
| `[name].html` | **Presentation** — Visual explainer site. Generated FROM the markdown, not independent of it. |

The markdown file is the canonical record of what was discussed and decided. The HTML is one possible visualization of that content. When assumptions change, update the markdown first, then regenerate the HTML.

### Companion Markdown Structure

```markdown
# [Title]

> [One-line tagline/subtitle]

## Meta
- **Author**: [name]
- **Last updated**: [date]
- **Status**: Draft | Review | Final
- **Audience**: [who this is for]
- **The Ask**: [what you need from readers]

## TL;DR
[2-3 sentence executive summary]

## Problem
### Pain Points
- [Specific pain point 1] — *Evidence: [source]*
- [Specific pain point 2] — *Evidence: [source]*

### Current State
- [How things work today]
- [What's broken or missing]

### Impact
- [Quantified impact, e.g., "X hours/week lost"]
- [Who is affected]

## Solution
### Proposal
- [What you're proposing]
- [Key components]

### Benefits
- [Benefit 1] — *Enables: [outcome]*
- [Benefit 2] — *Enables: [outcome]*

### How It Works
- [Step/phase 1]
- [Step/phase 2]

## Assumptions
> These are beliefs we're operating on. Flag if any are wrong.

- [ ] [Assumption 1] — *Status: Unvalidated | Validated | Invalidated*
- [ ] [Assumption 2] — *Status: ...*

## Open Questions
- [ ] [Question that needs answering]
- [ ] [Decision that needs making]

## Known Gaps & Risks
- [Gap 1]: [What's missing and why]
- [Risk 1]: [What could go wrong]

## Out of Scope
- [Thing 1 we're explicitly NOT doing]
- [Thing 2]

## Timeline / Milestones
| Phase | Target | Status |
|-------|--------|--------|
| [Phase 1] | [Date] | Done / Current / Future |

## Discussion Log
| Date | Topic | Decision/Outcome |
|------|-------|------------------|
| [date] | [what was discussed] | [what was decided] |
```

This structure makes it easy to:
- Track what's confirmed vs. assumed
- Update content as the idea evolves
- Regenerate the HTML with fresh assumptions
- Maintain a record of how the thinking developed

## Procedure

### 1. Discover the Narrative (Interview Mode)

Most users arrive with a vague idea, not a polished story. **Your first job is to help them find the narrative** through design thinking and structured questioning.

Use the `ask_questions` tool to conduct an interview-style discovery session:

#### Phase 1: Diverge (Explore the Space)

Start broad to understand the full context:
- What problem are you trying to solve? Who feels this pain most acutely?
- What does success look like? What's the end state?
- Who is the audience? What decision do you want them to make?
- What's "the ask" — what do you need from readers?

#### Phase 2: Challenge Assumptions

**Be a thinking partner, not a yes-machine.** Push back constructively on claims:

- "You said X costs the team Y hours/week — how do you know? Can you back that up?"
- "What's the strongest argument *against* this proposal? How would a skeptic respond?"
- "You're assuming [Z] — what if that's not true? What's the fallback?"
- "Is this the *only* solution, or the *best* solution? What alternatives did you consider?"
- "Who might oppose this? What's their perspective?"

This isn't adversarial — it's helping the user stress-test their thinking before stakeholders do. A well-challenged proposal is a stronger proposal.

#### Phase 3: Converge (Fill the Gaps)

Based on what's missing, probe deeper:
- "You mentioned X is broken — can you quantify the impact?"
- "What's blocking the solution today? Technical? Organizational? Political?"
- "What are the milestones or phases to get there?"
- "What's explicitly out of scope? What are you *not* solving?"
- "What are the known risks or gaps you want to acknowledge honestly?"
- "What data or evidence supports the key claims?"

#### Phase 4: Synthesize and Confirm

Before building, summarize back the narrative:
> "Here's the story I'm hearing: [Problem] is causing [Pain] for [Audience]. You're proposing [Solution] which will [Benefit]. The key evidence is [Data]. The ask is [CTA]. The main risk you're acknowledging is [Gap]. Does that capture it?"

Only proceed to building once the user confirms the narrative arc. If they say "actually..." — that's a sign to loop back and refine.

### 2. Outline the Story Structure

With the narrative confirmed, map it to sections:
- What's the painful status quo? (Problem)
- What's the elegant end state? (Solution)
- What's the transformation path? (How)
- What's the ask from readers? (CTA)

### 3. Choose Sections

Select from the [section patterns](./references/section-patterns.md) based on content:

| Section | Use When |
|---------|----------|
| Executive Summary | Always — the "read nothing else" TL;DR |
| Business Impact | Justifying investment or priority |
| Timeline | Showing milestones or phases |
| Current State (Problem) | Visualizing painful status quo |
| Target State (Solution) | Showing elegant end state |
| Implementation | Explaining the approach |
| Data Visualization | Schemas, mappings, flows |
| Metrics/KPIs | Defining success measures |
| Known Gaps | Acknowledging limitations honestly |
| Out of Scope | Setting expectations |

### 4. Apply the Design System

Use the [design system](./references/design-system.md) for consistent visual language:
- Dark theme foundation (#0d1117 → #21262d)
- Semantic accent colors (blue=action, purple=new, green=success, red=problem)
- System fonts with monospace for code
- Generous spacing with 60px between sections

### 5. Build Components

Use [component patterns](./references/components.md) for:
- Badges and status tags
- Cards with accent borders
- Flow diagrams with numbered steps
- Interactive elements with modals
- Legends for color-coded content

### 6. Write Content

Follow [content strategy](./references/content-strategy.md):
- Headlines as action verbs and outcomes
- Frame as contrast pairs (blocked vs enabled)
- Quantify impact with large bold numbers
- Use consistent emoji vocabulary

### 7. Generate Both Outputs

Create both files together:

1. **First, the markdown** (`[name].md`) — Capture all facts, assumptions, and structure in the companion format
2. **Then, the HTML** (`[name].html`) — Visualize the markdown content with the design system

The markdown is the source; the HTML is derived from it. Every fact in the HTML must trace back to the markdown.

### 8. Validate

Before delivery, check:

**Markdown (source of truth):**
- [ ] All facts have evidence sources noted
- [ ] Assumptions are explicitly listed with status
- [ ] Open questions are captured
- [ ] Discussion log reflects key decisions

**HTML (presentation):**
- [ ] Hero has gradient text and compelling subtitle
- [ ] Executive summary has clear TL;DR and "The Ask"
- [ ] Problem section uses red/warning colors
- [ ] Solution section uses green/success colors
- [ ] All color-coded items have legends
- [ ] Technical details use monospace fonts
- [ ] Footer links to related resources
- [ ] Mobile-friendly grid fallbacks

**Cross-check:**
- [ ] Every claim in HTML exists in markdown
- [ ] No visual elements imply facts not in the source

## Quick Start Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Title] - Visual Overview</title>
  <style>
    /* See design-system.md for full styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
      color: #e6edf3;
      min-height: 100vh;
      padding: 40px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 {
      font-size: 32px;
      background: linear-gradient(90deg, #58a6ff, #a371f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .section { margin-bottom: 60px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>[Title]</h1>
    <p class="subtitle">[Compelling tagline]</p>
    
    <!-- Executive Summary -->
    <!-- Business Impact -->
    <!-- Current State (Problem) -->
    <!-- Transformation -->
    <!-- Target State (Solution) -->
    <!-- Implementation -->
    <!-- Footer -->
  </div>
</body>
</html>
```

## Anti-Patterns

- **Fabricating content**: Never invent facts, stats, or details — use placeholders instead
- **Skipping discovery**: Don't jump to building without confirming the narrative
- **Being a yes-machine**: Challenge assumptions; unchallenged claims make weak proposals
- **HTML without markdown**: Always generate the source of truth first
- **Visual facts not in source**: If it's in the HTML, it must be in the markdown
- **Wall of text**: Break into cards or lists if >3 paragraphs
- **Inconsistent colors**: Pick semantic meaning for each color, stick to it
- **Missing legends**: Always explain color-coding
- **Buried CTA**: The ask should be visible near the top
- **Flat layouts**: Use depth with borders, shadows, layered backgrounds
- **Generic landing page**: This is an information-dense doc, not a marketing page

## Reference Files

- [Design System](./references/design-system.md) — Colors, typography, spacing
- [Section Patterns](./references/section-patterns.md) — The 14 section types with CSS
- [Components](./references/components.md) — Badges, cards, flows, modals
- [Content Strategy](./references/content-strategy.md) — Headlines, contrast pairs, emojis
