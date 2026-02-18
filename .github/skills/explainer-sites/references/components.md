# Component Patterns

## Badges & Status Tags

```css
.badge {
  font-size: 10px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.fragmented {
  background: rgba(248, 81, 73, 0.2);
  color: #f85149;
  border: 1px solid #f85149;
}

.badge.unified {
  background: rgba(63, 185, 80, 0.2);
  color: #3fb950;
  border: 1px solid #3fb950;
}

.badge.in-progress {
  background: rgba(240, 136, 62, 0.2);
  color: #f0883e;
  border: 1px solid #f0883e;
}

.badge.new {
  background: rgba(163, 113, 247, 0.2);
  color: #a371f7;
  border: 1px solid #a371f7;
}
```

## Surface/Category Tags

Use consistent colors for categories throughout:

```css
.surface-tag {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.surface-tag.ide { background: #58a6ff30; color: #58a6ff; }
.surface-tag.agent { background: #a371f730; color: #a371f7; }
.surface-tag.review { background: #3fb95030; color: #3fb950; }
.surface-tag.cli { background: #f0883e30; color: #f0883e; }
.surface-tag.web { background: #79c0ff30; color: #79c0ff; }
```

## Cards with Top Border Accent

```css
.surface-card {
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 20px;
  position: relative;
}

.surface-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 12px 12px 0 0;
}

.surface-card.ide::before { background: #58a6ff; }
.surface-card.agent::before { background: #a371f7; }
.surface-card.review::before { background: #3fb950; }
.surface-card.cli::before { background: #f0883e; }
```

## Legends

Always include for color-coded elements:

```css
.schema-legend {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 20px;
  padding: 12px 20px;
  background: #0d1117;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.exists { background: #8b949e; }
.legend-dot.modified { background: #f0883e; }
.legend-dot.new { background: #a371f7; }
.legend-dot.gap { background: #f85149; }

.legend-label {
  color: #8b949e;
}
```

## Stats Display

Large bold numbers for key metrics:

```css
.stat-container {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-value.problem { color: #f85149; }
.stat-value.success { color: #3fb950; }
.stat-value.info { color: #58a6ff; }

.stat-label {
  font-size: 11px;
  color: #8b949e;
  margin-top: 2px;
}
```

## Code Blocks

For technical content:

```css
.code-block {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 12px 16px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
  overflow-x: auto;
}

.code-block .comment { color: #8b949e; }
.code-block .string { color: #a5d6ff; }
.code-block .number { color: #79c0ff; }
.code-block .keyword { color: #ff7b72; }
.code-block .function { color: #d2a8ff; }
```

## Interactive Modal

For drilling into details:

```css
.modal-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  align-items: center;
  justify-content: center;
}

.modal-overlay.active {
  display: flex;
}

.modal {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, monospace;
}

.modal-close {
  background: none;
  border: none;
  color: #8b949e;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-close:hover {
  color: #e6edf3;
}

.modal-body {
  padding: 24px;
}
```

```javascript
function showModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(event) {
  if (!event || event.target.classList.contains('modal-overlay')) {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});
```

## Mapping Tables

For showing before → after transformations:

```css
.mapping-table {
  padding: 12px;
}

.mapping-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 4px;
  background: #161b22;
}

.mapping-row.future {
  opacity: 0.6;
  border: 1px dashed #30363d;
}

.mapping-from {
  font-size: 10px;
  font-family: 'SF Mono', Monaco, monospace;
  color: #8b949e;
}

.mapping-arrow {
  color: #30363d;
  font-size: 12px;
}

.mapping-to {
  font-size: 10px;
  font-family: 'SF Mono', Monaco, monospace;
  color: #e6edf3;
}
```

## Callout Boxes

For important notes:

```css
.callout {
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 24px;
}

.callout.info {
  background: #388bfd20;
  border: 1px solid #388bfd;
}

.callout.warning {
  background: #f0883e20;
  border: 1px solid #f0883e;
}

.callout.success {
  background: #23863620;
  border: 1px solid #238636;
}

.callout.danger {
  background: #f8514920;
  border: 1px solid #f85149;
}

.callout p {
  font-size: 13px;
  color: #e6edf3;
  margin: 0;
}

.callout code {
  background: #0d1117;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'SF Mono', Monaco, monospace;
  color: #a371f7;
}
```

## Team/Owner Tags

For showing responsibility:

```css
.team-ask {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 12px;
}

.team-name {
  font-size: 12px;
  font-weight: 600;
  color: #a371f7;
  margin-bottom: 6px;
}

.team-request {
  font-size: 11px;
  color: #8b949e;
}
```

## Effort/Size Indicators

```css
.effort-item {
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 16px;
}

.effort-phase {
  font-size: 10px;
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.effort-title {
  font-size: 13px;
  font-weight: 600;
  color: #e6edf3;
  margin-bottom: 8px;
}

.effort-owner {
  font-size: 11px;
  color: #58a6ff;
  margin-bottom: 4px;
}

.effort-size {
  font-size: 12px;
  font-weight: 600;
  color: #3fb950;
}
```
