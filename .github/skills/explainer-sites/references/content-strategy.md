# Content Strategy

## Headlines

Use action verbs and outcomes, not descriptions:

| ❌ Avoid | ✅ Better |
|----------|-----------|
| Current Data Sources | The Problem: Fragmented Data Sources |
| Implementation | How We'll Get There |
| Benefits | Why This Matters |
| Schema Fields | What We're Building |
| Timeline | Roadmap to Unified Metrics |

## Contrast Pairs

Frame information as opposing pairs to clarify value:

| Problem Frame | Solution Frame |
|---------------|----------------|
| What We Can't Do Today | What This Unlocks |
| Before | After |
| Blocked | Enabled |
| Fragmented | Unified |
| Current State | Target State |
| What We Won't Do | What We Will Do |
| Pain Points | Benefits |
| Manual | Automated |
| Tribal Knowledge | Documented |

## The Ask

Every explainer needs a clear CTA. Make it prominent:

```html
<div class="exec-summary-ask">
  <div class="ask-label">The Ask</div>
  <div class="ask-text">30-min review with each team to validate mappings</div>
</div>
```

Common ask patterns:
- "30 min with each team to review X"
- "Approval to proceed with Phase 1"
- "Feedback on the proposed approach by [date]"
- "Resources: 2 engineers for 4 weeks"

## Quantified Impact

Always quantify when possible. Use large, bold numbers:

| Weak | Strong |
|------|--------|
| Multiple tables | 4 separate tables |
| Several teams | 5 teams affected |
| Takes time | 3-day delay |
| Improves speed | 60% faster |
| Many fields | 47 fields unified |

## Emoji Vocabulary

Use emojis consistently for meaning throughout the document:

| Emoji | Meaning |
|-------|---------|
| ⚠️ | Warning, problem, gap |
| ✅ | Success, enabled, complete |
| ✗ | Blocked, not available |
| ✓ | Done, checked |
| 🗃️ | Data table, storage |
| ⚡ | Event, action, trigger |
| 📝 | Field, property, detail |
| ⏱️ | Time, latency, timing |
| 🔒 | Security, private |
| 🚀 | Launch, deploy, ship |
| 💡 | Insight, tip, idea |
| 🎯 | Goal, target, metric |
| 📊 | Analytics, data, chart |
| 🔗 | Link, connection, integration |
| 🤷 | Unknown, question, gap |
| 🛠️ | Tool, implementation |
| 📦 | Package, module, component |

## Writing Style

### Be Direct
- ❌ "This proposal aims to potentially address..."
- ✅ "This creates a unified schema that..."

### Lead with Impact
- ❌ "We need to change X because of Y"
- ✅ "Y is blocking Z. This fixes it by changing X."

### Acknowledge Gaps Honestly
Don't hide limitations. Call them out explicitly with a plan:

```html
<div class="gap-card critical">
  <div class="gap-title">No IDE Commit Attribution</div>
  <div class="gap-desc">
    We can attribute Agent PR code, but IDE-assisted code (95% of usage) 
    has no commit-level tagging.
  </div>
  <div class="gap-status">Requires upstream instrumentation changes</div>
</div>
```

### Use Consistent Terminology
Pick terms and stick to them:
- "surface" not "product" or "platform" or "client"
- "unified" not "normalized" or "standardized" or "centralized"
- Define terms once, then use consistently

## Section Order

Follow narrative arc for maximum persuasion:

1. **Hook** (Executive Summary) — Why should I care?
2. **Pain** (Problem) — What's broken today?
3. **Vision** (Solution) — What does good look like?
4. **Path** (Implementation) — How do we get there?
5. **Proof** (Metrics) — How do we know it worked?
6. **Honesty** (Gaps) — What won't this solve?
7. **Ask** (CTA) — What do you need from me?

## Lists vs Prose

| Use Lists When | Use Prose When |
|----------------|----------------|
| Items are parallel | Explaining causation |
| Quick scanning needed | Building narrative |
| 3+ distinct items | 1-2 connected ideas |
| Technical specs | Strategic context |

## Code Examples

When showing technical content:

```css
/* Always show real, working examples */
.field-tag {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 11px;
}

/* Not pseudo-code or placeholders */
```

## Footer Content

Include:
- Version/status (e.g., "v1.0.0-draft")
- Document type (e.g., "RFC for Cross-Team Review")
- Links to related resources
- Last updated date if relevant

```html
<div class="footer">
  <p>Unified Metrics Schema v1.0.0-draft | RFC for Cross-Team Review</p>
  <p>
    <a href="SCHEMA_SPEC.md">Schema Spec</a> · 
    <a href="ATTRIBUTION.md">Attribution Model</a> · 
    <a href="./kql/">Queries</a>
  </p>
</div>
```
