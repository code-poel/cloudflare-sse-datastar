import { describe, it, expect } from 'vitest';
import removeFragments from '../src/events/datastar/removeFragments';
import repeatingEvent from '../src/events/recurring';

describe('removeFragments', () => {
  it('creates a basic remove fragments event', () => {
    const event = removeFragments({
      selector: '#target'
    });

    expect(event.type).toBe('datastar-remove-fragments');
    expect(event.format()).toContain('event: datastar-remove-fragments');
    expect(event.format()).toContain('data: selector #target');
  });

  it('handles multiple selectors', () => {
    const event = removeFragments({
      selector: '#target, .item'
    });

    expect(event.format()).toContain('data: selector #target, .item');
  });

  it('works with repeating events', () => {
    const event = removeFragments({
      selector: '#target'
    });

    const repeating = repeatingEvent(event, 1000);
    expect(repeating._repeating).toBeDefined();
    expect(repeating._repeating?.frequency).toBe(1000);
    expect(repeating._repeating?.originalEvent).toBe(event);
  });
}); 