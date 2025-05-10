import { describe, it, expect } from 'vitest';
import mergeFragments from '../src/events/datastar/mergeFragments';
import repeatingEvent from '../src/events/recurring';

describe('mergeFragments', () => {
  it('creates a basic merge fragments event', () => {
    const event = mergeFragments({
      fragment: '<div>Test</div>',
      selector: '#target'
    });

    expect(event.type).toBe('datastar-merge-fragments');
    expect(event.selector).toBe('#target');
    expect(event.format()).toContain('event: datastar-merge-fragments');
    expect(event.format()).toContain('data: fragments <div>Test</div>');
    expect(event.format()).toContain('data: selector #target');
  });

  it('handles dynamic fragments', async () => {
    const event = mergeFragments({
      fragment: () => `<div>${new Date().toLocaleTimeString()}</div>`,
      selector: '#clock'
    });

    const firstFormat = event.format();
    await new Promise(resolve => setTimeout(resolve, 1000));
    const secondFormat = event.format();

    // Extract the actual time values from the formatted strings
    const firstTime = firstFormat.match(/<div>(.*?)<\/div>/)?.[1];
    const secondTime = secondFormat.match(/<div>(.*?)<\/div>/)?.[1];

    expect(firstTime).not.toBe(secondTime);
    expect(firstFormat).toContain('event: datastar-merge-fragments');
    expect(firstFormat).toContain('data: selector #clock');
  });

  it('includes optional mergeMode', () => {
    const event = mergeFragments({
      fragment: '<div>Test</div>',
      selector: '#target',
      mergeMode: 'morph'
    });

    expect(event.format()).toContain('data: mergeMode morph');
  });

  it('includes optional useViewTransition', () => {
    const event = mergeFragments({
      fragment: '<div>Test</div>',
      selector: '#target',
      useViewTransition: true
    });

    expect(event.format()).toContain('data: useViewTransition true');
  });

  it('handles retry field correctly', () => {
    // Test with retry specified
    const eventWithRetry = mergeFragments({
      fragment: '<div>Test</div>',
      selector: '#target',
      retry: 5000
    });

    expect(eventWithRetry.format()).toContain('retry: 5000');

    // Test without retry specified
    const eventWithoutRetry = mergeFragments({
      fragment: '<div>Test</div>',
      selector: '#target'
    });

    expect(eventWithoutRetry.format()).not.toContain('retry:');

    // Test with retry explicitly set to null
    const eventWithNullRetry = mergeFragments({
      fragment: '<div>Test</div>',
      selector: '#target',
      retry: null
    });

    expect(eventWithNullRetry.format()).not.toContain('retry:');
  });

  it('works with repeating events', () => {
    const event = mergeFragments({
      fragment: () => `<div>${new Date().toLocaleTimeString()}</div>`,
      selector: '#clock'
    });

    const repeating = repeatingEvent(event, 1000);
    expect(repeating._repeating).toBeDefined();
    expect(repeating._repeating?.frequency).toBe(1000);
    expect(repeating._repeating?.originalEvent).toBe(event);
  });
}); 