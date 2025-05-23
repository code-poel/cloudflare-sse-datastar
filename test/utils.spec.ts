import { describe, it, expect } from 'vitest';
import { formatSSE, createEventFactory, createRepeatingEvent } from '../src/events/utils';

// Dummy event type for testing
interface DummyOptions {
  foo?: string;
  bar?: number;
  retry?: number;
}

describe('formatSSE', () => {
  it('formats event with primitive data', () => {
    const result = formatSSE('test-event', { foo: 'bar', bar: 42 });
    expect(result).toContain('event: test-event');
    expect(result).toContain('data: foo bar');
    expect(result).toContain('data: bar 42');
  });

  it('formats event with object data', () => {
    const result = formatSSE('test-event', { foo: { a: 1 } });
    expect(result).toContain('data: foo {"a":1}');
  });

  it('handles retry field', () => {
    const result = formatSSE('test-event', { foo: 'bar', retry: 1234 });
    expect(result).toContain('retry: 1234');
    expect(result).toContain('data: foo bar');
  });

  it('omits undefined and null values', () => {
    const result = formatSSE('test-event', { foo: undefined, bar: null });
    expect(result).not.toContain('foo');
    expect(result).not.toContain('bar');
  });

  it('handles paths array correctly', () => {
    const result = formatSSE('test-event', { paths: ['foo.bar', 'baz'] });
    expect(result).toContain('data: paths foo.bar');
    expect(result).toContain('data: paths baz');
    expect(result).not.toContain('["foo.bar","baz"]');
  });

  it('handles attributes array correctly', () => {
    const result = formatSSE('test-event', {
      attributes: [
        { name: 'type', value: 'module' },
        { name: 'defer', value: true }
      ]
    });
    expect(result).toContain('data: attributes type module');
    expect(result).toContain('data: attributes defer true');
    expect(result).not.toContain('[{"name":"type","value":"module"}]');
  });

  it('handles scripts array correctly', () => {
    const result = formatSSE('test-event', {
      scripts: [
        'console.log("test")',
        'alert("hello")'
      ]
    });
    expect(result).toContain('data: script console.log("test")');
    expect(result).toContain('data: script alert("hello")');
    expect(result).not.toContain('["console.log(\\"test\\")"]');
  });

  it('handles other arrays with JSON stringification', () => {
    const result = formatSSE('test-event', { other: [1, 2, 3] });
    expect(result).toContain('data: other [1,2,3]');
  });
});

describe('createEventFactory', () => {
  it('creates an event when all required fields are present', () => {
    const factory = createEventFactory<DummyOptions>('dummy', {
      required: ['foo'],
      format: (options) => ({
        type: 'dummy',
        ...options,
        format() { return 'ok'; }
      })
    });
    const event = factory({ foo: 'bar' });
    expect(event.type).toBe('dummy');
    expect(event.format()).toBe('ok');
  });

  it('throws if a required field is missing', () => {
    const factory = createEventFactory<DummyOptions>('dummy', {
      required: ['foo', 'bar'],
      format: (options) => ({
        type: 'dummy',
        ...options,
        format() { return 'ok'; }
      })
    });
    expect(() => factory({ foo: 'bar' })).toThrowError('Missing required field: bar');
  });
});

describe('createRepeatingEvent', () => {
  it('adds _repeating property and preserves original event', () => {
    const event = { type: 'dummy', format: () => 'ok' };
    const repeating = createRepeatingEvent(event, 5000) as any;
    expect(repeating._repeating).toBeDefined();
    expect(repeating._repeating.frequency).toBe(5000);
    expect(repeating._repeating.originalEvent).toBe(event);
    expect(repeating.type).toBe('dummy');
    expect(repeating.format()).toBe('ok');
  });
}); 