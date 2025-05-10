import { DatastarMergeSignalsEvent } from '../../types';

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
export default function mergeSignals({ 
  signals, 
  onlyIfMissing = null,
  retry = null
}: Omit<DatastarMergeSignalsEvent, 'type' | 'format'>): DatastarMergeSignalsEvent {
  return {
    type: 'datastar-merge-signals',
    signals,
    onlyIfMissing,
    retry,
    format() {
      const options = [
        (this.onlyIfMissing === null || this.onlyIfMissing === undefined) ? null : 'data: onlyIfMissing true',
        (this.retry === null || this.retry === undefined) ? null : `retry: ${this.retry}`
      ].filter(Boolean);

      return [
        'event: datastar-merge-signals',
        'data: signals ' + JSON.stringify(this.signals),
        ...options
      ].join('\n') + '\n\n';
    }
  };
}