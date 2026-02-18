# Section Patterns

## 1. Hero Header

Brief, punchy title with gradient text. Sets the emotional tone.

```html
<h1 style="background: linear-gradient(90deg, #58a6ff, #a371f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
  Unified Metrics Schema
</h1>
<p class="subtitle">Transforming fragmented telemetry into actionable insights</p>
```

```css
h1 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #58a6ff, #a371f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #8b949e;
  font-size: 16px;
  margin-bottom: 40px;
}
```

## 2. Executive Summary

The "if you read nothing else" section with TL;DR and primary CTA.

```css
.executive-summary {
  background: linear-gradient(135deg, #161b22 0%, #21262d 100%);
  border: 2px solid #58a6ff;
  border-radius: 16px;
  padding: 24px 32px;
}

.exec-summary-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.exec-summary-ask {
  background: #238636;
  border-radius: 12px;
  padding: 16px 24px;
  text-align: center;
  min-width: 280px;
}

.ask-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.7);
}

.ask-text {
  font-size: 14px;
  font-weight: 600;
  color: white;
}
```

## 3. Business Impact

Two-column grid contrasting problems vs solutions.

```css
.impact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.impact-card {
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 24px;
}

.impact-icon {
  font-size: 28px;
  margin-bottom: 12px;
}

.impact-item {
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 6px;
  padding-left: 32px;
  position: relative;
  margin-bottom: 8px;
}

.impact-item.blocked {
  background: #f8514920;
  color: #f85149;
}

.impact-item.blocked::before {
  content: '✗';
  position: absolute;
  left: 12px;
}

.impact-item.enabled {
  background: #23863620;
  color: #3fb950;
}

.impact-item.enabled::before {
  content: '✓';
  position: absolute;
  left: 12px;
}
```

## 4. Timeline

Horizontal timeline showing past, present, future states.

```css
.timeline-container {
  display: flex;
  gap: 0;
  position: relative;
  padding: 20px 0;
}

.timeline-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 40px;
  right: 40px;
  height: 2px;
  background: #30363d;
  transform: translateY(-50%);
}

.timeline-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.timeline-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.timeline-item.done .timeline-marker {
  background: #238636;
  color: white;
}

.timeline-item.current .timeline-marker {
  background: #58a6ff;
  color: white;
  box-shadow: 0 0 0 4px #58a6ff40;
}

.timeline-item.future .timeline-marker {
  background: #30363d;
  color: #8b949e;
}

.timeline-content {
  text-align: center;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 12px 16px;
  width: 140px;
}

.timeline-item.current .timeline-content {
  border-color: #58a6ff;
}
```

## 5. Current State (Problem)

Red-bordered container visualizing the painful status quo.

```css
.current-state-container {
  background: #21262d;
  border: 2px solid #f85149;
  border-radius: 16px;
  padding: 32px;
}

.current-state-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #f85149;
}

.problem-stats {
  display: flex;
  gap: 24px;
}

.problem-stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #f85149;
}

.problem-stat-label {
  font-size: 11px;
  color: #8b949e;
}

.problems-list {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #30363d;
}

.problem-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #f85149;
}

.problem-item::before {
  content: '⚠️';
}
```

## 6. Transformation Arrow

Visual bridge between problem and solution.

```css
.transformation-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.arrow-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #58a6ff, #a371f7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(88, 166, 255, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.arrow-circle span {
  font-size: 36px;
  color: white;
}

/* Horizontal flow variant */
.transformation-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 40px;
  background: linear-gradient(90deg, #21262d 0%, #161b22 50%, #21262d 100%);
  border-radius: 12px;
}

.flow-step {
  text-align: center;
  padding: 16px 24px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  min-width: 140px;
}

.flow-step.highlight {
  border-color: #a371f7;
  background: #a371f715;
}

.flow-step-number {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #58a6ff, #a371f7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: white;
  margin: 0 auto 8px;
}

.flow-connector {
  font-size: 20px;
  color: #30363d;
}
```

## 7. Target State (Solution)

Green-bordered container showing the elegant end state.

```css
.unified-schema-container {
  background: #21262d;
  border: 2px solid #3fb950;
  border-radius: 16px;
  padding: 32px;
}

.unified-schema-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #3fb950;
}

.benefit-stats {
  display: flex;
  gap: 24px;
}

.benefit-stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #3fb950;
}

.benefits-list {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #30363d;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #3fb950;
}

.benefit-item::before {
  content: '✓';
  font-weight: bold;
}
```

