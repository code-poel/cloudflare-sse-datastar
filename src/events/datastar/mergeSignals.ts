import { MergeSignalsOptions, MergeSignalsEvent } from '../../types';
import { createEventFactory, formatSSE } from '../utils';

/**
 * Creates an event for updating client-side state.
 * The signals object will be merged with the existing client-side state.
 * 
 * @example
 * // Update multiple signals
 * mergeSignals({
 *   signals: {
 *     foo: 'bar',
 *     nested: {
 *       baz: 'qux'
 *     }
 *   }
 * });
 * 
 * @example
 * // Only update if signals don't exist
 * mergeSignals({
 *   signals: {
 *     foo: 'bar'
 *   },
 *   onlyIfMissing: true
 * });
 * 
 * @example
 * // With retry configuration
 * mergeSignals({
 *   signals: { foo: 'bar' },
 *   retry: 5000  // Will retry connection after 5 seconds if disconnected
 * });
 * 
 * @param options - Configuration for the merge signals event
 * @param options.signals - The state object to merge with client-side state
 * @param options.onlyIfMissing - Only update signals that don't already exist
 * @param options.retry - Number of milliseconds to wait before retrying connection if disconnected. If null or undefined, no retry will be attempted.
 * @returns A merge signals event
 */
export default createEventFactory<MergeSignalsOptions>(
  'datastar-merge-signals',
  {
    required: ['signals'],
    format: (options) => ({
      type: 'datastar-merge-signals',
      ...options,
      format() {
        // Evaluate any function values in the signals object
        const evaluatedSignals = Object.entries(this.signals).reduce((acc, [key, value]) => {
          acc[key] = typeof value === 'function' ? value() : value;
          return acc;
        }, {} as Record<string, any>);

        return formatSSE(this.type, {
          signals: JSON.stringify(evaluatedSignals),
          onlyIfMissing: this.onlyIfMissing,
          retry: this.retry
        });
      }
    })
  }
);