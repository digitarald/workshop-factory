import { writeFile } from 'node:fs/promises';
import type { Workshop } from '../schema.js';

/**
 * Escapes HTML special characters to prevent XSS and display issues.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Converts a Workshop object to a self-contained dark-themed HTML document.
 */
export function exportToHtml(workshop: Workshop): string {
  const html: string[] = [];

  // HTML header with inline CSS
  html.push(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(workshop.title)}</title>
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --bg-primary: #1a1a2e;
      --bg-secondary: #16213e;
      --bg-code: #0f1419;
      --text-primary: #e4e4e7;
      --text-secondary: #a1a1aa;
      --text-muted: #71717a;
      --accent: #60a5fa;
      --accent-hover: #3b82f6;
      --border: #27272a;
      --success: #22c55e;
      --warning: #f59e0b;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: var(--text-primary);
      background: var(--bg-primary);
      padding: 2rem 1rem;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      background: var(--bg-secondary);
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }

    /* Typography */
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
      border-bottom: 2px solid var(--accent);
      padding-bottom: 0.5rem;
    }

    h2 {
      font-size: 2rem;
      margin: 2rem 0 1rem;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }

    h3 {
      font-size: 1.5rem;
      margin: 1.5rem 0 0.75rem;
      color: var(--text-primary);
    }

    h4 {
      font-size: 1.25rem;
      margin: 1rem 0 0.5rem;
      color: var(--text-secondary);
    }

    p {
      margin: 0.75rem 0;
    }

    /* Metadata section */
    .metadata {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: var(--bg-primary);
      border-radius: 6px;
      border: 1px solid var(--border);
    }

    .metadata-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .metadata-label {
      font-size: 0.875rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metadata-value {
      font-size: 1.125rem;
      color: var(--text-primary);
      font-weight: 500;
    }

    /* Lists */
    ul, ol {
      margin: 1rem 0 1rem 1.5rem;
    }

    li {
      margin: 0.5rem 0;
      color: var(--text-secondary);
    }

    /* Table of Contents */
    .toc {
      background: var(--bg-primary);
      padding: 1.5rem;
      border-radius: 6px;
      margin: 2rem 0;
      border: 1px solid var(--border);
    }

    .toc h2 {
      margin-top: 0;
      border: none;
    }

    .toc-list {
      list-style: none;
      margin-left: 0;
    }

    .toc-module {
      margin: 1rem 0;
      font-weight: 600;
      color: var(--text-primary);
    }

    .toc-section {
      margin: 0.5rem 0 0.5rem 1.5rem;
      font-weight: 400;
      color: var(--text-secondary);
    }

    .toc a {
      color: var(--accent);
      text-decoration: none;
      transition: color 0.2s;
    }

    .toc a:hover {
      color: var(--accent-hover);
      text-decoration: underline;
    }

    /* Module and section styling */
    .module {
      margin: 3rem 0;
    }

    .section {
      margin: 2rem 0;
      padding: 1.5rem;
      background: var(--bg-primary);
      border-radius: 6px;
      border-left: 3px solid var(--accent);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 1rem;
    }

    .section-type {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: var(--bg-code);
      border-radius: 4px;
      font-size: 0.875rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .duration {
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    /* Learning objectives */
    .learning-objectives {
      background: var(--bg-code);
      padding: 1rem;
      border-radius: 6px;
      margin: 1rem 0;
    }

    .learning-objectives h4 {
      margin-top: 0;
      color: var(--success);
    }

    .objective {
      margin: 0.5rem 0;
      padding-left: 0.5rem;
    }

    .blooms-level {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      background: var(--bg-secondary);
      border-radius: 3px;
      font-size: 0.75rem;
      color: var(--warning);
      margin-left: 0.5rem;
    }

    /* Code blocks */
    pre {
      background: var(--bg-code);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 1.25rem;
      overflow-x: auto;
      margin: 1rem 0;
    }

    code {
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
      font-size: 0.875rem;
      line-height: 1.5;
      color: #e4e4e7;
    }

    /* Collapsible sections */
    details {
      margin: 1rem 0;
      padding: 1rem;
      background: var(--bg-code);
      border-radius: 6px;
      border: 1px solid var(--border);
    }

    summary {
      cursor: pointer;
      font-weight: 600;
      color: var(--accent);
      padding: 0.5rem;
      user-select: none;
      list-style: none;
      display: flex;
      align-items: center;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary::before {
      content: '▶';
      display: inline-block;
      margin-right: 0.5rem;
      transition: transform 0.2s;
    }

    details[open] summary::before {
      transform: rotate(90deg);
    }

    summary:hover {
      color: var(--accent-hover);
    }

    details[open] {
      padding-bottom: 1rem;
    }

    details > *:not(summary) {
      margin-top: 1rem;
    }

    /* Talking points, prompts, questions */
    .talking-points,
    .prompts,
    .questions {
      margin: 1rem 0;
    }

    .talking-points li,
    .prompts li,
    .questions li {
      margin: 0.75rem 0;
      padding-left: 0.5rem;
      border-left: 2px solid var(--border);
    }

    /* Instructions */
    .instructions {
      margin: 1rem 0;
      padding: 1rem;
      background: var(--bg-code);
      border-radius: 6px;
      border-left: 3px solid var(--accent);
    }

    /* Footer */
    .footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border);
      text-align: center;
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    /* Print styles */
    @media print {
      body {
        background: white;
        color: black;
        padding: 0;
      }

      .container {
        background: white;
        box-shadow: none;
        max-width: 100%;
      }

      h1, h2, h3, h4 {
        color: black;
        page-break-after: avoid;
      }

      .section,
      .metadata,
      .toc,
      .learning-objectives,
      details,
      .instructions {
        background: white;
        border-color: #ccc;
        page-break-inside: avoid;
      }

      pre {
        background: #f5f5f5;
        border-color: #ccc;
        page-break-inside: avoid;
      }

      code {
        color: black;
      }

      details {
        border: 1px solid #ccc;
      }

      summary {
        color: #0066cc;
      }

      /* Show all collapsible content when printing */
      details {
        display: block;
      }

      summary::before {
        display: none;
      }

      .metadata-label,
      .duration,
      .section-type {
        color: #666;
      }

      .metadata-value,
      li {
        color: black;
      }

      a {
        color: #0066cc;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      body {
        padding: 1rem 0.5rem;
      }

      .container {
        padding: 1.5rem;
      }

      h1 {
        font-size: 2rem;
      }

      h2 {
        font-size: 1.5rem;
      }

      h3 {
        font-size: 1.25rem;
      }

      .metadata {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  </style>
</head>
<body>
  <div class="container">
`);

  // 1. Header: Workshop title
  html.push(`    <h1>${escapeHtml(workshop.title)}</h1>\n`);

  // 2. Metadata section
  html.push(`    <div class="metadata">\n`);
  html.push(`      <div class="metadata-item">\n`);
  html.push(`        <span class="metadata-label">Topic</span>\n`);
  html.push(`        <span class="metadata-value">${escapeHtml(workshop.topic)}</span>\n`);
  html.push(`      </div>\n`);
  
  html.push(`      <div class="metadata-item">\n`);
  html.push(`        <span class="metadata-label">Audience</span>\n`);
  const audienceText = workshop.audience.stack 
    ? `${workshop.audience.level} (${workshop.audience.stack})`
    : workshop.audience.level;
  html.push(`        <span class="metadata-value">${escapeHtml(audienceText)}</span>\n`);
  html.push(`      </div>\n`);
  
  html.push(`      <div class="metadata-item">\n`);
  html.push(`        <span class="metadata-label">Duration</span>\n`);
  html.push(`        <span class="metadata-value">${workshop.duration} minutes</span>\n`);
  html.push(`      </div>\n`);
  
  html.push(`      <div class="metadata-item">\n`);
  html.push(`        <span class="metadata-label">Difficulty</span>\n`);
  html.push(`        <span class="metadata-value">${escapeHtml(workshop.difficulty)}</span>\n`);
  html.push(`      </div>\n`);
  html.push(`    </div>\n`);

  // 3. Prerequisites
  if (workshop.prerequisites.length > 0) {
    html.push(`\n    <h2>Prerequisites</h2>\n`);
    html.push(`    <ul>\n`);
    workshop.prerequisites.forEach((prereq) => {
      html.push(`      <li>${escapeHtml(prereq)}</li>\n`);
    });
    html.push(`    </ul>\n`);
  }

  // 4. Context Sources
  if (workshop.context_sources.length > 0) {
    html.push(`\n    <h2>Context Sources</h2>\n`);
    html.push(`    <ul>\n`);
    workshop.context_sources.forEach((source) => {
      html.push(`      <li>${escapeHtml(source)}</li>\n`);
    });
    html.push(`    </ul>\n`);
  }

  // 5. Table of Contents
  html.push(`\n    <div class="toc">\n`);
  html.push(`      <h2>Table of Contents</h2>\n`);
  html.push(`      <ul class="toc-list">\n`);
  workshop.modules.forEach((module, moduleIdx) => {
    const moduleId = `module-${moduleIdx + 1}`;
    html.push(`        <li class="toc-module">\n`);
    html.push(`          <a href="#${moduleId}">${moduleIdx + 1}. ${escapeHtml(module.title)}</a> <span class="duration">(${module.duration} min)</span>\n`);
    html.push(`          <ul class="toc-list">\n`);
    module.sections.forEach((section, sectionIdx) => {
      const sectionId = `section-${moduleIdx + 1}-${sectionIdx + 1}`;
      html.push(`            <li class="toc-section">\n`);
      html.push(`              <a href="#${sectionId}">${moduleIdx + 1}.${sectionIdx + 1}. ${escapeHtml(section.title)}</a> <span class="duration">(${section.duration} min)</span>\n`);
      html.push(`            </li>\n`);
    });
    html.push(`          </ul>\n`);
    html.push(`        </li>\n`);
  });
  html.push(`      </ul>\n`);
  html.push(`    </div>\n`);

  // 6. Modules
  workshop.modules.forEach((module, moduleIdx) => {
    const moduleId = `module-${moduleIdx + 1}`;
    html.push(`\n    <div class="module" id="${moduleId}">\n`);
    html.push(`      <h2>${moduleIdx + 1}. ${escapeHtml(module.title)}</h2>\n`);
    
    // Learning Objectives
    if (module.learning_objectives.length > 0) {
      html.push(`      <div class="learning-objectives">\n`);
      html.push(`        <h4>Learning Objectives</h4>\n`);
      html.push(`        <ul>\n`);
      module.learning_objectives.forEach((objective) => {
        html.push(`          <li class="objective">\n`);
        html.push(`            ${escapeHtml(objective.text)}\n`);
        html.push(`            <span class="blooms-level">${escapeHtml(objective.blooms_level)}</span>\n`);
        html.push(`          </li>\n`);
      });
      html.push(`        </ul>\n`);
      html.push(`      </div>\n`);
    }
    
    html.push(`      <p class="duration"><strong>Duration:</strong> ${module.duration} minutes</p>\n`);
    
    // 7. Sections
    module.sections.forEach((section, sectionIdx) => {
      const sectionId = `section-${moduleIdx + 1}-${sectionIdx + 1}`;
      html.push(`\n      <div class="section" id="${sectionId}">\n`);
      html.push(`        <div class="section-header">\n`);
      html.push(`          <h3>${moduleIdx + 1}.${sectionIdx + 1}. ${escapeHtml(section.title)}</h3>\n`);
      html.push(`          <span class="section-type">${escapeHtml(section.type)}</span>\n`);
      html.push(`        </div>\n`);
      html.push(`        <p class="duration"><strong>Duration:</strong> ${section.duration} minutes</p>\n`);
      
      // Format based on section type
      switch (section.type) {
        case 'lecture':
          html.push(`        <h4>Talking Points</h4>\n`);
          html.push(`        <ul class="talking-points">\n`);
          section.talking_points.forEach((point) => {
            html.push(`          <li>${escapeHtml(point)}</li>\n`);
          });
          html.push(`        </ul>\n`);
          break;
          
        case 'exercise':
          html.push(`        <div class="instructions">\n`);
          html.push(`          ${escapeHtml(section.instructions)}\n`);
          html.push(`        </div>\n`);
          
          // Starter Code
          html.push(`        <h4>Starter Code</h4>\n`);
          html.push(`        <pre><code>${escapeHtml(section.starter_code)}</code></pre>\n`);
          
          // Solution (collapsible)
          html.push(`        <details>\n`);
          html.push(`          <summary>Solution</summary>\n`);
          html.push(`          <pre><code>${escapeHtml(section.solution)}</code></pre>\n`);
          html.push(`        </details>\n`);
          
          // Hints (collapsible)
          if (section.hints.length > 0) {
            html.push(`        <details>\n`);
            html.push(`          <summary>Hints</summary>\n`);
            html.push(`          <ol>\n`);
            section.hints.forEach((hint) => {
              html.push(`            <li>${escapeHtml(hint)}</li>\n`);
            });
            html.push(`          </ol>\n`);
            html.push(`        </details>\n`);
          }
          break;
          
        case 'discussion':
          html.push(`        <h4>Prompts</h4>\n`);
          html.push(`        <ol class="prompts">\n`);
          section.prompts.forEach((prompt) => {
            html.push(`          <li>${escapeHtml(prompt)}</li>\n`);
          });
          html.push(`        </ol>\n`);
          break;
          
        case 'checkpoint':
          html.push(`        <h4>Questions</h4>\n`);
          html.push(`        <ol class="questions">\n`);
          section.questions.forEach((question) => {
            html.push(`          <li>${escapeHtml(question)}</li>\n`);
          });
          html.push(`        </ol>\n`);
          
          // Answers (collapsible)
          html.push(`        <details>\n`);
          html.push(`          <summary>Answers</summary>\n`);
          html.push(`          <ol>\n`);
          section.expected_answers.forEach((answer, idx) => {
            html.push(`            <li>\n`);
            html.push(`              <strong>Answer:</strong> ${escapeHtml(answer)}<br>\n`);
            if (section.explanations[idx]) {
              html.push(`              <strong>Explanation:</strong> ${escapeHtml(section.explanations[idx])}\n`);
            }
            html.push(`            </li>\n`);
          });
          html.push(`          </ol>\n`);
          html.push(`        </details>\n`);
          break;
      }
      
      html.push(`      </div>\n`);
    });
    
    html.push(`    </div>\n`);
  });

  // 8. Footer
  html.push(`\n    <div class="footer">\n`);
  html.push(`      <p>Generated by Workshop Factory on ${new Date().toISOString()}</p>\n`);
  html.push(`    </div>\n`);

  html.push(`  </div>\n`);
  html.push(`</body>\n`);
  html.push(`</html>\n`);

  return html.join('');
}

/**
 * Exports a Workshop to an HTML file on disk.
 */
export async function exportToHtmlFile(
  workshop: Workshop,
  outputPath: string
): Promise<void> {
  const htmlContent = exportToHtml(workshop);
  await writeFile(outputPath, htmlContent, 'utf-8');
}
