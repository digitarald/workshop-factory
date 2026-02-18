# Workshop Slides Design Guide

You are generating the HTML/CSS/JS files for a **workshop attendee guide** — a set of slides that participants follow during a live workshop. The output must be visually striking, highly functional, and optimized for learning.

## Audience

**Workshop attendees** — people actively learning. NOT instructors, NOT curriculum designers.

### Content Transformation Rules

You receive a Workshop JSON object containing internal pedagogical metadata. You MUST transform it for learners:

- **DROP Bloom's taxonomy levels** — never show `blooms_level` values. Attendees don't know or care about cognitive taxonomy.
- **REWRITE talking points** — `talking_points` arrays are instructor scaffolding. Transform them into clear, explanatory prose paragraphs that teach the concept directly.
- **DROP section type labels** — never show raw labels like "LECTURE", "CHECKPOINT", "DISCUSSION". Differentiate section types through visual design (icons, colors, layout), not labels.
- **DROP context sources** — `context_sources` is internal generation metadata. Never display it.
- **REFRAME durations** — show soft pacing hints ("~10 min") at the module level only. Don't show per-section timings.
- **REFRAME learning objectives** — show as "What you'll learn" in plain, action-oriented language. Never mention Bloom's.
- **DROP internal metadata** — `difficulty`, `audience.level`, `audience.size` are not for attendees.

### Content Presentation by Section Type

- **Lectures**: Render talking points as flowing explanatory content with clear paragraphs. Add emphasis to key concepts. This should read like a well-written tutorial, not bullet points.
- **Exercises**: Prominent starter code block with copy button. Clear step-by-step instructions. Solution in a collapsible section. Hints in progressive collapsibles (reveal one at a time).
- **Discussions**: Present as engaging reflection prompts with visual distinction. Use a conversational tone.
- **Checkpoints**: Present as "Check your understanding" sections. Questions visible, answers/explanations in collapsibles.

## Design Requirements

### Typography
- Use a distinctive display font for headings and a clean, refined body font — avoid generic choices (Inter, Arial, Roboto, system fonts).
- Code blocks: use a monospace font at a generous size (≥16px) with comfortable line-height. Code readability is critical in a workshop.
- Clear visual hierarchy: workshop title > module titles > section titles > content.

### Color & Theme
- Support both dark and light themes with a CSS toggle (persist choice in localStorage).
- Use CSS custom properties for all colors.
- Default to dark theme with a refined, non-generic palette.
- Exercises should feel interactive/energetic — warmer accent colors.
- Checkpoints should feel attention-grabbing — distinct visual treatment.
- Discussions should feel inviting/open — softer treatment.
- Lecture content should feel calm/focused — neutral treatment.
- Syntax highlighting for code blocks using CSS classes (no external library needed — color keywords, strings, comments, numbers).

### Layout
- **Sticky sidebar TOC** on desktop (collapsible on mobile) showing all modules and sections with scroll-spy active state.
- **Progress indicator** showing position within the workshop (e.g., "Module 2 of 4").
- Generous whitespace between sections.
- Max content width of ~800px for comfortable reading, centered.
- Print-friendly: `@media print` styles that expand all collapsibles and use light background.

### Interactivity (JavaScript)
- **Copy-to-clipboard** button on all code blocks (with visual feedback).
- **Collapsible sections** for solutions, hints, and checkpoint answers (with smooth CSS transitions).
- **Theme toggle** (dark/light) persisted to localStorage.
- **Scroll spy** for sidebar TOC — highlight current section as user scrolls.
- **Smooth scroll** when clicking TOC links.
- **Keyboard navigation**: arrow keys to move between sections, `t` to toggle theme.
- No external JavaScript dependencies.

### Responsive Design
- **Projector-friendly**: at large viewports, ensure text is large enough to read from the back of a room.
- **Laptop**: comfortable reading with sidebar TOC visible.
- **Tablet/mobile**: collapse sidebar to hamburger menu, stack layout vertically.

### Accessibility
- Proper heading hierarchy (h1 > h2 > h3, no skipped levels).
- ARIA attributes on collapsible sections (`aria-expanded`, `aria-controls`).
- Sufficient color contrast in both themes (WCAG AA minimum).
- Focus indicators on interactive elements.
- Semantic HTML elements (`nav`, `main`, `article`, `section`, `details`).

## Output

Generate files by calling the `write_file` tool for each:

1. **`slides/index.html`** — the complete workshop guide HTML document. Links to `styles.css` and `script.js` as sibling files.
2. **`slides/styles.css`** — all styling including both themes, responsive breakpoints, print styles, and code highlighting.
3. **`slides/script.js`** — all interactivity: copy buttons, collapsibles, theme toggle, scroll spy, keyboard navigation.

Each file should be complete and self-contained (no CDN dependencies). The HTML should work when opened directly in a browser via `file://` protocol.

### Quality Bar
- The result should look like a polished, custom-built workshop site — not a generic template.
- Every design choice should be intentional and serve the learning experience.
- Code blocks are the most important visual element in a workshop — make them beautiful and functional.
