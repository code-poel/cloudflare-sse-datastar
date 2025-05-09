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
      signals: () => ({
        timestamp: new Date().toLocaleTimeString()
      })
    });

    // Get the first signal value immediately
    const firstSignal = typeof event.signals === 'function' ? event.signals() : event.signals;
    const firstFormat = event.format();

    // Wait a bit to ensure time changes
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get the second signal value after waiting
    const secondSignal = typeof event.signals === 'function' ? event.signals() : event.signals;
    const secondFormat = event.format();

    // Extract the actual timestamp values from the formatted strings
    const firstMatch = firstFormat.match(/data: signals (.*)\n/);
    const secondMatch = secondFormat.match(/data: signals (.*)\n/);

    expect(firstMatch).toBeTruthy();
    expect(secondMatch).toBeTruthy();

    expect(firstSignal.timestamp).not.toBe(secondSignal.timestamp);
    expect(firstFormat).toContain('event: datastar-merge-signals');
  });

  it('includes optional onlyIfMissing flag', () => {
    const event = mergeSignals({
      signals: { foo: 'bar' },
      onlyIfMissing: true
    });

    expect(event.format()).toContain('data: onlyIfMissing true');
  });

  it('works with repeating events', () => {
    const event = mergeSignals({
      signals: () => ({
        timestamp: new Date().toLocaleTimeString()
      })
    });

    const repeating = repeatingEvent(event, 1000);
    expect(repeating._repeating).toBeDefined();
    expect(repeating._repeating?.frequency).toBe(1000);
    expect(repeating._repeating?.originalEvent).toBe(event);
  });
}); 