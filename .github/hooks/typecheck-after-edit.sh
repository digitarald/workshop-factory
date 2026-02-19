#!/usr/bin/env bash
# PostToolUse hook: run tsc type-check after edits to src/ TypeScript files.
# Reads the hook event JSON from stdin, checks if the edited file is in src/,
# and if so runs `npm run check`. Returns output with errors on failure.

set -euo pipefail

INPUT=$(cat)

# Extract the tool name from the hook event (VS Code uses snake_case fields)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Only act on file-editing tools
case "$TOOL_NAME" in
  editFiles|createFile|replace_string_in_file|multi_replace_string_in_file|create_file|edit_file) ;;
  *) exit 0 ;;
esac

# Extract file path — try multiple possible locations in tool_input
FILE_PATH=$(echo "$INPUT" | jq -r '
  .tool_input.filePath //
  .tool_input.file_path //
  (.tool_input.files // [] | .[0] // (.tool_input.replacements // [] | .[0].filePath // empty)) //
  empty
')

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Normalize to workspace-relative path
WORKSPACE_DIR="${WORKSPACE_DIR:-$(echo "$INPUT" | jq -r '.cwd // empty')}"
WORKSPACE_DIR="${WORKSPACE_DIR:-$(pwd)}"
REL_PATH="${FILE_PATH#"$WORKSPACE_DIR"/}"

# Only check edits to src/ TypeScript files
if [[ ! "$REL_PATH" =~ ^src/.*\.tsx?$ ]]; then
  exit 0
fi

# Run type-check, capture output
CHECK_OUTPUT=$(npm run check 2>&1) || {
  # Type-check failed — surface errors to the agent
  TRIMMED=$(echo "$CHECK_OUTPUT" | tail -40)
  jq -n --arg ctx "Type-check failed after editing $REL_PATH. Fix these errors before continuing:
$TRIMMED" '{
    "hookSpecificOutput": {
      "hookEventName": "PostToolUse",
      "additionalContext": $ctx
    }
  }'
  exit 0
}

# Type-check passed — no output needed
exit 0
