import { describe, it, expect } from 'vitest';
import removeSignals from '../src/events/datastar/removeSignals';
import repeatingEvent from '../src/events/recurring';

describe('removeSignals', () => {
  it('creates a basic remove signals event', () => {
    const event = removeSignals({
      paths: ['foo', 'nested.baz']
    });

    expect(event.type).toBe('datastar-remove-signals');
    expect(event.format()).toContain('event: datastar-remove-signals');
    expect(event.format()).toContain('data: paths foo');
    expect(event.format()).toContain('data: paths nested.baz');
  });

  it('handles single path', () => {
    const event = removeSignals({
      paths: ['foo']
    });

    expect(event.format()).toContain('data: paths foo');
  });

  it('handles nested paths', () => {
    const event = removeSignals({
      paths: ['deeply.nested.path']
    });

    expect(event.format()).toContain('data: paths deeply.nested.path');
  });

  it('handles retry field correctly', () => {
    // Test with retry specified
    const eventWithRetry = removeSignals({
      paths: ['foo'],
      retry: 5000
    });

    expect(eventWithRetry.format()).toContain('retry: 5000');

    // Test without retry specified
    const eventWithoutRetry = removeSignals({
      paths: ['foo']
    });

    expect(eventWithoutRetry.format()).not.toContain('retry:');

    // Test with retry explicitly set to null
    const eventWithNullRetry = removeSignals({
      paths: ['foo'],
      retry: null
    });

    expect(eventWithNullRetry.format()).not.toContain('retry:');
  });

  it('works with repeating events', () => {
    const event = removeSignals({
      paths: ['foo']
    });

    const repeating = repeatingEvent(event, 1000);
    expect(repeating._repeating).toBeDefined();
    expect(repeating._repeating?.frequency).toBe(1000);
    expect(repeating._repeating?.originalEvent).toBe(event);
  });
}); 