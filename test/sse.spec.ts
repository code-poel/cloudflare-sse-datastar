import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSSEResponse } from '../src/sse';
import { Event } from '../src/types';

describe('SSE Response', () => {
  let mockEvent: Event;
  let mockRepeatingEvent: Event;
  let clearIntervalSpy: any;

  beforeEach(() => {
    // Create a basic event
    mockEvent = {
      type: 'test-event',
      format() {
        return 'event: test-event\ndata: test data\n\n';
      }
    };

    // Create a repeating event
    mockRepeatingEvent = {
      type: 'repeating-event',
      format() {
        return 'event: repeating-event\ndata: repeating data\n\n';
      },
      _repeating: {
        frequency: 1000,
        originalEvent: null
      }
    };

    // Mock setInterval and clearInterval
    vi.useFakeTimers();
    clearIntervalSpy = vi.spyOn(global, 'clearInterval');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('closes stream when no repeating events', async () => {
    const response = createSSEResponse([mockEvent]);
    const reader = response.body.getReader();
    
    // Read the first chunk
    const { value } = await reader.read();
    expect(new TextDecoder().decode(value)).toBe('event: test-event\ndata: test data\n\n');
    
    // Read again to verify stream is closed
    const { done } = await reader.read();
    expect(done).toBe(true);
  });

  it('keeps stream open for repeating events', async () => {
    const response = createSSEResponse([mockRepeatingEvent]);
    const reader = response.body.getReader();
    
    // Read the first chunk
    const { value, done } = await reader.read();
    expect(done).toBe(false);
    expect(new TextDecoder().decode(value)).toBe('event: repeating-event\ndata: repeating data\n\n');

    // Advance time and read next chunk
    vi.advanceTimersByTime(1000);
    const { value: value2, done: done2 } = await reader.read();
    expect(done2).toBe(false);
    expect(new TextDecoder().decode(value2)).toBe('event: repeating-event\ndata: repeating data\n\n');

    // Clean up
    await reader.cancel();
  });

  it('cleans up intervals when stream is cancelled', async () => {
    const response = createSSEResponse([mockRepeatingEvent]);
    const reader = response.body.getReader();
    
    // Read first chunk
    await reader.read();
    
    // Cancel the stream
    await reader.cancel();
    
    // Verify clearInterval was called
    expect(clearIntervalSpy).toHaveBeenCalled();
    
    // Clean up any remaining timers
    vi.clearAllTimers();
  });

  it('merges Headers instance correctly', () => {
    const customHeaders = new Headers({
      'Custom-Header': 'value',
      'Content-Type': 'override'
    });

    const response = createSSEResponse([mockEvent], customHeaders);
    
    expect(response.headers.get('Custom-Header')).toBe('value');
    expect(response.headers.get('Content-Type')).toBe('override');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
  });

  it('merges plain object headers correctly', () => {
    const customHeaders = {
      'Custom-Header': 'value',
      'Content-Type': 'override'
    };

    const response = createSSEResponse([mockEvent], customHeaders);
    
    expect(response.headers.get('Custom-Header')).toBe('value');
    expect(response.headers.get('Content-Type')).toBe('override');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
  });

  it('handles empty additional headers', () => {
    const response = createSSEResponse([mockEvent]);
    
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('handles multiple events in sequence', async () => {
    const response = createSSEResponse([mockEvent, mockRepeatingEvent]);
    const reader = response.body.getReader();
    
    // Read first event
    const { value: value1 } = await reader.read();
    expect(new TextDecoder().decode(value1)).toBe('event: test-event\ndata: test data\n\n');
    
    // Read second event
    const { value: value2 } = await reader.read();
    expect(new TextDecoder().decode(value2)).toBe('event: repeating-event\ndata: repeating data\n\n');
    
    // Clean up
    await reader.cancel();
  });

  it('includes retry field when specified', async () => {
    const mockEvent = {
      type: 'test-event',
      retry: 5000,
      format() {
        const lines = [
          'event: test-event',
          'data: test data'
        ];
        if (this.retry !== undefined) {
          lines.push(`retry: ${this.retry}`);
        }
        return lines.join('\n') + '\n\n';
      }
    };

    const response = createSSEResponse([mockEvent]);
    const reader = response.body.getReader();
    
    // Read the first chunk
    const { value } = await reader.read();
    const text = new TextDecoder().decode(value);
    
    expect(text).toContain('event: test-event');
    expect(text).toContain('data: test data');
    expect(text).toContain('retry: 5000');
    
    // Clean up
    await reader.cancel();
  });
}); 