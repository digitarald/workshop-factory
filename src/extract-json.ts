/**
 * Extract JSON from an LLM response that may contain markdown code fences.
 * Handles code-fenced output, bare JSON, and braces inside string values.
 */
export function extractJson(text: string): string {
  // Try to find JSON in a code block first
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (codeBlockMatch?.[1]) {
    return codeBlockMatch[1].trim();
  }

  // Try JSON.parse on the trimmed text directly
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch {
      // Not valid JSON as-is, fall through to scanner
    }
  }

  // Fall back to string-aware brace-depth scanning
  const start = text.indexOf('{');
  if (start >= 0) {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < text.length; i++) {
      const ch = text[i]!;
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\' && inString) {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
        if (depth === 0) return text.slice(start, i + 1);
      }
    }
  }
  return trimmed;
}
