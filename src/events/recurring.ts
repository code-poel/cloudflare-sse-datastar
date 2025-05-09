import { Event } from '../types';

export default function repeatingEvent(event: Event, frequency: number): Event {
  return {
    type: event.type,
    format() {
      return event.format();
    },
    // Add a property to indicate this is a repeating event
    _repeating: {
      frequency,
      originalEvent: event
    }
  };
} 