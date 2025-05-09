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
 * @param options - Configuration for the merge signals event
 * @param options.signals - The state object to merge with client-side state
 * @param options.onlyIfMissing - Only update signals that don't already exist
 * @returns A merge signals event
 */
export default function mergeSignals({ 
  signals, 
  onlyIfMissing = null 
}: Omit<DatastarMergeSignalsEvent, 'type' | 'format'>): DatastarMergeSignalsEvent {
  return {
    type: 'datastar-merge-signals',
    signals,
    onlyIfMissing,
    format() {
      const options = [
        this.onlyIfMissing && 'data: onlyIfMissing true'
      ].filter(Boolean);

      return [
        'event: datastar-merge-signals',
        'data: signals ' + JSON.stringify(this.signals),
        ...options
      ].join('\n') + '\n\n';
    }
  };
}