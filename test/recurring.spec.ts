import { describe, it, expect } from 'vitest';
import repeatingEvent from '../src/events/recurring';
import mergeFragments from '../src/events/datastar/mergeFragments';

describe('repeatingEvent', () => {
  it('creates a repeating event with correct frequency', () => {
    const event = mergeFragments({
      fragment: '<div>Test</div>',
      selector: '#target'
    });

    const repeating = repeatingEvent(event, 1000);
    expect(repeating._repeating).toBeDefined();
    expect(repeating._repeating?.frequency).toBe(1000);
    expect(repeating._repeating?.originalEvent).toBe(event);
  });

  it('preserves the original event type', () => {
    const event = mergeFragments({
      fragment: '<div>Test</div>',
      selector: '#target'
    });

    const repeating = repeatingEvent(event, 1000);
    expect(repeating.type).toBe(event.type);
  });

  it('preserves the original event format', () => {
    const event = mergeFragments({
      fragment: '<div>Test</div>',
      selector: '#target'
    });

    const repeating = repeatingEvent(event, 1000);
    expect(repeating.format()).toBe(event.format());
  });

  it('handles different frequencies', () => {
    const event = mergeFragments({
      fragment: '<div>Test</div>',
      selector: '#target'
    });

    const repeating = repeatingEvent(event, 5000);
    expect(repeating._repeating?.frequency).toBe(5000);
  });

  it('can be chained with multiple repeating events', () => {
    const event = mergeFragments({
      fragment: '<div>Test</div>',
      selector: '#target'
    });

    const repeating1 = repeatingEvent(event, 1000);
    const repeating2 = repeatingEvent(repeating1, 2000);

    expect(repeating2._repeating?.frequency).toBe(2000);
    expect(repeating2._repeating?.originalEvent).toBe(repeating1);
  });
}); 