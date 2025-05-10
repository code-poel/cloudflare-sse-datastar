import { BaseEvent } from '../types';
import { createRepeatingEvent } from './utils';

/**
 * Creates a repeating event that will be emitted at the specified frequency.
 * The event will be re-evaluated each time it is emitted.
 * 
 * @example
 * // Create a repeating event that updates every second
 * const event = repeatingEvent(
 *   mergeSignals({ signals: { time: new Date().toISOString() } }),
 *   1000
 * );
 * 
 * @param event - The event to repeat
 * @param frequency - Frequency in milliseconds between repeats
 * @returns A repeating event
 */
export default function repeatingEvent<T extends BaseEvent<string>>(
  event: T,
  frequency: number
): T {
  return createRepeatingEvent(event, frequency);
} 