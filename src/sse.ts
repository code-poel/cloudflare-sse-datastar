import { Event } from './types';

const encoder = new TextEncoder();

// Default SSE headers
const defaultSSEHeaders = {
	'Content-Type': 'text/event-stream',
	'Cache-Control': 'no-cache',
	'Connection': 'keep-alive',
	'Access-Control-Allow-Origin': '*' // TODO: Remove this in production
};

/**
 * Creates a ReadableStream that emits SSE events.
 * Handles both one-time and repeating events.
 * 
 * @param events - Array of events to emit
 * @returns A ReadableStream that emits the events
 */
function createSSEStream(events: Event[]) {
	let cleanup: (() => void) | undefined;

	return new ReadableStream<Uint8Array>({
		start(controller: ReadableStreamDefaultController<Uint8Array>) {
			// Send initial events
			events.forEach(event => {
				controller.enqueue(encoder.encode(event.format()));
			});

			// Set up intervals for repeating events
			const intervals = events
				.filter(event => event._repeating)
				.map(event => {
					const interval = setInterval(() => {
						controller.enqueue(encoder.encode(event.format()));
					}, event._repeating.frequency);
					return interval;
				});

			// If no repeating events, close the stream
			if (intervals.length === 0) {
				controller.close();
			}

			// Store cleanup function
			cleanup = () => {
				intervals.forEach(interval => clearInterval(interval));
			};
		},
		cancel() {
			// Clean up intervals when stream is cancelled
			if (cleanup) {
				cleanup();
			}
		}
	});
}

/**
 * Creates a Response object configured for Server-Sent Events.
 * 
 * @param events - Array of events to emit
 * @param additionalHeaders - Optional additional headers to include in the response
 * @returns A Response object configured for SSE
 */
export function createSSEResponse(events: Event[], additionalHeaders: HeadersInit = {}) {
	const headers = new Headers(defaultSSEHeaders);
	
	// Merge additional headers, allowing overrides of defaults
	if (additionalHeaders instanceof Headers) {
		additionalHeaders.forEach((value, key) => {
			headers.set(key, value);
		});
	} else if (typeof additionalHeaders === 'object') {
		for (const key in additionalHeaders) {
			headers.set(key, additionalHeaders[key]);
		}
	}

	return new Response(createSSEStream(events), { headers });
}