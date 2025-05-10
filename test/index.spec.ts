// test/index.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import worker from '../src/index';

// Mock the Mustache template
vi.mock('../src/templates/listing.mustache', () => ({
	default: `<ul id="listing">
{{ #names }}
        <li>{{ name }}</li>
{{ /names }}
</ul>`
}));

describe('SSE Router', () => {
	let mockEnv: any;
	let mockCtx: any;

	beforeEach(() => {
		// Mock environment
		mockEnv = {};
		
		// Mock execution context
		mockCtx = {
			waitUntil: vi.fn()
		};

		// Mock Date.toLocaleTimeString to return a fixed value
		vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('12:00:00');
		vi.spyOn(Date.prototype, 'getMilliseconds').mockReturnValue(123);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('handles merge-fragments endpoint', async () => {
		const request = new Request('http://example.com/merge-fragments');
		const response = await worker.fetch(request, mockEnv, mockCtx);
		
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('text/event-stream');
		const text = await response.text();
		expect(text).toContain('event: datastar-merge-fragments');
		expect(text).toContain('data: selector #listing');
	});

	it('handles merge-fragments-repeating endpoint', async () => {
		const request = new Request('http://example.com/merge-fragments-repeating');
		const response = await worker.fetch(request, mockEnv, mockCtx);
		
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('text/event-stream');
		
		// Read the first chunk of the stream
		const reader = response.body.getReader();
		const { value } = await reader.read();
		const text = new TextDecoder().decode(value);
		
		expect(text).toContain('event: datastar-merge-fragments');
		expect(text).toContain('data: selector #clock');
		expect(text).toContain('data: fragments <div id="clock">12:00:00:123</div>');
		
		// Clean up the stream
		await reader.cancel();
	});

	it('handles merge-signals endpoint', async () => {
		const request = new Request('http://example.com/merge-signals');
		const response = await worker.fetch(request, mockEnv, mockCtx);
		
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('text/event-stream');
		const text = await response.text();
		expect(text).toContain('event: datastar-merge-signals');
		expect(text).toContain('data: signals {"foo":"merged"}');
	});

	it('handles remove-fragments endpoint', async () => {
		const request = new Request('http://example.com/remove-fragments');
		const response = await worker.fetch(request, mockEnv, mockCtx);
		
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('text/event-stream');
		const text = await response.text();
		expect(text).toContain('event: datastar-remove-fragments');
		expect(text).toContain('data: selector #content-to-remove');
	});

	it('handles remove-signals endpoint', async () => {
		const request = new Request('http://example.com/remove-signals');
		const response = await worker.fetch(request, mockEnv, mockCtx);
		
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('text/event-stream');
		const text = await response.text();
		expect(text).toContain('event: datastar-remove-signals');
		expect(text).toContain('data: paths foo');
		expect(text).toContain('data: paths nested.baz');
	});

	it('handles execute-script endpoint', async () => {
		const request = new Request('http://example.com/execute-script');
		const response = await worker.fetch(request, mockEnv, mockCtx);
		
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('text/event-stream');
		const text = await response.text();
		expect(text).toContain('event: datastar-execute-script');
		expect(text).toContain('data: autoRemove true');
		expect(text).toContain('data: attributes type module');
		expect(text).toContain('data: attributes defer true');
		expect(text).toContain('data: script console.log("Hello, world!")');
	});

	it('handles heartbeat endpoint', async () => {
		const request = new Request('http://example.com/heartbeat');
		const response = await worker.fetch(request, mockEnv, mockCtx);
		
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('text/event-stream');
		
		// Read the first chunk of the stream
		const reader = response.body.getReader();
		const { value } = await reader.read();
		const text = new TextDecoder().decode(value);
		
		expect(text).toBe(': 12:00:00:123\n\n');
		
		// Clean up the stream
		await reader.cancel();
	});
});
