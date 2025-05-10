import { describe, it, expect } from 'vitest';
import mergeSignals from '../src/events/datastar/mergeSignals';
import repeatingEvent from '../src/events/recurring';

describe('mergeSignals', () => {
  it('creates a basic merge signals event', () => {
    const event = mergeSignals({
      signals: {
        foo: 'bar',
        nested: {
          baz: 42
        }
      }
    });

    expect(event.type).toBe('datastar-merge-signals');
    expect(event.format()).toContain('event: datastar-merge-signals');
    expect(event.format()).toContain('data: signals {"foo":"bar","nested":{"baz":42}}');
  });

  it('handles dynamic signals', async () => {
    const event = mergeSignals({
      signals: {
        timestamp: () => new Date().toLocaleTimeString()
      }
    });

    // Get the first signal value
    const firstFormat = event.format();
    const firstMatch = firstFormat.match(/data: signals (.*)/);

    // Wait a bit to ensure time changes
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get the second signal value after waiting
    const secondFormat = event.format();
    const secondMatch = secondFormat.match(/data: signals (.*)/);

    expect(firstMatch).toBeTruthy();
    expect(secondMatch).toBeTruthy();

    const firstSignals = JSON.parse(firstMatch![1]);
    const secondSignals = JSON.parse(secondMatch![1]);

    expect(firstSignals.timestamp).not.toBe(secondSignals.timestamp);
    expect(firstFormat).toContain('event: datastar-merge-signals');
  });

  it('includes optional onlyIfMissing flag', () => {
    const event = mergeSignals({
      signals: { foo: 'bar' },
      onlyIfMissing: true
    });

    expect(event.format()).toContain('data: onlyIfMissing true');
  });

  it('handles retry field correctly', () => {
    // Test with retry specified
    const eventWithRetry = mergeSignals({
      signals: { foo: 'bar' },
      retry: 5000
    });

    expect(eventWithRetry.format()).toContain('retry: 5000');

    // Test without retry specified
    const eventWithoutRetry = mergeSignals({
      signals: { foo: 'bar' }
    });

    expect(eventWithoutRetry.format()).not.toContain('retry:');

    // Test with retry explicitly set to null
    const eventWithNullRetry = mergeSignals({
      signals: { foo: 'bar' },
      retry: null
    });

    expect(eventWithNullRetry.format()).not.toContain('retry:');
  });

  it('works with repeating events', () => {
    const event = mergeSignals({
      signals: {
        timestamp: () => new Date().toLocaleTimeString()
      }
    });

    const repeating = repeatingEvent(event, 1000);
    expect(repeating._repeating).toBeDefined();
    expect(repeating._repeating?.frequency).toBe(1000);
    expect(repeating._repeating?.originalEvent).toBe(event);
  });
}); 