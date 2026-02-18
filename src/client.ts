/**
 * Copilot SDK Client Wrapper for Workshop Factory CLI
 *
 * Provides a clean interface to the GitHub Copilot SDK with lifecycle management,
 * session creation, streaming responses, and tool registration.
 */

import {
	CopilotClient as SDKClient,
	CopilotSession,
	defineTool,
	type AssistantMessageEvent,
	type CopilotClientOptions,
	type SessionConfig,
	type Tool,
	type ToolHandler,
	type ZodSchema,
	type MessageOptions,
} from "@github/copilot-sdk";

/**
 * Extended client wrapper with lifecycle management
 */
export class CopilotClient {
	private sdkClient: SDKClient;
	private isStarted = false;

	constructor(options?: CopilotClientOptions) {
		this.sdkClient = new SDKClient({
			autoStart: false, // Manual control for explicit lifecycle
			...options,
		});
	}

	/**
	 * Start the Copilot CLI server and establish connection.
	 * Safe to call multiple times (idempotent).
	 */
	async start(): Promise<void> {
		if (this.isStarted) {
			return;
		}
		// Suppress Node.js experimental warnings (e.g. SQLite) emitted by the SDK subprocess.
		process.env['NODE_NO_WARNINGS'] = '1';
		await this.sdkClient.start();
		this.isStarted = true;
	}

	/**
	 * Stop the server gracefully and close all sessions.
	 * Returns any errors encountered during cleanup.
	 */
	async stop(): Promise<Error[]> {
		if (!this.isStarted) {
			return [];
		}
		const errors = await this.sdkClient.stop();
		this.isStarted = false;
		return errors;
	}

	/**
	 * Create a new conversation session with the Copilot agent.
	 * Automatically starts the client if not already started.
	 */
	async createSession(config?: SessionConfig): Promise<CopilotSession> {
		await this.start();
		return this.sdkClient.createSession(config);
	}
}

/**
 * Create a new conversation session with optional system prompt and configuration.
 *
 * @param client - CopilotClient instance
 * @param systemPrompt - Optional system message content to append
 * @param config - Additional session configuration
 * @returns A new CopilotSession
 */
export async function createSession(
	client: CopilotClient,
	systemPrompt?: string,
	config?: Omit<SessionConfig, "systemMessage">,
): Promise<CopilotSession> {
	const sessionConfig: SessionConfig = {
		...config,
		...(systemPrompt && {
			systemMessage: {
				mode: "append",
				content: systemPrompt,
			},
		}),
	};

	return client.createSession(sessionConfig);
}

/**
 * Stream assistant responses from a session as an async generator.
 * Yields delta content as it arrives and the final complete message.
 *
 * @param session - Active CopilotSession
 * @param userMessage - Message to send to the assistant
 * @param options - Additional message options (attachments, mode)
 * @yields StreamChunk objects with content and metadata
 */
export async function* streamResponse(
	session: CopilotSession,
	userMessage: string,
	options?: Omit<MessageOptions, "prompt">,
): AsyncGenerator<StreamChunk, void, unknown> {
	const chunks: string[] = [];
	let isComplete = false;

	// Queue for streaming chunks with proper async signaling
	const streamQueue: (StreamChunk | null)[] = [];
	let queueResolver: (() => void) | null = null;

	function enqueue(item: StreamChunk | null) {
		streamQueue.push(item);
		if (queueResolver) {
			queueResolver();
			queueResolver = null;
		}
	}

	function waitForItem(): Promise<void> {
		if (streamQueue.length > 0) return Promise.resolve();
		return new Promise((resolve) => {
			queueResolver = resolve;
		});
	}

	// Set up event listeners
	const unsubscribeDelta = session.on("assistant.message_delta", (event) => {
		chunks.push(event.data.deltaContent);
		enqueue({
			type: "delta",
			content: event.data.deltaContent,
			accumulated: chunks.join(""),
		});
	});

	const unsubscribeMessage = session.on("assistant.message", (event) => {
		enqueue({
			type: "complete",
			content: event.data.content,
			accumulated: event.data.content,
			event,
		});
	});

	const unsubscribeIdle = session.on("session.idle", () => {
		isComplete = true;
		// Defer the sentinel so any pending message/delta handlers fire first
		queueMicrotask(() => enqueue(null));
	});

	try {
		// Send the message
		await session.send({
			prompt: userMessage,
			...options,
		});

		// Yield chunks as they arrive
		while (!isComplete || streamQueue.length > 0) {
			await waitForItem();

			while (streamQueue.length > 0) {
				const chunk = streamQueue.shift();
				if (chunk === null || chunk === undefined) {
					return; // End of stream
				}
				yield chunk;
			}
		}
	} finally {
		// Clean up event listeners
		unsubscribeDelta();
		unsubscribeMessage();
		unsubscribeIdle();
	}
}

/**
 * Stream chunk emitted during response streaming
 */
export interface StreamChunk {
	/** Type of chunk: 'delta' for incremental, 'complete' for final */
	type: "delta" | "complete";
	/** Content of this chunk (delta) or full content (complete) */
	content: string;
	/** Accumulated content so far */
	accumulated: string;
	/** Full event data (only present for 'complete') */
	event?: AssistantMessageEvent;
}

/**
 * Send a message and wait for the complete response (non-streaming).
 *
 * @param session - Active CopilotSession
 * @param userMessage - Message to send
 * @param options - Additional message options
 * @param timeout - Optional timeout in milliseconds
 * @returns The final assistant message event
 */
export async function sendAndWait(
	session: CopilotSession,
	userMessage: string,
	options?: Omit<MessageOptions, "prompt">,
	timeout?: number,
): Promise<AssistantMessageEvent | undefined> {
	return session.sendAndWait(
		{
			prompt: userMessage,
			...options,
		},
		timeout,
	);
}

/**
 * Register a custom tool with type-safe parameters using Zod schema.
 *
 * @param name - Unique tool name
 * @param description - What the tool does (shown to the model)
 * @param parameters - Zod schema for tool parameters (provides type inference)
 * @param handler - Function to execute when tool is called
 * @returns Tool definition ready for session config
 */
export function registerTool<T = unknown>(
	name: string,
	description: string,
	parameters: ZodSchema<T> | Record<string, unknown>,
	handler: ToolHandler<T>,
): Tool<T> {
	return defineTool(name, {
		description,
		parameters,
		handler,
	});
}

// Global client instance for lifecycle management
let globalClient: CopilotClient | undefined;

/**
 * Get or create the global Copilot client instance.
 * Ensures a single client is used across the application.
 */
export function getGlobalClient(): CopilotClient {
	if (!globalClient) {
		globalClient = new CopilotClient();
	}
	return globalClient;
}

/**
 * Gracefully shut down the global Copilot client.
 * Safe to call multiple times or if client was never started.
 * 
 * @returns Array of errors encountered during shutdown, if any
 */
export async function shutdown(): Promise<Error[]> {
	if (!globalClient) {
		return [];
	}
	
	try {
		const errors = await globalClient.stop();
		globalClient = undefined;
		return errors;
	} catch (error) {
		globalClient = undefined;
		return [error instanceof Error ? error : new Error(String(error))];
	}
}

// Re-export commonly used types for convenience
export type {
	CopilotSession,
	SessionConfig,
	Tool,
	ToolHandler,
	MessageOptions,
	AssistantMessageEvent,
	CopilotClientOptions,
	ZodSchema,
} from "@github/copilot-sdk";
