# Design System

## Color Palette

Dark theme foundation with semantic accent colors:

```css
:root {
  /* Foundation */
  --bg-primary: #0d1117;      /* Deep background */
  --bg-secondary: #161b22;    /* Elevated surfaces */
  --bg-tertiary: #21262d;     /* Cards and sections */
  --border-default: #30363d;  /* Subtle borders */
  --border-emphasis: #8b949e; /* Emphasized borders */

  /* Text hierarchy */
  --text-primary: #e6edf3;    /* Headlines and body */
  --text-secondary: #8b949e;  /* Supporting text */
  --text-tertiary: #6e7681;   /* Muted content */

  /* Semantic accents — use consistently for meaning */
  --accent-blue: #58a6ff;     /* Primary actions, links, highlights */
  --accent-purple: #a371f7;   /* New features, innovation, transformation */
  --accent-green: #3fb950;    /* Success, enabled, positive */
  --accent-orange: #f0883e;   /* Warnings, in-progress, caution */
  --accent-red: #f85149;      /* Problems, blocked, critical */
  --accent-cyan: #79c0ff;     /* Information, metrics, data */

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #58a6ff, #a371f7);
  --gradient-success: linear-gradient(135deg, #3fb950, #238636);
  --gradient-warning: linear-gradient(135deg, #f0883e, #d29922);
}
```

## Typography

```css
/* Primary stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Code and technical content */
font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;

/* Type scale */
--text-hero: 32px;      /* Page title */
--text-section: 20px;   /* Section headers */
--text-card: 16px;      /* Card titles */
--text-body: 14px;      /* Body text */
--text-detail: 13px;    /* Secondary content */
--text-caption: 12px;   /* Labels and captions */
--text-micro: 11px;     /* Tags and badges */
--text-tiny: 10px;      /* Timestamps, metadata */
```

## Spacing

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 20px;
--space-2xl: 24px;
--space-3xl: 32px;
--space-4xl: 40px;
--space-section: 60px;  /* Between major sections */

--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
```

## Base Styles

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
  color: #e6edf3;
  min-height: 100vh;
  padding: 40px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.section {
  margin-bottom: 60px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(180deg, #58a6ff, #a371f7);
  border-radius: 2px;
}
```

## Responsive Breakpoints

```css
@media (max-width: 1200px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .benefits-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .impact-grid { grid-template-columns: 1fr; }
  .timeline-container { flex-direction: column; }
  .surface-sources { grid-template-columns: 1fr; }
  body { padding: 20px; }
}
```

## Animation Defaults

```css
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 8px 32px rgba(88, 166, 255, 0.3); }
  50% { box-shadow: 0 8px 48px rgba(88, 166, 255, 0.5); }
}
```
