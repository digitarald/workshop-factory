/**
 * Extract JSON from an LLM response that may contain markdown code fences.
 * Handles code-fenced output, bare JSON, braces inside string values,
 * and truncated responses where the JSON is incomplete.
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

    // Scanner didn't balance — likely truncated LLM response.
    // Try to repair the truncated JSON.
    const truncated = text.slice(start);
    const repaired = repairTruncatedJson(truncated);
    if (repaired) return repaired;
  }
  return trimmed;
}

/**
 * Attempt to repair truncated JSON by closing unterminated strings,
 * arrays, and objects. Uses progressive trimming from the end to find
 * the longest valid prefix.
 *
 * @returns Repaired JSON string, or null if repair fails
 */
export function repairTruncatedJson(json: string): string | null {
  // Strip any trailing partial tokens (unfinished string values, hanging commas)
  const candidate = json;

  // Try up to 200 chars of trimming from the end
  for (let trim = 0; trim < Math.min(200, candidate.length); trim++) {
    const slice = candidate.slice(0, candidate.length - trim);
    const closed = closeJson(slice);
    if (closed) {
      try {
        JSON.parse(closed);
        return closed;
      } catch {
        // Not valid yet, trim more
      }
    }
  }
  return null;
}

/**
 * Close an incomplete JSON string by appending missing quotes,
 * brackets, and braces based on structural analysis.
 */
function closeJson(partial: string): string | null {
  // Clean trailing noise: commas, colons, whitespace
  let cleaned = partial.replace(/[,:\s]+$/, '');

  // If we're mid-string (odd number of unescaped quotes), close it
  let inStr = false;
  let esc = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i]!;
    if (esc) { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"') inStr = !inStr;
  }
  if (inStr) {
    // Escape any trailing backslash that would escape our closing quote
    if (cleaned.endsWith('\\')) cleaned = cleaned.slice(0, -1);
    cleaned += '"';
  }

  // Remove trailing comma after closing a string/value
  cleaned = cleaned.replace(/,\s*$/, '');

  // Count open braces/brackets and close them
  const stack: string[] = [];
  inStr = false;
  esc = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i]!;
    if (esc) { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if (ch === '}' || ch === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === ch) {
        stack.pop();
      }
    }
  }

  if (stack.length === 0 && !cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    return null;
  }

  // Close in reverse order
  return cleaned + stack.reverse().join('');
}