## 8. Implementation Approach

Cards showing what you will/won't do.

```css
.implementation-container {
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 16px;
  padding: 32px;
}

.implementation-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.implementation-card {
  background: #161b22;
  border-radius: 12px;
  padding: 20px;
}

.implementation-card.safe {
  border: 1px solid #3fb950;
}

.implementation-card.danger {
  border: 1px solid #f85149;
}

.impl-list li {
  padding: 6px 0;
  font-size: 13px;
  color: #8b949e;
  padding-left: 20px;
  position: relative;
}

.implementation-card.safe .impl-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #3fb950;
}

.implementation-card.danger .impl-list li::before {
  content: '✗';
  position: absolute;
  left: 0;
  color: #f85149;
}
```

## 9. Data Visualization (Schema Layers)

Layered card layouts with color-coded categories.

```css
.schema-layers {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schema-layer {
  display: flex;
  align-items: stretch;
  gap: 16px;
}

.layer-label {
  width: 140px;
  padding: 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.layer-label.identity { 
  background: linear-gradient(135deg, #388bfd20, #388bfd40); 
  border: 1px solid #388bfd; 
  color: #58a6ff; 
}

.layer-label.surface { 
  background: linear-gradient(135deg, #a371f720, #a371f740); 
  border: 1px solid #a371f7; 
  color: #a371f7; 
}

.layer-label.metrics { 
  background: linear-gradient(135deg, #3fb95020, #3fb95040); 
  border: 1px solid #3fb950; 
  color: #3fb950; 
}

.layer-fields {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: #0d1117;
  border-radius: 8px;
  align-items: center;
}

.field-tag {
  padding: 6px 12px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 11px;
  color: #e6edf3;
}

.field-tag.exists { background: #21262d; border-color: #30363d; color: #8b949e; }
.field-tag.modified { background: #f0883e20; border-color: #f0883e; color: #f0883e; }
.field-tag.new { background: #a371f720; border-color: #a371f7; color: #a371f7; }
.field-tag.gap { background: #f8514930; border: 1px dashed #f85149; color: #f85149; }
```

## 10. Metrics Grid

Cards showing what you'll measure.

```css
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.metric-card {
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 20px;
}

.metric-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #58a6ff;
}

.metric-formula {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 11px;
  padding: 8px 12px;
  background: #161b22;
  border-radius: 4px;
  color: #7ee787;
}

.metric-badge {
  font-size: 9px;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: 8px;
}

.metric-badge.existing { background: #8b949e30; color: #8b949e; }
.metric-badge.new-metric { background: #a371f730; color: #a371f7; }
```

## 11. Known Gaps

Honest acknowledgment with severity-coded borders.

```css
.gaps-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.gap-card {
  background: #21262d;
  border-radius: 12px;
  padding: 20px;
}

.gap-card.critical { border: 1px solid #f85149; }
.gap-card.future { border: 1px solid #a371f7; }
.gap-card.unknown { border: 1px solid #f0883e; }

.gap-icon { font-size: 24px; margin-bottom: 8px; }

.gap-title {
  font-size: 14px;
  font-weight: 600;
  color: #e6edf3;
  margin-bottom: 12px;
}

.gap-desc {
  font-size: 12px;
  color: #8b949e;
  line-height: 1.6;
}

.gap-status {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #30363d;
  font-size: 11px;
  font-style: italic;
}

.gap-card.critical .gap-status { color: #f85149; }
.gap-card.future .gap-status { color: #a371f7; }
```

## 12. Benefits Grid

4-column grid with icons.

```css
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.benefit-card {
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.benefit-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.benefit-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.benefit-desc {
  font-size: 12px;
  color: #8b949e;
}
```

## 13. Out of Scope

Quick list of what's NOT included.

```css
.out-of-scope-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.scope-item {
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.scope-icon { font-size: 20px; margin-bottom: 8px; }

.scope-text {
  font-size: 11px;
  color: #8b949e;
  line-height: 1.4;
}

.scope-note {
  text-align: center;
  font-size: 12px;
  color: #6e7681;
  font-style: italic;
  margin-top: 16px;
}
```

## 14. Footer

Links and metadata.

```css
.footer {
  margin-top: 60px;
  padding-top: 24px;
  border-top: 1px solid #30363d;
  text-align: center;
  color: #8b949e;
  font-size: 12px;
}

.footer a {
  color: #58a6ff;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
```
