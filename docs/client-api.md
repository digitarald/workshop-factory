# Copilot SDK Client Wrapper

A clean, type-safe wrapper around the GitHub Copilot SDK for the Workshop Factory CLI.

## Features

- **Lifecycle Management**: Automatic start/stop with explicit control
- **Session Management**: Create, resume, list, and delete sessions
- **Streaming Support**: Async generator-based streaming responses
- **Tool Registration**: Type-safe tool definitions with Zod schemas
- **Full TypeScript Support**: Complete type definitions for all APIs

## Quick Start

```typescript
import { createClient, createSession, streamResponse } from "./client.js";

// Create and start a client
const client = createClient({
	logLevel: "info",
});

// Create a session with optional system prompt
const session = await createSession(
	client,
	"You are a helpful coding assistant.",
	{ model: "gpt-5" }
);

// Stream responses
for await (const chunk of streamResponse(session, "Hello!")) {
	if (chunk.type === "delta") {
		process.stdout.write(chunk.content);
	} else {
		console.log("\n✓ Complete:", chunk.accumulated);
	}
}

// Cleanup
await session.destroy();
await client.stop();
```

## API Reference

### `createClient(options?)`

Creates a new Copilot client instance.

```typescript
const client = createClient({
	logLevel: "info",
	autoStart: false, // Manual lifecycle control
	useStdio: true, // Use stdio transport (default)
});
```

### `createSession(client, systemPrompt?, config?)`

Creates a new conversation session.

```typescript
const session = await createSession(
	client,
	"You are a code reviewer.",
	{
		model: "gpt-5",
		streaming: true,
	}
);
```

### `streamResponse(session, message, options?)`

Streams assistant responses as an async generator.

```typescript
for await (const chunk of streamResponse(session, "Explain recursion")) {
	console.log(chunk.type); // 'delta' | 'complete'
	console.log(chunk.content); // Current chunk
	console.log(chunk.accumulated); // Full content so far
}
```

### `sendAndWait(session, message, options?, timeout?)`

Sends a message and waits for the complete response (non-streaming).

```typescript
const response = await sendAndWait(session, "What is 2+2?", {}, 30000);
console.log(response?.data.content);
```

### `registerTool(name, description, parameters, handler)`

Registers a custom tool with type-safe parameters.

```typescript
import { z } from "zod";
import { registerTool } from "./client.js";

const searchTool = registerTool(
	"search_docs",
	"Search documentation for a query",
	z.object({
		query: z.string().describe("Search query"),
		limit: z.number().optional().describe("Result limit"),
	}),
	async ({ query, limit }) => {
		// Handler with full type inference
		const results = await searchDocs(query, limit);
		return results;
	}
);

// Use in session
const session = await client.createSession({
	model: "gpt-5",
	tools: [searchTool],
});
```

## Client Methods

### Lifecycle

- `client.start()` - Start the Copilot CLI server
- `client.stop()` - Stop gracefully (returns errors if any)
- `client.forceStop()` - Force stop without cleanup

### Sessions

- `client.createSession(config)` - Create new session
- `client.resumeSession(id, config)` - Resume existing session
- `client.listSessions(filter?)` - List all sessions
- `client.deleteSession(id)` - Delete a session

### Utilities

- `client.ping(message?)` - Check connectivity
- `client.getState()` - Get connection state
- `client.getSDKClient()` - Access underlying SDK client

## Session Methods

- `session.send(options)` - Send a message (returns immediately)
- `session.sendAndWait(options, timeout?)` - Send and wait for completion
- `session.on(eventType, handler)` - Subscribe to events
- `session.abort()` - Abort current message processing
- `session.getMessages()` - Get all session events
- `session.destroy()` - Destroy session and free resources

## Event Types

Sessions emit various events:

- `assistant.message` - Complete assistant response
- `assistant.message_delta` - Streaming response chunk
- `assistant.reasoning` - Reasoning content (model-dependent)
- `assistant.reasoning_delta` - Streaming reasoning chunk
- `session.idle` - Session finished processing
- `tool.execution_start` - Tool execution started
- `tool.execution_complete` - Tool execution completed

## Example: Custom Tools

```typescript
import { z } from "zod";
import { createClient, registerTool } from "./client.js";

const client = createClient();

const calculateTool = registerTool(
	"calculate",
	"Perform arithmetic calculations",
	z.object({
		expression: z.string().describe("Math expression to evaluate"),
	}),
	async ({ expression }) => {
		try {
			const result = eval(expression); // Use a safe eval in production!
			return { result, expression };
		} catch (error) {
			return {
				textResultForLlm: `Error: ${error.message}`,
				resultType: "failure",
			};
		}
	}
);

const session = await client.createSession({
	model: "gpt-5",
	tools: [calculateTool],
});

await session.sendAndWait({
	prompt: "What is (42 * 3) + 17?",
});
```

## Type Exports

The wrapper re-exports commonly used types:

```typescript
import type {
	CopilotSession,
	SessionConfig,
	Tool,
	ToolHandler,
	MessageOptions,
	SessionEvent,
	AssistantMessageEvent,
	CopilotClientOptions,
	ZodSchema,
	SessionMetadata,
	SessionListFilter,
} from "./client.js";
```

## Error Handling

```typescript
try {
	const client = createClient();
	const session = await createSession(client);
	await sendAndWait(session, "Hello");
} catch (error) {
	console.error("Error:", error.message);
}
```

## Requirements

- Node.js >= 20.0.0 (as required by @github/copilot-sdk)
- GitHub Copilot CLI installed and authenticated

## License

MIT
